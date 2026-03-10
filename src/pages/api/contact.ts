import type { APIRoute } from 'astro';
import { initContactsTable, saveContact } from '../../lib/db';
import nodemailer from 'nodemailer';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { nombre, email, asunto, mensaje } = data;

    if (!nombre || !email || !asunto || !mensaje) {
      return new Response(JSON.stringify({ error: 'Todos los campos son requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await initContactsTable();
    await saveContact({ nombre, email, asunto, mensaje });

    // Enviar correo si hay credenciales configuradas
    if (import.meta.env.GMAIL_USER && import.meta.env.GMAIL_APP_PASSWORD) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: import.meta.env.GMAIL_USER,
          pass: import.meta.env.GMAIL_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"Calzado Landazury" <${import.meta.env.GMAIL_USER}>`,
        to: import.meta.env.GMAIL_USER,
        subject: `Nuevo mensaje: ${asunto}`,
        html: `
          <h2>Nuevo mensaje de contacto</h2>
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Asunto:</strong> ${asunto}</p>
          <p><strong>Mensaje:</strong></p>
          <p>${mensaje.replace(/\n/g, '<br>')}</p>
        `,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error en /api/contact:', error);
    return new Response(JSON.stringify({ error: 'Error al procesar el mensaje' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
