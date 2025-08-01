# Script PowerShell pour démarrer le monitoring FCK PRODUCTION

Write-Host "🚀 Démarrage du stack de monitoring FCK PRODUCTION..." -ForegroundColor Green

# Vérifier que Docker est en cours d'exécution
try {
    docker info | Out-Null
    Write-Host "✅ Docker est en cours d'exécution" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas en cours d'exécution. Veuillez démarrer Docker." -ForegroundColor Red
    exit 1
}

# Créer les répertoires nécessaires s'ils n'existent pas
if (!(Test-Path "monitoring/grafana/provisioning/datasources")) {
    New-Item -ItemType Directory -Path "monitoring/grafana/provisioning/datasources" -Force
}
if (!(Test-Path "monitoring/grafana/provisioning/dashboards")) {
    New-Item -ItemType Directory -Path "monitoring/grafana/provisioning/dashboards" -Force
}

# Démarrer les services de monitoring PRODUCTION
Write-Host "📊 Démarrage de Prometheus et Grafana (PRODUCTION)..." -ForegroundColor Yellow
docker compose -f docker-compose.monitoring.prod.yml up -d

Write-Host "⏳ Attente du démarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "✅ Stack de monitoring PRODUCTION démarré !" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Services disponibles (PRODUCTION) :" -ForegroundColor Cyan
Write-Host "   📊 Grafana: https://fckmap.fr:3001 (admin/fckmonitor123)" -ForegroundColor White
Write-Host "   📈 Prometheus: https://fckmap.fr:9090" -ForegroundColor White
Write-Host "   💻 Node Exporter: https://fckmap.fr:9100" -ForegroundColor White
Write-Host "   🌐 FCK App: https://fckmap.fr" -ForegroundColor White
Write-Host "   📋 Métriques FCK: https://fckmap.fr/api/metrics" -ForegroundColor White
Write-Host ""
Write-Host "🔒 Configuration HTTPS pour la production !" -ForegroundColor Green