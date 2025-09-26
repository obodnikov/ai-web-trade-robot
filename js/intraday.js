// ================== INTRADAY DATA (30m, 15m, 5m) ==================
async function fetchTwelveDataIntraday(symbol) {
    const apiKey = window.TWELVEDATA_API_KEY || 'demo';
    
    try {
        const intradayUrl = `https://api.twelvedata.com/time_series?symbol=${symbol}

async function fetchTwelveDataIntraday15(symbol) {
    const apiKey = window.TWELVEDATA_API_KEY || 'demo';

    try {
        console.log(`Fetching TwelveData 15min data for ${symbol}

async function fetchTwelveDataIntraday5(symbol) {
    const apiKey = window.TWELVEDATA_API_KEY || 'demo';

    try {
        console.log(`Fetching TwelveData 5min data for ${symbol}

async function loadIntradayData(symbol) {
    try {
        document.getElementById('intraday-loading').style.display = 'flex';
        document.getElementById('intraday-content').style.display = 'none';
        document.getElementById('intraday-error').style.display = 'none';
        
        let data;
        try {
            data = await fetchTwelveDataIntraday(symbol);
        }

async function loadIntraday15Data(symbol) {
    try {
        document.getElementById('intraday15-loading').style.display = 'flex';
        document.getElementById('intraday15-content').style.display = 'none';
        document.getElementById('intraday15-error').style.display = 'none';

        let data;
        try {
            data = await fetchTwelveDataIntraday15(symbol);
        }

async function loadIntraday5Data(symbol) {
    try {
        document.getElementById('intraday5-loading').style.display = 'flex';
        document.getElementById('intraday5-content').style.display = 'none';
        document.getElementById('intraday5-error').style.display = 'none';

        let data;
        try {
            data = await fetchTwelveDataIntraday5(symbol);
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
