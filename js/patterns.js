// ================== CANDLESTICK PATTERNS ==================
async function loadCandlestickDataFixed(symbol) {
    console.log(`🕯️ FIXED: Loading candlestick data for ${symbol}

async function loadCandlestick5DataFixed(symbol) {
    console.log(`🕯️ FIXED: Loading 5-minute candlestick data for ${symbol}

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


function createCandlestickChart(canvasId, data, patterns) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) {
        console.error('Canvas element not found');
        return;
    }


function createCandlestick5Chart(canvasId, data, patterns) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) {
        console.error('5-minute canvas element not found');
        return;
    }


function updateCandlestickUI(data, patterns) {
    const changeFormatted = data.change ? data.change.toFixed(2) : '0.00';
    const changePercentFormatted = data.changePercent ? data.changePercent.toFixed(2) : '0.00';
    const changeColor = (data.change >= 0) ? '#27ae60' : '#e74c3c';
    const changeSymbol = (data.change >= 0) ? '+' : '';
    
    // Update header
    document.getElementById('candlestick-symbol').textContent = data.symbol;
    document.getElementById('candlestick-price').textContent = `${data.price.toFixed(2)}

function updateCandlestick5UI(data, patterns) {
    const changeFormatted = data.change ? data.change.toFixed(2) : '0.00';
    const changePercentFormatted = data.changePercent ? data.changePercent.toFixed(2) : '0.00';
    const changeColor = (data.change >= 0) ? '#27ae60' : '#e74c3c';
    const changeSymbol = (data.change >= 0) ? '+' : '';

    document.getElementById('candlestick5-symbol').textContent = data.symbol;
    document.getElementById('candlestick5-price').textContent = `${data.price.toFixed(2)}

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


function updatePatternSummary(patterns) {
    const summaryDiv = document.getElementById('pattern-summary');
    
    if (!summaryDiv) return;
    
    if (patterns.length === 0) {
        summaryDiv.style.display = 'none';
        return;
    }


function initializeTooltipControls(chart, adjustedPatterns, allPatterns, startIndex) {
    const marketTooltipCheckbox = document.getElementById('market-tooltips-checkbox');
    const patternTooltipCheckbox = document.getElementById('pattern-tooltips-checkbox');
    
    if (!marketTooltipCheckbox || !patternTooltipCheckbox) {
        console.warn('Tooltip control checkboxes not found');
        return;
    }


function initialize5TooltipControls(chart, adjustedPatterns, allPatterns, startIndex) {
    const marketTooltipCheckbox = document.getElementById('market-tooltips5-checkbox');
    const patternTooltipCheckbox = document.getElementById('pattern-tooltips5-checkbox');

    if (!marketTooltipCheckbox || !patternTooltipCheckbox) {
        console.warn('5-minute tooltip control checkboxes not found');
        return;
    }


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
