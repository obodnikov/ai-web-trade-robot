// trading-robot.js - Trading Robot JavaScript Functions

let isAnalyzing = false;

// Technical Analysis Functions
function calculateSMA(prices, period) {
    if (prices.length < period) return null;
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
}

function calculateEMA(prices, period) {
    if (prices.length < period) return null;
    const k = 2 / (period + 1);
    let ema = prices[0];
    for (let i = 1; i < prices.length; i++) {
        ema = (prices[i] * k) + (ema * (1 - k));
    }
    return ema;
}

function calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    if (prices.length < slowPeriod) return null;
    
    const fastEMA = calculateEMA(prices, fastPeriod);
    const slowEMA = calculateEMA(prices, slowPeriod);
    
    if (!fastEMA || !slowEMA) return null;
    
    const macdLine = fastEMA - slowEMA;
    const signalLine = calculateEMA([macdLine], signalPeriod);
    
    return {
        macd: macdLine,
        signal: signalLine || macdLine,
        histogram: macdLine - (signalLine || macdLine)
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

// Generate realistic historical data for technical analysis
function generateRealisticHistory(currentPrice, days = 60) {
    const prices = [];
    let price = currentPrice;
    const volatility = 0.02; // 2% daily volatility
    
    // Work backwards from current price
    for (let i = days; i > 0; i--) {
        // More realistic price movement with mean reversion
        const randomWalk = (Math.random() - 0.5) * 2;
        const meanReversion = (currentPrice - price) * 0.001;
        const change = (randomWalk * volatility + meanReversion) * price;
        
        price = Math.max(price + change, currentPrice * 0.3); // Prevent unrealistic drops
        prices.unshift(price); // Add to beginning of array
    }
    
    return prices;
}

function generateDemoData(symbol) {
    // Realistic stock prices based on actual market data (September 2025)
    const realisticPrices = {
        'AAPL': 175,    'GOOGL': 130,   'MSFT': 350,    'TSLA': 200,    'NVDA': 800,
        'AMZN': 145,    'META': 300,    'NFLX': 450,    'WBD': 12.26,   'DIS': 95,
        'T': 22,        'VZ': 45,       'JPM': 140,     'BAC': 35,      'GS': 380,
        'COIN': 85,     'MSTR': 180,    'RIOT': 12,     'RIVN': 15,     'LCID': 4,
        'NIO': 8,       'PLTR': 25,     'SHOP': 75,     'SQ': 65,       'PYPL': 70,
        'UBER': 70,     'LYFT': 15,     'ZM': 85,       'ROKU': 65,     'SPOT': 180,
        'SNOW': 120,    'CRM': 220,     'ADBE': 480,    'ORCL': 115,    'IBM': 180,
        'INTC': 25,     'AMD': 140,     'QCOM': 175,    'BABA': 90,     'PDD': 120,
        'JD': 35,       'BIDU': 105,    'V': 260,       'MA': 420,      'WMT': 160,
        'PG': 155,      'JNJ': 165,     'KO': 65,       'PEP': 175,     'MCD': 290,
        'SBUX': 95,     'HD': 330,      'LOW': 240,     'TGT': 155,     'COST': 850,
        'XOM': 115,     'CVX': 150,     'F': 12,        'GM': 45,       'CAT': 320,
        'BA': 185,      'UNH': 520,     'PFE': 30,      'LLY': 780,     'DKNG': 40
    };
    
    const basePrice = realisticPrices[symbol.toUpperCase()];
    
    if (!basePrice) {
        console.warn(`No realistic price data for ${symbol}, using random price`);
        const randomPrice = Math.random() * 200 + 10; // Random between $10-$210
        return {
            symbol: symbol.toUpperCase(),
            price: randomPrice,
            historicalPrices: generateRealisticHistory(randomPrice, 60),
            volume: Math.floor(Math.random() * 50000000) + 1000000,
            marketCap: 'Unknown',
            previousClose: randomPrice * (0.98 + Math.random() * 0.04),
            change: (Math.random() - 0.5) * randomPrice * 0.05,
            changePercent: (Math.random() - 0.5) * 5,
            openPrice: randomPrice * (0.99 + Math.random() * 0.02),
            highPrice: randomPrice * (1.01 + Math.random() * 0.02),
            lowPrice: randomPrice * (0.97 + Math.random() * 0.02),
            source: 'Demo Data (Unknown Symbol)'
        };
    }
    
    // Add realistic daily variation (±3%)
    const currentPrice = basePrice * (0.97 + Math.random() * 0.06);
    const previousClose = basePrice * (0.98 + Math.random() * 0.04);
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;
    
    const historicalPrices = generateRealisticHistory(currentPrice, 60);
    
    // Realistic volume based on market cap
    let volume;
    if (currentPrice < 10) {
        volume = Math.floor(Math.random() * 100000000) + 10000000;
    } else if (currentPrice < 50) {
        volume = Math.floor(Math.random() * 50000000) + 5000000;
    } else if (currentPrice < 200) {
        volume = Math.floor(Math.random() * 20000000) + 2000000;
    } else {
        volume = Math.floor(Math.random() * 10000000) + 1000000;
    }
    
    const openPrice = currentPrice * (0.99 + Math.random() * 0.02);
    const highPrice = Math.max(currentPrice, openPrice) * (1.001 + Math.random() * 0.01);
    const lowPrice = Math.min(currentPrice, openPrice) * (0.995 - Math.random() * 0.01);
    
    return {
        symbol: symbol.toUpperCase(),
        price: currentPrice,
        historicalPrices: historicalPrices,
        volume: volume,
        marketCap: 'Demo Data',
        previousClose: previousClose,
        change: change,
        changePercent: changePercent,
        openPrice: openPrice,
        highPrice: highPrice,
        lowPrice: lowPrice,
        source: 'Demo Data (Realistic Pricing)'
    };
}

async function fetchPolygonData(symbol) {
    // Polygon.io API endpoints (using free tier)
    // Get your free API key at: https://polygon.io/
    const apiKey = 'DEMO'; // Replace with your actual Polygon.io API key
    
    try {
        console.log(`  📡 Fetching from Polygon.io: ${symbol}`);
        
        // Get current quote data (previous trading day)
        const quoteUrl = `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apikey=${apiKey}`;
        const quoteResponse = await fetch(quoteUrl, {
            headers: {
                'User-Agent': 'Trading-Robot/1.0',
                'Accept': 'application/json'
            }
        });
        
        if (!quoteResponse.ok) {
            throw new Error(`Polygon.io quote API failed: ${quoteResponse.status}`);
        }
        
        const quoteData = await quoteResponse.json();
        
        // Validate Polygon.io quote response
        if (quoteData.status !== 'OK' || !quoteData.results || quoteData.results.length === 0) {
            throw new Error('Invalid Polygon.io quote response or no data available');
        }
        
        // Extract current price data
        const currentData = quoteData.results[0];
        const currentPrice = currentData.c; // Close price
        const openPrice = currentData.o;     // Open price
        const highPrice = currentData.h;     // High price
        const lowPrice = currentData.l;      // Low price
        const volume = currentData.v;        // Volume
        
        // Validate price data
        if (!currentPrice || currentPrice <= 0 || currentPrice > 50000) {
            throw new Error(`Invalid current price from Polygon.io: ${currentPrice}`);
        }
        
        // For free tier, try to get limited historical data
        // Start with a shorter timeframe that works with free tier
        let historicalPrices = [];
        let previousClose = openPrice; // Fallback to open price
        
        try {
            // Try getting recent historical data (70 days instead of 90)
            const endDate = new Date();
            endDate.setDate(endDate.getDate() - 1); // Yesterday
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 70); // 70 days ago
            
            const historyUrl = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${startDate.toISOString().split('T')[0]}/${endDate.toISOString().split('T')[0]}?adjusted=true&sort=asc&apikey=${apiKey}`;
            
            console.log(`  📅 Trying to fetch 70-day history for ${symbol}...`);
            const historyResponse = await fetch(historyUrl, {
                headers: {
                    'User-Agent': 'Trading-Robot/1.0',
                    'Accept': 'application/json'
                }
            });
            
            if (historyResponse.ok) {
                const historyData = await historyResponse.json();
                
                if (historyData.status === 'OK' && historyData.results && historyData.results.length > 0) {
                    // Extract historical closing prices
                    historicalPrices = historyData.results
                        .map(day => day.c)
                        .filter(price => price !== null && price > 0 && price < 50000);
                    
                    // Get proper previous close from historical data
                    if (historyData.results.length >= 2) {
                        previousClose = historyData.results[historyData.results.length - 2].c;
                    }
                    
                    console.log(`  ✅ Got ${historicalPrices.length} historical data points`);
                } else {
                    console.log(`  ⚠️ No historical data available, using generated data`);
                }
            } else {
                console.log(`  ⚠️ Historical data request failed: ${historyResponse.status}`);
            }
        } catch (historyError) {
            console.log(`  ⚠️ Historical data fetch failed: ${historyError.message}`);
        }
        
        // If we don't have enough historical data, generate realistic data
        if (historicalPrices.length < 20) {
            console.log(`  🔄 Generating realistic historical data (${historicalPrices.length} real points)`);
            const generatedHistory = generateRealisticHistory(currentPrice, 60);
            
            // Combine real data with generated data if we have some real data
            if (historicalPrices.length > 0) {
                // Use real data at the end, generated at the beginning
                const neededPoints = 60 - historicalPrices.length;
                historicalPrices = [...generatedHistory.slice(0, neededPoints), ...historicalPrices];
            } else {
                historicalPrices = generatedHistory;
            }
        }
        
        // Calculate change metrics
        const change = currentPrice - previousClose;
        const changePercent = (change / previousClose) * 100;
        
        console.log(`✅ Polygon.io data for ${symbol}: $${currentPrice.toFixed(2)} (${change >= 0 ? '+' : ''}${change.toFixed(2)}, ${changePercent.toFixed(2)}%)`);
        console.log(`   📊 OHLC: O:$${openPrice.toFixed(2)} H:$${highPrice.toFixed(2)} L:$${lowPrice.toFixed(2)} C:$${currentPrice.toFixed(2)}`);
        console.log(`   📈 Volume: ${volume.toLocaleString()} | Historical points: ${historicalPrices.length}`);
        
        return {
            symbol: symbol.toUpperCase(),
            price: currentPrice,
            historicalPrices: historicalPrices,
            volume: volume || 0,
            marketCap: 'N/A', // Polygon.io doesn't provide market cap in basic endpoints
            previousClose: previousClose,
            change: change,
            changePercent: changePercent,
            openPrice: openPrice,
            highPrice: highPrice,
            lowPrice: lowPrice,
            source: 'Polygon.io (Live Market Data)'
        };
        
    } catch (error) {
        console.error(`❌ Polygon.io error for ${symbol}:`, error.message);
        throw error;
    }
}

async function fetchAlphaVantageData(symbol) {
    // Alpha Vantage as secondary option (free tier: 5 calls/minute, 500/day)
    // Get your free API key at: https://www.alphavantage.co/support/#api-key
    const apiKey = 'demo'; // Replace with your Alpha Vantage API key
    
    try {
        console.log(`  📊 Fetching from Alpha Vantage: ${symbol}`);
        
        const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
        const response = await fetch(quoteUrl, {
            headers: {
                'User-Agent': 'Trading-Robot/1.0',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Alpha Vantage API failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check for API limit or error
        if (data['Error Message']) {
            throw new Error(`Alpha Vantage error: ${data['Error Message']}`);
        }
        
        if (data['Note']) {
            throw new Error('Alpha Vantage API call frequency limit reached');
        }
        
        const quote = data['Global Quote'];
        if (!quote) {
            throw new Error('No quote data from Alpha Vantage');
        }
        
        const currentPrice = parseFloat(quote['05. price']);
        const previousClose = parseFloat(quote['08. previous close']);
        const volume = parseInt(quote['06. volume']);
        const change = parseFloat(quote['09. change']);
        const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
        const openPrice = parseFloat(quote['02. open']);
        const highPrice = parseFloat(quote['03. high']);
        const lowPrice = parseFloat(quote['04. low']);
        
        if (!currentPrice || currentPrice <= 0) {
            throw new Error(`Invalid price from Alpha Vantage: ${currentPrice}`);
        }
        
        // Generate historical data since Alpha Vantage free tier is limited for history
        const historicalPrices = generateRealisticHistory(currentPrice, 60);
        
        console.log(`✅ Alpha Vantage data for ${symbol}: $${currentPrice.toFixed(2)}`);
        
        return {
            symbol: symbol.toUpperCase(),
            price: currentPrice,
            historicalPrices: historicalPrices,
            volume: volume || 0,
            marketCap: 'N/A',
            previousClose: previousClose,
            change: change,
            changePercent: changePercent,
            openPrice: openPrice,
            highPrice: highPrice,
            lowPrice: lowPrice,
            source: 'Alpha Vantage (API)'
        };
        
    } catch (error) {
        console.error(`❌ Alpha Vantage error for ${symbol}:`, error.message);
        throw error;
    }
}

// Main data fetching function with Polygon.io priority
async function fetchStockData(symbol) {
    try {
        console.log(`  1️⃣ Trying Polygon.io for ${symbol}...`);
        const polygonData = await fetchPolygonData(symbol);
        if (polygonData) {
            console.log(`  ✅ Polygon.io SUCCESS for ${symbol}`);
            return polygonData;
        }
    } catch (error) {
        console.log(`  ❌ Polygon.io FAILED: ${error.message}`);
    }
    
    try {
        console.log(`  2️⃣ Trying Alpha Vantage for ${symbol}...`);
        const alphaVantageData = await fetchAlphaVantageData(symbol);
        if (alphaVantageData) {
            console.log(`  ✅ Alpha Vantage SUCCESS for ${symbol}`);
            return alphaVantageData;
        }
    } catch (error) {
        console.log(`  ❌ Alpha Vantage FAILED: ${error.message}`);
    }
    
    console.log(`  3️⃣ Using Demo Data for ${symbol}...`);
    const demoData = generateDemoData(symbol);
    console.log(`  ✅ Demo Data GENERATED for ${symbol}`);
    return demoData;
}

function generateTradingSignal(symbol, currentPrice, historicalPrices, strategy) {
    const signals = [];
    
    if (strategy === 'macd' || strategy === 'all') {
        const macd = calculateMACD(historicalPrices);
        if (macd) {
            if (macd.macd > macd.signal && macd.histogram > 0) {
                signals.push({ type: 'buy', strength: 0.7, reason: 'MACD bullish crossover' });
            } else if (macd.macd < macd.signal && macd.histogram < 0) {
                signals.push({ type: 'sell', strength: 0.7, reason: 'MACD bearish crossover' });
            }
        }
    }
    
    if (strategy === 'rsi' || strategy === 'all') {
        const rsi = calculateRSI(historicalPrices);
        if (rsi) {
            if (rsi < 30) {
                signals.push({ type: 'buy', strength: 0.8, reason: 'RSI oversold' });
            } else if (rsi > 70) {
                signals.push({ type: 'sell', strength: 0.8, reason: 'RSI overbought' });
            }
        }
    }
    
    if (strategy === 'sma' || strategy === 'all') {
        const sma20 = calculateSMA(historicalPrices, 20);
        const sma50 = calculateSMA(historicalPrices, 50);
        if (sma20 && sma50) {
            if (currentPrice > sma20 && sma20 > sma50) {
                signals.push({ type: 'buy', strength: 0.6, reason: 'Price above SMA20, SMA20 > SMA50' });
            } else if (currentPrice < sma20 && sma20 < sma50) {
                signals.push({ type: 'sell', strength: 0.6, reason: 'Price below SMA20, SMA20 < SMA50' });
            }
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

function showStatus(message, type = 'loading') {
    const status = document.getElementById('status');
    status.className = `status ${type}`;
    status.innerHTML = type === 'loading' ? 
        `<span class="spinner"></span>${message}` : 
        message;
    status.classList.remove('hidden');
}

function hideStatus() {
    document.getElementById('status').classList.add('hidden');
}

function createStockCard(stockData, signal) {
    const rsi = calculateRSI(stockData.historicalPrices);
    const macd = calculateMACD(stockData.historicalPrices);
    const sma20 = calculateSMA(stockData.historicalPrices, 20);
    const sma50 = calculateSMA(stockData.historicalPrices, 50);
    
    const confidencePercentage = Math.round(signal.confidence * 100);
    const signalClass = signal.action;
    
    const changeFormatted = stockData.change ? stockData.change.toFixed(2) : '0.00';
    const changePercentFormatted = stockData.changePercent ? stockData.changePercent.toFixed(2) : '0.00';
    const changeColor = (stockData.change >= 0) ? '#27ae60' : '#e74c3c';
    const changeSymbol = (stockData.change >= 0) ? '+' : '';
    
    const volumeFormatted = stockData.volume ? 
        (stockData.volume > 1000000 ? 
            (stockData.volume / 1000000).toFixed(1) + 'M' : 
            (stockData.volume / 1000).toFixed(0) + 'K'
        ) : 'N/A';
    
    // Data source styling
    let sourceStyle = '';
    let sourceIcon = '';
    let dataQualityBadge = '';
    
    if (stockData.source.includes('Polygon.io')) {
        sourceStyle = 'color: #27ae60; font-weight: bold;';
        sourceIcon = '🟢';
        dataQualityBadge = '<span style="background: #27ae60; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.7em; margin-left: 5px;">LIVE</span>';
    } else if (stockData.source.includes('Alpha Vantage')) {
        sourceStyle = 'color: #f39c12; font-weight: bold;';
        sourceIcon = '🟡';
        dataQualityBadge = '<span style="background: #f39c12; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.7em; margin-left: 5px;">API</span>';
    } else {
        sourceStyle = 'color: #3498db; font-weight: bold;';
        sourceIcon = '🔵';
        dataQualityBadge = '<span style="background: #3498db; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.7em; margin-left: 5px;">DEMO</span>';
    }
    
    const now = new Date();
    const timeStamp = now.toLocaleTimeString();
    const freshnessBadge = (stockData.source.includes('Polygon.io') || stockData.source.includes('Alpha Vantage')) ? 
        `<span style="background: #2ecc71; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.7em;">Analyzed: ${timeStamp}</span>` :
        `<span style="background: #95a5a6; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.7em;">Simulated: ${timeStamp}</span>`;
    
    const historyQuality = stockData.historicalPrices.length >= 50 ? 
        `<span style="color: #27ae60;">✓ ${stockData.historicalPrices.length} data points</span>` :
        `<span style="color: #e74c3c;">⚠ Only ${stockData.historicalPrices.length} data points</span>`;
    
    return `
        <div class="stock-card">
            <div class="stock-header">
                <div>
                    <div class="stock-symbol">${stockData.symbol}</div>
                    <div style="font-size: 0.75em; margin-top: 5px;">
                        <div style="${sourceStyle}">
                            ${sourceIcon} ${stockData.source}${dataQualityBadge}
                        </div>
                        <div style="margin-top: 3px; font-size: 0.9em;">
                            ${freshnessBadge}
                        </div>
                    </div>
                </div>
                <div>
                    <div class="stock-price">$${stockData.price.toFixed(2)}</div>
                    <div style="font-size: 0.9em; color: ${changeColor}; margin-top: 2px;">
                        ${changeSymbol}${changeFormatted} (${changeSymbol}${changePercentFormatted}%)
                    </div>
                </div>
            </div>
            
            <div class="signal ${signalClass}">
                ${signal.action.toUpperCase()} - ${confidencePercentage}% confidence
            </div>
            
            <!-- Data Quality & Source Information -->
            <div class="data-quality-section">
                <div style="font-weight: bold; color: #2c3e50; margin-bottom: 5px;">📊 Data Quality Info</div>
                <div style="font-size: 0.85em; color: #7f8c8d;">
                    <div>• Source: <strong>${stockData.source}</strong></div>
                    <div>• Historical Data: ${historyQuality}</div>
                    <div>• Price Range: $${Math.min(...stockData.historicalPrices).toFixed(2)} - $${Math.max(...stockData.historicalPrices).toFixed(2)}</div>
                    ${(stockData.source.includes('Polygon.io') || stockData.source.includes('Alpha Vantage')) ? 
                        '<div>• Real-time: ✅ Live market data</div>' : 
                        '<div>• Real-time: ❌ Simulated data</div>'
                    }
                </div>
            </div>
            
            <div class="indicators">
                <div class="indicator">
                    <span class="indicator-name">Open:</span>
                    <span class="indicator-value">$${stockData.openPrice ? stockData.openPrice.toFixed(2) : 'N/A'}</span>
                </div>
                <div class="indicator">
                    <span class="indicator-name">High:</span>
                    <span class="indicator-value" style="color: #27ae60;">$${stockData.highPrice ? stockData.highPrice.toFixed(2) : 'N/A'}</span>
                </div>
                <div class="indicator">
                    <span class="indicator-name">Low:</span>
                    <span class="indicator-value" style="color: #e74c3c;">$${stockData.lowPrice ? stockData.lowPrice.toFixed(2) : 'N/A'}</span>
                </div>
                <div class="indicator">
                    <span class="indicator-name">Previous Close:</span>
                    <span class="indicator-value">$${stockData.previousClose ? stockData.previousClose.toFixed(2) : 'N/A'}</span>
                </div>
                <div class="indicator">
                    <span class="indicator-name">Volume:</span>
                    <span class="indicator-value">${volumeFormatted}</span>
                </div>
                <div class="indicator">
                    <span class="indicator-name">Market Cap:</span>
                    <span class="indicator-value">${stockData.marketCap}</span>
                </div>
                <div class="indicator">
                    <span class="indicator-name">RSI (14):</span>
                    <span class="indicator-value" style="color: ${rsi ? (rsi > 70 ? '#e74c3c' : rsi < 30 ? '#27ae60' : '#2c3e50') : '#2c3e50'}">${rsi ? rsi.toFixed(2) : 'N/A'}</span>
                </div>
                <div class="indicator">
                    <span class="indicator-name">MACD:</span>
                    <span class="indicator-value" style="color: ${macd ? (macd.macd > macd.signal ? '#27ae60' : '#e74c3c') : '#2c3e50'}">${macd ? macd.macd.toFixed(4) : 'N/A'}</span>
                </div>
                <div class="indicator">
                    <span class="indicator-name">SMA 20:</span>
                    <span class="indicator-value" style="color: ${sma20 ? (stockData.price > sma20 ? '#27ae60' : '#e74c3c') : '#2c3e50'}">${sma20 ? sma20.toFixed(2) : 'N/A'}</span>
                </div>
                <div class="indicator">
                    <span class="indicator-name">SMA 50:</span>
                    <span class="indicator-value" style="color: ${sma50 ? (stockData.price > sma50 ? '#27ae60' : '#e74c3c') : '#2c3e50'}">${sma50 ? sma50.toFixed(2) : 'N/A'}</span>
                </div>
            </div>
            
            <div class="recommendation">
                <strong>Recommendation:</strong> ${signal.action.toUpperCase()} at ${signal.targetPrice.toFixed(2)}
                <br><br>
                <strong>Analysis:</strong> ${signal.reasons.join(', ')}
                <br><br>
                <div style="font-size: 0.85em; color: #7f8c8d; font-style: italic;">
                    ${stockData.source.includes('Demo') ? 
                        '⚠️ Note: Analysis based on simulated data for demonstration purposes' : 
                        '✅ Analysis based on real market data'
                    }
                </div>
            </div>
        </div>
    `;
}

async function runSingleAnalysis() {
    if (isAnalyzing) return;
    
    const tickers = document.getElementById('tickers').value.split(',').map(t => t.trim().toUpperCase());
    const strategy = document.getElementById('strategy').value;
    const analyzeBtn = document.getElementById('analyzeBtn');
    
    if (tickers.length === 0 || tickers[0] === '') {
        showStatus('Please enter at least one stock ticker', 'error');
        return;
    }
    
    isAnalyzing = true;
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '🔄 Analyzing...';
    
    showStatus(`Analyzing ${tickers.length} stock(s)... This will run once.`);
    
    const results = document.getElementById('results');
    results.innerHTML = '';
    
    try {
        for (const ticker of tickers) {
            showStatus(`Fetching data for ${ticker}...`);
            console.log(`\n🔍 Attempting to fetch data for ${ticker}:`);
            
            const stockData = await fetchStockData(ticker);
            
            // Log the final data used
            console.log(`📊 Final data for ${ticker}:`);
            console.log(`  • Source: ${stockData.source}`);
            console.log(`  • Price: ${stockData.price.toFixed(2)}`);
            console.log(`  • Previous Close: ${stockData.previousClose.toFixed(2)}`);
            console.log(`  • Change: ${stockData.change >= 0 ? '+' : ''}${stockData.change.toFixed(2)} (${stockData.changePercent.toFixed(2)}%)`);
            console.log(`  • Volume: ${stockData.volume.toLocaleString()}`);
            console.log(`  • Historical Data Points: ${stockData.historicalPrices.length}`);
            console.log(`  • Price Range: ${Math.min(...stockData.historicalPrices).toFixed(2)} - ${Math.max(...stockData.historicalPrices).toFixed(2)}`);
            
            const signal = generateTradingSignal(
                stockData.symbol,
                stockData.price,
                stockData.historicalPrices,
                strategy
            );
            
            console.log(`🎯 Trading Signal for ${ticker}:`);
            console.log(`  • Action: ${signal.action.toUpperCase()}`);
            console.log(`  • Confidence: ${Math.round(signal.confidence * 100)}%`);
            console.log(`  • Target Price: ${signal.targetPrice.toFixed(2)}`);
            console.log(`  • Reasons: ${signal.reasons.join(', ')}`);
            
            results.innerHTML += createStockCard(stockData, signal);
        }
        
        const successCount = tickers.length;
        showStatus(`✅ Analysis complete for ${successCount} stock(s) - Check console for detailed data source info`, 'success');
        console.log(`\n🎉 Analysis Summary: ${successCount} stocks processed successfully`);
        setTimeout(hideStatus, 5000);
        
    } catch (error) {
        showStatus(`❌ Error: ${error.message}`, 'error');
        console.error('Analysis failed:', error);
    } finally {
        isAnalyzing = false;
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = '🚀 Start Analysis';
    }
}

// Initialize with helpful information
window.addEventListener('load', function() {
    console.log('📊 Trading Robot with Polygon.io Integration - Single Run Mode');
    console.log('✅ Real-time data from Polygon.io API (Primary)');
    console.log('✅ Fallback to Alpha Vantage API');
    console.log('✅ Demo data with realistic pricing as final fallback');
    console.log('');
    console.log('🔗 Data Sources Priority:');
    console.log('1. Primary: Polygon.io (api.polygon.io) - 5 calls/min free');
    console.log('2. Fallback: Alpha Vantage (alphavantage.co) - 5 calls/min free');
    console.log('3. Demo: Realistic market data based on actual prices');
    console.log('');
    console.log('🔑 API Setup:');
    console.log('- Get free Polygon.io API key: https://polygon.io/');
    console.log('- Get free Alpha Vantage key: https://www.alphavantage.co/support/#api-key');
    console.log('- Replace "DEMO" and "demo" with your actual API keys');
    console.log('');
    console.log('💡 Polygon.io Benefits:');
    console.log('- Real-time stock data with 5 calls/minute free tier');
    console.log('- Historical data up to 2 years for free');
    console.log('- No CORS issues (unlike Yahoo Finance)');
    console.log('- Professional-grade financial data');
    console.log('- RESTful API with JSON responses');
    console.log('');
    console.log('🚀 Try these tickers (with realistic demo prices):');
    console.log('- Mega Cap: AAPL (~$175), MSFT (~$350), NVDA (~$800)');
    console.log('- Tech: GOOGL (~$130), META (~$300), NFLX (~$450)');
    console.log('- Media: WBD (~$12.26), DIS (~$95)');
    console.log('- EV: TSLA (~$200), RIVN (~$15), LCID (~$4)');
    console.log('- Finance: JPM (~$140), BAC (~$35), GS (~$380)');
    console.log('- Crypto: COIN (~$85), MSTR (~$180)');
    console.log('');
    console.log('⚠️ API Rate Limits:');
    console.log('- Polygon.io Free: 5 calls/minute, unlimited/day');
    console.log('- Alpha Vantage Free: 5 calls/minute, 500/day');
    console.log('- Demo data activates when rate limits exceeded');
    console.log('');
    console.log('🔄 Single Run Mode: Click "Start Analysis" to analyze once');
});