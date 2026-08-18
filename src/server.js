import express from 'express';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createPlant, isDueForWatering, waterPlant} from './plant.js';
import {loadPlants, savePlants} from './storage.js';

const app = express();
const port = 3000;

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(currentDirectory, '..','data','plants.json');

app.use(express.json());

app.get('/plants', async (req,res) => {
    const plants = await loadPlants(dataFile);
    res.json(plants);
});

app.get('/plants/due-for-watering', async (req,res) => {
    const plants = await loadPlants(dataFile);
    res.json(plants.filter(isDueForWatering));
});

app.get('/plants/:id', async (req,res) => {
    const plants = await loadPlants(dataFile);
    const plant = plants.find(p => p.id === req.params.id);

    if (!plant) {
        res.status(404).json({ error: 'Planta não encontrada.' });
        return;
    }

    res.json(plant);
});

app.post('/plants/:id/water', async (req,res) => {
    const plants = await loadPlants(dataFile);
    const index = plants.findIndex(p => p.id === req.params.id);

    if (index === -1) {
        res.status(404).json({ error: 'Planta não encontrada.' });
        return;
    }

    plants[index] = waterPlant(plants[index], req.body);
    await savePlants(dataFile, plants);

    res.json(plant[index]);
});

app.listen(port, () => {
    console.log(`API disponível em http://localhost:${port}`);
});

