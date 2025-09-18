// detailed-view.js - Enhanced Detailed Stock Analysis with TwelveData and ChatGPT Integration

// Technical Analysis Functions (same as main page)
function calculateSMA(prices, period) {
    if (prices.length < period) return null;
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
}

function calculateEMA(prices, period) {
    if (prices.length < period) return null;
    const sma = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;
    const k = 2 / (period + 1);
    let ema = sma;
    
    for (let i = period; i < prices.length; i++) {
        ema = (prices[i] * k) + (ema * (1 - k));
    }
    
    return ema;
}

function calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    if (prices.length < slowPeriod + signalPeriod) return null;
    
    const fastEMAs = [];
    const slowEMAs = [];
    const macdLine = [];
    
    // Calculate fast EMA series
    if (prices.length < fastPeriod) return null;
    let fastEMA = prices.slice(0, fastPeriod).reduce((sum, p) => sum + p, 0) / fastPeriod;
    const fastK = 2 / (fastPeriod + 1);
    
    for (let i = 0; i < prices.length; i++) {
        if (i < fastPeriod) {
            fastEMAs.push(null);
        } else if (i === fastPeriod) {
            fastEMAs.push(fastEMA);
        } else {
            fastEMA = (prices[i] * fastK) + (fastEMA * (1 - fastK));
            fastEMAs.push(fastEMA);
        }
    }
    
    // Calculate slow EMA series
    let slowEMA = prices.slice(0, slowPeriod).reduce((sum, p) => sum + p, 0) / slowPeriod;
    const slowK = 2 / (slowPeriod + 1);
    
    for (let i = 0; i < prices.length; i++) {
        if (i < slowPeriod) {
            slowEMAs.push(null);
        } else if (i === slowPeriod) {
            slowEMAs.push(slowEMA);
        } else {
            slowEMA = (prices[i] * slowK) + (slowEMA * (1 - slowK));
            slowEMAs.push(slowEMA);
        }
    }
    
    // Calculate MACD line
    for (let i = 0; i < prices.length; i++) {
        if (fastEMAs[i] !== null && slowEMAs[i] !== null) {
            macdLine.push(fastEMAs[i] - slowEMAs[i]);
        } else {
            macdLine.push(null);
        }
    }
    
    // Calculate Signal line
    const validMACDValues = macdLine.filter(v => v !== null);
    if (validMACDValues.length < signalPeriod) return null;
    
    let signalEMA = validMACDValues.slice(0, signalPeriod).reduce((sum, v) => sum + v, 0) / signalPeriod;
    const signalK = 2 / (signalPeriod + 1);
    
    for (let i = signalPeriod; i < validMACDValues.length; i++) {
        signalEMA = (validMACDValues[i] * signalK) + (signalEMA * (1 - signalK));
    }
    
    const currentMACD = macdLine[macdLine.length - 1];
    const histogram = currentMACD - signalEMA;
    
    return {
        macd: currentMACD,
        signal: signalEMA,
        histogram: histogram
    };
}

function calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return null;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i <= period; i++) {
        const change = prices[prices.length - i] - prices[prices.length - i - 1];
        if (change > 0) {
            gains += change;
        } else {
            losses -= change;
        }
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

function generateTradingSignal(symbol, currentPrice, historicalPrices) {
    const signals = [];
    
    const macd = calculateMACD(historicalPrices);
    if (macd) {
        if (macd.macd > macd.signal && macd.histogram > 0) {
            signals.push({ type: 'buy', strength: 0.7, reason: 'MACD bullish crossover' });
        } else if (macd.macd < macd.signal && macd.histogram < 0) {
            signals.push({ type: 'sell', strength: 0.7, reason: 'MACD bearish crossover' });
        }
    }
    
    const rsi = calculateRSI(historicalPrices);
    if (rsi) {
        if (rsi < 30) {
            signals.push({ type: 'buy', strength: 0.8, reason: 'RSI oversold' });
        } else if (rsi > 70) {
            signals.push({ type: 'sell', strength: 0.8, reason: 'RSI overbought' });
        }
    }
    
    const sma20 = calculateSMA(historicalPrices, 20);
    const sma50 = calculateSMA(historicalPrices, 50);
    if (sma20 && sma50) {
        if (currentPrice > sma20 && sma20 > sma50) {
            signals.push({ type: 'buy', strength: 0.6, reason: 'Price above SMA20, SMA20 > SMA50' });
        } else if (currentPrice < sma20 && sma20 < sma50) {
            signals.push({ type: 'sell', strength: 0.6, reason: 'Price below SMA20, SMA20 < SMA50' });
        }
    }
    
    const buySignals = signals.filter(s => s.type === 'buy');
    const sellSignals = signals.filter(s => s.type === 'sell');
    
    if (buySignals.length > sellSignals.length) {
        const avgStrength = buySignals.reduce((sum, s) => sum + s.strength, 0) / buySignals.length;
        return {
            action: 'buy',
            confidence: Math.min(avgStrength * buySignals.length, 1),
            reasons: buySignals.map(s => s.reason),
            targetPrice: currentPrice * 1.02
        };
    } else if (sellSignals.length > buySignals.length) {
        const avgStrength = sellSignals.reduce((sum, s) => sum + s.strength, 0) / sellSignals.length;
        return {
            action: 'sell',
            confidence: Math.min(avgStrength * sellSignals.length, 1),
            reasons: sellSignals.map(s => s.reason),
            targetPrice: currentPrice * 0.98
        };
    }
    
    return {
        action: 'hold',
        confidence: 0.5,
        reasons: ['No clear signals'],
        targetPrice: currentPrice
    };
}

// Global variables
let currentSymbol = '';
let dailyChart = null;
let intradayChart = null;
let dailyData = null;
let intradayData = null;

// Tab switching functionality
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Load data if not already loaded
    if (tabName === 'intraday' && document.getElementById('intraday-content').style.display === 'none') {
        loadIntradayData(currentSymbol);
    }
    
    // Initialize ChatGPT tab if needed
    if (tabName === 'chatgpt') {
        initializeChatGPTTab();
    }
}

