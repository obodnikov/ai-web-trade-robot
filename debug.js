// DEBUGGING VERSION - Add to the END of your detailed-view.js file

// Debug wrapper for candlestick functionality
function debugCandlestickTab() {
    console.log('🔍 Debugging candlestick tab initialization...');
    
    // Check if required elements exist
    const requiredElements = [
        'candlestick-loading',
        'candlestick-content', 
        'candlestick-error',
        'candlestick-chart',
        'detected-patterns-list',
        'pattern-summary'
    ];
    
    const missingElements = [];
    requiredElements.forEach(id => {
        if (!document.getElementById(id)) {
            missingElements.push(id);
        }
    });
    
    if (missingElements.length > 0) {
        console.error('❌ Missing HTML elements:', missingElements);
        return false;
    }
    
    console.log('✅ All required HTML elements found');
    return true;
}

// Safe candlestick data loading with error handling
async function loadCandlestickDataSafe(symbol) {
    console.log(`🕯️ Loading candlestick data for ${symbol}...`);
    
    try {
        // Verify elements exist
        if (!debugCandlestickTab()) {
            throw new Error('Missing required HTML elements');
        }
        
        // Show loading
        const loadingEl = document.getElementById('candlestick-loading');
        const contentEl = document.getElementById('candlestick-content');
        const errorEl = document.getElementById('candlestick-error');
        
        loadingEl.style.display = 'flex';
        contentEl.style.display = 'none';
        errorEl.style.display = 'none';
        
        console.log('📊 Loading state set...');
        
        // Use existing 15-minute data or create demo data
        let data;
        if (window.intraday15Data && window.intraday15Data.historicalData) {
            console.log('✅ Using existing 15-minute data');
            data = window.intraday15Data;
        } else {
            console.log('📝 Creating demo data for candlestick patterns');
            data = generateDemoDataForCandlestick(symbol);
            window.intraday15Data = data;
        }
        
        console.log(`📈 Data prepared: ${data.historicalData.length} data points`);
        
        // Convert to OHLC format
        const ohlcData = convertToOHLCDataSafe(data.historicalData);
        console.log(`🔄 Converted to OHLC: ${ohlcData.length} candles`);
        
        // Detect patterns with error handling
        let patterns = [];
        try {
            if (window.CandlestickPatterns && typeof window.CandlestickPatterns.detectPatterns === 'function') {
                patterns = window.CandlestickPatterns.detectPatterns(ohlcData);
                console.log(`🎯 Detected ${patterns.length} patterns`);
            } else {
                console.warn('⚠️ CandlestickPatterns not available, using mock patterns');
                patterns = generateMockPatterns(ohlcData);
            }
        } catch (patternError) {
            console.error('❌ Pattern detection failed:', patternError);
            patterns = generateMockPatterns(ohlcData);
        }
        
        // Create chart
        console.log('📊 Creating candlestick chart...');
        createCandlestickChartSafe('candlestick-chart', data, patterns);
        
        // Update UI
        console.log('🎨 Updating UI...');
        updateCandlestickUISafe(data, patterns);
        
        // Show content
        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';
        
        console.log('✅ Candlestick tab loaded successfully!');
        
    } catch (error) {
        console.error('❌ Error loading candlestick data:', error);
        
        const loadingEl = document.getElementById('candlestick-loading');
        const errorEl = document.getElementById('candlestick-error');
        
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) {
            errorEl.style.display = 'block';
            errorEl.textContent = `Error loading candlestick patterns: ${error.message}`;
        }
    }
}

// Safe OHLC conversion
function convertToOHLCDataSafe(historicalData) {
    if (!historicalData || !Array.isArray(historicalData)) {
        console.warn('⚠️ Invalid historical data, returning empty array');
        return [];
    }
    
    return historicalData.map((item, index) => {
        // Handle different data formats
        const open = item.open || item.close || 100 + Math.random() * 10;
        const close = item.close || 100 + Math.random() * 10;
        const high = item.high || Math.max(open, close) * (1 + Math.random() * 0.02);
        const low = item.low || Math.min(open, close) * (1 - Math.random() * 0.02);
        
        return {
            open: parseFloat(open),
            high: parseFloat(high),
            low: parseFloat(low),
            close: parseFloat(close),
            datetime: item.datetime || item.date || new Date(Date.now() - (historicalData.length - index) * 15 * 60 * 1000).toISOString(),
            volume: item.volume || Math.floor(Math.random() * 100000)
        };
    });
}

