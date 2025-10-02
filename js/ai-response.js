
// ChatGPT Integration Functions
function initializeChatGPTTab() {
    const generateBtn = document.getElementById('generateAnalysisBtn');
    const statusDiv = document.getElementById('analysis-status');
    
    // Check if we have data from both intervals
    if (!dailyData || !intradayData) {
        statusDiv.className = 'analysis-status error';
        statusDiv.style.display = 'block';
        statusDiv.textContent = '⚠️ Please load data from both Daily and 30-Minute tabs first before generating AI analysis.';
        generateBtn.disabled = true;
        return;
    }
    
    // Enable the button if we have data
    generateBtn.disabled = false;
    statusDiv.style.display = 'none';
}

function generateChatGPTPrompt() {
    if (!dailyData || !intradayData) {
        throw new Error('Missing data for analysis. Please load both daily and intraday data first.');
    }
    
    // Calculate indicators for both timeframes
    const dailyRSI = calculateRSI(dailyData.historicalPrices);
    const dailyMACD = calculateMACD(dailyData.historicalPrices);
    const dailySMA20 = calculateSMA(dailyData.historicalPrices, 20);
    const dailySMA50 = calculateSMA(dailyData.historicalPrices, 50);
    
    const intradayRSI = calculateRSI(intradayData.historicalPrices);
    const intradayMACD = calculateMACD(intradayData.historicalPrices);
    const intradaySMA20 = calculateSMA(intradayData.historicalPrices, 20);
    const intradaySMA50 = calculateSMA(intradayData.historicalPrices, 50);
    
    // Format volume
    const dailyVolumeFormatted = dailyData.volume > 1000000 ? 
        (dailyData.volume / 1000000).toFixed(1) + 'M' : 
        (dailyData.volume / 1000).toFixed(0) + 'K';
    
    const intradayVolumeFormatted = intradayData.volume > 1000000 ? 
        (intradayData.volume / 1000000).toFixed(1) + 'M' : 
        (intradayData.volume / 1000).toFixed(0) + 'K';
    
    const prompt = `Analyze the following 60-day technical data (one day interval) for the symbol ${currentSymbol}: 
RSI (14) ${dailyRSI ? dailyRSI.toFixed(2) : 'N/A'} 
MACD ${dailyMACD ? dailyMACD.macd.toFixed(4) : 'N/A'} 
SMA 20 ${dailySMA20 ? dailySMA20.toFixed(2) : 'N/A'} 
SMA 50 ${dailySMA50 ? dailySMA50.toFixed(2) : 'N/A'} 
Volume ${dailyVolumeFormatted} 
High/Low ${dailyData.lowPrice.toFixed(2)} - ${dailyData.highPrice.toFixed(2)} 
and technical data with 30 minutes interval: 
RSI (14) ${intradayRSI ? intradayRSI.toFixed(2) : 'N/A'} 
MACD ${intradayMACD ? intradayMACD.macd.toFixed(4) : 'N/A'} 
SMA 20 ${intradaySMA20 ? intradaySMA20.toFixed(2) : 'N/A'} 
SMA 50 ${intradaySMA50 ? intradaySMA50.toFixed(2) : 'N/A'} 
Avg Volume ${intradayVolumeFormatted} 
30min Range ${intradayData.lowPrice.toFixed(2)} - ${intradayData.highPrice.toFixed(2)} 
Current price ${dailyData.price.toFixed(2)}. 
Identify the primary upward/downward trend, explain what these indicate about the current market sentiment. Focus on Short-term (intraday), 3 day and 5 days trading strategy`;
    
    return prompt;
}

