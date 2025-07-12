"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Users, Search, MoreHorizontal, UserPlus, Mail, Ban, CheckCircle, Download, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { adminService } from "@/lib/api"

export default function AdminUsuarios() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroPlano, setFiltroPlano] = useState("todos")
  const { toast } = useToast()
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [estatisticas, setEstatisticas] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [usuariosRes, estatisticasRes] = await Promise.all([
          adminService.getUsuarios(),
          adminService.getUsuariosEstatisticas(),
        ])
        setUsuarios(usuariosRes)
        setEstatisticas(estatisticasRes)
      } catch {
        setUsuarios([])
        setEstatisticas(null)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredUsuarios = usuarios.filter((usuario) => {
    const matchSearch =
      usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchPlano = filtroPlano === "todos" || usuario.plano.toLowerCase() === filtroPlano.toLowerCase()
    return matchSearch && matchPlano
  })

  const handleEnviarEmail = (email: string) => {
    toast({
      title: "Email enviado!",
      description: `Email enviado para ${email}`,
    })
  }

  const handleSuspenderUsuario = async (id: number) => {
    try {
      await adminService.suspenderUsuario(id)
      toast({ title: "Usuário suspenso", description: `Usuário suspenso com sucesso.`, variant: "destructive" })
    } catch {
      toast({ title: "Erro ao suspender usuário", variant: "destructive" })
    }
  }

  const handleAtivarUsuario = async (id: number) => {
    try {
      await adminService.ativarUsuario(id)
      toast({ title: "Usuário ativado", description: `Usuário reativado com sucesso.` })
    } catch {
      toast({ title: "Erro ao ativar usuário", variant: "destructive" })
    }
  }

  const handleExportarUsuarios = () => {
    toast({
      title: "Exportando usuários...",
      description: "O download começará em instantes.",
    })
  }

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Carregando usuários...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
          <p className="text-gray-600 mt-1">Administre todos os usuários da plataforma</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportarUsuarios}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{estatisticas?.totalUsuarios ?? '-'}</div>
            <p className="text-sm text-gray-600">Total de Usuários</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{estatisticas?.usuariosAtivos ?? '-'}</div>
            <p className="text-sm text-gray-600">Usuários Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{estatisticas?.usuariosPendentes ?? '-'}</div>
            <p className="text-sm text-gray-600">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{estatisticas?.usuariosSuspensos ?? '-'}</div>
            <p className="text-sm text-gray-600">Suspensos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">+{estatisticas?.novosMes ?? '-'}</div>
            <p className="text-sm text-gray-600">Novos este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Plano: {filtroPlano === "todos" ? "Todos" : filtroPlano}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFiltroPlano("todos")}>Todos os Planos</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFiltroPlano("gratuito")}>Gratuito</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFiltroPlano("professor")}>Professor</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFiltroPlano("escola")}>Escola</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Usuários
          </CardTitle>
          <CardDescription>{filteredUsuarios.length} usuários encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsuarios.map((usuario) => (
              <div key={usuario.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{usuario.nome}</div>
                  <div className="text-xs text-gray-600">{usuario.email} • {usuario.plano}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={
                    usuario.status === "Ativo"
                      ? "bg-green-100 text-green-800"
                      : usuario.status === "Pendente"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }>{usuario.status}</Badge>
                  <Button size="sm" variant="outline" onClick={() => handleEnviarEmail(usuario.email)}>
                    <Mail className="w-4 h-4" />
                  </Button>
                  {usuario.status === "Ativo" ? (
                    <Button size="sm" variant="outline" onClick={() => handleSuspenderUsuario(usuario.id)}>
                      <Ban className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleAtivarUsuario(usuario.id)}>
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
