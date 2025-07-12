"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext } from "react"
import { authService, setAuthToken, removeAuthToken, getAuthToken, User } from "@/lib/api"

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar autenticação ao carregar
    const checkAuth = async () => {
      try {
        const token = getAuthToken()
        if (token) {
          // Verificar se o token ainda é válido
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        // Token inválido, remover do localStorage
        removeAuthToken()
        localStorage.removeItem("user")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Fazer login na API
      const response = await authService.login(email, password)
      
      // Salvar token
      setAuthToken(response.access_token)
      
      // Buscar dados do usuário
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      
      // Salvar usuário no localStorage para persistência
      localStorage.setItem("user", JSON.stringify(currentUser))
      
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      throw new Error("Email ou senha incorretos")
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    removeAuthToken()
    localStorage.removeItem("user")
    setUser(null)
  }

  const isAdmin = user?.role === "admin"

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
