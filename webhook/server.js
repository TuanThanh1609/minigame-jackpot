/**
 * 777 ROYALE - Webhook/API Server (Supabase)
 *
 * Deployment: Vercel hoặc Node.js host
 * Usage:
 *   - Create/find lead      → POST /api/lead
 *   - Save spin result      → POST /api/spin
 *   - Final session summary → POST /api/result
 *   - Leaderboard           → GET  /api/leaderboard
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();

// === CONFIG ===
const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || 'vyqktoyvungqtnhoqhpc';
const SUPABASE_URL = process.env.SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY. Backend must use service role key in production.');
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false, autoRefreshToken: false }
  }
);

// === MIDDLEWARE ===
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey']
}));
app.use(express.json());

// === API ===

/**
 * POST /api/lead
 * Tạo lead mới hoặc lấy lead hiện có theo phone
 */
app.post('/api/lead', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Missing phone' });
    }

    const { data: existingLeads, error: findError } = await supabase
      .from('leads')
      .select('*')
      .eq('phone', phone)
      .limit(1);

    if (findError) {
      console.error('Lead lookup error:', findError);
      return res.status(500).json({ error: 'Failed to find lead' });
    }

    if (existingLeads && existingLeads.length > 0) {
      return res.json({ exists: true, lead: existingLeads[0] });
    }

    const { data: newLead, error: insertError } = await supabase
      .from('leads')
      .insert({
        phone,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Lead insert error:', insertError);
      return res.status(500).json({ error: 'Failed to create lead' });
    }

    return res.json({ exists: false, lead: newLead });
  } catch (err) {
    console.error('Lead error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/spin
 * Lưu kết quả spin vào Supabase
 */
app.post('/api/spin', async (req, res) => {
  try {
    const { lead_id, phone, reel1, reel2, reel3 } = req.body;

    if (!phone || reel1 === undefined || reel2 === undefined || reel3 === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const isWin = reel1 === reel2 && reel2 === reel3;
    const prizeCode = isWin
      ? generatePrizeCode(phone, reel1, reel2, reel3)
      : null;

    const { data: spinData, error: spinError } = await supabase
      .from('spin_results')
      .insert({
        phone,
        lead_id: lead_id || null,
        reel1,
        reel2,
        reel3,
        is_win: isWin,
        prize_code: prizeCode,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (spinError) {
      console.error('Spin insert error:', spinError);
      return res.status(500).json({ error: 'Failed to save spin result' });
    }

    return res.json({
      success: true,
      is_win: isWin,
      prize_code: prizeCode,
      spin_id: spinData?.id || null
    });
  } catch (err) {
    console.error('Spin error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/leaderboard
 * Lấy winners gần đây
 */
app.get('/api/leaderboard', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('spin_results')
      .select('*')
      .eq('is_win', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Leaderboard error:', error);
      return res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }

    return res.json(data || []);
  } catch (err) {
    console.error('Leaderboard exception:', err);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * POST /api/result
 * Client callback — xử lý kết quả cuối cùng (sau 3 spins)
 */
app.post('/api/result', (req, res) => {
  const { phone, total_wins, total_prize, spins_played } = req.body;

  console.log(`[RESULT] ${phone} - ${spins_played} spins, ${total_wins} wins, ${total_prize} total prize`);

  return res.json({
    success: true,
    message: 'Result recorded',
    summary: {
      phone,
      spins_played: spins_played || 3,
      total_wins: total_wins || 0,
      total_prize: total_prize || 0
    }
  });
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (_req, res) => {
  const hasServiceKey = Boolean(SUPABASE_SERVICE_ROLE_KEY);

  return res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: '777-royale-supabase-api',
    supabase: {
      url: SUPABASE_URL,
      configured: hasServiceKey,
      keyMode: hasServiceKey ? 'service_role' : 'none'
    }
  });
});

// === HELPERS ===
function generatePrizeCode(phone, r1, r2, r3) {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const phoneLast = (phone || '0000').slice(-4);
  const match = [r1, r2, r3].join('');
  return `NR7-${dateStr}-${phoneLast}-${match}`;
}

// === START ===
const PORT = process.env.PORT || 3000;
if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`🎰 777 Royale Supabase API running on port ${PORT}`);
  });
}
