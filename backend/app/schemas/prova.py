from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from ..models.prova import TipoQuestao

class QuestaoBase(BaseModel):
    numero: int
    tipo: TipoQuestao
    enunciado: str
    alternativas: Optional[List[str]] = None
    resposta_correta: Optional[str] = None

class QuestaoCreate(QuestaoBase):
    pass

class QuestaoResponse(QuestaoBase):
    id: int
    prova_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class GabaritoBase(BaseModel):
    resposta: str
    explicacao: Optional[str] = None
    pontos: int = 1

class GabaritoResponse(GabaritoBase):
    id: int
    questao_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProvaBase(BaseModel):
    titulo: str
    disciplina: str
    serie: str
    numero_questoes: int
    tipos_questoes: List[str]
    topicos: Optional[str] = None
    tempo_estimado: Optional[str] = None

class ProvaCreate(ProvaBase):
    pass

class ProvaUpdate(BaseModel):
    titulo: Optional[str] = None
    disciplina: Optional[str] = None
    serie: Optional[str] = None
    numero_questoes: Optional[int] = None
    tipos_questoes: Optional[List[str]] = None
    topicos: Optional[str] = None
    tempo_estimado: Optional[str] = None

class ProvaResponse(ProvaBase):
    id: int
    user_id: int
    gabarito_salvo: bool = False  # Adicionar campo gabarito_salvo
    created_at: datetime
    updated_at: Optional[datetime] = None
    questoes: List[QuestaoResponse] = []
    
    class Config:
        from_attributes = True

class ProvaCompletaResponse(ProvaResponse):
    gabaritos: List[GabaritoResponse] = [] 