// Replace the generateAIAnalysis function with this:
async function generateAIAnalysis() {
    const generateBtn = document.getElementById('generateAnalysisBtn');
    const statusDiv = document.getElementById('analysis-status');
    const promptDiv = document.getElementById('chatgpt-prompt');
    const responseDiv = document.getElementById('chatgpt-response');
    const placeholderDiv = document.getElementById('chatgpt-placeholder');
    const promptContent = document.getElementById('prompt-content');
    const responseContent = document.getElementById('response-content');
    
    try {
        // Disable button and show loading
        generateBtn.disabled = true;
        generateBtn.textContent = '🔄 Generating Analysis...';
        statusDiv.className = 'analysis-status loading';
        statusDiv.style.display = 'block';
        statusDiv.textContent = '🤖 Connecting to AI analysis service...';
        
        // Hide placeholder and show prompt
        placeholderDiv.style.display = 'none';
        
        // Generate and display the prompt
        const prompt = generateChatGPTPrompt();
        promptContent.textContent = prompt;
        promptDiv.style.display = 'block';
        
        // Update status
        statusDiv.textContent = '🧠 AI is analyzing your trading data...';
        
        // Call your middleware API
        const response = await fetch('http://localhost:3001/api/analyze-stock', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                symbol: currentSymbol
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API request failed: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Analysis failed');
        }
        
        // Display the response
        responseContent.innerHTML = `
            <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <strong>🤖 AI Analysis for ${result.symbol}</strong>
                <p style="margin: 5px 0; font-size: 0.9em; color: #7f8c8d;">
                    Generated: ${new Date(result.timestamp).toLocaleString()} | 
                    Model: ${result.model} | 
                    Tokens: ${result.tokensUsed}
                </p>
            </div>
            <div style="line-height: 1.6; white-space: pre-wrap;">${result.analysis}</div>
        `;
        responseDiv.style.display = 'block';
        
        // Update status
        statusDiv.className = 'analysis-status success';
        statusDiv.textContent = '✅ AI analysis completed successfully!';
        
        // Hide status after delay
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
        
    } catch (error) {
        console.error('Error generating AI analysis:', error);
        statusDiv.className = 'analysis-status error';
        statusDiv.textContent = `❌ Error: ${error.message}`;
        
        // Show fallback mock analysis
        setTimeout(() => {
            const mockAnalysis = generateMockAnalysis();
            responseContent.innerHTML = `
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #ffeaa7;">
                    <strong>⚠️ Fallback Analysis (AI Service Unavailable)</strong>
                    <p style="margin: 5px 0; font-size: 0.9em; color: #856404;">
                        Using local analysis while AI service is being set up...
                    </p>
                </div>
                ${mockAnalysis}
            `;
            responseDiv.style.display = 'block';
            statusDiv.style.display = 'none';
        }, 2000);
        
    } finally {
        // Re-enable button
        generateBtn.disabled = false;
        generateBtn.textContent = '🧠 Generate AI Analysis';
    }
}

