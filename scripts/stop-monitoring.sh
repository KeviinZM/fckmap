#!/bin/bash

echo "🛑 Arrêt du stack de monitoring FCK..."

# Arrêter tous les services
docker-compose -f docker-compose.monitoring.yml down

echo "✅ Stack de monitoring arrêté !"
echo "📝 Les données sont conservées dans les volumes Docker."