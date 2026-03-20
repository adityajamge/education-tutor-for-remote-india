import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import pdfRoutes from './routes/pdfRoutes';

const app = express();
const port: number = Number(process.env.PORT) || 3000;
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be set in production');
}

const sessionSecret = process.env.SESSION_SECRET || 'edututor-dev-secret-key';

// --- Middleware ---

// Allow frontend (Vite dev server) to communicate with backend
app.use(cors({
  origin: frontendOrigin,
  credentials: true, // Required for session cookies
}));

// Parse JSON request bodies
app.use(express.json());

// Session middleware — gives each user a unique session ID
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 60 * 1000, // 30 minutes
    httpOnly: true,
    sameSite: 'lax',
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
