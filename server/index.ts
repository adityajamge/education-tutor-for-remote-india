import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import pdfRoutes from './routes/pdfRoutes';

const app = express();
const port: number = 3000;

// --- Middleware ---

// Allow frontend (Vite dev server) to communicate with backend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, // Required for session cookies
}));

// Parse JSON request bodies
app.use(express.json());

// Session middleware — gives each user a unique session ID
app.use(session({
  secret: 'edututor-dev-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 30 * 60 * 1000, // 30 minutes
    httpOnly: true,
  },
}));

// --- Routes ---

app.use('/api', pdfRoutes);

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'EduTutor API is running' });
});

// --- Start ---

app.listen(port, () => {
  console.log(`EduTutor API running at http://localhost:${port}`);
});