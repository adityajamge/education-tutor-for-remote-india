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

console.log(`[Server] NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[Server] isProduction: ${isProduction}`);

// --- Trust Proxy (required for Render / any reverse-proxy deployment) ---
if (isProduction) {
  app.set('trust proxy', 1);
}

// --- CORS Configuration ---
const corsOptions = isProduction
  ? { origin: true, credentials: true }
  : { origin: frontendOrigin, credentials: true };

app.use(cors(corsOptions));

// --- JSON parser ---
app.use(express.json());

// Error handler for JSON parsing (compatible with Express 5 body-parser)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.type === 'entity.parse.failed' || (err.name === 'SyntaxError' && (err.status === 400 || err.statusCode === 400))) {
    console.error('[JSON Error] Malformed JSON received');
    console.error('[JSON Error] URL:', req.originalUrl);
    console.error('[JSON Error] Content-Type:', req.headers['content-type']);
    console.error('[JSON Error] Message:', err.message);
    res.status(400).json({
      success: false,
      error: 'Invalid JSON in request body.'
    });
    return;
  }
  next(err);
});

app.use(express.urlencoded({ extended: true }));

// --- Session middleware ---
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 30 * 60 * 1000,
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
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
