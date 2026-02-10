#!/usr/bin/env node
/**
 * Script de création d'une application à partir du StartkitV1.
 * Usage:
 *   node scripts/create-app.js
 *   node scripts/create-app.js --name mon-app --portail --back-office
 *   node scripts/create-app.js --name mon-app --portail-only
 *   node scripts/create-app.js --name mon-app --back-office-only
 *   node scripts/create-app.js --name mon-app --out-dir ../projets
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const STARTKIT_ROOT = path.resolve(__dirname, '..');
const EXCLUDE_DIRS = new Set(['node_modules', 'dist', '.git', 'out-tsc', '.angular', 'scripts']);

function slugify(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function copyRecursive(src, dest, options = {}) {
  const { exclude = () => false, destRoot } = options;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    const name = path.basename(src);
    if (EXCLUDE_DIRS.has(name) || exclude(src)) return;
    if (destRoot && path.resolve(src) === path.resolve(destRoot)) return;
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry), options);
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [from, to] of replacements) {
    content = content.split(from).join(to);
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

function generateRoutes(config) {
  const { portail, backOffice } = config;
  const lines = [
    `import { Routes } from '@angular/router';`,
    `import { MainGuestComponent } from './shared/components/main-guest/main-guest.component';`,
    `import { authGuard } from './core/guards/auth.guard';`,
    `import { guestGuard } from './core/guards/guest.guard';`,
    ``
  ];

  const defaultRedirect = backOffice ? 'admin' : 'accueil';
  const wildcardRedirect = defaultRedirect;

  lines.push(`export const routes: Routes = [`);
  lines.push(`  { path: '', redirectTo: '${defaultRedirect}', pathMatch: 'full' },`);
  lines.push(``);
  lines.push(`  { path: 'auth', component: MainGuestComponent, canActivate: [guestGuard], loadChildren: () => import('./features/auth/routes').then((m) => m.AUTH_ROUTES) },`);
  lines.push(``);

  if (backOffice) {
    lines.push(`  { path: 'admin', component: (await import('./shared/components/main-layout/main-layout.component')).MainLayoutComponent, canActivate: [authGuard], loadChildren: () => import('./features/admin/routes').then((m) => m.ADMIN_ROUTES) },`);
    lines.push(``);
  }

  if (portail) {
    lines.push(`  { path: 'accueil', component: (await import('./shared/components/main-portal/main-portal.component')).MainPortalComponent, canActivate: [authGuard], loadChildren: () => import('./features/accueil/routes').then((m) => m.ACCUEIL_ROUTES) },`);
    lines.push(``);
  }

  lines.push(`  { path: '**', redirectTo: '${wildcardRedirect}' }`);
  lines.push(`];`);

  // Fix: use synchronous component imports (no await in routes)
  let result = lines.join('\n');
  result = result.replace(
    /component: \(await import\([^)]+\)\)\.\w+,/g,
    (match) => {
      if (match.includes('main-layout')) {
        return `component: (() => { const m = require('./shared/components/main-layout/main-layout.component'); return m.MainLayoutComponent; })(),`;
      }
      if (match.includes('main-portal')) {
        return `component: (() => { const m = require('./shared/components/main-portal/main-portal.component'); return m.MainPortalComponent; })(),`;
      }
      return match;
    }
  );
  // Angular routes need direct component reference, not require. Revert to static imports.
  return generateRoutesStatic(config);
}

function generateRoutesStatic(config) {
  const { portail, backOffice } = config;
  const imports = [
    "import { Routes } from '@angular/router';",
    "import { MainGuestComponent } from './shared/components/main-guest/main-guest.component';",
    "import { authGuard } from './core/guards/auth.guard';",
    "import { guestGuard } from './core/guards/guest.guard';"
  ];
  if (backOffice) {
    imports.push("import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';");
  }
  if (portail) {
    imports.push("import { MainPortalComponent } from './shared/components/main-portal/main-portal.component';");
  }

  const defaultRedirect = portail ? 'accueil' : 'admin';
  const routes = [
    `  { path: '', redirectTo: '${defaultRedirect}', pathMatch: 'full' },`,
    ``,
    `  { path: 'auth', component: MainGuestComponent, canActivate: [guestGuard], loadChildren: () => import('./features/auth/routes').then((m) => m.AUTH_ROUTES) },`,
    ``
  ];
  if (backOffice) {
    routes.push(`  { path: 'admin', component: MainLayoutComponent, canActivate: [authGuard], loadChildren: () => import('./features/admin/routes').then((m) => m.ADMIN_ROUTES) },`);
    routes.push(``);
  }
  if (portail) {
    routes.push(`  { path: 'accueil', component: MainPortalComponent, canActivate: [authGuard], loadChildren: () => import('./features/accueil/routes').then((m) => m.ACCUEIL_ROUTES) },`);
    routes.push(``);
  }
  routes.push(`  { path: '**', redirectTo: '${defaultRedirect}' }`);
  return imports.join('\n') + '\n\nexport const routes: Routes = [\n' + routes.join('\n') + '\n];\n';
}

function updateGuestGuardRedirect(destRoot, defaultRedirect) {
  const guestGuardPath = path.join(destRoot, 'src/app/core/guards/guest.guard.ts');
  if (fs.existsSync(guestGuardPath)) {
    let content = fs.readFileSync(guestGuardPath, 'utf8');
    content = content.replace(/createUrlTree\(\['\/[^']+'\]\)/, `createUrlTree(['/${defaultRedirect}'])`);
    fs.writeFileSync(guestGuardPath, content, 'utf8');
  }
}

function ensureFeatureConfigs(destRoot, { portail, backOffice }) {
  const features = ['auth'];
  if (backOffice) features.push('admin');
  if (portail) features.push('accueil');

  for (const feature of features) {
    const featureRoot = path.join(destRoot, 'src/app/features', feature);
    if (!fs.existsSync(featureRoot)) continue;

    const configDir = path.join(featureRoot, 'config');
    fs.mkdirSync(configDir, { recursive: true });

    const upper = feature.toUpperCase().replace(/-/g, '_');

    // Table config
    const tableConfigPath = path.join(configDir, `${feature}-table.config.ts`);
    if (!fs.existsSync(tableConfigPath) && feature !== 'auth') {
      const tableConst = `${upper}_TABLE_CONFIG`;
      const tableContent = `import { TableConfig } from '../../../shared/models/table.model';

export const ${tableConst}: TableConfig = {
  columns: [
    { id: 'id', header: 'ID', field: 'id', type: 'number', width: '60px', align: 'right' },
    { id: 'name', header: 'Nom', field: 'name', type: 'text' }
  ],
  rowActions: [
    { id: 'view', type: 'view', label: 'Voir' }
  ]
};
`;
      fs.writeFileSync(tableConfigPath, tableContent, 'utf8');
    }

    // Form config
    const formConfigPath = path.join(configDir, `${feature}-form.config.ts`);
    if (!fs.existsSync(formConfigPath)) {
      const formConst = `${upper}_FORM_FIELDS`;
      const formContent = `import { FieldConfig } from '../../../shared/models/form-field.model';

export const ${formConst}: FieldConfig[] = [
  {
    id: 'name',
    label: 'Nom',
    type: 'text',
    placeholder: 'Saisir le nom...',
    required: true
  }
];
`;
      fs.writeFileSync(formConfigPath, formContent, 'utf8');
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  const isInteractive = args.length === 0 || args.includes('--interactive') || args.includes('-i');

  let projectName = '';
  let portail = true;
  let backOffice = true;
  let outDir = path.resolve(STARTKIT_ROOT, '..');

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--name' || args[i] === '-n') {
      projectName = args[++i] || '';
    } else if (args[i] === '--out-dir' || args[i] === '-o') {
      outDir = path.resolve(process.cwd(), args[++i] || '.');
    } else if (args[i] === '--portail-only') {
      portail = true;
      backOffice = false;
    } else if (args[i] === '--back-office-only') {
      portail = false;
      backOffice = true;
    } else if (args[i] === '--portail') {
      portail = true;
    } else if (args[i] === '--back-office') {
      backOffice = true;
    } else if (args[i] === '--no-portail') {
      portail = false;
    } else if (args[i] === '--no-back-office') {
      backOffice = false;
    }
  }

  if (isInteractive) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = (q) => new Promise((res) => rl.question(q, res));

    (async () => {
      try {
        projectName = (await ask('Nom du projet (ex: mon-app) : ')).trim() || 'mon-app';
        const portailResp = (await ask('Inclure le portail (front office) ? [O/n] : ')).trim().toLowerCase();
        portail = portailResp !== 'n' && portailResp !== 'non';
        const boResp = (await ask('Inclure le back-office ? [O/n] : ')).trim().toLowerCase();
        backOffice = boResp !== 'n' && boResp !== 'non';
        if (!portail && !backOffice) {
          console.error('Choisir au moins le portail ou le back-office. Par défaut: les deux.');
          portail = true;
          backOffice = true;
        }
        rl.close();
        await run(projectName, portail, backOffice, outDir);
      } catch (e) {
        console.error(e);
        process.exit(1);
      }
    })();
    return;
  }

  if (!projectName) {
    console.error('Usage: node scripts/create-app.js --name <nom> [--portail] [--back-office] [--portail-only | --back-office-only] [--out-dir <dossier>]');
    process.exit(1);
  }

  run(projectName, portail, backOffice, outDir).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

async function run(projectName, portail, backOffice, outDir) {
  const slug = slugify(projectName) || 'app';
  const destRoot = path.join(outDir, slug);

  if (fs.existsSync(destRoot)) {
    console.error(`Le dossier existe déjà : ${destRoot}`);
    process.exit(1);
  }

  console.log(`Création de l'application "${slug}"…`);
  console.log(`  Portail (front office) : ${portail ? 'oui' : 'non'}`);
  console.log(`  Back-office : ${backOffice ? 'oui' : 'non'}`);
  console.log(`  Destination : ${destRoot}`);

  copyRecursive(STARTKIT_ROOT, destRoot, { destRoot });

  const packagePath = path.join(destRoot, 'package.json');
  const indexPath = path.join(destRoot, 'src/index.html');
  const angularPath = path.join(destRoot, 'angular.json');
  const routesPath = path.join(destRoot, 'src/app/app.routes.ts');

  replaceInFile(packagePath, [
    ['"name": "startkitv1"', `"name": "${slug}"`],
    ['"name":"startkitv1"', `"name":"${slug}"`]
  ]);
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  if (pkg.scripts) {
    delete pkg.scripts['create-app'];
    delete pkg.scripts['create-app:interactive'];
    fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2), 'utf8');
  }
  replaceInFile(indexPath, [['<title>StartkitV1</title>', `<title>${projectName}</title>`]]);
  replaceInFile(angularPath, [
    ['startkitv1', slug],
    ['dist/startkitv1', `dist/${slug}`]
  ]);

  const defaultRedirect = portail ? 'accueil' : 'admin';
  fs.writeFileSync(routesPath, generateRoutesStatic({ portail, backOffice }), 'utf8');
  updateGuestGuardRedirect(destRoot, defaultRedirect);

  // Générer des squelettes de fichiers de configuration (table + form) pour les features présentes
  ensureFeatureConfigs(destRoot, { portail, backOffice });

  if (!portail) {
    const accueilDir = path.join(destRoot, 'src/app/features/accueil');
    if (fs.existsSync(accueilDir)) {
      fs.rmSync(accueilDir, { recursive: true });
    }
    const mainPortalDir = path.join(destRoot, 'src/app/shared/components/main-portal');
    if (fs.existsSync(mainPortalDir)) {
      fs.rmSync(mainPortalDir, { recursive: true });
    }
  }

  if (!backOffice) {
    const adminDir = path.join(destRoot, 'src/app/features/admin');
    if (fs.existsSync(adminDir)) {
      fs.rmSync(adminDir, { recursive: true });
    }
    const mainLayoutDir = path.join(destRoot, 'src/app/shared/components/main-layout');
    if (fs.existsSync(mainLayoutDir)) {
      fs.rmSync(mainLayoutDir, { recursive: true });
    }
  }

  const projectMd = path.join(destRoot, 'PROJECT.md');
  const projectMdContent = `# ${projectName}

Généré à partir de StartkitV1.

- **Portail (front office)** : ${portail ? 'Oui' : 'Non'} — layout \`main-portal\`, route \`/accueil\`
- **Back-office** : ${backOffice ? 'Oui' : 'Non'} — layout \`main-layout\`, route \`/admin\`
- **Auth** : Oui — layout \`main-guest\`, route \`/auth\`

## Démarrer

\`\`\`bash
cd ${slug}
npm install
npm start
\`\`\`

Ouvrir http://localhost:4200/
`;
  fs.writeFileSync(projectMd, projectMdContent, 'utf8');

  console.log(`\nApplication créée : ${destRoot}`);
  console.log(`  cd ${slug} && npm install && npm start`);
}

main();