// ChatGPT Integration Functions
function initializeChatGPTTab() {
    const generateBtn = document.getElementById('generateAnalysisBtn');
    const statusDiv = document.getElementById('analysis-status');
    
    // Check if we have data from both intervals
    if (!dailyData || !intradayData) {
        statusDiv.className = 'analysis-status error';
        statusDiv.style.display = 'block';
        statusDiv.textContent = '⚠️ Please load data from both Daily and 30-Minute tabs first before generating AI analysis.';
        generateBtn.disabled = true;
        return;
    }
    
    // Enable the button if we have data
    generateBtn.disabled = false;
    statusDiv.style.display = 'none';
}

function generateChatGPTPrompt() {
    if (!dailyData || !intradayData) {
        throw new Error('Missing data for analysis. Please load both daily and intraday data first.');
    }
    
    // Calculate indicators for both timeframes
    const dailyRSI = calculateRSI(dailyData.historicalPrices);
    const dailyMACD = calculateMACD(dailyData.historicalPrices);
    const dailySMA20 = calculateSMA(dailyData.historicalPrices, 20);
    const dailySMA50 = calculateSMA(dailyData.historicalPrices, 50);
    
    const intradayRSI = calculateRSI(intradayData.historicalPrices);
    const intradayMACD = calculateMACD(intradayData.historicalPrices);
    const intradaySMA20 = calculateSMA(intradayData.historicalPrices, 20);
    const intradaySMA50 = calculateSMA(intradayData.historicalPrices, 50);
    
    // Format volume
    const dailyVolumeFormatted = dailyData.volume > 1000000 ? 
        (dailyData.volume / 1000000).toFixed(1) + 'M' : 
        (dailyData.volume / 1000).toFixed(0) + 'K';
    
    const intradayVolumeFormatted = intradayData.volume > 1000000 ? 
        (intradayData.volume / 1000000).toFixed(1) + 'M' : 
        (intradayData.volume / 1000).toFixed(0) + 'K';
    
    const prompt = `Analyze the following 60-day technical data (one day interval) for the symbol ${currentSymbol}: 
RSI (14) ${dailyRSI ? dailyRSI.toFixed(2) : 'N/A'} 
MACD ${dailyMACD ? dailyMACD.macd.toFixed(4) : 'N/A'} 
SMA 20 ${dailySMA20 ? dailySMA20.toFixed(2) : 'N/A'} 
SMA 50 ${dailySMA50 ? dailySMA50.toFixed(2) : 'N/A'} 
Volume ${dailyVolumeFormatted} 
High/Low ${dailyData.lowPrice.toFixed(2)} - ${dailyData.highPrice.toFixed(2)} 
and technical data with 30 minutes interval: 
RSI (14) ${intradayRSI ? intradayRSI.toFixed(2) : 'N/A'} 
MACD ${intradayMACD ? intradayMACD.macd.toFixed(4) : 'N/A'} 
SMA 20 ${intradaySMA20 ? intradaySMA20.toFixed(2) : 'N/A'} 
SMA 50 ${intradaySMA50 ? intradaySMA50.toFixed(2) : 'N/A'} 
Avg Volume ${intradayVolumeFormatted} 
30min Range ${intradayData.lowPrice.toFixed(2)} - ${intradayData.highPrice.toFixed(2)} 
Current price ${dailyData.price.toFixed(2)}. 
Identify the primary upward/downward trend, explain what these indicate about the current market sentiment. Focus on Short-term (intraday), 3 day and 5 days trading strategy`;
    
    return prompt;
}

