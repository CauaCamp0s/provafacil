"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Server,
  Database,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  Activity,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  RefreshCw,
  Download,
  Settings,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { adminService } from "@/lib/api"

export default function AdminSistema() {
  const { toast } = useToast()
  const [status, setStatus] = useState<any>(null)
  const [recursos, setRecursos] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [statusRes, recursosRes, logsRes] = await Promise.all([
          adminService.getStatusSistema(),
          adminService.getRecursosSistema(),
          adminService.getLogsSistema(),
        ])
        setStatus(statusRes)
        setRecursos(recursosRes)
        setLogs(logsRes)
      } catch {
        setStatus(null)
        setRecursos(null)
        setLogs([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleReiniciarServico = (servico: string) => {
    toast({
      title: `Reiniciando ${servico}...`,
      description: "O serviço será reiniciado em alguns segundos.",
    })
  }

  const handleBackup = () => {
    toast({
      title: "Backup iniciado",
      description: "O backup do sistema foi iniciado.",
    })
  }

  const handleExportarLogs = () => {
    toast({
      title: "Exportando logs...",
      description: "O download começará em instantes.",
    })
  }

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Carregando status do sistema...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema</h1>
          <p className="text-gray-600 mt-1">Monitoramento e administração do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBackup}>
            <Download className="w-4 h-4 mr-2" />
            Backup
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">Status dos Serviços</TabsTrigger>
          <TabsTrigger value="recursos">Recursos</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="w-5 h-5 mr-2" />
                  Status dos Serviços
                </CardTitle>
                <CardDescription>Estado atual de todos os serviços</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {status?.map((servico: any) => (
                  <div key={servico.nome} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">{servico.nome}</span>
                      <span className="text-sm text-gray-600">{servico.info}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={servico.status === "Online" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {servico.status}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => handleReiniciarServico(servico.nome)}>
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recursos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recursos do Sistema</CardTitle>
              <CardDescription>Consumo atual dos recursos do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recursos && Object.entries(recursos).map(([nome, info]: any) => (
                <div key={nome}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{nome.toUpperCase()}</span>
                    <span>{info.usage}%</span>
                  </div>
                  <Progress value={info.usage} className="h-2" />
                  <div className="text-xs text-gray-600 mt-1">Total: {info.total} • Disponível: {info.available || info.current || '-'} </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs do Sistema</CardTitle>
              <CardDescription>Últimos eventos e atividades do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">{log.timestamp}</span>
                    <Badge className={log.level === "ERROR" ? "bg-red-100 text-red-800" : log.level === "WARNING" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>{log.level}</Badge>
                    <span className="font-medium">{log.service}</span>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="mt-4" onClick={handleExportarLogs}>
                <Download className="w-4 h-4 mr-2" />
                Exportar Logs
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
