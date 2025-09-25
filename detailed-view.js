// fixed-detailed-view.js - Replace your detailed-view.js content with this

// Configuration variables
const CANDLESTICK_CHART_CANDLES = 20; // Number of candles to show on chart

// Technical Analysis Functions
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
let intraday15Chart = null;
let candlestickChart = null;
let dailyData = null;
let intradayData = null;
let intraday15Data = null;
let detectedPatterns = [];

// Tab switching functionality - FIXED VERSION
function switchTab(tabName) {
    console.log(`Switching to tab: ${tabName}`);
    
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Load data based on tab with proper sequencing
    if (tabName === 'intraday' && document.getElementById('intraday-content').style.display === 'none') {
        loadIntradayData(currentSymbol);
    }
    
    if (tabName === 'intraday15' && document.getElementById('intraday15-content').style.display === 'none') {
        loadIntraday15Data(currentSymbol);
    }
    
    // FIXED: Proper candlestick loading with data dependency check
    if (tabName === 'candlestick') {
        // Always reload candlestick to ensure fresh patterns
        loadCandlestickDataFixed(currentSymbol);
    }
    
    if (tabName === 'chatgpt') {
        initializeChatGPTTab();
    }
}

// FIXED: Reliable candlestick data loading
async function loadCandlestickDataFixed(symbol) {
    console.log(`🕯️ FIXED: Loading candlestick data for ${symbol}`);
    
    try {
        const loadingEl = document.getElementById('candlestick-loading');
        const contentEl = document.getElementById('candlestick-content');
        const errorEl = document.getElementById('candlestick-error');
        
        // Show loading
        loadingEl.style.display = 'flex';
        contentEl.style.display = 'none';
        errorEl.style.display = 'none';
        
        // STEP 1: Ensure we have 15-minute data
        let data15min = null;
        
        // Check if we have valid cached data
        if (intraday15Data && 
            intraday15Data.symbol === symbol && 
            intraday15Data.historicalData && 
            intraday15Data.historicalData.length > 20) {
            
            console.log(`✅ Using cached 15-minute data for ${symbol}`);
            data15min = intraday15Data;
        } else {
            console.log(`📡 Fetching fresh 15-minute data for ${symbol}`);
            try {
                data15min = await fetchTwelveDataIntraday15(symbol);
                intraday15Data = data15min; // Cache it
                console.log(`✅ Fresh data loaded: ${data15min.historicalData.length} intervals`);
            } catch (error) {
                console.log(`⚠️ API failed, using demo data: ${error.message}`);
                data15min = generateDemoData(symbol, 'intraday15');
                intraday15Data = data15min;
            }
        }
        
        // STEP 2: Convert to proper OHLC format
        const ohlcData = data15min.historicalData.map(item => ({
            open: parseFloat(item.open) || parseFloat(item.close),
            high: parseFloat(item.high) || parseFloat(item.close),
            low: parseFloat(item.low) || parseFloat(item.close),
            close: parseFloat(item.close),
            datetime: item.datetime || item.date,
            volume: parseInt(item.volume) || 0
        }));
        
        console.log(`🔄 Converted ${ohlcData.length} candles to OHLC format`);
        
        // STEP 3: Pattern detection with error handling
        let patterns = [];
        if (window.CandlestickPatterns) {
            console.log(`🎯 Running pattern detection...`);
            patterns = window.CandlestickPatterns.detectPatterns(ohlcData, 0.75);
            console.log(`✅ Found ${patterns.length} patterns`);
        } else {
            console.warn(`⚠️ CandlestickPatterns not loaded, loading now...`);
            // Try to load the patterns class
            await loadCandlestickPatternsEngine();
            if (window.CandlestickPatterns) {
                patterns = window.CandlestickPatterns.detectPatterns(ohlcData, 0.75);
            }
        }
        
        // Store patterns globally
        detectedPatterns = patterns;
        
        // STEP 4: Create chart and update UI
        createCandlestickChart('candlestick-chart', data15min, patterns);
        updateCandlestickUI(data15min, patterns);
        
        // Show content
        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';
        
        console.log(`✅ Candlestick loading completed for ${symbol}`);
        
    } catch (error) {
        console.error(`❌ Candlestick loading failed for ${symbol}:`, error);
        
        document.getElementById('candlestick-loading').style.display = 'none';
        document.getElementById('candlestick-error').style.display = 'block';
        document.getElementById('candlestick-error').innerHTML = `
            <div style="text-align: center; padding: 20px; color: #e74c3c;">
                <h4>⚠️ Candlestick Analysis Failed</h4>
                <p>Error: ${error.message}</p>
                <button onclick="loadCandlestickDataFixed('${symbol}')" 
                        style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 10px;">
                    🔄 Retry
                </button>
            </div>
        `;
    }
}

