import { readFile, writeFile } from 'node:fs/promises';

export async function loadPlants(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    const plants = JSON.parse(content);
    if (!Array.isArray(plants)) {
      throw new Error('O arquivo de dados deve conter uma lista de plantas.');
    }
    return plants;
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

export async function savePlants(filePath, plants) {
  await writeFile(filePath, `${JSON.stringify(plants, null, 2)}\n`, 'utf8');
}
