"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Eye, EyeOff, Info } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authService, setAuthToken } from "@/lib/api"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [registerMode, setRegisterMode] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await authService.login(email, password)
      setAuthToken(response.access_token)
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando...",
      })
      // Buscar usuário para saber se é admin
      const user = await authService.getCurrentUser()
      if (user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Email ou senha incorretos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await authService.register(name, email, password)
      toast({
        title: "Conta criada com sucesso!",
        description: "Faça login para continuar.",
      })
      setRegisterMode(false)
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Verifique os dados e tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">ProvaFácil</span>
          </Link>
        </div>

        <Tabs defaultValue={registerMode ? "register" : "login"} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" onClick={() => setRegisterMode(false)}>Entrar</TabsTrigger>
            <TabsTrigger value="register" onClick={() => setRegisterMode(true)}>Criar Conta</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Entrar</CardTitle>
                <CardDescription>Faça login para acessar sua conta.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
                  </div>
                  <div>
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required />
                      <button type="button" className="absolute right-2 top-2" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Criar Conta</CardTitle>
                <CardDescription>Preencha os dados para criar sua conta.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required autoFocus />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required />
                      <button type="button" className="absolute right-2 top-2" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Criando..." : "Criar Conta"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
