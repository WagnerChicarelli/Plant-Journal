import nodemailer from 'nodemailer';
import crypto from 'node:crypto';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.office365.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendEmailConfirmation(userEmail, userName, token) {
  if (!process.env.SMTP_USER) {
    console.log('SMTP não configurado. Email não enviado.');
    return;
  }

  const confirmationUrl = `http://localhost:5173/confirm?token=${token}`;

  const subject = 'Confirme seu cadastro - Plant Journal';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2d5016;">🌱 Bem-vindo ao Plant Journal!</h2>
      <p>Olá <strong>${userName}</strong>,</p>
      <p>Obrigado por se cadastrar! Para confirmar seu acesso, clique no botão abaixo:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${confirmationUrl}" 
           style="background-color: #4caf50; 
                  color: white; 
                  padding: 15px 30px; 
                  text-decoration: none; 
                  border-radius: 25px;
                  font-weight: bold;">
          Confirmar Meu Email
        </a>
      </div>
      
      <p style="color: #666; font-size: 14px;">
        Se o botão não funcionar, copie e cole este link no seu navegador:<br>
        <a href="${confirmationUrl}">${confirmationUrl}</a>
      </p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        Plant Journal — Acompanhe suas plantas
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Plant Journal" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject,
      html
    });
    console.log(`Email de confirmação enviado para ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error.message);
    return false;
  }
}

export async function sendWateringReminder(userEmail, plantName, daysOverdue) {
  if (!process.env.SMTP_USER) {
    console.log('SMTP não configurado. Email não enviado.');
    return;
  }

  const subject = `Lembrete: ${plantName} precisa de água!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2d5016;">💧 Lembrete de Rega</h2>
      <p>Sua planta <strong>${plantName}</strong> está sem regar há <strong>${daysOverdue} dia(s)</strong>.</p>
      <p>Não esqueça de cuidar dela!</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        Plant Journal — Acompanhe suas plantas
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Plant Journal" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject,
      html
    });
    console.log(`Email enviado para ${userEmail}: ${subject}`);
  } catch (error) {
    console.error('Erro ao enviar email:', error.message);
  }
}

export async function sendWateringConfirmation(userEmail, plantName) {
  if (!process.env.SMTP_USER) return;

  const subject = `Rega registrada: ${plantName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2d5016;">💧 Rega Registrada</h2>
      <p>A rega da planta <strong>${plantName}</strong> foi registrada com sucesso!</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        Plant Journal — Acompanhe suas plantas
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Plant Journal" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject,
      html
    });
  } catch (error) {
    console.error('Erro ao enviar email:', error.message);
  }
}

export function generateConfirmationToken() {
  return crypto.randomBytes(32).toString('hex');
}
