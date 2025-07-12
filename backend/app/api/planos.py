from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.user import User
from ..models.plano import Plano, Assinatura, TipoPlano, StatusAssinatura
from ..schemas.plano import PlanoResponse, AssinaturaResponse
from ..auth.dependencies import get_current_active_user, get_current_admin_user
from datetime import datetime
from ..schemas.plano import PlanoCreate

router = APIRouter()

@router.get("/", response_model=List[PlanoResponse])
def listar_planos(db: Session = Depends(get_db)):
    """Lista todos os planos disponíveis"""
    
    planos = db.query(Plano).filter(Plano.is_active == True).all()
    return planos

@router.get("/meu-plano", response_model=AssinaturaResponse)
def obter_meu_plano(db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_active_user)):
    """Obtém o plano atual do usuário"""
    
    assinatura = db.query(Assinatura).filter(
        Assinatura.user_id == current_user.id,
        Assinatura.status == StatusAssinatura.ATIVA
    ).first()
    
    if not assinatura:
        # Retornar plano gratuito padrão
        plano_gratuito = db.query(Plano).filter(Plano.tipo == TipoPlano.GRATUITO).first()
        if not plano_gratuito:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plano gratuito não encontrado"
            )
        
        # Criar assinatura gratuita
        assinatura = Assinatura(
            user_id=current_user.id,
            plano_id=plano_gratuito.id,
            status=StatusAssinatura.ATIVA,
            provas_usadas=0
        )
        db.add(assinatura)
        db.commit()
        db.refresh(assinatura)
    
    return assinatura

@router.post("/{plano_id}/assinar")
def assinar_plano(plano_id: int, db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_active_user)):
    """Inicia processo de assinatura de um plano"""
    
    # Verificar se o plano existe
    plano = db.query(Plano).filter(Plano.id == plano_id).first()
    if not plano:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plano não encontrado"
        )
    
    # Verificar se já tem assinatura ativa
    assinatura_ativa = db.query(Assinatura).filter(
        Assinatura.user_id == current_user.id,
        Assinatura.status == StatusAssinatura.ATIVA
    ).first()
    
    if assinatura_ativa:
        # Cancelar assinatura atual
        assinatura_ativa.status = StatusAssinatura.CANCELADA
        assinatura_ativa.data_fim = datetime.utcnow()
        db.commit()
    
    # Criar nova assinatura
    nova_assinatura = Assinatura(
        user_id=current_user.id,
        plano_id=plano_id,
        status=StatusAssinatura.PENDENTE
    )
    
    db.add(nova_assinatura)
    db.commit()
    db.refresh(nova_assinatura)
    
    # TODO: Integrar com Mercado Pago para processar pagamento
    return {
        "message": "Assinatura criada com sucesso",
        "assinatura_id": nova_assinatura.id,
        "plano": plano.nome,
        "valor": plano.preco
    }

@router.delete("/cancelar")
def cancelar_assinatura(db: Session = Depends(get_db),
                        current_user: User = Depends(get_current_active_user)):
    """Cancela a assinatura atual do usuário"""
    
    assinatura = db.query(Assinatura).filter(
        Assinatura.user_id == current_user.id,
        Assinatura.status == StatusAssinatura.ATIVA
    ).first()
    
    if not assinatura:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhuma assinatura ativa encontrada"
        )
    
    assinatura.status = StatusAssinatura.CANCELADA
    assinatura.data_fim = datetime.utcnow()
    db.commit()
    
    return {"message": "Assinatura cancelada com sucesso"}

# Endpoints administrativos
@router.post("/", response_model=PlanoResponse)
def criar_plano(plano_data: PlanoCreate, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_admin_user)):
    """Cria um novo plano (apenas admin)"""
    
    db_plano = Plano(**plano_data.dict())
    db.add(db_plano)
    db.commit()
    db.refresh(db_plano)
    
    return db_plano

@router.get("/admin/assinaturas", response_model=List[AssinaturaResponse])
def listar_assinaturas_admin(skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
                            current_user: User = Depends(get_current_admin_user)):
    """Lista todas as assinaturas (apenas admin)"""
    
    assinaturas = db.query(Assinatura).offset(skip).limit(limit).all()
    return assinaturas 