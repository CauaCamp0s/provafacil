from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base
import enum

class StatusPagamento(str, enum.Enum):
    PENDENTE = "pendente"
    APROVADO = "aprovado"
    REJEITADO = "rejeitado"
    CANCELADO = "cancelado"
    ESTORNADO = "estornado"

class TipoPagamento(str, enum.Enum):
    CARTAO_CREDITO = "cartao_credito"
    CARTAO_DEBITO = "cartao_debito"
    PIX = "pix"
    BOLETO = "boleto"

class Pagamento(Base):
    __tablename__ = "pagamentos"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assinatura_id = Column(Integer, ForeignKey("assinaturas.id"), nullable=True)
    valor = Column(Float, nullable=False)
    tipo = Column(Enum(TipoPagamento), nullable=False)
    status = Column(Enum(StatusPagamento), default=StatusPagamento.PENDENTE)
    mercadopago_id = Column(String(100), nullable=True)  # ID da transação no Mercado Pago
    dados_pagamento = Column(JSON, nullable=True)  # Dados completos da transação
    data_pagamento = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relacionamentos
    user = relationship("User", back_populates="pagamentos")
    
    def __repr__(self):
        return f"<Pagamento(id={self.id}, user_id={self.user_id}, valor={self.valor}, status='{self.status}')>" 