import dns from 'node:dns/promises';

export async function validateEmailDomain(email) {
  const domain = email.split('@')[1];

  if (!domain) {
    return { valid: false, error: 'Email inválido.' };
  }

  try {
    const records = await dns.resolveMx(domain);
    if (records && records.length > 0) {
      return { valid: true, domain };
    }
    return { valid: false, error: 'Esse email não existe. Verifique se digitou certo.' };
  } catch {
    return { valid: false, error: 'Esse email não existe. Verifique se digitou certo.' };
  }
}
