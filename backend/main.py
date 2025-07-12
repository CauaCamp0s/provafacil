from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import engine
from app.models import Base
from app.api import api_router

# Criar tabelas no banco
Base.metadata.create_all(bind=engine)

# Criar aplicação FastAPI
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="API do ProvaFácil - Sistema de criação de provas com IA",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers da API
app.include_router(api_router)

@app.get("/")
async def root():
    """Endpoint raiz da API"""
    return {
        "message": "Bem-vindo à API do ProvaFácil!",
        "version": settings.app_version,
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
async def health_check():
    """Endpoint de verificação de saúde da API"""
    return {
        "status": "healthy",
        "timestamp": "2024-01-15T10:00:00Z",
        "version": settings.app_version
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Handler global para exceções não tratadas"""
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Erro interno do servidor",
            "message": str(exc) if settings.debug else "Algo deu errado"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    ) 