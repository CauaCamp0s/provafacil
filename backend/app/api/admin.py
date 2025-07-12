from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from ..database import get_db
from ..models.user import User
from ..models.prova import Prova
from ..models.plano import Plano, Assinatura, StatusAssinatura
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
        Assinatura.status == StatusAssinatura.ATIVA
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

@router.get("/metricas")
def metricas_admin(db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_admin_user)):
    """Métricas principais para o dashboard admin"""
    
    # Estatísticas dos últimos 30 dias
    data_30_dias_atras = datetime.utcnow() - timedelta(days=30)
    data_60_dias_atras = datetime.utcnow() - timedelta(days=60)
    
    # Usuários
    usuarios_ativos = db.query(User).filter(User.is_active == True).count()
    novos_usuarios_mes = db.query(User).filter(
        User.created_at >= data_30_dias_atras
    ).count()
    
    # Provas
    provas_criadas = db.query(Prova).count()
    provas_mes = db.query(Prova).filter(
        Prova.created_at >= data_30_dias_atras
    ).count()
    
    # Receita
    receita_mensal = db.query(Pagamento).filter(
        Pagamento.status == StatusPagamento.APROVADO,
        Pagamento.created_at >= data_30_dias_atras
    ).with_entities(func.sum(Pagamento.valor)).scalar() or 0
    
    # Receita do mês anterior para calcular crescimento
    receita_mes_anterior = db.query(Pagamento).filter(
        Pagamento.status == StatusPagamento.APROVADO,
        Pagamento.created_at >= data_60_dias_atras,
        Pagamento.created_at < data_30_dias_atras
    ).with_entities(func.sum(Pagamento.valor)).scalar() or 0
    
    crescimento_mensal = 0
    if receita_mes_anterior > 0:
        crescimento_mensal = ((receita_mensal - receita_mes_anterior) / receita_mes_anterior) * 100
    
    return {
        "usuariosAtivos": usuarios_ativos,
        "novosUsuariosMes": novos_usuarios_mes,
        "provasCriadas": provas_criadas,
        "provasMes": provas_mes,
        "receitaMensal": float(receita_mensal),
        "crescimentoMensal": round(crescimento_mensal, 1)
    }

@router.get("/planos")
def planos_distribuicao_admin(db: Session = Depends(get_db),
                             current_user: User = Depends(get_current_admin_user)):
    """Distribuição de usuários por plano"""
    
    # Buscar todos os planos com contagem de usuários ativos
    planos_data = db.query(
        Plano.nome,
        Plano.tipo,
        Plano.preco,
        func.count(Assinatura.id).label('usuarios'),
        func.coalesce(func.sum(Pagamento.valor), 0).label('receita')
    ).outerjoin(Assinatura, Assinatura.plano_id == Plano.id).filter(
        Assinatura.status == StatusAssinatura.ATIVA
    ).outerjoin(Pagamento, Pagamento.assinatura_id == Assinatura.id).filter(
        Pagamento.status == StatusPagamento.APROVADO
    ).group_by(Plano.id, Plano.nome, Plano.tipo, Plano.preco).all()
    
    # Se não há dados, retornar planos básicos
    if not planos_data:
        planos_basicos = db.query(Plano).all()
        return [
            {
                "nome": plano.nome,
                "usuarios": 0,
                "receita": 0.0,
                "cor": "gray" if plano.tipo == "gratuito" else "blue"
            }
            for plano in planos_basicos
        ]
    
    # Mapear cores para os planos
    cores_planos = {
        "gratuito": "gray",
        "professor": "blue", 
        "escola": "green"
    }
    
    return [
        {
            "nome": plano.nome,
            "usuarios": plano.usuarios or 0,
            "receita": float(plano.receita or 0),
            "cor": cores_planos.get(plano.tipo, "gray")
        }
        for plano in planos_data
    ]

