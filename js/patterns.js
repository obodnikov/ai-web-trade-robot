// patterns.js - Candlestick pattern analysis functions
//
// Functions in this file:
// - loadCandlestickDataFixed: Load 15-minute candlestick data with pattern analysis
// - loadCandlestick5DataFixed: Load 5-minute candlestick data with pattern analysis
// - loadCandlestickPatternsEngine: Load the candlestick patterns detection engine
// - createCandlestickChart: Create 15-minute candlestick chart with pattern highlighting
// - createCandlestick5Chart: Create 5-minute candlestick chart with pattern highlighting
// - updateCandlestickUI: Update UI elements for 15-minute candlestick analysis
// - updateCandlestick5UI: Update UI elements for 5-minute candlestick analysis
// - updateDetectedPatternsList: Update the list of detected patterns for 15-minute data
// - updateDetected5PatternsList: Update the list of detected patterns for 5-minute data
// - updatePatternSummary: Update the pattern summary statistics
// - highlightDetectedPatternsInGuide: Highlight detected patterns in the reference guide
// - initializeTooltipControls: Initialize tooltip controls for 15-minute chart
// - initialize5TooltipControls: Initialize tooltip controls for 5-minute chart
// - addPatternHighlights: Add pattern highlights to 15-minute chart
// - addPattern5Highlights: Add pattern highlights to 5-minute chart

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

