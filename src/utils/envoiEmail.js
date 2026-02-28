import nodemailer from 'nodemailer';

export default async function envoiEmail(toEmail, objet, contenu) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
    });
    await transporter.sendMail({
        from: `"Soluxury" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: objet,
        html: contenu
    });
}