// Replace the generateAIAnalysis function with this:
async function generateAIAnalysis() {
    const generateBtn = document.getElementById('generateAnalysisBtn');
    const statusDiv = document.getElementById('analysis-status');
    const promptDiv = document.getElementById('chatgpt-prompt');
    const responseDiv = document.getElementById('chatgpt-response');
    const placeholderDiv = document.getElementById('chatgpt-placeholder');
    const promptContent = document.getElementById('prompt-content');
    const responseContent = document.getElementById('response-content');
    
    try {
        // Disable button and show loading
        generateBtn.disabled = true;
        generateBtn.textContent = '🔄 Generating Analysis...';
        statusDiv.className = 'analysis-status loading';
        statusDiv.style.display = 'block';
        statusDiv.textContent = '🤖 Connecting to AI analysis service...';
        
        // Hide placeholder and show prompt
        placeholderDiv.style.display = 'none';
        
        // Generate and display the prompt
        const prompt = generateChatGPTPrompt();
        promptContent.textContent = prompt;
        promptDiv.style.display = 'block';
        
        // Update status
        statusDiv.textContent = '🧠 AI is analyzing your trading data...';
        
        // Call your middleware API
        const response = await fetch('http://grizzly.local:3001/api/analyze-stock', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                symbol: currentSymbol
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API request failed: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Analysis failed');
        }
        
        // Display the response
        let analysis = result.analysis;

        const headingEmojis = ["💡", "📊", "🎯", "🔄", "🚀", "⚠️", "✅"];

        // Replace "### 1. Something" with "### 🔹 Something"
        // Works for headings that start with ### and a number
        analysis = analysis.replace(/^###\s*(\d+)\./gm, (match, number) => {
            const index = parseInt(number, 10) - 1; // convert "1" → 0
            const emoji = headingEmojis[index % headingEmojis.length]; // cycle if more headings
            return `### ${emoji}`;
        });

        responseContent.innerHTML = `
            <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <strong>🤖 AI Analysis for ${result.symbol}</strong>
                <p style="margin: 5px 0; font-size: 0.9em; color: #7f8c8d;">
                    Generated: ${new Date(result.timestamp).toLocaleString()} | 
                    Model: ${result.model} | 
                    Tokens: ${result.tokensUsed}
                </p>
            </div>
    <div class="markdown-body">
        ${marked.parse(analysis)}
    </div>
        `;
        responseDiv.style.display = 'block';
        
        // Update status
        statusDiv.className = 'analysis-status success';
        statusDiv.textContent = '✅ AI analysis completed successfully!';
        
        // Hide status after delay
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
        
    } catch (error) {
        console.error('Error generating AI analysis:', error);
        statusDiv.className = 'analysis-status error';
        statusDiv.textContent = `❌ Error: ${error.message}`;
        
        // Show fallback mock analysis
        setTimeout(() => {
            const mockAnalysis = generateMockAnalysis();
            responseContent.innerHTML = `
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #ffeaa7;">
                    <strong>⚠️ Fallback Analysis (AI Service Unavailable)</strong>
                    <p style="margin: 5px 0; font-size: 0.9em; color: #856404;">
                        Using local analysis while AI service is being set up...
                    </p>
                </div>
                ${mockAnalysis}
            `;
            responseDiv.style.display = 'block';
            statusDiv.style.display = 'none';
        }, 2000);
        
    } finally {
        // Re-enable button
        generateBtn.disabled = false;
        generateBtn.textContent = '🧠 Generate AI Analysis';
    }
}

