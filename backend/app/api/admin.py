from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from ..database import get_db
from ..models.user import User
from ..models.prova import Prova
from ..models.plano import Plano, Assinatura
from ..models.pagamento import Pagamento, StatusPagamento
from ..auth.dependencies import get_current_admin_user
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/dashboard")
def dashboard_admin(db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_admin_user)):
    """Dashboard administrativo com estatísticas"""
    
    # Estatísticas gerais
    total_usuarios = db.query(User).count()
    usuarios_ativos = db.query(User).filter(User.is_active == True).count()
    total_provas = db.query(Prova).count()
    
    # Estatísticas de pagamentos
    total_pagamentos = db.query(Pagamento).count()
    pagamentos_aprovados = db.query(Pagamento).filter(
        Pagamento.status == StatusPagamento.APROVADO
    ).count()
    valor_total = db.query(Pagamento).filter(
        Pagamento.status == StatusPagamento.APROVADO
    ).with_entities(func.sum(Pagamento.valor)).scalar() or 0
    
    # Estatísticas de planos
    total_assinaturas = db.query(Assinatura).count()
    assinaturas_ativas = db.query(Assinatura).filter(
        Assinatura.status == "ativa"
    ).count()
    
    # Estatísticas dos últimos 30 dias
    data_30_dias_atras = datetime.utcnow() - timedelta(days=30)
    
    usuarios_novos = db.query(User).filter(
        User.created_at >= data_30_dias_atras
    ).count()
    
    provas_novas = db.query(Prova).filter(
        Prova.created_at >= data_30_dias_atras
    ).count()
    
    pagamentos_novos = db.query(Pagamento).filter(
        Pagamento.created_at >= data_30_dias_atras
    ).count()
    
    return {
        "usuarios": {
            "total": total_usuarios,
            "ativos": usuarios_ativos,
            "novos_30_dias": usuarios_novos
        },
        "provas": {
            "total": total_provas,
            "novas_30_dias": provas_novas
        },
        "pagamentos": {
            "total": total_pagamentos,
            "aprovados": pagamentos_aprovados,
            "valor_total": float(valor_total),
            "novos_30_dias": pagamentos_novos,
            "taxa_aprovacao": (pagamentos_aprovados / total_pagamentos * 100) if total_pagamentos > 0 else 0
        },
        "planos": {
            "total_assinaturas": total_assinaturas,
            "assinaturas_ativas": assinaturas_ativas
        }
    }

@router.get("/usuarios/estatisticas")
def estatisticas_usuarios_admin(db: Session = Depends(get_db),
                               current_user: User = Depends(get_current_admin_user)):
    """Estatísticas detalhadas de usuários"""
    
    # Usuários por mês (últimos 12 meses)
    meses = []
    for i in range(12):
        data_inicio = datetime.utcnow() - timedelta(days=30 * (i + 1))
        data_fim = datetime.utcnow() - timedelta(days=30 * i)
        
        count = db.query(User).filter(
            User.created_at >= data_inicio,
            User.created_at < data_fim
        ).count()
        
        meses.append({
            "mes": data_inicio.strftime("%Y-%m"),
            "usuarios": count
        })
    
    # Usuários por plano
    usuarios_por_plano = db.query(
        Plano.nome,
        func.count(Assinatura.id).label('count')
    ).join(Assinatura).filter(
        Assinatura.status == "ativa"
    ).group_by(Plano.nome).all()
    
    return {
        "crescimento_mensal": meses,
        "usuarios_por_plano": [
            {"plano": nome, "usuarios": count} 
            for nome, count in usuarios_por_plano
        ]
    }

@router.get("/provas/estatisticas")
def estatisticas_provas_admin(db: Session = Depends(get_db),
                             current_user: User = Depends(get_current_admin_user)):
    """Estatísticas detalhadas de provas"""
    
    # Provas por mês (últimos 12 meses)
    meses = []
    for i in range(12):
        data_inicio = datetime.utcnow() - timedelta(days=30 * (i + 1))
        data_fim = datetime.utcnow() - timedelta(days=30 * i)
        
        count = db.query(Prova).filter(
            Prova.created_at >= data_inicio,
            Prova.created_at < data_fim
        ).count()
        
        meses.append({
            "mes": data_inicio.strftime("%Y-%m"),
            "provas": count
        })
    
    # Provas por disciplina
    provas_por_disciplina = db.query(
        Prova.disciplina,
        func.count(Prova.id).label('count')
    ).group_by(Prova.disciplina).all()
    
    return {
        "crescimento_mensal": meses,
        "provas_por_disciplina": [
            {"disciplina": disciplina, "provas": count} 
            for disciplina, count in provas_por_disciplina
        ]
    }

@router.get("/sistema/status")
def status_sistema(db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_admin_user)):
    """Status do sistema e saúde dos serviços"""
    
    try:
        # Testar conexão com banco
        db.execute("SELECT 1")
        db_status = "online"
    except Exception:
        db_status = "offline"
    
    # Verificar serviços externos
    # TODO: Implementar verificações de Gemini AI e Mercado Pago
    
    return {
        "database": {
            "status": db_status,
            "timestamp": datetime.utcnow().isoformat()
        },
        "gemini_ai": {
            "status": "online",  # TODO: Implementar verificação real
            "timestamp": datetime.utcnow().isoformat()
        },
        "mercadopago": {
            "status": "online",  # TODO: Implementar verificação real
            "timestamp": datetime.utcnow().isoformat()
        }
    }