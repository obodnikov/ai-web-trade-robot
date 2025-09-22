// COMPLETE REPLACEMENT for candlestick loading - Add this to your detailed-view.js

// Force load real data from 15-minute tab
async function loadCandlestickDataForced(symbol) {
    console.log(`🕯️ FORCED loading candlestick data for ${symbol}...`);
    
    try {
        const loadingEl = document.getElementById('candlestick-loading');
        const contentEl = document.getElementById('candlestick-content');
        const errorEl = document.getElementById('candlestick-error');
        
        loadingEl.style.display = 'flex';
        contentEl.style.display = 'none';
        errorEl.style.display = 'none';
        
        // STEP 1: Force load 15-minute tab data if not available
        console.log('🔍 Checking for existing 15-minute data...');
        console.log('Current intraday15Data:', window.intraday15Data);
        
        let realData = null;
        
        // Check if 15-minute data exists and has real source
        if (window.intraday15Data && 
            window.intraday15Data.historicalData && 
            window.intraday15Data.source && 
            window.intraday15Data.source.includes('TwelveData')) {
            
            console.log('✅ Found existing REAL TwelveData from 15-minute tab');
            realData = window.intraday15Data;
            
        } else {
            console.log('❌ No real 15-minute data found, forcing load...');
            
            // Show loading message
            loadingEl.innerHTML = `
                <div style="text-align: center;">
                    <div class="spinner"></div>
                    <div style="margin-top: 10px; color: #2c3e50;">Loading real market data...</div>
                </div>
            `;
            
            // Force load TwelveData for 15-minute interval
            try {
                console.log('📡 Force fetching TwelveData 15-minute...');
                realData = await fetchTwelveDataIntraday15(symbol);
                
                // Store it globally
                window.intraday15Data = realData;
                
                console.log('✅ Successfully force-loaded TwelveData');
                console.log('Data source:', realData.source);
                console.log('Data points:', realData.historicalData.length);
                
            } catch (apiError) {
                console.error('❌ Failed to force load TwelveData:', apiError);
                throw new Error('Cannot load real market data for pattern analysis');
            }
        }
        
        // STEP 2: Validate we have real data
        if (!realData || !realData.historicalData || realData.historicalData.length < 10) {
            throw new Error('Insufficient real market data for pattern analysis');
        }
        
        console.log(`📊 Using REAL data: ${realData.source}`);
        console.log(`📈 ${realData.historicalData.length} real data points`);
        console.log(`💰 Real current price: $${realData.price.toFixed(2)}`);
        
        // STEP 3: Convert real data to proper OHLC format
        const ohlcData = realData.historicalData.map((item, index) => {
            return {
                open: parseFloat(item.open),
                high: parseFloat(item.high), 
                low: parseFloat(item.low),
                close: parseFloat(item.close),
                datetime: item.datetime,
                volume: parseInt(item.volume || 0)
            };
        });
        
        console.log('🔄 Real OHLC data prepared:', ohlcData.length, 'candles');
        console.log('Sample candle:', ohlcData[ohlcData.length - 1]);
        
        // STEP 4: Detect patterns on real data
        let patterns = [];
        if (window.CandlestickPatterns) {
            patterns = window.CandlestickPatterns.detectPatterns(ohlcData);
            console.log(`🎯 Detected ${patterns.length} patterns from REAL market data`);
        } else {
            console.warn('⚠️ Pattern detection not available');
            patterns = [];
        }
        
        // STEP 5: Create chart with real data
        createRealCandlestickChart('candlestick-chart', realData, patterns);
        
        // STEP 6: Update UI to show REAL data source
        updateRealCandlestickUI(realData, patterns);
        
        // STEP 7: Show completed content
        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';
        
        console.log('✅ Candlestick tab loaded with VERIFIED REAL DATA!');
        
    } catch (error) {
        console.error('❌ Error loading real candlestick data:', error);
        
        const loadingEl = document.getElementById('candlestick-loading');
        const errorEl = document.getElementById('candlestick-error');
        
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) {
            errorEl.style.display = 'block';
            errorEl.innerHTML = `
                <div style="color: #e74c3c; text-align: center; padding: 20px;">
                    <h4>Real Data Loading Failed</h4>
                    <p>${error.message}</p>
                    <p style="margin-top: 10px; font-size: 0.9em;">
                        Please visit the <strong>15-Minute Interval</strong> tab first to load real market data.
                    </p>
                </div>
            `;
        }
    }
}

