#!/usr/bin/env python3
"""
Script para corrigir o usuário admin
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User, UserRole
from app.models.prova import Prova
from app.auth.security import get_password_hash

def fix_admin():
    """Corrige o usuário admin"""
    
    db = SessionLocal()
    
    try:
        print("🔍 Verificando usuário admin existente...")
        
        # Buscar usuário admin existente
        admin = db.query(User).filter(User.email == "admin@provafacil.com").first()
        
        if admin:
            print(f"📋 Usuário admin encontrado: ID {admin.id}")
            
            # Verificar se há provas vinculadas
            provas = db.query(Prova).filter(Prova.user_id == admin.id).all()
            print(f"📝 Provas vinculadas ao admin: {len(provas)}")
            
            if provas:
                print("⚠️ Removendo provas vinculadas ao admin...")
                for prova in provas:
                    db.delete(prova)
                db.commit()
                print("✅ Provas removidas")
            
            # Agora remover o usuário admin
            print("️ Removendo usuário admin...")
            db.delete(admin)
            db.commit()
            print("✅ Usuário admin removido")
        
        # Criar novo usuário admin
        print("👤 Criando novo usuário admin...")
        new_admin = User(
            name="Admin Sistema",
            email="admin@provafacil.com",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            is_active=True
        )
        
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        
        print("✅ Novo usuário admin criado com sucesso!")
        print(f"   📧 Email: {new_admin.email}")
        print(f"    Senha: admin123")
        print(f"   👑 Role: {new_admin.role}")
        print(f"   🆔 ID: {new_admin.id}")
        
        # Verificar se o login funciona
        print("\n🧪 Testando verificação de senha...")
        from app.auth.security import verify_password
        is_valid = verify_password("admin123", new_admin.hashed_password)
        print(f"   ✅ Senha válida: {is_valid}")
        
        if is_valid:
            print("\n Login deve funcionar perfeitamente!")
        else:
            print("\n❌ Problema na verificação de senha!")
        
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        db.rollback()
        import traceback
        traceback.print_exc()
    
    finally:
        db.close()

if __name__ == "__main__":
    fix_admin() 