"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  CreditCard,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { adminService } from "@/lib/api"

export default function AdminDashboard() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [metricas, setMetricas] = useState<any>(null)
  const [planos, setPlanos] = useState<any[]>([])
  const [faturas, setFaturas] = useState<any[]>([])
  const [usuariosRecentes, setUsuariosRecentes] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [metricasRes, planosRes, faturasRes, usuariosRes] = await Promise.all([
          adminService.getMetricas(),
          adminService.getPlanosDistribuicao(),
          adminService.getFaturasRecentes(),
          adminService.getUsuariosRecentes(),
        ])
        setMetricas(metricasRes)
        setPlanos(planosRes)
        setFaturas(faturasRes)
        setUsuariosRecentes(usuariosRes)
      } catch {
        setMetricas(null)
        setPlanos([])
        setFaturas([])
        setUsuariosRecentes([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleExportarRelatorio = (tipo: string) => {
    toast({
      title: `Exportando relatório de ${tipo}...`,
      description: "O download começará em instantes.",
    })
  }

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Carregando dados do admin...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600 mt-1">Visão geral completa do sistema ProvaFácil</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportarRelatorio("completo")}> <Download className="w-4 h-4 mr-2" /> Exportar Relatório </Button>
          <Button> <BarChart3 className="w-4 h-4 mr-2" /> Analytics </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas?.usuariosAtivos?.toLocaleString() ?? '-'}</div>
            <p className="text-xs text-muted-foreground">+{metricas?.novosUsuariosMes ?? '-'} novos este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Provas Criadas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas?.provasCriadas?.toLocaleString() ?? '-'}</div>
            <p className="text-xs text-muted-foreground">+{metricas?.provasMes ?? '-'} este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {metricas?.receitaMensal?.toLocaleString() ?? '-'}</div>
            <p className="text-xs text-muted-foreground">+{metricas?.crescimentoMensal ?? '-'}% vs mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{metricas?.crescimentoMensal ?? '-'}</div>
            <p className="text-xs text-muted-foreground">Taxa de crescimento mensal</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição de Planos */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Planos</CardTitle>
          <CardDescription>Usuários e receita por tipo de plano</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {planos.map((plano) => (
              <div key={plano.nome} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge className={`bg-${plano.cor}-100 text-${plano.cor}-800`}>{plano.nome}</Badge>
                  <span>{plano.usuarios} usuários</span>
                </div>
                <span className="font-medium">R$ {plano.receita}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Faturas Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Faturas Recentes</CardTitle>
          <CardDescription>Pagamentos e status recentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {faturas.map((fatura) => (
              <div key={fatura.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{fatura.usuario}</div>
                  <div className="text-xs text-gray-600">{fatura.email} • {fatura.plano}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={
                    fatura.status === "Pago"
                      ? "bg-green-100 text-green-800"
                      : fatura.status === "Pendente"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }>{fatura.status}</Badge>
                  <span className="font-medium">R$ {fatura.valor}</span>
                </div>
                <div className="text-xs text-gray-500">{fatura.data}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usuários Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários Recentes</CardTitle>
          <CardDescription>Novos usuários cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {usuariosRecentes.map((usuario) => (
              <div key={usuario.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{usuario.nome}</div>
                  <div className="text-xs text-gray-600">{usuario.email} • {usuario.plano}</div>
                </div>
                <div className="text-xs text-gray-500">{usuario.dataRegistro}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
