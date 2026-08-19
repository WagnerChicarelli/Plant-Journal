# Plant Journal

CLI e API para registrar plantas e acompanhar seus cuidados de rega. Projeto de estudo com foco em boas práticas de desenvolvimento com Node.js.

## Funcionalidades

- Cadastrar plantas com frequência de rega personalizada
- Listar todas as plantas cadastradas
- Identificar quais plantas precisam de água
- Registrar histórico de regas
- API REST para integração com outros sistemas
- Persistência de dados com SQLite

## Pré-requisitos

- Node.js 24 ou superior
- npm (incluído com o Node.js)
- Docker (opcional, para containerização)

## Instalação

```bash
git clone https://github.com/WagnerChicarelli/Plantas.git
cd Plantas
npm install
```

## Uso via CLI

```bash
# Exibir ajuda
npm start -- help

# Cadastrar uma planta (nome, frequência em dias)
npm start -- add "Manjericão" 2

# Listar todas as plantas
npm start -- list

# Ver plantas que precisam de água
npm start -- due

# Registrar uma rega (copie o id do comando list)
npm start -- water <id-da-planta>
```

## Uso via API

```bash
# Iniciar o servidor
npm run dev
```

A API estará disponível em `http://localhost:3000`.

### Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/plants` | Lista todas as plantas |
| GET | `/plants/:id` | Busca uma planta pelo ID |
| GET | `/plants/due-for-watering` | Lista plantas que precisam de água |
| GET | `/plants/:id/history` | Histórico de regas da planta |
| POST | `/plants` | Cadastra uma nova planta |
| POST | `/plants/:id/water` | Registra uma rega |

#### Exemplos com curl

```bash
# Listar plantas
curl http://localhost:3000/plants

# Buscar planta por ID
curl http://localhost:3000/plants/<id>

# Cadastrar planta
curl -X POST http://localhost:3000/plants \
  -H "Content-Type: application/json" \
  -d '{"name": "Rosa", "wateringFrequency": 3}'

# Registrar rega
curl -X POST http://localhost:3000/plants/<id>/water \
  -H "Content-Type: application/json" \
  -d '{"amount": "200ml", "notes": "Rega pela manhã"}'

# Histórico de regas
curl http://localhost:3000/plants/<id>/history
```

## Banco de Dados

O projeto usa **SQLite** (via `sql.js`) para persistência. Os dados ficam em `data/plant.db`.

### Estrutura das tabelas

```sql
plants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  species TEXT,
  location TEXT,
  watering_frequency INTEGER,
  last_watered TEXT,
  notes TEXT,
  created_at TEXT
)

watering_events (
  id TEXT PRIMARY KEY,
  plant_id TEXT REFERENCES plants(id),
  watered_at TEXT,
  amount TEXT,
  notes TEXT
)
```

### Migrar dados do JSON para SQLite

```bash
npm run migrate
```

## Testes

```bash
# Testes unitários
npm test

# Testes de integração (API)
npm run test:api
```

## Docker

### Rodar localmente

```bash
docker compose up --build
```

A aplicação estará disponível em `http://localhost:3000`.

### Buildar a imagem manualmente

```bash
docker build -t plant-journal .
docker run -p 3000:3000 plant-journal
```

## CI/CD

O projeto utiliza **GitHub Actions** para automação:

- **Testes**: executados em todo push/PR para `main`
- **Build**: imagem Docker enviada para o GitHub Container Registry (`ghcr.io`) apenas no push para `main`

### Pipeline

```
push/PR → Testes → Build Docker → ghcr.io/wagnerchicarelli/plantas:latest
```

## Estrutura do Projeto

```
plant-journal/
├── data/
│   └── plant.db                # Banco SQLite
├── src/
│   ├── app.js                  # CLI principal
│   ├── server.js               # API Express
│   ├── db/
│   │   ├── connection.js       # Conexão SQLite
│   │   ├── migrations.js       # Criação das tabelas
│   │   └── migrate.js          # Migração JSON → SQLite
│   ├── routes/
│   │   └── plants.routes.js    # Rotas HTTP
│   ├── services/
│   │   └── plants.service.js   # Lógica de negócio
│   └── repositories/
│       └── plants.repository.js # Acesso ao banco
├── scripts/
│   └── api-test.js             # Testes de integração
├── tests/
│   └── plant.test.js           # Testes unitários
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Arquitetura

```
HTTP request
     ↓
routes/plants.routes.js    → recebe e valida
     ↓
services/plants.service.js → regras de negócio
     ↓
repositories/plants.repository.js → queries SQL
     ↓
SQLite (data/plant.db)
```

## Tecnologias

- **Node.js 24** — runtime
- **Express 5** — API web
- **SQLite** (sql.js) — banco de dados
- **Docker** — containerização
- **GitHub Actions** — CI/CD
- **Node.js Test Runner** — testes nativos

## Roadmap

- [x] CLI inicial
- [x] Cadastro de plantas
- [x] Listagem
- [x] Registro de rega
- [x] Persistência em JSON
- [x] Separação de módulos
- [x] API com Express
- [x] Rotas REST
- [x] Separação Routes / Services / Repository
- [x] Migração para SQLite
- [ ] Migração para PostgreSQL
- [ ] Testes automatizados completos
- [ ] Integração com API externa de clima
- [ ] Frontend
- [ ] Autenticação
- [ ] Upload de imagens
- [ ] Notificações
- [ ] Docker
- [ ] CI/CD

## Licença

MIT
