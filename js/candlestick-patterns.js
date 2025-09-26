// Candlestick Patterns Module - handles pattern detection and chart creation for 15-min and 5-min intervals

// Load 15-minute candlestick data and detect patterns
async function loadCandlestickData() {
    try {
        document.getElementById('candlestick-loading').style.display = 'block';
        document.getElementById('candlestick-error').style.display = 'none';

        const candlestickData = await fetchTwelveData15();

        if (!candlestickData || candlestickData.length === 0) {
            throw new Error('No 15-minute candlestick data available');
        }

        createCandlestickChart(candlestickData);
        detectCandlestickPatterns(candlestickData, 'candlestick');
        lastCandlestickData = candlestickData;

    } catch (error) {
        console.error("Error loading 15-minute candlestick data:", error);
        document.getElementById('candlestick-error').style.display = 'block';
        document.getElementById('candlestick-error').textContent = 'Error loading 15-minute candlestick data: ' + error.message;
    } finally {
        document.getElementById('candlestick-loading').style.display = 'none';
    }
}

// Load 5-minute candlestick data and detect patterns
async function loadCandlestick5Data() {
    try {
        document.getElementById('candlestick5-loading').style.display = 'block';
        document.getElementById('candlestick5-error').style.display = 'none';

        const candlestick5Data = await fetchTwelveData5();

        if (!candlestick5Data || candlestick5Data.length === 0) {
            throw new Error('No 5-minute candlestick data available');
        }

        createCandlestick5Chart(candlestick5Data);
        detectCandlestickPatterns(candlestick5Data, 'candlestick5');
        lastCandlestick5Data = candlestick5Data;

    } catch (error) {
        console.error("Error loading 5-minute candlestick data:", error);
        document.getElementById('candlestick5-error').style.display = 'block';
        document.getElementById('candlestick5-error').textContent = 'Error loading 5-minute candlestick data: ' + error.message;
    } finally {
        document.getElementById('candlestick5-loading').style.display = 'none';
    }
}

// Create 15-minute candlestick chart
function createCandlestickChart(data) {
    if (!data || data.length === 0) return;

    const chartData = data.slice(-CANDLESTICK_CHART_CANDLES);
    const labels = chartData.map(item => {
        const date = new Date(item.datetime);
        return formatChartDateTime(date);
    });

    const prices = chartData.map(item => parseFloat(item.close));
    const sma20 = calculateSMA(prices, 20);
    const sma50 = calculateSMA(prices, 50);

    const candlestickDataset = chartData.map(item => ({
        x: new Date(item.datetime),
        o: parseFloat(item.open),
        h: parseFloat(item.high),
        l: parseFloat(item.low),
        c: parseFloat(item.close)
    }));

    const config = {
        type: 'candlestick',
        data: {
            labels: labels,
            datasets: [{
                label: `${currentSymbol} Candlesticks`,
                data: candlestickDataset,
                borderColor: {
                    up: '#26a69a',
                    down: '#ef5350',
                    unchanged: '#999999'
                },
                backgroundColor: {
                    up: 'rgba(38, 166, 154, 0.8)',
                    down: 'rgba(239, 83, 80, 0.8)',
                    unchanged: 'rgba(153, 153, 153, 0.8)'
                }
            }, {
                label: 'SMA 20',
                data: sma20,
                type: 'line',
                borderColor: '#FF9800',
                backgroundColor: 'transparent',
                borderWidth: 1,
                fill: false,
                pointRadius: 0
            }, {
                label: 'SMA 50',
                data: sma50,
                type: 'line',
                borderColor: '#9C27B0',
                backgroundColor: 'transparent',
                borderWidth: 1,
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${currentSymbol} - 15-Minute Candlestick Patterns`
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    enabled: tooltipEnabled,
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
                        label: function(context) {
                            const dataPoint = context.raw;
                            return [
                                `Open: $${dataPoint.o.toFixed(2)}`,
                                `High: $${dataPoint.h.toFixed(2)}`,
                                `Low: $${dataPoint.l.toFixed(2)}`,
                                `Close: $${dataPoint.c.toFixed(2)}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Price ($)'
                    }
                }
            }
        }
    };

    if (candlestickChart) {
        candlestickChart.destroy();
    }

    const ctx = document.getElementById('candlestickChart').getContext('2d');
    candlestickChart = new Chart(ctx, config);

    addPatternHighlights(chartData, 'candlestick');
    initializeTooltipControls();
}

