import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Look for .env in the server directory (where this file lives)
const serverDir = path.resolve(__dirname, '..');
const envCandidates = [path.join(serverDir, '.env'), path.join(process.cwd(), '.env.server'), path.join(process.cwd(), '.env')];
const envPath = envCandidates.find((filePath) => fs.existsSync(filePath));

if (envPath) {
  dotenv.config({ path: envPath });
  console.log(`Loaded environment from: ${envPath}`);
} else {
  console.warn('No .env file found. Using system environment variables.');
}

const app = express();
// Railway/Render use PORT, but we allow API_PORT for local dev
const PORT = parseInt(process.env.PORT || process.env.API_PORT || '4000', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'paintings';
const JWT_SECRET = process.env.JWT_SECRET || 'stockhaus-secret';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ CRITICAL: Supabase environment variables are missing.');
  console.error('   Required variables:');
  console.error('   - SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Set these in Railway → Service → Variables');
  throw new Error('Supabase environment variables are missing.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

type InternalUser = { username: string; password: string };
const parseAuthUsers = (raw: string | undefined): InternalUser[] => {
  if (!raw) return [];
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [username, password] = entry.split(':');
      if (!username || !password) {
        throw new Error(`Invalid AUTH_USERS entry: ${entry}`);
      }
      return { username, password };
    });
};

const INTERNAL_USERS = parseAuthUsers(process.env.AUTH_USERS);
if (!INTERNAL_USERS.length) {
  console.error('❌ CRITICAL: No internal users configured.');
  console.error('   Set AUTH_USERS environment variable in Railway.');
  console.error('   Format: username1:password1,username2:password2');
  throw new Error('No internal users configured. Set AUTH_USERS in env.');
}

console.log(`✅ Loaded ${INTERNAL_USERS.length} internal user(s): ${INTERNAL_USERS.map(u => u.username).join(', ')}`);
console.log(`✅ Supabase URL: ${SUPABASE_URL ? 'Set' : '✗ MISSING'}`);
console.log(`✅ Service Role Key: ${SUPABASE_SERVICE_ROLE_KEY ? 'Set (' + SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...)' : '✗ MISSING'}`);
console.log(`✅ JWT Secret: ${JWT_SECRET ? 'Set' : '✗ MISSING'}`);
console.log(`✅ Port: ${PORT}`);
console.log(`✅ CORS Origin: ${CORS_ORIGIN}`);

interface AuthenticatedRequest extends Request {
  user?: {
    username: string;
    supabaseUserId: string;
  };
}

const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const paintingSchema = z.object({
  serialNumber: z.string().min(1),
  name: z.string().min(1),
  width: z.number().positive(),
  height: z.number().positive(),
  unit: z.enum(['cm', 'in']),
  quantity: z.number().int().positive(),
  rate: z.number().nonnegative().optional(),
  imageBase64: z.string().min(1),
});

const paintingUpdateSchema = paintingSchema.partial();

