import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Server-side Gemini initialization
const apiKey = process.env.GEMINI_API_KEY;
const aiClient = apiKey 
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    })
  : null;

// AI Coach endpoint
app.post('/api/coach', async (req, res) => {
  try {
    const { historySummary, hardcoreMode } = req.body;

    if (!aiClient) {
      // Fallback if no API Key configured
      return res.json({
        recommendation: `“Zenji watches over your path. You have logged activities: [${historySummary || 'No recent logs'}]. Maintain Stoic concentration and keep the focus shield strong!”`
      });
    }

    const systemPrompt = 
      "You are Zenji, a wise, serene, yet slightly humorous Stoic panda who is a digital wellness mentor. " +
      "You analyze the user's weekly screen time, focus minutes, and blocked deflection counts. " +
      "You give them exactly 2-3 sentences of deeply philosophical, practical, and highly engaging Stoic coaching. " +
      "Maintain a warm, centered, friendly panda-monk persona. Refer to yourself as 'Zenji' in the third person. " +
      "Use elegant, clear markdown style and avoid flowery meta-speak or technical logs. Keep it highly personalized to their stats.";

    const prompt = `Here are my statistics for this week: ${historySummary || 'No data yet'}. ` +
      `I have Hardcore Shield Lock turned ${hardcoreMode ? 'ON' : 'OFF'}. ` +
      `Give me my Stoic digital wellness analysis and actionable Zen advice!`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
      }
    });

    const recommendation = response.text || `“Zenji observes that you are maintaining Stoic concentration, but the scroll connection is deep in the clouds. Take a breath and continue.”`;
    res.json({ recommendation });
  } catch (error) {
    console.error('Error in AI Coach server handler:', error);
    res.status(500).json({ error: 'Failed to retrieve AI coach advice' });
  }
});

// Vite middleware or Static files serving
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

setupServer();
