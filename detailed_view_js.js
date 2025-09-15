// detailed-view.js - Detailed Stock Analysis with Charts and Multiple Timeframes

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

// Tab switching functionality
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Load data if not already loaded
    if (tabName === 'intraday' && document.getElementById('intraday-content').style.display === 'none') {
        loadIntradayData(currentSymbol);
    }
}

// Alpha Vantage data fetching (same as main page)
async function fetchAlphaVantageData(symbol) {
    const apiKey = 'demo'; // Replace with your Alpha Vantage API key
    
    try {
        console.log(`Fetching Alpha Vantage data for ${symbol}...`);
        
        const dailyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
        const response = await fetch(dailyUrl);
        
        if (!response.ok) {
            throw new Error(`Alpha Vantage API failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data['Error Message']) {
            throw new Error(`Alpha Vantage error: ${data['Error Message']}`);
        }
        
        if (data['Note']) {
            throw new Error('Alpha Vantage API call frequency limit reached');
        }
        
        const timeSeries = data['Time Series (Daily)'];
        if (!timeSeries) {
            throw new Error('No time series data from Alpha Vantage');
        }
        
        const dates = Object.keys(timeSeries).sort((a, b) => new Date(b) - new Date(a));
        
        if (dates.length === 0) {
            throw new Error('No trading data available from Alpha Vantage');
        }
        
        const currentDate = dates[0];
        const currentDayData = timeSeries[currentDate];
        
        const currentPrice = parseFloat(currentDayData['4. close']);
        const openPrice = parseFloat(currentDayData['1. open']);
        const highPrice = parseFloat(currentDayData['2. high']);
        const lowPrice = parseFloat(currentDayData['3. low']);
        const volume = parseInt(currentDayData['5. volume']);
        
        let previousClose = currentPrice;
        if (dates.length > 1) {
            const previousDate = dates[1];
            previousClose = parseFloat(timeSeries[previousDate]['4. close']);
        }
        
        if (!currentPrice || currentPrice <= 0 || currentPrice > 50000) {
            throw new Error(`Invalid price from Alpha Vantage: ${currentPrice}`);
        }
        
        const change = currentPrice - previousClose;
        const changePercent = (change / previousClose) * 100;
        
        // Get historical data for chart and analysis
        const historicalData = [];
        const maxHistoryDays = Math.min(dates.length, 60);
        
        for (let i = maxHistoryDays - 1; i >= 0; i--) {
            const date = dates[i];
            const dayData = timeSeries[date];
            historicalData.push({
                date: date,
                open: parseFloat(dayData['1. open']),
                high: parseFloat(dayData['2. high']),
                low: parseFloat(dayData['3. low']),
                close: parseFloat(dayData['4. close']),
                volume: parseInt(dayData['5. volume'])
            });
        }
        
        const historicalPrices = historicalData.map(d => d.close);
        
        console.log(`✅ Alpha Vantage data for ${symbol}: $${currentPrice.toFixed(2)}`);
        
        return {
            symbol: symbol.toUpperCase(),
            price: currentPrice,
            historicalPrices: historicalPrices,
            historicalData: historicalData,
            volume: volume || 0,
            previousClose: previousClose,
            change: change,
            changePercent: changePercent,
            openPrice: openPrice,
            highPrice: highPrice,
            lowPrice: lowPrice,
            source: `Alpha Vantage PRIMARY (${dates.length} days of real data)`
        };
        
    } catch (error) {
        console.error(`❌ Alpha Vantage error for ${symbol}:`, error.message);
        throw error;
    }
}

// TwelveData API for 30-minute intervals
async function fetchTwelveDataIntraday(symbol) {
    // Replace 'demo' with your actual TwelveData API key
    // Get free API key at: https://twelvedata.com/
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
        
        console.log(`✅ TwelveData intraday data for ${symbol}: $${currentPrice.toFixed(2)}`);
        
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
        console.error(`❌ TwelveData error for ${symbol}:`, error.message);
        
        // Generate realistic intraday data as fallback
        const basePrice = 100 + Math.random() * 200; // Random base price
        const historicalData = [];
        const historicalPrices = [];
        
        for (let i = 78; i > 0; i--) {
            const time = new Date();
            time.setMinutes(time.getMinutes() - (i * 30));
            
            const volatility = 0.005; // 0.5% volatility per 30min
            const change = (Math.random() - 0.5) * 2 * volatility * basePrice;
            const price = Math.max(basePrice + change, basePrice * 0.8);
            
            historicalData.push({
                datetime: time.toISOString(),
                close: price,
                open: price * (0.999 + Math.random() * 0.002),
                high: price * (1.001 + Math.random() * 0.002),
                low: price * (0.999 - Math.random() * 0.002),
                volume: Math.floor(Math.random() * 100000)
            });
            historicalPrices.push(price);
        }
        
        const currentPrice = historicalData[historicalData.length - 1].close;
        const previousPrice = historicalData[historicalData.length - 2].close;
        const change = currentPrice - previousPrice;
        const changePercent = (change / previousPrice) * 100;
        const avgVolume = historicalData.reduce((sum, d) => sum + d.volume, 0) / historicalData.length;
        
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
            source: `Demo 30min Data (Simulated)`
        };
    }
}

// Demo data generator for daily data
function generateDemoData(symbol) {
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
    
    for (let i = 60; i > 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const volatility = 0.02;
        const randomWalk = (Math.random() - 0.5) * 2;
        const meanReversion = (currentPrice - price) * 0.001;
        const priceChange = (randomWalk * volatility + meanReversion) * price;
        
        price = Math.max(price + priceChange, currentPrice * 0.3);
        
        historicalData.push({
            date: date.toISOString().split('T')[0],
            open: price * (0.99 + Math.random() * 0.02),
            high: price * (1.01 + Math.random() * 0.02),
            low: price * (0.97 + Math.random() * 0.02),
            close: price,
            volume: Math.floor(Math.random() * 50000000) + 1000000
        });
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
        source: 'Demo Data (Realistic Pricing)'
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
    document.getElementById(`${prefix}-price`).textContent = `$${data.price.toFixed(2)}`;
    document.getElementById(`${prefix}-change`).innerHTML = `
        <div style="font-size: 0.9em; color: ${changeColor}; margin-top: 5px;">
            ${changeSymbol}${changeFormatted} (${changeSymbol}${changePercentFormatted}%)
        </div>
    `;
    
    // Update source info
    let sourceBadge = '';
    if (data.source.includes('Alpha Vantage') || data.source.includes('TwelveData')) {
        sourceBadge = '<span class="data-source-badge primary-source">🥇 PRIMARY</span>';
    } else if (data.source.includes('Polygon')) {
        sourceBadge = '<span class="data-source-badge fallback-source">🥈 FALLBACK</span>';
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
    
    document.getElementById(`${prefix}-sma20`).textContent = sma20 ? `$${sma20.toFixed(2)}` : 'N/A';
    document.getElementById(`${prefix}-sma20`).style.color = sma20 ? (data.price > sma20 ? '#27ae60' : '#e74c3c') : '#2c3e50';
    
    document.getElementById(`${prefix}-sma50`).textContent = sma50 ? `$${sma50.toFixed(2)}` : 'N/A';
    document.getElementById(`${prefix}-sma50`).style.color = sma50 ? (data.price > sma50 ? '#27ae60' : '#e74c3c') : '#2c3e50';
    
    const volumeFormatted = data.volume ? 
        (data.volume > 1000000 ? 
            (data.volume / 1000000).toFixed(1) + 'M' : 
            (data.volume / 1000).toFixed(0) + 'K'
        ) : 'N/A';
    document.getElementById(`${prefix}-volume`).textContent = volumeFormatted;
    
    document.getElementById(`${prefix}-range`).textContent = 
        `$${data.lowPrice.toFixed(2)} - $${data.highPrice.toFixed(2)}`;
    
    // Update signal
    const confidencePercentage = Math.round(signal.confidence * 100);
    const signalElement = document.getElementById(`${prefix}-signal`);
    signalElement.textContent = `${signal.action.toUpperCase()} - ${confidencePercentage}% confidence`;
    signalElement.className = `signal ${signal.action}`;
    
    // Update analysis
    const analysisDiv = document.getElementById(`${prefix}-analysis`);
    analysisDiv.innerHTML = `
        <div style="margin-bottom: 15px;">
            <strong>Recommendation:</strong> ${signal.action.toUpperCase()} at $${signal.targetPrice.toFixed(2)}
        </div>
        <div style="margin-bottom: 15px;">
            <strong>Analysis:</strong> ${signal.reasons.join(', ')}
        </div>
        <div style="margin-bottom: 10px;">
            <strong>Technical Indicators:</strong>
            <ul style="margin-left: 20px; margin-top: 5px;">
                <li>RSI (14): ${rsi ? rsi.toFixed(2) : 'N/A'} ${rsi ? (rsi > 70 ? '(Overbought)' : rsi < 30 ? '(Oversold)' : '(Neutral)') : ''}</li>
                <li>MACD: ${macd ? macd.macd.toFixed(4) : 'N/A'} ${macd ? (macd.macd > macd.signal ? '(Bullish)' : '(Bearish)') : ''}</li>
                <li>SMA20: $${sma20 ? sma20.toFixed(2) : 'N/A'} ${sma20 ? (data.price > sma20 ? '(Above)' : '(Below)') : ''}</li>
                <li>SMA50: ${sma50 ? sma50.toFixed(2) : 'N/A'} ${sma50 ? (data.price > sma50 ? '(Above)' : '(Below)') : ''}</li>
            </ul>
        </div>
        <div style="font-size: 0.85em; color: #7f8c8d; font-style: italic;">
            ${data.source.includes('Demo') ? 
                '⚠️ Note: Analysis based on simulated data for demonstration purposes' : 
                '✅ Analysis based on real market data'
            }
        </div>
    `;
}

// Load daily data
async function loadDailyData(symbol) {
    try {
        document.getElementById('daily-loading').style.display = 'flex';
        document.getElementById('daily-content').style.display = 'none';
        document.getElementById('daily-error').style.display = 'none';
        
        let data;
        try {
            data = await fetchAlphaVantageData(symbol);
        } catch (error) {
            console.log('Alpha Vantage failed, using demo data');
            data = generateDemoData(symbol);
        }
        
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

// Load intraday data
async function loadIntradayData(symbol) {
    try {
        document.getElementById('intraday-loading').style.display = 'flex';
        document.getElementById('intraday-content').style.display = 'none';
        document.getElementById('intraday-error').style.display = 'none';
        
        const data = await fetchTwelveDataIntraday(symbol);
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
    
    // Load daily data first
    loadDailyData(currentSymbol);
    
    console.log('📊 Detailed Stock Analysis Page Loaded');
    console.log(`🎯 Analyzing: ${currentSymbol}`);
    console.log('📈 Daily Interval: Alpha Vantage PRIMARY data source');
    console.log('⚡ 30-Minute Interval: TwelveData API');
    console.log('');
    console.log('🔑 API Setup:');
    console.log('- Alpha Vantage (Daily): https://www.alphavantage.co/support/#api-key');
    console.log('- TwelveData (30min): https://twelvedata.com/');
    console.log('- Replace "demo" with your actual API keys for best results');
    console.log('');
    console.log('📊 Features:');
    console.log('- Interactive price charts with moving averages');
    console.log('- Real-time technical analysis calculations');
    console.log('- Comprehensive trading signals with confidence levels');
    console.log('- Multiple timeframe analysis (Daily vs 30-minute)');
});