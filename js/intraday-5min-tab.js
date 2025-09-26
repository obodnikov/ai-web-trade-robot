// 5-Minute Intraday Tab Module - handles 5-minute interval data fetching and chart creation

// 5-minute data fetching
async function fetchTwelveData5() {
    if (!currentSymbol) {
        console.error('No symbol selected');
        return null;
    }

    const apiKey = "demo"; // Replace with your actual API key
    const url = `https://api.twelvedata.com/time_series?symbol=${currentSymbol}&interval=5min&outputsize=5000&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "error") {
            console.error("API Error:", data.message);
            throw new Error(data.message);
        }

        if (!data.values || !Array.isArray(data.values)) {
            console.warn("Invalid or missing data from API, using demo data");
            return generateDemoData(288, '5min'); // 24 hours * 12 intervals per hour
        }

        return data.values.reverse();
    } catch (error) {
        console.error("Error fetching 5-minute intraday data:", error);
        return generateDemoData(288, '5min');
    }
}

// Load 5-minute intraday data
async function loadIntraday5Data() {
    try {
        document.getElementById('intraday5-loading').style.display = 'block';
        document.getElementById('intraday5-error').style.display = 'none';

        const intraday5Data = await fetchTwelveData5();

        if (!intraday5Data || intraday5Data.length === 0) {
            throw new Error('No 5-minute intraday data available');
        }

        updateIntraday5Chart(intraday5Data);
        updateIntraday5Stats(intraday5Data);
        lastIntraday5Data = intraday5Data;

        // Show content and hide loading
        document.getElementById('intraday5-content').style.display = 'block';

    } catch (error) {
        console.error("Error loading 5-minute intraday data:", error);
        document.getElementById('intraday5-error').style.display = 'block';
        document.getElementById('intraday5-error').textContent = 'Error loading 5-minute intraday data: ' + error.message;
    } finally {
        document.getElementById('intraday5-loading').style.display = 'none';
    }
}

// Update 5-minute intraday chart
function updateIntraday5Chart(data) {
    if (!data || data.length === 0) return;

    const labels = data.slice(-120).map(item => {
        const date = new Date(item.datetime);
        return formatChartDateTime(date);
    });

    const prices = data.slice(-120).map(item => parseFloat(item.close));
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
                borderColor: '#00BCD4',
                backgroundColor: 'rgba(0, 188, 212, 0.1)',
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
                    text: `${currentSymbol} - 5-Minute Analysis`
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

    if (intraday5Chart) {
        intraday5Chart.destroy();
    }

    const ctx = document.getElementById('intraday5Chart').getContext('2d');
    intraday5Chart = new Chart(ctx, config);

    updateIntraday5Indicators(sma20, sma50, ema12, ema26, macd, rsi, data.slice(-120));
}

// Update 5-minute intraday indicators
function updateIntraday5Indicators(sma20, sma50, ema12, ema26, macd, rsi, data) {
    const latestPrice = parseFloat(data[data.length - 1].close);
    const previousPrice = parseFloat(data[data.length - 2].close);
    const priceChange = latestPrice - previousPrice;
    const priceChangePercent = ((priceChange / previousPrice) * 100).toFixed(2);

    const latestEma12 = ema12[ema12.length - 1];
    const latestEma26 = ema26[ema26.length - 1];
    const latestMacd = macd.histogram[macd.histogram.length - 1];
    const latestRsi = rsi[rsi.length - 1];

    document.getElementById('intraday5-price').textContent = `$${latestPrice.toFixed(2)}`;
    document.getElementById('intraday5-change').textContent = `${priceChange >= 0 ? '+' : ''}$${priceChange.toFixed(2)} (${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent}%)`;
    document.getElementById('intraday5-change').className = priceChange >= 0 ? 'positive' : 'negative';

    // Use existing HTML element IDs
    document.getElementById('intraday5-sma20').textContent = sma20[sma20.length - 1]?.toFixed(2) || 'N/A';
    document.getElementById('intraday5-sma50').textContent = sma50[sma50.length - 1]?.toFixed(2) || 'N/A';
    document.getElementById('intraday5-macd').textContent = latestMacd?.toFixed(4) || 'N/A';
    document.getElementById('intraday5-rsi').textContent = latestRsi?.toFixed(2) || 'N/A';

    // Update symbol
    document.getElementById('intraday5-symbol').textContent = currentSymbol;

    const signal = generateTradingSignal(latestRsi, latestMacd, latestEma12, latestEma26);
    document.getElementById('intraday5-signal').textContent = `${signal.action} - ${signal.confidence}% confidence`;
}

// Update 5-minute intraday statistics
function updateIntraday5Stats(data) {
    if (!data || data.length === 0) return;

    const prices = data.map(item => parseFloat(item.close));
    const volumes = data.map(item => parseFloat(item.volume || 0));

    const latestPrice = prices[prices.length - 1];
    const highestPrice = Math.max(...prices.slice(-288)); // Last 24 hours (288 * 5min)
    const lowestPrice = Math.min(...prices.slice(-288));
    const avgVolume = volumes.slice(-288).reduce((a, b) => a + b, 0) / Math.min(288, volumes.length);

    const volatility = calculateIntraday5Volatility(prices);

    document.getElementById('intraday5-volume').textContent = avgVolume.toLocaleString();
    document.getElementById('intraday5-range').textContent = `$${highestPrice.toFixed(2)} / $${lowestPrice.toFixed(2)}`;
}

// Calculate 5-minute intraday volatility
function calculateIntraday5Volatility(prices) {
    if (prices.length < 2) return 0;

    const returns = [];
    const recentPrices = prices.slice(-288); // Last 24 hours

    for (let i = 1; i < recentPrices.length; i++) {
        returns.push((recentPrices[i] - recentPrices[i-1]) / recentPrices[i-1]);
    }

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length;

    return Math.sqrt(variance * 288 * 252) * 100; // Annualized volatility for 5-min intervals
}

// Reload 5-minute intraday data
async function reloadIntraday5Data() {
    await loadIntraday5Data();
}