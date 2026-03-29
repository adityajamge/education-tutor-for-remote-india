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

// --- CORS Configuration ---
const corsOptions = isProduction
  ? { origin: true, credentials: true }
  : { origin: frontendOrigin, credentials: true };

app.use(cors(corsOptions));

// --- JSON parser with better error handling ---
app.use(express.json());

// Error handler for JSON parsing
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.name === 'SyntaxError' && err.statusCode === 400 && 'body' in err) {
    console.log('[JSON Error] Malformed JSON received');
    console.log('[JSON Error] Raw body:', err.message);
    
    // Try to fix common issues
    const rawBody = err.message.replace("Unexpected token '", "").replace("' at position ", ":").split(":")[0];
    console.log('[JSON Error] Extracted:', rawBody);
    
    res.status(400).json({ 
      success: false, 
      error: 'Invalid JSON format. Please refresh and try again.',
      debug: err.message 
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
