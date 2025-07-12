from fastapi import APIRouter
from .auth import router as auth_router
from .users import router as users_router
from .provas import router as provas_router
from .planos import router as planos_router
from .pagamentos import router as pagamentos_router
from .admin import router as admin_router

# Criar router principal
api_router = APIRouter(prefix="/api/v1")

# Incluir todos os routers
api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(provas_router, prefix="/provas", tags=["provas"])
api_router.include_router(planos_router, prefix="/planos", tags=["planos"])
api_router.include_router(pagamentos_router, prefix="/pagamentos", tags=["pagamentos"])
api_router.include_router(admin_router, prefix="/admin", tags=["admin"]) 