// Load the candlestick patterns engine if not available
async function loadCandlestickPatternsEngine() {
    console.log('📦 Loading CandlestickPatterns engine...');
    
    // If the patterns class doesn't exist, define it inline
    if (!window.CandlestickPatterns) {
        window.CandlestickPatterns = {
            detectPatterns: function(ohlcData, minConfidence = 0.75) {
                const patterns = [];
                
                if (!ohlcData || ohlcData.length < 3) {
                    return patterns;
                }
                
                for (let i = 2; i < ohlcData.length; i++) {
                    const current = ohlcData[i];
                    const previous = ohlcData[i - 1];
                    
                    if (!this.isValidCandle(current) || !this.isValidCandle(previous)) {
                        continue;
                    }
                    
                    const pattern = this.detectHammer(current, previous, i) ||
                                  this.detectGravestoneDoji(current, previous, i) ||
                                  this.detectDragonflyDoji(current, previous, i);
                    
                    if (pattern && pattern.confidence >= minConfidence) {
                        patterns.push({
                            ...pattern,
                            index: i,
                            price: current.close,
                            datetime: current.datetime
                        });
                    }
                }
                
                return patterns;
            },
            
            isValidCandle: function(candle) {
                return candle && 
                       typeof candle.open === 'number' && 
                       typeof candle.high === 'number' && 
                       typeof candle.low === 'number' && 
                       typeof candle.close === 'number' &&
                       candle.high >= Math.max(candle.open, candle.close) &&
                       candle.low <= Math.min(candle.open, candle.close);
            },
            
            detectHammer: function(current, previous, index) {
                const bodySize = Math.abs(current.close - current.open);
                const lowerShadow = Math.min(current.open, current.close) - current.low;
                const upperShadow = current.high - Math.max(current.open, current.close);
                const totalRange = current.high - current.low;
                
                if (lowerShadow > bodySize * 2 && upperShadow < bodySize * 0.5 && bodySize > 0) {
                    return {
                        name: 'Hammer',
                        type: 'hammer',
                        emoji: '🔨',
                        bullish: true,
                        confidence: Math.min(0.95, 0.8 + (lowerShadow / totalRange)),
                        description: 'Bullish reversal pattern with long lower shadow'
                    };
                }
                return null;
            },
            
            detectGravestoneDoji: function(current, previous, index) {
                const bodySize = Math.abs(current.close - current.open);
                const upperShadow = current.high - Math.max(current.open, current.close);
                const lowerShadow = Math.min(current.open, current.close) - current.low;
                const totalRange = current.high - current.low;
                
                if (upperShadow > totalRange * 0.6 && lowerShadow < totalRange * 0.1 && bodySize < totalRange * 0.1) {
                    return {
                        name: 'Gravestone Doji',
                        type: 'gravestone',
                        emoji: '🪦',
                        bullish: false,
                        confidence: Math.min(0.95, 0.85 + (upperShadow / totalRange)),
                        description: 'Bearish reversal doji with long upper shadow'
                    };
                }
                return null;
            },
            
            detectDragonflyDoji: function(current, previous, index) {
                const bodySize = Math.abs(current.close - current.open);
                const lowerShadow = Math.min(current.open, current.close) - current.low;
                const upperShadow = current.high - Math.max(current.open, current.close);
                const totalRange = current.high - current.low;
                
                if (lowerShadow > totalRange * 0.6 && upperShadow < totalRange * 0.1 && bodySize < totalRange * 0.1) {
                    return {
                        name: 'Dragonfly Doji',
                        type: 'dragonfly',
                        emoji: '🐉',
                        bullish: true,
                        confidence: Math.min(0.95, 0.85 + (lowerShadow / totalRange)),
                        description: 'Bullish reversal doji with long lower shadow'
                    };
                }
                return null;
            }
        };
        console.log('✅ CandlestickPatterns engine loaded inline');
    }
}

