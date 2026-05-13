# Contexte du projet — Habit Tracker

## Objectif pédagogique
Corentin est étudiant en ingénierie informatique. Il connaît bien Java/Spring Boot et PHP/Symfony. Il découvre Node.js, TypeScript, Fastify et Drizzle. **L'objectif principal est qu'il apprenne et comprenne**, pas juste qu'il copie-colle du code. Il faut expliquer le pourquoi de chaque décision technique, faire des parallèles avec Spring Boot / Symfony quand c'est pertinent, et répondre à toutes ses questions conceptuelles avant d'avancer.

Il préfère les réponses concises et directes, sans padding. Il n'aime pas re-expliquer le contexte — s'il manque des infos, reconnaître le gap plutôt que de demander.

---

## Description du projet
Application web de suivi d'habitudes quotidiennes pour remplacer un Google Sheets existant (~27 habitudes suivies depuis mi-2024). Fonctionnalités prévues : completions binaires, scores, streaks, sessions sport, système XP/gamification.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Backend | Node.js + Fastify + TypeScript |
| ORM | Drizzle ORM |
| Base de données | PostgreSQL 16 (Docker) |
| Validation | Zod v4 |
| Auth | JWT via @fastify/jwt |
| Hashage | bcryptjs (pas bcrypt — problèmes de compilation native sur certains PC) |
| Frontend | Vue 3 (prochaine étape) |
| Conteneurisation | Docker + Docker Compose |

---

## Structure du projet

```
habit-tracker/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts        ← description des tables Drizzle
│   │   │   └── client.ts        ← connexion PostgreSQL
│   │   ├── repositories/
│   │   │   ├── userRepository.ts
│   │   │   ├── habitRepository.ts
│   │   │   └── logRepository.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── habitService.ts
│   │   │   └── logService.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── habits.ts
│   │   │   └── logs.ts
│   │   ├── schemas/
│   │   │   ├── auth.schema.ts   ← validation Zod register/login
│   │   │   ├── habit.schema.ts  ← validation Zod création habitude
│   │   │   └── log.schema.ts    ← validation Zod création log
│   │   ├── types/
│   │   │   └── fastify.d.ts     ← déclaration du décorateur authenticate
│   │   └── server.ts            ← point d'entrée Fastify + error handler Zod
│   ├── drizzle.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── .env                     ← jamais commité
├── frontend/                    ← pas encore commencé
└── docker-compose.yml
```

---

## Schéma de base de données

```sql
users (id, email, password_hash, created_at)
habits (id, user_id, name, has_choices, created_at)
choices (id, habit_id, name)
habit_logs (id, habit_id, logged_date, note) -- UNIQUE(habit_id, logged_date)
habit_log_choices (log_id, choice_id) -- PK composite
```

Principe clé : l'existence d'un log implique que l'habitude a été faite. Pas de colonne `completed`.

`has_choices` est gardé volontairement sur `habits` pour optimiser les requêtes front même si c'est déductible.

---

## Architecture backend

La structure suit le pattern **Route → Service → Repository → Drizzle** :

- **Routes** : gèrent la requête HTTP, valident le body avec Zod, appellent le service, renvoient la réponse
- **Schemas** : schémas Zod de validation — équivalent des DTOs Spring/Symfony
- **Services** : contiennent la logique métier (vérifications, règles)
- **Repositories** : accès à la base uniquement, aucune logique métier
- **Drizzle** : remplace la couche Repository "brute" — génère le SQL depuis le schéma TypeScript

Équivalences Spring Boot / Symfony :
- `schema.ts` = entités JPA / Entity Doctrine
- `repositories/` = Repository Spring Data / Repository Doctrine
- `services/` = Service Spring / Service Symfony
- `routes/` = Controller Spring / Controller Symfony
- `schemas/` = DTOs avec annotations de validation
- Drizzle = EntityManager / DBAL

---

## Points techniques importants

- `"type": "module"` dans package.json → syntaxe import/export ESM
- Les imports de fichiers locaux utilisent `.js` même pour des fichiers `.ts` (convention TypeScript ESM)
- `tsx` permet de lancer TypeScript directement sans compilation manuelle
- `drizzle-kit push` lit `schema.ts` et crée/met à jour les tables en base
- Le décorateur `authenticate` est déclaré dans `types/fastify.d.ts` pour que TypeScript le reconnaisse sur `FastifyInstance`
- `bcryptjs` au lieu de `bcrypt` pour éviter les problèmes de compilation native sur Windows
- Zod v4 : utiliser `z.email()` et `z.uuid()` directement, pas `z.string().email()` (déprécié)
- Zod v4 : utiliser `error.issues` pas `error.errors`
- Error handler global dans `server.ts` qui intercepte les `ZodError` et renvoie un 400 avec les détails

---

## Configuration locale

- Docker Desktop requis pour PostgreSQL en local
- PostgreSQL tourne sur le port `5432` (attention aux conflits si PostgreSQL est installé nativement — changer le port dans docker-compose.yml si nécessaire)
- `.env` à créer manuellement sur chaque nouveau PC (non commité) :

```env
DATABASE_URL=postgresql://habit_user:habit_password@localhost:5432/habit_tracker
JWT_SECRET=une_chaine_aleatoire_longue
PORT=3000
FRONTEND_URL=http://localhost:5173
```

- Commandes utiles :
  - `docker compose up -d` (depuis la racine) → démarre PostgreSQL
  - `docker compose up -d --build` → démarre en reconstruisant les images
  - `npm run dev` (depuis backend/) → démarre le serveur
  - `npm run db:push` (depuis backend/) → applique le schéma en base

---

## Postman
Collection configurée avec :
- Environnement "Habit Tracker Local" avec variables `{{baseUrl}}` et `{{token}}`
- Authorization Bearer `{{token}}` au niveau de la collection
- Script dans le endpoint login pour auto-sauvegarder le token : `pm.environment.set("token", pm.response.json().token)`

---

## Repo Git
https://github.com/Corentinausorus/Habit-Tracker