#!/usr/bin/env python3
"""
Script para debug detalhado do login
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User
from app.auth.security import verify_password, get_password_hash, create_access_token
from datetime import timedelta
from app.config import settings

def debug_login():
    """Debug detalhado do processo de login"""
    
    db = SessionLocal()
    
    try:
        print("�� DEBUG DETALHADO DO LOGIN")
        print("=" * 50)
        
        # 1. Verificar usuário admin
        admin = db.query(User).filter(User.email == "admin@provafacil.com").first()
        
        if not admin:
            print("❌ Usuário admin não encontrado!")
            return
        
        print(f"✅ Usuário encontrado:")
        print(f"   - ID: {admin.id}")
        print(f"   - Email: {admin.email}")
        print(f"   - Nome: {admin.name}")
        print(f"   - Role: {admin.role}")
        print(f"   - Ativo: {admin.is_active}")
        print(f"   - Hash: {admin.hashed_password[:30]}...")
        
        # 2. Testar senha
        test_password = "admin123"
        print(f"\n�� Testando senha: '{test_password}'")
        
        is_valid = verify_password(test_password, admin.hashed_password)
        print(f"   - Senha válida: {is_valid}")
        
        if not is_valid:
            print("❌ PROBLEMA: Senha inválida!")
            
            # Recriar hash
            print("🔄 Recriando hash...")
            new_hash = get_password_hash(test_password)
            admin.hashed_password = new_hash
            db.commit()
            print(f"   - Novo hash: {new_hash[:30]}...")
            
            # Testar novamente
            is_valid_now = verify_password(test_password, admin.hashed_password)
            print(f"   - Senha válida após correção: {is_valid_now}")
        
        # 3. Testar criação de token
        print(f"\n🎫 Testando criação de token...")
        
        try:
            access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
            access_token = create_access_token(
                data={
                    "sub": admin.email,
                    "user_id": admin.id,
                    "role": admin.role.value
                },
                expires_delta=access_token_expires
            )
            
            print(f"   - Token criado: {access_token[:30]}...")
            print(f"   - Tamanho do token: {len(access_token)}")
            
            # 4. Simular resposta de login
            login_response = {
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": settings.access_token_expire_minutes * 60
            }
            
            print(f"\n📤 Resposta de login simulada:")
            print(f"   - access_token: {login_response['access_token'][:30]}...")
            print(f"   - token_type: {login_response['token_type']}")
            print(f"   - expires_in: {login_response['expires_in']}")
            
        except Exception as e:
            print(f"❌ Erro ao criar token: {str(e)}")
        
        # 5. Verificar configurações
        print(f"\n⚙️ Configurações:")
        print(f"   - SECRET_KEY: {settings.secret_key[:20]}...")
        print(f"   - ALGORITHM: {settings.algorithm}")
        print(f"   - ACCESS_TOKEN_EXPIRE_MINUTES: {settings.access_token_expire_minutes}")
        
        print(f"\n✅ Debug concluído!")
        
    except Exception as e:
        print(f"❌ Erro durante debug: {str(e)}")
        import traceback
        traceback.print_exc()
    
    finally:
        db.close()

if __name__ == "__main__":
    debug_login() 