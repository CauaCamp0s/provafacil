"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Crown, Zap, CreditCard, Calendar, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { planosService, Plano, Assinatura } from "@/lib/api"

export default function MeuPlano() {
  const [planoAtual, setPlanoAtual] = useState<Assinatura | null>(null)
  const [planosDisponiveis, setPlanosDisponiveis] = useState<Plano[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDados = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Buscar plano atual e planos disponíveis em paralelo
        const [assinatura, planos] = await Promise.all([
          planosService.obterMeuPlano(),
          planosService.listarPlanos()
        ])
        
        setPlanoAtual(assinatura)
        setPlanosDisponiveis(planos)
        
      } catch (error: any) {
        console.error("Erro ao carregar dados do plano:", error)
        setError(error.message || "Erro ao carregar dados do plano")
        
        toast({
          title: "Erro ao carregar dados",
          description: error.message || "Tente novamente mais tarde",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchDados()
  }, [toast])

  const handleUpgrade = async (planoId: number) => {
    try {
      const resultado = await planosService.assinarPlano(planoId)
      toast({
        title: "Assinatura iniciada!",
        description: resultado.message,
      })
      // Recarregar dados
      const assinatura = await planosService.obterMeuPlano()
      setPlanoAtual(assinatura)
    } catch (error: any) {
      toast({
        title: "Erro ao assinar plano",
        description: error.message || "Tente novamente",
        variant: "destructive",
      })
    }
  }

  const handleCancelarPlano = async () => {
    try {
      await planosService.cancelarAssinatura()
      toast({
        title: "Plano cancelado",
        description: "Sua assinatura foi cancelada com sucesso.",
      })
      // Recarregar dados
      const assinatura = await planosService.obterMeuPlano()
      setPlanoAtual(assinatura)
    } catch (error: any) {
      toast({
        title: "Erro ao cancelar plano",
        description: error.message || "Tente novamente",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meu Plano</h1>
          <p className="text-gray-600 mt-1">Carregando dados do seu plano...</p>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meu Plano</h1>
          <p className="text-gray-600 mt-1">Erro ao carregar dados</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      </div>
    )
  }

  const planoInfo = planoAtual?.plano
  const progressoUso = planoInfo ? (planoAtual.provas_usadas / planoInfo.provas_mensais) * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Meu Plano</h1>
        <p className="text-gray-600 mt-1">Gerencie sua assinatura e veja o uso atual</p>
      </div>

      {/* Plano Atual */}
      {planoAtual ? (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center text-blue-900">
                  <Crown className="w-5 h-5 mr-2 text-blue-600" />
                  Plano {planoInfo?.nome || "N/A"}
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Seu plano atual e estatísticas de uso
                </CardDescription>
              </div>
              <Badge className={`${
                planoAtual.status === 'ativa' ? 'bg-green-100 text-green-800' :
                planoAtual.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {planoAtual.status === 'ativa' ? 'Ativo' :
                 planoAtual.status === 'pendente' ? 'Pendente' :
                 'Cancelado'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-900">
                  R$ {planoInfo?.preco?.toFixed(2) || '0.00'}
                </div>
                <div className="text-blue-700">/mês</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-900">
                  {planoAtual.provas_usadas}
                </div>
                <div className="text-blue-700">provas criadas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-900">
                  {planoInfo ? planoInfo.provas_mensais - planoAtual.provas_usadas : 0}
                </div>
                <div className="text-blue-700">provas restantes</div>
              </div>
            </div>

            {planoInfo && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-900">Uso do plano</span>
                  <span className="text-blue-700">
                    {planoAtual.provas_usadas}/{planoInfo.provas_mensais}
                  </span>
                </div>
                <Progress value={progressoUso} className="h-2" />
                {progressoUso > 80 && (
                  <p className="text-sm text-orange-600">
                    ⚠️ Você está próximo do limite do seu plano. Considere fazer upgrade.
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-blue-200">
              <div className="flex items-center text-blue-700">
                <Calendar className="w-4 h-4 mr-2" />
                Próxima cobrança: {new Date(planoAtual.data_inicio).toLocaleDateString("pt-BR")}
              </div>
              <div className="flex gap-2">
                {planoAtual.status === 'ativa' && (
                  <Button variant="outline" size="sm" onClick={handleCancelarPlano}>
                    Cancelar Plano
                  </Button>
                )}
                <Button size="sm">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Gerenciar Pagamento
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-gray-200">
          <CardContent className="text-center py-8">
            <Crown className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum plano ativo</h3>
            <p className="text-gray-600 mb-4">Escolha um plano para começar a usar o ProvaFácil.</p>
          </CardContent>
        </Card>
      )}

      {/* Planos Disponíveis */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Planos Disponíveis</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {planosDisponiveis.map((plano) => (
            <Card 
              key={plano.id} 
              className={`${
                planoAtual?.plano_id === plano.id 
                  ? 'border-blue-500 relative' 
                  : 'border-gray-200 hover:border-gray-300'
              } transition-colors`}
            >
              {planoAtual?.plano_id === plano.id && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  Plano Atual
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plano.nome}</CardTitle>
                <CardDescription>{plano.tipo}</CardDescription>
                <div className="text-3xl font-bold text-gray-900 mt-4">
                  R$ {plano.preco.toFixed(2)}
                </div>
                <div className="text-gray-600">/mês</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm">{plano.provas_mensais} provas por mês</span>
                  </li>
                  {plano.recursos && (
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">{plano.recursos}</span>
                    </li>
                  )}
                </ul>
                <Button 
                  className={`w-full ${
                    planoAtual?.plano_id === plano.id 
                      ? 'bg-blue-500 hover:bg-blue-600' 
                      : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                  }`}
                  onClick={() => handleUpgrade(plano.id)}
                  disabled={planoAtual?.plano_id === plano.id}
                >
                  {planoAtual?.plano_id === plano.id ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Plano Ativo
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      {plano.preco === 0 ? 'Começar Grátis' : 'Assinar Plano'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
