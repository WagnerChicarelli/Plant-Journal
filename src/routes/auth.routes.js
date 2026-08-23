import { Router } from 'express';
import * as authService from '../services/auth.service.js';

const router = Router();

router.post('/auth/register', async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.get('/auth/confirm/:token', async (req, res) => {
  try {
    const result = await authService.confirmEmail(req.params.token);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/auth/resend-confirmation', async (req, res) => {
  try {
    const result = await authService.resendConfirmation(req.body.email);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
