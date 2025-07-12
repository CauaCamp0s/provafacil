from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.user import User
from ..schemas.user import UserUpdate, UserResponse
from ..auth.dependencies import get_current_active_user, get_current_admin_user
from ..auth.security import get_password_hash, verify_password

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Obtém informações do usuário atual"""
    return current_user

@router.put("/me", response_model=UserResponse)
def update_current_user(user_data: UserUpdate, db: Session = Depends(get_db),
                        current_user: User = Depends(get_current_active_user)):
    """Atualiza informações do usuário atual"""
    
    if user_data.name is not None:
        current_user.name = user_data.name
    
    if user_data.email is not None:
        # Verificar se email já existe
        existing_user = db.query(User).filter(
            User.email == user_data.email,
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já está em uso"
            )
        current_user.email = user_data.email
    
    if user_data.password is not None:
        current_user.hashed_password = get_password_hash(user_data.password)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.put("/me/password", response_model=UserResponse)
def update_current_user_password(
    password_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Atualiza a senha do usuário atual"""
    
    current_password = password_data.get("current_password")
    new_password = password_data.get("new_password")
    
    if not current_password or not new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha atual e nova senha são obrigatórias"
        )
    
    # Verificar senha atual
    if not verify_password(current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha atual incorreta"
        )
    
    # Atualizar senha
    current_user.hashed_password = get_password_hash(new_password)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

# Endpoints administrativos
@router.get("/admin/todos", response_model=List[UserResponse])
def listar_usuarios_admin(skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
                          current_user: User = Depends(get_current_admin_user)):
    """Lista todos os usuários (apenas admin)"""
    
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/admin/{user_id}", response_model=UserResponse)
def obter_usuario_admin(user_id: int, db: Session = Depends(get_db),
                        current_user: User = Depends(get_current_admin_user)):
    """Obtém um usuário específico (apenas admin)"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    return user

@router.put("/admin/{user_id}", response_model=UserResponse)
def atualizar_usuario_admin(user_id: int, user_data: UserUpdate, db: Session = Depends(get_db),
                           current_user: User = Depends(get_current_admin_user)):
    """Atualiza um usuário (apenas admin)"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    if user_data.name is not None:
        user.name = user_data.name
    
    if user_data.email is not None:
        # Verificar se email já existe
        existing_user = db.query(User).filter(
            User.email == user_data.email,
            User.id != user_id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já está em uso"
            )
        user.email = user_data.email
    
    if user_data.password is not None:
        user.hashed_password = get_password_hash(user_data.password)
    
    db.commit()
    db.refresh(user)
    
    return user

@router.delete("/admin/{user_id}")
def deletar_usuario_admin(user_id: int, db: Session = Depends(get_db),
                          current_user: User = Depends(get_current_admin_user)):
    """Deleta um usuário (apenas admin)"""
    
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível deletar o próprio usuário"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    db.delete(user)
    db.commit()
    
    return {"message": "Usuário deletado com sucesso"} 