function generateMockAnalysis() {
    if (!dailyData || !intradayData) return 'Error: Missing data for analysis.';
    
    const dailyRSI = calculateRSI(dailyData.historicalPrices);
    const dailyMACD = calculateMACD(dailyData.historicalPrices);
    const intradayRSI = calculateRSI(intradayData.historicalPrices);
    const intradayMACD = calculateMACD(intradayData.historicalPrices);
    
    const currentPrice = dailyData.price;
    const dailySMA20 = calculateSMA(dailyData.historicalPrices, 20);
    const dailySMA50 = calculateSMA(dailyData.historicalPrices, 50);
    
    // Determine trend direction
    let primaryTrend = 'Neutral';
    let trendStrength = 'Moderate';
    
    if (dailyRSI && dailyMACD && dailySMA20 && dailySMA50) {
        const bullishSignals = [
            dailyRSI < 30,
            dailyMACD.macd > dailyMACD.signal,
            currentPrice > dailySMA20,
            dailySMA20 > dailySMA50
        ].filter(Boolean).length;
        
        const bearishSignals = [
            dailyRSI > 70,
            dailyMACD.macd < dailyMACD.signal,
            currentPrice < dailySMA20,
            dailySMA20 < dailySMA50
        ].filter(Boolean).length;
        
        if (bullishSignals > bearishSignals) {
            primaryTrend = 'Upward';
            trendStrength = bullishSignals >= 3 ? 'Strong' : 'Moderate';
        } else if (bearishSignals > bullishSignals) {
            primaryTrend = 'Downward';
            trendStrength = bearishSignals >= 3 ? 'Strong' : 'Moderate';
        }
    }
    
    // Generate market sentiment
    let sentiment = 'Neutral';
    if (dailyRSI) {
        if (dailyRSI > 70) sentiment = 'Overbought (Bearish)';
        else if (dailyRSI < 30) sentiment = 'Oversold (Bullish)';
        else if (dailyRSI > 50) sentiment = 'Bullish';
        else sentiment = 'Bearish';
    }
    
    return `
        <div style="line-height: 1.8;">
            <h4 style="color: #2c3e50; margin-bottom: 15px;">📊 Comprehensive Technical Analysis for ${currentSymbol}</h4>
            
            <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <strong>🎯 Primary Trend Analysis:</strong>
                <p style="margin: 8px 0;"><strong>Direction:</strong> ${primaryTrend} trend with ${trendStrength.toLowerCase()} momentum</p>
                <p style="margin: 8px 0;"><strong>Market Sentiment:</strong> ${sentiment}</p>
                <p style="margin: 8px 0;"><strong>Current Price Position:</strong> $${currentPrice.toFixed(2)} ${currentPrice > dailySMA20 ? 'above' : 'below'} 20-day moving average</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <strong>📈 Daily Interval Analysis:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>RSI (${dailyRSI ? dailyRSI.toFixed(2) : 'N/A'}): ${dailyRSI ? (dailyRSI > 70 ? 'Overbought territory - potential selling pressure' : dailyRSI < 30 ? 'Oversold territory - potential buying opportunity' : 'Neutral zone - momentum unclear') : 'Unable to calculate'}</li>
                    <li>MACD: ${dailyMACD ? (dailyMACD.macd > dailyMACD.signal ? 'Bullish crossover - upward momentum' : 'Bearish crossover - downward momentum') : 'Unable to calculate'}</li>
                    <li>Moving Averages: ${dailySMA20 && dailySMA50 ? (dailySMA20 > dailySMA50 ? 'SMA20 above SMA50 - bullish structure' : 'SMA20 below SMA50 - bearish structure') : 'Insufficient data'}</li>
                </ul>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <strong>⚡ 30-Minute Intraday Analysis:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Short-term RSI (${intradayRSI ? intradayRSI.toFixed(2) : 'N/A'}): ${intradayRSI ? (intradayRSI > 70 ? 'Short-term overbought - consider taking profits' : intradayRSI < 30 ? 'Short-term oversold - potential entry point' : 'Neutral - wait for clearer signals') : 'Unable to calculate'}</li>
                    <li>Intraday MACD: ${intradayMACD ? (intradayMACD.macd > intradayMACD.signal ? 'Short-term bullish momentum building' : 'Short-term bearish momentum building') : 'Unable to calculate'}</li>
                    <li>Volatility: ${Math.abs(intradayData.highPrice - intradayData.lowPrice) > (currentPrice * 0.02) ? 'High intraday volatility - exercise caution' : 'Normal intraday range - stable conditions'}</li>
                </ul>
            </div>
            
            <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <strong>🎯 Trading Strategy Recommendations:</strong>
                
                <div style="margin: 15px 0;">
                    <strong>📊 Short-term (Intraday):</strong>
                    <p style="margin: 5px 0; padding-left: 15px;">${primaryTrend === 'Upward' ? 
                        '• Look for pullbacks to SMA20 for entry points\n• Target resistance levels for profit-taking\n• Use tight stop-losses given intraday volatility' : 
                        primaryTrend === 'Downward' ? 
                        '• Wait for rallies to resistance for short entries\n• Support levels may provide temporary bounces\n• Avoid catching falling knives' : 
                        '• Range-bound trading between support/resistance\n• Wait for clear breakout direction\n• Use smaller position sizes'}</p>
                </div>
                
                <div style="margin: 15px 0;">
                    <strong>📈 3-Day Strategy:</strong>
                    <p style="margin: 5px 0; padding-left: 15px;">${dailyMACD && dailyMACD.macd > dailyMACD.signal ? 
                        '• MACD bullish crossover suggests upward momentum\n• Target next resistance level around $' + (currentPrice * 1.03).toFixed(2) + '\n• Stop-loss below recent support at $' + (currentPrice * 0.97).toFixed(2) : 
                        '• MACD bearish signals suggest caution\n• Wait for confirmation before new positions\n• Consider reducing exposure on rallies'}</p>
                </div>
                
                <div style="margin: 15px 0;">
                    <strong>📊 5-Day Strategy:</strong>
                    <p style="margin: 5px 0; padding-left: 15px;">${dailySMA20 && dailySMA50 && dailySMA20 > dailySMA50 ? 
                        '• Medium-term uptrend remains intact\n• Add positions on any dips to SMA20\n• Target next weekly resistance levels' : 
                        '• Medium-term structure shows weakness\n• Defensive positioning recommended\n• Wait for trend confirmation before aggressive entries'}</p>
                </div>
            </div>
            
            <div style="background: #f8d7da; padding: 15px; border-radius: 8px; border: 1px solid #f5c6cb;">
                <strong>⚠️ Risk Management Notes:</strong>
                <ul style="margin: 10px 0; padding-left: 20px; color: #721c24;">
                    <li>This analysis is based on technical indicators only and should not be considered financial advice</li>
                    <li>Always use proper position sizing and stop-loss orders</li>
                    <li>Market conditions can change rapidly - monitor for updates</li>
                    <li>Consider fundamental analysis and market news alongside technical signals</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin-top: 20px; font-style: italic; color: #7f8c8d;">
                <p>Analysis generated on ${new Date().toLocaleString()} for educational purposes only.</p>
            </div>
        </div>
    `;
}

