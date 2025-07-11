import express from 'express';
import cors from 'cors';
import { db } from './db.js';

import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware CORS universal (ajusta si quieres restringir orígenes)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware para parsear JSON
app.use(express.json());

// Rutas API

// Obtener todos los usuarios
app.get('/api/users', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    console.error('Error en /api/users:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Registrar nuevo usuario
app.post('/api/signup', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  const allowedRoles = ['teacher', 'student', 'admin'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }

  try {
    const [exists] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length > 0) {
      return res.status(400).json({ error: 'El email ya existe' });
    }

    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );

    const user = { id: result.insertId, name, email, role };
    res.status(201).json({ success: true, user });
  } catch (err) {
    console.error('Error en /api/signup:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Login de usuario
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('POST /api/login recibido con:', { email, password: password ? '******' : undefined });

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    console.warn('Datos faltantes o inválidos en login');
    return res.status(400).json({ error: 'Faltan campos o son inválidos' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role FROM users WHERE email = ? AND password = ?',
      [email, password]
    );

    if (rows.length === 0) {
      console.log('Credenciales incorrectas para usuario:', email);
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    console.log('Login exitoso para usuario:', email);
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error('Error en /api/login:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Obtener usuario por email
app.get('/api/user/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error en /api/user/:email:', err);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
});

// Servir frontend estático desde /asistencia1.5
app.use('/asistencia1.5', express.static(path.join(__dirname, 'dist')));

// Redirigir rutas SPA no API a index.html para que React Router funcione
app.get(/^\/asistencia1\.5\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
