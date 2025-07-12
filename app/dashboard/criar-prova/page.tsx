"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { provasService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function CriarProva() {
  const [titulo, setTitulo] = useState("")
  const [disciplina, setDisciplina] = useState("")
  const [serie, setSerie] = useState("")
  const [numeroQuestoes, setNumeroQuestoes] = useState(10)
  const [descricao, setDescricao] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const [tiposQuestoes, setTiposQuestoes] = useState<string[]>([])
  const [topicos, setTopicos] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações
    if (!titulo.trim()) {
      toast({ title: "Erro", description: "Digite um título para a prova", variant: "destructive" })
      return
    }
    
    if (!disciplina.trim()) {
      toast({ title: "Erro", description: "Digite uma disciplina", variant: "destructive" })
      return
    }
    
    if (!serie.trim()) {
      toast({ title: "Erro", description: "Digite uma série", variant: "destructive" })
      return
    }
    
    if (tiposQuestoes.length === 0) {
      toast({ title: "Erro", description: "Selecione pelo menos um tipo de questão", variant: "destructive" })
      return
    }
    
    setLoading(true)
    setLoadingMessage("Criando prova...")
    
    try {
      // Mostrar mensagens de progresso
      setTimeout(() => setLoadingMessage("Gerando questões com IA..."), 2000)
      setTimeout(() => setLoadingMessage("Salvando no banco de dados..."), 5000)
      
      const prova = await provasService.gerarProva({
        titulo: titulo.trim(),
        disciplina: disciplina.trim(),
        serie: serie.trim(),
        numero_questoes: numeroQuestoes,
        tipos_questoes: tiposQuestoes,
        topicos: topicos.trim() || undefined,
      })
      
      toast({ 
        title: "Prova criada com sucesso!", 
        description: `A prova "${prova.titulo}" foi criada com ${prova.numero_questoes} questões.` 
      })
      
      router.push(`/dashboard/prova/${prova.id}`)
    } catch (error: any) {
      console.error("Erro ao criar prova:", error)
      
      let errorMessage = "Erro desconhecido"
      
      if (error.message) {
        errorMessage = error.message
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "A requisição demorou muito. Tente novamente."
      }
      
      toast({ 
        title: "Erro ao criar prova", 
        description: errorMessage,
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
      setLoadingMessage("")
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Criar Nova Prova</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              placeholder="Título da prova"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              required
              disabled={loading}
            />
            <Input
              placeholder="Disciplina"
              value={disciplina}
              onChange={e => setDisciplina(e.target.value)}
              required
              disabled={loading}
            />
            <Input
              placeholder="Série"
              value={serie}
              onChange={e => setSerie(e.target.value)}
              required
              disabled={loading}
            />
            <Input
              type="number"
              placeholder="Número de questões"
              value={numeroQuestoes}
              onChange={e => setNumeroQuestoes(Number(e.target.value))}
              min={1}
              required
              disabled={loading}
            />
            <div className="space-y-2">
              <label className="block font-medium">Tipos de Questões *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1">
                  <input 
                    type="checkbox" 
                    checked={tiposQuestoes.includes("multipla_escolha")} 
                    onChange={e => setTiposQuestoes(q => e.target.checked ? [...q, "multipla_escolha"] : q.filter(t => t !== "multipla_escolha"))} 
                    disabled={loading}
                  />
                  Múltipla Escolha
                </label>
                <label className="flex items-center gap-1">
                  <input 
                    type="checkbox" 
                    checked={tiposQuestoes.includes("verdadeiro_falso")} 
                    onChange={e => setTiposQuestoes(q => e.target.checked ? [...q, "verdadeiro_falso"] : q.filter(t => t !== "verdadeiro_falso"))} 
                    disabled={loading}
                  />
                  Verdadeiro/Falso
                </label>
                <label className="flex items-center gap-1">
                  <input 
                    type="checkbox" 
                    checked={tiposQuestoes.includes("dissertativa")} 
                    onChange={e => setTiposQuestoes(q => e.target.checked ? [...q, "dissertativa"] : q.filter(t => t !== "dissertativa"))} 
                    disabled={loading}
                  />
                  Dissertativa
                </label>
              </div>
            </div>
            <Textarea
              placeholder="Tópicos (opcional)"
              value={topicos}
              onChange={e => setTopicos(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {loadingMessage || "Criando..."}
                </div>
              ) : (
                "Criar Prova"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
