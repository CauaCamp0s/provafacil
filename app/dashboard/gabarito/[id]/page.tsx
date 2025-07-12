"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileCheck, ArrowLeft, CheckCircle } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { provasService } from "@/lib/api"

interface GabaritoItem {
  questao_numero: number
  resposta: string
  explicacao?: string
}

export default function GabaritoDetalhes() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [gabarito, setGabarito] = useState<GabaritoItem[]>([])
  const [prova, setProva] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGabarito = async () => {
      try {
        if (params.id) {
          const [gabaritoData, provaData] = await Promise.all([
            provasService.obterGabarito(Number(params.id)),
            provasService.obterProva(Number(params.id))
          ])
          setGabarito(gabaritoData)
          setProva(provaData)
        }
      } catch (error) {
        toast({ 
          title: "Erro ao carregar gabarito", 
          description: "Gabarito não encontrado ou não disponível.", 
          variant: "destructive" 
        })
        router.push("/dashboard/gabaritos")
      } finally {
        setLoading(false)
      }
    }
    fetchGabarito()
  }, [params.id, router, toast])

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Carregando gabarito...</div>
  }

  if (!prova || !gabarito.length) {
    return <div className="text-center text-gray-500 mt-10">Gabarito não encontrado.</div>
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-6">
      <div className="flex justify-between items-center mb-2">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <Button onClick={() => window.print()} className="print:hidden" variant="outline">
          Imprimir Gabarito
        </Button>
      </div>
      
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileCheck className="w-5 h-5 mr-2 text-green-600" />
            Gabarito - {prova.titulo}
          </CardTitle>
          <CardDescription>
            {prova.disciplina} • {prova.serie} • {prova.numero_questoes} questões
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <span className="text-gray-600 text-sm">
              Prova criada em {new Date(prova.created_at).toLocaleDateString()}
            </span>
            <Badge variant="outline" className="text-green-600 border-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Gabarito Salvo
            </Badge>
          </div>
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Respostas Corretas:</h3>
            <div className="space-y-3">
              {gabarito.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">Questão {item.questao_numero}</Badge>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium text-green-800">Resposta: </span>
                    <span className="text-green-700">{item.resposta}</span>
                  </div>
                  {item.explicacao && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Explicação: </span>
                      {item.explicacao}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Área de impressão do gabarito */}
      <div className="hidden print:block">
        <div className="gabarito-impressao">
          <h1 className="text-2xl font-bold mb-2 text-center">GABARITO</h1>
          <h2 className="text-xl font-semibold mb-4 text-center">{prova.titulo}</h2>
          <div className="mb-6 text-center text-gray-700">
            <span className="mr-4">Disciplina: {prova.disciplina}</span>
            <span>Série: {prova.serie}</span>
          </div>
          
          <div className="space-y-4">
            {gabarito.map((item, index) => (
              <div key={index} className="border-b pb-3">
                <div className="font-semibold mb-1">
                  Questão {item.questao_numero}: {item.resposta}
                </div>
                {item.explicacao && (
                  <div className="text-sm text-gray-600 ml-4">
                    {item.explicacao}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 