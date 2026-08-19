import { Router } from 'express';
import * as service from '../services/plants.service.js';

const router = Router();

router.get('/plants', async (req, res) => {
  try {
    const plants = await service.findAll();
    res.json(plants);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar plantas.' });
  }
});

router.get('/plants/due-for-watering', async (req, res) => {
  try {
    const plants = await service.findAll();
    const due = plants.filter(service.isDueForWatering);
    res.json(due);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar plantas.' });
  }
});

router.get('/plants/:id', async (req, res) => {
  try {
    const plant = await service.findById(req.params.id);
    if (!plant) {
      res.status(404).json({ error: 'Planta não encontrada.' });
      return;
    }
    res.json(plant);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar planta.' });
  }
});

router.post('/plants', async (req, res) => {
  try {
    const plant = await service.addPlant(req.body);
    res.status(201).json(plant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/plants/:id/water', async (req, res) => {
  try {
    const plant = await service.waterPlant(req.params.id, req.body);
    res.json(plant);
  } catch (error) {
    if (error.message.includes('não encontrada')) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro ao registrar rega.' });
  }
});

router.get('/plants/:id/history', async (req, res) => {
  try {
    const plant = await service.findById(req.params.id);
    if (!plant) {
      res.status(404).json({ error: 'Planta não encontrada.' });
      return;
    }
    res.json(plant.wateringHistory);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar histórico.' });
  }
});

export default router;
