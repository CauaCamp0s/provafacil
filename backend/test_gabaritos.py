#!/usr/bin/env python3
"""
Script para testar e criar provas com gabarito
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User
from app.models.prova import Prova
from app.models.questao import Questao
from app.models.gabarito import Gabarito

def test_gabaritos():
    """Testa e cria provas com gabarito"""
    
    db = SessionLocal()
    
    try:
        print(" Testando gabaritos...")
        
        # 1. Verificar usuário admin
        admin = db.query(User).filter(User.email == "admin@provafacil.com").first()
        if not admin:
            print("❌ Usuário admin não encontrado!")
            return
        
        print(f"✅ Usuário admin encontrado: {admin.name}")
        
        # 2. Verificar provas existentes
        provas = db.query(Prova).filter(Prova.user_id == admin.id).all()
        print(f" Provas existentes: {len(provas)}")
        
        for prova in provas:
            print(f"   - ID: {prova.id}, Título: {prova.titulo}, Gabarito salvo: {prova.gabarito_salvo}")
        
        # 3. Marcar algumas provas como tendo gabarito salvo
        if provas:
            print("\n🔧 Marcando provas como tendo gabarito salvo...")
            
            for i, prova in enumerate(provas[:3]):  # Marcar as 3 primeiras
                prova.gabarito_salvo = True
                print(f"   ✅ Prova {prova.id} ({prova.titulo}) marcada como tendo gabarito")
            
            db.commit()
            print("✅ Provas atualizadas!")
        
        # 4. Verificar provas com gabarito
        provas_com_gabarito = db.query(Prova).filter(
            Prova.user_id == admin.id,
            Prova.gabarito_salvo == True
        ).all()
        
        print(f"\n📊 Provas com gabarito salvo: {len(provas_com_gabarito)}")
        for prova in provas_com_gabarito:
            print(f"   - ID: {prova.id}, Título: {prova.titulo}")
        
        # 5. Testar endpoint
        print(f"\n🌐 Testando endpoint /com-gabarito...")
        
        # Simular requisição
        from app.api.provas import listar_provas_com_gabarito
        from app.auth.dependencies import get_current_active_user
        
        # Mock da função de dependência
        def mock_get_current_user():
            return admin
        
        # Substituir temporariamente
        import app.api.provas as provas_module
        original_get_current_active_user = provas_module.get_current_active_user
        provas_module.get_current_active_user = mock_get_current_user
        
        try:
            resultado = listar_provas_com_gabarito(db, admin)
            print(f"✅ Endpoint funcionando! Retornou {len(resultado)} provas")
            for item in resultado:
                print(f"   - {item['titulo']} (ID: {item['id']})")
        except Exception as e:
            print(f"❌ Erro no endpoint: {e}")
        finally:
            # Restaurar função original
            provas_module.get_current_active_user = original_get_current_active_user
        
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        import traceback
        traceback.print_exc()
    
    finally:
        db.close()

if __name__ == "__main__":
    test_gabaritos() 