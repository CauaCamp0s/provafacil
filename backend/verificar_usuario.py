#!/usr/bin/env python3
"""
Script para verificar e criar o usuário correto
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User, UserRole
from app.auth.security import get_password_hash

def verificar_usuario():
    """Verifica e cria o usuário correto se necessário"""
    
    db = SessionLocal()
    
    try:
        print("�� VERIFICANDO USUÁRIO")
        print("=" * 30)
        
        # Verificar se o usuário existe
        usuario = db.query(User).filter(User.email == "cauacampos258@gmail.com").first()
        
        if usuario:
            print(f"✅ Usuário encontrado:")
            print(f"   - ID: {usuario.id}")
            print(f"   - Nome: {usuario.name}")
            print(f"   - Email: {usuario.email}")
            print(f"   - Role: {usuario.role}")
            print(f"   - Ativo: {usuario.is_active}")
        else:
            print("❌ Usuário não encontrado. Criando...")
            
            # Criar usuário
            novo_usuario = User(
                name="Cauã Campos",
                email="cauacampos258@gmail.com",
                hashed_password=get_password_hash("140610"),
                role=UserRole.USER,
                is_active=True
            )
            
            db.add(novo_usuario)
            db.commit()
            db.refresh(novo_usuario)
            
            print(f"✅ Usuário criado:")
            print(f"   - ID: {novo_usuario.id}")
            print(f"   - Nome: {novo_usuario.name}")
            print(f"   - Email: {novo_usuario.email}")
            print(f"   - Senha: 140610")
        
        # Listar todos os usuários
        print(f"\n📋 Todos os usuários:")
        usuarios = db.query(User).all()
        for user in usuarios:
            print(f"   - ID: {user.id}, Email: {user.email}, Role: {user.role}")
        
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        import traceback
        traceback.print_exc()
    
    finally:
        db.close()

if __name__ == "__main__":
    verificar_usuario() 