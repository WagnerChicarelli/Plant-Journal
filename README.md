# Plant Journal

Uma CLI em Node.js para registrar plantas e acompanhar suas regas. Esta é a primeira etapa de um projeto de portfólio que poderá evoluir para API REST, banco de dados e frontend.

## Pré-requisitos

- Node.js 20 ou superior
- npm (incluído com o Node.js)
- Git

## Como executar

```bash
npm start -- help
npm start -- add "Manjericão" 2
npm start -- list
npm start -- due
```

Para registrar uma rega, copie o identificador exibido pelo comando `list`:

```bash
npm start -- water <id-da-planta>
```

## Testes

```bash
npm test
```

## Próximas etapas

1. Adicionar espécie, local e observações ao comando `add`.
2. Transformar a CLI em API REST com Express.
3. Migrar de JSON para SQLite e, depois, PostgreSQL.
4. Adicionar uma interface web.
5. Configurar Docker e integração contínua no GitHub Actions.
