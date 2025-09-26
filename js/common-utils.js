// common-utils.js - Shared utilities and configuration for detailed view

// Configuration variables
const CANDLESTICK_CHART_CANDLES = 20; // Number of candles to show on chart

// Technical Analysis Functions
function calculateSMA(prices, period) {
    if (!prices || !Array.isArray(prices) || prices.length < period) return [];

    const smaArray = [];
    for (let i = 0; i < prices.length; i++) {
        if (i < period - 1) {
            smaArray.push(null);
        } else {
            const slice = prices.slice(i - period + 1, i + 1);
            const sum = slice.reduce((a, b) => a + b, 0);
            smaArray.push(sum / period);
        }
    }
    return smaArray;
}

function calculateEMA(prices, period) {
    if (!prices || !Array.isArray(prices) || prices.length < period) return [];

    const emaArray = [];
    const k = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;

    // Fill initial values with null
    for (let i = 0; i < period - 1; i++) {
        emaArray.push(null);
    }

    // First EMA value is the SMA
    emaArray.push(ema);

    // Calculate remaining EMA values
    for (let i = period; i < prices.length; i++) {
        ema = (prices[i] * k) + (ema * (1 - k));
        emaArray.push(ema);
    }

    return emaArray;
}

function calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    if (!prices || !Array.isArray(prices) || prices.length < slowPeriod + signalPeriod) return null;

    const fastEMAs = [];
    const slowEMAs = [];
    const macdLine = [];

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

    for (let i = 0; i < prices.length; i++) {
        if (fastEMAs[i] !== null && slowEMAs[i] !== null) {
            macdLine.push(fastEMAs[i] - slowEMAs[i]);
        } else {
            macdLine.push(null);
        }
    }

    // Calculate signal EMA array
    const signalEMAs = [];
    const validMACDIndices = [];

    // Find valid MACD indices
    for (let i = 0; i < macdLine.length; i++) {
        if (macdLine[i] !== null) {
            validMACDIndices.push(i);
        }
        signalEMAs.push(null);
    }

    if (validMACDIndices.length < signalPeriod) return null;

    // Calculate signal EMA starting from first valid MACD values
    const startIndex = validMACDIndices[signalPeriod - 1];
    let signalEMA = 0;

    // Initial SMA for signal
    for (let i = 0; i < signalPeriod; i++) {
        signalEMA += macdLine[validMACDIndices[i]];
    }
    signalEMA = signalEMA / signalPeriod;
    signalEMAs[startIndex] = signalEMA;

    const signalK = 2 / (signalPeriod + 1);

    // Continue with EMA calculation
    for (let i = signalPeriod; i < validMACDIndices.length; i++) {
        const index = validMACDIndices[i];
        signalEMA = (macdLine[index] * signalK) + (signalEMA * (1 - signalK));
        signalEMAs[index] = signalEMA;
    }

    // Calculate histogram array
    const histogram = [];
    for (let i = 0; i < macdLine.length; i++) {
        if (macdLine[i] !== null && signalEMAs[i] !== null) {
            histogram.push(macdLine[i] - signalEMAs[i]);
        } else {
            histogram.push(null);
        }
    }

    return {
        macd: macdLine,
        signal: signalEMAs,
        histogram: histogram
    };
}