function formatAIResponse(aiText, symbol, metadata = {}) {
    // Parse AI response sections (assuming structured response from ChatGPT)
    const sections = parseAIResponse(aiText);
    
    // Calculate some basic trend info for styling
    const trendDirection = determineTrendFromAI(aiText);
    const confidenceLevel = extractConfidenceFromAI(aiText);
    
    return `
        <div style="line-height: 1.8;">
            <div class="ai-header-section">
                <h4 style="color: #2c3e50; margin-bottom: 15px; font-size: 1.4em;">
                    🤖 AI-Powered Technical Analysis for ${symbol}
                </h4>
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <div>
                            <strong>🎯 AI Analysis Status:</strong> Complete
                        </div>
                        <div>
                            <strong>⏰ Generated:</strong> ${new Date().toLocaleString()}
                        </div>
                        <div>
                            <strong>🔍 Confidence:</strong> 
                            <span style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 12px;">
                                ${confidenceLevel}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="background: ${trendDirection === 'Bullish' ? '#e8f5e8' : trendDirection === 'Bearish' ? '#fdf2f2' : '#f8f9fa'}; padding: 15px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid ${trendDirection === 'Bullish' ? '#27ae60' : trendDirection === 'Bearish' ? '#e74c3c' : '#3498db'};">
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <span style="font-size: 1.5em; margin-right: 10px;">
                        ${trendDirection === 'Bullish' ? '📈' : trendDirection === 'Bearish' ? '📉' : '⚖️'}
                    </span>
                    <strong style="color: #2c3e50; font-size: 1.1em;">Overall Market Sentiment: ${trendDirection || 'Neutral'}</strong>
                </div>
                <p style="margin: 8px 0; color: #2c3e50;">
                    ${sections.sentiment || extractSentimentFromAI(aiText)}
                </p>
            </div>
            
            <div style="background: #e8f4fd; padding: 15px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #3498db;">
                <h5 style="color: #2c3e50; margin-bottom: 12px; font-size: 1.1em;">
                    📊 Technical Indicators Summary
                </h5>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                    ${generateTechnicalSummaryCards()}
                </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                <h5 style="color: #2c3e50; margin-bottom: 15px; font-size: 1.1em;">
                    🎯 AI Trading Strategies
                </h5>
                
                <div style="display: grid; gap: 15px;">
                    <div class="strategy-card" style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #e74c3c;">
                        <div style="display: flex; align-items: center; margin-bottom: 10px;">
                            <span style="font-size: 1.2em; margin-right: 8px;">⚡</span>
                            <strong style="color: #2c3e50;">Short-term (Intraday Strategy)</strong>
                        </div>
                        <div style="background: #fff5f5; padding: 10px; border-radius: 6px; margin: 8px 0;">
                            ${formatStrategySection(sections.intraday || extractIntradayFromAI(aiText))}
                        </div>
                    </div>
                    
                    <div class="strategy-card" style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #f39c12;">
                        <div style="display: flex; align-items: center; margin-bottom: 10px;">
                            <span style="font-size: 1.2em; margin-right: 8px;">📈</span>
                            <strong style="color: #2c3e50;">3-Day Medium-term Strategy</strong>
                        </div>
                        <div style="background: #fffbf0; padding: 10px; border-radius: 6px; margin: 8px 0;">
                            ${formatStrategySection(sections.threeDay || extractThreeDayFromAI(aiText))}
                        </div>
                    </div>
                    
                    <div class="strategy-card" style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #27ae60;">
                        <div style="display: flex; align-items: center; margin-bottom: 10px;">
                            <span style="font-size: 1.2em; margin-right: 8px;">📊</span>
                            <strong style="color: #2c3e50;">5-Day Weekly Strategy</strong>
                        </div>
                        <div style="background: #f0f9f0; padding: 10px; border-radius: 6px; margin: 8px 0;">
                            ${formatStrategySection(sections.fiveDay || extractFiveDayFromAI(aiText))}
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h5 style="margin-bottom: 15px; font-size: 1.1em;">
                    💡 Key AI Insights & Recommendations
                </h5>
                <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
                    ${formatKeyInsights(sections.insights || extractInsightsFromAI(aiText))}
                </div>
            </div>
            
            <div style="background: #fdf2f2; border: 1px solid #f5c6cb; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <span style="font-size: 1.3em; margin-right: 10px;">⚠️</span>
                    <strong style="color: #721c24; font-size: 1.1em;">Risk Management & Disclaimers</strong>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px;">
                    ${formatRiskSection(sections.risk || extractRiskFromAI(aiText))}
                </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px; border-radius: 10px; text-align: center;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; font-size: 0.9em;">
                    <div>🤖 <strong>Powered by Advanced AI</strong></div>
                    <div>📊 <strong>Model:</strong> ${metadata.model || 'GPT-4'}</div>
                    <div>⚡ <strong>Tokens:</strong> ${metadata.tokensUsed || 'N/A'}</div>
                    <div>🕒 <strong>Analysis Time:</strong> ${new Date().toLocaleTimeString()}</div>
                </div>
                <div style="margin-top: 10px; font-size: 0.8em; opacity: 0.9;">
                    This analysis combines real market data with AI-powered insights for educational purposes only.
                </div>
            </div>
        </div>
    `;
}