const corsOrigins = CORS_ORIGIN.split(',').map((origin) => origin.trim());
console.log('✅ CORS Origins:', corsOrigins);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    console.log(`🔍 CORS: Checking origin: ${origin}`);
    console.log(`🔍 CORS: Allowed origins: ${corsOrigins.join(', ')}`);
    
    // Normalize origins (remove trailing slashes)
    const normalizedOrigin = origin.replace(/\/$/, '');
    const normalizedAllowed = corsOrigins.map(o => o.replace(/\/$/, ''));
    
    if (normalizedAllowed.includes(normalizedOrigin)) {
      console.log(`✅ CORS: Allowing origin: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked origin: ${origin}`);
      console.warn(`   Normalized: ${normalizedOrigin}`);
      console.warn(`   Allowed origins: ${corsOrigins.join(', ')}`);
      console.warn(`   Add "${origin}" to CORS_ORIGIN in Railway Variables`);
      callback(new Error(`CORS: Origin ${origin} is not allowed. Add it to CORS_ORIGIN in Railway.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type'],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '20mb' }));

const timingSafeEqual = (a: string, b: string) => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Missing authorization header' });
    }
    const token = authHeader.replace('Bearer ', '');
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string; supabaseUserId: string };
    req.user = { username: payload.sub, supabaseUserId: payload.supabaseUserId };
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const ensureSupabaseUser = async (username: string): Promise<string> => {
  const email = `${username}@stockhaus.internal`;
  const existing = await supabase.auth.admin.listUsers();
  const match = existing.data?.users?.find((user) => user.email?.toLowerCase() === email.toLowerCase());
  if (match) {
    return match.id;
  }

  const created = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    password: crypto.randomUUID(),
    user_metadata: { username },
  });
  if (!created.data?.user || created.error) {
    throw created.error || new Error('Unable to create Supabase user');
  }
  return created.data.user.id;
};

const uploadImage = async (userId: string, projectId: string, base64: string): Promise<string> => {
  const matches = base64.match(/^data:(.+);base64,(.+)$/);
  const mimeType = matches ? matches[1] : 'image/jpeg';
  const data = matches ? matches[2] : base64;
  const buffer = Buffer.from(data, 'base64');
  const extension = mimeType.split('/')[1] || 'jpg';
  const objectPath = `${userId}/${projectId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(objectPath, buffer, {
    contentType: mimeType,
    upsert: true,
  });
  if (error) throw error;

  const { data: publicData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(objectPath);
  if (!publicData?.publicUrl) {
    throw new Error('Unable to retrieve image URL');
  }
  return publicData.publicUrl;
};

const mapProject = (row: any) => ({
  id: row.id,
  name: row.name,
  description: row.description ?? undefined,
  createdAt: new Date(row.created_at).getTime(),
  lastAccessed: new Date(row.last_accessed).getTime(),
  itemCount: row.item_count ?? 0,
});

const mapPainting = (row: any) => ({
  id: row.id,
  serialNumber: row.serial_number,
  name: row.name,
  width: row.width,
  height: row.height,
  unit: row.unit,
  quantity: row.quantity,
  rate: row.rate ?? undefined,
  imageUrl: row.image_url,
  createdAt: new Date(row.created_at).getTime(),
  updatedAt: new Date(row.updated_at).getTime(),
});

const verifyProjectOwnership = async (projectId: string, userId: string) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

const refreshProjectMetadata = async (projectId: string) => {
  const { count } = await supabase
    .from('paintings')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId);

  await supabase
    .from('projects')
    .update({
      item_count: count ?? 0,
      last_accessed: new Date().toISOString(),
    })
    .eq('id', projectId);
};

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

// CORS test endpoint
app.get('/api/cors-test', (_req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'CORS is working',
    origin: _req.headers.origin,
    allowedOrigins: corsOrigins
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const user = INTERNAL_USERS.find((u) => u.username === username);
  if (!user || !timingSafeEqual(user.password, password)) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  try {
    const supabaseUserId = await ensureSupabaseUser(username);
    const token = jwt.sign({ sub: username, supabaseUserId }, JWT_SECRET, { expiresIn: '12h' });
    return res.json({ token, username });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to create session.' });
  }
});

app.get('/api/auth/me', authenticate, (req: AuthenticatedRequest, res) => {
  res.json({ username: req.user!.username });
});

app.get('/api/projects', authenticate, async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', req.user!.supabaseUserId)
    .order('last_accessed', { ascending: false });

  if (error) return res.status(500).json({ message: error.message });
  return res.json((data || []).map(mapProject));
});

app.post('/api/projects', authenticate, async (req: AuthenticatedRequest, res) => {
  const parsed = projectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  const timestamp = new Date().toISOString();
  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: req.user!.supabaseUserId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      created_at: timestamp,
      last_accessed: timestamp,
      item_count: 0,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });
  return res.status(201).json(mapProject(data));
});

app.delete('/api/projects/:projectId', authenticate, async (req: AuthenticatedRequest, res) => {
  const project = await verifyProjectOwnership(req.params.projectId, req.user!.supabaseUserId);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const { error } = await supabase.from('projects').delete().eq('id', project.id);
  if (error) return res.status(500).json({ message: error.message });
  return res.status(204).send();
});

app.get('/api/projects/:projectId', authenticate, async (req: AuthenticatedRequest, res) => {
  const project = await verifyProjectOwnership(req.params.projectId, req.user!.supabaseUserId);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  return res.json(mapProject(project));
});

