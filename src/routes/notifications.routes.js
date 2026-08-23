import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as service from '../services/plants.service.js';
import * as notificationService from '../services/notification.service.js';
import { findByEmail } from '../repositories/users.repository.js';

const router = Router();

router.get('/notifications/overdue', authenticate, async (req, res) => {
  try {
    const plants = await service.findAllByUserId(req.user.id);
    const overduePlants = plants.filter(service.isDueForWatering);

    res.json({
      count: overduePlants.length,
      plants: overduePlants.map(p => ({
        id: p.id,
        name: p.name,
        lastWatered: p.lastWatered,
        wateringFrequency: p.wateringFrequency
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar notificações.' });
  }
});

router.post('/notifications/send-reminders', authenticate, async (req, res) => {
  try {
    const plants = await service.findAllByUserId(req.user.id);
    const overduePlants = plants.filter(service.isDueForWatering);

    if (overduePlants.length === 0) {
      res.json({ message: 'Nenhuma planta precisa de água.' });
      return;
    }

    const user = await findByEmail(req.user.id);
    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }

    for (const plant of overduePlants) {
      const daysOverdue = plant.lastWatered
        ? Math.floor((Date.now() - new Date(plant.lastWatered)) / (1000 * 60 * 60 * 24))
        : plant.wateringFrequency;
      await notificationService.sendWateringReminder(user.email, plant.name, daysOverdue);
    }

    res.json({
      message: `${overduePlants.length} lembrete(s) enviado(s).`,
      plants: overduePlants.map(p => p.name)
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar lembretes.' });
  }
});

export default router;
