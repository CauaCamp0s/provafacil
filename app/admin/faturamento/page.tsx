"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { DollarSign, Search, Download, CreditCard, AlertCircle, CheckCircle, Clock, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { adminService } from "@/lib/api"

export default function AdminFaturamento() {
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const [metricas, setMetricas] = useState<any>(null)
  const [transacoes, setTransacoes] = useState<any[]>([])
  const [receitaPorPlano, setReceitaPorPlano] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [metricasRes, transacoesRes, receitaRes] = await Promise.all([
          adminService.getFaturamentoMetricas(),
          adminService.getTransacoes(),
          adminService.getReceitaPorPlano(),
        ])
        setMetricas(metricasRes)
        setTransacoes(transacoesRes)
        setReceitaPorPlano(receitaRes)
      } catch {
        setMetricas(null)
        setTransacoes([])
        setReceitaPorPlano([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredTransacoes = transacoes.filter(
    (transacao) =>
      transacao.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transacao.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transacao.transacaoId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleExportarRelatorio = (tipo: string) => {
    toast({
      title: `Exportando relatório de ${tipo}...`,
      description: "O download começará em instantes.",
    })
  }

  const handleReprocessarPagamento = (transacaoId: string) => {
    toast({
      title: "Reprocessando pagamento...",
      description: `Transação ${transacaoId} será reprocessada.`,
    })
  }

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Carregando faturamento...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Faturamento</h1>
          <p className="text-gray-600 mt-1">Controle financeiro e transações</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportarRelatorio("financeiro")}> <Download className="w-4 h-4 mr-2" /> Exportar </Button>
          <Button> <BarChart3 className="w-4 h-4 mr-2" /> Relatórios </Button>
        </div>
      </div>

      {/* Métricas Financeiras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">R$ {metricas?.receitaTotal?.toLocaleString() ?? '-'}</div>
            <p className="text-sm text-gray-600">Receita Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">R$ {metricas?.receitaMes?.toLocaleString() ?? '-'}</div>
            <p className="text-sm text-gray-600">Este Mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">+{metricas?.crescimento ?? '-'}</div>
            <p className="text-sm text-gray-600">Crescimento</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{metricas?.transacoesPendentes ?? '-'}</div>
            <p className="text-sm text-gray-600">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{metricas?.taxaSucesso ?? '-'}</div>
            <p className="text-sm text-gray-600">Taxa de Sucesso</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transacoes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transacoes">Transações</TabsTrigger>
          <TabsTrigger value="receita">Receita por Plano</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="transacoes" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar transações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de Transações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Transações Recentes
              </CardTitle>
              <CardDescription>{filteredTransacoes.length} transações encontradas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTransacoes.map((transacao) => (
                  <div key={transacao.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{transacao.usuario}</div>
                      <div className="text-xs text-gray-600">{transacao.email} • {transacao.plano}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        transacao.status === "Pago"
                          ? "bg-green-100 text-green-800"
                          : transacao.status === "Pendente"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }>{transacao.status}</Badge>
                      <span className="font-medium">R$ {transacao.valor}</span>
                    </div>
                    <div className="text-xs text-gray-500">{transacao.data}</div>
                    <Button size="sm" variant="outline" onClick={() => handleReprocessarPagamento(transacao.transacaoId)}>
                      <Clock className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receita" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receita por Plano</CardTitle>
              <CardDescription>Receita e usuários por tipo de plano</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {receitaPorPlano.map((plano) => (
                  <div key={plano.plano} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Badge>{plano.plano}</Badge>
                      <span>{plano.usuarios} usuários</span>
                    </div>
                    <span className="font-medium">R$ {plano.receita}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