app.get('/api/projects/:projectId/paintings', authenticate, async (req: AuthenticatedRequest, res) => {
  const project = await verifyProjectOwnership(req.params.projectId, req.user!.supabaseUserId);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const { data, error } = await supabase
    .from('paintings')
    .select('*')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ message: error.message });
  return res.json((data || []).map(mapPainting));
});

app.post('/api/projects/:projectId/paintings', authenticate, async (req: AuthenticatedRequest, res) => {
  const parsed = paintingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  const project = await verifyProjectOwnership(req.params.projectId, req.user!.supabaseUserId);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  try {
    const imageUrl = await uploadImage(req.user!.supabaseUserId, project.id, parsed.data.imageBase64);
    const timestamp = new Date().toISOString();
    const { data, error } = await supabase
      .from('paintings')
      .insert({
        user_id: req.user!.supabaseUserId,
        project_id: project.id,
        serial_number: parsed.data.serialNumber,
        name: parsed.data.name,
        width: parsed.data.width,
        height: parsed.data.height,
        unit: parsed.data.unit,
        quantity: parsed.data.quantity,
        rate: parsed.data.rate ?? null,
        image_url: imageUrl,
        created_at: timestamp,
        updated_at: timestamp,
      })
      .select()
      .single();
    if (error) return res.status(500).json({ message: error.message });
    await refreshProjectMetadata(project.id);
    return res.status(201).json(mapPainting(data));
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message || 'Unable to save painting.' });
  }
});

app.put('/api/projects/:projectId/paintings/:paintingId', authenticate, async (req: AuthenticatedRequest, res) => {
  const parsed = paintingUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  const project = await verifyProjectOwnership(req.params.projectId, req.user!.supabaseUserId);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const { data: existing, error: fetchError } = await supabase
    .from('paintings')
    .select('*')
    .eq('project_id', project.id)
    .eq('id', req.params.paintingId)
    .maybeSingle();
  if (fetchError) return res.status(500).json({ message: fetchError.message });
  if (!existing) return res.status(404).json({ message: 'Painting not found' });

  let imageUrl = existing.image_url;
  if (parsed.data.imageBase64) {
    imageUrl = await uploadImage(req.user!.supabaseUserId, project.id, parsed.data.imageBase64);
  }

  const payload: Record<string, unknown> = {
    serial_number: parsed.data.serialNumber ?? existing.serial_number,
    name: parsed.data.name ?? existing.name,
    width: parsed.data.width ?? existing.width,
    height: parsed.data.height ?? existing.height,
    unit: parsed.data.unit ?? existing.unit,
    quantity: parsed.data.quantity ?? existing.quantity,
    rate: parsed.data.rate ?? existing.rate,
    image_url: imageUrl,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('paintings')
    .update(payload)
    .eq('id', req.params.paintingId)
    .eq('project_id', project.id)
    .select()
    .single();
  if (error) return res.status(500).json({ message: error.message });
  await refreshProjectMetadata(project.id);
  return res.json(mapPainting(data));
});

app.delete('/api/projects/:projectId/paintings/:paintingId', authenticate, async (req: AuthenticatedRequest, res) => {
  const project = await verifyProjectOwnership(req.params.projectId, req.user!.supabaseUserId);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const { error } = await supabase
    .from('paintings')
    .delete()
    .eq('id', req.params.paintingId)
    .eq('project_id', project.id);
  if (error) return res.status(500).json({ message: error.message });
  await refreshProjectMetadata(project.id);
  return res.status(204).send();
});

// Error handling for uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});

console.log(`\n🔧 Starting server...`);
console.log(`🔧 PORT env var: ${process.env.PORT || 'not set'}`);
console.log(`🔧 API_PORT env var: ${process.env.API_PORT || 'not set'}`);
console.log(`🔧 Using port: ${PORT}`);

try {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 StockHaus API running on http://0.0.0.0:${PORT}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ All systems ready!\n`);
  });
  
  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
    } else {
      console.error('❌ Server error:', error);
    }
    process.exit(1);
  });
} catch (error: any) {
  console.error('❌ Failed to start server:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

