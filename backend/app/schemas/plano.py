from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.plano import TipoPlano, StatusAssinatura

class PlanoBase(BaseModel):
    nome: str
    tipo: TipoPlano
    preco: float
    provas_mensais: int
    recursos: Optional[str] = None

class PlanoCreate(PlanoBase):
    pass

class PlanoResponse(PlanoBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class AssinaturaBase(BaseModel):
    plano_id: int
    status: StatusAssinatura = StatusAssinatura.ATIVA
    provas_usadas: int = 0

class AssinaturaCreate(AssinaturaBase):
    pass

class AssinaturaResponse(AssinaturaBase):
    id: int
    user_id: int
    data_inicio: datetime
    data_fim: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    plano: PlanoResponse
    
    class Config:
        from_attributes = True 