# ProvaFácil Backend API

Backend da aplicação ProvaFácil desenvolvido com FastAPI, integrando Gemini AI e Mercado Pago.

## 🚀 Tecnologias

- **FastAPI** - Framework web moderno e rápido
- **SQLAlchemy** - ORM para banco de dados
- **MySQL** - Banco de dados principal
- **JWT** - Autenticação segura
- **Gemini AI** - Geração de provas com IA
- **Mercado Pago** - Processamento de pagamentos
- **Pydantic** - Validação de dados
- **Alembic** - Migrações de banco

## 📋 Pré-requisitos

- Python 3.8+
- MySQL 8.0+
- pip ou poetry

## 🔧 Instalação

1. **Clone o repositório**
```bash
cd backend
```

2. **Instale as dependências**
```bash
pip install -r requirements.txt
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Configure o banco MySQL**
```sql
CREATE DATABASE provafacil_db;
CREATE USER 'provafacil'@'localhost' IDENTIFIED BY 'provafacil123';
GRANT ALL PRIVILEGES ON provafacil_db.* TO 'provafacil'@'localhost';
FLUSH PRIVILEGES;
```

5. **Inicialize o banco de dados**
```bash
python scripts/init_db.py
```

6. **Execute a aplicação**
```bash
python main.py
```

A API estará disponível em `http://localhost:8000`

## 📚 Documentação da API

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔐 Autenticação

A API usa JWT para autenticação. Para obter um token:

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@provafacil.com&password=admin123"
```

Use o token retornado no header `Authorization: Bearer <token>`

## 🏗️ Estrutura do Projeto

```
backend/
├── app/
│   ├── api/           # Endpoints da API
│   ├── auth/          # Autenticação e autorização
│   ├── models/        # Modelos do banco de dados
│   ├── schemas/       # Schemas Pydantic
│   ├── services/      # Serviços externos (Gemini, Mercado Pago)
│   ├── config.py      # Configurações
│   └── database.py    # Configuração do banco
├── scripts/           # Scripts utilitários
├── main.py           # Aplicação principal
├── requirements.txt  # Dependências
└── README.md        # Este arquivo
```

## 🔌 Integrações

### Gemini AI
- Geração automática de provas
- Questões personalizadas por disciplina e série
- Gabaritos com explicações

### Mercado Pago
- Processamento de pagamentos
- Webhooks para notificações
- Múltiplos métodos de pagamento

## 📊 Endpoints Principais

### Autenticação
- `POST /api/v1/auth/register` - Registrar usuário
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Dados do usuário atual

### Provas
- `POST /api/v1/provas/gerar` - Gerar prova com IA
- `GET /api/v1/provas/` - Listar provas
- `GET /api/v1/provas/{id}` - Obter prova específica
- `DELETE /api/v1/provas/{id}` - Deletar prova

### Planos
- `GET /api/v1/planos/` - Listar planos
- `GET /api/v1/planos/meu-plano` - Plano atual
- `POST /api/v1/planos/{id}/assinar` - Assinar plano

### Pagamentos
- `POST /api/v1/pagamentos/criar` - Criar pagamento
- `GET /api/v1/pagamentos/` - Listar pagamentos
- `POST /api/v1/pagamentos/webhooks/mercadopago` - Webhook MP

## 🔒 Segurança

- Senhas hasheadas com bcrypt
- JWT com expiração configurável
- CORS configurado
- Validação de dados com Pydantic
- Rate limiting (TODO)

## 🧪 Testes

```bash
# Executar testes
pytest

# Cobertura de testes
pytest --cov=app
```

## 🚀 Deploy

### Docker
```bash
docker build -t provafacil-backend .
docker run -p 8000:8000 provafacil-backend
```

### Produção
1. Configure variáveis de ambiente de produção
2. Use um servidor WSGI como Gunicorn
3. Configure proxy reverso (Nginx)
4. Configure SSL/TLS

## 📝 Logs

Os logs são configurados para:
- Console (desenvolvimento)
- Arquivo (produção)
- Níveis: DEBUG, INFO, WARNING, ERROR

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. 