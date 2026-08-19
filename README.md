# Plant Journal

CLI, API e Frontend para registrar plantas e acompanhar seus cuidados de rega. Projeto de estudo com foco em boas práticas de desenvolvimento com Node.js.

## Funcionalidades

- Cadastrar plantas com frequência de rega personalizada
- Listar todas as plantas cadastradas
- Identificar quais plantas precisam de água
- Registrar histórico de regas
- Consultar clima e recomendações de rega via API externa
- Interface web para gerenciar plantas
- API REST para integração com outros sistemas
- Persistência de dados com PostgreSQL
- Testes automatizados unitários e de integração

## Pré-requisitos

- Node.js 24 ou superior
- npm (incluído com o Node.js)
- PostgreSQL (banco de dados)
- Docker (opcional, para containerização)

## Instalação

```bash
git clone https://github.com/WagnerChicarelli/Plant-Journal.git
cd Plantas
npm install
cd frontend && npm install
```

### Configurar banco de dados

```bash
# Criar banco (PostgreSQL deve estar rodando)
createdb -U postgres plant_journal

# Migrar dados do SQLite para PostgreSQL
npm run migrate:sqlite
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

## Frontend

O projeto inclui uma interface web construída com **React** e **Vite**.

### Iniciar o frontend

```bash
# Terminal 1: API
npm run dev

# Terminal 2: Frontend
npm run dev:frontend
```

Ou ambos juntos:

```bash
npm run dev:all
```

A interface estará disponível em `http://localhost:5173`.

### Funcionalidades do Frontend

- **Lista de plantas**: visualização em grid com status de rega
- **Cadastro**: formulário para adicionar novas plantas
- **Detalhes**: página com informações completas e histórico
- **Clima**: consulta automática de temperatura e umidade
- **Rega rápida**: botão para registrar rega direto do card

### Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/plants` | Lista todas as plantas |
| GET | `/plants/:id` | Busca uma planta pelo ID |
| GET | `/plants/due-for-watering` | Lista plantas que precisam de água |
| GET | `/plants/:id/history` | Histórico de regas da planta |
| GET | `/plants/:id/weather` | Consulta clima e recomendação de rega |
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

# Consultar clima (padrão: São Paulo)
curl http://localhost:3000/plants/<id>/weather

# Consultar clima com coordenadas
curl "http://localhost:3000/plants/<id>/weather?latitude=-22.9&longitude=-43.2"
```

### Resposta do endpoint de clima

```json
{
  "plant": {
    "id": "abc-123",
    "name": "Manjericão",
    "lastWatered": "2026-08-19T10:00:00.000Z",
    "wateringFrequency": 2
  },
  "weather": {
    "temperature": 28.5,
    "humidity": 45,
    "precipitationProbability": 10,
    "recommendation": "Umidade baixa — rega recomendada."
  },
  "watering": {
    "isDue": true,
    "suggestion": "Planta precisa de água."
  }
}
```

## Banco de Dados

O projeto usa **PostgreSQL** para persistência.

### Configuração

1. Certifique-se de que o PostgreSQL está rodando na porta 5432
2. Crie o banco de dados:
```bash
createdb -U postgres plant_journal
```

3. Execute a migração:
```bash
npm run migrate:sqlite
```

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

## Testes

```bash
# Testes unitários (service + waterings)
npm test

# Testes de integração (rotas HTTP)
npm run test:api
```

### Estrutura dos testes

```
tests/
├── plant.test.js        # Testes da service (criação, validação)
├── watering.test.js     # Testes de rega (frequência, histórico)
└── routes.test.js       # Testes de integração (HTTP)
```

### Cenários de teste

```
✓ deve criar uma planta
✓ não deve permitir planta sem nome
✓ deve registrar uma rega
✓ deve identificar plantas que precisam de água
✓ deve retornar 404 para planta inexistente
✓ deve consultar clima e recomendar rega
```

## API Externa (Clima)

O projeto integra com a **Open-Meteo API** (gratuita, sem chave de API) para consultar dados climáticos.

### Funcionalidades

- Consulta temperatura, umidade e probabilidade de chuva
- Recomendação automática de rega baseada no clima
- Cache de 30 minutos para evitar requisições repetidas

### Como funciona

```
GET /plants/:id/weather
        ↓
weather.service.js
        ↓
Open-Meteo API (fetch)
        ↓
Cache (30 min)
        ↓
Recomendação de rega
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
├── src/
│   ├── app.js                  # CLI principal
│   ├── server.js               # API Express
│   ├── db/
│   │   ├── connection.js       # Conexão PostgreSQL
│   │   ├── migrations.js       # Criação das tabelas
│   │   ├── migrate.js          # Migração JSON → PostgreSQL
│   │   └── migrate-sqlite.js   # Migração SQLite → PostgreSQL
│   ├── routes/
│   │   └── plants.routes.js    # Rotas HTTP
│   ├── services/
│   │   ├── plants.service.js   # Lógica de negócio
│   │   └── weather.service.js  # API externa de clima
│   └── repositories/
│       └── plants.repository.js # Acesso ao banco
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PlantList.jsx    # Lista de plantas
│   │   │   ├── PlantCard.jsx    # Card da planta
│   │   │   ├── PlantForm.jsx    # Formulário de cadastro
│   │   │   └── PlantDetail.jsx  # Detalhes + clima
│   │   ├── services/
│   │   │   └── api.js           # Chamadas à API
│   │   ├── App.jsx              # Componente principal
│   │   ├── main.jsx             # Ponto de entrada
│   │   └── index.css            # Estilos
│   └── vite.config.js           # Configuração Vite
├── scripts/
│   └── api-test.js             # Testes de integração
├── tests/
│   ├── plant.test.js           # Testes unitários
│   ├── watering.test.js        # Testes de rega
│   └── routes.test.js          # Testes de rotas
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Arquitetura

```
HTTP request
     ↓
routes/plants.routes.js      → recebe e valida
     ↓
services/plants.service.js   → regras de negócio
     ↓
services/weather.service.js  → API externa (clima)
     ↓
repositories/plants.repository.js → queries SQL
     ↓
PostgreSQL
```

## Tecnologias

- **Node.js 24** — runtime
- **Express 5** — API web
- **React 18** — frontend
- **Vite** — build tool
- **PostgreSQL** — banco de dados
- **Open-Meteo API** — dados climáticos
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
- [x] Testes automatizados completos
- [x] Integração com API externa de clima
- [x] Frontend com React
- [x] Migração para PostgreSQL
- [x] Docker
- [x] CI/CD
- [ ] Autenticação
- [ ] Upload de imagens
- [ ] Notificações

## Licença

MIT
