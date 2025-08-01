import { NextRequest, NextResponse } from 'next/server'
import { register } from 'prom-client'
import { 
  httpRequestsTotal, 
  httpRequestDuration, 
  activeUsers, 
  citiesMarked, 
  friendsAdded, 
  authAttempts 
} from '@/lib/metrics'

// Note: On évite collectDefaultMetrics() pour l'Edge Runtime
// Les métriques sont importées depuis lib/metrics.ts

export async function GET(request: NextRequest) {
  try {
    const metrics = await register.metrics()
    
    return new NextResponse(metrics, {
      headers: {
        'Content-Type': register.contentType
      }
    })
  } catch (error) {
    console.error('Error generating metrics:', error)
    return new NextResponse('Error generating metrics', { status: 500 })
  }
}