# Script create-app

Génère une **nouvelle application** à partir du StartkitV1 en précisant si l’app aura un **portail** (front office), un **back-office**, ou les deux.

## Usage

### Mode interactif

Depuis la racine de StartkitV1 :

```bash
npm run create-app:interactive
# ou
node scripts/create-app.js
```

Le script demande :
- le **nom du projet** (ex. `mon-app`) ;
- **Inclure le portail (front office) ?** O/n ;
- **Inclure le back-office ?** O/n.

### Ligne de commande

```bash
# Portail + back-office (par défaut)
node scripts/create-app.js --name mon-app

# Portail uniquement
node scripts/create-app.js --name mon-app --portail-only

# Back-office uniquement
node scripts/create-app.js --name mon-app --back-office-only

# Dossier de sortie personnalisé (par défaut : au-dessus de startkitv1)
node scripts/create-app.js --name mon-app --out-dir ../mes-projets
```

### Options

| Option | Description |
|--------|-------------|
| `--name`, `-n` | Nom du projet (obligatoire en mode CLI) |
| `--out-dir`, `-o` | Dossier dans lequel créer le projet (défaut : `..`) |
| `--portail-only` | Uniquement portail (layout main-portal, route /accueil) |
| `--back-office-only` | Uniquement back-office (layout main-layout, route /admin) |
| `--portail` | Inclure le portail (cumulable avec back-office) |
| `--back-office` | Inclure le back-office |
| `--no-portail` | Exclure le portail |
| `--no-back-office` | Exclure le back-office |
| `--interactive`, `-i` | Mode interactif |

## Comportement

- Copie tout StartkitV1 vers `<out-dir>/<nom>` (ex. `../mon-app`), en excluant `node_modules`, `dist`, `.git`.
- Remplace le nom dans `package.json`, `index.html`, `angular.json`.
- Adapte `app.routes.ts` selon les options (portail, back-office, ou les deux).
- Si **portail uniquement** : supprime la feature `admin` et le layout `main-layout`.
- Si **back-office uniquement** : supprime la feature `accueil` et le layout `main-portal`.
- Met à jour le guard `guestGuard` pour rediriger vers la page d’accueil adaptée (accueil ou admin).
- Crée un fichier `PROJECT.md` dans le projet généré.

Ensuite : `cd <nom> && npm install && npm start`.
