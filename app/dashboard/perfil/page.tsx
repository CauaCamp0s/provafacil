"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { authService, usersService, User } from "@/lib/api"

export default function Perfil() {
  const [user, setUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    currentPassword: "", 
    newPassword: "", 
    confirmPassword: "" 
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = await authService.getCurrentUser()
        setUser(u)
        setForm({ 
          name: u.name, 
          email: u.email, 
          currentPassword: "", 
          newPassword: "", 
          confirmPassword: "" 
        })
      } catch {
        setUser(null)
      }
    }
    fetchUser()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // Validar se as senhas coincidem (se estiver alterando senha)
      if (form.newPassword && form.newPassword !== form.confirmPassword) {
        toast({ 
          title: "Erro de validação", 
          description: "As senhas não coincidem.", 
          variant: "destructive" 
        })
        setIsSaving(false)
        return
      }

      // Validar se a senha atual foi fornecida quando há nova senha
      if (form.newPassword && !form.currentPassword) {
        toast({ 
          title: "Erro de validação", 
          description: "Digite sua senha atual para alterar a senha.", 
          variant: "destructive" 
        })
        setIsSaving(false)
        return
      }

      // Atualizar dados básicos
      const updated = await usersService.atualizarPerfil({
        name: form.name,
        email: form.email,
      })
      
      // Se há nova senha, atualizar senha
      if (form.newPassword) {
        await usersService.atualizarSenha({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        })
      }
      
      setUser(updated)
      setIsEditing(false)
      setForm({ 
        ...form, 
        currentPassword: "", 
        newPassword: "", 
        confirmPassword: "" 
      })
      toast({ 
        title: "Perfil atualizado!", 
        description: "Suas informações foram salvas com sucesso." 
      })
    } catch (error: any) {
      toast({ 
        title: "Erro ao atualizar perfil", 
        description: error.message || "Tente novamente.", 
        variant: "destructive" 
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setForm({ 
      name: user?.name || "", 
      email: user?.email || "", 
      currentPassword: "", 
      newPassword: "", 
      confirmPassword: "" 
    })
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  if (!user) {
    return <div className="text-center text-gray-500 mt-10">Carregando perfil...</div>
  }

  return (
    <div className="max-w-xl mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Meu Perfil</CardTitle>
          <CardDescription>Gerencie suas informações pessoais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input 
                id="name" 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                disabled={!isEditing} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={form.email} 
                onChange={handleChange} 
                disabled={!isEditing} 
                required 
              />
            </div>
            
            {isEditing && (
              <>
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium">Alterar Senha</Label>
                  <p className="text-xs text-gray-500 mb-3">Deixe em branco para não alterar</p>
                </div>
                
                <div>
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <Input 
                    id="currentPassword" 
                    name="currentPassword" 
                    type="password" 
                    value={form.currentPassword} 
                    onChange={handleChange} 
                    placeholder="Digite sua senha atual"
                  />
                </div>
                
                <div>
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input 
                    id="newPassword" 
                    name="newPassword" 
                    type="password" 
                    value={form.newPassword} 
                    onChange={handleChange} 
                    placeholder="Digite a nova senha"
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    type="password" 
                    value={form.confirmPassword} 
                    onChange={handleChange} 
                    placeholder="Confirme a nova senha"
                  />
                </div>
              </>
            )}
            
            <div className="flex gap-2 mt-4">
              {isEditing ? (
                <>
                  <Button 
                    type="button" 
                    onClick={handleSave} 
                    disabled={isSaving}
                  >
                    {isSaving ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button type="button" onClick={handleEdit}>
                  Editar Perfil
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