// 5-minute candlestick data loading
async function loadCandlestick5DataFixed(symbol) {
    console.log(`🕯️ FIXED: Loading 5-minute candlestick data for ${symbol}`);

    try {
        const loadingEl = document.getElementById('candlestick5-loading');
        const contentEl = document.getElementById('candlestick5-content');
        const errorEl = document.getElementById('candlestick5-error');

        // Show loading
        loadingEl.style.display = 'flex';
        contentEl.style.display = 'none';
        errorEl.style.display = 'none';

        // STEP 1: Ensure we have 5-minute data
        let data5min = null;

        // Check if we have valid cached data
        if (intraday5Data &&
            intraday5Data.symbol === symbol &&
            intraday5Data.historicalData &&
            intraday5Data.historicalData.length > 20) {

            console.log(`✅ Using cached 5-minute data for ${symbol}`);
            data5min = intraday5Data;
        } else {
            console.log(`📡 Fetching fresh 5-minute data for ${symbol}`);
            try {
                data5min = await fetchTwelveDataIntraday5(symbol);
                intraday5Data = data5min; // Cache it
                console.log(`✅ Fresh data loaded: ${data5min.historicalData.length} intervals`);
            } catch (error) {
                console.log(`⚠️ API failed, using demo data: ${error.message}`);
                data5min = generateDemoData(symbol, 'intraday5');
                intraday5Data = data5min;
            }
        }

        // STEP 2: Convert to proper OHLC format
        const ohlcData = data5min.historicalData.map(item => ({
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
        detectedPatterns5 = patterns;

        // STEP 4: Create chart and update UI
        createCandlestick5Chart('candlestick5-chart', data5min, patterns);
        updateCandlestick5UI(data5min, patterns);

        // Show content
        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';

        console.log(`✅ 5-minute Candlestick loading completed for ${symbol}`);

    } catch (error) {
        console.error(`❌ 5-minute Candlestick loading failed for ${symbol}:`, error);

        document.getElementById('candlestick5-loading').style.display = 'none';
        document.getElementById('candlestick5-error').style.display = 'block';
        document.getElementById('candlestick5-error').innerHTML = `
            <div style="text-align: center; padding: 20px; color: #e74c3c;">
                <h4>⚠️ 5-Minute Candlestick Analysis Failed</h4>
                <p>Error: ${error.message}</p>
                <button onclick="loadCandlestick5DataFixed('${symbol}')"
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

// Updated createCandlestickChart function with error handling
function createCandlestickChart(canvasId, data, patterns) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) {
        console.error('Canvas element not found');
        return;
    }

    // Ensure the canvas is properly set up
    if (!ctx.getContext) {
        console.error('Canvas context not available');
        return;
    }

    // Destroy existing chart with error handling
    if (candlestickChart) {
        try {
            candlestickChart.destroy();
        } catch (error) {
            console.warn('Error destroying existing chart:', error);
        }
    }

    // Filter to last N candles for better readability
    const startIndex = Math.max(0, data.historicalData.length - CANDLESTICK_CHART_CANDLES);
    const filteredData = data.historicalData.slice(startIndex);

    const labels = filteredData.map(item => {
        return formatChartDateTime(item.datetime || item.date);
    });

    const prices = filteredData.map(item => parseFloat(item.close));

    // Calculate moving averages for filtered data
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

    try {
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
                        enabled: false, // Start with tooltips DISABLED by default
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.95)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: '#3498db',
                        borderWidth: 2,
                        cornerRadius: 8,
                        displayColors: false,
                        padding: 15,
                        bodySpacing: 6,
                        titleSpacing: 6,
                        caretPadding: 10,
                        yAlign: 'top',
                        xAlign: 'center',
                        position: 'average',
                        callbacks: {
                            afterBody: function(context) {
                                // Check if pattern tooltips are enabled
                                const showPatternTooltips = document.getElementById('pattern-tooltips-checkbox')?.checked;
                                if (!showPatternTooltips) {
                                    return [];
                                }

                                const index = context[0].dataIndex;
                                const originalIndex = index + startIndex;
                                const pattern = patterns.find(p => p.index === originalIndex);
                                if (pattern) {
                                    return [
                                        ``,
                                        `🎯 Pattern: ${pattern.emoji} ${pattern.name}`,
                                        `Confidence: ${Math.round(pattern.confidence * 100)}%`,
                                        `Type: ${pattern.bullish ? 'Bullish ⬆️' : 'Bearish ⬇️'}`,
                                        `Description: ${pattern.description}`
                                    ];
                                }
                                return [];
                            }
                        }
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

        // Initialize tooltip controls AFTER chart is created
        setTimeout(() => {
            initializeTooltipControls(candlestickChart, adjustedPatterns, patterns, startIndex);
        }, 100);

        console.log(`📈 Candlestick chart created with configurable tooltips (disabled by default)`);
        return candlestickChart;

    } catch (error) {
        console.error('Error creating candlestick chart:', error);
        return null;
    }
}

// Create 5-minute candlestick chart
function createCandlestick5Chart(canvasId, data, patterns) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) {
        console.error('5-minute canvas element not found');
        return;
    }

    // Destroy existing chart with error handling
    if (candlestick5Chart) {
        try {
            candlestick5Chart.destroy();
        } catch (error) {
            console.warn('Error destroying existing 5-minute chart:', error);
        }
    }

    // Filter to last N candles for better readability
    const startIndex = Math.max(0, data.historicalData.length - CANDLESTICK_CHART_CANDLES);
    const filteredData = data.historicalData.slice(startIndex);

    const labels = filteredData.map(item => {
        return formatChartDateTime(item.datetime || item.date);
    });

    const prices = filteredData.map(item => parseFloat(item.close));

    // Calculate moving averages for filtered data
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

    try {
        candlestick5Chart = new Chart(ctx, {
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
                        text: `${data.symbol} - 5-Minute Candlestick Pattern Analysis (Last ${CANDLESTICK_CHART_CANDLES} Candles)`,
                        font: { size: 16, weight: 'bold' },
                        color: '#2c3e50'
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        enabled: false, // Start with tooltips DISABLED by default
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.95)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: '#3498db',
                        borderWidth: 2,
                        cornerRadius: 8,
                        displayColors: false,
                        padding: 15,
                        bodySpacing: 6,
                        titleSpacing: 6,
                        caretPadding: 10,
                        yAlign: 'top',
                        xAlign: 'center',
                        position: 'average',
                        callbacks: {
                            afterBody: function(context) {
                                // Check if pattern tooltips are enabled
                                const showPatternTooltips = document.getElementById('pattern-tooltips5-checkbox')?.checked;
                                if (!showPatternTooltips) {
                                    return [];
                                }

                                const index = context[0].dataIndex;
                                const originalIndex = index + startIndex;
                                const pattern = patterns.find(p => p.index === originalIndex);
                                if (pattern) {
                                    return [
                                        ``,
                                        `🎯 Pattern: ${pattern.emoji} ${pattern.name}`,
                                        `Confidence: ${Math.round(pattern.confidence * 100)}%`,
                                        `Type: ${pattern.bullish ? 'Bullish ⬆️' : 'Bearish ⬇️'}`,
                                        `Description: ${pattern.description}`
                                    ];
                                }
                                return [];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: `Time (5-minute intervals) - Showing last ${CANDLESTICK_CHART_CANDLES} candles`,
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
            addPattern5Highlights(candlestick5Chart, adjustedPatterns, labels);
        }

        // Initialize tooltip controls AFTER chart is created
        setTimeout(() => {
            initialize5TooltipControls(candlestick5Chart, adjustedPatterns, patterns, startIndex);
        }, 100);

        console.log(`📈 5-minute Candlestick chart created with configurable tooltips (disabled by default)`);
        return candlestick5Chart;

    } catch (error) {
        console.error('Error creating 5-minute candlestick chart:', error);
        return null;
    }
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

// Update 5-minute candlestick UI
function updateCandlestick5UI(data, patterns) {
    const changeFormatted = data.change ? data.change.toFixed(2) : '0.00';
    const changePercentFormatted = data.changePercent ? data.changePercent.toFixed(2) : '0.00';
    const changeColor = (data.change >= 0) ? '#27ae60' : '#e74c3c';
    const changeSymbol = (data.change >= 0) ? '+' : '';

    document.getElementById('candlestick5-symbol').textContent = data.symbol;
    document.getElementById('candlestick5-price').textContent = `${data.price.toFixed(2)}`;
    document.getElementById('candlestick5-change').innerHTML = `
        <div style="font-size: 0.9em; color: ${changeColor}; margin-top: 5px;">
            ${changeSymbol}${changeFormatted} (${changeSymbol}${changePercentFormatted}%)
        </div>
    `;

    let sourceBadge = '';
    if (data.source.includes('TwelveData')) {
        sourceBadge = '<span class="data-source-badge primary-source">🥇 PRIMARY</span>';
    } else {
        sourceBadge = '<span class="data-source-badge demo-source">🔵 DEMO</span>';
    }

    document.getElementById('candlestick5-source-info').innerHTML = `
        <div style="font-size: 0.8em; color: #7f8c8d;">
            ${data.source} • Pattern Analysis${sourceBadge}
        </div>
    `;

    updateDetected5PatternsList(patterns);
//    highlightDetectedPatternsInGuide(patterns);
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
                    Location: Candle ${pattern.index} @ ${formatDateTimeWithYear(pattern.datetime)} • Price: ${pattern.price.toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
}

// Update 5-minute detected patterns list
function updateDetected5PatternsList(patterns) {
    const patternsList = document.getElementById('detected-patterns5-list');
    if (!patternsList) return;

    if (patterns.length === 0) {
        patternsList.innerHTML = `
            <div class="no-patterns">
                <div style="margin-bottom: 10px;">📊 No patterns detected in current 5-minute data</div>
                <div style="font-size: 0.85em; color: #7f8c8d;">
                    Patterns require 75%+ confidence threshold
                </div>
            </div>
        `;
        return;
    }

    patterns.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

    patternsList.innerHTML = patterns.map(pattern => {
        const confidenceClass = pattern.confidence > 0.9 ? 'high' : pattern.confidence > 0.8 ? 'medium' : '';
        return `
            <div class="pattern-detected ${pattern.bullish ? 'bullish' : 'bearish'}"
                 onclick="showPatternDetails('${pattern.type}')"
                 style="cursor: pointer;">
                <div class="pattern-header">
                    <div class="pattern-name">${pattern.emoji} ${pattern.name}</div>
                    <div class="pattern-confidence ${confidenceClass}">
                        ${Math.round(pattern.confidence * 100)}%
                    </div>
                </div>
                <div class="pattern-description">${pattern.description}</div>
                <div class="pattern-location">
                    Location: Candle ${pattern.index} @ ${formatDateTimeWithYear(pattern.datetime)} • Price: ${pattern.price.toFixed(2)}
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

// Initialize tooltip control checkboxes - FIXED VERSION
function initializeTooltipControls(chart, adjustedPatterns, allPatterns, startIndex) {
    const marketTooltipCheckbox = document.getElementById('market-tooltips-checkbox');
    const patternTooltipCheckbox = document.getElementById('pattern-tooltips-checkbox');

    if (!marketTooltipCheckbox || !patternTooltipCheckbox) {
        console.warn('Tooltip control checkboxes not found');
        return;
    }

    // Set default states (both UNCHECKED by default)
    marketTooltipCheckbox.checked = false;
    patternTooltipCheckbox.checked = false;

    // Start with tooltips disabled by default
    chart.options.plugins.tooltip.enabled = false;

    // Market tooltips control
    marketTooltipCheckbox.addEventListener('change', function() {
        if (!chart || !chart.options || !chart.options.plugins || !chart.options.plugins.tooltip) {
            console.warn('Chart or tooltip options not available');
            return;
        }

        chart.options.plugins.tooltip.enabled = this.checked;

        // Safely update chart with error handling
        try {
            if (chart && typeof chart.update === 'function') {
                if (chart && typeof chart.update === 'function') {
        try {
            chart.update('none');
        } catch (error) {
            console.warn('Error updating chart with pattern highlights:', error);
        }
    }
            }
        } catch (error) {
            console.error('Error updating chart:', error);
        }

        console.log(`Market tooltips ${this.checked ? 'enabled' : 'disabled'}`);
    });

    // Pattern tooltips control (handled in the callback, no need for chart update)
    patternTooltipCheckbox.addEventListener('change', function() {
        console.log(`Pattern tooltips ${this.checked ? 'enabled' : 'disabled'}`);
        // The tooltip callback will check this checkbox state automatically
    });
}

// Initialize 5-minute tooltip controls
function initialize5TooltipControls(chart, adjustedPatterns, allPatterns, startIndex) {
    const marketTooltipCheckbox = document.getElementById('market-tooltips5-checkbox');
    const patternTooltipCheckbox = document.getElementById('pattern-tooltips5-checkbox');

    if (!marketTooltipCheckbox || !patternTooltipCheckbox) {
        console.warn('5-minute tooltip control checkboxes not found');
        return;
    }

    // Set default states (both UNCHECKED by default)
    marketTooltipCheckbox.checked = false;
    patternTooltipCheckbox.checked = false;

    // Start with tooltips disabled by default
    chart.options.plugins.tooltip.enabled = false;

    // Market tooltips control
    marketTooltipCheckbox.addEventListener('change', function() {
        if (!chart || !chart.options || !chart.options.plugins || !chart.options.plugins.tooltip) {
            console.warn('Chart or tooltip options not available');
            return;
        }

        chart.options.plugins.tooltip.enabled = this.checked;

        // Safely update chart with error handling
        try {
            if (chart && typeof chart.update === 'function') {
                if (chart && typeof chart.update === 'function') {
        try {
            chart.update('none');
        } catch (error) {
            console.warn('Error updating chart with pattern highlights:', error);
        }
    }
            }
        } catch (error) {
            console.error('Error updating 5-minute chart:', error);
        }

        console.log('5-minute market tooltips ' + (this.checked ? 'enabled' : 'disabled'));
    });

    // Pattern tooltips control (handled in the callback, no need for chart update)
    patternTooltipCheckbox.addEventListener('change', function() {
        console.log('5-minute pattern tooltips ' + (this.checked ? 'enabled' : 'disabled'));
        // The tooltip callback will check this checkbox state automatically
    });
}

// Updated pattern highlighting function
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

    if (chart && typeof chart.update === 'function') {
        try {
            chart.update('none');
        } catch (error) {
            console.warn('Error updating chart with pattern highlights:', error);
        }
    }
}

// Add pattern highlights for 5-minute chart
function addPattern5Highlights(chart, patterns, labels) {
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
                console.warn('5-minute pattern highlight error:', e);
            }
        });

        ctx.restore();
    };

    if (chart && typeof chart.update === 'function') {
        try {
            chart.update('none');
        } catch (error) {
            console.warn('Error updating chart with pattern highlights:', error);
        }
    }
}
