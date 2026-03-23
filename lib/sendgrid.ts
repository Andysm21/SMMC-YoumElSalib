import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY not configured');
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export const sendgrid = sgMail;
