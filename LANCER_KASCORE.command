#!/usr/bin/env bash
# Double-cliquez sur ce fichier dans le Finder pour lancer Kascore
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"
exec bash LANCER_KASCORE.sh
