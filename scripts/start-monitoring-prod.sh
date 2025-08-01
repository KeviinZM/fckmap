#!/bin/bash

echo "🚀 Démarrage du stack de monitoring FCK PRODUCTION..."

# Vérifier que Docker est en cours d'exécution
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker n'est pas en cours d'exécution. Veuillez démarrer Docker."
    exit 1
fi

# Créer les répertoires nécessaires s'ils n'existent pas
mkdir -p monitoring/grafana/provisioning/datasources
mkdir -p monitoring/grafana/provisioning/dashboards

# Démarrer les services de monitoring PRODUCTION
echo "📊 Démarrage de Prometheus et Grafana (PRODUCTION)..."
docker-compose -f docker-compose.monitoring.prod.yml up -d

echo "⏳ Attente du démarrage des services..."
sleep 10

echo "✅ Stack de monitoring PRODUCTION démarré !"
echo ""
echo "🎯 Services disponibles (PRODUCTION) :"
echo "   📊 Grafana: https://fckmap.fr:3001 (admin/fckmonitor123)"
echo "   📈 Prometheus: https://fckmap.fr:9090"
echo "   💻 Node Exporter: https://fckmap.fr:9100"
echo "   🌐 FCK App: https://fckmap.fr"
echo "   📋 Métriques FCK: https://fckmap.fr/api/metrics"
echo ""
echo "🔒 Configuration HTTPS pour la production !"