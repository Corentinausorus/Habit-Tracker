# Frontend Habit Tracker

Application Vue 3 créée avec TypeScript et Vite.

## Démarrage

```powershell
npm ci
npm run dev
```

Le frontend est alors disponible sur `http://localhost:5173`.

Le backend doit fonctionner sur l'URL indiquée dans `.env.local` :

```env
VITE_API_URL=http://localhost:3000
```

## Flux de démarrage

```text
index.html
    -> src/main.ts
    -> src/App.vue
    -> RouterView
    -> LoginView ou HomeView
```

- `index.html` contient le point de montage `#app`.
- `main.ts` crée Vue et installe Pinia et Vue Router.
- `App.vue` affiche la vue sélectionnée par le routeur.
- `router/index.ts` définit les URL et les gardes de navigation.
- `stores/auth.ts` conserve la session partagée.
- `services/authApi.ts` dialogue avec le backend.
- `assets/main.css` charge Tailwind CSS.

## Commandes

```powershell
npm run dev
npm run type-check
npm run lint
npm run format
npm run build
```

## Authentification

La page `/login` appelle `POST /api/auth/login`. Le JWT et l'utilisateur reçus sont placés dans Pinia et `localStorage`.

La route `/` nécessite une session. Vue Router redirige vers `/login` lorsque l'utilisateur n'est pas connecté.

`localStorage` rend la session persistante, mais son contenu est accessible au JavaScript exécuté dans la page. Aucun secret autre que le JWT ne doit y être stocké.
