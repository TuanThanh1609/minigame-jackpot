/**
 * 777 ROYALE - Webhook Server
 * Xử lý kết quả game từ NocoDB webhook hoặc trực tiếp từ client
 *
 * Deployment: vercel or any Node.js host
 * Usage:
 *   - NocoDB webhook → POST /api/webhook/nocodb
 *   - Client callback → POST /api/result
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// === MIDDLEWARE ===
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'xc-token']
}));
app.use(express.json());

// === NocoDB REST proxy ===
// Proxy requests to NocoDB to avoid CORS issues from client
const NOCO_URL = process.env.NOCO_URL || '';
const NOCO_TOKEN = process.env.NOCO_TOKEN || '';

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

    // Check if lead exists
    const checkRes = await fetch(
      `${NOCO_URL}/api/v1/db/data/v1/jackpot_777/leads?where=(phone,eq,${phone})`,
      { headers: { 'xc-token': NOCO_TOKEN } }
    );
    const checkData = await checkRes.json();

    if (checkData.list && checkData.list.length > 0) {
      // Lead exists — return existing
      return res.json({ exists: true, lead: checkData.list[0] });
    }

    // Create new lead
    const createRes = await fetch(
      `${NOCO_URL}/api/v1/db/data/v1/jackpot_777/leads`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xc-token': NOCO_TOKEN
        },
        body: JSON.stringify({
          phone,
          created_at: new Date().toISOString(),
          total_spins: 0,
          total_wins: 0,
          total_prize: 0
        })
      }
    );
    const newLead = await createRes.json();
    return res.json({ exists: false, lead: newLead });

  } catch (err) {
    console.error('Lead error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/spin
 * Lưu kết quả spin vào NocoDB
 */
app.post('/api/spin', async (req, res) => {
  try {
    const { lead_id, phone, reel1, reel2, reel3, is_win, win_amount, bet, prize_code } = req.body;

    if (!phone || reel1 === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const isWin = reel1 === reel2 && reel2 === reel3;
    const finalPrizeCode = prize_code || generatePrizeCode(phone, reel1, reel2, reel3);

    // Save spin result
    const spinRes = await fetch(
      `${NOCO_URL}/api/v1/db/data/v1/jackpot_777/spin_results`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xc-token': NOCO_TOKEN
        },
        body: JSON.stringify({
          phone,
          lead_id: lead_id || null,
          reel1,
          reel2,
          reel3,
          is_win: isWin,
          win_amount: isWin ? win_amount : 0,
          bet: bet || 10,
          prize_name: getPrizeName(reel1, isWin),
          prize_code: isWin ? finalPrizeCode : null,
          spins_remaining: Math.max(0, 3 - 1),
          created_at: new Date().toISOString()
        })
      }
    );
    const spinData = await spinRes.json();

    // Update lead stats if won
    if (isWin && lead_id) {
      const updateRes = await fetch(
        `${NOCO_URL}/api/v1/db/data/v1/jackpot_777/leads/${lead_id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'xc-token': NOCO_TOKEN
          },
          body: JSON.stringify({
            total_wins: '+1',
            total_prize: `+${win_amount || 0}`
          })
        }
      );
    }

    res.json({
      success: true,
      is_win: isWin,
      prize_code: isWin ? finalPrizeCode : null,
      spin_id: spinData.id
    });

  } catch (err) {
    console.error('Spin error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/leaderboard
 * Lấy top winners
 */
app.get('/api/leaderboard', async (req, res) => {
  try {
    const apiRes = await fetch(
      `${NOCO_URL}/api/v1/db/data/v1/jackpot_777/spin_results?sort=-win_amount&limit=10&where=(is_win,eq,true)`,
      { headers: { 'xc-token': NOCO_TOKEN } }
    );
    const data = await apiRes.json();
    res.json(data.list || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * POST /api/webhook/nocodb
 * Nhận webhook từ NocoDB (table events)
 */
app.post('/api/webhook/nocodb', (req, res) => {
  const { type, data, table } = req.body;

  // Log webhook for debugging
  console.log(`[Webhook] ${table} - ${type}`, data);

  // Handle specific events
  if (table === 'spin_results' && type === 'insert' && data?.is_win) {
    // Optional: trigger notification, update leaderboard cache, etc.
    console.log(`[WINNER] ${data.phone} won ${data.win_amount}K`);
  }

  res.json({ received: true });
});

/**
 * POST /api/result
 * Client callback — xử lý kết quả cuối cùng (sau 3 spins)
 */
app.post('/api/result', (req, res) => {
  const { phone, total_wins, total_prize, spins_played } = req.body;

  console.log(`[RESULT] ${phone} - ${spins_played} spins, ${total_wins} wins, ${total_prize} total prize`);

  // Here you could:
  // - Send notification via Facebook Messenger API
  // - Send SMS/Email
  // - Trigger CRM workflow
  // - Log to analytics

  res.json({
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
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: '777-royale-webhook'
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

function getPrizeName(matchedValue, isWin) {
  if (!isWin) return 'Không trúng';
  const names = {
    0: 'Trúng nhỏ', 1: 'Thử lại', 2: 'Lần sau nhé',
    3: 'Trúng 50K', 4: 'Trúng 100K', 5: 'Trúng 100K',
    6: 'Trúng 200K', 7: '🎉 JACKPOT 500K!', 8: 'Trúng 100K', 9: 'Trúng 100K'
  };
  return names[matchedValue] || 'Trúng thưởng';
}

// === START ===
const PORT = process.env.PORT || 3000;
if (process.env.VERCEL) {
  // Vercel serverless
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`🎰 777 Royale Webhook Server running on port ${PORT}`);
  });
}
