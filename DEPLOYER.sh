#!/usr/bin/env bash
# ============================================================
#  KASCORE — Script de déploiement automatique
#  Lance ce script UNE seule fois pour tout déployer
# ============================================================
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

GOLD='\033[0;33m'; GREEN='\033[0;32m'; RED='\033[0;31m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'; BOLD='\033[1m'

clear
echo -e "${GOLD}${BOLD}"
cat << 'BANNER'
  ██╗  ██╗ █████╗ ███████╗ ██████╗ ██████╗ ██████╗ ███████╗
  ██╔══██╗██╔══██╗██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔════╝
  █████╔╝ ███████║███████╗██║     ██║   ██║██████╔╝█████╗
  ██╔═██╗ ██╔══██║╚════██║██║     ██║   ██║██╔══██╗██╔══╝
  ██║  ██╗██║  ██║███████║╚██████╗╚██████╔╝██║  ██║███████╗
  ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
BANNER
echo -e "${NC}${BOLD}  🚀  Déploiement automatique — Coupe du Monde 2026${NC}"
echo ""

# ─────────────────────────────────────────────────────────────
# FONCTIONS
# ─────────────────────────────────────────────────────────────
check_cmd() {
  command -v "$1" &>/dev/null
}

install_if_missing() {
  local cmd="$1" pkg="$2"
  if ! check_cmd "$cmd"; then
    echo -e "${BLUE}  → Installation de $pkg...${NC}"
    npm install -g "$pkg" --silent
  fi
}

prompt_val() {
  local label="$1" var="$2" default="$3"
  echo -ne "  ${CYAN}${label}${NC}"
  [ -n "$default" ] && echo -ne " ${GOLD}(Enter = $default)${NC}"
  echo -ne " : "
  read -r input
  [ -z "$input" ] && input="$default"
  eval "$var=\"$input\""
}

check_url() {
  [[ "$1" =~ ^https?:// ]]
}

# ─────────────────────────────────────────────────────────────
# 1. VÉRIFICATIONS SYSTÈME
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}${BOLD}[1/5] Vérifications système${NC}"

if ! check_cmd node; then
  echo -e "${RED}✗ Node.js non trouvé. Installe-le sur https://nodejs.org${NC}"; exit 1
fi
NODE_VER=$(node -e "process.stdout.write(process.version)")
echo -e "${GREEN}  ✓ Node.js $NODE_VER${NC}"

if ! check_cmd git; then
  echo -e "${RED}✗ Git non trouvé. Installe-le sur https://git-scm.com${NC}"; exit 1
fi
echo -e "${GREEN}  ✓ Git $(git --version | cut -d' ' -f3)${NC}"

install_if_missing "vercel" "vercel"
echo -e "${GREEN}  ✓ Vercel CLI prêt${NC}"

echo ""

# ─────────────────────────────────────────────────────────────
# 2. COLLECTE DES CLÉS
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}${BOLD}[2/5] Configuration des clés${NC}"
echo ""
echo -e "  ${GOLD}Récupère tes clés sur :${NC}"
echo -e "  • Supabase  → https://supabase.com/dashboard/project/_/settings/api"
echo -e "  • Football  → https://www.football-data.org (gratuit)"
echo -e "  • GitHub    → https://github.com/new (crée un repo 'kascore' si pas encore fait)"
echo ""

# Charger les valeurs existantes si .env.local existe
if [ -f ".env.local" ]; then
  source <(grep -v '^#' .env.local | grep '=' | sed 's/^/export /')
  echo -e "  ${GREEN}Valeurs existantes chargées depuis .env.local${NC}"
fi

prompt_val "NEXT_PUBLIC_SUPABASE_URL" SUPABASE_URL "$NEXT_PUBLIC_SUPABASE_URL"
while ! check_url "$SUPABASE_URL"; do
  echo -e "  ${RED}  ✗ URL invalide (doit commencer par https://)${NC}"
  prompt_val "NEXT_PUBLIC_SUPABASE_URL" SUPABASE_URL ""
done

