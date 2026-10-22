import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import dinerRoutes from './routes/dinerRoutes.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/diner', dinerRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'SureBite API is running smoothly.' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || (err.name === 'MulterError' ? 400 : 500);
  res.status(status).json({ message: err.message || 'An unexpected error occurred.' });
});

export default app;