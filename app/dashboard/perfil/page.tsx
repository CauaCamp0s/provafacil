"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { authService, usersService, User } from "@/lib/api"

export default function Perfil() {
  const [user, setUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const [form, setForm] = useState({ name: "", email: "", password: "" })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = await authService.getCurrentUser()
        setUser(u)
        setForm({ name: u.name, email: u.email, password: "" })
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
      const updated = await usersService.atualizarPerfil({
        name: form.name,
        email: form.email,
        password: form.password || undefined,
      })
      setUser(updated)
      setIsEditing(false)
      setForm({ ...form, password: "" })
      toast({ title: "Perfil atualizado!", description: "Suas informações foram salvas com sucesso." })
    } catch (error: any) {
      toast({ title: "Erro ao atualizar perfil", description: error.message || "Tente novamente.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
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
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave() }}>
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} disabled={!isEditing} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} disabled={!isEditing} required />
            </div>
            <div>
              <Label htmlFor="password">Nova Senha</Label>
              <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} disabled={!isEditing} placeholder="Deixe em branco para não alterar" />
            </div>
            <div className="flex gap-2 mt-4">
              {isEditing ? (
                <>
                  <Button type="submit" disabled={isSaving}>{isSaving ? "Salvando..." : "Salvar"}</Button>
                  <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setForm({ name: user.name, email: user.email, password: "" }) }}>Cancelar</Button>
                </>
              ) : (
                <Button type="button" onClick={() => setIsEditing(true)}>Editar Perfil</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