// TwelveData API functions (same as before but storing data globally)
async function fetchTwelveDataDaily(symbol) {
    const apiKey = 'demo'; 
    
    try {
        console.log(`Fetching TwelveData daily data for ${symbol}...`);
        
        const dailyUrl = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=60&apikey=${apiKey}`;
        const response = await fetch(dailyUrl);
        
        if (!response.ok) {
            throw new Error(`TwelveData API failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'error') {
            throw new Error(`TwelveData error: ${data.message}`);
        }
        
        if (!data.values || data.values.length === 0) {
            throw new Error('No daily data from TwelveData');
        }
        
        // Process the data
        const timeSeriesData = data.values.reverse(); // Most recent first
        const historicalData = timeSeriesData.map(item => ({
            date: item.datetime,
            open: parseFloat(item.open),
            high: parseFloat(item.high),
            low: parseFloat(item.low),
            close: parseFloat(item.close),
            volume: parseInt(item.volume || 0)
        }));
        
        const currentPrice = historicalData[historicalData.length - 1].close;
        const previousPrice = historicalData.length > 1 ? historicalData[historicalData.length - 2].close : currentPrice;
        const change = currentPrice - previousPrice;
        const changePercent = (change / previousPrice) * 100;
        
        const historicalPrices = historicalData.map(d => d.close);
        const totalVolume = historicalData.reduce((sum, d) => sum + d.volume, 0);
        
        console.log(`✅ TwelveData daily data for ${symbol}: $${currentPrice.toFixed(2)}`);
        
        return {
            symbol: symbol.toUpperCase(),
            price: currentPrice,
            historicalPrices: historicalPrices,
            historicalData: historicalData,
            volume: totalVolume,
            previousClose: previousPrice,
            change: change,
            changePercent: changePercent,
            openPrice: historicalData[historicalData.length - 1].open,
            highPrice: historicalData[historicalData.length - 1].high,
            lowPrice: historicalData[historicalData.length - 1].low,
            source: `TwelveData Daily (${historicalData.length} days)`
        };
        
    } catch (error) {
        console.error(`❌ TwelveData daily error for ${symbol}:`, error.message);
        throw error;
    }
}

// TwelveData API for 30-minute intervals
async function fetchTwelveDataIntraday(symbol) {
    const apiKey = 'demo'; 
    
    try {
        console.log(`Fetching TwelveData 30min data for ${symbol}...`);
        
        const intradayUrl = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=30min&outputsize=78&apikey=${apiKey}`;
        const response = await fetch(intradayUrl);
        
        if (!response.ok) {
            throw new Error(`TwelveData API failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'error') {
            throw new Error(`TwelveData error: ${data.message}`);
        }
        
        if (!data.values || data.values.length === 0) {
            throw new Error('No intraday data from TwelveData');
        }
        
        // Process the data
        const timeSeriesData = data.values.reverse(); // Most recent first
        const historicalData = timeSeriesData.map(item => ({
            datetime: item.datetime,
            open: parseFloat(item.open),
            high: parseFloat(item.high),
            low: parseFloat(item.low),
            close: parseFloat(item.close),
            volume: parseInt(item.volume || 0)
        }));
        
        const currentPrice = historicalData[historicalData.length - 1].close;
        const previousPrice = historicalData.length > 1 ? historicalData[historicalData.length - 2].close : currentPrice;
        const change = currentPrice - previousPrice;
        const changePercent = (change / previousPrice) * 100;
        
        const historicalPrices = historicalData.map(d => d.close);
        const avgVolume = historicalData.reduce((sum, d) => sum + d.volume, 0) / historicalData.length;
        
        console.log(`✅ TwelveData intraday data for ${symbol}: ${currentPrice.toFixed(2)}`);
        
        return {
            symbol: symbol.toUpperCase(),
            price: currentPrice,
            historicalPrices: historicalPrices,
            historicalData: historicalData,
            volume: avgVolume,
            previousClose: previousPrice,
            change: change,
            changePercent: changePercent,
            openPrice: historicalData[historicalData.length - 1].open,
            highPrice: Math.max(...historicalData.slice(-1).map(d => d.high)),
            lowPrice: Math.min(...historicalData.slice(-1).map(d => d.low)),
            source: `TwelveData 30min (${historicalData.length} intervals)`
        };
        
    } catch (error) {
        console.error(`❌ TwelveData intraday error for ${symbol}:`, error.message);
        throw error;
    }
}