// Create chart specifically for real data
function createRealCandlestickChart(canvasId, realData, patterns) {
    try {
        console.log('📊 Creating chart with REAL TwelveData...');
        
        const ctx = document.getElementById(canvasId);
        if (!ctx) throw new Error('Canvas not found');
        
        // Destroy existing chart
        if (window.candlestickChart) {
            window.candlestickChart.destroy();
        }
        
        // Process real data
        const labels = realData.historicalData.map(item => {
            const date = new Date(item.datetime);
            return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        });
        
        const prices = realData.historicalData.map(item => parseFloat(item.close));
        
        // Create chart
        window.candlestickChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Real Close Price (TwelveData)',
                    data: prices,
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
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
                        text: `${realData.symbol} - REAL 15-Minute Patterns (TwelveData)`,
                        font: { size: 16, weight: 'bold' },
                        color: '#2c3e50'
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            afterBody: function(context) {
                                const index = context[0].dataIndex;
                                const pattern = patterns.find(p => p.index === index);
                                if (pattern) {
                                    return [``, `🎯 ${pattern.name}`, `${Math.round(pattern.confidence * 100)}% confidence`];
                                }
                                return [];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: { display: true, text: 'Real Price ($)' }
                    },
                    x: {
                        title: { display: true, text: 'Time (15-min intervals - TwelveData)' }
                    }
                }
            }
        });
        
        // Add pattern highlighting
        if (patterns.length > 0) {
            addRealPatternHighlights(window.candlestickChart, patterns);
        }
        
        console.log('✅ Real data chart created successfully');
        
    } catch (error) {
        console.error('❌ Real chart creation failed:', error);
    }
}

// Update UI specifically for real data
function updateRealCandlestickUI(realData, patterns) {
    try {
        console.log('🎨 Updating UI with REAL data...');
        
        // Update header with real data
        const symbolEl = document.getElementById('candlestick-symbol');
        const priceEl = document.getElementById('candlestick-price');
        const changeEl = document.getElementById('candlestick-change');
        const sourceEl = document.getElementById('candlestick-source-info');
        
        if (symbolEl) symbolEl.textContent = realData.symbol;
        if (priceEl) priceEl.textContent = `$${realData.price.toFixed(2)}`;
        
        if (changeEl) {
            const changeFormatted = realData.change ? realData.change.toFixed(2) : '0.00';
            const changePercentFormatted = realData.changePercent ? realData.changePercent.toFixed(2) : '0.00';
            const changeColor = (realData.change >= 0) ? '#27ae60' : '#e74c3c';
            const changeSymbol = (realData.change >= 0) ? '+' : '';
            
            changeEl.innerHTML = `
                <div style="font-size: 0.9em; color: ${changeColor}; margin-top: 5px;">
                    ${changeSymbol}${changeFormatted} (${changeSymbol}${changePercentFormatted}%)
                </div>
            `;
        }
        
        // FORCE show real data source
        if (sourceEl) {
            sourceEl.innerHTML = `
                <div style="font-size: 0.8em; color: #7f8c8d;">
                    <strong style="color: #27ae60;">TwelveData 15-minute intervals</strong> • Real Market Data • Pattern Analysis
                    <span style="background: #27ae60; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.7em; margin-left: 8px; font-weight: bold;">🥇 REAL DATA</span>
                </div>
            `;
        }
        
        // Update patterns with real data context
        updateRealPatternsList(patterns, realData);
        
        console.log('✅ UI updated with REAL data indicators');
        
    } catch (error) {
        console.error('❌ Real UI update failed:', error);
    }
}

// Update patterns list with real data context
function updateRealPatternsList(patterns, realData) {
    try {
        const patternsList = document.getElementById('detected-patterns-list');
        if (!patternsList) return;
        
        if (patterns.length === 0) {
            patternsList.innerHTML = `
                <div class="no-patterns">
                    <div style="margin-bottom: 10px;">📊 No patterns detected in current real market data</div>
                    <div style="font-size: 0.85em; color: #7f8c8d;">
                        Analyzed ${realData.historicalData.length} real 15-minute intervals from TwelveData
                    </div>
                </div>
            `;
            return;
        }
        
        patternsList.innerHTML = patterns.map(pattern => `
            <div class="pattern-detected ${pattern.bullish ? 'bullish' : 'bearish'}">
                <div class="pattern-header">
                    <div class="pattern-name">
                        ${pattern.emoji} ${pattern.name}
                        <span style="background: #27ae60; color: white; padding: 1px 4px; border-radius: 6px; font-size: 0.7em; margin-left: 5px;">REAL</span>
                    </div>
                    <div class="pattern-confidence">
                        ${Math.round(pattern.confidence * 100)}%
                    </div>
                </div>
                <div class="pattern-description">
                    ${pattern.description}
                </div>
                <div class="pattern-location">
                    📍 Real Market Data • Interval ${pattern.index} • Price: $${pattern.price.toFixed(2)}
                </div>
            </div>
        `).join('');
        
        // Update summary with real data context
        updateRealPatternSummary(patterns, realData);
        
    } catch (error) {
        console.error('❌ Real patterns list update failed:', error);
    }
}