// Create 5-minute candlestick chart
function createCandlestick5Chart(data) {
    if (!data || data.length === 0) return;

    const chartData = data.slice(-CANDLESTICK_CHART_CANDLES);
    const labels = chartData.map(item => {
        const date = new Date(item.datetime);
        return formatChartDateTime(date);
    });

    const prices = chartData.map(item => parseFloat(item.close));
    const sma20 = calculateSMA(prices, 20);
    const sma50 = calculateSMA(prices, 50);

    const candlestickDataset = chartData.map(item => ({
        x: new Date(item.datetime),
        o: parseFloat(item.open),
        h: parseFloat(item.high),
        l: parseFloat(item.low),
        c: parseFloat(item.close)
    }));

    const config = {
        type: 'candlestick',
        data: {
            labels: labels,
            datasets: [{
                label: `${currentSymbol} Candlesticks`,
                data: candlestickDataset,
                borderColor: {
                    up: '#26a69a',
                    down: '#ef5350',
                    unchanged: '#999999'
                },
                backgroundColor: {
                    up: 'rgba(38, 166, 154, 0.8)',
                    down: 'rgba(239, 83, 80, 0.8)',
                    unchanged: 'rgba(153, 153, 153, 0.8)'
                }
            }, {
                label: 'SMA 20',
                data: sma20,
                type: 'line',
                borderColor: '#FF9800',
                backgroundColor: 'transparent',
                borderWidth: 1,
                fill: false,
                pointRadius: 0
            }, {
                label: 'SMA 50',
                data: sma50,
                type: 'line',
                borderColor: '#9C27B0',
                backgroundColor: 'transparent',
                borderWidth: 1,
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${currentSymbol} - 5-Minute Candlestick Patterns`
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    enabled: tooltip5Enabled,
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
                        label: function(context) {
                            const dataPoint = context.raw;
                            return [
                                `Open: $${dataPoint.o.toFixed(2)}`,
                                `High: $${dataPoint.h.toFixed(2)}`,
                                `Low: $${dataPoint.l.toFixed(2)}`,
                                `Close: $${dataPoint.c.toFixed(2)}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Price ($)'
                    }
                }
            }
        }
    };

    if (candlestick5Chart) {
        candlestick5Chart.destroy();
    }

    const ctx = document.getElementById('candlestick5Chart').getContext('2d');
    candlestick5Chart = new Chart(ctx, config);

    addPattern5Highlights(chartData, 'candlestick5');
    initialize5TooltipControls();
}

// Add pattern highlights for 15-minute chart
function addPatternHighlights(data, tabType) {
    const patterns = detectPatterns(data);
    const chartContainer = document.getElementById('candlestickChart').parentElement;

    patterns.forEach((pattern, index) => {
        const highlight = document.createElement('div');
        highlight.className = 'pattern-highlight';
        highlight.innerHTML = `<span class="pattern-emoji">${pattern.emoji}</span>`;
        highlight.style.position = 'absolute';
        highlight.style.left = `${(pattern.index / data.length) * 100}%`;
        highlight.style.top = '10px';
        highlight.style.transform = 'translateX(-50%)';
        highlight.style.zIndex = '1000';
        highlight.title = `${pattern.name} (${pattern.confidence}% confidence)`;

        chartContainer.appendChild(highlight);
    });
}

// Add pattern highlights for 5-minute chart
function addPattern5Highlights(data, tabType) {
    const patterns = detectPatterns(data);
    const chartContainer = document.getElementById('candlestick5Chart').parentElement;

    patterns.forEach((pattern, index) => {
        const highlight = document.createElement('div');
        highlight.className = 'pattern-highlight';
        highlight.innerHTML = `<span class="pattern-emoji">${pattern.emoji}</span>`;
        highlight.style.position = 'absolute';
        highlight.style.left = `${(pattern.index / data.length) * 100}%`;
        highlight.style.top = '10px';
        highlight.style.transform = 'translateX(-50%)';
        highlight.style.zIndex = '1000';
        highlight.title = `${pattern.name} (${pattern.confidence}% confidence)`;

        chartContainer.appendChild(highlight);
    });
}

// Initialize tooltip controls for 15-minute chart
function initializeTooltipControls() {
    const toggleButton = document.getElementById('toggleTooltip');
    if (toggleButton) {
        toggleButton.onclick = function() {
            tooltipEnabled = !tooltipEnabled;
            candlestickChart.options.plugins.tooltip.enabled = tooltipEnabled;
            candlestickChart.update();
            toggleButton.textContent = tooltipEnabled ? 'Hide Tooltips' : 'Show Tooltips';
        };
    }
}

