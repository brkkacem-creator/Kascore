#!/usr/bin/env bash
# ============================================================
#  KASCORE — Build APK Android (debug + release)
#  Prérequis : Node.js 18+, Java 17+, Android Studio / SDK
# ============================================================
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# ── Couleurs ────────────────────────────────────────────────
GOLD='\033[0;33m'; GREEN='\033[0;32m'; RED='\033[0;31m'
BLUE='\033[0;34m'; NC='\033[0m'; BOLD='\033[1m'

echo -e "\n${GOLD}${BOLD}"
echo "  ██╗  ██╗ █████╗ ███████╗ ██████╗ ██████╗ ██████╗ ███████╗"
echo "  ██╔══██╗██╔══██╗██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔════╝"
echo "  █████╔╝ ███████║███████╗██║     ██║   ██║██████╔╝█████╗  "
echo "  ██╔═██╗ ██╔══██║╚════██║██║     ██║   ██║██╔══██╗██╔══╝  "
echo "  ██║  ██╗██║  ██║███████║╚██████╗╚██████╔╝██║  ██║███████╗"
echo -e "  ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝${NC}"
echo -e "${BOLD}  📱  Build APK Android${NC}\n"

BUILD_TYPE=${1:-debug}  # Usage: bash BUILD_APK.sh [debug|release]

# ── Vérifications ────────────────────────────────────────────
echo -e "${BLUE}► Vérifications...${NC}"

# Node.js
if ! command -v node &>/dev/null; then
  echo -e "${RED}✗ Node.js non trouvé → https://nodejs.org${NC}"; exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Java
if ! command -v java &>/dev/null; then
  echo -e "${RED}✗ Java JDK non trouvé → https://adoptium.net${NC}"; exit 1
fi
JAVA_VER=$(java -version 2>&1 | head -1 | grep -oP '(?<=version ")\d+')
echo -e "${GREEN}✓ Java $JAVA_VER${NC}"

# Android SDK
if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
  echo -e "${GOLD}⚠ ANDROID_HOME non défini${NC}"
  # Try common locations
  for path in "$HOME/Library/Android/sdk" "$HOME/Android/Sdk" "/opt/android-sdk" "/usr/lib/android-sdk"; do
    if [ -d "$path" ]; then
      export ANDROID_HOME="$path"
      echo -e "${GREEN}✓ Android SDK trouvé : $ANDROID_HOME${NC}"
      break
    fi
  done
  if [ -z "$ANDROID_HOME" ]; then
    echo -e "${RED}✗ Android SDK non trouvé${NC}"
    echo "  Installe Android Studio : https://developer.android.com/studio"
    echo "  Puis : export ANDROID_HOME=~/Library/Android/sdk  (macOS)"
    echo "         export ANDROID_HOME=~/Android/Sdk           (Linux)"
    exit 1
  fi
fi
echo -e "${GREEN}✓ ANDROID_HOME = $ANDROID_HOME${NC}"

# ── .env.local ───────────────────────────────────────────────
if [ ! -f ".env.local" ]; then
  cp .env.local.example .env.local
  echo -e "${GOLD}⚠ .env.local créé — vérifie NEXT_PUBLIC_APP_URL${NC}"
fi

# Read APP_URL from .env.local
APP_URL=$(grep NEXT_PUBLIC_APP_URL .env.local | cut -d'=' -f2 | tr -d '"' | tr -d "'")
if [ -z "$APP_URL" ] || [[ "$APP_URL" == *"your"* ]]; then
  echo -e "${GOLD}⚠ NEXT_PUBLIC_APP_URL non configuré dans .env.local${NC}"
  read -p "  Entre ton URL Vercel (ex: https://kascore.vercel.app) : " APP_URL
  sed -i.bak "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=$APP_URL|" .env.local
fi
echo -e "${GREEN}✓ App URL : $APP_URL${NC}"

# ── npm install ──────────────────────────────────────────────
if [ ! -d "node_modules" ] || [ ! -d "node_modules/@capacitor/core" ]; then
  echo -e "\n${BLUE}► Installation dépendances...${NC}"
  npm install --silent
fi

# ── Build Next.js (static export) ───────────────────────────
echo -e "\n${BLUE}► Build Next.js (export statique)...${NC}"
BUILD_TARGET=android npm run build
echo -e "${GREEN}✓ Build Next.js terminé${NC}"

# ── Sync Capacitor ───────────────────────────────────────────
echo -e "\n${BLUE}► Sync Capacitor...${NC}"
NEXT_PUBLIC_APP_URL="$APP_URL" npx cap sync android --inline 2>&1 | grep -E "(✓|✗|Copying|Syncing|error)" || true
echo -e "${GREEN}✓ Capacitor sync OK${NC}"

# ── Gradle build ─────────────────────────────────────────────
echo -e "\n${BLUE}► Compilation Gradle ($BUILD_TYPE)...${NC}"
cd android-build
chmod +x gradlew

if [ "$BUILD_TYPE" = "release" ]; then
  ./gradlew assembleRelease --no-daemon --quiet
  APK_PATH="app/build/outputs/apk/release/app-release.apk"
else
  ./gradlew assembleDebug --no-daemon --quiet
  APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
fi
cd ..

# ── Result ───────────────────────────────────────────────────
if [ -f "android-build/$APK_PATH" ]; then
  DEST="kascore-android-${BUILD_TYPE}.apk"
  cp "android-build/$APK_PATH" "$DEST"
  SIZE=$(du -sh "$DEST" | cut -f1)

  echo -e "\n${GREEN}${BOLD}"
  echo "  ╔══════════════════════════════════════════════════╗"
  echo "  ║  ✅  APK prêt !                                  ║"
  echo "  ║                                                  ║"
  echo -e "  ║  📦  ${DEST} (${SIZE})${NC}${GREEN}${BOLD}  ║"
  echo "  ╚══════════════════════════════════════════════════╝"
  echo -e "${NC}"

  # ── ADB direct install if device connected ────────────────
  if command -v adb &>/dev/null; then
    ADB_DEVICES=$(adb devices 2>/dev/null | grep -c "device$" || echo 0)
    if [ "$ADB_DEVICES" -gt 0 ]; then
      echo -e "${BLUE}► Appareil Android détecté — installation directe...${NC}"
      adb install -r "$DEST" && echo -e "${GREEN}✅ Installé sur le téléphone !${NC}"
    else
      echo -e "${GOLD}💡 Pour installer via USB :${NC}"
      echo "   1. Connecte ton Android avec un câble USB"
      echo "   2. Active le débogage USB (Paramètres → Options dev.)"
      echo "   3. Lance : adb install $DEST"
    fi
  else
    echo -e "${GOLD}💡 Pour installer :${NC}"
    echo "   Option A — USB : adb install $DEST"
    echo "   Option B — Fichier : copie $DEST sur le téléphone et ouvre-le"
    echo "   (autorise les sources inconnues dans Paramètres → Sécurité)"
  fi
else
  echo -e "${RED}✗ Build échoué. Consulte les logs ci-dessus.${NC}"
  exit 1
fi
