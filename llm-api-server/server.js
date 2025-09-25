const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting (simple in-memory)
const rateLimit = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = rateLimit.get(ip) || [];
  
  // Remove requests older than 1 hour
  const recentRequests = userRequests.filter(time => now - time < 3600000);
  
  if (recentRequests.length >= 10) { // 10 requests per hour
    return false;
  }
  
  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);
  return true;
}

// ChatGPT Analysis Endpoint
app.post('/api/analyze-stock', async (req, res) => {
  try {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    // Rate limiting
    if (!checkRateLimit(clientIP)) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Try again later.',
        retryAfter: 3600
      });
    }

    const { prompt, symbol } = req.body;

    if (!prompt || !symbol) {
      return res.status(400).json({
        error: 'Missing required fields: prompt and symbol'
      });
    }

    // Enhanced prompt for better analysis
    const enhancedPrompt = `
You are a professional financial analyst. ${prompt}

Please provide a comprehensive analysis with the following structure:
1. **Market Sentiment Summary** (2-3 sentences)
2. **Technical Analysis Overview** (key indicators explanation)
3. **Short-term Strategy (Intraday)** (specific actionable recommendations)
4. **3-Day Strategy** (medium-term outlook and actions)
5. **5-Day Strategy** (weekly outlook and position management)
6. **Risk Assessment** (key risks and stop-loss recommendations)
7. **Confidence Level** (High/Medium/Low with reasoning)

Keep the analysis practical and actionable for traders. Use specific price levels when possible.
    `;

    console.log(`Analyzing ${symbol} for ${clientIP}`);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // More cost-effective than GPT-4
      messages: [
        {
          role: "system",
          content: "You are an expert financial analyst specializing in technical analysis and short-term trading strategies. Provide clear, actionable trading advice based on the technical indicators provided."
        },
        {
          role: "user",
          content: enhancedPrompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.3, // Lower temperature for more consistent analysis
    });

    const analysis = completion.choices[0].message.content;

    res.json({
      success: true,
      symbol: symbol,
      analysis: analysis,
      timestamp: new Date().toISOString(),
      model: "gpt-4o-mini",
      tokensUsed: completion.usage.total_tokens
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message,
      type: error.type || 'unknown_error'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.listen(port, () => {
  console.log(`🤖 ChatGPT Middleware running on port ${port}`);
  console.log(`🔑 OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Set' : 'Missing'}`);
});
