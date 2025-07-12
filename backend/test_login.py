#!/usr/bin/env python3
"""
Script para testar o login e identificar problemas
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User
from app.auth.security import verify_password, get_password_hash
from app.api.auth import login
from fastapi.security import OAuth2PasswordRequestForm

def test_login():
    """Testa o processo de login"""
    
    db = SessionLocal()
    
    try:
        print("🔍 Testando login...")
        
        # 1. Verificar se existem usuários no banco
        users = db.query(User).all()
        print(f"📊 Usuários encontrados: {len(users)}")
        
        for user in users:
            print(f"  - ID: {user.id}, Email: {user.email}, Role: {user.role}, Ativo: {user.is_active}")
        
        # 2. Testar com usuário específico
        test_email = "admin@provafacil.com"
        test_password = "admin123"
        
        print(f"\n�� Testando login com: {test_email}")
        
        # Buscar usuário
        user = db.query(User).filter(User.email == test_email).first()
        
        if not user:
            print("❌ Usuário não encontrado!")
            return
        
        print(f"✅ Usuário encontrado: {user.name}")
        print(f"   - ID: {user.id}")
        print(f"   - Email: {user.email}")
        print(f"   - Role: {user.role}")
        print(f"   - Ativo: {user.is_active}")
        print(f"   - Hash da senha: {user.hashed_password[:20]}...")
        
        # 3. Testar verificação de senha
        print(f"\n🔑 Testando verificação de senha...")
        
        # Gerar hash da senha de teste
        test_hash = get_password_hash(test_password)
        print(f"   - Hash gerado para '{test_password}': {test_hash[:20]}...")
        
        # Verificar senha
        is_valid = verify_password(test_password, user.hashed_password)
        print(f"   - Senha válida: {is_valid}")
        
        # 4. Testar com senha incorreta
        is_invalid = verify_password("senha_errada", user.hashed_password)
        print(f"   - Senha incorreta válida: {is_invalid}")
        
        if is_valid:
            print("✅ Login deve funcionar!")
        else:
            print("❌ Problema na verificação de senha!")
            
            # Recriar hash da senha
            print("\n🔄 Recriando hash da senha...")
            new_hash = get_password_hash(test_password)
            user.hashed_password = new_hash
            db.commit()
            print("✅ Hash atualizado!")
            
            # Testar novamente
            is_valid_now = verify_password(test_password, user.hashed_password)
            print(f"   - Senha válida após atualização: {is_valid_now}")
        
    except Exception as e:
        print(f"❌ Erro durante teste: {str(e)}")
        import traceback
        traceback.print_exc()
    
    finally:
        db.close()

if __name__ == "__main__":
    test_login() 