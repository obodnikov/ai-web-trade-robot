// Functions moved from detailed-view.js:
// - fetchTwelveDataDaily
// - loadDailyData
// - createChart
// - updateUI

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
    if (canvasId === 'intraday5-chart' && intraday5Chart) {
        intraday5Chart.destroy();
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

    if (canvasId === 'daily-chart') {
        dailyChart = chart;
    } else if (canvasId === 'intraday15-chart') {
        intraday15Chart = chart;
    } else if (canvasId === 'intraday5-chart') {
        intraday5Chart = chart;
    } else {
        intradayChart = chart;
    }

    return chart;
}

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