# Documentation — StartkitV1

Documentation du projet **StartkitV1** : structure, architecture, utilisation et script de génération d’applications.

---

## 1. Présentation

StartkitV1 est un **squelette Angular** réutilisable qui fournit :

- Une **architecture** en trois couches : `core`, `shared`, `features`.
- Des **layouts** prêts à l’emploi : `main-guest` (auth), `main-layout` (back office), `main-portal` (portail, utilisé uniquement par le script de génération).
- Une **page de connexion** et des services d’auth (sans protection des routes par défaut : toutes les pages sont accessibles sans connexion).
- Un **script** pour créer une nouvelle application à partir du Startkit en choisissant portail et/ou back-office.

Le Startkit est pensé pour ne pas bloquer l’accès au front : **aucun guard n’est appliqué** sur les routes ; vous pouvez activer l’auth plus tard en réintroduisant les guards.

---

## 2. Architecture

### 2.1 Règles de découpage

| Dossier      | Rôle |
|-------------|------|
| **core/**   | Services globaux (auth, API, notification), guards, interceptors HTTP, constantes. Pas de logique métier spécifique. |
| **shared/** | Composants réutilisables et sans métier : layouts (main-guest, main-layout, main-portal), pipes (ex. `date-fr`). |
| **features/** | Modules métier, un par domaine : `auth` (login), `admin` (back office), `accueil` (portail, présent pour le script create-app). Chaque feature a un `routes.ts` et des composants. |

### 2.2 Layouts

- **main-guest** : enveloppe les pages d’authentification (ex. `/auth` — formulaire de connexion).
- **main-layout** : enveloppe le back office (sidebar + zone de contenu), utilisé pour `/admin`.
- **main-portal** : enveloppe le portail (front office) ; présent dans le code mais **non utilisé** dans les routes par défaut du Startkit. Utilisé lorsque l’on génère une app avec l’option portail via le script.

### 2.3 Arborescence type

```
src/app/
├── core/
│   ├── constants/     # Messages d’erreur, etc.
│   ├── guards/        # auth.guard, guest.guard (non utilisés par défaut)
│   ├── interceptors/  # auth (token), error-notification
│   └── services/      # auth, api, notification
├── shared/
│   ├── components/    # main-guest, main-layout, main-portal
│   └── pipes/         # date-fr
├── features/
│   ├── auth/          # Login (main-guest)
│   ├── admin/         # Back office (main-layout)
│   └── accueil/       # Portail (main-portal), pour create-app
├── app.routes.ts
├── app.config.ts
└── app.component.ts
```

---

## 3. Routes (comportement par défaut)

Aucun **guard** n’est appliqué : toutes les URLs sont accessibles sans connexion.

| Route   | Layout       | Contenu |
|--------|--------------|--------|
| `/`    | —            | Redirection vers `/admin` |
| `/auth`| main-guest   | Page de connexion (login) |
| `/admin` | main-layout | Back office (tableau de bord, etc.) |
| `**`   | —            | Redirection vers `/admin` |

Pour protéger des routes (ex. `/admin` réservé aux utilisateurs connectés), il suffit d’ajouter `canActivate: [authGuard]` sur les routes concernées et d’importer `authGuard` depuis `core/guards/auth.guard`.

---

## 4. Authentification

- **AuthService** : login, logout, token, `isLoggedIn`, `currentUser`. Stockage du token en `localStorage`.
- **auth.interceptor** : ajoute le header `Authorization: Bearer <token>` aux requêtes HTTP (sauf vers `/auth/`).
- **error-notification.interceptor** : en cas d’erreur 401, affiche un message et appelle `auth.logout()` (redirection vers `/auth`).
- **Guards** : `authGuard` et `guestGuard` existent dans `core/guards/` mais ne sont **pas** utilisés dans les routes par défaut.

La base URL de l’API est définie dans `src/environments/environment.development.ts` (`apiUrl`). En production, `environment.ts` est utilisé (remplacement configuré dans `angular.json`).

---

## 5. Démarrage et build

### Prérequis

- Node.js 20 LTS (recommandé)
- npm

### Commandes

```bash
# Installation des dépendances
npm install

# Serveur de développement (http://localhost:4200)
npm start

# Build de production
npm run build
```

Les artefacts de build sont dans `dist/startkitv1/`.

---

## 6. Créer une application à partir du Startkit

Le script **create-app** (présent uniquement dans le Startkit) permet de générer une nouvelle application en précisant le **nom** et si l’app aura un **portail** et/ou un **back-office**.

### Emplacement

- Script : `scripts/create-app.js`
- Documentation du script : `scripts/README.md`

### Utilisation

```bash
# Mode interactif (questions : nom, portail ?, back-office ?)
npm run create-app:interactive

# Ligne de commande
npm run create-app -- --name mon-app
npm run create-app -- --name mon-app --back-office-only
npm run create-app -- --name mon-app --portail-only
npm run create-app -- --name mon-app --portail --back-office
npm run create-app -- --name mon-app --out-dir ../mes-projets
```

L’application est créée dans `<out-dir>/<nom>` (par défaut au-dessus du dossier Startkit). Le dossier `scripts/` et les scripts npm `create-app` ne sont **pas** copiés dans l’app générée.

---

## 7. Environnements

- **Développement** : `src/environments/environment.development.ts` — `apiUrl`, `production: false`.
- **Production** : `src/environments/environment.ts` — utilisé en build prod via `fileReplacements` dans `angular.json`.

Adapter `apiUrl` selon votre backend.

---

## 8. Thème et styles

Les variables CSS globales sont dans `src/styles.css` (ex. `--app-primary`, `--app-surface`, `--app-bg`, `--app-text`). Vous pouvez les surcharger pour adapter la charte graphique sans modifier le core.

---

## 9. Ajouter une feature

1. Créer un dossier sous `src/app/features/<nom-feature>/` (ex. `features/mes-pages/`).
2. Y ajouter un `routes.ts` qui exporte des `Routes` (ex. `MES_PAGES_ROUTES`).
3. Créer les composants dans `features/<nom-feature>/components/`.
4. Dans `app.routes.ts`, ajouter une route avec `loadChildren` vers ce `routes.ts`, et l’associer au layout souhaité (main-layout pour le back office, main-portal pour le portail si vous l’utilisez).

Convention : nom de feature en **kebab-case**, export de routes en `XXX_ROUTES`.

---

## 10. Composants dynamiques : tableau & formulaire

- **Tableau générique** : `DataTableComponent` (`shared/components/data-table/`) lit un `TableConfig` défini dans `shared/models/table.model.ts`.  
  - Pour chaque feature, vous pouvez créer un fichier `config/<feature>-table.config.ts` qui exporte un `TableConfig` (colonnes + actions).  
  - Exemple : `ADMIN_TABLE_CONFIG` pour la feature `admin`.

- **Formulaire dynamique** : `DynamicFormComponent` (`shared/components/dynamic-form/`) lit une liste de `FieldConfig` définis dans `shared/models/form-field.model.ts`.  
  - Pour chaque feature, vous pouvez créer un fichier `config/<feature>-form.config.ts` qui exporte un tableau de `FieldConfig`.  
  - Exemple : `ADMIN_FORM_FIELDS` pour la feature `admin`.

- **Script `create-app`** : lors de la génération d’une nouvelle app, il crée automatiquement des squelettes de :
  - `config/<feature>-table.config.ts` (sauf pour `auth`),
  - `config/<feature>-form.config.ts` (pour toutes les features présentes),
  pour que vous puissiez simplement les éditer (labels, types, colonnes) sans toucher aux composants.

Pour plus de détails sur la configuration des champs et des tableaux, voir `CONFIG-FIELDS-TABLES.md`.

---

## 11. Références

- **Guide d’architecture** (workspace parent) : `GUIDE-STARTKIT-ANGULAR-PORTAL-BACKOFFICE.md`
- **Script create-app** : `scripts/README.md`

---

## 12. Démarrage rapide (Getting started)

### 12.1 Cloner et installer

```bash
# Cloner le Startkit
git clone <url-du-repo> startkitv1
cd startkitv1

# Installer les dépendances
npm install
```

### 12.2 Lancer le Startkit

```bash
# Dev server Angular (http://localhost:4200)
npm start
```

Par défaut, vous serez redirigé vers `/admin`. La route `/auth` reste accessible sans authentification tant que les guards ne sont pas activés.

### 12.3 Générer une nouvelle application

```bash
# Mode interactif
npm run create-app:interactive

# Exemple : portail + back-office
npm run create-app -- --name mon-app --portail --back-office
```

L’application générée est indépendante du Startkit et ne contient plus le dossier `scripts/`.

---

## 13. Activer la protection des routes (guards)

Par défaut, **aucune route n’est protégée**. Pour sécuriser le back office (`/admin`) :

1. Vérifier que `authGuard` est bien exporté depuis `core/guards/auth.guard.ts`.
2. Dans `app.routes.ts`, ajouter le guard sur la route `admin`.

Exemple (simplifié) :

```ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const APP_ROUTES: Routes = [
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/admin/routes').then((m) => m.ADMIN_ROUTES),
  },
  // ...
];
```

Une fois le guard activé, toute navigation vers `/admin` sans être connecté doit rediriger vers `/auth` (comportement implémenté dans vos guards/services).

---

## 14. Exemple complet de feature avec tableau & formulaire

Cette section illustre comment utiliser `DataTableComponent` et `DynamicFormComponent` pour une feature fictive `produits`.

### 14.1 Structure de la feature

```text
src/app/features/produits/
├── components/
│   ├── produits-page/
│   │   ├── produits-page.component.ts
│   │   ├── produits-page.component.html
│   │   └── produits-page.component.css
├── config/
│   ├── produits-table.config.ts
│   └── produits-form.config.ts
└── routes.ts
```

### 14.2 Routes de la feature

```ts
// src/app/features/produits/routes.ts
import { Routes } from '@angular/router';
import { ProduitsPageComponent } from './components/produits-page/produits-page.component';

export const PRODUITS_ROUTES: Routes = [
  {
    path: '',
    component: ProduitsPageComponent,
  },
];
```

Dans `app.routes.ts` :

```ts
import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: 'produits',
    loadChildren: () =>
      import('./features/produits/routes').then((m) => m.PRODUITS_ROUTES),
  },
  // ...
];
```

Associez ensuite le layout souhaité (`main-layout` ou `main-portal`) suivant la convention du projet.

### 14.3 Configuration du tableau

```ts
// src/app/features/produits/config/produits-table.config.ts
import { TableConfig } from 'src/app/shared/models/table.model';

export const PRODUITS_TABLE_CONFIG: TableConfig = {
  title: 'Liste des produits',
  columns: [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Nom', sortable: true },
    { key: 'price', label: 'Prix', sortable: true, type: 'currency' },
  ],
  actions: [
    { type: 'edit', label: 'Modifier' },
    { type: 'delete', label: 'Supprimer', confirm: true },
  ],
};
```

La structure exacte des propriétés (`type`, `actions`, etc.) dépend de `TableConfig` dans `shared/models/table.model.ts`.

### 14.4 Configuration du formulaire

```ts
// src/app/features/produits/config/produits-form.config.ts
import { FieldConfig } from 'src/app/shared/models/form-field.model';

export const PRODUITS_FORM_FIELDS: FieldConfig[] = [
  {
    name: 'name',
    label: 'Nom du produit',
    type: 'text',
    validators: [{ name: 'required', message: 'Le nom est obligatoire' }],
  },
  {
    name: 'price',
    label: 'Prix',
    type: 'number',
    validators: [{ name: 'required', message: 'Le prix est obligatoire' }],
  },
];
```

`DynamicFormComponent` consomme ces champs pour générer automatiquement le formulaire (labels, types de champs, messages d’erreur).

---

## 15. FAQ (questions fréquentes)

**Q : Pourquoi toutes les pages sont accessibles sans connexion ?**  
R : Le Startkit est livré sans guards activés pour simplifier le démarrage. Il faut activer manuellement `authGuard` (voir section 13).

**Q : Où configurer l’URL de mon API ?**  
R : Dans `src/environments/environment*.ts` via la propriété `apiUrl` (voir section 7).

**Q : Comment changer les couleurs globales de l’application ?**  
R : En surchargeant les variables CSS définies dans `src/styles.css` (`--app-primary`, `--app-bg`, etc., voir section 8).

**Q : Puis-je supprimer la feature `accueil` si je ne fais pas de portail ?**  
R : Oui, à condition d’ajuster les routes et de supprimer les imports associés. Si vous générez une nouvelle app avec `--back-office-only`, le script fera déjà ce nettoyage.
