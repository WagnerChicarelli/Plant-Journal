import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runMigrations } from './db/migrations.js';
import * as service from './services/plants.service.js';

const [command, ...args] = process.argv.slice(2);

function showHelp() {
  console.log(`Plant Journal — comandos disponíveis:

  npm start -- add "Nome" [frequência em dias]
  npm start -- list
  npm start -- water <id>
  npm start -- due
  npm start -- help`);
}

async function main() {
  await runMigrations();

  if (!command || command === 'help') return showHelp();

  if (command === 'add') {
    const [name, frequency = '7'] = args;
    const plant = await service.addPlant({ name, wateringFrequency: frequency });
    return console.log(`Planta cadastrada: ${plant.name} (${plant.id})`);
  }

  if (command === 'list' || command === 'due') {
    const plants = await service.findAll();
    const result = command === 'due' ? plants.filter(service.isDueForWatering) : plants;
    if (result.length === 0) return console.log('Nenhuma planta encontrada.');
    result.forEach((plant) => console.log(`${plant.id} | ${plant.name} | rega a cada ${plant.wateringFrequency} dia(s)`));
    return;
  }

  if (command === 'water') {
    const [id] = args;
    await service.waterPlant(id);
    return console.log('Rega registrada com sucesso.');
  }

  throw new Error(`Comando desconhecido: ${command}`);
}

main().catch((error) => {
  console.error(`Erro: ${error.message}`);
  process.exitCode = 1;
});
