#!/bin/bash

echo "🚀 Démarrage du stack de monitoring FCK..."

# Vérifier que Docker est en cours d'exécution
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker n'est pas en cours d'exécution. Veuillez démarrer Docker Desktop."
    exit 1
fi

# Créer les répertoires nécessaires s'ils n'existent pas
mkdir -p monitoring/grafana/provisioning/datasources
mkdir -p monitoring/grafana/provisioning/dashboards

# Démarrer les services de monitoring
echo "📊 Démarrage de Prometheus et Grafana..."
docker-compose -f docker-compose.monitoring.yml up -d

echo "⏳ Attente du démarrage des services..."
sleep 10

echo "✅ Stack de monitoring démarré !"
echo ""
echo "🎯 Services disponibles :"
echo "   📊 Grafana: http://localhost:3001 (admin/fckmonitor123)"
echo "   📈 Prometheus: http://localhost:9090"
echo "   💻 Node Exporter: http://localhost:9100"
echo "   🌐 FCK App: http://localhost:3000"
echo "   📋 Métriques FCK: http://localhost:3000/api/metrics"
echo ""
echo "🎨 Dashboard FCK sera automatiquement chargé dans Grafana !"