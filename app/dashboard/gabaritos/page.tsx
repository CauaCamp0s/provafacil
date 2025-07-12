"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileCheck, Eye, Download, Calendar, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { provasService, Prova } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function Gabaritos() {
  const [provasComGabarito, setProvasComGabarito] = useState<Prova[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchGabaritos = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log(" Buscando gabaritos...")
        
        const data = await provasService.listarProvasComGabarito()
        console.log("📋 Gabaritos encontrados:", data)
        
        setProvasComGabarito(data)
      } catch (error: any) {
        console.error("❌ Erro ao buscar gabaritos:", error)
        setError(error.message || "Erro ao carregar gabaritos")
        setProvasComGabarito([])
        
        toast({
          title: "Erro ao carregar gabaritos",
          description: error.message || "Tente novamente mais tarde",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchGabaritos()
  }, [toast])

  const handleVerGabarito = (provaId: number) => {
    router.push(`/dashboard/gabarito/${provaId}`)
  }

  const handleSalvarGabarito = async (provaId: number) => {
    try {
      await provasService.salvarGabarito(provaId)
      toast({
        title: "Gabarito salvo!",
        description: "O gabarito foi salvo com sucesso.",
      })
      // Recarregar a lista
      const data = await provasService.listarProvasComGabarito()
      setProvasComGabarito(data)
    } catch (error: any) {
      toast({
        title: "Erro ao salvar gabarito",
        description: error.message || "Tente novamente",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Meus Gabaritos</h1>
          <p className="text-gray-600 mt-1">Acesse os gabaritos das suas provas salvas</p>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando gabaritos...</p>
          </div>
        ) : provasComGabarito.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileCheck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">Nenhum gabarito encontrado</p>
            <p className="text-gray-600 mb-4">
              Para ver gabaritos aqui, você precisa salvar gabaritos das suas provas.
            </p>
            <Button onClick={() => router.push("/dashboard/provas-salvas")}>
              Ver Minhas Provas
            </Button>
          </div>
        ) : (
          provasComGabarito.map((prova) => (
            <Card key={prova.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileCheck className="w-5 h-5 mr-2 text-green-600" />
                  {prova.titulo}
                </CardTitle>
                <CardDescription>
                  {prova.disciplina} • {prova.serie} • {prova.numero_questoes} questões
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {new Date(prova.created_at).toLocaleDateString("pt-BR")}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      Gabarito Salvo
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleVerGabarito(prova.id)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" /> Ver Gabarito
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => router.push(`/dashboard/prova/${prova.id}`)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 