// Demo data generator for fallback
function generateDemoData(symbol, interval = 'daily') {
    const realisticPrices = {
        'AAPL': 175, 'GOOGL': 130, 'MSFT': 350, 'TSLA': 200, 'NVDA': 800,
        'AMZN': 145, 'META': 300, 'NFLX': 450, 'WBD': 12.26, 'DIS': 95,
        'T': 22, 'VZ': 45, 'JPM': 140, 'BAC': 35, 'GS': 380,
        'COIN': 85, 'MSTR': 180, 'RIOT': 12, 'RIVN': 15, 'LCID': 4
    };
    
    const basePrice = realisticPrices[symbol.toUpperCase()] || (Math.random() * 200 + 10);
    const currentPrice = basePrice * (0.97 + Math.random() * 0.06);
    const previousClose = basePrice * (0.98 + Math.random() * 0.04);
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;
    
    // Generate historical data
    const historicalData = [];
    const historicalPrices = [];
    let price = currentPrice;
    
    const dataPoints = interval === 'daily' ? 60 : 78;
    const timeIncrement = interval === 'daily' ? 24 * 60 * 60 * 1000 : 30 * 60 * 1000; // 1 day or 30 minutes
    
    for (let i = dataPoints; i > 0; i--) {
        const date = new Date();
        if (interval === 'daily') {
            date.setDate(date.getDate() - i);
        } else {
            date.setMinutes(date.getMinutes() - (i * 30));
        }
        
        const volatility = interval === 'daily' ? 0.02 : 0.005;
        const randomWalk = (Math.random() - 0.5) * 2;
        const meanReversion = (currentPrice - price) * 0.001;
        const priceChange = (randomWalk * volatility + meanReversion) * price;
        
        price = Math.max(price + priceChange, currentPrice * 0.3);
        
        const dataPoint = {
            close: price,
            open: price * (0.999 + Math.random() * 0.002),
            high: price * (1.001 + Math.random() * 0.002),
            low: price * (0.999 - Math.random() * 0.002),
            volume: Math.floor(Math.random() * 100000)
        };
        
        if (interval === 'daily') {
            dataPoint.date = date.toISOString().split('T')[0];
        } else {
            dataPoint.datetime = date.toISOString();
        }
        
        historicalData.push(dataPoint);
        historicalPrices.push(price);
    }
    
    return {
        symbol: symbol.toUpperCase(),
        price: currentPrice,
        historicalPrices: historicalPrices,
        historicalData: historicalData,
        volume: Math.floor(Math.random() * 50000000) + 1000000,
        previousClose: previousClose,
        change: change,
        changePercent: changePercent,
        openPrice: currentPrice * (0.99 + Math.random() * 0.02),
        highPrice: currentPrice * (1.01 + Math.random() * 0.02),
        lowPrice: currentPrice * (0.97 + Math.random() * 0.02),
        source: `Demo ${interval} Data (Simulated)`
    };
}

