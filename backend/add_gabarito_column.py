#!/usr/bin/env python3
"""
Script para adicionar a coluna gabarito_salvo na tabela provas
"""

import pymysql
from app.config import settings
import re

def add_gabarito_salvo_column():
    """Adiciona a coluna gabarito_salvo na tabela provas"""
    
    # Extrair informações de conexão da URL do banco
    # Exemplo: mysql+pymysql://provafacil:provafacil123@localhost:3306/provafacil_db
    url = settings.database_url
    match = re.search(r'mysql\+pymysql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', url)
    
    if not match:
        print("❌ Não foi possível extrair informações de conexão da URL do banco")
        return
    
    user, password, host, port, database = match.groups()
    
    try:
        # Conectar ao MySQL
        connection = pymysql.connect(
            host=host,
            user=user,
            password=password,
            database=database,
            port=int(port)
        )
        
        cursor = connection.cursor()
        
        print("🔍 Verificando se a coluna gabarito_salvo existe...")
        
        # Verificar se a coluna já existe
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = %s 
            AND TABLE_NAME = 'provas' 
            AND COLUMN_NAME = 'gabarito_salvo'
        """, (database,))
        
        if cursor.fetchone():
            print("✅ Coluna gabarito_salvo já existe!")
            return
        
        print("➕ Adicionando coluna gabarito_salvo...")
        
        # Adicionar a coluna
        cursor.execute("""
            ALTER TABLE provas 
            ADD COLUMN gabarito_salvo BOOLEAN DEFAULT FALSE
        """)
        
        connection.commit()
        print("✅ Coluna gabarito_salvo adicionada com sucesso!")
        
        # Verificar se foi criada
        cursor.execute("DESCRIBE provas")
        columns = cursor.fetchall()
        
        print("\n�� Estrutura atual da tabela provas:")
        for column in columns:
            print(f"  - {column[0]}: {column[1]}")
        
    except Exception as e:
        print(f"❌ Erro ao adicionar coluna: {e}")
        if 'connection' in locals():
            connection.rollback()
    finally:
        if 'connection' in locals():
            connection.close()

if __name__ == "__main__":
    add_gabarito_salvo_column() 