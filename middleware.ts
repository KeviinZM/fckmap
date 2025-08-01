import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const start = Date.now()
  const method = request.method
  const route = request.nextUrl.pathname

  // Continuer avec la requête
  const response = NextResponse.next()

  // Log simple pour le monitoring (on utilisera les métriques dans l'API route)
  const duration = (Date.now() - start) / 1000
  
  // Log pour debug (sera collecté par Prometheus via l'endpoint /api/metrics)
  console.log(`[FCK] ${method} ${route} ${response.status} - ${duration}s`)

  return response
}

export const config = {
  matcher: [
    // Matcher toutes les routes sauf les assets statiques
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}