// Update summary with real data context  
function updateRealPatternSummary(patterns, realData) {
    try {
        const summaryDiv = document.getElementById('pattern-summary');
        if (!summaryDiv) return;
        
        summaryDiv.style.display = 'block';
        
        const bullishPatterns = patterns.filter(p => p.bullish);
        const bearishPatterns = patterns.filter(p => !p.bullish);
        const avgConfidence = patterns.length > 0 ? patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length : 0;
        
        const bullishEl = document.getElementById('bullish-count');
        const bearishEl = document.getElementById('bearish-count');
        const confidenceEl = document.getElementById('avg-confidence');
        const signalEl = document.getElementById('overall-signal');
        
        if (bullishEl) bullishEl.textContent = bullishPatterns.length;
        if (bearishEl) bearishEl.textContent = bearishPatterns.length;
        if (confidenceEl) confidenceEl.textContent = Math.round(avgConfidence * 100) + '%';
        
        if (signalEl) {
            let signal;
            if (patterns.length === 0) {
                signal = `NO PATTERNS - Analyzed ${realData.historicalData.length} real intervals`;
                signalEl.className = 'overall-signal';
            } else if (bullishPatterns.length > bearishPatterns.length) {
                signal = 'BULLISH - Real market patterns suggest upward movement';
                signalEl.className = 'overall-signal bullish';
            } else if (bearishPatterns.length > bullishPatterns.length) {
                signal = 'BEARISH - Real market patterns suggest downward movement';
                signalEl.className = 'overall-signal bearish';
            } else {
                signal = 'NEUTRAL - Mixed real market pattern signals';
                signalEl.className = 'overall-signal';
            }
            
            signalEl.textContent = signal;
        }
        
    } catch (error) {
        console.error('❌ Real pattern summary update failed:', error);
    }
}

// Add pattern highlighting for real data
function addRealPatternHighlights(chart, patterns) {
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
                
                // Larger, more visible markers for real data
                ctx.fillStyle = pattern.bullish ? 'rgba(46, 204, 113, 0.95)' : 'rgba(231, 76, 60, 0.95)';
                ctx.strokeStyle = pattern.bullish ? '#27ae60' : '#e74c3c';
                ctx.lineWidth = 4;
                
                ctx.beginPath();
                ctx.arc(x, y, 18, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                
                // Pattern emoji
                ctx.fillStyle = 'white';
                ctx.font = 'bold 18px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(pattern.emoji, x, y);
                
                // "REAL" indicator
                ctx.fillStyle = 'rgba(52, 152, 219, 0.9)';
                ctx.font = 'bold 8px Arial';
                ctx.fillText('REAL', x, y + 25);
                
            } catch (e) {
                console.warn('Pattern highlight error:', e);
            }
        });
        
        ctx.restore();
    };
    
    chart.update('none');
}

// OVERRIDE the switchTab function to use forced real data loading
window.switchTab = function(tabName) {
    console.log(`🔄 Switching to tab: ${tabName}`);
    
    // Update tab UI
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`)?.classList.add('active');
    
    // Handle candlestick tab with FORCED real data
    if (tabName === 'candlestick') {
        console.log('🕯️ FORCING real data load for candlestick tab...');
        setTimeout(() => {
            loadCandlestickDataForced(window.currentSymbol || 'AAPL');
        }, 100);
        return;
    }
    
    // Handle other tabs normally
    if (tabName === 'intraday' && document.getElementById('intraday-content').style.display === 'none') {
        if (window.loadIntradayData) window.loadIntradayData(window.currentSymbol);
    }
    
    if (tabName === 'intraday15' && document.getElementById('intraday15-content').style.display === 'none') {
        if (window.loadIntraday15Data) window.loadIntraday15Data(window.currentSymbol);
    }
    
    if (tabName === 'chatgpt') {
        if (window.initializeChatGPTTab) window.initializeChatGPTTab();
    }
};

console.log('🔧 FORCED real data candlestick integration loaded');