// Initialize tooltip controls for 5-minute chart
function initialize5TooltipControls() {
    const toggleButton = document.getElementById('toggleTooltip5');
    if (toggleButton) {
        toggleButton.onclick = function() {
            tooltip5Enabled = !tooltip5Enabled;
            candlestick5Chart.options.plugins.tooltip.enabled = tooltip5Enabled;
            candlestick5Chart.update();
            toggleButton.textContent = tooltip5Enabled ? 'Hide Tooltips' : 'Show Tooltips';
        };
    }
}

// Detect patterns in candlestick data
function detectPatterns(data) {
    const patterns = [];

    for (let i = 2; i < data.length - 2; i++) {
        const current = data[i];
        const prev = data[i - 1];
        const prev2 = data[i - 2];
        const next = data[i + 1];
        const next2 = data[i + 2];

        const currentClose = parseFloat(current.close);
        const currentOpen = parseFloat(current.open);
        const currentHigh = parseFloat(current.high);
        const currentLow = parseFloat(current.low);

        const prevClose = parseFloat(prev.close);
        const prevOpen = parseFloat(prev.open);

        // Doji pattern detection
        const bodySize = Math.abs(currentClose - currentOpen);
        const totalRange = currentHigh - currentLow;

        if (bodySize / totalRange < 0.1 && totalRange > 0) {
            patterns.push({
                name: 'Doji',
                emoji: '🎯',
                index: i,
                confidence: 75,
                type: 'reversal'
            });
        }

        // Hammer pattern detection
        const upperShadow = currentHigh - Math.max(currentOpen, currentClose);
        const lowerShadow = Math.min(currentOpen, currentClose) - currentLow;

        if (lowerShadow > bodySize * 2 && upperShadow < bodySize * 0.1) {
            patterns.push({
                name: 'Hammer',
                emoji: '🔨',
                index: i,
                confidence: 80,
                type: 'bullish_reversal'
            });
        }

        // Shooting Star pattern detection
        if (upperShadow > bodySize * 2 && lowerShadow < bodySize * 0.1) {
            patterns.push({
                name: 'Shooting Star',
                emoji: '⭐',
                index: i,
                confidence: 80,
                type: 'bearish_reversal'
            });
        }

        // Engulfing patterns
        if (i > 0) {
            const prevBodySize = Math.abs(prevClose - prevOpen);

            // Bullish Engulfing
            if (prevClose < prevOpen && currentClose > currentOpen &&
                currentOpen < prevClose && currentClose > prevOpen) {
                patterns.push({
                    name: 'Bullish Engulfing',
                    emoji: '🟢',
                    index: i,
                    confidence: 85,
                    type: 'bullish_reversal'
                });
            }

            // Bearish Engulfing
            if (prevClose > prevOpen && currentClose < currentOpen &&
                currentOpen > prevClose && currentClose < prevOpen) {
                patterns.push({
                    name: 'Bearish Engulfing',
                    emoji: '🔴',
                    index: i,
                    confidence: 85,
                    type: 'bearish_reversal'
                });
            }
        }
    }

    return patterns;
}

// Detect and display candlestick patterns
function detectCandlestickPatterns(data, tabType) {
    const patterns = detectPatterns(data);
    const patternsList = document.getElementById(`${tabType}-patterns-list`);

    if (!patternsList) return;

    patternsList.innerHTML = '';

    if (patterns.length === 0) {
        patternsList.innerHTML = '<p>No significant patterns detected in recent data.</p>';
        return;
    }

    patterns.slice(-10).forEach(pattern => {
        const patternItem = document.createElement('div');
        patternItem.className = 'pattern-item';

        const datetime = new Date(data[pattern.index].datetime);
        const timeStr = formatDateTimeWithYear(datetime);

        patternItem.innerHTML = `
            <div class="pattern-header">
                <span class="pattern-emoji">${pattern.emoji}</span>
                <span class="pattern-name">${pattern.name}</span>
                <span class="pattern-confidence">${pattern.confidence}%</span>
            </div>
            <div class="pattern-time">${timeStr}</div>
            <div class="pattern-type">${pattern.type.replace('_', ' ')}</div>
        `;

        patternsList.appendChild(patternItem);
    });

    updateDetectedPatternsList(patterns, data);
}