// Helper functions to parse and format AI response
function parseAIResponse(aiText) {
    const sections = {};
    
    // Try to extract structured sections from AI response
    const sentimentMatch = aiText.match(/(?:Market Sentiment|Sentiment Summary)[:\s]*(.*?)(?=\n\n|\*\*|##|$)/is);
    const intradayMatch = aiText.match(/(?:Short-term|Intraday)[:\s]*(.*?)(?=\n\n|\*\*|##|$)/is);
    const threeDayMatch = aiText.match(/(?:3-Day|Three Day)[:\s]*(.*?)(?=\n\n|\*\*|##|$)/is);
    const fiveDayMatch = aiText.match(/(?:5-Day|Five Day)[:\s]*(.*?)(?=\n\n|\*\*|##|$)/is);
    const riskMatch = aiText.match(/(?:Risk|Disclaimer)[:\s]*(.*?)(?=\n\n|\*\*|##|$)/is);
    
    sections.sentiment = sentimentMatch ? sentimentMatch[1].trim() : null;
    sections.intraday = intradayMatch ? intradayMatch[1].trim() : null;
    sections.threeDay = threeDayMatch ? threeDayMatch[1].trim() : null;
    sections.fiveDay = fiveDayMatch ? fiveDayMatch[1].trim() : null;
    sections.risk = riskMatch ? riskMatch[1].trim() : null;
    
    return sections;
}

function determineTrendFromAI(aiText) {
    const bullishWords = ['bullish', 'upward', 'positive', 'buy', 'long', 'rally'];
    const bearishWords = ['bearish', 'downward', 'negative', 'sell', 'short', 'decline'];
    
    const text = aiText.toLowerCase();
    const bullishCount = bullishWords.filter(word => text.includes(word)).length;
    const bearishCount = bearishWords.filter(word => text.includes(word)).length;
    
    if (bullishCount > bearishCount + 1) return 'Bullish';
    if (bearishCount > bullishCount + 1) return 'Bearish';
    return 'Neutral';
}

function extractConfidenceFromAI(aiText) {
    const confidenceMatch = aiText.match(/confidence[:\s]*(high|medium|low)/i);
    if (confidenceMatch) return confidenceMatch[1].charAt(0).toUpperCase() + confidenceMatch[1].slice(1);
    
    // Estimate confidence from text sentiment
    const certaintyWords = ['definitely', 'clearly', 'strong', 'significant'];
    const uncertaintyWords = ['might', 'could', 'possible', 'uncertain'];
    
    const text = aiText.toLowerCase();
    const certaintyCount = certaintyWords.filter(word => text.includes(word)).length;
    const uncertaintyCount = uncertaintyWords.filter(word => text.includes(word)).length;
    
    if (certaintyCount > uncertaintyCount) return 'High';
    if (uncertaintyCount > certaintyCount) return 'Low';
    return 'Medium';
}

function generateTechnicalSummaryCards() {
    if (!dailyData || !intradayData) return '<p>Technical data not available</p>';
    
    const dailyRSI = calculateRSI(dailyData.historicalPrices);
    const dailyMACD = calculateMACD(dailyData.historicalPrices);
    const intradayRSI = calculateRSI(intradayData.historicalPrices);
    const intradayMACD = calculateMACD(intradayData.historicalPrices);
    
    return `
        <div style="background: white; padding: 10px; border-radius: 6px; text-align: center;">
            <div style="font-weight: bold; color: #2c3e50; margin-bottom: 5px;">Daily RSI</div>
            <div style="font-size: 1.2em; color: ${dailyRSI > 70 ? '#e74c3c' : dailyRSI < 30 ? '#27ae60' : '#3498db'};">
                ${dailyRSI ? dailyRSI.toFixed(1) : 'N/A'}
            </div>
            <div style="font-size: 0.8em; color: #7f8c8d;">
                ${dailyRSI > 70 ? 'Overbought' : dailyRSI < 30 ? 'Oversold' : 'Neutral'}
            </div>
        </div>
        <div style="background: white; padding: 10px; border-radius: 6px; text-align: center;">
            <div style="font-weight: bold; color: #2c3e50; margin-bottom: 5px;">Daily MACD</div>
            <div style="font-size: 1.2em; color: ${dailyMACD && dailyMACD.macd > dailyMACD.signal ? '#27ae60' : '#e74c3c'};">
                ${dailyMACD ? dailyMACD.macd.toFixed(3) : 'N/A'}
            </div>
            <div style="font-size: 0.8em; color: #7f8c8d;">
                ${dailyMACD && dailyMACD.macd > dailyMACD.signal ? 'Bullish' : 'Bearish'}
            </div>
        </div>
        <div style="background: white; padding: 10px; border-radius: 6px; text-align: center;">
            <div style="font-weight: bold; color: #2c3e50; margin-bottom: 5px;">30min RSI</div>
            <div style="font-size: 1.2em; color: ${intradayRSI > 70 ? '#e74c3c' : intradayRSI < 30 ? '#27ae60' : '#3498db'};">
                ${intradayRSI ? intradayRSI.toFixed(1) : 'N/A'}
            </div>
            <div style="font-size: 0.8em; color: #7f8c8d;">
                ${intradayRSI > 70 ? 'Overbought' : intradayRSI < 30 ? 'Oversold' : 'Neutral'}
            </div>
        </div>
        <div style="background: white; padding: 10px; border-radius: 6px; text-align: center;">
            <div style="font-weight: bold; color: #2c3e50; margin-bottom: 5px;">30min MACD</div>
            <div style="font-size: 1.2em; color: ${intradayMACD && intradayMACD.macd > intradayMACD.signal ? '#27ae60' : '#e74c3c'};">
                ${intradayMACD ? intradayMACD.macd.toFixed(3) : 'N/A'}
            </div>
            <div style="font-size: 0.8em; color: #7f8c8d;">
                ${intradayMACD && intradayMACD.macd > intradayMACD.signal ? 'Bullish' : 'Bearish'}
            </div>
        </div>
    `;
}

// Helper functions for extracting and formatting AI response sections
function extractSentimentFromAI(aiText) {
    const firstParagraph = aiText.split('\n\n')[0];
    return firstParagraph || 'Based on technical analysis, the market shows mixed signals.';
}

function formatStrategySection(text) {
    if (!text) return '<p>No specific strategy recommendations available.</p>';
    return `<p style="margin: 0; line-height: 1.6;">${text}</p>`;
}

function extractIntradayFromAI(aiText) {
    const match = aiText.match(/(?:Short-term|Intraday).*?:(.*?)(?=\n\n|3-Day|5-Day|##|\*\*|$)/is);
    return match ? match[1].trim() : 'Monitor key support and resistance levels for intraday trading opportunities.';
}

function extractThreeDayFromAI(aiText) {
    const match = aiText.match(/(?:3-Day|Three Day).*?:(.*?)(?=\n\n|5-Day|##|\*\*|$)/is);
    return match ? match[1].trim() : 'Watch trend continuation patterns over the next 3 trading days.';
}

function extractFiveDayFromAI(aiText) {
    const match = aiText.match(/(?:5-Day|Five Day|Weekly).*?:(.*?)(?=\n\n|##|\*\*|$)/is);
    return match ? match[1].trim() : 'Evaluate weekly trend strength and potential reversal points.';
}

function formatKeyInsights(text) {
    if (!text) {
        return `
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>Always use stop-loss orders to manage risk</li>
                <li>Consider market conditions and news events</li>
                <li>Diversify your trading positions</li>
                <li>Monitor volume for confirmation signals</li>
            </ul>
        `;
    }
    return `<div style="line-height: 1.6;">${text}</div>`;
}

function extractInsightsFromAI(aiText) {
    const match = aiText.match(/(?:Key Insights?|Recommendations?).*?:(.*?)(?=\n\n|Risk|Disclaimer|##|\*\*|$)/is);
    return match ? match[1].trim() : null;
}

function formatRiskSection(text) {
    const defaultRisk = `
        <ul style="margin: 0; padding-left: 20px; line-height: 1.8; color: #721c24;">
            <li><strong>This is NOT financial advice.</strong> AI analysis is for educational purposes only.</li>
            <li>Past performance does not guarantee future results.</li>
            <li>Always conduct your own research before making trading decisions.</li>
            <li>Only invest what you can afford to lose.</li>
            <li>Consult with a licensed financial advisor for personalized advice.</li>
        </ul>
    `;
    if (!text) return defaultRisk;
    return `<div style="line-height: 1.6; color: #721c24;">${text}</div>`;
}

function extractRiskFromAI(aiText) {
    const match = aiText.match(/(?:Risk|Disclaimer).*?:(.*?)$/is);
    return match ? match[1].trim() : null;
}

function generateMockAnalysis() {
    if (!dailyData || !intradayData) {
        return '<p>Unable to generate analysis. Please load data first.</p>';
    }

    const dailyRSI = calculateRSI(dailyData.historicalPrices);
    const intradayRSI = calculateRSI(intradayData.historicalPrices);
    const dailyMACD = calculateMACD(dailyData.historicalPrices);

    let trend = 'Neutral';
    let sentiment = 'The market shows mixed signals';

    if (dailyRSI > 60 && dailyMACD?.macd > dailyMACD?.signal) {
        trend = 'Bullish';
        sentiment = 'Technical indicators suggest upward momentum';
    } else if (dailyRSI < 40 && dailyMACD?.macd < dailyMACD?.signal) {
        trend = 'Bearish';
        sentiment = 'Technical indicators suggest downward pressure';
    }

    return `
        <div style="line-height: 1.8;">
            <div style="background: ${trend === 'Bullish' ? '#e8f5e8' : trend === 'Bearish' ? '#fdf2f2' : '#f8f9fa'}; padding: 15px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid ${trend === 'Bullish' ? '#27ae60' : trend === 'Bearish' ? '#e74c3c' : '#3498db'};">
                <strong>Overall Market Sentiment: ${trend}</strong>
                <p>${sentiment}. Current price at ${dailyData.price.toFixed(2)}.</p>
            </div>

            <div style="background: #e8f4fd; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                <h5>📊 Technical Summary</h5>
                <ul>
                    <li><strong>Daily RSI:</strong> ${dailyRSI ? dailyRSI.toFixed(2) : 'N/A'} ${dailyRSI > 70 ? '(Overbought)' : dailyRSI < 30 ? '(Oversold)' : '(Neutral)'}</li>
                    <li><strong>30min RSI:</strong> ${intradayRSI ? intradayRSI.toFixed(2) : 'N/A'}</li>
                    <li><strong>MACD Signal:</strong> ${dailyMACD?.macd > dailyMACD?.signal ? 'Bullish' : 'Bearish'}</li>
                </ul>
            </div>

            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                <h5>🎯 Trading Strategies</h5>
                <div style="margin-bottom: 15px;">
                    <strong>⚡ Short-term (Intraday):</strong>
                    <p>Monitor ${intradayRSI > 70 ? 'resistance levels for potential reversal' : intradayRSI < 30 ? 'support levels for bounce opportunities' : 'key price levels for breakout'}</p>
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>📈 3-Day Strategy:</strong>
                    <p>Watch for ${trend === 'Bullish' ? 'continuation patterns' : trend === 'Bearish' ? 'reversal signals' : 'direction confirmation'}</p>
                </div>
                <div>
                    <strong>📊 5-Day Strategy:</strong>
                    <p>Evaluate weekly ${trend === 'Bullish' ? 'uptrend strength' : trend === 'Bearish' ? 'downtrend momentum' : 'consolidation pattern'}</p>
                </div>
            </div>

            <div style="background: #fdf2f2; border: 1px solid #f5c6cb; border-radius: 10px; padding: 15px;">
                <strong>⚠️ Risk Disclaimer:</strong>
                <ul style="margin-top: 10px;">
                    <li>This is NOT financial advice</li>
                    <li>AI service unavailable - using fallback analysis</li>
                    <li>Always do your own research</li>
                </ul>
            </div>
        </div>
    `;
}
