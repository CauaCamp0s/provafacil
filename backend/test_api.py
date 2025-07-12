#!/usr/bin/env python3
"""
Script para testar a API de login
"""

import requests
import json

def test_api():
    """Testa a API de login"""
    
    base_url = "http://localhost:8000"
    
    print("🧪 Testando API de login...")
    
    # Teste 1: Verificar se o backend responde
    try:
        response = requests.get(f"{base_url}/")
        print(f"✅ Backend responde: {response.status_code}")
        print(f"   Resposta: {response.text[:100]}...")
    except Exception as e:
        print(f"❌ Backend não responde: {e}")
        return
    
    # Teste 2: Testar login
    try:
        login_data = {
            "username": "admin@provafacil.com",
            "password": "admin123"
        }
        
        response = requests.post(
            f"{base_url}/api/v1/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        print(f"\n�� Teste de login:")
        print(f"   Status: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Login bem-sucedido!")
            print(f"   Token: {data.get('access_token', '')[:30]}...")
            print(f"   Tipo: {data.get('token_type', '')}")
            print(f"   Expira em: {data.get('expires_in', '')} segundos")
        else:
            print(f"   ❌ Erro no login:")
            print(f"   Resposta: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro ao testar login: {e}")

if __name__ == "__main__":
    test_api() 