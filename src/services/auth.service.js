import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as repository from '../repositories/users.repository.js';
// import { sendEmailConfirmation, generateConfirmationToken } from './email.service.js';

const JWT_SECRET = process.env.JWT_SECRET || 'plant-journal-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push('pelo menos 8 letras');
  if (!/[A-Z]/.test(password)) errors.push('pelo menos 1 letra maiúscula');
  if (!/[a-z]/.test(password)) errors.push('pelo menos 1 letra minúscula');
  if (!/[0-9]/.test(password)) errors.push('pelo menos 1 número');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('pelo menos 1 símbolo');
  return errors;
}

export async function register({ name, email, password }) {
  if (!name || !name.trim()) {
    throw new Error('Digite seu nome.');
  }

  if (!email || !email.trim()) {
    throw new Error('Digite seu email.');
  }

  if (!password) {
    throw new Error('Digite uma senha.');
  }

  const passwordErrors = validatePassword(password);
  if (passwordErrors.length > 0) {
    throw new Error(`A senha precisa ter ${passwordErrors.join(', ')}.`);
  }

  const existing = await repository.findByEmail(email);
  if (existing) {
    throw new Error('Esse email já foi cadastrado. Tente fazer login.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  // const confirmationToken = generateConfirmationToken();
  // const confirmationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: hashedPassword,
    createdAt: new Date().toISOString(),
    confirmationToken: null,
    confirmationExpires: null
  };

  const created = await repository.create(user);

  // await sendEmailConfirmation(created.email, created.name, confirmationToken);

  const token = jwt.sign(
    { id: created.id, email: created.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    user: { id: created.id, name: created.name, email: created.email },
    token
  };
}

export async function confirmEmail(token) {
  if (!token) {
    throw new Error('Token de confirmação é obrigatório.');
  }

  const user = await repository.findByConfirmationToken(token);
  if (!user) {
    throw new Error('Link de confirmação inválido.');
  }

  if (new Date(user.confirmation_expires) < new Date()) {
    throw new Error('Link de confirmação expirado. Faça login para reenviar.');
  }

  await repository.confirmEmail(user.id);

  return { message: 'Email confirmado com sucesso! Agora você pode fazer login.' };
}

export async function resendConfirmation(email) {
  if (!email) {
    throw new Error('Digite seu email.');
  }

  const user = await repository.findByEmail(email);
  if (!user) {
    throw new Error('Email não encontrado.');
  }

  if (user.email_confirmed) {
    throw new Error('Esse email já foi confirmado. Faça login.');
  }

  // const confirmationToken = generateConfirmationToken();
  // const confirmationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  // await repository.updateConfirmationToken(user.id, confirmationToken, confirmationExpires);

  // await sendEmailConfirmation(user.email, user.name, confirmationToken);

  return { message: 'Email de confirmação reenviado! Verifique sua caixa de entrada.' };
}

export async function login({ email, password }) {
  if (!email || !password) {
    throw new Error('Digite seu email e senha.');
  }

  const user = await repository.findByEmail(email);
  if (!user) {
    throw new Error('Email ou senha incorretos. Tente novamente.');
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new Error('Email ou senha incorretos. Tente novamente.');
  }

  // if (!user.email_confirmed) {
  //   throw new Error('Email não confirmado. Verifique sua caixa de entrada.');
  // }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    user: { id: user.id, name: user.name, email: user.email },
    token
  };
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
