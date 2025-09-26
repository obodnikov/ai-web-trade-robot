// AI Analysis Module - handles AI-powered stock analysis and recommendations

// AI Analysis request handler
async function requestAIAnalysis() {
    const submitButton = document.getElementById('submit-analysis');
    const loadingDiv = document.getElementById('ai-loading');
    const resultsDiv = document.getElementById('ai-results');
    const errorDiv = document.getElementById('ai-error');

    if (!currentSymbol) {
        showError('Please select a symbol first', errorDiv);
        return;
    }

    try {
        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Analyzing...';
        loadingDiv.style.display = 'block';
        resultsDiv.style.display = 'none';
        errorDiv.style.display = 'none';

        // Collect all available data for analysis
        const analysisData = await prepareAnalysisData();

        if (!analysisData) {
            throw new Error('No data available for analysis');
        }

        // Generate AI analysis
        const analysis = await generateAIAnalysis(analysisData);

        // Display results
        displayAIResults(analysis);

    } catch (error) {
        console.error('Error during AI analysis:', error);
        showError('Error performing AI analysis: ' + error.message, errorDiv);
    } finally {
        // Reset UI state
        submitButton.disabled = false;
        submitButton.textContent = 'Get AI Analysis';
        loadingDiv.style.display = 'none';
    }
}

// Prepare comprehensive data for AI analysis
async function prepareAnalysisData() {
    try {
        const data = {
            symbol: currentSymbol,
            timestamp: new Date().toISOString(),
            dailyData: lastDailyData?.slice(-30) || [],
            intradayData: lastIntradayData?.slice(-50) || [],
            intraday15Data: lastIntraday15Data?.slice(-50) || [],
            intraday5Data: lastIntraday5Data?.slice(-50) || [],
            candlestickData: lastCandlestickData?.slice(-30) || [],
            candlestick5Data: lastCandlestick5Data?.slice(-30) || []
        };

        // Add technical indicators
        if (data.dailyData.length > 0) {
            const prices = data.dailyData.map(item => parseFloat(item.close));
            data.technicalIndicators = {
                sma20: calculateSMA(prices, 20),
                sma50: calculateSMA(prices, 50),
                ema12: calculateEMA(prices, 12),
                ema26: calculateEMA(prices, 26),
                macd: calculateMACD(prices),
                rsi: calculateRSI(prices)
            };
        }

        // Add detected patterns
        if (data.candlestickData.length > 0) {
            data.detectedPatterns = detectPatterns(data.candlestickData);
        }

        return data;

    } catch (error) {
        console.error('Error preparing analysis data:', error);
        return null;
    }
}

// Generate AI analysis based on collected data
async function generateAIAnalysis(data) {
    // This is a mock AI analysis function
    // In a real implementation, this would call an actual AI service

    const analysis = {
        symbol: data.symbol,
        timestamp: data.timestamp,
        overallSentiment: determineSentiment(data),
        technicalAnalysis: analyzeTechnicalIndicators(data),
        patternAnalysis: analyzePatterns(data),
        priceTargets: calculatePriceTargets(data),
        recommendations: generateRecommendations(data),
        riskAssessment: assessRisk(data),
        confidence: calculateConfidence(data)
    };

    return analysis;
}

// Determine overall market sentiment
function determineSentiment(data) {
    if (!data.technicalIndicators) return 'NEUTRAL';

    const { rsi, macd } = data.technicalIndicators;
    const latestRsi = rsi[rsi.length - 1];
    const latestMacd = macd.histogram[macd.histogram.length - 1];

    if (latestRsi > 70 || latestMacd < -0.5) return 'BEARISH';
    if (latestRsi < 30 || latestMacd > 0.5) return 'BULLISH';
    return 'NEUTRAL';
}

// Analyze technical indicators
function analyzeTechnicalIndicators(data) {
    if (!data.technicalIndicators) {
        return { summary: 'Insufficient data for technical analysis' };
    }

    const { sma20, sma50, ema12, ema26, macd, rsi } = data.technicalIndicators;
    const latestPrice = parseFloat(data.dailyData[data.dailyData.length - 1].close);

    const analysis = {
        movingAverages: {
            sma20: sma20[sma20.length - 1],
            sma50: sma50[sma50.length - 1],
            trend: latestPrice > sma20[sma20.length - 1] ? 'UPTREND' : 'DOWNTREND'
        },
        momentum: {
            rsi: rsi[rsi.length - 1],
            rsiSignal: rsi[rsi.length - 1] > 70 ? 'OVERBOUGHT' : rsi[rsi.length - 1] < 30 ? 'OVERSOLD' : 'NEUTRAL'
        },
        macdAnalysis: {
            histogram: macd.histogram[macd.histogram.length - 1],
            signal: macd.histogram[macd.histogram.length - 1] > 0 ? 'BULLISH' : 'BEARISH'
        }
    };

    return analysis;
}

