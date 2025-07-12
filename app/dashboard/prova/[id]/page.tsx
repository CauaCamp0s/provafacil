"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { FileText, Download, Save, Edit, ArrowLeft, CheckCircle, Clock, User, FileCheck, Trash2 } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { provasService, Prova, Questao, Gabarito } from "@/lib/api"
import ProvaParaImpressao from "@/components/ProvaParaImpressao"

export default function ProvaDetalhes() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [prova, setProva] = useState<Prova | null>(null)
  const [loading, setLoading] = useState(true)
  const [salvandoGabarito, setSalvandoGabarito] = useState(false)
  const [confirmacaoTexto, setConfirmacaoTexto] = useState("")
  const [deletando, setDeletando] = useState(false)

  useEffect(() => {
    const fetchProva = async () => {
      try {
        if (params.id) {
          const data = await provasService.obterProva(Number(params.id))
          setProva(data)
          console.log(" Prova carregada:", data)
        }
      } catch (error) {
        console.error("❌ Erro ao carregar prova:", error)
        setProva(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProva()
  }, [params.id])

  const handleSalvarGabarito = async () => {
    if (!prova) return
    
    setSalvandoGabarito(true)
    try {
      console.log("💾 Salvando gabarito para prova:", prova.id)
      
      await provasService.salvarGabarito(prova.id)
      
      // Atualizar o estado da prova localmente
      setProva(prev => prev ? { ...prev, gabarito_salvo: true } : null)
      
      toast({ 
        title: "Gabarito salvo com sucesso!", 
        description: "O gabarito foi salvo separadamente e está disponível em 'Meus Gabaritos'." 
      })
      
      console.log("✅ Gabarito salvo com sucesso!")
      
    } catch (error: any) {
      console.error("❌ Erro ao salvar gabarito:", error)
      toast({ 
        title: "Erro ao salvar gabarito", 
        description: error.message || "Tente novamente.", 
        variant: "destructive" 
      })
    } finally {
      setSalvandoGabarito(false)
    }
  }

  const handleDeletarProva = async () => {
    if (!prova || confirmacaoTexto !== "CONFIRMAR") return
    
    setDeletando(true)
    try {
      await provasService.deletarProva(prova.id)
      toast({ 
        title: "Prova deletada com sucesso!", 
        description: `A prova "${prova.titulo}" foi removida permanentemente.` 
      })
      router.push("/dashboard/provas-salvas")
    } catch (error: any) {
      console.error("Erro ao deletar prova:", error)
      const errorMessage = error.response?.data?.detail || error.message || "Erro desconhecido"
      toast({ 
        title: "Erro ao deletar prova", 
        description: errorMessage,
        variant: "destructive" 
      })
    } finally {
      setDeletando(false)
      setConfirmacaoTexto("")
    }
  }

  // Verificar se o gabarito já foi salvo
  const gabaritoJaSalvo = prova?.gabarito_salvo === true

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Carregando prova...</div>
  }
  if (!prova) {
    return <div className="text-center text-gray-500 mt-10">Prova não encontrada.</div>
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-6">
      <div className="flex justify-between items-center mb-2">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <div className="flex gap-2">
          <Button onClick={() => window.print()} className="print:hidden" variant="outline">
            Imprimir
          </Button>
          
          {/* Botão Salvar Gabarito - sempre visível */}
          <Button 
            onClick={handleSalvarGabarito} 
            className="print:hidden"
            variant={gabaritoJaSalvo ? "secondary" : "outline"}
            disabled={salvandoGabarito}
          >
            {salvandoGabarito ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Salvando...
              </>
            ) : gabaritoJaSalvo ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Gabarito Salvo
              </>
            ) : (
              <>
                <FileCheck className="w-4 h-4 mr-2" />
                Salvar Gabarito
              </>
            )}
          </Button>
          
          {/* Link para Meus Gabaritos se já salvou */}
          {gabaritoJaSalvo && (
            <Button 
              variant="outline" 
              className="print:hidden"
              onClick={() => router.push("/dashboard/gabaritos")}
            >
              <FileCheck className="w-4 h-4 mr-2" />
              Ver Meus Gabaritos
            </Button>
          )}
          
          {/* Botão de Deletar */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="print:hidden">
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar Prova
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja deletar a prova <strong>"{prova.titulo}"</strong>? 
                  Esta ação não pode ser desfeita e todos os dados da prova serão perdidos permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Para confirmar a exclusão, digite <strong>CONFIRMAR</strong> no campo abaixo:
                  </p>
                  <Input
                    placeholder="Digite CONFIRMAR"
                    value={confirmacaoTexto}
                    onChange={(e) => setConfirmacaoTexto(e.target.value)}
                    className="font-mono"
                  />
                </div>
                
                <div className="text-sm text-gray-500">
                  <p>Esta ação irá:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Deletar a prova permanentemente</li>
                    <li>Remover todas as questões associadas</li>
                    <li>Excluir os gabaritos relacionados</li>
                    <li>Esta ação não pode ser desfeita</li>
                  </ul>
                </div>
              </div>
              
              <AlertDialogFooter>
                <AlertDialogCancel 
                  onClick={() => setConfirmacaoTexto("")}
                  disabled={deletando}
                >
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeletarProva}
                  disabled={confirmacaoTexto !== "CONFIRMAR" || deletando}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                >
                  {deletando ? "Deletando..." : "Deletar Permanentemente"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            {prova.titulo}
          </CardTitle>
          <CardDescription>
            {prova.disciplina} • {prova.serie} • {prova.numero_questoes} questões
            {gabaritoJaSalvo && (
              <Badge variant="secondary" className="ml-2">
                <CheckCircle className="w-3 h-3 mr-1" />
                Gabarito Salvo
              </Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <span className="text-gray-600 text-sm">Criada em {new Date(prova.created_at).toLocaleDateString()}</span>
            <span className="text-gray-600 text-sm">Tempo estimado: {prova.tempo_estimado || "-"}</span>
          </div>
          <Separator />
          <div className="space-y-8">
            {prova.questoes && prova.questoes.length > 0 ? (
              prova.questoes.map((questao: Questao, idx: number) => (
                <div key={questao.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">Questão {questao.numero}</Badge>
                    <Badge variant="secondary">{questao.tipo}</Badge>
                  </div>
                  <div className="mb-2 font-medium">{questao.enunciado}</div>
                  {questao.alternativas && (
                    <ul className="ml-4 mb-2 list-disc">
                      {questao.alternativas.map((alt, i) => (
                        <li key={i}>{alt}</li>
                      ))}
                    </ul>
                  )}
                  {/* Respostas e gabaritos NÃO são exibidos aqui */}
                </div>
              ))
            ) : (
              <div className="text-gray-500">Nenhuma questão encontrada.</div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Área de impressão, só aparece no print */}
      <div className="hidden print:block">
        <ProvaParaImpressao
          titulo={prova.titulo}
          disciplina={prova.disciplina}
          serie={prova.serie}
          questoes={prova.questoes || []}
        />
      </div>
    </div>
  )
}
