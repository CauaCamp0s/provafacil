from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Enum, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base
import enum

class TipoQuestao(str, enum.Enum):
    MULTIPLA_ESCOLHA = "multipla_escolha"
    VERDADEIRO_FALSO = "verdadeiro_falso"
    DISSERTATIVA = "dissertativa"

class Prova(Base):
    __tablename__ = "provas"
    
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), nullable=False)
    disciplina = Column(String(100), nullable=False)
    serie = Column(String(50), nullable=False)
    numero_questoes = Column(Integer, nullable=False)
    tipos_questoes = Column(JSON, nullable=False)  # Lista de tipos de questões
    topicos = Column(Text, nullable=True)
    tempo_estimado = Column(String(50), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    gabarito_salvo = Column(Boolean, default=False)  # Novo campo
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relacionamentos
    user = relationship("User", back_populates="provas")
    questoes = relationship("Questao", back_populates="prova", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Prova(id={self.id}, titulo='{self.titulo}', disciplina='{self.disciplina}')>"

class Questao(Base):
    __tablename__ = "questoes"
    
    id = Column(Integer, primary_key=True, index=True)
    numero = Column(Integer, nullable=False)
    tipo = Column(Enum(TipoQuestao), nullable=False)
    enunciado = Column(Text, nullable=False)
    alternativas = Column(JSON, nullable=True)  # Para múltipla escolha
    resposta_correta = Column(Text, nullable=True)  # Para múltipla escolha e V/F
    prova_id = Column(Integer, ForeignKey("provas.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relacionamentos
    prova = relationship("Prova", back_populates="questoes")
    gabarito = relationship("Gabarito", back_populates="questao", uselist=False, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Questao(id={self.id}, numero={self.numero}, tipo='{self.tipo}')>"

class Gabarito(Base):
    __tablename__ = "gabaritos"
    
    id = Column(Integer, primary_key=True, index=True)
    questao_id = Column(Integer, ForeignKey("questoes.id"), nullable=False)
    resposta = Column(Text, nullable=False)
    explicacao = Column(Text, nullable=True)
    pontos = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relacionamentos
    questao = relationship("Questao", back_populates="gabarito")
    
    def __repr__(self):
        return f"<Gabarito(id={self.id}, questao_id={self.questao_id}, resposta='{self.resposta}')>" 