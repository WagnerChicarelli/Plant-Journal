import { Router } from 'express';
import { validateEmailDomain } from '../services/email-validator.service.js';

const router = Router();

router.post('/validate-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ valid: false, error: 'Email é obrigatório.' });
      return;
    }

    const result = await validateEmailDomain(email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ valid: false, error: 'Erro ao validar email.' });
  }
});

export default router;