// Create candlestick chart with pattern highlighting - NO TOOLTIPS AT ALL
function createCandlestickChart(canvasId, data, patterns) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) {
        console.error('Canvas element not found');
        return;
    }
    
    // Destroy existing chart
    if (candlestickChart) {
        candlestickChart.destroy();
    }
    
    // Filter to last N candles for better readability
    const startIndex = Math.max(0, data.historicalData.length - CANDLESTICK_CHART_CANDLES);
    const filteredData = data.historicalData.slice(startIndex);
    
    const labels = filteredData.map(item => {
        const date = new Date(item.datetime || item.date);
        return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    });
    
    const prices = filteredData.map(item => parseFloat(item.close));
    
    // Calculate moving averages for filtered data
    const sma20Data = [];
    const sma50Data = [];
    
    // Use original full dataset for SMA calculation, then slice the results
    const allPrices = data.historicalData.map(item => parseFloat(item.close));
    const fullSma20 = [];
    const fullSma50 = [];
    
    for (let i = 0; i < allPrices.length; i++) {
        if (i >= 19) {
            fullSma20.push(calculateSMA(allPrices.slice(0, i + 1), 20));
        } else {
            fullSma20.push(null);
        }
        
        if (i >= 49) {
            fullSma50.push(calculateSMA(allPrices.slice(0, i + 1), 50));
        } else {
            fullSma50.push(null);
        }
    }
    
    // Extract SMA values for the filtered period
    const sma20Filtered = fullSma20.slice(startIndex);
    const sma50Filtered = fullSma50.slice(startIndex);
    
    // Filter patterns to only those visible in the chart window
    const visiblePatterns = patterns.filter(pattern => pattern.index >= startIndex);
    
    // Adjust pattern indices to match filtered data
    const adjustedPatterns = visiblePatterns.map(pattern => ({
        ...pattern,
        adjustedIndex: pattern.index - startIndex
    }));
    
    candlestickChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Close Price',
                    data: prices,
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.1,
                    pointRadius: 4,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#c0392b',
                    pointBorderColor: '#e74c3c',
                    pointBorderWidth: 2
                },
                {
                    label: 'SMA 20',
                    data: sma20Filtered,
                    borderColor: '#2ecc71',
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0,
                    tension: 0.1
                },
                {
                    label: 'SMA 50',
                    data: sma50Filtered,
                    borderColor: '#3498db',
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${data.symbol} - 15-Minute Candlestick Pattern Analysis (Last ${CANDLESTICK_CHART_CANDLES} Candles)`,
                    font: { size: 16, weight: 'bold' },
                    color: '#2c3e50'
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    enabled: false  // DISABLE ALL TOOLTIPS FOR CANDLESTICK CHART
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: `Time (15-minute intervals) - Showing last ${CANDLESTICK_CHART_CANDLES} candles`,
                        font: { size: 12, weight: 'bold' }
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.1)' }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Price ($)',
                        font: { size: 12, weight: 'bold' }
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.1)' }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
    
    // Add pattern highlighting
    if (adjustedPatterns.length > 0) {
        addPatternHighlights(candlestickChart, adjustedPatterns, labels);
    }
    
    console.log(`📈 Candlestick chart created with ${CANDLESTICK_CHART_CANDLES} candles and ${adjustedPatterns.length} visible patterns (no tooltips)`);
    return candlestickChart;
}


// Add pattern highlighting to chart - SIMPLIFIED VERSION WITHOUT ANY TOOLTIPS
function addPatternHighlights(chart, patterns, labels) {
    const originalDraw = chart.draw;
    
    chart.draw = function() {
        originalDraw.call(this);
        
        const ctx = this.ctx;
        const xScale = this.scales.x;
        const yScale = this.scales.y;
        
        if (!ctx || !xScale || !yScale) return;
        
        ctx.save();
        
        patterns.forEach(pattern => {
            try {
                const x = xScale.getPixelForValue(pattern.adjustedIndex);
                const y = yScale.getPixelForValue(pattern.price);
                
                if (isNaN(x) || isNaN(y)) return;
                
                // Pattern marker circle
                ctx.fillStyle = pattern.bullish ? 'rgba(46, 204, 113, 0.9)' : 'rgba(231, 76, 60, 0.9)';
                ctx.strokeStyle = pattern.bullish ? '#27ae60' : '#e74c3c';
                ctx.lineWidth = 3;
                
                ctx.beginPath();
                ctx.arc(x, y, 12, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                
                // Pattern emoji
                ctx.fillStyle = 'white';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(pattern.emoji, x, y);
                
                // Add subtle glow effect for high confidence patterns
                if (pattern.confidence > 0.85) {
                    ctx.beginPath();
                    ctx.arc(x, y, 18, 0, 2 * Math.PI);
                    ctx.strokeStyle = pattern.bullish ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
                
            } catch (e) {
                console.warn('Pattern highlight error:', e);
            }
        });
        
        ctx.restore();
    };
    
    chart.update('none');
}

// Update candlestick UI
function updateCandlestickUI(data, patterns) {
    const changeFormatted = data.change ? data.change.toFixed(2) : '0.00';
    const changePercentFormatted = data.changePercent ? data.changePercent.toFixed(2) : '0.00';
    const changeColor = (data.change >= 0) ? '#27ae60' : '#e74c3c';
    const changeSymbol = (data.change >= 0) ? '+' : '';
    
    // Update header
    document.getElementById('candlestick-symbol').textContent = data.symbol;
    document.getElementById('candlestick-price').textContent = `${data.price.toFixed(2)}`;
    document.getElementById('candlestick-change').innerHTML = `
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
    
    document.getElementById('candlestick-source-info').innerHTML = `
        <div style="font-size: 0.8em; color: #7f8c8d;">
            ${data.source} • Pattern Analysis${sourceBadge}
        </div>
    `;
    
    // Update patterns list
    updateDetectedPatternsList(patterns);
    updatePatternSummary(patterns);
    highlightDetectedPatternsInGuide(patterns);
}

