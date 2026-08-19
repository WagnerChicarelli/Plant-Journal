# Plant Journal

CLI e API para registrar plantas e acompanhar seus cuidados de rega. Projeto de estudo com foco em boas práticas de desenvolvimento com Node.js.

## Funcionalidades

- Cadastrar plantas com frequência de rega personalizada
- Listar todas as plantas cadastradas
- Identificar quais plantas precisam de água
- Registrarhistórico de regas
- API REST para integração com outros sistemas

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
| GET | `/plants/due-for-watering` | Lista plantas que precisam de água |
| GET | `/plants/:id` | Busca uma planta pelo ID |
| POST | `/plants/:id/water` | Registra uma rega |

#### Exemplos com curl

```bash
# Listar plantas
curl http://localhost:3000/plants

# Buscar planta por ID
curl http://localhost:3000/plants/<id>

# Registrar rega
curl -X POST http://localhost:3000/plants/<id>/water \
  -H "Content-Type: application/json" \
  -d '{"amount": "200ml", "notes": "Rega pela manhã"}'
```

## Testes

```bash
npm test
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
│   └── plants.json        # Dados persistidos
├── src/
│   ├── app.js             # CLI principal
│   ├── server.js          # API Express
│   ├── plant.js           # Lógica de plantas
│   └── storage.js         # Leitura/escrita de arquivos
├── tests/
│   └── plant.test.js      # Testes unitários
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Tecnologias

- **Node.js 24** — runtime
- **Express 5** — API web
- **Docker** — containerização
- **GitHub Actions** — CI/CD
- **Node.js Test Runner** — testes nativos

## Licença

MIT
