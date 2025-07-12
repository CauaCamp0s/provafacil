#!/usr/bin/env python3
"""
Script para testar a conexão com o banco
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.prova import Prova

def test_db():
    """Testa a conexão com o banco"""
    
    db = SessionLocal()
    
    try:
        # Testar inserção simples
        prova = Prova(
            titulo="Teste",
            disciplina="Teste",
            serie="Teste",
            numero_questoes=1,
            tipos_questoes=["multipla_escolha"],
            user_id=1,
            gabarito_salvo=False
        )
        
        db.add(prova)
        db.commit()
        db.refresh(prova)
        
        print(f"✅ Prova criada com ID: {prova.id}")
        
        # Limpar
        db.delete(prova)
        db.commit()
        print("✅ Prova removida")
        
    except Exception as e:
        print(f"❌ Erro no banco: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    test_db() 