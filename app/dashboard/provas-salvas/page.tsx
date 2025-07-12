"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { FileText, Search, MoreHorizontal, Download, Eye, Trash2, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { provasService, Prova } from "@/lib/api"

export default function ProvasSalvas() {
  const [provas, setProvas] = useState<Prova[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [provaParaDeletar, setProvaParaDeletar] = useState<Prova | null>(null)
  const [confirmacaoTexto, setConfirmacaoTexto] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchProvas = async () => {
      try {
        const data = await provasService.listarProvas()
        setProvas(data)
      } catch (error) {
        setProvas([])
      } finally {
        setLoading(false)
      }
    }
    fetchProvas()
  }, [])

  const filteredProvas = provas.filter((prova) =>
    prova.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prova.disciplina.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async () => {
    if (!provaParaDeletar || confirmacaoTexto !== "CONFIRMAR") return
    
    try {
      await provasService.deletarProva(provaParaDeletar.id)
      setProvas((prev) => prev.filter((p) => p.id !== provaParaDeletar.id))
      toast({ title: "Prova deletada com sucesso!" })
      setProvaParaDeletar(null)
      setConfirmacaoTexto("")
    } catch {
      toast({ title: "Erro ao deletar prova", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Provas Salvas</h1>
        <Input
          placeholder="Buscar prova..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-64"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-gray-500">Carregando provas...</div>
        ) : filteredProvas.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">Nenhuma prova encontrada.</div>
        ) : (
          filteredProvas.map((prova) => (
            <Card key={prova.id}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  {prova.titulo}
                </CardTitle>
                <CardDescription>
                  {prova.disciplina} • {prova.serie} • {prova.numero_questoes} questões
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">
                    Criada em {new Date(prova.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => router.push(`/dashboard/prova/${prova.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" /> Ver
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setProvaParaDeletar(prova)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Deletar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja deletar a prova "{prova.titulo}"? 
                            Esta ação não pode ser desfeita.
                            <br /><br />
                            Para confirmar, digite <strong>CONFIRMAR</strong> no campo abaixo:
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                          <Input
                            placeholder="Digite CONFIRMAR"
                            value={confirmacaoTexto}
                            onChange={(e) => setConfirmacaoTexto(e.target.value)}
                          />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel 
                            onClick={() => {
                              setProvaParaDeletar(null)
                              setConfirmacaoTexto("")
                            }}
                          >
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDelete}
                            disabled={confirmacaoTexto !== "CONFIRMAR"}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Deletar Prova
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
