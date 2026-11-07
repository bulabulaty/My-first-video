#!/usr/bin/env bash
# Установка всего, что нужно для сборки серий (Ubuntu/Debian).
set -euo pipefail
cd "$(dirname "$0")"
npm install
pip install numpy piper-tts
sudo apt-get install -y ffmpeg rhvoice rhvoice-russian || apt-get install -y ffmpeg rhvoice rhvoice-russian
mkdir -p voices
if [ ! -f voices/ru-irinia-medium.onnx ]; then
  curl -sSL https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-ru-irinia-medium.tar.gz | tar xz -C voices
fi
echo "Готово. Сборка: ./build.sh mars01"
