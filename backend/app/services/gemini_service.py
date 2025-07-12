import google.generativeai as genai
from typing import List, Dict, Any
from ..config import settings
import json

class GeminiService:
    def __init__(self):
        genai.configure(api_key=settings.gemini_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    def gerar_prova(self, disciplina: str, serie: str, tipos_questoes: List[str], 
                   numero_questoes: int, topicos: str = None) -> Dict[str, Any]:
        """Gera uma prova completa usando Gemini AI"""
        
        # Construir prompt para o Gemini
        prompt = self._construir_prompt_prova(
            disciplina, serie, tipos_questoes, numero_questoes, topicos
        )
        
        try:
            response = self.model.generate_content(prompt)
            
            # Parsear a resposta do Gemini
            prova_data = self._parsear_resposta_prova(response.text)
            
            return {
                "success": True,
                "prova": prova_data,
                "model_used": "gemini-2.0-flash-exp"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "model_used": "gemini-2.0-flash-exp"
            }
    
    def _construir_prompt_prova(self, disciplina: str, serie: str, 
                              tipos_questoes: List[str], numero_questoes: int, 
                              topicos: str = None) -> str:
        """Constrói o prompt para geração da prova"""
        
        prompt = f"""
        Você é um professor especialista em {disciplina} para {serie}.
        
        Crie uma prova completa com {numero_questoes} questões seguindo estas especificações:
        
        Disciplina: {disciplina}
        Série: {serie}
        Número de questões: {numero_questoes}
        Tipos de questões: {', '.join(tipos_questoes)}
        {f'Tópicos específicos: {topicos}' if topicos else ''}
        
        Para cada questão, forneça:
        1. Número da questão
        2. Tipo da questão
        3. Enunciado claro e objetivo
        4. Alternativas (para múltipla escolha)
        5. Resposta correta
        6. Explicação detalhada da resposta
        
        Responda em formato JSON válido com a seguinte estrutura:
        {{
            "questoes": [
                {{
                    "numero": 1,
                    "tipo": "multipla_escolha",
                    "enunciado": "Pergunta aqui?",
                    "alternativas": ["A) Opção 1", "B) Opção 2", "C) Opção 3", "D) Opção 4"],
                    "resposta_correta": "B",
                    "explicacao": "Explicação detalhada da resposta"
                }}
            ]
        }}
        
        Certifique-se de que:
        - As questões são apropriadas para o nível da série
        - As alternativas são plausíveis
        - As explicações são educativas
        - O JSON é válido e bem formatado
        """
        
        return prompt
    
    def _parsear_resposta_prova(self, resposta: str) -> Dict[str, Any]:
        """Parseia a resposta do Gemini para extrair os dados da prova"""
        try:
            # Tentar extrair JSON da resposta
            inicio = resposta.find('{')
            fim = resposta.rfind('}') + 1
            
            if inicio != -1 and fim != 0:
                json_str = resposta[inicio:fim]
                return json.loads(json_str)
            else:
                raise ValueError("JSON não encontrado na resposta")
                
        except json.JSONDecodeError as e:
            raise ValueError(f"Erro ao parsear JSON: {e}")
        except Exception as e:
            raise ValueError(f"Erro ao processar resposta: {e}")
    
    def gerar_explicacao_questao(self, questao: str, resposta: str) -> str:
        """Gera explicação para uma questão específica"""
        prompt = f"""
        Questão: {questao}
        Resposta: {resposta}
        
        Forneça uma explicação educativa e detalhada sobre por que esta é a resposta correta.
        A explicação deve ser clara e ajudar no aprendizado.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Erro ao gerar explicação: {str(e)}" 