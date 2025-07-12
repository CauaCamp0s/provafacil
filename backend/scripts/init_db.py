#!/usr/bin/env python3
"""
Script para inicializar o banco de dados com dados padrão
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine
from app.models import Base, User, Plano, Assinatura
from app.auth.security import get_password_hash
from app.models.user import UserRole
from app.models.plano import TipoPlano, StatusAssinatura

def init_db():
    """Inicializa o banco de dados com dados padrão"""
    
    # FORÇAR recriação das tabelas
    print("️ Removendo tabelas existentes...")
    Base.metadata.drop_all(bind=engine)
    
    print("🏗️ Criando novas tabelas...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        print("📝 Inicializando dados padrão...")
        
        # Criar usuário admin
        admin_user = User(
            name="Admin Sistema",
            email="admin@provafacil.com",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin_user)
        
        # Criar usuário de teste
        test_user = User(
            name="Professor Silva",
            email="professor@teste.com",
            hashed_password=get_password_hash("teste123"),
            role=UserRole.USER,
            is_active=True
        )
        db.add(test_user)
        
        # Criar planos padrão
        plano_gratuito = Plano(
            nome="Gratuito",
            tipo=TipoPlano.GRATUITO,
            preco=0.0,
            provas_mensais=5,
            recursos="Provas básicas, Export PDF, Questões múltipla escolha"
        )
        db.add(plano_gratuito)
        
        plano_professor = Plano(
            nome="Professor",
            tipo=TipoPlano.PROFESSOR,
            preco=29.90,
            provas_mensais=50,
            recursos="Todas as funcionalidades, Export Word, Questões avançadas, Suporte prioritário"
        )
        db.add(plano_professor)
        
        plano_escola = Plano(
            nome="Escola",
            tipo=TipoPlano.ESCOLA,
            preco=99.90,
            provas_mensais=200,
            recursos="Todas as funcionalidades, Múltiplos professores, Relatórios avançados, API access"
        )
        db.add(plano_escola)
        
        db.commit()
        
        # Criar assinatura gratuita para usuário de teste
        assinatura_gratuita = Assinatura(
            user_id=test_user.id,
            plano_id=plano_gratuito.id,
            status=StatusAssinatura.ATIVA,
            provas_usadas=0
        )
        db.add(assinatura_gratuita)
        
        db.commit()
        
        print("✅ Banco de dados inicializado com sucesso!")
        print("\nUsuários criados:")
        print(f"  Admin: admin@provafacil.com / admin123")
        print(f"  Teste: professor@teste.com / teste123")
        print("\nPlanos criados:")
        print(f"  Gratuito: R$ 0,00 - 5 provas/mês")
        print(f"  Professor: R$ 29,90 - 50 provas/mês")
        print(f"  Escola: R$ 99,90 - 200 provas/mês")
        
    except Exception as e:
        print(f"❌ Erro ao inicializar banco: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db() 