// Generate demo data specifically for candlestick
function generateDemoDataForCandlestick(symbol) {
    const basePrice = 12.26; // WBD price
    const dataPoints = 78;
    const historicalData = [];
    
    let price = basePrice;
    
    for (let i = dataPoints; i > 0; i--) {
        const date = new Date();
        date.setMinutes(date.getMinutes() - (i * 15));
        
        const volatility = 0.005; // 0.5% volatility
        const change = (Math.random() - 0.5) * volatility * price;
        
        const open = price;
        const close = price + change;
        const high = Math.max(open, close) * (1 + Math.random() * 0.01);
        const low = Math.min(open, close) * (1 - Math.random() * 0.01);
        
        historicalData.push({
            datetime: date.toISOString(),
            open: open,
            high: high,
            low: low,
            close: close,
            volume: Math.floor(Math.random() * 1000000) + 100000
        });
        
        price = close;
    }
    
    return {
        symbol: symbol.toUpperCase(),
        price: price,
        historicalData: historicalData,
        historicalPrices: historicalData.map(d => d.close),
        volume: 500000,
        previousClose: basePrice,
        change: price - basePrice,
        changePercent: ((price - basePrice) / basePrice) * 100,
        openPrice: historicalData[historicalData.length - 1].open,
        highPrice: Math.max(...historicalData.map(d => d.high)),
        lowPrice: Math.min(...historicalData.map(d => d.low)),
        source: 'Demo Data for Candlestick Patterns'
    };
}

// Generate mock patterns for testing
function generateMockPatterns(ohlcData) {
    const patterns = [];
    
    // Add a few mock patterns for demonstration
    if (ohlcData.length > 10) {
        patterns.push({
            name: 'Hammer',
            type: 'hammer',
            emoji: '🔨',
            bullish: true,
            index: Math.floor(ohlcData.length * 0.3),
            price: ohlcData[Math.floor(ohlcData.length * 0.3)].close,
            confidence: 0.85,
            description: 'Bullish reversal pattern with long lower shadow'
        });
        
        patterns.push({
            name: 'Gravestone Doji',
            type: 'gravestone',
            emoji: '🪦',
            bullish: false,
            index: Math.floor(ohlcData.length * 0.7),
            price: ohlcData[Math.floor(ohlcData.length * 0.7)].close,
            confidence: 0.78,
            description: 'Bearish reversal doji with long upper shadow'
        });
    }
    
    return patterns;
}

