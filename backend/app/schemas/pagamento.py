from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from ..models.pagamento import StatusPagamento, TipoPagamento

class PagamentoBase(BaseModel):
    valor: float
    tipo: TipoPagamento
    assinatura_id: Optional[int] = None

class PagamentoCreate(PagamentoBase):
    pass

class PagamentoResponse(PagamentoBase):
    id: int
    user_id: int
    status: StatusPagamento
    mercadopago_id: Optional[str] = None
    dados_pagamento: Optional[Dict[str, Any]] = None
    data_pagamento: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class PagamentoWebhook(BaseModel):
    data: Dict[str, Any]
    type: str 