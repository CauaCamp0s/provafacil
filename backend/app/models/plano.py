from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base
import enum

class TipoPlano(str, enum.Enum):
    GRATUITO = "gratuito"
    PROFESSOR = "professor"
    ESCOLA = "escola"

class StatusAssinatura(str, enum.Enum):
    ATIVA = "ativa"
    CANCELADA = "cancelada"
    PENDENTE = "pendente"
    EXPIRADA = "expirada"

class Plano(Base):
    __tablename__ = "planos"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    tipo = Column(Enum(TipoPlano), nullable=False)
    preco = Column(Float, nullable=False)
    provas_mensais = Column(Integer, nullable=False)
    recursos = Column(String(500), nullable=True)  # JSON string com recursos
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relacionamentos
    assinaturas = relationship("Assinatura", back_populates="plano")
    
    def __repr__(self):
        return f"<Plano(id={self.id}, nome='{self.nome}', tipo='{self.tipo}')>"

class Assinatura(Base):
    __tablename__ = "assinaturas"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plano_id = Column(Integer, ForeignKey("planos.id"), nullable=False)
    status = Column(Enum(StatusAssinatura), default=StatusAssinatura.ATIVA)
    data_inicio = Column(DateTime(timezone=True), server_default=func.now())
    data_fim = Column(DateTime(timezone=True), nullable=True)
    provas_usadas = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relacionamentos
    user = relationship("User", back_populates="assinaturas")
    plano = relationship("Plano", back_populates="assinaturas")
    
    def __repr__(self):
        return f"<Assinatura(id={self.id}, user_id={self.user_id}, plano_id={self.plano_id}, status='{self.status}')>" 