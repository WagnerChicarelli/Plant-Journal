import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendWateringReminder(userEmail, plantName, daysOverdue) {
  if (!process.env.SMTP_USER) {
    console.log('SMTP não configurado. Email não enviado.');
    return;
  }

  const subject = `Lembrete: ${plantName} precisa de água!`;
  const html = `
    <h2>🌱 Lembrete de Rega</h2>
    <p>Sua planta <strong>${plantName}</strong> está sem regar há <strong>${daysOverdue} dia(s)</strong>.</p>
    <p>Não esqueça de cuidar dela!</p>
    <hr>
    <p><small>Plant Journal — Acompanhe suas plantas</small></p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
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
    <h2>💧 Rega Registrada</h2>
    <p>A rega da planta <strong>${plantName}</strong> foi registrada com sucesso!</p>
    <hr>
    <p><small>Plant Journal — Acompanhe suas plantas</small></p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: userEmail,
      subject,
      html
    });
  } catch (error) {
    console.error('Erro ao enviar email:', error.message);
  }
}
