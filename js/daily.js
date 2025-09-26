// ================== DAILY DATA ==================
async function fetchTwelveDataDaily(symbol) {
    const apiKey = window.TWELVEDATA_API_KEY || 'demo';
    
    try {
        const dailyUrl = `https://api.twelvedata.com/time_series?symbol=${symbol}

function createChart(canvasId, data, title, interval = 'daily') {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    // Destroy existing chart
    if (canvasId === 'daily-chart' && dailyChart) {
        dailyChart.destroy();
    }


function updateUI(data, signal, prefix) {
    const changeFormatted = data.change ? data.change.toFixed(2) : '0.00';
    const changePercentFormatted = data.changePercent ? data.changePercent.toFixed(2) : '0.00';
    const changeColor = (data.change >= 0) ? '#27ae60' : '#e74c3c';
    const changeSymbol = (data.change >= 0) ? '+' : '';
    
    document.getElementById(`${prefix}

async function loadDailyData(symbol) {
    try {
        document.getElementById('daily-loading').style.display = 'flex';
        document.getElementById('daily-content').style.display = 'none';
        document.getElementById('daily-error').style.display = 'none';
        
        let data;
        try {
            data = await fetchTwelveDataDaily(symbol);
        }