// Chart creation function
function createChart(canvasId, data, title, interval = 'daily') {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Destroy existing chart if it exists
    if (canvasId === 'daily-chart' && dailyChart) {
        dailyChart.destroy();
    }
    if (canvasId === 'intraday-chart' && intradayChart) {
        intradayChart.destroy();
    }
    
    const labels = data.historicalData.map(item => {
        if (interval === 'daily') {
            return new Date(item.date).toLocaleDateString();
        } else {
            return new Date(item.datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }
    });
    
    const prices = data.historicalData.map(item => item.close);
    const sma20Data = [];
    const sma50Data = [];
    
    // Calculate SMAs for chart
    for (let i = 0; i < prices.length; i++) {
        if (i >= 19) {
            sma20Data.push(calculateSMA(prices.slice(0, i + 1), 20));
        } else {
            sma20Data.push(null);
        }
        
        if (i >= 49) {
            sma50Data.push(calculateSMA(prices.slice(0, i + 1), 50));
        } else {
            sma50Data.push(null);
        }
    }
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Price',
                    data: prices,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
                },
                {
                    label: 'SMA 20',
                    data: sma20Data,
                    borderColor: '#2ecc71',
                    borderWidth: 1,
                    fill: false,
                    pointRadius: 0
                },
                {
                    label: 'SMA 50',
                    data: sma50Data,
                    borderColor: '#e74c3c',
                    borderWidth: 1,
                    fill: false,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Price ($)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: interval === 'daily' ? 'Date' : 'Time'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
    
    if (canvasId === 'daily-chart') {
        dailyChart = chart;
    } else {
        intradayChart = chart;
    }
    
    return chart;
}

// Update UI with stock data
function updateUI(data, signal, prefix) {
    const changeFormatted = data.change ? data.change.toFixed(2) : '0.00';
    const changePercentFormatted = data.changePercent ? data.changePercent.toFixed(2) : '0.00';
    const changeColor = (data.change >= 0) ? '#27ae60' : '#e74c3c';
    const changeSymbol = (data.change >= 0) ? '+' : '';
    
    // Update header
    document.getElementById(`${prefix}-symbol`).textContent = data.symbol;
    document.getElementById(`${prefix}-price`).textContent = `${data.price.toFixed(2)}`;
    document.getElementById(`${prefix}-change`).innerHTML = `
        <div style="font-size: 0.9em; color: ${changeColor}; margin-top: 5px;">
            ${changeSymbol}${changeFormatted} (${changeSymbol}${changePercentFormatted}%)
        </div>
    `;
    
    // Update source info
    let sourceBadge = '';
    if (data.source.includes('TwelveData')) {
        sourceBadge = '<span class="data-source-badge primary-source">🥇 PRIMARY</span>';
    } else {
        sourceBadge = '<span class="data-source-badge demo-source">🔵 DEMO</span>';
    }
    
    document.getElementById(`${prefix}-source-info`).innerHTML = `
        <div style="font-size: 0.8em; color: #7f8c8d;">
            ${data.source}${sourceBadge}
        </div>
    `;
    
    // Calculate indicators
    const rsi = calculateRSI(data.historicalPrices);
    const macd = calculateMACD(data.historicalPrices);
    const sma20 = calculateSMA(data.historicalPrices, 20);
    const sma50 = calculateSMA(data.historicalPrices, 50);
    
    // Update indicators
    document.getElementById(`${prefix}-rsi`).textContent = rsi ? rsi.toFixed(2) : 'N/A';
    document.getElementById(`${prefix}-rsi`).style.color = rsi ? (rsi > 70 ? '#e74c3c' : rsi < 30 ? '#27ae60' : '#2c3e50') : '#2c3e50';
    
    document.getElementById(`${prefix}-macd`).textContent = macd ? macd.macd.toFixed(4) : 'N/A';
    document.getElementById(`${prefix}-macd`).style.color = macd ? (macd.macd > macd.signal ? '#27ae60' : '#e74c3c') : '#2c3e50';
    
    document.getElementById(`${prefix}-sma20`).textContent = sma20 ? `${sma20.toFixed(2)}` : 'N/A';
    document.getElementById(`${prefix}-sma20`).style.color = sma20 ? (data.price > sma20 ? '#27ae60' : '#e74c3c') : '#2c3e50';
    
    document.getElementById(`${prefix}-sma50`).textContent = sma50 ? `${sma50.toFixed(2)}` : 'N/A';
    document.getElementById(`${prefix}-sma50`).style.color = sma50 ? (data.price > sma50 ? '#27ae60' : '#e74c3c') : '#2c3e50';
    
    const volumeFormatted = data.volume ? 
        (data.volume > 1000000 ? 
            (data.volume / 1000000).toFixed(1) + 'M' : 
            (data.volume / 1000).toFixed(0) + 'K'
        ) : 'N/A';
    document.getElementById(`${prefix}-volume`).textContent = volumeFormatted;
    
    document.getElementById(`${prefix}-range`).textContent = 
        `${data.lowPrice.toFixed(2)} - ${data.highPrice.toFixed(2)}`;
    
    // Update signal
    const confidencePercentage = Math.round(signal.confidence * 100);
    const signalElement = document.getElementById(`${prefix}-signal`);
    signalElement.textContent = `${signal.action.toUpperCase()} - ${confidencePercentage}% confidence`;
    signalElement.className = `signal ${signal.action}`;
    
    // Update analysis
    const analysisDiv = document.getElementById(`${prefix}-analysis`);
    analysisDiv.innerHTML = `
        <div style="margin-bottom: 15px;">
            <strong>Recommendation:</strong> ${signal.action.toUpperCase()} at ${signal.targetPrice.toFixed(2)}
        </div>
        <div style="margin-bottom: 15px;">
            <strong>Analysis:</strong> ${signal.reasons.join(', ')}
        </div>
        <div style="margin-bottom: 10px;">
            <strong>Technical Indicators:</strong>
            <ul style="margin-left: 20px; margin-top: 5px;">
                <li>RSI (14): ${rsi ? rsi.toFixed(2) : 'N/A'} ${rsi ? (rsi > 70 ? '(Overbought)' : rsi < 30 ? '(Oversold)' : '(Neutral)') : ''}</li>
                <li>MACD: ${macd ? macd.macd.toFixed(4) : 'N/A'} ${macd ? (macd.macd > macd.signal ? '(Bullish)' : '(Bearish)') : ''}</li>
                <li>SMA20: ${sma20 ? sma20.toFixed(2) : 'N/A'} ${sma20 ? (data.price > sma20 ? '(Above)' : '(Below)') : ''}</li>
                <li>SMA50: ${sma50 ? sma50.toFixed(2) : 'N/A'} ${sma50 ? (data.price > sma50 ? '(Above)' : '(Below)') : ''}</li>
            </ul>
        </div>
        <div style="font-size: 0.85em; color: #7f8c8d; font-style: italic;">
            ${data.source.includes('Demo') ? 
                '⚠️ Note: Analysis based on simulated data for demonstration purposes' : 
                '✅ Analysis based on real TwelveData market data'
            }
        </div>
    `;
}

// Load daily data using TwelveData
async function loadDailyData(symbol) {
    try {
        document.getElementById('daily-loading').style.display = 'flex';
        document.getElementById('daily-content').style.display = 'none';
        document.getElementById('daily-error').style.display = 'none';
        
        let data;
        try {
            data = await fetchTwelveDataDaily(symbol);
        } catch (error) {
            console.log('TwelveData daily failed, using demo data');
            data = generateDemoData(symbol, 'daily');
        }
        
        // Store data globally for ChatGPT analysis
        dailyData = data;
        
        const signal = generateTradingSignal(data.symbol, data.price, data.historicalPrices);
        
        // Create chart
        createChart('daily-chart', data, `${symbol} - Daily Price Chart`, 'daily');
        
        // Update UI
        updateUI(data, signal, 'daily');
        
        document.getElementById('daily-loading').style.display = 'none';
        document.getElementById('daily-content').style.display = 'block';
        
    } catch (error) {
        console.error('Error loading daily data:', error);
        document.getElementById('daily-loading').style.display = 'none';
        document.getElementById('daily-error').style.display = 'block';
        document.getElementById('daily-error').textContent = `Error loading daily data: ${error.message}`;
    }
}

// Load intraday data using TwelveData
async function loadIntradayData(symbol) {
    try {
        document.getElementById('intraday-loading').style.display = 'flex';
        document.getElementById('intraday-content').style.display = 'none';
        document.getElementById('intraday-error').style.display = 'none';
        
        let data;
        try {
            data = await fetchTwelveDataIntraday(symbol);
        } catch (error) {
            console.log('TwelveData intraday failed, using demo data');
            data = generateDemoData(symbol, 'intraday');
        }
        
        // Store data globally for ChatGPT analysis
        intradayData = data;
        
        const signal = generateTradingSignal(data.symbol, data.price, data.historicalPrices);
        
        // Create chart
        createChart('intraday-chart', data, `${symbol} - 30-Minute Intraday Chart`, 'intraday');
        
        // Update UI
        updateUI(data, signal, 'intraday');
        
        document.getElementById('intraday-loading').style.display = 'none';
        document.getElementById('intraday-content').style.display = 'block';
        
    } catch (error) {
        console.error('Error loading intraday data:', error);
        document.getElementById('intraday-loading').style.display = 'none';
        document.getElementById('intraday-error').style.display = 'block';
        document.getElementById('intraday-error').textContent = `Error loading 30-minute data: ${error.message}`;
    }
}

// Initialize page
window.addEventListener('load', function() {
    // Get symbol from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    currentSymbol = urlParams.get('symbol') || 'AAPL';
    
    // Update page title
    document.getElementById('stockTitle').textContent = `Detailed Analysis for ${currentSymbol}`;
    document.title = `Trading Robot - ${currentSymbol} Analysis`;
    
    // Set up tab event listeners with explicit event handling
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const tabName = this.getAttribute('data-tab');
            console.log(`Tab clicked: ${tabName}`);
            switchTab(tabName);
        });
    });
    
    // Alternative method - also add onclick handlers directly
    const dailyTab = document.querySelector('[data-tab="daily"]');
    const intradayTab = document.querySelector('[data-tab="intraday"]');
    const chatgptTab = document.querySelector('[data-tab="chatgpt"]');
    
    if (dailyTab) {
        dailyTab.onclick = function() { switchTab('daily'); };
    }
    if (intradayTab) {
        intradayTab.onclick = function() { switchTab('intraday'); };
    }
    if (chatgptTab) {
        chatgptTab.onclick = function() { switchTab('chatgpt'); };
    }
    
    // Set up ChatGPT analysis button
    const generateBtn = document.getElementById('generateAnalysisBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            generateAIAnalysis();
        });
    }
    
    // Ensure daily tab is active initially
    switchTab('daily');
    
    // Load daily data first
    loadDailyData(currentSymbol);
    
    console.log('📊 Enhanced Detailed Stock Analysis Page Loaded with ChatGPT Integration');
    console.log(`🎯 Analyzing: ${currentSymbol}`);
    console.log('📈 Daily Interval: TwelveData PRIMARY data source');
    console.log('⚡ 30-Minute Interval: TwelveData API');
    console.log('🤖 NEW: AI Analysis tab with comprehensive trading insights');
    console.log('');
    console.log('🔑 API Setup:');
    console.log('- TwelveData (Both intervals): https://twelvedata.com/');
    console.log('- Replace "demo" with your actual API key for best results');
    console.log('- Free tier: 8 calls/minute, 800 calls/day');
    console.log('');
    console.log('📊 Features:');
    console.log('- Interactive price charts with moving averages');
    console.log('- Real-time technical analysis calculations');
    console.log('- Comprehensive trading signals with confidence levels');
    console.log('- Multiple timeframe analysis (Daily vs 30-minute)');
    console.log('- 🆕 AI-powered analysis combining both timeframes');
    console.log('- Enhanced data consistency using single API provider');
});
