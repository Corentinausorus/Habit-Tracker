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
| Frontend | Vue 3 (pas encore commencé) |
| Validation | Zod (en cours d'ajout) |
| Auth | JWT via @fastify/jwt |
| Hashage | bcryptjs (pas bcrypt — problèmes de compilation native sur certains PC) |
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
│   │   ├── types/
│   │   │   └── fastify.d.ts     ← déclaration du décorateur authenticate
│   │   └── server.ts            ← point d'entrée Fastify
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

- **Routes** : gèrent la requête HTTP, extraient body/params, appellent le service, renvoient la réponse
- **Services** : contiennent la logique métier (vérifications, règles)
- **Repositories** : accès à la base uniquement, aucune logique métier
- **Drizzle** : remplace la couche Repository "brute" — génère le SQL depuis le schéma TypeScript

Équivalences Spring Boot / Symfony :
- `schema.ts` = entités JPA / Entity Doctrine
- `repositories/` = Repository Spring Data / Repository Doctrine
- `services/` = Service Spring / Service Symfony
- `routes/` = Controller Spring / Controller Symfony
- Drizzle = EntityManager / DBAL

---

## Points techniques importants

- `"type": "module"` dans package.json → syntaxe import/export ESM
- Les imports de fichiers locaux utilisent `.js` même pour des fichiers `.ts` (convention TypeScript ESM)
- `tsx` permet de lancer TypeScript directement sans compilation manuelle
- `drizzle-kit push` lit `schema.ts` et crée/met à jour les tables en base
- Le décorateur `authenticate` est déclaré dans `types/fastify.d.ts` pour que TypeScript le reconnaisse sur `FastifyInstance`
- `bcryptjs` au lieu de `bcrypt` pour éviter les problèmes de compilation native sur Windows (notamment sur réseaux d'entreprise avec proxy SSL)

---

## Configuration locale

- Docker Desktop requis pour PostgreSQL en local
- PostgreSQL tourne sur le port `5432` (attention aux conflits si PostgreSQL est installé nativement)
- `.env` à créer manuellement sur chaque nouveau PC (non commité) :

```env
DATABASE_URL=postgresql://habit_user:habit_password@localhost:5432/habit_tracker
JWT_SECRET=une_chaine_aleatoire_longue
PORT=3000
FRONTEND_URL=http://localhost:5173
```

- Commandes utiles :
  - `docker compose up -d` (depuis la racine) → démarre PostgreSQL
  - `npm run dev` (depuis backend/) → démarre le serveur
  - `npm run db:push` (depuis backend/) → applique le schéma en base

---

## Repo Git
https://github.com/Corentinausorus/Habit-Tracker