// Analyze detected patterns
function analyzePatterns(data) {
    if (!data.detectedPatterns || data.detectedPatterns.length === 0) {
        return { summary: 'No significant patterns detected' };
    }

    const recentPatterns = data.detectedPatterns.slice(-5);
    const bullishPatterns = recentPatterns.filter(p => p.type.includes('bullish')).length;
    const bearishPatterns = recentPatterns.filter(p => p.type.includes('bearish')).length;

    return {
        totalPatterns: recentPatterns.length,
        bullishSignals: bullishPatterns,
        bearishSignals: bearishPatterns,
        dominantSignal: bullishPatterns > bearishPatterns ? 'BULLISH' : bearishPatterns > bullishPatterns ? 'BEARISH' : 'NEUTRAL',
        recentPatterns: recentPatterns.map(p => ({ name: p.name, type: p.type, confidence: p.confidence }))
    };
}

// Calculate price targets
function calculatePriceTargets(data) {
    if (!data.dailyData || data.dailyData.length === 0) {
        return { error: 'Insufficient data for price targets' };
    }

    const prices = data.dailyData.map(item => parseFloat(item.close));
    const latestPrice = prices[prices.length - 1];
    const volatility = calculateVolatility(prices.slice(-20));

    return {
        current: latestPrice,
        support: latestPrice * (1 - volatility / 100 * 0.5),
        resistance: latestPrice * (1 + volatility / 100 * 0.5),
        bullishTarget: latestPrice * 1.05,
        bearishTarget: latestPrice * 0.95
    };
}

// Generate trading recommendations
function generateRecommendations(data) {
    const sentiment = determineSentiment(data);
    const technicalAnalysis = analyzeTechnicalIndicators(data);
    const patternAnalysis = analyzePatterns(data);

    let recommendation = 'HOLD';
    let reasoning = [];

    if (sentiment === 'BULLISH' && patternAnalysis.dominantSignal === 'BULLISH') {
        recommendation = 'BUY';
        reasoning.push('Bullish sentiment supported by pattern analysis');
    } else if (sentiment === 'BEARISH' && patternAnalysis.dominantSignal === 'BEARISH') {
        recommendation = 'SELL';
        reasoning.push('Bearish sentiment confirmed by pattern signals');
    } else if (technicalAnalysis.momentum?.rsiSignal === 'OVERSOLD') {
        recommendation = 'BUY';
        reasoning.push('RSI indicates oversold conditions');
    } else if (technicalAnalysis.momentum?.rsiSignal === 'OVERBOUGHT') {
        recommendation = 'SELL';
        reasoning.push('RSI indicates overbought conditions');
    } else {
        reasoning.push('Mixed signals suggest maintaining current position');
    }

    return {
        action: recommendation,
        reasoning: reasoning,
        timeframe: 'Short to Medium Term',
        stopLoss: calculateStopLoss(data),
        takeProfit: calculateTakeProfit(data)
    };
}

// Assess investment risk
function assessRisk(data) {
    if (!data.dailyData || data.dailyData.length < 10) {
        return { level: 'UNKNOWN', reason: 'Insufficient data' };
    }

    const prices = data.dailyData.map(item => parseFloat(item.close));
    const volatility = calculateVolatility(prices.slice(-20));

    let riskLevel = 'LOW';
    let riskFactors = [];

    if (volatility > 25) {
        riskLevel = 'HIGH';
        riskFactors.push('High price volatility');
    } else if (volatility > 15) {
        riskLevel = 'MEDIUM';
        riskFactors.push('Moderate price volatility');
    }

    if (data.technicalIndicators) {
        const rsi = data.technicalIndicators.rsi[data.technicalIndicators.rsi.length - 1];
        if (rsi > 80 || rsi < 20) {
            riskFactors.push('Extreme RSI readings indicate potential reversal');
            riskLevel = riskLevel === 'LOW' ? 'MEDIUM' : 'HIGH';
        }
    }

    return {
        level: riskLevel,
        factors: riskFactors,
        volatility: volatility
    };
}

// Calculate overall analysis confidence
function calculateConfidence(data) {
    let confidence = 50; // Base confidence

    // Increase confidence based on data availability
    if (data.dailyData && data.dailyData.length > 50) confidence += 15;
    if (data.technicalIndicators) confidence += 15;
    if (data.detectedPatterns && data.detectedPatterns.length > 0) confidence += 10;
    if (data.intradayData && data.intradayData.length > 0) confidence += 5;
    if (data.intraday15Data && data.intraday15Data.length > 0) confidence += 5;

    return Math.min(confidence, 95); // Cap at 95%
}

