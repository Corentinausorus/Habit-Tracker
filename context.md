# Contexte du projet - Habit Tracker

## Objectif pédagogique

Corentin est étudiant en ingénierie informatique. Il connaît Java avec Spring Boot et PHP avec Symfony, et découvre Node.js, TypeScript, Fastify et Drizzle ORM.

L'objectif principal du projet est d'apprendre et de comprendre, pas seulement de produire du code. Les décisions techniques doivent donc être expliquées, avec des parallèles vers Spring Boot ou Symfony lorsque cela aide.

Préférences :

- réponses concises et directes ;
- explication du rôle de chaque couche ;
- réponse aux questions conceptuelles avant d'avancer ;
- ne pas demander de répéter un contexte déjà documenté.

## Description du projet

Habit Tracker est une application web de suivi d'habitudes quotidiennes destinée à remplacer un Google Sheets contenant environ 27 habitudes suivies depuis mi-2024.

Fonctionnalités prévues :

- validation quotidienne d'habitudes ;
- habitudes simples ou associées à plusieurs choix ;
- notes sur les validations ;
- historique et statistiques ;
- calcul de séries de jours consécutifs ;
- sessions sportives ;
- système d'XP et de gamification.

## État actuel

Le backend est implémenté et ses routes ont été testées manuellement avec Postman.

Il n'existe pas encore de tests automatisés. Le frontend Vue 3 est initialisé avec une page de connexion, une session Pinia persistée dans `localStorage` et une page d'accueil protégée. Le déploiement sur le homelab est un objectif futur, mais il n'est pas encore configuré.

## Stack technique

| Couche | Technologie |
|---|---|
| Backend | Node.js, Fastify et TypeScript |
| ORM | Drizzle ORM |
| Base de données | PostgreSQL 16 avec Docker |
| Validation | Zod v4 |
| Authentification | JWT avec `@fastify/jwt` |
| Hashage | `bcrypt` actuellement |
| Frontend | Vue 3, TypeScript, Vite, Vue Router et Pinia |
| Styles | Tailwind CSS 4 |
| Conteneurisation | Docker Compose pour PostgreSQL |

### Écart connu concernant bcrypt

Le choix initial documenté était `bcryptjs`, afin d'éviter les problèmes de compilation native sur certains PC Windows. Le code et le `package.json` utilisent actuellement `bcrypt`.

Cette incohérence est conservée pour le moment : la documentation décrit le code réel. Une migration vers `bcryptjs` pourra être faite séparément.

## Structure actuelle

```text
Habit-Tracker/
|-- backend/
|   |-- src/
|   |   |-- db/
|   |   |   |-- schema.ts
|   |   |   `-- client.ts
|   |   |-- repositories/
|   |   |-- routes/
|   |   |-- schemas/
|   |   |-- services/
|   |   |-- types/
|   |   `-- server.ts
|   |-- drizzle.config.ts
|   |-- package.json
|   `-- tsconfig.json
|-- frontend/
|   |-- src/
|   |   |-- assets/
|   |   |-- router/
|   |   |-- services/
|   |   |-- stores/
|   |   |-- views/
|   |   |-- App.vue
|   |   `-- main.ts
|   |-- package.json
|   `-- vite.config.ts
|-- context.md
|-- docker-compose.yml
|-- progress.md
`-- README.md
```

Le frontend est une application Node.js distincte du backend. Les dépendances doivent être installées séparément dans chaque dossier.

## Architecture frontend

Le chargement suit ce flux :

```text
index.html -> main.ts -> App.vue -> RouterView -> vue active
```

- `main.ts` crée l'application Vue et installe Pinia et Vue Router ;
- `App.vue` fournit l'emplacement de rendu de la page active ;
- Vue Router associe `/login` et `/` à leurs vues et applique les gardes de navigation ;
- le store Pinia `auth` contient la session partagée ;
- `authApi.ts` isole l'appel `fetch` vers Fastify ;
- Tailwind fournit les classes utilitaires utilisées dans les templates.

La session est persistée dans `localStorage`. Cela simplifie l'apprentissage et permet de rester connecté après actualisation, mais le JWT serait accessible à du JavaScript injecté par une faille XSS.

## Architecture backend

Le backend suit le flux :

```text
Route -> Service -> Repository -> Drizzle -> PostgreSQL
```

- **Routes** : gèrent HTTP, lisent les paramètres, valident le body avec Zod, appellent les services et construisent les réponses.
- **Schemas** : décrivent et valident les données externes avec Zod.
- **Services** : contiennent les règles métier et les vérifications d'autorisation.
- **Repositories** : exécutent uniquement les opérations de base de données.
- **Drizzle** : construit les requêtes SQL à partir du schéma TypeScript.

Équivalences avec Spring Boot et Symfony :

| Habit Tracker | Spring Boot | Symfony |
|---|---|---|
| Route Fastify | Controller | Controller |
| Schéma Zod | DTO et Bean Validation | DTO et Validator |
| Service | Service | Service |
| Repository | Spring Data Repository | Doctrine Repository |
| Schéma Drizzle | Entité JPA | Entité Doctrine |
| Drizzle | JPA / EntityManager | Doctrine ORM / DBAL |

