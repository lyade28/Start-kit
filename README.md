# StartkitV1

Projet Angular basé sur le [Guide Startkit](../../GUIDE-STARTKIT-ANGULAR-PORTAL-BACKOFFICE.md). Le Startkit fournit **l’auth côté front** et les **routes uniquement vers le back office**.

## Architecture (Startkit par défaut)

- **main-guest** : pages d’authentification — route `/auth` (login)
- **main-layout** : back office — route `/admin`

Pas de portail (main-portal) dans le Startkit : après connexion, redirection vers `/admin`. Vous pouvez en ajouter un via le script `create-app` en choisissant l’option portail.

## Structure

- `src/app/core/` — auth (service, guards, interceptors), constantes
- `src/app/shared/` — main-guest, main-layout + pipe date-fr
- `src/app/features/` — auth (login), admin (back office)

## Démarrage

```bash
npm install
npm start
```

Ouvrir http://localhost:4200/

- **/auth** : page de connexion (main-guest)
- **/admin** : back office (main-layout), protégé par auth. Par défaut, `/` redirige vers `/admin`.

Sans backend, la connexion échouera ; vous pouvez adapter `AuthService` pour un mock ou brancher votre API (`environment.apiUrl`).

## Build

```bash
npm run build
```

Les artefacts sont dans `dist/startkitv1/`.

## Créer une nouvelle app à partir du Startkit

Un script permet de générer une application en précisant **portail** et/ou **back-office** :

```bash
# Mode interactif (demande le nom, portail ?, back-office ?)
npm run create-app:interactive

# Ligne de commande
npm run create-app -- --name mon-app --back-office-only
npm run create-app -- --name mon-app --portail --back-office
npm run create-app -- --name mon-app --portail-only
```

Voir `scripts/README.md` pour toutes les options.
