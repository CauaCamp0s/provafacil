#!/usr/bin/env python3
"""
Script para corrigir provas para o usuário correto
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User
from app.models.prova import Prova

def corrigir_provas_usuario():
    """Corrige as provas para o usuário correto"""
    
    db = SessionLocal()
    
    try:
        print("🔧 CORRIGINDO PROVAS PARA O USUÁRIO CORRETO")
        print("=" * 50)
        
        # 1. Verificar usuário correto
        usuario_correto = db.query(User).filter(User.email == "cauacampos258@gmail.com").first()
        if not usuario_correto:
            print("❌ Usuário cauacampos258@gmail.com não encontrado!")
            return
        
        print(f"✅ Usuário correto: {usuario_correto.name} (ID: {usuario_correto.id})")
        
        # 2. Verificar todas as provas
        todas_provas = db.query(Prova).all()
        print(f"�� Total de provas no sistema: {len(todas_provas)}")
        
        for prova in todas_provas:
            print(f"   - ID: {prova.id}, Título: {prova.titulo}, User ID: {prova.user_id}, Gabarito: {prova.gabarito_salvo}")
        
        # 3. Atribuir provas ao usuário correto
        if todas_provas:
            print(f"\n🔧 Atribuindo provas ao usuário {usuario_correto.email}...")
            
            for prova in todas_provas:
                prova.user_id = usuario_correto.id
                prova.gabarito_salvo = True  # Marcar como tendo gabarito
                print(f"   ✅ Prova {prova.id} ({prova.titulo}) atribuída ao usuário {usuario_correto.id}")
            
            db.commit()
            print("✅ Todas as provas foram atribuídas!")
        
        # 4. Verificar provas do usuário correto
        provas_usuario = db.query(Prova).filter(Prova.user_id == usuario_correto.id).all()
        print(f"\n📊 Provas do usuário {usuario_correto.email}: {len(provas_usuario)}")
        
        for prova in provas_usuario:
            print(f"   - ID: {prova.id}, Título: {prova.titulo}, Gabarito: {prova.gabarito_salvo}")
        
        # 5. Verificar provas com gabarito
        provas_com_gabarito = db.query(Prova).filter(
            Prova.user_id == usuario_correto.id,
            Prova.gabarito_salvo == True
        ).all()
        
        print(f"\n📋 Provas com gabarito salvo: {len(provas_com_gabarito)}")
        for prova in provas_com_gabarito:
            print(f"   - ID: {prova.id}, Título: {prova.titulo}")
        
        # 6. Testar endpoint
        print(f"\n🌐 Testando endpoint /com-gabarito...")
        
        from app.api.provas import listar_provas_com_gabarito
        
        try:
            resultado = listar_provas_com_gabarito(db, usuario_correto)
            print(f"✅ Endpoint funcionando! Retornou {len(resultado)} provas")
            for item in resultado:
                print(f"   - {item['titulo']} (ID: {item['id']})")
        except Exception as e:
            print(f"❌ Erro no endpoint: {e}")
            import traceback
            traceback.print_exc()
        
        print(f"\n✅ Correção concluída!")
        print(f"🎯 Agora o usuário {usuario_correto.email} tem {len(provas_com_gabarito)} provas com gabarito")
        
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        import traceback
        traceback.print_exc()
    
    finally:
        db.close()

if __name__ == "__main__":
    corrigir_provas_usuario() 