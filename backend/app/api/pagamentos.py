from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from ..database import get_db
from ..models.user import User
from ..models.pagamento import Pagamento, StatusPagamento, TipoPagamento
from ..models.plano import Assinatura, StatusAssinatura
from ..schemas.pagamento import PagamentoCreate, PagamentoResponse, PagamentoWebhook
from ..auth.dependencies import get_current_active_user, get_current_admin_user
from ..services.mercadopago_service import MercadoPagoService
from datetime import datetime

router = APIRouter()
mercadopago_service = MercadoPagoService()

@router.post("/criar", response_model=PagamentoResponse)
def criar_pagamento(pagamento_data: PagamentoCreate, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_active_user)):
    """Cria um novo pagamento"""
    
    # Verificar se existe assinatura pendente
    if pagamento_data.assinatura_id:
        assinatura = db.query(Assinatura).filter(
            Assinatura.id == pagamento_data.assinatura_id,
            Assinatura.user_id == current_user.id
        ).first()
        
        if not assinatura:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assinatura não encontrada"
            )
    
    # Criar pagamento no Mercado Pago
    mp_response = mercadopago_service.criar_pagamento(
        valor=pagamento_data.valor,
        descricao=f"Pagamento ProvaFácil - {current_user.name}",
        email_pagador=current_user.email,
        tipo_pagamento=pagamento_data.tipo,
        external_reference=f"user_{current_user.id}_assinatura_{pagamento_data.assinatura_id or 'none'}"
    )
    
    if not mp_response["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar pagamento: {mp_response['error']}"
        )
    
    # Salvar pagamento no banco
    db_pagamento = Pagamento(
        user_id=current_user.id,
        assinatura_id=pagamento_data.assinatura_id,
        valor=pagamento_data.valor,
        tipo=pagamento_data.tipo,
        mercadopago_id=str(mp_response["payment_id"]),
        dados_pagamento=mp_response["payment_data"]
    )
    
    db.add(db_pagamento)
    db.commit()
    db.refresh(db_pagamento)
    
    return {
        **db_pagamento.__dict__,
        "init_point": mp_response.get("init_point"),
        "sandbox_init_point": mp_response.get("sandbox_init_point")
    }

@router.get("/", response_model=List[PagamentoResponse])
def listar_pagamentos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_active_user)):
    """Lista pagamentos do usuário"""
    
    pagamentos = db.query(Pagamento).filter(Pagamento.user_id == current_user.id)\
        .offset(skip).limit(limit).all()
    
    return pagamentos

@router.get("/{pagamento_id}", response_model=PagamentoResponse)
def obter_pagamento(pagamento_id: int, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_active_user)):
    """Obtém um pagamento específico"""
    
    pagamento = db.query(Pagamento).filter(
        Pagamento.id == pagamento_id,
        Pagamento.user_id == current_user.id
    ).first()
    
    if not pagamento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pagamento não encontrado"
        )
    
    return pagamento

@router.post("/webhooks/mercadopago")
async def webhook_mercadopago(request: Request, db: Session = Depends(get_db)):
    """Webhook para receber notificações do Mercado Pago"""
    
    try:
        # Obter dados do webhook
        webhook_data = await request.json()
        
        # Processar webhook
        resultado = mercadopago_service.processar_webhook(webhook_data)
        
        if resultado["success"]:
            # Atualizar pagamento no banco
            pagamento = db.query(Pagamento).filter(
                Pagamento.mercadopago_id == str(resultado["payment_id"])
            ).first()
            
            if pagamento:
                pagamento.status = resultado["status"]
                pagamento.dados_pagamento = resultado["payment_data"]
                
                # Se pagamento aprovado, ativar assinatura
                if resultado["status"] == StatusPagamento.APROVADO and pagamento.assinatura_id:
                    assinatura = db.query(Assinatura).filter(
                        Assinatura.id == pagamento.assinatura_id
                    ).first()
                    
                    if assinatura:
                        assinatura.status = StatusAssinatura.ATIVA
                        assinatura.data_inicio = datetime.utcnow()
                
                pagamento.data_pagamento = datetime.utcnow()
                db.commit()
        
        return {"status": "success"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar webhook: {str(e)}"
        )

# Endpoints administrativos
@router.get("/admin/todos", response_model=List[PagamentoResponse])
def listar_todos_pagamentos_admin(skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
                                 current_user: User = Depends(get_current_admin_user)):
    """Lista todos os pagamentos (apenas admin)"""
    
    pagamentos = db.query(Pagamento).offset(skip).limit(limit).all()
    return pagamentos

@router.get("/admin/estatisticas")
def estatisticas_pagamentos_admin(db: Session = Depends(get_db),
                                 current_user: User = Depends(get_current_admin_user)):
    """Estatísticas de pagamentos (apenas admin)"""
    
    total_pagamentos = db.query(Pagamento).count()
    pagamentos_aprovados = db.query(Pagamento).filter(
        Pagamento.status == StatusPagamento.APROVADO
    ).count()
    
    valor_total = db.query(Pagamento).filter(
        Pagamento.status == StatusPagamento.APROVADO
    ).with_entities(func.sum(Pagamento.valor)).scalar() or 0
    
    return {
        "total_pagamentos": total_pagamentos,
        "pagamentos_aprovados": pagamentos_aprovados,
        "valor_total": float(valor_total),
        "taxa_aprovacao": (pagamentos_aprovados / total_pagamentos * 100) if total_pagamentos > 0 else 0
    }

 