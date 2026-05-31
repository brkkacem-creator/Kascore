#!/usr/bin/env bash
# ================================================
#  KASCORE — Script de lancement
#  Double-cliquez sur ce fichier pour démarrer
# ================================================

set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo ""
echo "  ██╗  ██╗ █████╗ ███████╗ ██████╗ ██████╗ ██████╗ ███████╗"
echo "  ██║ ██╔╝██╔══██╗██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔════╝"
echo "  █████╔╝ ███████║███████╗██║     ██║   ██║██████╔╝█████╗  "
echo "  ██╔═██╗ ██╔══██║╚════██║██║     ██║   ██║██╔══██╗██╔══╝  "
echo "  ██║  ██╗██║  ██║███████║╚██████╗╚██████╔╝██║  ██║███████╗"
echo "  ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝"
echo ""
echo "  🏆  Coupe du Monde FIFA 2026 — Pronostics"
echo ""

# ── Check Node.js ──────────────────────────────
if ! command -v node &>/dev/null; then
  echo "❌  Node.js non trouvé."
  echo "    Installe-le sur https://nodejs.org  (version 18+)"
  read -p "    Appuie sur Entrée pour fermer..."
  exit 1
fi

NODE_VER=$(node -e "process.stdout.write(process.version.slice(1).split('.')[0])")
if [ "$NODE_VER" -lt 18 ]; then
  echo "❌  Node.js v${NODE_VER} trop ancien. Version 18+ requise."
  read -p "    Appuie sur Entrée pour fermer..."
  exit 1
fi

echo "✅  Node.js v$(node -v)"

# ── Check .env.local ───────────────────────────
if [ ! -f ".env.local" ]; then
  echo ""
  echo "⚠️   Fichier .env.local introuvable !"
  echo "    1. Copie .env.local.example → .env.local"
  echo "    2. Remplis tes clés Supabase et Football API"
  echo "    3. Relance ce script"
  echo ""
  cp .env.local.example .env.local
  echo "    ✅ .env.local créé depuis l'exemple."
  echo "    ✏️  Ouvre-le et remplis les clés avant de continuer."
  echo ""
  if command -v open &>/dev/null; then open .env.local; fi     # macOS
  if command -v xdg-open &>/dev/null; then xdg-open .env.local; fi  # Linux
  read -p "    Appuie sur Entrée une fois les clés remplies..."
fi

# ── Install dependencies ───────────────────────
if [ ! -d "node_modules" ]; then
  echo ""
  echo "📦  Installation des dépendances (première fois ~1-2 min)..."
  npm install --silent
  echo "✅  Dépendances installées"
fi

# ── Start dev server ───────────────────────────
echo ""
echo "🚀  Démarrage de Kascore..."
echo ""
echo "    ┌─────────────────────────────────────────┐"
echo "    │   Ouvre ton navigateur sur :            │"
echo "    │   👉  http://localhost:3000             │"
echo "    └─────────────────────────────────────────┘"
echo ""
echo "    Ctrl+C pour arrêter"
echo ""

# Open browser after 3s
(sleep 3 && \
  if command -v open &>/dev/null; then open http://localhost:3000; \
  elif command -v xdg-open &>/dev/null; then xdg-open http://localhost:3000; \
  elif command -v start &>/dev/null; then start http://localhost:3000; fi \
) &

npm run dev
