"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  fallback?: React.ReactNode
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  requireAdmin = false, 
  fallback = null 
}: AuthGuardProps) {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // Se requer autenticação mas não está logado
      if (requireAuth && !user) {
        router.push('/login')
        return
      }

      // Se requer admin mas não é admin
      if (requireAdmin && !isAdmin) {
        router.push('/dashboard')
        return
      }
    }
  }, [user, isAdmin, loading, requireAuth, requireAdmin, router])

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Se requer autenticação mas não está logado
  if (requireAuth && !user) {
    return fallback || null
  }

  // Se requer admin mas não é admin
  if (requireAdmin && !isAdmin) {
    return fallback || null
  }

  return <>{children}</>
} 