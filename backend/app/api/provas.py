from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.user import User
from ..models.prova import Prova, Questao, Gabarito, TipoQuestao
from ..schemas.prova import ProvaCreate, ProvaResponse, ProvaCompletaResponse
from ..auth.dependencies import get_current_active_user
from ..services.gemini_service import GeminiService
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

router = APIRouter()
gemini_service = GeminiService()

@router.post("/gerar", response_model=ProvaCompletaResponse)
def gerar_prova(prova_data: ProvaCreate, db: Session = Depends(get_db), 
                current_user: User = Depends(get_current_active_user)):
    """Gera uma nova prova usando IA"""
    
    try:
        # Verificar se pelo menos um tipo de questão foi selecionado
        if not prova_data.tipos_questoes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selecione pelo menos um tipo de questão"
            )
        
        print(f"Gerando prova: {prova_data.titulo}")  # Debug
    
        # Gerar prova usando Gemini AI
        ai_response = gemini_service.gerar_prova(
            disciplina=prova_data.disciplina,
            serie=prova_data.serie,
            tipos_questoes=prova_data.tipos_questoes,
            numero_questoes=prova_data.numero_questoes,
            topicos=prova_data.topicos
        )
        
        print(f"Resposta do Gemini: {ai_response}")  # Debug
    
        if not ai_response["success"]:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao gerar prova: {ai_response['error']}"
            )
        
        # Criar prova no banco
        prova = Prova(
            titulo=prova_data.titulo,
            disciplina=prova_data.disciplina,
            serie=prova_data.serie,
            numero_questoes=prova_data.numero_questoes,
            tipos_questoes=prova_data.tipos_questoes,
            topicos=prova_data.topicos,
            tempo_estimado=prova_data.tempo_estimado,
            user_id=current_user.id,
            gabarito_salvo=False  # Inicialmente False
        )
        
        db.add(prova)
        db.commit()
        db.refresh(prova)
        
        # Criar questões e gabaritos
        questoes_criadas = []
        gabaritos_criados = []
        
        for questao_data in ai_response["prova"]["questoes"]:
            # Criar questão
            questao = Questao(
                numero=questao_data["numero"],
                tipo=questao_data["tipo"],
                enunciado=questao_data["enunciado"],
                alternativas=questao_data.get("alternativas"),
                resposta_correta=questao_data.get("resposta_correta"),
                prova_id=prova.id
            )
            
            db.add(questao)
            db.commit()
            db.refresh(questao)
            questoes_criadas.append(questao)
            
            # Criar gabarito
            gabarito = Gabarito(
                questao_id=questao.id,
                resposta=questao_data.get("resposta_correta", ""),
                explicacao=questao_data.get("explicacao"),
                pontos=1  # Pontos padrão por questão
            )
            
            db.add(gabarito)
            db.commit()
            db.refresh(gabarito)
            gabaritos_criados.append(gabarito)
        
        print(f"Prova finalizada com {len(questoes_criadas)} questões")  # Debug
        
        # Retornar prova completa
        return {
            "id": prova.id,
            "titulo": prova.titulo,
            "disciplina": prova.disciplina,
            "serie": prova.serie,
            "numero_questoes": prova.numero_questoes,
            "tipos_questoes": prova.tipos_questoes,
            "topicos": prova.topicos,
            "tempo_estimado": prova.tempo_estimado,
            "user_id": prova.user_id,
            "created_at": prova.created_at,
            "updated_at": prova.updated_at,
            "questoes": [
                {
                    "id": q.id,
                    "numero": q.numero,
                    "tipo": q.tipo,
                    "enunciado": q.enunciado,
                    "alternativas": q.alternativas,
                    "resposta_correta": q.resposta_correta,
                    "prova_id": q.prova_id,
                    "created_at": q.created_at,
                    "gabarito": {
                        "id": g.id,
                        "questao_id": g.questao_id,
                        "resposta": g.resposta,
                        "explicacao": g.explicacao,
                        "pontos": g.pontos,
                        "created_at": g.created_at
                    } if g else None
                }
                for q, g in zip(questoes_criadas, gabaritos_criados)
            ]
        }
        
    except Exception as e:
        db.rollback()
        print(f"Erro ao gerar prova: {str(e)}")  # Debug
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno ao gerar prova: {str(e)}"
        )

@router.post("/{prova_id}/salvar-gabarito")
def salvar_gabarito(prova_id: int, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_active_user)):
    """Marca uma prova como tendo gabarito salvo"""
    
    # Verificar se a prova existe e pertence ao usuário
    prova = db.query(Prova).filter(
        Prova.id == prova_id,
        Prova.user_id == current_user.id
    ).first()
    
    if not prova:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prova não encontrada"
        )
    
    # Marcar como tendo gabarito salvo
    prova.gabarito_salvo = True
    db.commit()
    
    return {"message": "Gabarito salvo com sucesso"}