## Schéma de base de données

```text
users
  `-- habits
      |-- choices
      `-- habit_logs
          `-- habit_log_choices
```

Tables :

```sql
users (id, email, password_hash, created_at)
habits (id, user_id, name, has_choices, created_at)
choices (id, habit_id, name)
habit_logs (id, habit_id, logged_date, note)
habit_log_choices (log_id, choice_id)
```

Principes importants :

- l'existence d'un log signifie que l'habitude a été réalisée ;
- il n'existe donc pas de colonne `completed` ;
- la contrainte unique `(habit_id, logged_date)` empêche de valider deux fois la même habitude le même jour ;
- `habit_log_choices` possède une clé primaire composite ;
- les clés étrangères utilisent `ON DELETE CASCADE` ;
- `has_choices` est conservé sur `habits` même si l'information pourrait être déduite, afin de simplifier les lectures côté frontend.

## Authentification

Après une inscription ou une connexion, le backend génère un JWT contenant :

```ts
{ userId: user.id }
```

Les routes protégées attendent ensuite :

```http
Authorization: Bearer <token>
```

Le décorateur Fastify `authenticate` appelle `request.jwtVerify()`. Sa déclaration TypeScript se trouve dans `src/types/fastify.d.ts`, car TypeScript ne peut pas déduire automatiquement les propriétés ajoutées avec `app.decorate()`.

## Points techniques importants

- `"type": "module"` active les modules JavaScript ESM.
- Les imports locaux utilisent l'extension `.js`, même dans les fichiers `.ts`, car les fichiers exécutés après compilation sont des fichiers JavaScript.
- `tsx` lance TypeScript directement en développement.
- Zod valide les données à l'exécution, contrairement aux types TypeScript qui disparaissent après compilation.
- Avec Zod v4, le projet utilise `z.email()`, `z.uuid()` et `error.issues`.
- Le gestionnaire d'erreurs global transforme les `ZodError` en réponses HTTP `400`.
- `drizzle-kit push` lit `src/db/schema.ts` et synchronise le schéma PostgreSQL.
- Le volume Docker `habit_db_data` conserve les données lorsque le conteneur est arrêté ou recréé.

## Configuration locale

Prérequis :

- Node.js et npm ;
- Docker Desktop ou Docker Engine avec Docker Compose.

Le conteneur PostgreSQL écoute sur le port `5432`, mais Docker l'expose sur le port `5433` de la machine :

```text
localhost:5433 -> conteneur PostgreSQL:5432
```

Créer manuellement `backend/.env`, car ce fichier contient des secrets et n'est pas versionné :

```env
DATABASE_URL=postgresql://habit_user:habit_password@localhost:5433/habit_tracker
JWT_SECRET=une_chaine_aleatoire_longue
PORT=3000
FRONTEND_URL=http://localhost:5173
```

Installation et lancement :

```powershell
cd backend
npm ci
cd ..
docker compose up -d
cd backend
npm run db:push
npm run dev
```

`npm ci` doit être lancé dans `backend/`, car le `package.json` contenant les dépendances de l'application se trouve dans ce dossier.

Dans un second terminal :

```powershell
cd frontend
npm ci
npm run dev
```

Le frontend utilise `VITE_API_URL=http://localhost:3000` dans `.env.local`. Les variables préfixées par `VITE_` sont publiques dans le code navigateur et ne doivent pas contenir de secrets.

## Routes disponibles

Routes publiques :

- `POST /api/auth/register`
- `POST /api/auth/login`

Routes protégées par JWT :

- `GET /api/habits`
- `POST /api/habits`
- `DELETE /api/habits/:id`
- `GET /api/logs/:habitId`
- `POST /api/logs/:habitId`
- `DELETE /api/logs/:id`

## Limites connues

- Aucun test automatisé n'est encore présent.
- Certaines erreurs métier génériques peuvent être renvoyées avec un statut HTTP imprécis.
- La lecture et la suppression de logs ne vérifient pas encore systématiquement leur appartenance à l'utilisateur connecté.
- La création d'une habitude avec choix ne renvoie pas les choix créés.
- `bcrypt` peut poser des problèmes d'installation native sur certaines machines Windows.
- Le frontend ne contient pour le moment que l'authentification et une page d'accueil vide.
- Le déploiement de production reste à réaliser.

## Déploiement homelab prévu

L'objectif à terme est de déployer l'application sur un Asus M32 sous Ubuntu Server 24.04, avec Docker et un accès via Cloudflare Tunnel et le domaine `bidouche.fr`.

Travail restant :

- compléter le frontend Vue 3 avec l'inscription et les habitudes ;
- ajouter les Dockerfiles de production ;
- adapter Docker Compose pour l'application complète ;
- gérer les variables secrètes de production ;
- configurer le tunnel Cloudflare ;
- déployer et vérifier la persistance des données.

## Dépôt Git

https://github.com/Corentinausorus/Habit-Tracker
