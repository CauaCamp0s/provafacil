"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Plus } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { provasService, Prova } from "@/lib/api"

export default function Dashboard() {
  const [provas, setProvas] = useState<Prova[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchProvas = async () => {
      try {
        const data = await provasService.listarProvas()
        setProvas(data)
        if (data.length === 0) {
          toast({
            title: "Nenhuma prova encontrada",
            description: "Crie sua primeira prova para começar!",
          })
        }
      } catch (error) {
        setProvas([])
        toast({
          title: "Erro ao carregar provas",
          description: "Tente novamente mais tarde.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchProvas()
  }, [toast])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Bem-vindo de volta! Vamos criar algumas provas hoje?</p>
        </div>
        <Link href="/dashboard/criar-prova">
          <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Prova
          </Button>
        </Link>
      </div>

      {/* Provas Recentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-gray-500">Carregando provas...</div>
        ) : provas.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">Nenhuma prova encontrada.</div>
        ) : (
          provas.map((prova) => (
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
                  <span className="text-gray-600 text-sm">Criada em {new Date(prova.created_at).toLocaleDateString()}</span>
                  <Link href={`/dashboard/prova/${prova.id}`} className="text-blue-600 hover:underline text-sm">
                    Ver detalhes
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
