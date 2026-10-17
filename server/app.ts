import express from 'express';
import aiRoutes from './routes/aiRoutes.ts';
import erpRoutes from './routes/erpRoutes.ts';
import principalRoutes from './routes/principalRoutes.ts';
import teacherRoutes from './routes/teacherRoutes.ts';
import webhookRoutes from './routes/webhookRoutes.ts';
import parentRoutes from './routes/parentRoutes.ts';
import qaAuditRoutes from './routes/qaAuditRoutes.ts';
import shtApiRoutes from './routes/shtApiRoutes.ts';

const app = express();

app.use(express.json());

// Enable CORS headers for cross-origin or serverless API requests
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (_req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

// Backend API Routes (dual mounted for local dev server + Vercel serverless function rewrites)
app.use('/api/sht', shtApiRoutes);
app.use('/sht', shtApiRoutes);

app.use('/api/ai', aiRoutes);
app.use('/ai', aiRoutes);

app.use('/api/erp', erpRoutes);
app.use('/erp', erpRoutes);

app.use('/api/principal', principalRoutes);
app.use('/principal', principalRoutes);

app.use('/api/teacher', teacherRoutes);
app.use('/teacher', teacherRoutes);

app.use('/api/webhooks', webhookRoutes);
app.use('/webhooks', webhookRoutes);

app.use('/api/parent', parentRoutes);
app.use('/parent', parentRoutes);

app.use('/api/qa-audit', qaAuditRoutes);
app.use('/qa-audit', qaAuditRoutes);

// General Health Check
app.get(['/api/health', '/health'], (_req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    llmProviders: {
      groq: Boolean(process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.startsWith('MY_')),
      gemini: Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('MY_')),
    },
    database: {
      supabaseConfigured: Boolean(process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('your-project')),
    },
  });
});

export default app;
