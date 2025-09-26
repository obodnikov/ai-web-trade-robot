// Daily Tab Module - handles daily data fetching and chart creation

// Daily data fetching
async function fetchTwelveDataDaily() {
    if (!currentSymbol) {
        console.error('No symbol selected');
        return null;
    }

    const apiKey = "demo"; // Replace with your actual API key
    const url = `https://api.twelvedata.com/time_series?symbol=${currentSymbol}&interval=1day&outputsize=5000&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "error") {
            console.error("API Error:", data.message);
            throw new Error(data.message);
        }

        if (!data.values || !Array.isArray(data.values)) {
            console.warn("Invalid or missing data from API, using demo data");
            return generateDemoData(365, 'daily');
        }

        return data.values.reverse();
    } catch (error) {
        console.error("Error fetching daily data:", error);
        return generateDemoData(365, 'daily');
    }
}

// Load daily data and update chart
async function loadDailyData() {
    try {
        document.getElementById('daily-loading').style.display = 'block';
        document.getElementById('daily-error').style.display = 'none';

        const dailyData = await fetchTwelveDataDaily();

        if (!dailyData || dailyData.length === 0) {
            throw new Error('No daily data available');
        }

        updateDailyChart(dailyData);
        updateDailyStats(dailyData);
        lastDailyData = dailyData;

        // Show content and hide loading
        document.getElementById('daily-content').style.display = 'block';

    } catch (error) {
        console.error("Error loading daily data:", error);
        document.getElementById('daily-error').style.display = 'block';
        document.getElementById('daily-error').textContent = 'Error loading daily data: ' + error.message;
    } finally {
        document.getElementById('daily-loading').style.display = 'none';
    }
}

// Update daily chart
function updateDailyChart(data) {
    if (!data || data.length === 0) return;

    const labels = data.slice(-250).map(item => {
        const date = new Date(item.datetime);
        return formatChartDateTime(date);
    });

    const prices = data.slice(-250).map(item => parseFloat(item.close));
    const sma20 = calculateSMA(prices, 20);
    const sma50 = calculateSMA(prices, 50);
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    const macd = calculateMACD(prices);
    const rsi = calculateRSI(prices);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: `${currentSymbol} Price`,
                data: prices,
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.1
            },
            {
                label: 'SMA 20',
                data: sma20,
                borderColor: '#FF9800',
                backgroundColor: 'transparent',
                borderWidth: 1,
                fill: false,
                pointRadius: 0
            },
            {
                label: 'SMA 50',
                data: sma50,
                borderColor: '#9C27B0',
                backgroundColor: 'transparent',
                borderWidth: 1,
                fill: false,
                pointRadius: 0
            }
        ]
    };

    const config = {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                title: {
                    display: true,
                    text: `${currentSymbol} - Daily Analysis`
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date'
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

    if (dailyChart) {
        dailyChart.destroy();
    }

    const ctx = document.getElementById('dailyChart').getContext('2d');
    dailyChart = new Chart(ctx, config);

    updateDailyIndicators(sma20, sma50, ema12, ema26, macd, rsi, data.slice(-250));
}

// Update daily indicators
function updateDailyIndicators(sma20, sma50, ema12, ema26, macd, rsi, data) {
    const latestPrice = parseFloat(data[data.length - 1].close);
    const previousPrice = parseFloat(data[data.length - 2].close);
    const priceChange = latestPrice - previousPrice;
    const priceChangePercent = ((priceChange / previousPrice) * 100).toFixed(2);

    const latestEma12 = ema12[ema12.length - 1];
    const latestEma26 = ema26[ema26.length - 1];
    const latestMacd = macd.histogram[macd.histogram.length - 1];
    const latestRsi = rsi[rsi.length - 1];

    document.getElementById('daily-price').textContent = `$${latestPrice.toFixed(2)}`;
    document.getElementById('daily-change').textContent = `${priceChange >= 0 ? '+' : ''}$${priceChange.toFixed(2)} (${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent}%)`;
    document.getElementById('daily-change').className = priceChange >= 0 ? 'positive' : 'negative';

    // Use existing HTML element IDs
    document.getElementById('daily-sma20').textContent = sma20[sma20.length - 1]?.toFixed(2) || 'N/A';
    document.getElementById('daily-sma50').textContent = sma50[sma50.length - 1]?.toFixed(2) || 'N/A';
    document.getElementById('daily-macd').textContent = latestMacd?.toFixed(4) || 'N/A';
    document.getElementById('daily-rsi').textContent = latestRsi?.toFixed(2) || 'N/A';

    // Update other elements
    document.getElementById('daily-symbol').textContent = currentSymbol;

    const signal = generateTradingSignal(latestRsi, latestMacd, latestEma12, latestEma26);
    document.getElementById('daily-signal').textContent = `${signal.action} - ${signal.confidence}% confidence`;
}

// Update daily statistics
function updateDailyStats(data) {
    if (!data || data.length === 0) return;

    const prices = data.map(item => parseFloat(item.close));
    const volumes = data.map(item => parseFloat(item.volume || 0));

    const latestPrice = prices[prices.length - 1];
    const highestPrice = Math.max(...prices);
    const lowestPrice = Math.min(...prices);
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;

    const volatility = calculateVolatility(prices);

    document.getElementById('daily-volume').textContent = avgVolume.toLocaleString();
    document.getElementById('daily-range').textContent = `$${highestPrice.toFixed(2)} / $${lowestPrice.toFixed(2)}`;
}

// Calculate volatility
function calculateVolatility(prices) {
    if (prices.length < 2) return 0;

    const returns = [];
    for (let i = 1; i < prices.length; i++) {
        returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length;

    return Math.sqrt(variance * 252) * 100; // Annualized volatility
}

// Reload daily data
async function reloadDailyData() {
    await loadDailyData();
}