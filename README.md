# Habit Tracker

Application web pédagogique de suivi d'habitudes quotidiennes, construite pour apprendre Node.js, TypeScript, Fastify, Drizzle ORM et, prochainement, Vue 3.

Le projet vise à remplacer un Google Sheets utilisé depuis mi-2024 pour suivre environ 27 habitudes.

## État du projet

- Backend Fastify implémenté.
- Authentification JWT fonctionnelle.
- Habitudes et validations quotidiennes disponibles.
- Routes testées manuellement avec Postman.
- Aucun test automatisé pour le moment.
- Frontend Vue 3 à créer.
- Déploiement homelab prévu ultérieurement.

## Fonctionnement général

```text
Frontend Vue 3
      |
      | requêtes HTTP avec JWT
      v
API Fastify
      |
      v
Services métier
      |
      v
Repositories Drizzle
      |
      v
PostgreSQL
```

Le frontend ne communiquera jamais directement avec PostgreSQL. Il appellera l'API Fastify, qui contrôlera les données et les autorisations avant d'interroger la base.

## Stack

| Élément | Technologie |
|---|---|
| API | Node.js, Fastify, TypeScript |
| Validation | Zod v4 |
| Authentification | JWT |
| Accès aux données | Drizzle ORM |
| Base de données | PostgreSQL 16 |
| Environnement local | Docker Compose |
| Frontend prévu | Vue 3 |

Le projet utilise actuellement `bcrypt` pour les mots de passe. Le choix initial était `bcryptjs`, plus simple à installer sur Windows, mais cette migration n'a pas encore été réalisée.

## Architecture pédagogique

Le backend sépare les responsabilités :

```text
Route -> Service -> Repository -> Drizzle -> PostgreSQL
```

- **Route** : reçoit la requête HTTP, valide les données et choisit la réponse HTTP.
- **Service** : applique les règles métier, par exemple vérifier qu'une habitude appartient à l'utilisateur.
- **Repository** : lit ou modifie la base de données.
- **Drizzle** : transforme les appels TypeScript en requêtes SQL.

Pour un développeur Spring Boot :

| Ce projet | Équivalent Spring Boot |
|---|---|
| Route Fastify | Controller |
| Schéma Zod | DTO avec Bean Validation |
| Service | Service |
| Repository | Spring Data Repository |
| Schéma Drizzle | Entités JPA |
| Drizzle | JPA / EntityManager |

Zod et Bean Validation ont un objectif similaire : vérifier les données reçues pendant l'exécution. Les types TypeScript seuls ne suffisent pas, car ils n'existent plus lorsque le JavaScript s'exécute.

## Modèle de données

```text
users
  `-- habits
      |-- choices
      `-- habit_logs
          `-- habit_log_choices
```

- `users` contient les comptes.
- `habits` contient les habitudes d'un utilisateur.
- `choices` contient les options possibles d'une habitude.
- `habit_logs` représente les validations quotidiennes.
- `habit_log_choices` associe les choix sélectionnés à une validation.

Une habitude est considérée comme réalisée lorsqu'un log existe. Il n'y a donc pas de colonne `completed`.

La contrainte unique `(habit_id, logged_date)` empêche une double validation le même jour.

## Prérequis

Installer :

- Node.js avec npm ;
- Docker Desktop sous Windows, ou Docker Engine avec Docker Compose sous Linux.

Vérifier l'installation :

```powershell
node --version
npm --version
docker --version
docker compose version
```

## Installation sur un nouveau PC

Cloner le dépôt, puis installer les dépendances du backend :

```powershell
git clone https://github.com/Corentinausorus/Habit-Tracker.git
cd Habit-Tracker
cd backend
npm ci
```

Il est important d'exécuter `npm ci` dans `backend/`. Le véritable `package.json` de l'application et son `package-lock.json` se trouvent dans ce dossier. Une installation lancée uniquement à la racine n'installe pas Zod, Fastify ou Drizzle.

`npm ci` réinstalle exactement les versions enregistrées dans le lockfile. C'est la commande recommandée après un clonage.

### Variables d'environnement

Créer le fichier `backend/.env` :

```env
DATABASE_URL=postgresql://habit_user:habit_password@localhost:5433/habit_tracker
JWT_SECRET=remplacer_par_une_longue_chaine_aleatoire
PORT=3000
FRONTEND_URL=http://localhost:5173
```

Le fichier `.env` n'est pas versionné, car il peut contenir des secrets.

## Démarrage

Depuis la racine, démarrer PostgreSQL :

```powershell
docker compose up -d
```

Docker publie le port `5432` du conteneur sur le port `5433` du PC :

```text
localhost:5433 -> PostgreSQL:5432
```

Puis, depuis `backend/`, synchroniser le schéma et démarrer l'API :

```powershell
cd backend
npm run db:push
npm run dev
```

L'API écoute par défaut sur `http://localhost:3000`.