// Calculate stop loss level
function calculateStopLoss(data) {
    if (!data.dailyData || data.dailyData.length === 0) return 'N/A';

    const prices = data.dailyData.map(item => parseFloat(item.close));
    const latestPrice = prices[prices.length - 1];
    const volatility = calculateVolatility(prices.slice(-20));

    return (latestPrice * (1 - volatility / 100 * 0.3)).toFixed(2);
}

// Calculate take profit level
function calculateTakeProfit(data) {
    if (!data.dailyData || data.dailyData.length === 0) return 'N/A';

    const prices = data.dailyData.map(item => parseFloat(item.close));
    const latestPrice = prices[prices.length - 1];
    const volatility = calculateVolatility(prices.slice(-20));

    return (latestPrice * (1 + volatility / 100 * 0.5)).toFixed(2);
}

// Display AI analysis results
function displayAIResults(analysis) {
    const resultsDiv = document.getElementById('ai-results');

    resultsDiv.innerHTML = `
        <div class="analysis-header">
            <h3>AI Analysis for ${analysis.symbol}</h3>
            <div class="analysis-meta">
                <span class="confidence">Confidence: ${analysis.confidence}%</span>
                <span class="timestamp">${new Date(analysis.timestamp).toLocaleString()}</span>
            </div>
        </div>

        <div class="analysis-sections">
            <div class="analysis-section">
                <h4>📊 Overall Assessment</h4>
                <div class="sentiment ${analysis.overallSentiment.toLowerCase()}">
                    Sentiment: ${analysis.overallSentiment}
                </div>
            </div>

            <div class="analysis-section">
                <h4>📈 Technical Analysis</h4>
                <div class="technical-summary">
                    <p><strong>Trend:</strong> ${analysis.technicalAnalysis.movingAverages?.trend || 'N/A'}</p>
                    <p><strong>RSI Signal:</strong> ${analysis.technicalAnalysis.momentum?.rsiSignal || 'N/A'}</p>
                    <p><strong>MACD Signal:</strong> ${analysis.technicalAnalysis.macdAnalysis?.signal || 'N/A'}</p>
                </div>
            </div>

            <div class="analysis-section">
                <h4>🎯 Pattern Analysis</h4>
                <div class="pattern-summary">
                    <p><strong>Recent Patterns:</strong> ${analysis.patternAnalysis.totalPatterns || 0}</p>
                    <p><strong>Bullish Signals:</strong> ${analysis.patternAnalysis.bullishSignals || 0}</p>
                    <p><strong>Bearish Signals:</strong> ${analysis.patternAnalysis.bearishSignals || 0}</p>
                    <p><strong>Dominant Signal:</strong> ${analysis.patternAnalysis.dominantSignal || 'NEUTRAL'}</p>
                </div>
            </div>

            <div class="analysis-section">
                <h4>🎯 Price Targets</h4>
                <div class="price-targets">
                    <p><strong>Current:</strong> $${analysis.priceTargets.current?.toFixed(2) || 'N/A'}</p>
                    <p><strong>Support:</strong> $${analysis.priceTargets.support?.toFixed(2) || 'N/A'}</p>
                    <p><strong>Resistance:</strong> $${analysis.priceTargets.resistance?.toFixed(2) || 'N/A'}</p>
                </div>
            </div>

            <div class="analysis-section">
                <h4>💡 Recommendations</h4>
                <div class="recommendation ${analysis.recommendations.action.toLowerCase()}">
                    <strong>${analysis.recommendations.action}</strong>
                </div>
                <div class="reasoning">
                    ${analysis.recommendations.reasoning.map(reason => `<p>• ${reason}</p>`).join('')}
                </div>
                <div class="trade-levels">
                    <p><strong>Stop Loss:</strong> $${analysis.recommendations.stopLoss}</p>
                    <p><strong>Take Profit:</strong> $${analysis.recommendations.takeProfit}</p>
                </div>
            </div>

            <div class="analysis-section">
                <h4>⚠️ Risk Assessment</h4>
                <div class="risk-level ${analysis.riskAssessment.level.toLowerCase()}">
                    Risk Level: ${analysis.riskAssessment.level}
                </div>
                <div class="risk-factors">
                    ${analysis.riskAssessment.factors.map(factor => `<p>• ${factor}</p>`).join('')}
                </div>
            </div>
        </div>

        <div class="analysis-disclaimer">
            <p><small>⚠️ This analysis is for educational purposes only and should not be considered as financial advice. Always conduct your own research and consult with a qualified financial advisor before making investment decisions.</small></p>
        </div>
    `;

    resultsDiv.style.display = 'block';
}

// Show error message
function showError(message, errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}