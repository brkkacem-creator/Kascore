# ⚽ Kascore — Pronostics Coupe du Monde FIFA 2026

Application web de pronostics pour la Coupe du Monde 2026 (USA 🇺🇸 · Canada 🇨🇦 · Mexique 🇲🇽).  
Built with **Next.js 14 · Supabase · Tailwind CSS** — déployable en 15 minutes sur Vercel.

---

## ✨ Fonctionnalités

| Feature | Détail |
|---|---|
| 📅 Calendrier complet | 104 matchs, 48 équipes, groupes A–L |
| 🎯 Pronostics | Saisie de score avant chaque match |
| 🏆 Classement temps réel | Leaderboard mis à jour automatiquement |
| 🔴 Live scores | Sync API toutes les 2 min via cron Vercel |
| 📊 Statistiques | Précision, points, scores exacts |
| 🔗 Profil partageable | `kascore.app/u/ton-pseudo` |
| 🌙 Mode sombre | Persist via localStorage |
| 📱 Responsive | Mobile-first, bottom nav |
| 🔐 Auth | Google OAuth + Magic Link email |
| 🛡️ Admin | Page de gestion + sync manuelle |

**Système de points :**
- 🎯 Score exact → **+3 pts**
- ✓ Bon résultat (vainqueur/nul) → **+1 pt**
- ✗ Mauvais résultat → **0 pt**

---

## 🚀 Déploiement en 15 min

### 1. Créer le projet Supabase

