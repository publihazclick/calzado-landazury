import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.DATABASE_URL);

export async function initContactsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL,
      asunto TEXT NOT NULL,
      mensaje TEXT NOT NULL,
      creado_en TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function saveContact(data: {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
}) {
  await sql`
    INSERT INTO contacts (nombre, email, asunto, mensaje)
    VALUES (${data.nombre}, ${data.email}, ${data.asunto}, ${data.mensaje})
  `;
}

export async function getContacts() {
  return await sql`
    SELECT * FROM contacts ORDER BY creado_en DESC
  `;
}
