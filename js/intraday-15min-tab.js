// 15-Minute Intraday Tab Module - handles 15-minute interval data fetching and chart creation

// 15-minute data fetching
async function fetchTwelveData15() {
    if (!currentSymbol) {
        console.error('No symbol selected');
        return null;
    }

    const apiKey = "demo"; // Replace with your actual API key
    const url = `https://api.twelvedata.com/time_series?symbol=${currentSymbol}&interval=15min&outputsize=5000&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "error") {
            console.error("API Error:", data.message);
            throw new Error(data.message);
        }

        if (!data.values || !Array.isArray(data.values)) {
            console.warn("Invalid or missing data from API, using demo data");
            return generateDemoData(200, '15min');
        }

        return data.values.reverse();
    } catch (error) {
        console.error("Error fetching 15-minute intraday data:", error);
        return generateDemoData(200, '15min');
    }
}

// Load 15-minute intraday data
async function loadIntraday15Data() {
    try {
        document.getElementById('intraday15-loading').style.display = 'block';
        document.getElementById('intraday15-error').style.display = 'none';

        const intraday15Data = await fetchTwelveData15();

        if (!intraday15Data || intraday15Data.length === 0) {
            throw new Error('No 15-minute intraday data available');
        }

        updateIntraday15Chart(intraday15Data);
        updateIntraday15Stats(intraday15Data);
        lastIntraday15Data = intraday15Data;

        // Show content and hide loading
        document.getElementById('intraday15-content').style.display = 'block';

    } catch (error) {
        console.error("Error loading 15-minute intraday data:", error);
        document.getElementById('intraday15-error').style.display = 'block';
        document.getElementById('intraday15-error').textContent = 'Error loading 15-minute intraday data: ' + error.message;
    } finally {
        document.getElementById('intraday15-loading').style.display = 'none';
    }
}

// Update 15-minute intraday chart
function updateIntraday15Chart(data) {
    if (!data || data.length === 0) return;

    const labels = data.slice(-100).map(item => {
        const date = new Date(item.datetime);
        return formatChartDateTime(date);
    });

    const prices = data.slice(-100).map(item => parseFloat(item.close));
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
                borderColor: '#E91E63',
                backgroundColor: 'rgba(233, 30, 99, 0.1)',
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
                    text: `${currentSymbol} - 15-Minute Analysis`
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

    if (intraday15Chart) {
        intraday15Chart.destroy();
    }

    const ctx = document.getElementById('intraday15Chart').getContext('2d');
    intraday15Chart = new Chart(ctx, config);

    updateIntraday15Indicators(sma20, sma50, ema12, ema26, macd, rsi, data.slice(-100));
}

// Update 15-minute intraday indicators
function updateIntraday15Indicators(sma20, sma50, ema12, ema26, macd, rsi, data) {
    const latestPrice = parseFloat(data[data.length - 1].close);
    const previousPrice = parseFloat(data[data.length - 2].close);
    const priceChange = latestPrice - previousPrice;
    const priceChangePercent = ((priceChange / previousPrice) * 100).toFixed(2);

    const latestEma12 = ema12[ema12.length - 1];
    const latestEma26 = ema26[ema26.length - 1];
    const latestMacd = macd.histogram[macd.histogram.length - 1];
    const latestRsi = rsi[rsi.length - 1];

    document.getElementById('intraday15-price').textContent = `$${latestPrice.toFixed(2)}`;
    document.getElementById('intraday15-change').textContent = `${priceChange >= 0 ? '+' : ''}$${priceChange.toFixed(2)} (${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent}%)`;
    document.getElementById('intraday15-change').className = priceChange >= 0 ? 'positive' : 'negative';

    // Use existing HTML element IDs
    document.getElementById('intraday15-sma20').textContent = sma20[sma20.length - 1]?.toFixed(2) || 'N/A';
    document.getElementById('intraday15-sma50').textContent = sma50[sma50.length - 1]?.toFixed(2) || 'N/A';
    document.getElementById('intraday15-macd').textContent = latestMacd?.toFixed(4) || 'N/A';
    document.getElementById('intraday15-rsi').textContent = latestRsi?.toFixed(2) || 'N/A';

    // Update symbol
    document.getElementById('intraday15-symbol').textContent = currentSymbol;

    const signal = generateTradingSignal(latestRsi, latestMacd, latestEma12, latestEma26);
    document.getElementById('intraday15-signal').textContent = `${signal.action} - ${signal.confidence}% confidence`;
}

// Update 15-minute intraday statistics
function updateIntraday15Stats(data) {
    if (!data || data.length === 0) return;

    const prices = data.map(item => parseFloat(item.close));
    const volumes = data.map(item => parseFloat(item.volume || 0));

    const latestPrice = prices[prices.length - 1];
    const highestPrice = Math.max(...prices.slice(-96)); // Last 24 hours (96 * 15min)
    const lowestPrice = Math.min(...prices.slice(-96));
    const avgVolume = volumes.slice(-96).reduce((a, b) => a + b, 0) / Math.min(96, volumes.length);

    const volatility = calculateIntraday15Volatility(prices);

    document.getElementById('intraday15-volume').textContent = avgVolume.toLocaleString();
    document.getElementById('intraday15-range').textContent = `$${highestPrice.toFixed(2)} / $${lowestPrice.toFixed(2)}`;
}

// Calculate 15-minute intraday volatility
function calculateIntraday15Volatility(prices) {
    if (prices.length < 2) return 0;

    const returns = [];
    const recentPrices = prices.slice(-96); // Last 24 hours

    for (let i = 1; i < recentPrices.length; i++) {
        returns.push((recentPrices[i] - recentPrices[i-1]) / recentPrices[i-1]);
    }

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length;

    return Math.sqrt(variance * 96 * 252) * 100; // Annualized volatility for 15-min intervals
}

// Reload 15-minute intraday data
async function reloadIntraday15Data() {
    await loadIntraday15Data();
}