// Safe chart creation
function createCandlestickChartSafe(canvasId, data, patterns) {
    try {
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            throw new Error('Canvas element not found');
        }
        
        // Destroy existing chart
        if (window.candlestickChart) {
            window.candlestickChart.destroy();
        }
        
        const labels = data.historicalData.map((item, index) => {
            try {
                const date = new Date(item.datetime || item.date);
                return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            } catch (e) {
                return `T${index}`;
            }
        });
        
        const prices = data.historicalData.map(item => item.close);
        
        window.candlestickChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Close Price',
                    data: prices,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.1,
                    pointRadius: 4,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `${data.symbol} - 15-Minute Candlestick Pattern Analysis`,
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: { display: true, text: 'Price ($)' }
                    }
                }
            }
        });
        
        // Add pattern highlighting
        if (patterns.length > 0) {
            addPatternHighlightsSafe(window.candlestickChart, patterns);
        }
        
        console.log('✅ Chart created successfully');
        
    } catch (error) {
        console.error('❌ Chart creation failed:', error);
        
        // Show fallback message
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 400px; color: #7f8c8d;">
                    <div style="text-align: center;">
                        <div style="font-size: 3em; margin-bottom: 10px;">📊</div>
                        <h3>Chart Loading Issue</h3>
                        <p>Unable to create chart: ${error.message}</p>
                    </div>
                </div>
            `;
        }
    }
}

// Safe pattern highlighting
function addPatternHighlightsSafe(chart, patterns) {
    try {
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
                    const x = xScale.getPixelForValue(pattern.index);
                    const y = yScale.getPixelForValue(pattern.price);
                    
                    if (isNaN(x) || isNaN(y)) return;
                    
                    // Pattern marker
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
                    
                } catch (patternError) {
                    console.warn('⚠️ Error drawing pattern:', patternError);
                }
            });
            
            ctx.restore();
        };
        
        chart.update('none');
        
    } catch (error) {
        console.warn('⚠️ Pattern highlighting failed:', error);
    }
}

// Safe UI update
function updateCandlestickUISafe(data, patterns) {
    try {
        // Update header safely
        const symbolEl = document.getElementById('candlestick-symbol');
        const priceEl = document.getElementById('candlestick-price');
        const changeEl = document.getElementById('candlestick-change');
        const sourceEl = document.getElementById('candlestick-source-info');
        
        if (symbolEl) symbolEl.textContent = data.symbol;
        if (priceEl) priceEl.textContent = `$${data.price.toFixed(2)}`;
        
        if (changeEl) {
            const changeFormatted = data.change ? data.change.toFixed(2) : '0.00';
            const changePercentFormatted = data.changePercent ? data.changePercent.toFixed(2) : '0.00';
            const changeColor = (data.change >= 0) ? '#27ae60' : '#e74c3c';
            const changeSymbol = (data.change >= 0) ? '+' : '';
            
            changeEl.innerHTML = `
                <div style="font-size: 0.9em; color: ${changeColor}; margin-top: 5px;">
                    ${changeSymbol}${changeFormatted} (${changeSymbol}${changePercentFormatted}%)
                </div>
            `;
        }
        
        if (sourceEl) {
            sourceEl.innerHTML = `
                <div style="font-size: 0.8em; color: #7f8c8d;">
                    ${data.source} • Pattern Analysis
                    <span style="background: #3498db; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.7em; margin-left: 5px;">DEMO</span>
                </div>
            `;
        }
        
        // Update patterns list
        updatePatternsListSafe(patterns);
        
        console.log('✅ UI updated successfully');
        
    } catch (error) {
        console.error('❌ UI update failed:', error);
    }
}

// Safe patterns list update
function updatePatternsListSafe(patterns) {
    try {
        const patternsList = document.getElementById('detected-patterns-list');
        if (!patternsList) return;
        
        if (patterns.length === 0) {
            patternsList.innerHTML = '<div class="no-patterns">No patterns detected in current data</div>';
            return;
        }
        
        patternsList.innerHTML = patterns.map(pattern => `
            <div class="pattern-detected ${pattern.bullish ? 'bullish' : 'bearish'}">
                <div class="pattern-header">
                    <div class="pattern-name">
                        ${pattern.emoji} ${pattern.name}
                    </div>
                    <div class="pattern-confidence">
                        ${Math.round(pattern.confidence * 100)}%
                    </div>
                </div>
                <div class="pattern-description">
                    ${pattern.description}
                </div>
                <div class="pattern-location">
                    Location: Candle ${pattern.index} • Price: $${pattern.price.toFixed(2)}
                </div>
            </div>
        `).join('');
        
        // Update summary
        updatePatternSummarySafe(patterns);
        
    } catch (error) {
        console.error('❌ Patterns list update failed:', error);
    }
}

// Safe pattern summary update
function updatePatternSummarySafe(patterns) {
    try {
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
        
        const bullishEl = document.getElementById('bullish-count');
        const bearishEl = document.getElementById('bearish-count');
        const confidenceEl = document.getElementById('avg-confidence');
        const signalEl = document.getElementById('overall-signal');
        
        if (bullishEl) bullishEl.textContent = bullishPatterns.length;
        if (bearishEl) bearishEl.textContent = bearishPatterns.length;
        if (confidenceEl) confidenceEl.textContent = Math.round(avgConfidence * 100) + '%';
        
        if (signalEl) {
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
            
            signalEl.textContent = signal;
            signalEl.className = `overall-signal ${signalClass}`;
        }
        
    } catch (error) {
        console.error('❌ Pattern summary update failed:', error);
    }
}

// Override the original switchTab function to use safe loading
const originalSwitchTab = window.switchTab;
window.switchTab = function(tabName) {
    console.log(`🔄 Switching to tab: ${tabName}`);
    
    // Call original function first
    if (originalSwitchTab) {
        originalSwitchTab(tabName);
    } else {
        // Fallback tab switching
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-tab`)?.classList.add('active');
    }
    
    // Load candlestick data safely
    if (tabName === 'candlestick') {
        console.log('🕯️ Loading candlestick tab...');
        setTimeout(() => {
            loadCandlestickDataSafe(window.currentSymbol || 'WBD');
        }, 100);
    }
};

console.log('🔧 Debug candlestick integration loaded');
