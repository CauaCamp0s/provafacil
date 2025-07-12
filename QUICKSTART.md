# 🚀 Guia de Início Rápido - ProvaFácil

## ⚡ Execução Rápida

### Opção 1: Script Automático (Recomendado)
```bash
# Dar permissão de execução
chmod +x start.sh

# Executar script
./start.sh
```

### Opção 2: Docker Compose
```bash
# Configurar variáveis de ambiente
export GEMINI_KEY="AIzaSyDLLAvoi0nSgcnYiyY6aEf3pJ18VCKwtak"
export MERCADO_PAGO_ACCESS_TOKEN="TEST-1234567890123456789012345678901234567890"
export MERCADO_PAGO_PUBLIC_KEY="TEST-12345678-1234-1234-1234-123456789012"

# Executar com Docker
docker-compose up -d
```

### Opção 3: Manual

#### Backend
```bash
cd backend
pip install -r requirements.txt
cp env.example .env
# Editar .env com suas configurações
python scripts/init_db.py
python run.py
```

#### Frontend
```bash
pnpm install
cp env.local.example .env.local
# Editar .env.local
pnpm dev
```

## 🔐 Acesso

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 👤 Credenciais de Teste

- **Admin**: admin@provafacil.com / admin123
- **Professor**: professor@teste.com / teste123

## 📋 Checklist de Configuração

- [ ] MySQL instalado e rodando
- [ ] Python 3.8+ instalado
- [ ] Node.js 18+ instalado
- [ ] pnpm instalado
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados criado
- [ ] Dependências instaladas

## 🆘 Solução de Problemas

### Backend não inicia
```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Verificar logs
cd backend
python run.py
```

### Frontend não conecta com backend
```bash
# Verificar se backend está rodando
curl http://localhost:8000/health

# Verificar variáveis de ambiente
cat .env.local
```

### Erro de banco de dados
```bash
# Recriar banco
mysql -u root -p
DROP DATABASE provafacil_db;
CREATE DATABASE provafacil_db;
exit

# Reinicializar
cd backend
python scripts/init_db.py
```

## 📞 Suporte

- **Issues**: GitHub Issues
- **Email**: suporte@provafacil.com 