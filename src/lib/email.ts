import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    console.warn("SMTP not configured. Emails will be logged to console instead.");
    return null as unknown as nodemailer.Transporter;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const transport = getTransporter();

  if (!transport) {
    console.log(`[EMAIL LOG] To: ${options.to} | Subject: ${options.subject}`);
    console.log(`[EMAIL LOG] Body: ${options.text}`);
    return;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@mapody.site";

  await transport.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html || options.text,
  });
}
