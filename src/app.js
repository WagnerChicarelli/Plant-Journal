import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPlant, isDueForWatering, waterPlant } from './plant.js';
import { loadPlants, savePlants } from './storage.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(currentDirectory, '..', 'data', 'plants.json');
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
  const plants = await loadPlants(dataFile);

  if (!command || command === 'help') return showHelp();

  if (command === 'add') {
    const [name, frequency = '7'] = args;
    const plant = createPlant({ name, wateringFrequency: frequency });
    await savePlants(dataFile, [...plants, plant]);
    return console.log(`Planta cadastrada: ${plant.name} (${plant.id})`);
  }

  if (command === 'list' || command === 'due') {
    const result = command === 'due' ? plants.filter(isDueForWatering) : plants;
    if (result.length === 0) return console.log('Nenhuma planta encontrada.');
    result.forEach((plant) => console.log(`${plant.id} | ${plant.name} | rega a cada ${plant.wateringFrequency} dia(s)`));
    return;
  }

  if (command === 'water') {
    const [id] = args;
    const index = plants.findIndex((plant) => plant.id === id);
    if (index === -1) throw new Error('Planta não encontrada. Use o comando list para obter o id.');
    const updatedPlant = waterPlant(plants[index]);
    plants[index] = updatedPlant;
    await savePlants(dataFile, plants);
    return console.log(`Rega registrada para ${updatedPlant.name}.`);
  }

  throw new Error(`Comando desconhecido: ${command}`);
}

main().catch((error) => {
  console.error(`Erro: ${error.message}`);
  process.exitCode = 1;
});
