#!/bin/bash

# Konfigurationsvariablen
SERVER_USER="flo"          # Dein SSH-Benutzer
SERVER_IP="maierflo.de"  # IP-Adresse oder Hostname deines Servers
REMOTE_PATH="/home/$SERVER_USER/palia-page" # Zielpfad auf dem Server
IMAGE_NAME="palia-page" # Name des Docker-Images
TAR_FILE="$IMAGE_NAME.tar.gz"
CONTAINER_NAME="meine-palia-page"
PROD_DIR="prod"
BUILD_DIR="build"

echo "Kopiere package.json und package-lock.json für die Produktion..."

# Sicherstellen, dass das Produktionsverzeichnis existiert
mkdir -p $PROD_DIR

# package.json und package-lock.json kopieren
cp package.json $PROD_DIR
cp package-lock.json $PROD_DIR

# Ordner "build" kopieren
echo "Kopiere den Ordner '$BUILD_DIR'..."
cp -r $BUILD_DIR $PROD_DIR/$BUILD_DIR

# In das Produktionsverzeichnis wechseln
cd $PROD_DIR

# npm ci ausführen, um die Produktionsabhängigkeiten zu installieren
echo "Installiere Produktionsabhängigkeiten..."
npm ci --omit=dev

cd ..

echo "🚀 Erstelle das Docker-Image..."
docker build -t $IMAGE_NAME .

echo "📦 Speichere das Docker-Image als TAR-Datei..."
docker save $IMAGE_NAME | gzip > $TAR_FILE

echo "🔄 Lade das TAR-Archiv auf den Server hoch..."
scp $TAR_FILE $SERVER_USER@$SERVER_IP:$REMOTE_PATH/

echo "💻 Lade das Docker-Image auf dem Server..."

ssh $SERVER_USER@$SERVER_IP << EOF
  mkdir -p $REMOTE_PATH
  cd $REMOTE_PATH
  docker stop $CONTAINER_NAME || true
  docker rm $CONTAINER_NAME || true
  docker load < $TAR_FILE
  rm $TAR_FILE
  docker run -d --restart always -p 3000:3000 --name $CONTAINER_NAME $IMAGE_NAME
EOF

rm -R $PROD_DIR

echo "Deployment abgeschlossen!"
read -p "Drücke eine Taste zum Beenden..." -n1 -s
