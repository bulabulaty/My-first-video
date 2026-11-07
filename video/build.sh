#!/usr/bin/env bash
# Сборка серии: ./build.sh mars01  →  ../episodes/mars01.mp4
set -euo pipefail
cd "$(dirname "$0")"
EP="${1:-ep01}"
[ -d node_modules ] || npm install
mkdir -p out ../episodes
# если у серии есть script.json — сначала озвучка (она задаёт тайминги)
[ -f "$EP/script.json" ] && python3 voice.py "$EP"
node render.js "$EP" "out/${EP}_silent.mp4"
python3 "audio/${EP}_audio.py" "out/${EP}_audio.wav"
ffmpeg -y -loglevel error -i "out/${EP}_silent.mp4" -i "out/${EP}_audio.wav" \
  -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 44100 -c:a aac -b:a 192k -shortest -movflags +faststart "../episodes/${EP}.mp4"
echo "Готово: episodes/${EP}.mp4"