// coomon function to show datetime
function formatDateTime(datetime) {
    const d = new Date(datetime);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}


// Update detected patterns list
function updateDetectedPatternsList(patterns) {
    const patternsList = document.getElementById('detected-patterns-list');
    
    if (!patternsList) return;
    
    if (patterns.length === 0) {
        patternsList.innerHTML = `
            <div class="no-patterns">
                <div style="margin-bottom: 10px;">📊 No patterns detected in current data</div>
                <div style="font-size: 0.85em; color: #7f8c8d;">
                    Patterns require 75%+ confidence threshold
                </div>
            </div>
        `;
        return;
    }
    // 🔽 Sort by datetime (latest first)
    patterns.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

    // 🔽 Limit to first 10
    // const limitedPatterns = patterns.slice(0, 10);

    patternsList.innerHTML = patterns.map(pattern => {
        const confidenceClass = pattern.confidence > 0.9 ? 'high' : pattern.confidence > 0.8 ? 'medium' : '';
        
        return `
            <div class="pattern-detected ${pattern.bullish ? 'bullish' : 'bearish'}"
                 onclick="showPatternDetails('${pattern.type}')"
                 style="cursor: pointer; transition: transform 0.2s ease; border: 2px solid transparent;"
                 onmouseover="this.style.transform='scale(1.02)'; this.style.borderColor='#3498db';"
                 onmouseout="this.style.transform='scale(1)'; this.style.borderColor='transparent';">
                <div class="pattern-header">
                    <div class="pattern-name">
                        ${pattern.emoji} ${pattern.name}
                    </div>
                    <div class="pattern-confidence ${confidenceClass}">
                        ${Math.round(pattern.confidence * 100)}%
                    </div>
                </div>
                <div class="pattern-description">
                    ${pattern.description}
                </div>
                <div class="pattern-location">
                    Location: Candle ${pattern.index} @ ${formatDateTime(pattern.datetime)} • Price: ${pattern.price.toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
}

// Update pattern summary
function updatePatternSummary(patterns) {
    const summaryDiv = document.getElementById('pattern-summary');
    
    if (!summaryDiv) return;
    
    if (patterns.length === 0) {
        summaryDiv.style.display = 'none';
        return;
    }
    
    summaryDiv.style.display = 'block';
    
    const bullishPatterns = patterns.filter(p => p.bullish);
    const bearishPatterns = patterns.filter(p => !p.bullish);
    const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
    
    document.getElementById('bullish-count').textContent = bullishPatterns.length;
    document.getElementById('bearish-count').textContent = bearishPatterns.length;
    document.getElementById('avg-confidence').textContent = Math.round(avgConfidence * 100) + '%';
    
    // Determine overall signal
    const overallSignalDiv = document.getElementById('overall-signal');
    let signal, signalClass;
    
    if (bullishPatterns.length > bearishPatterns.length) {
        signal = 'BULLISH - Pattern bias suggests upward movement';
        signalClass = 'bullish';
    } else if (bearishPatterns.length > bullishPatterns.length) {
        signal = 'BEARISH - Pattern bias suggests downward movement';
        signalClass = 'bearish';
    } else {
        signal = 'NEUTRAL - Mixed pattern signals';
        signalClass = '';
    }
    
    overallSignalDiv.textContent = signal;
    overallSignalDiv.className = `overall-signal ${signalClass}`;
}

// Highlight detected patterns in reference guide
function highlightDetectedPatternsInGuide(patterns) {
    // Reset all pattern cards
    document.querySelectorAll('.pattern-card').forEach(card => {
        card.classList.remove('detected', 'bullish', 'bearish');
    });
    
    // Highlight detected patterns
    patterns.forEach(pattern => {
        const patternCard = document.querySelector(`[data-pattern="${pattern.type}"]`);
        if (patternCard) {
            patternCard.classList.add('detected');
            if (pattern.bullish) {
                patternCard.classList.add('bullish');
            } else {
                patternCard.classList.add('bearish');
            }
        }
    });
}

// TwelveData API for 15-minute intervals
async function fetchTwelveDataIntraday15(symbol) {
    const apiKey = window.TWELVEDATA_API_KEY || 'demo'; 
    
    try {
        console.log(`Fetching TwelveData 15min data for ${symbol}...`);
        
        const intradayUrl = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=15min&outputsize=78&apikey=${apiKey}`;
        const response = await fetch(intradayUrl);
        
        if (!response.ok) {
            throw new Error(`TwelveData API failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'error') {
            throw new Error(`TwelveData error: ${data.message}`);
        }
        
        if (!data.values || data.values.length === 0) {
            throw new Error('No 15-minute intraday data from TwelveData');
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
        
        console.log(`✅ TwelveData 15-minute data for ${symbol}: ${currentPrice.toFixed(2)}`);
        
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
            source: `TwelveData 15min (${historicalData.length} intervals)`
        };
        
    } catch (error) {
        console.error(`❌ TwelveData 15-minute error for ${symbol}:`, error.message);
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
    
    for (let i = dataPoints; i > 0; i--) {
        const date = new Date();
        if (interval === 'daily') {
            date.setDate(date.getDate() - i);
        } else if (interval === 'intraday15') {
            date.setMinutes(date.getMinutes() - (i * 15));
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

// Remaining functions for other tabs (simplified versions)
async function fetchTwelveDataDaily(symbol) {
    const apiKey = window.TWELVEDATA_API_KEY || 'demo';
    
    try {
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
        
        const timeSeriesData = data.values.reverse();
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
        console.error(`TwelveData daily error for ${symbol}:`, error.message);
        throw error;
    }
}

async function fetchTwelveDataIntraday(symbol) {
    const apiKey = window.TWELVEDATA_API_KEY || 'demo';
    
    try {
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
        
        const timeSeriesData = data.values.reverse();
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
        console.error(`TwelveData intraday error for ${symbol}:`, error.message);
        throw error;
    }
}

// Simplified chart creation for other tabs
function createChart(canvasId, data, title, interval = 'daily') {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    // Destroy existing chart
    if (canvasId === 'daily-chart' && dailyChart) {
        dailyChart.destroy();
    }
    if (canvasId === 'intraday-chart' && intradayChart) {
        intradayChart.destroy();
    }
    if (canvasId === 'intraday15-chart' && intraday15Chart) {
        intraday15Chart.destroy();
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
    
    if (canvasId === 'daily-chart') {
        dailyChart = chart;
    } else if (canvasId === 'intraday15-chart') {
        intraday15Chart = chart;
    } else {
        intradayChart = chart;
    }
    
    return chart;
}

// Update UI for other tabs
function updateUI(data, signal, prefix) {
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

// Load functions for other tabs
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
        
        dailyData = data;
        
        const signal = generateTradingSignal(data.symbol, data.price, data.historicalPrices);
        
        createChart('daily-chart', data, `${symbol} - Daily Price Chart`, 'daily');
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
        
        intradayData = data;
        
        const signal = generateTradingSignal(data.symbol, data.price, data.historicalPrices);
        
        createChart('intraday-chart', data, `${symbol} - 30-Minute Intraday Chart`, 'intraday');
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

async function loadIntraday15Data(symbol) {
    try {
        document.getElementById('intraday15-loading').style.display = 'flex';
        document.getElementById('intraday15-content').style.display = 'none';
        document.getElementById('intraday15-error').style.display = 'none';
        
        let data;
        try {
            data = await fetchTwelveDataIntraday15(symbol);
        } catch (error) {
            console.log('TwelveData 15-minute intraday failed, using demo data');
            data = generateDemoData(symbol, 'intraday15');
        }
        
        intraday15Data = data;
        
        const signal = generateTradingSignal(data.symbol, data.price, data.historicalPrices);
        
        createChart('intraday15-chart', data, `${symbol} - 15-Minute Intraday Chart`, 'intraday15');
        updateUI(data, signal, 'intraday15');
        
        document.getElementById('intraday15-loading').style.display = 'none';
        document.getElementById('intraday15-content').style.display = 'block';
        
    } catch (error) {
        console.error('Error loading 15-minute intraday data:', error);
        document.getElementById('intraday15-loading').style.display = 'none';
        document.getElementById('intraday15-error').style.display = 'block';
        document.getElementById('intraday15-error').textContent = `Error loading 15-minute data: ${error.message}`;
    }
}

// ChatGPT stub functions (simplified)
function initializeChatGPTTab() {
    const generateBtn = document.getElementById('generateAnalysisBtn');
    const statusDiv = document.getElementById('analysis-status');
    
    if (!dailyData || !intradayData) {
        statusDiv.className = 'analysis-status error';
        statusDiv.style.display = 'block';
        statusDiv.textContent = 'Please load data from both Daily and 30-Minute tabs first before generating AI analysis.';
        generateBtn.disabled = true;
        return;
    }
    
    generateBtn.disabled = false;
    statusDiv.style.display = 'none';
}

// Page initialization
window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    currentSymbol = urlParams.get('symbol') || 'AAPL';
    
    document.getElementById('stockTitle').textContent = `Detailed Analysis for ${currentSymbol}`;
    document.title = `Trading Robot - ${currentSymbol} Analysis`;
    
    // Set up tab event listeners
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Set up ChatGPT button if exists
    const generateBtn = document.getElementById('generateAnalysisBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('ChatGPT integration requires middleware setup. See documentation.');
        });
    }
    
    // Ensure daily tab is active initially
    switchTab('daily');
    
    // Load daily data first
    loadDailyData(currentSymbol);
    
    console.log(`Trading Robot detailed view loaded for ${currentSymbol}`);
    console.log('FIXED: Candlestick patterns will load consistently on tab switch');

    // Initialize modal functionality
    initializePatternModal();

    // Initialize reference pattern cards
    initializeReferencePatternCards();
});

// Pattern modal functionality
function initializePatternModal() {
    const modal = document.getElementById('pattern-modal');
    const closeBtn = document.querySelector('.pattern-modal-close');

    // Close modal when clicking the X button
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        };
    }

    // Close modal when clicking outside of it
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    });
}

async function showPatternDetails(patternType) {
    const modal = document.getElementById('pattern-modal');
    const modalTitle = document.getElementById('pattern-modal-title');
    const modalContent = document.getElementById('pattern-modal-content');

    // Show modal with loading state
    modal.style.display = 'flex';
    modalTitle.textContent = 'Loading Pattern Details...';
    modalContent.innerHTML = '<div style="text-align: center; padding: 40px;"><div class="spinner"></div><p>Loading pattern information...</p></div>';

    try {
        // Check if we're running in a file:// context (local file opening)
        if (window.location.protocol === 'file:') {
            throw new Error('Pattern details are not available when opening the file directly. Please serve the application through a web server (e.g., python -m http.server).');
        }

        // Construct the URL for the markdown file using the current page's location as base
        const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
        const markdownUrl = `${baseUrl}Docs/patterns/${patternType}.md`;

        console.log(`Trying to fetch pattern from: ${markdownUrl}`);
        console.log(`Current location: ${window.location.href}`);
        console.log(`Base URL: ${baseUrl}`);

        const response = await fetch(markdownUrl);

        if (!response || !response.ok) {
            throw new Error(`Failed to load pattern file: ${response.status} - ${response.statusText} (URL: ${markdownUrl})`);
        }

        console.log(`Successfully loaded pattern from: ${markdownUrl}`);
        const markdownContent = await response.text();

        // Process the markdown and update image paths
        // Extract the base path from the successful markdownUrl
        const basePath = markdownUrl.substring(0, markdownUrl.lastIndexOf('/') + 1);
        const processedMarkdown = markdownContent.replace(
            /!\[Candlestick Pattern Example\]\(([^)]+)\)/g,
            `![Candlestick Pattern Example](${basePath}$1)`
        );

        // Convert markdown to HTML using the marked library
        const htmlContent = marked.parse(processedMarkdown);

        // Extract the pattern name from the first heading
        const titleMatch = markdownContent.match(/^#\s+(.+)/m);
        const patternName = titleMatch ? titleMatch[1] : 'Pattern Details';

        // Update modal content
        modalTitle.textContent = patternName;
        modalContent.innerHTML = htmlContent;

    } catch (error) {
        console.error('Error loading pattern details:', error);
        modalTitle.textContent = 'Error Loading Pattern';
        modalContent.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #e74c3c;">
                <h3>📋 Unable to Load Pattern Details</h3>
                <p>Sorry, there was an error loading the information for this pattern.</p>
                <p><strong>Pattern:</strong> ${patternType}</p>
                <p><strong>Error:</strong> ${error.message}</p>
            </div>
        `;
    }
}

function initializeReferencePatternCards() {
    // Add click handlers to all reference pattern cards
    const patternCards = document.querySelectorAll('.pattern-card[data-pattern]');

    patternCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';

        card.addEventListener('click', function() {
            const patternType = this.getAttribute('data-pattern');
            showPatternDetails(patternType);
        });

        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        });
    });
}