function calculateRSI(prices, period = 14) {
    if (!prices || !Array.isArray(prices) || prices.length < period + 1) return [];

    const rsiArray = [];

    // Fill initial values with null
    for (let i = 0; i < period; i++) {
        rsiArray.push(null);
    }

    // Calculate RSI for each point
    for (let i = period; i < prices.length; i++) {
        let gains = 0;
        let losses = 0;

        // Look at the last 'period' changes
        for (let j = i - period + 1; j <= i; j++) {
            const change = prices[j] - prices[j - 1];
            if (change > 0) {
                gains += change;
            } else {
                losses -= change;
            }
        }

        const avgGain = gains / period;
        const avgLoss = losses / period;

        if (avgLoss === 0) {
            rsiArray.push(100);
        } else {
            const rs = avgGain / avgLoss;
            const rsi = 100 - (100 / (1 + rs));
            rsiArray.push(rsi);
        }
    }

    return rsiArray;
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
let intraday15Chart = null;
let intraday5Chart = null;
let candlestickChart = null;
let candlestick5Chart = null;
let dailyData = null;
let intradayData = null;
let intraday15Data = null;
let intraday5Data = null;
let detectedPatterns = [];
let detectedPatterns5 = [];

// Helper function to format datetime consistently across all charts
// Format: ${day}-${month} ${hours}:${minutes} with 24-hour format
function formatChartDateTime(datetime) {
    const d = new Date(datetime);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}.${month} ${hours}:${minutes}`;
}

// Common function to show datetime
function formatDateTimeWithYear(datetime) {
    const d = new Date(datetime);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
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

    for (let i = dataPoints; i > 0; i--) {
        const date = new Date();
        if (interval === 'daily') {
            date.setDate(date.getDate() - i);
        } else if (interval === 'intraday15') {
            date.setMinutes(date.getMinutes() - (i * 15));
        } else if (interval === 'intraday5') {
            date.setMinutes(date.getMinutes() - (i * 5));
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

// Tab switching functionality
function switchTab(tabName) {
    console.log(`Switching to tab: ${tabName}`);

    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Load data based on tab with proper sequencing
    if (tabName === 'daily') {
        loadDailyData();
    }

    if (tabName === 'intraday') {
        loadIntradayData();
    }

    if (tabName === 'intraday15') {
        loadIntraday15Data();
    }

    if (tabName === 'intraday5') {
        loadIntraday5Data();
    }

    if (tabName === 'candlestick') {
        loadCandlestickData();
    }

    if (tabName === 'candlestick5') {
        loadCandlestick5Data();
    }

    if (tabName === 'chatgpt') {
        // AI analysis tab doesn't need data loading by default
        console.log('AI Analysis tab activated');
    }
}

// Generic chart creation function
function createGenericChart(canvasId, data, title, interval = 'daily') {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // Destroy existing chart
    const chartRef = getChartReference(canvasId);
    if (chartRef && chartRef.chart) {
        chartRef.chart.destroy();
    }

    const labels = data.historicalData.map(item => {
        if (interval === 'daily') {
            return new Date(item.date).toLocaleDateString();
        } else {
            return formatChartDateTime(item.datetime);
        }
    });

    const prices = data.historicalData.map(item => item.close);
    const sma20Data = [];
    const sma50Data = [];

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
                title: { display: true, text: title },
                legend: { display: true, position: 'top' }
            },
            scales: {
                y: { beginAtZero: false, title: { display: true, text: 'Price ($)' }},
                x: { title: { display: true, text: interval === 'daily' ? 'Date' : 'Time' }}
            },
            interaction: { intersect: false, mode: 'index' }
        }
    });

    // Store chart reference
    setChartReference(canvasId, chart);
    return chart;
}

// Chart reference management
function getChartReference(canvasId) {
    switch(canvasId) {
        case 'daily-chart': return { chart: dailyChart };
        case 'intraday-chart': return { chart: intradayChart };
        case 'intraday15-chart': return { chart: intraday15Chart };
        case 'intraday5-chart': return { chart: intraday5Chart };
        case 'candlestick-chart': return { chart: candlestickChart };
        case 'candlestick5-chart': return { chart: candlestick5Chart };
        default: return { chart: null };
    }
}

function setChartReference(canvasId, chart) {
    switch(canvasId) {
        case 'daily-chart': dailyChart = chart; break;
        case 'intraday-chart': intradayChart = chart; break;
        case 'intraday15-chart': intraday15Chart = chart; break;
        case 'intraday5-chart': intraday5Chart = chart; break;
        case 'candlestick-chart': candlestickChart = chart; break;
        case 'candlestick5-chart': candlestick5Chart = chart; break;
    }
}

// Generic UI update function
function updateGenericUI(data, signal, prefix) {
    const changeFormatted = data.change ? data.change.toFixed(2) : '0.00';
    const changePercentFormatted = data.changePercent ? data.changePercent.toFixed(2) : '0.00';
    const changeColor = (data.change >= 0) ? '#27ae60' : '#e74c3c';
    const changeSymbol = (data.change >= 0) ? '+' : '';

    document.getElementById(`${prefix}-symbol`).textContent = data.symbol;
    document.getElementById(`${prefix}-price`).textContent = `${data.price.toFixed(2)}`;
    document.getElementById(`${prefix}-change`).innerHTML = `
        <div style="font-size: 0.9em; color: ${changeColor}; margin-top: 5px;">
            ${changeSymbol}${changeFormatted} (${changeSymbol}${changePercentFormatted}%)
        </div>
    `;

    let sourceBadge = '';
    if (data.source.includes('TwelveData')) {
        sourceBadge = '<span class="data-source-badge primary-source">PRIMARY</span>';
    } else {
        sourceBadge = '<span class="data-source-badge demo-source">DEMO</span>';
    }

    document.getElementById(`${prefix}-source-info`).innerHTML = `
        <div style="font-size: 0.8em; color: #7f8c8d;">
            ${data.source}${sourceBadge}
        </div>
    `;

    const rsi = calculateRSI(data.historicalPrices);
    const macd = calculateMACD(data.historicalPrices);
    const sma20 = calculateSMA(data.historicalPrices, 20);
    const sma50 = calculateSMA(data.historicalPrices, 50);

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

    const confidencePercentage = Math.round(signal.confidence * 100);
    const signalElement = document.getElementById(`${prefix}-signal`);
    signalElement.textContent = `${signal.action.toUpperCase()} - ${confidencePercentage}% confidence`;
    signalElement.className = `signal ${signal.action}`;

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
                'Note: Analysis based on simulated data for demonstration purposes' :
                'Analysis based on real TwelveData market data'
            }
        </div>
    `;
}

// Page initialization
function initializeDetailedView() {
    // Get symbol from URL parameters or use default
    const urlParams = new URLSearchParams(window.location.search);
    currentSymbol = urlParams.get('symbol') || 'AAPL';

    // Update page title
    document.getElementById('stockTitle').textContent = `Analysis for ${currentSymbol}`;

    // Load initial data for the active tab (daily by default)
    loadDailyData();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDetailedView);