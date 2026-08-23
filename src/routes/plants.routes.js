import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as service from '../services/plants.service.js';
import { getWeather } from '../services/weather.service.js';

const router = Router();

router.get('/plants', authenticate, async (req, res) => {
  try {
    const plants = await service.findAllByUserId(req.user.id);
    res.json(plants);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar plantas.' });
  }
});

router.get('/plants/due-for-watering', authenticate, async (req, res) => {
  try {
    const plants = await service.findAllByUserId(req.user.id);
    const due = plants.filter(service.isDueForWatering);
    res.json(due);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar plantas.' });
  }
});

router.get('/plants/:id', authenticate, async (req, res) => {
  try {
    const plant = await service.findByIdAndUserId(req.params.id, req.user.id);
    if (!plant) {
      res.status(404).json({ error: 'Planta não encontrada.' });
      return;
    }
    res.json(plant);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar planta.' });
  }
});

router.post('/plants', authenticate, async (req, res) => {
  try {
    const plant = await service.addPlant({ ...req.body, userId: req.user.id });
    res.status(201).json(plant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/plants/:id/water', authenticate, async (req, res) => {
  try {
    const plant = await service.waterPlant(req.params.id, req.body, req.user.id);
    res.json(plant);
  } catch (error) {
    if (error.message.includes('não encontrada')) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro ao registrar rega.' });
  }
});

router.get('/plants/:id/history', authenticate, async (req, res) => {
  try {
    const plant = await service.findByIdAndUserId(req.params.id, req.user.id);
    if (!plant) {
      res.status(404).json({ error: 'Planta não encontrada.' });
      return;
    }
    res.json(plant.wateringHistory);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar histórico.' });
  }
});

router.get('/plants/:id/weather', authenticate, async (req, res) => {
  try {
    const plant = await service.findByIdAndUserId(req.params.id, req.user.id);
    if (!plant) {
      res.status(404).json({ error: 'Planta não encontrada.' });
      return;
    }

    const { latitude = -23.55, longitude = -46.63 } = req.query;
    const weather = await getWeather(Number(latitude), Number(longitude));

    const isDue = service.isDueForWatering(plant);

    res.json({
      plant: {
        id: plant.id,
        name: plant.name,
        lastWatered: plant.lastWatered,
        wateringFrequency: plant.wateringFrequency
      },
      weather: {
        temperature: weather.current.temperature,
        humidity: weather.current.humidity,
        precipitationProbability: weather.daily.precipitationProbability,
        recommendation: weather.recommendation
      },
      watering: {
        isDue,
        suggestion: isDue
          ? 'Planta precisa de água.'
          : 'Planta não precisa de água no momento.'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao consultar clima.' });
  }
});

export default router;
