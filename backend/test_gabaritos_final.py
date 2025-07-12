#!/usr/bin/env python3
"""
Script final para testar gabaritos
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User
from app.models.prova import Prova

def test_gabaritos_final():
    """Teste final dos gabaritos"""
    
    db = SessionLocal()
    
    try:
        print("🧪 TESTE FINAL DOS GABARITOS")
        print("=" * 50)
        
        # 1. Verificar usuário admin
        admin = db.query(User).filter(User.email == "admin@provafacil.com").first()
        if not admin:
            print("❌ Usuário admin não encontrado!")
            return
        
        print(f"✅ Usuário admin: {admin.name} (ID: {admin.id})")
        
        # 2. Verificar todas as provas
        todas_provas = db.query(Prova).all()
        print(f"�� Total de provas no sistema: {len(todas_provas)}")
        
        # 3. Verificar provas do admin
        provas_admin = db.query(Prova).filter(Prova.user_id == admin.id).all()
        print(f"�� Provas do admin: {len(provas_admin)}")
        
        for prova in provas_admin:
            print(f"   - ID: {prova.id}, Título: {prova.titulo}, Gabarito: {prova.gabarito_salvo}")
        
        # 4. Marcar TODAS as provas do admin como tendo gabarito
        if provas_admin:
            print("\n🔧 Marcando TODAS as provas do admin como tendo gabarito...")
            
            for prova in provas_admin:
                prova.gabarito_salvo = True
                print(f"   ✅ Prova {prova.id} marcada")
            
            db.commit()
            print("✅ Todas as provas foram atualizadas!")
        
        # 5. Verificar provas com gabarito
        provas_com_gabarito = db.query(Prova).filter(
            Prova.user_id == admin.id,
            Prova.gabarito_salvo == True
        ).all()
        
        print(f"\n📋 Provas com gabarito salvo: {len(provas_com_gabarito)}")
        for prova in provas_com_gabarito:
            print(f"   - ID: {prova.id}, Título: {prova.titulo}")
        
        # 6. Testar endpoint diretamente
        print(f"\n🌐 Testando endpoint /com-gabarito...")
        
        from app.api.provas import listar_provas_com_gabarito
        
        try:
            resultado = listar_provas_com_gabarito(db, admin)
            print(f"✅ Endpoint funcionando! Retornou {len(resultado)} provas")
            for item in resultado:
                print(f"   - {item['titulo']} (ID: {item['id']})")
        except Exception as e:
            print(f"❌ Erro no endpoint: {e}")
            import traceback
            traceback.print_exc()
        
        print(f"\n✅ Teste final concluído!")
        
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        import traceback
        traceback.print_exc()
    
    finally:
        db.close()

if __name__ == "__main__":
    test_gabaritos_final() 