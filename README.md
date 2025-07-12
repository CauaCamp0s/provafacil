# ProvaFácil - Sistema de Criação de Provas com IA

Sistema completo para criação de provas usando inteligência artificial, com frontend Next.js e backend FastAPI.

## 🚀 Tecnologias

### Frontend
- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Radix UI** - Componentes acessíveis
- **Axios** - Cliente HTTP
- **React Hook Form** - Formulários
- **Zod** - Validação de dados

### Backend
- **FastAPI** - Framework web Python
- **SQLAlchemy** - ORM
- **MySQL** - Banco de dados
- **JWT** - Autenticação
- **Gemini AI** - Geração de provas
- **Mercado Pago** - Pagamentos
- **Pydantic** - Validação

## 📋 Pré-requisitos

- Node.js 18+
- Python 3.8+
- MySQL 8.0+
- pnpm ou npm

## 🔧 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <repository-url>
cd provafacil
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependências Python
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp env.example .env
# Edite o arquivo .env com suas configurações

# Configurar banco MySQL
mysql -u root -p
```

No MySQL:
```sql
CREATE DATABASE provafacil_db;
CREATE USER 'provafacil'@'localhost' IDENTIFIED BY 'provafacil123';
GRANT ALL PRIVILEGES ON provafacil_db.* TO 'provafacil'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```bash
# Inicializar banco de dados
python scripts/init_db.py

# Executar backend
python run.py
```

O backend estará disponível em `http://localhost:8000`

### 3. Configurar Frontend

```bash
# Voltar para a raiz do projeto
cd ..

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp env.local.example .env.local
# Edite o arquivo .env.local

# Executar frontend
pnpm dev
```

O frontend estará disponível em `http://localhost:3000`

## 🔐 Credenciais de Teste

### Usuários Padrão
- **Admin**: admin@provafacil.com / admin123
- **Professor**: professor@teste.com / teste123

### Planos Disponíveis
- **Gratuito**: R$ 0,00 - 5 provas/mês
- **Professor**: R$ 29,90 - 50 provas/mês
- **Escola**: R$ 99,90 - 200 provas/mês

## 📚 Documentação da API

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🏗️ Estrutura do Projeto

```
provafacil/
├── app/                    # Frontend Next.js
│   ├── admin/             # Páginas administrativas
│   ├── dashboard/         # Dashboard do usuário
│   ├── login/             # Páginas de autenticação
│   └── page.tsx           # Landing page
├── components/            # Componentes React
├── hooks/                 # Hooks customizados
├── lib/                   # Utilitários e configurações
├── backend/               # Backend FastAPI
│   ├── app/              # Código da aplicação
│   │   ├── api/          # Endpoints da API
│   │   ├── auth/         # Autenticação
│   │   ├── models/       # Modelos do banco
│   │   ├── schemas/      # Schemas Pydantic
│   │   └── services/     # Serviços externos
│   ├── scripts/          # Scripts utilitários
│   └── main.py           # Aplicação principal
└── README.md             # Este arquivo
```

## 🔌 Integrações

### Gemini AI
- Geração automática de provas
- Questões personalizadas por disciplina e série
- Gabaritos com explicações detalhadas

### Mercado Pago
- Processamento de pagamentos
- Múltiplos métodos de pagamento
- Webhooks para notificações

## 📊 Funcionalidades

### Para Professores
- ✅ Criação de provas com IA
- ✅ Múltiplos tipos de questões
- ✅ Exportação em PDF/Word
- ✅ Biblioteca de provas
- ✅ Gabaritos automáticos

### Para Administradores
- ✅ Dashboard com estatísticas
- ✅ Gerenciamento de usuários
- ✅ Relatórios de pagamentos
- ✅ Monitoramento do sistema

### Sistema de Pagamentos
- ✅ Planos por assinatura
- ✅ Integração Mercado Pago
- ✅ Webhooks automáticos
- ✅ Histórico de transações

## 🔒 Segurança

- Senhas hasheadas com bcrypt
- JWT com expiração configurável
- CORS configurado
- Validação de dados
- Rate limiting (TODO)

## 🧪 Testes

### Backend
```bash
cd backend
pytest
```

### Frontend
```bash
pnpm test
```

## 🚀 Deploy

### Backend (Produção)
```bash
cd backend
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend (Produção)
```bash
pnpm build
pnpm start
```

## 📝 Variáveis de Ambiente

### Backend (.env)
```env
DATABASE_URL=mysql+pymysql://user:pass@localhost/db
SECRET_KEY=your-secret-key
GEMINI_KEY=your-gemini-key
MERCADO_PAGO_ACCESS_TOKEN=your-mp-token
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=your-mp-public-key
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 🆘 Suporte

Para suporte, entre em contato através de:
- Email: suporte@provafacil.com
- Issues: GitHub Issues

## 🔄 Changelog

### v1.0.0
- ✅ Sistema completo de autenticação
- ✅ Geração de provas com Gemini AI
- ✅ Integração com Mercado Pago
- ✅ Dashboard administrativo
- ✅ Sistema de planos e assinaturas
- ✅ Exportação de provas
- ✅ Interface responsiva 