import { query } from '../db/connection.js';

export async function findByEmail(email) {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

export async function findById(id) {
  const result = await query('SELECT id, name, email, created_at, email_confirmed FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function create(user) {
  await query(
    `INSERT INTO users (id, name, email, password, created_at, email_confirmed, confirmation_token, confirmation_expires)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [user.id, user.name, user.email, user.password, user.createdAt, false, user.confirmationToken, user.confirmationExpires]
  );
  return { id: user.id, name: user.name, email: user.email };
}

export async function findByConfirmationToken(token) {
  const result = await query('SELECT * FROM users WHERE confirmation_token = $1', [token]);
  return result.rows[0] || null;
}

export async function confirmEmail(userId) {
  await query(
    `UPDATE users SET email_confirmed = TRUE, confirmation_token = NULL, confirmation_expires = NULL WHERE id = $1`,
    [userId]
  );
}

export async function updateConfirmationToken(userId, token, expires) {
  await query(
    `UPDATE users SET confirmation_token = $1, confirmation_expires = $2 WHERE id = $3`,
    [token, expires, userId]
  );
}