@router.get("/faturas")
def faturas_recentes_admin(db: Session = Depends(get_db),
                          current_user: User = Depends(get_current_admin_user)):
    """Faturas/pagamentos recentes"""
    
    # Buscar pagamentos recentes com dados do usuário e plano
    pagamentos = db.query(
        Pagamento,
        User.name.label('usuario_nome'),
        User.email.label('usuario_email'),
        Plano.nome.label('plano_nome')
    ).join(User, Pagamento.user_id == User.id).outerjoin(
        Assinatura, Pagamento.assinatura_id == Assinatura.id
    ).outerjoin(
        Plano, Assinatura.plano_id == Plano.id
    ).order_by(Pagamento.created_at.desc()).limit(10).all()
    
    return [
        {
            "id": pagamento.Pagamento.id,
            "usuario": pagamento.usuario_nome,
            "email": pagamento.usuario_email,
            "plano": pagamento.plano_nome or "N/A",
            "valor": float(pagamento.Pagamento.valor),
            "status": pagamento.Pagamento.status.value,
            "data": pagamento.Pagamento.created_at.strftime("%d/%m/%Y %H:%M")
        }
        for pagamento in pagamentos
    ]

@router.get("/usuarios-recentes")
def usuarios_recentes_admin(db: Session = Depends(get_db),
                           current_user: User = Depends(get_current_admin_user)):
    """Usuários recentemente cadastrados"""
    
    # Buscar usuários recentes com dados do plano
    usuarios = db.query(
        User,
        Plano.nome.label('plano_nome')
    ).outerjoin(
        Assinatura, User.id == Assinatura.user_id
    ).outerjoin(
        Plano, Assinatura.plano_id == Plano.id
    ).filter(
        Assinatura.status == StatusAssinatura.ATIVA
    ).order_by(User.created_at.desc()).limit(10).all()
    
    # Se não há usuários com assinaturas, buscar apenas usuários recentes
    if not usuarios:
        usuarios_simples = db.query(User).order_by(User.created_at.desc()).limit(10).all()
        return [
            {
                "id": user.id,
                "nome": user.name,
                "email": user.email,
                "plano": "Gratuito",
                "dataRegistro": user.created_at.strftime("%d/%m/%Y %H:%M")
            }
            for user in usuarios_simples
        ]
    
    return [
        {
            "id": usuario.User.id,
            "nome": usuario.User.name,
            "email": usuario.User.email,
            "plano": usuario.plano_nome or "Gratuito",
            "dataRegistro": usuario.User.created_at.strftime("%d/%m/%Y %H:%M")
        }
        for usuario in usuarios
    ]

@router.get("/usuarios")
def listar_usuarios_admin(db: Session = Depends(get_db),
                         current_user: User = Depends(get_current_admin_user)):
    """Lista todos os usuários"""
    
    usuarios = db.query(User).order_by(User.created_at.desc()).all()
    
    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role.value,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat()
        }
        for user in usuarios
    ]

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
        Assinatura.status == StatusAssinatura.ATIVA
    ).group_by(Plano.nome).all()
    
    return {
        "crescimento_mensal": meses,
        "usuarios_por_plano": [
            {"plano": nome, "usuarios": count} 
            for nome, count in usuarios_por_plano
        ]
    }

@router.post("/usuarios/{user_id}/suspender")
def suspender_usuario_admin(user_id: int, db: Session = Depends(get_db),
                           current_user: User = Depends(get_current_admin_user)):
    """Suspende um usuário"""
    
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível suspender o próprio usuário"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    user.is_active = False
    db.commit()
    
    return {"message": "Usuário suspenso com sucesso"}

@router.post("/usuarios/{user_id}/ativar")
def ativar_usuario_admin(user_id: int, db: Session = Depends(get_db),
                        current_user: User = Depends(get_current_admin_user)):
    """Ativa um usuário"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    user.is_active = True
    db.commit()
    
    return {"message": "Usuário ativado com sucesso"}

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