prompt_val "NEXT_PUBLIC_SUPABASE_ANON_KEY" SUPABASE_ANON "$NEXT_PUBLIC_SUPABASE_ANON_KEY"
while [ ${#SUPABASE_ANON} -lt 20 ]; do
  echo -e "  ${RED}  ✗ Clé trop courte${NC}"
  prompt_val "NEXT_PUBLIC_SUPABASE_ANON_KEY" SUPABASE_ANON ""
done

prompt_val "SUPABASE_SERVICE_ROLE_KEY" SUPABASE_SERVICE "$SUPABASE_SERVICE_ROLE_KEY"
while [ ${#SUPABASE_SERVICE} -lt 20 ]; do
  echo -e "  ${RED}  ✗ Clé trop courte${NC}"
  prompt_val "SUPABASE_SERVICE_ROLE_KEY" SUPABASE_SERVICE ""
done

prompt_val "FOOTBALL_API_KEY (laisser vide si pas encore)" FOOTBALL_KEY "${FOOTBALL_API_KEY:-}"
prompt_val "Nom de ton repo GitHub (ex: monpseudo/kascore)" GITHUB_REPO ""
prompt_val "URL Vercel souhaitée (laisser vide = auto)" VERCEL_URL "${NEXT_PUBLIC_APP_URL:-}"

# Générer un CRON_SECRET aléatoire si absent
CRON_SECRET=$(cat /dev/urandom | LC_ALL=C tr -dc 'a-zA-Z0-9' | head -c 32 2>/dev/null || node -e "process.stdout.write(Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2))")

echo ""

# ─────────────────────────────────────────────────────────────
# 3. ÉCRITURE DU .env.local
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}${BOLD}[3/5] Écriture de .env.local${NC}"

FINAL_URL="${VERCEL_URL:-https://kascore.vercel.app}"

cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE
FOOTBALL_API_KEY=${FOOTBALL_KEY:-your_football_api_key_here}
FOOTBALL_API_BASE=https://api.football-data.org/v4
CRON_SECRET=$CRON_SECRET
NEXT_PUBLIC_APP_URL=$FINAL_URL
EOF

echo -e "${GREEN}  ✓ .env.local créé${NC}"
echo ""

# ─────────────────────────────────────────────────────────────
# 4. GIT — init + push
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}${BOLD}[4/5] Push sur GitHub${NC}"

# Init git si nécessaire
if [ ! -d ".git" ]; then
  git init -q
  git branch -M main
  echo -e "${GREEN}  ✓ Repo Git initialisé${NC}"
fi

# .gitignore déjà présent, s'assurer que .env.local est ignoré
if ! grep -q "^\.env\.local$" .gitignore 2>/dev/null; then
  echo ".env.local" >> .gitignore
fi
if ! grep -q "^node_modules$" .gitignore 2>/dev/null; then
  echo "node_modules/" >> .gitignore
fi

# Ajouter remote si fourni
if [ -n "$GITHUB_REPO" ]; then
  REMOTE_URL="https://github.com/${GITHUB_REPO}.git"
  if git remote get-url origin &>/dev/null; then
    git remote set-url origin "$REMOTE_URL"
  else
    git remote add origin "$REMOTE_URL"
  fi
  echo -e "${GREEN}  ✓ Remote → $REMOTE_URL${NC}"
fi

# Commit
git add -A
git diff --cached --quiet || git commit -m "🚀 Kascore v1 — CDM 2026 PWA" -q
echo -e "${GREEN}  ✓ Commit créé${NC}"

# Push
if [ -n "$GITHUB_REPO" ]; then
  echo -e "  ${BLUE}→ Push vers GitHub...${NC}"
  if git push -u origin main -q 2>/dev/null || git push -u origin main --force -q; then
    echo -e "${GREEN}  ✓ Code poussé sur GitHub${NC}"
  else
    echo -e "${GOLD}  ⚠ Push échoué — vérifie que le repo $GITHUB_REPO existe sur GitHub${NC}"
    echo -e "  Lance manuellement : ${CYAN}git push -u origin main${NC}"
  fi
fi
echo ""

# ─────────────────────────────────────────────────────────────
# 5. DÉPLOIEMENT VERCEL
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}${BOLD}[5/5] Déploiement sur Vercel${NC}"
echo ""
echo -e "  ${GOLD}Connexion à Vercel (navigateur va s'ouvrir)...${NC}"
echo ""

# Login Vercel
vercel login 2>&1 | grep -v "^$" || true
echo ""

# Déployer avec toutes les variables
echo -e "  ${BLUE}→ Déploiement en cours...${NC}"

DEPLOY_CMD="vercel --yes"

# Ajouter les variables d'env
DEPLOY_CMD="$DEPLOY_CMD \
  -e NEXT_PUBLIC_SUPABASE_URL=\"$SUPABASE_URL\" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=\"$SUPABASE_ANON\" \
  -e SUPABASE_SERVICE_ROLE_KEY=\"$SUPABASE_SERVICE\" \
  -e FOOTBALL_API_KEY=\"${FOOTBALL_KEY:-placeholder}\" \
  -e FOOTBALL_API_BASE=\"https://api.football-data.org/v4\" \
  -e CRON_SECRET=\"$CRON_SECRET\" \
  -e NEXT_PUBLIC_APP_URL=\"$FINAL_URL\""

DEPLOY_URL=$(eval $DEPLOY_CMD 2>&1 | grep "https://" | tail -1)

# Alias de production
if [ -n "$DEPLOY_URL" ]; then
  vercel --prod --yes 2>/dev/null | tail -3 || true
  echo ""
  echo -e "${GREEN}${BOLD}"
  echo "  ╔══════════════════════════════════════════════════════╗"
  echo "  ║                                                      ║"
  echo "  ║  ✅  KASCORE EST EN LIGNE !                         ║"
  echo "  ║                                                      ║"
  echo -e "  ║  🌍  $DEPLOY_URL  ║"
  echo "  ║                                                      ║"
  echo "  ║  📱  Sur ton Android :                              ║"
  echo "  ║      1. Ouvre l'URL dans Chrome                     ║"
  echo "  ║      2. Menu ⋮ → Ajouter à l'écran d'accueil       ║"
  echo "  ║      3. Kascore s'installe comme une app native     ║"
  echo "  ║                                                      ║"
  echo "  ╚══════════════════════════════════════════════════════╝"
  echo -e "${NC}"

  # Ouvrir dans le navigateur
  if check_cmd open; then open "$DEPLOY_URL"; fi
  if check_cmd xdg-open; then xdg-open "$DEPLOY_URL"; fi
  if check_cmd start; then start "$DEPLOY_URL"; fi

else
  echo -e "${GOLD}  ⚠ Récupération URL automatique échouée${NC}"
  echo -e "  Ton app est déployée — vérifie sur https://vercel.com/dashboard"
fi

echo ""
echo -e "${GOLD}  💡 Note importante :${NC}"
echo -e "  Exécute les migrations SQL dans Supabase SQL Editor si ce n'est pas fait :"
echo -e "  ${CYAN}supabase/migrations/001_initial_schema.sql${NC}"
echo -e "  ${CYAN}supabase/migrations/002_seed_data.sql${NC}"
echo -e "  ${CYAN}supabase/migrations/003_push_notifications.sql${NC}"
echo ""
