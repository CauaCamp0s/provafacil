from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Database
    database_url: str = "mysql+pymysql://provafacil:provafacil123@localhost:3306/provafacil_db"
    
    # JWT
    secret_key: str = "your-super-secret-key-change-in-production-2024"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Gemini AI
    gemini_key: str = "AIzaSyDLLAvoi0nSgcnYiyY6aEf3pJ18VCKwtak"
    
    # Mercado Pago
    mercado_pago_access_token: str = "TEST-1234567890123456789012345678901234567890"
    mercado_pago_public_key: str = "TEST-12345678-1234-1234-1234-123456789012"
    
    # App
    app_name: str = "ProvaFácil API"
    app_version: str = "1.0.0"
    debug: bool = True
    cors_origins: List[str] = [
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://127.0.0.1:3000", 
        "http://127.0.0.1:3001"
    ]
    
    # Security
    bcrypt_rounds: int = 12
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings() 