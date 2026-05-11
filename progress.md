# Progression du projet — Habit Tracker

## État actuel
Le backend est structuré et fonctionnel. Le serveur démarre, les tables sont créées en base, et le endpoint `/api/auth/register` a été testé avec succès via Postman.

---

## Terminé ✓

### Infrastructure
- [x] Docker Compose avec PostgreSQL 16
- [x] Structure de dossiers du projet
- [x] package.json avec toutes les dépendances
- [x] tsconfig.json configuré
- [x] .env (à recréer manuellement sur chaque PC)
- [x] .gitignore
- [x] Repo Git initialisé et pushé

### Backend
- [x] Schema Drizzle (`schema.ts`) — toutes les tables
- [x] Client Drizzle (`client.ts`) — connexion PostgreSQL
- [x] Déclaration de type Fastify (`types/fastify.d.ts`)
- [x] Repositories : `userRepository.ts`, `habitRepository.ts`, `logRepository.ts`
- [x] Services : `authService.ts`, `habitService.ts`, `logService.ts`
- [x] Routes : `auth.ts`, `habits.ts`, `logs.ts`
- [x] Serveur Fastify (`server.ts`) avec JWT, CORS, routes enregistrées
- [x] Tables créées en base via `db:push`
- [x] Test Postman : `POST /api/auth/register` ✓

---

## En cours 🔄

- [ ] **Validation Zod** — ajouter la validation des données entrantes sur toutes les routes (prochaine étape immédiate)

---

## À faire

### Backend
- [ ] Tester toutes les routes avec Postman (login, habits CRUD, logs)
- [ ] Gestion centralisée des erreurs (error handler global Fastify)
- [ ] Script d'import des données historiques depuis Google Sheets

### Frontend (pas encore commencé)
- [ ] Initialiser le projet Vue 3
- [ ] Page de login / register
- [ ] Page principale — liste des habitudes du jour
- [ ] Complétion d'une habitude (avec ou sans choix)
- [ ] Historique et stats hebdomadaires
- [ ] Système XP / gamification

### Déploiement (plus tard)
- [ ] Dockerfile pour le backend
- [ ] Adapter docker-compose.yml pour la production
- [ ] Configurer Cloudflare Tunnel avec bidouche.fr
- [ ] Déployer sur le serveur homelab (Asus M32, Ubuntu Server 24.04)

---

## Prochaine étape immédiate
Ajouter la validation Zod sur les routes — installer Zod, créer les schémas de validation pour auth, habits et logs.