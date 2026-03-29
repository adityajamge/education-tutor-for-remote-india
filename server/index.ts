import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import pdfRoutes from './routes/pdfRoutes';
import suggestionsRoutes from './routes/suggestionsRoutes';

const app = express();
const port: number = Number(process.env.PORT) || 3000;
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be set in production');
}

const sessionSecret = process.env.SESSION_SECRET || 'edututor-dev-secret-key';

// --- CORS Configuration ---
// For production (Vercel -> Render), allow credentials from any origin
// For development, only allow localhost:5173
const corsOptions = isProduction
  ? {
    origin: true, // Allow any origin in production
    credentials: true,
  }
  : {
    origin: frontendOrigin,
    credentials: true,
  };

app.use(cors(corsOptions));

// Parse JSON request bodies
app.use(express.json());

// Session middleware — gives each user a unique session ID
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 30 * 60 * 1000, // 30 minutes
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax', // Required for cross-site cookies
    secure: isProduction, // Required for cross-site cookies
  },
}));

// --- Routes ---

app.use('/api', pdfRoutes);
app.use('/api/suggestions', suggestionsRoutes);

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'EduTutor API is running' });
});

// --- Start ---

app.listen(port, () => {
  console.log(`EduTutor API running at http://localhost:${port}`);
});