@router.get("/{prova_id}/gabarito")
def obter_gabarito(prova_id: int, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_active_user)):
    """Obtém o gabarito de uma prova específica"""
    
    # Verificar se a prova existe e pertence ao usuário
    prova = db.query(Prova).filter(
        Prova.id == prova_id,
        Prova.user_id == current_user.id
    ).first()
    
    if not prova:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prova não encontrada"
        )
    
    # Buscar questões e gabaritos
    questoes = db.query(Questao).filter(Questao.prova_id == prova_id).all()
    gabaritos = []
    
    for questao in questoes:
        gabarito = db.query(Gabarito).filter(Gabarito.questao_id == questao.id).first()
        if gabarito:
            gabaritos.append({
                "questao_numero": questao.numero,
                "resposta": gabarito.resposta,
                "explicacao": gabarito.explicacao
            })
    
    return gabaritos

# MOVER ESTE ENDPOINT PARA ANTES DOS ENDPOINTS COM {prova_id}
@router.get("/com-gabarito")
def listar_provas_com_gabarito(db: Session = Depends(get_db),
                              current_user: User = Depends(get_current_active_user)):
    """Lista provas que têm gabarito salvo"""
    
    try:
        print(f"🔍 Buscando provas com gabarito para usuário {current_user.id}")
        
        # Buscar provas que têm gabaritos
        provas = db.query(Prova).filter(
            Prova.user_id == current_user.id,
            Prova.gabarito_salvo == True
        ).all()
        
        print(f"📋 Encontradas {len(provas)} provas com gabarito")
        
        # Se não há provas, retornar lista vazia
        if not provas:
            print("📭 Nenhuma prova com gabarito encontrada")
            return JSONResponse(content=[])
        
        # Converter para dicionário simples
        resultado = []
        for prova in provas:
            prova_dict = {
                "id": prova.id,
                "titulo": prova.titulo,
                "disciplina": prova.disciplina,
                "serie": prova.serie,
                "numero_questoes": prova.numero_questoes,
                "tipos_questoes": prova.tipos_questoes,
                "topicos": prova.topicos,
                "tempo_estimado": prova.tempo_estimado,
                "user_id": prova.user_id,
                "created_at": prova.created_at.isoformat() if prova.created_at else None,
                "updated_at": prova.updated_at.isoformat() if prova.updated_at else None,
                "gabarito_salvo": prova.gabarito_salvo
            }
            resultado.append(prova_dict)
            print(f"   📝 Prova {prova.id}: {prova.titulo}")
        
        print(f"✅ Retornando {len(resultado)} provas")
        return JSONResponse(content=resultado)
        
    except Exception as e:
        print(f"❌ Erro ao listar provas com gabarito: {str(e)}")
        import traceback
        traceback.print_exc()
        # Retornar lista vazia em caso de erro
        return JSONResponse(content=[])

@router.get("/", response_model=List[ProvaResponse])
def listar_provas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_active_user)):
    """Lista todas as provas do usuário"""
    provas = db.query(Prova).filter(Prova.user_id == current_user.id).offset(skip).limit(limit).all()
    return provas

@router.get("/{prova_id}", response_model=ProvaCompletaResponse)
def obter_prova(prova_id: int, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_active_user)):
    """Obtém uma prova específica com suas questões"""
    
    prova = db.query(Prova).filter(
        Prova.id == prova_id,
        Prova.user_id == current_user.id
    ).first()
    
    if not prova:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prova não encontrada"
        )
    
    questoes = db.query(Questao).filter(Questao.prova_id == prova_id).all()
    
    return {
        "id": prova.id,
        "titulo": prova.titulo,
        "disciplina": prova.disciplina,
        "serie": prova.serie,
        "numero_questoes": prova.numero_questoes,
        "tipos_questoes": prova.tipos_questoes,
        "topicos": prova.topicos,
        "tempo_estimado": prova.tempo_estimado,
        "user_id": prova.user_id,
        "created_at": prova.created_at,
        "updated_at": prova.updated_at,
        "questoes": [
            {
                "id": q.id,
                "numero": q.numero,
                "tipo": q.tipo,
                "enunciado": q.enunciado,
                "alternativas": q.alternativas,
                "resposta_correta": q.resposta_correta,
                "prova_id": q.prova_id,
                "created_at": q.created_at
            }
            for q in questoes
        ]
    }

@router.delete("/{prova_id}")
def deletar_prova(prova_id: int, db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_active_user)):
    """Deleta uma prova e suas questões/gabaritos"""
    
    prova = db.query(Prova).filter(
        Prova.id == prova_id,
        Prova.user_id == current_user.id
    ).first()
    
    if not prova:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prova não encontrada"
        )
    
    # Deletar gabaritos primeiro
    questoes = db.query(Questao).filter(Questao.prova_id == prova_id).all()
    for questao in questoes:
        db.query(Gabarito).filter(Gabarito.questao_id == questao.id).delete()
    
    # Deletar questões
    db.query(Questao).filter(Questao.prova_id == prova_id).delete()
    
    # Deletar prova
    db.delete(prova)
    db.commit()
    
    return {"message": "Prova deletada com sucesso"}

@router.get("/{prova_id}/exportar-pdf")
def exportar_pdf(prova_id: int, db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_active_user)):
    """Exporta uma prova para PDF"""
    
    prova = db.query(Prova).filter(
        Prova.id == prova_id,
        Prova.user_id == current_user.id
    ).first()
    
    if not prova:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prova não encontrada"
        )
    
    # Aqui você implementaria a lógica de geração do PDF
    # Por enquanto, retornamos uma URL fictícia
    return {"download_url": f"/api/v1/provas/{prova_id}/pdf"}
