import { Counter, Histogram, Gauge } from 'prom-client'

// Métriques personnalisées pour FCK
export const httpRequestsTotal = new Counter({
  name: 'fck_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
})

export const httpRequestDuration = new Histogram({
  name: 'fck_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.5, 1, 2, 5]
})

export const activeUsers = new Gauge({
  name: 'fck_active_users_total',
  help: 'Number of currently active users'
})

export const citiesMarked = new Counter({
  name: 'fck_cities_marked_total',
  help: 'Total number of cities marked by users'
})

export const friendsAdded = new Counter({
  name: 'fck_friends_added_total',
  help: 'Total number of friends added'
})

export const authAttempts = new Counter({
  name: 'fck_auth_attempts_total',
  help: 'Total number of authentication attempts',
  labelNames: ['method', 'result'] // method: email/google, result: success/failure
})