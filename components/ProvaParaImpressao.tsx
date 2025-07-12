import React from "react"

type Questao = {
  id: number
  numero: number
  tipo: string
  enunciado: string
  alternativas?: string[]
}

type ProvaParaImpressaoProps = {
  titulo: string
  disciplina: string
  serie: string
  questoes: Questao[]
}

export default function ProvaParaImpressao({ titulo, disciplina, serie, questoes }: ProvaParaImpressaoProps) {
  return (
    <div className="prova-impressao">
      <h1 className="text-2xl font-bold mb-2">{titulo}</h1>
      <div className="mb-4 text-gray-700">
        <span className="mr-4">Disciplina: {disciplina}</span>
        <span>Série: {serie}</span>
      </div>
      <ol className="space-y-6">
        {questoes.map((questao) => (
          <li key={questao.id} className="border-b pb-4">
            <div className="font-semibold mb-2">{questao.numero}. {questao.enunciado}</div>
            {questao.alternativas && questao.alternativas.length > 0 && (
              <ul className="ml-6 list-disc">
                {questao.alternativas.map((alt, i) => (
                  <li key={i}>{alt}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
} 