## Commandes utiles

Depuis la racine :

```powershell
docker compose up -d
docker compose down
docker compose logs db
```

Depuis `backend/` :

```powershell
npm ci
npm run dev
npm run db:push
npm run db:studio
```

- `npm run dev` démarre Fastify avec rechargement automatique.
- `npm run db:push` applique le schéma Drizzle à PostgreSQL.
- `npm run db:studio` ouvre l'interface Drizzle Studio.

## API

### Authentification publique

```text
POST /api/auth/register
POST /api/auth/login
```

Une inscription ou une connexion réussie retourne un JWT. Le token contient l'identifiant de l'utilisateur :

```ts
{ userId: user.id }
```

### Routes protégées

```text
GET    /api/habits
POST   /api/habits
DELETE /api/habits/:id

GET    /api/logs/:habitId
POST   /api/logs/:habitId
DELETE /api/logs/:id
```

Le client doit envoyer le JWT dans chaque requête protégée :

```http
Authorization: Bearer <token>
```

## Problèmes courants

### Cannot find module 'zod'

Les dépendances ne sont probablement pas installées dans le bon dossier :

```powershell
cd backend
npm ci
```

Dans VS Code, exécuter ensuite `TypeScript: Restart TS Server` depuis la palette de commandes.

Vérification :

```powershell
npm list zod
```

### La commande npm ne fonctionne pas

Vérifier :

```powershell
node --version
npm --version
```

Si Node fonctionne mais que npm est introuvable ou incomplet, réinstaller une version LTS de Node.js.

### PostgreSQL est inaccessible

Vérifier que le conteneur fonctionne :

```powershell
docker compose ps
docker compose logs db
```

La `DATABASE_URL` doit utiliser le port `5433`, pas `5432`, avec la configuration Docker actuelle.

### L'installation de bcrypt échoue sous Windows

`bcrypt` contient des composants natifs qui peuvent compliquer l'installation. Le projet prévoyait initialement `bcryptjs`, mais le remplacement doit être fait dans le code et les dépendances avant de l'utiliser.

## Prochaines étapes

1. Corriger les contrôles d'autorisation sur les logs.
2. Ajouter des erreurs HTTP métier plus précises.
3. Ajouter des tests automatisés.
4. Initialiser le frontend Vue 3.
5. Créer les pages d'inscription, de connexion et de suivi quotidien.
6. Ajouter l'historique, les statistiques et la gamification.
7. Conteneuriser l'application complète.
8. Déployer sur le homelab Ubuntu avec Cloudflare Tunnel.

## Déploiement homelab prévu

La cible envisagée est un Asus M32 sous Ubuntu Server 24.04. L'application devrait à terme être exécutée avec Docker et rendue accessible via Cloudflare Tunnel sur le domaine `bidouche.fr`.

Cette partie est une feuille de route : seul PostgreSQL est actuellement conteneurisé.

## Documentation complémentaire

- `context.md` contient le contexte pédagogique, les choix techniques et les limites connues.
- `progress.md` contient l'historique d'avancement, mais peut être moins à jour que le code et le présent README.