1. Aller sur [supabase.com](https://supabase.com) → **New project**
2. Choisir une région USA (latence optimale)
3. Dans **SQL Editor**, exécuter dans l'ordre :
   ```
   supabase/migrations/001_initial_schema.sql
   supabase/migrations/002_seed_data.sql
   ```
4. Dans **Authentication → Providers** : activer **Google**
   - Créer un projet Google Cloud → OAuth 2.0
   - Callback URL : `https://xxxx.supabase.co/auth/v1/callback`
5. Récupérer les clés dans **Settings → API**

### 2. Obtenir la clé API Football

1. Créer un compte sur [football-data.org](https://www.football-data.org)
2. Le plan gratuit suffit pour le développement (10 req/min)
3. Pour la prod : plan Tier 1 (~12€/mois) pour 60 req/min

### 3. Déployer sur Vercel

```bash
# Fork ou clone ce repo
git clone https://github.com/ton-user/kascore
cd kascore

# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.local.example .env.local
# → Remplir les valeurs

# Tester en local
npm run dev
```

**Déploiement Vercel :**

1. Pousser sur GitHub
2. [vercel.com](https://vercel.com) → **New Project** → importer le repo
3. Ajouter les variables d'environnement :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
FOOTBALL_API_KEY=your_key
FOOTBALL_API_BASE=https://api.football-data.org/v4
CRON_SECRET=your_random_secret_32_chars
NEXT_PUBLIC_APP_URL=https://kascore.vercel.app
```

4. **Deploy** → lien public disponible immédiatement !

Le `vercel.json` configure automatiquement le cron job `/api/sync` toutes les 2 minutes.

---

## 🏗️ Architecture

```
kascore/
├── src/
│   ├── app/
│   │   ├── (app)/              # Pages authentifiées
│   │   │   ├── calendar/       # Calendrier + pronos inline
│   │   │   ├── pronostics/     # Mes pronostics
│   │   │   ├── classement/     # Leaderboard
│   │   │   ├── stats/          # Statistiques
│   │   │   ├── profil/         # Profil utilisateur
│   │   │   └── admin/          # Administration
│   │   ├── api/
│   │   │   ├── matches/        # GET matches
│   │   │   ├── predictions/    # POST pronostic
│   │   │   ├── rankings/       # GET classement
│   │   │   └── sync/           # Cron sync API football
│   │   ├── auth/callback/      # OAuth callback
│   │   ├── u/[username]/       # Profil public partageable
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── layout/             # Navbar, BottomNav
│   │   ├── matches/            # MatchCard, MatchList
│   │   └── ui/                 # AuthButton, Skeleton, ThemeToggle...
│   ├── lib/
│   │   ├── supabase/           # Client browser/server/middleware
│   │   ├── football-api.ts     # Intégration football-data.org
│   │   ├── scoring.ts          # Calcul des points
│   │   └── utils.ts            # cn(), helpers
│   ├── hooks/
│   │   ├── useRealtime.ts      # Supabase Realtime subscriptions
│   │   └── useStore.ts         # Zustand global state
│   └── types/
│       └── index.ts            # Types TypeScript complets
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql   # Tables, RLS, indexes, vues
│       └── 002_seed_data.sql        # 48 équipes + 104 matchs
└── vercel.json                 # Cron job config
```

### Flux de données

```
football-data.org API
        ↓ (cron Vercel /2min)
/api/sync → Supabase matches table
        ↓ (Supabase Realtime)
Browser ← WebSocket updates
        ↓ (React state)
MatchCard re-render
```

### Scoring pipeline

```
Match terminé → /api/sync détecte status=FINISHED
→ Calcule points pour chaque pronostic (calculatePoints())
→ UPDATE predictions.points
→ Agrège total_points / exact_scores par user
→ UPDATE profiles
→ Realtime broadcast → leaderboard mis à jour
```

---

## 🗄️ Schéma base de données

| Table | Description |
|---|---|
| `profiles` | Utilisateurs (extends auth.users) |
| `teams` | 48 équipes avec emojis drapeaux |
| `matches` | 104 matchs avec scores et statuts |
| `predictions` | Pronostics utilisateurs (unique user+match) |
| `leaderboard` | Vue SQL calculant le classement |

**RLS (Row Level Security) :**
- Matches/teams : lecture publique, écriture admin uniquement
- Predictions : lecture/écriture par le propriétaire uniquement
- Profiles : lecture publique, modification par soi-même

---

## 🔧 Développement local

```bash
npm run dev          # http://localhost:3000
npm run build        # Build de production
npm run lint         # ESLint
```

**Tester le cron manuellement :**
```bash
curl -H "Authorization: Bearer votre_cron_secret" \
  http://localhost:3000/api/sync
```

---

## 📱 Pages

| Route | Description | Auth |
|---|---|---|
| `/` | Landing page + connexion | Public |
| `/calendar` | Calendrier des matchs + pronos | ✓ |
| `/pronostics` | Mes pronostics + points | ✓ |
| `/classement` | Classement général | ✓ |
| `/stats` | Statistiques personnelles | ✓ |
| `/profil` | Paramètres du compte | ✓ |
| `/admin` | Gestion + sync manuelle | Admin |
| `/u/:username` | Profil public partageable | Public |

---

## 🎨 Design System

**Couleurs :**
- `brand-gold` : #F5A623 — points, accents
- `brand-blue` : #1A3A8F — CTA, navigation active
- `brand-red` : #E8304A — alertes, gradients
- `brand-green` : #00A86B — live, scores exacts

**Fonts :** Syne (titres) + DM Sans (corps)

---

## 📄 Licence

MIT — Libre d'utilisation pour tout projet personnel ou commercial.

---

*Kascore — Fait avec ❤️ pour la Coupe du Monde 2026* ⚽🏆

---

## ▶️ Lancement rapide (après extraction du ZIP)

### macOS / Linux
```bash
# Option 1 — Double-cliquez sur LANCER_KASCORE.command (Finder) ou LANCER_KASCORE.sh
# Option 2 — Terminal :
cd kascore
bash LANCER_KASCORE.sh
```

### Windows
```
Double-cliquez sur LANCER_KASCORE.bat
```

Le script va automatiquement :
1. Vérifier que Node.js est installé (v18+)
2. Créer `.env.local` si absent et l'ouvrir pour que vous remplissiez les clés
3. Installer les dépendances (`npm install`)
4. Lancer le serveur de développement
5. Ouvrir `http://localhost:3000` dans votre navigateur

> **Prérequis :** [Node.js 18+](https://nodejs.org) — c'est tout !
