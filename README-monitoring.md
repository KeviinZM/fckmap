# 📊 FCK Monitoring Stack

## 🎯 Vue d'ensemble

Le monitoring FCK utilise **Prometheus + Grafana** pour surveiller les performances et l'utilisation de l'application.

## 🚀 Démarrage rapide

### **💻 Développement local**
```bash
# Option 1: Docker Compose
docker compose -f docker-compose.monitoring.yml up -d

# Option 2: Script automatique
bash scripts/start-monitoring.sh
# ou PowerShell
.\scripts\start-monitoring.ps1
```

### **🌐 Production (fckmap.fr)**
```bash
# Option 1: Docker Compose
docker compose -f docker-compose.monitoring.prod.yml up -d

# Option 2: Script automatique
bash scripts/start-monitoring-prod.sh
# ou PowerShell
.\scripts\start-monitoring-prod.ps1
```

## 📋 URLs d'accès

### **Développement local**
- 📊 **Grafana**: http://localhost:3001 (admin/fckmonitor123)
- 📈 **Prometheus**: http://localhost:9090
- 💻 **Node Exporter**: http://localhost:9100
- 🌐 **FCK App**: http://localhost:3000
- 📋 **Métriques FCK**: http://localhost:3000/api/metrics

### **Production**
- 📊 **Grafana**: https://fckmap.fr:3001 (admin/fckmonitor123)
- 📈 **Prometheus**: https://fckmap.fr:9090
- 💻 **Node Exporter**: https://fckmap.fr:9100
- 🌐 **FCK App**: https://fckmap.fr
- 📋 **Métriques FCK**: https://fckmap.fr/api/metrics

## 📊 Métriques surveillées

### **Métriques FCK personnalisées**
- `fck_http_requests_total` - Total des requêtes HTTP
- `fck_cities_marked_total` - Nombre de villes marquées
- `fck_friends_added_total` - Nombre d'amis ajoutés
- `fck_auth_attempts_total` - Tentatives d'authentification

### **Métriques système (Node Exporter)**
- CPU, RAM, disque, réseau
- Processus système
- Métriques système Linux/Windows

## 🔧 Configuration

### **Fichiers de configuration**

#### Développement
- `docker-compose.monitoring.yml` - Services Docker (dev)
- `monitoring/prometheus.yml` - Config Prometheus (dev)

#### Production
- `docker-compose.monitoring.prod.yml` - Services Docker (prod)
- `monitoring/prometheus.prod.yml` - Config Prometheus (prod)

### **Dashboards Grafana**
- Dashboard FCK principal : `📊 FCK Métriques Principales`
- Auto-provisioned via `monitoring/grafana/provisioning/`

## 🛑 Arrêt des services

### **Développement**
```bash
docker compose -f docker-compose.monitoring.yml down
```

### **Production**
```bash
docker compose -f docker-compose.monitoring.prod.yml down
```

## 🔒 Sécurité Production

- **HTTPS** configuré pour tous les endpoints
- **Mot de passe Grafana** : `fckmonitor123` (à changer !)
- **Ports exposés** : 9090, 3001, 9100
- **Données persistantes** : Volumes Docker séparés (dev/prod)

## 📈 Utilisation

1. **Lancez le monitoring** avec les scripts fournis
2. **Connectez-vous à Grafana** avec admin/fckmonitor123
3. **Naviguez sur FCK** pour générer des métriques
4. **Surveillez en temps réel** les performances dans Grafana

**Monitoring FCK prêt pour dev ET production ! 🚀**