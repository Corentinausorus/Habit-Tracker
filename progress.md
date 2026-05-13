# Progression du projet — Habit Tracker

## État actuel
Le backend est complet et fonctionnel. Toutes les routes sont testées via Postman. On attaque le frontend Vue 3.

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
- [x] Schemas Zod : `auth.schema.ts`, `habit.schema.ts`, `log.schema.ts`
- [x] Error handler global Zod dans `server.ts`
- [x] Serveur Fastify (`server.ts`) avec JWT, CORS, routes enregistrées
- [x] Tables créées en base via `db:push`
- [x] Toutes les routes testées via Postman ✓

### Outils
- [x] Postman configuré avec environnement, variables et auto-save du token

---

## En cours 🔄

- [ ] **Frontend Vue 3** — prochaine étape immédiate

---

## À faire

### Frontend
- [ ] Initialiser le projet Vue 3 dans le dossier `frontend/`
- [ ] Choisir les outils (Vue Router, Pinia, bibliothèque UI)
- [ ] Page de login / register
- [ ] Page principale — liste des habitudes du jour
- [ ] Complétion d'une habitude (avec ou sans choix)
- [ ] Historique et stats hebdomadaires
- [ ] Système XP / gamification

### Backend (améliorations futures)
- [ ] Script d'import des données historiques depuis Google Sheets
- [ ] Endpoint stats hebdomadaires

### Déploiement (plus tard)
- [ ] Dockerfile pour le backend
- [ ] Adapter docker-compose.yml pour la production
- [ ] Configurer Cloudflare Tunnel avec bidouche.fr
- [ ] Déployer sur le serveur homelab (Asus M32, Ubuntu Server 24.04)

---

## Prochaine étape immédiate
Initialiser le projet Vue 3 dans le dossier `frontend/` et commencer par la page de login.