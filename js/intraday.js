// ================== INTRADAY DATA (30m, 15m, 5m) ==================

// Functions moved from detailed-view.js:
// - fetchTwelveDataIntraday
// - fetchTwelveDataIntraday15
// - fetchTwelveDataIntraday5
// - loadIntradayData
// - loadIntraday15Data
// - loadIntraday5Data
// - reloadIntradayData
// - reloadIntraday15Data
// - reloadIntraday5Data

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

// TwelveData API for 5-minute intervals
async function fetchTwelveDataIntraday5(symbol) {
    const apiKey = window.TWELVEDATA_API_KEY || 'demo';

    try {
        console.log(`Fetching TwelveData 5min data for ${symbol}...`);

        const intradayUrl = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=5min&outputsize=78&apikey=${apiKey}`;
        const response = await fetch(intradayUrl);

        if (!response.ok) {
            throw new Error(`TwelveData API failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'error') {
            throw new Error(`TwelveData error: ${data.message}`);
        }

        if (!data.values || data.values.length === 0) {
            throw new Error('No 5-minute intraday data from TwelveData');
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

        console.log(`✅ TwelveData 5-minute data for ${symbol}: ${currentPrice.toFixed(2)}`);

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
            source: `TwelveData 5min (${historicalData.length} intervals)`
        };

    } catch (error) {
        console.error(`❌ TwelveData 5-minute error for ${symbol}:`, error.message);
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

async function loadIntraday5Data(symbol) {
    try {
        document.getElementById('intraday5-loading').style.display = 'flex';
        document.getElementById('intraday5-content').style.display = 'none';
        document.getElementById('intraday5-error').style.display = 'none';

        let data;
        try {
            data = await fetchTwelveDataIntraday5(symbol);
        } catch (error) {
            console.log('TwelveData 5-minute intraday failed, using demo data');
            data = generateDemoData(symbol, 'intraday5');
        }

        intraday5Data = data;

        const signal = generateTradingSignal(data.symbol, data.price, data.historicalPrices);

        createChart('intraday5-chart', data, `${symbol} - 5-Minute Intraday Chart`, 'intraday5');
        updateUI(data, signal, 'intraday5');

        document.getElementById('intraday5-loading').style.display = 'none';
        document.getElementById('intraday5-content').style.display = 'block';

    } catch (error) {
        console.error('Error loading 5-minute intraday data:', error);
        document.getElementById('intraday5-loading').style.display = 'none';
        document.getElementById('intraday5-error').style.display = 'block';
        document.getElementById('intraday5-error').textContent = `Error loading 5-minute data: ${error.message}`;
    }
}

function reloadIntradayData() {
    console.log('🔄 Reloading 30-minute intraday data...');
    // Clear cached data to force fresh API call
    intradayData = null;
    loadIntradayData(currentSymbol);
}

function reloadIntraday15Data() {
    console.log('🔄 Reloading 15-minute intraday data...');
    // Clear cached data to force fresh API call
    intraday15Data = null;
    loadIntraday15Data(currentSymbol);
}

function reloadIntraday5Data() {
    console.log('🔄 Reloading 5-minute intraday data...');
    // Clear cached data to force fresh API call
    intraday5Data = null;
    loadIntraday5Data(currentSymbol);
}