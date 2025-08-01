# Script PowerShell pour démarrer le monitoring FCK

Write-Host "🚀 Démarrage du stack de monitoring FCK..." -ForegroundColor Green

# Vérifier que Docker est en cours d'exécution
try {
    docker info | Out-Null
    Write-Host "✅ Docker est en cours d'exécution" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas en cours d'exécution. Veuillez démarrer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Créer les répertoires nécessaires s'ils n'existent pas
if (!(Test-Path "monitoring/grafana/provisioning/datasources")) {
    New-Item -ItemType Directory -Path "monitoring/grafana/provisioning/datasources" -Force
}
if (!(Test-Path "monitoring/grafana/provisioning/dashboards")) {
    New-Item -ItemType Directory -Path "monitoring/grafana/provisioning/dashboards" -Force
}

# Démarrer les services de monitoring
Write-Host "📊 Démarrage de Prometheus et Grafana..." -ForegroundColor Yellow
docker compose -f docker-compose.monitoring.yml up -d

Write-Host "⏳ Attente du démarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "✅ Stack de monitoring démarré !" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Services disponibles :" -ForegroundColor Cyan
Write-Host "   📊 Grafana: http://localhost:3001 (admin/fckmonitor123)" -ForegroundColor White
Write-Host "   📈 Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host "   💻 Node Exporter: http://localhost:9100" -ForegroundColor White
Write-Host "   🌐 FCK App: http://localhost:3000" -ForegroundColor White
Write-Host "   📋 Métriques FCK: http://localhost:3000/api/metrics" -ForegroundColor White
Write-Host ""
Write-Host "🎨 Dashboard FCK sera automatiquement chargé dans Grafana !" -ForegroundColor Green