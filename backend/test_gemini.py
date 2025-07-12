#!/usr/bin/env python3
"""
Script para testar o serviço Gemini
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.gemini_service import GeminiService

def test_gemini():
    """Testa o serviço Gemini"""
    
    gemini_service = GeminiService()
    
    try:
        response = gemini_service.gerar_prova(
            disciplina="Matemática",
            serie="7º ano",
            tipos_questoes=["multipla_escolha"],
            numero_questoes=2,
            topicos="Sistema de numeração decimal"
        )
        
        print("Resposta do Gemini:")
        print(response)
        
        if response["success"]:
            print("✅ Gemini funcionando corretamente!")
        else:
            print(f"❌ Erro no Gemini: {response['error']}")
            
    except Exception as e:
        print(f"❌ Erro ao testar Gemini: {e}")

if __name__ == "__main__":
    test_gemini() 