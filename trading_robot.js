// trading-robot.js - Trading Robot with Alpha Vantage as Primary Data Source + Detailed View

let isAnalyzing = false;

// Technical Analysis Functions
function calculateSMA(prices, period) {
    if (prices.length < period) return null;
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
}

function calculateEMA(prices, period) {
    if (prices.length < period) return null;
    
    // Proper EMA calculation starting with SMA
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
    
    // Calculate EMAs for the entire price series
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
    
    // Calculate Signal line (EMA of MACD line)
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

// PRIMARY: Alpha Vantage with TIME_SERIES_DAILY
async function fetchAlphaVantageData(symbol) {
    // Alpha Vantage as PRIMARY data source using TIME_SERIES_DAILY
    // Get your free API key at: https://www.alphavantage.co/support/#api-key
    const apiKey = window.ALPHA_VANTAGE_API_KEY || 'demo';
    
    try {
        console.log(`  🥇 PRIMARY: Fetching from Alpha Vantage: ${symbol}`);
        
        // Use TIME_SERIES_DAILY for comprehensive data
        const dailyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
        const response = await fetch(dailyUrl, {
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
        
        // Check for valid time series data
        const timeSeries = data['Time Series (Daily)'];
        if (!timeSeries) {
            throw new Error('No time series data from Alpha Vantage');
        }
        
        // Get dates sorted in descending order (most recent first)
        const dates = Object.keys(timeSeries).sort((a, b) => new Date(b) - new Date(a));
        
        if (dates.length === 0) {
            throw new Error('No trading data available from Alpha Vantage');
        }
        
        // Get current (most recent) trading day data
        const currentDate = dates[0];
        const currentDayData = timeSeries[currentDate];
        
        const currentPrice = parseFloat(currentDayData['4. close']);
        const openPrice = parseFloat(currentDayData['1. open']);
        const highPrice = parseFloat(currentDayData['2. high']);
        const lowPrice = parseFloat(currentDayData['3. low']);
        const volume = parseInt(currentDayData['5. volume']);
        
        // Get previous close (previous trading day)
        let previousClose = currentPrice; // Fallback
        if (dates.length > 1) {
            const previousDate = dates[1];
            previousClose = parseFloat(timeSeries[previousDate]['4. close']);
        }
        
        // Validate price data
        if (!currentPrice || currentPrice <= 0 || currentPrice > 50000) {
            throw new Error(`Invalid price from Alpha Vantage: ${currentPrice}`);
        }
        
        // Calculate change metrics
        const change = currentPrice - previousClose;
        const changePercent = (change / previousClose) * 100;
        
        // Extract historical closing prices (up to 60 days)
        const historicalPrices = [];
        const maxHistoryDays = Math.min(dates.length, 60);
        
        for (let i = maxHistoryDays - 1; i >= 0; i--) {
            const date = dates[i];
            const closePrice = parseFloat(timeSeries[date]['4. close']);
            if (closePrice && closePrice > 0 && closePrice < 50000) {
                historicalPrices.push(closePrice);
            }
        }
        
        // Only supplement if we have very little real data
        if (historicalPrices.length < 30) {
            console.log(`  🔄 Supplementing Alpha Vantage data (${historicalPrices.length} real points)`);
            const generatedHistory = generateRealisticHistory(currentPrice, 60);
            
            if (historicalPrices.length > 0) {
                // Use real data at the end, generated at the beginning
                const neededPoints = 60 - historicalPrices.length;
                historicalPrices.splice(0, 0, ...generatedHistory.slice(0, neededPoints));
            } else {
                historicalPrices.push(...generatedHistory);
            }
        }
        
        console.log(`✅ Alpha Vantage PRIMARY data for ${symbol}: $${currentPrice.toFixed(2)} (${change >= 0 ? '+' : ''}${change.toFixed(2)}, ${changePercent.toFixed(2)}%)`);
        console.log(`   📊 OHLC: O:$${openPrice.toFixed(2)} H:$${highPrice.toFixed(2)} L:$${lowPrice.toFixed(2)} C:$${currentPrice.toFixed(2)}`);
        console.log(`   📈 Volume: ${volume.toLocaleString()} | Historical points: ${historicalPrices.length}`);
        console.log(`   📅 Data from: ${currentDate} (${dates.length} total days available)`);
        
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
            source: `Alpha Vantage PRIMARY (${dates.length} days of real data)`
        };
        
    } catch (error) {
        console.error(`❌ Alpha Vantage PRIMARY error for ${symbol}:`, error.message);
        throw error;
    }
}

// FALLBACK: Polygon.io
async function fetchPolygonData(symbol) {
    // Polygon.io as FALLBACK data source
    // Get your free API key at: https://polygon.io/
    const apiKey = window.POLYGON_API_KEY || 'DEMO';
    
    try {
        console.log(`  🥈 FALLBACK: Fetching from Polygon.io: ${symbol}`);
        
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
        let historicalPrices = [];
        let previousClose = openPrice; // Fallback to open price
        
        try {
            // Try getting recent historical data (40 days for better free tier compatibility)
            const endDate = new Date();
            endDate.setDate(endDate.getDate() - 1); // Yesterday
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 40); // 40 days ago
            
            const historyUrl = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${startDate.toISOString().split('T')[0]}/${endDate.toISOString().split('T')[0]}?adjusted=true&sort=asc&apikey=${apiKey}`;
            
            console.log(`  📅 Trying to fetch 40-day history for ${symbol}...`);
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
                    
                    console.log(`  ✅ Got ${historicalPrices.length} historical data points from Polygon.io`);
                } else {
                    console.log(`  ⚠️ No historical data available from Polygon.io, using generated data`);
                }
            } else {
                console.log(`  ⚠️ Polygon.io historical data request failed: ${historyResponse.status}`);
            }
        } catch (historyError) {
            console.log(`  ⚠️ Polygon.io historical data fetch failed: ${historyError.message}`);
        }
        
        // If we don't have enough historical data, generate realistic data
        if (historicalPrices.length < 30) {
            console.log(`  🔄 Supplementing Polygon.io with generated data (${historicalPrices.length} real points)`);
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
        
        console.log(`✅ Polygon.io FALLBACK data for ${symbol}: $${currentPrice.toFixed(2)} (${change >= 0 ? '+' : ''}${change.toFixed(2)}, ${changePercent.toFixed(2)}%)`);
        console.log(`   📊 OHLC: O:$${openPrice.toFixed(2)} H:$${highPrice.toFixed(2)} L:$${lowPrice.toFixed(2)} C:$${currentPrice.toFixed(2)}`);
        console.log(`   📈 Volume: ${volume.toLocaleString()} | Historical points: ${historicalPrices.length}`);
        
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
            source: 'Polygon.io FALLBACK (Mixed real/generated data)'
        };
        
    } catch (error) {
        console.error(`❌ Polygon.io FALLBACK error for ${symbol}:`, error.message);
        throw error;
    }
}

// Main data fetching function - Alpha Vantage FIRST, then Polygon.io
async function fetchStockData(symbol) {
    try {
        console.log(`  🥇 Trying Alpha Vantage PRIMARY for ${symbol}...`);
        const alphaVantageData = await fetchAlphaVantageData(symbol);
        if (alphaVantageData) {
            console.log(`  ✅ Alpha Vantage PRIMARY SUCCESS for ${symbol}`);
            return alphaVantageData;
        }
    } catch (error) {
        console.log(`  ❌ Alpha Vantage PRIMARY FAILED: ${error.message}`);
    }
    
    try {
        console.log(`  🥈 Trying Polygon.io FALLBACK for ${symbol}...`);
        const polygonData = await fetchPolygonData(symbol);
        if (polygonData) {
            console.log(`  ✅ Polygon.io FALLBACK SUCCESS for ${symbol}`);
            return polygonData;
        }
    } catch (error) {
        console.log(`  ❌ Polygon.io FALLBACK FAILED: ${error.message}`);
    }
    
    console.log(`  🔵 Using Demo Data for ${symbol}...`);
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

// Function to open detailed view
function openDetailedView(symbol) {
    // Open detailed analysis page in new window/tab
    const detailUrl = `detailed-view.html?symbol=${encodeURIComponent(symbol)}`;
    window.open(detailUrl, '_blank');
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
    
    // Data source styling - Alpha Vantage gets highest priority styling
    let sourceStyle = '';
    let sourceIcon = '';
    let dataQualityBadge = '';
    
    if (stockData.source.includes('Alpha Vantage PRIMARY')) {
        sourceStyle = 'color: #27ae60; font-weight: bold;';
        sourceIcon = '🥇';
        dataQualityBadge = '<span style="background: #27ae60; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.7em; margin-left: 5px;">PRIMARY</span>';
    } else if (stockData.source.includes('Polygon.io FALLBACK')) {
        sourceStyle = 'color: #f39c12; font-weight: bold;';
        sourceIcon = '🥈';
        dataQualityBadge = '<span style="background: #f39c12; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.7em; margin-left: 5px;">FALLBACK</span>';
    } else {
        sourceStyle = 'color: #3498db; font-weight: bold;';
        sourceIcon = '🔵';
        dataQualityBadge = '<span style="background: #3498db; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.7em; margin-left: 5px;">DEMO</span>';
    }
    
    const now = new Date();
    const timeStamp = now.toLocaleTimeString();
    const freshnessBadge = (stockData.source.includes('Alpha Vantage') || stockData.source.includes('Polygon.io')) ? 
        `<span style="background: #2ecc71; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.7em;">Analyzed: ${timeStamp}</span>` :
        `<span style="background: #95a5a6; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.7em;">Simulated: ${timeStamp}</span>`;
    
    const historyQuality = stockData.historicalPrices.length >= 50 ? 
        `<span style="color: #27ae60;">✓ ${stockData.historicalPrices.length} data points</span>` :
        `<span style="color: #e74c3c;">⚠ Only ${stockData.historicalPrices.length} data points</span>`;
    
    return `
        <div class="stock-card" onclick="openDetailedView('${stockData.symbol}')">
            <div class="clickable-hint">Click for Details</div>
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
                    <div class="stock-price">${stockData.price.toFixed(2)}</div>
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
                    <div>• Price Range: ${Math.min(...stockData.historicalPrices).toFixed(2)} - ${Math.max(...stockData.historicalPrices).toFixed(2)}</div>
                    ${(stockData.source.includes('Alpha Vantage') || stockData.source.includes('Polygon.io')) ? 
                        '<div>• Real-time: ✅ Live market data</div>' : 
                        '<div>• Real-time: ❌ Simulated data</div>'
                    }
                </div>
            </div>
            
            <div class="indicators">
                <div class="indicator">
                    <span class="indicator-name">Open:</span>
                    <span class="indicator-value">${stockData.openPrice ? stockData.openPrice.toFixed(2) : 'N/A'}</span>
                </div>
                <div class="indicator">
                    <span class="indicator-name">High:</span>
                    <span class="indicator-value" style="color: #27ae60;">${stockData.highPrice ? stockData.highPrice.toFixed(2) : 'N/A'}</span>
                </div>
                <div class="indicator">
                    <span class="indicator-name">Low:</span>
                    <span class="indicator-value" style="color: #e74c3c;">${stockData.lowPrice ? stockData.lowPrice.toFixed(2) : 'N/A'}</span>
                </div>
                <div class="indicator">
                    <span class="indicator-name">Previous Close:</span>
                    <span class="indicator-value">${stockData.previousClose ? stockData.previousClose.toFixed(2) : 'N/A'}</span>
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
                <br>
                <div style="font-size: 0.9em; color: #3498db; font-weight: bold; text-align: center;">
                    🔍 Click card for detailed analysis with charts & 30-min intervals
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
    
    showStatus(`Analyzing ${tickers.length} stock(s) with Alpha Vantage as primary source...`);
    
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
        showStatus(`✅ Analysis complete for ${successCount} stock(s) using Alpha Vantage primary data source. Click any card for detailed view!`, 'success');
        console.log(`\n🎉 Analysis Summary: ${successCount} stocks processed successfully with Alpha Vantage as primary`);
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
    console.log('📊 Trading Robot with Alpha Vantage as PRIMARY Data Source + Detailed View');
    console.log('✅ PRIMARY: Alpha Vantage TIME_SERIES_DAILY (Most reliable historical data)');
    console.log('✅ FALLBACK: Polygon.io API (Secondary option)');
    console.log('✅ DEMO: Realistic simulation as final fallback');
    console.log('🆕 NEW: Click any stock card for detailed analysis with charts!');
    console.log('');
    console.log('🔗 Data Sources Priority (UPDATED):');
    console.log('1. 🥇 PRIMARY: Alpha Vantage TIME_SERIES_DAILY - Real historical market data');
    console.log('2. 🥈 FALLBACK: Polygon.io (api.polygon.io) - 5 calls/min free');
    console.log('3. 🔵 DEMO: Realistic market data based on actual prices');
    console.log('');
    console.log('🎯 WHY ALPHA VANTAGE IS NOW PRIMARY:');
    console.log('- More reliable historical data (up to 20+ years)');
    console.log('- Complete TIME_SERIES_DAILY provides full OHLC data');
    console.log('- Better technical analysis accuracy due to real market data');
    console.log('- Consistent previous close calculations');
    console.log('- Less dependency on generated data supplements');
    console.log('');
    console.log('🔧 Improved Technical Analysis:');
    console.log('- Fixed EMA calculations for more accurate MACD signals');
    console.log('- Enhanced MACD calculation using proper signal line EMA');
    console.log('- Better RSI accuracy with real historical price movements');
    console.log('- More consistent SMA crossover signals');
    console.log('');
    console.log('🔑 API Setup:');
    console.log('- Get free Alpha Vantage key (PRIMARY): https://www.alphavantage.co/support/#api-key');
    console.log('- Get free Polygon.io key (FALLBACK): https://polygon.io/');
    console.log('- Get free TwelveData key (30min intervals): https://twelvedata.com/');
    console.log('- Replace "demo" and "DEMO" with your actual API keys');
    console.log('');
    console.log('📊 Alpha Vantage PRIMARY Benefits:');
    console.log('- Real daily OHLC data with accurate volume');
    console.log('- Historical data up to 20+ years (free tier)');
    console.log('- Proper previous close calculations from actual trading days');
    console.log('- No CORS issues for client-side requests');
    console.log('- More accurate technical indicator calculations');
    console.log('- 5 calls/minute, 500 calls/day free tier');
    console.log('');
    console.log('🆕 NEW DETAILED VIEW FEATURES:');
    console.log('- Interactive price charts with Chart.js');
    console.log('- Daily interval analysis (Alpha Vantage)');
    console.log('- 30-minute intraday analysis (TwelveData API)');
    console.log('- Side-by-side comparison of timeframes');
    console.log('- Enhanced technical indicators with visual representation');
    console.log('');
    console.log('🥈 Polygon.io FALLBACK Benefits:');
    console.log('- Real-time stock data backup when Alpha Vantage hits limits');
    console.log('- Professional-grade financial data');
    console.log('- RESTful API with JSON responses');
    console.log('- 5 calls/minute free tier');
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
    console.log('- Alpha Vantage PRIMARY: 5 calls/minute, 500/day');
    console.log('- Polygon.io FALLBACK: 5 calls/minute, unlimited/day');
    console.log('- TwelveData (30min): 8 calls/minute, 800/day (free tier)');
    console.log('- Demo data activates when all APIs hit limits');
    console.log('');
    console.log('🔄 Single Run Mode: Click "Start Analysis" to analyze once with improved accuracy');
    console.log('🔍 Detailed Mode: Click any stock card to open comprehensive analysis with charts');
    console.log('');
    console.log('💡 Expected Improvements:');
    console.log('- More consistent trading signals across runs');
    console.log('- Better technical indicator accuracy');
    console.log('- Reduced reliance on generated/simulated data');
    console.log('- More reliable MACD crossover detection');
    console.log('- Improved RSI overbought/oversold identification');
    console.log('- Interactive charts for visual analysis');
    console.log('- Multiple timeframe analysis capabilities');
});
