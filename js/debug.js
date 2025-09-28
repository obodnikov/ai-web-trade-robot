// debug.js - Add this as a separate file to help debug candlestick issues

window.debugCandlestick = {
    // Check current data state
    checkDataState: function() {
        console.log('=== CANDLESTICK DEBUG STATE ===');
        console.log('Current Symbol:', window.currentSymbol);
        console.log('intraday15Data exists:', !!window.intraday15Data);
        console.log('intraday15Data symbol:', window.intraday15Data?.symbol);
        console.log('intraday15Data source:', window.intraday15Data?.source);
        console.log('Historical data points:', window.intraday15Data?.historicalData?.length);
        console.log('Detected patterns:', window.detectedPatterns?.length || 0);
        console.log('CandlestickPatterns available:', !!window.CandlestickPatterns);
        console.log('Active tab:', document.querySelector('.tab-button.active')?.getAttribute('data-tab'));
        console.log('Candlestick content visible:', document.getElementById('candlestick-content')?.style.display !== 'none');
        
        if (window.intraday15Data?.historicalData) {
            const sample = window.intraday15Data.historicalData[0];
            console.log('Sample data point:', {
                datetime: sample.datetime,
                open: sample.open,
                high: sample.high,
                low: sample.low,
                close: sample.close
            });
        }
        
        console.log('=== END DEBUG STATE ===');
    },
    
    // Force clear all data
    clearAllData: function() {
        console.log('Clearing all cached data...');
        window.dailyData = null;
        window.intradayData = null;
        window.intraday15Data = null;
        window.detectedPatterns = [];
        console.log('Data cleared');
    },
    
    // Force reload candlestick with debugging
    forceReloadCandlestick: function(symbol) {
        symbol = symbol || window.currentSymbol || 'AAPL';
        console.log(`Force reloading candlestick for ${symbol}...`);
        this.clearAllData();
        
        // Switch to daily first, then back to candlestick
        switchTab('daily');
        setTimeout(() => {
            switchTab('candlestick');
        }, 2000);
    },
    
    // Test pattern detection directly
    testPatternDetection: function() {
        console.log('Testing pattern detection...');
        
        if (!window.intraday15Data) {
            console.log('No data available for testing');
            return;
        }
        
        const ohlcData = window.intraday15Data.historicalData.map(item => ({
            open: parseFloat(item.open) || parseFloat(item.close),
            high: parseFloat(item.high) || parseFloat(item.close),
            low: parseFloat(item.low) || parseFloat(item.close),
            close: parseFloat(item.close),
            datetime: item.datetime || item.date,
            volume: parseInt(item.volume) || 0
        }));
        
        console.log(`Testing with ${ohlcData.length} OHLC candles`);
        
        if (window.CandlestickPatterns) {
            const patterns = window.CandlestickPatterns.detectPatterns(ohlcData, 0.75);
            console.log(`Detected ${patterns.length} patterns:`, patterns);
            return patterns;
        } else {
            console.log('CandlestickPatterns not available');
            return [];
        }
    },
    
    // Check if patterns are being cached incorrectly
    checkPatternCaching: function() {
        console.log('Checking pattern caching behavior...');
        
        const tab1Visit = Date.now();
        console.log(`First visit to candlestick tab: ${new Date(tab1Visit).toLocaleTimeString()}`);
        
        // Simulate tab switch
        switchTab('candlestick');
        
        setTimeout(() => {
            const patterns1 = window.detectedPatterns ? [...window.detectedPatterns] : [];
            console.log(`First visit patterns: ${patterns1.length}`);
            
            // Switch away and back
            switchTab('daily');
            setTimeout(() => {
                switchTab('candlestick');
                
                setTimeout(() => {
                    const patterns2 = window.detectedPatterns ? [...window.detectedPatterns] : [];
                    console.log(`Second visit patterns: ${patterns2.length}`);
                    
                    if (patterns1.length !== patterns2.length) {
                        console.log('INCONSISTENCY DETECTED: Pattern count changed between visits');
                        console.log('First visit:', patterns1.map(p => p.name));
                        console.log('Second visit:', patterns2.map(p => p.name));
                    } else {
                        console.log('Pattern caching appears consistent');
                    }
                }, 1000);
            }, 500);
        }, 1000);
    },
    
    // Manual pattern injection for testing
    injectTestPatterns: function() {
        console.log('Injecting test patterns...');
        
        window.detectedPatterns = [
            {
                name: 'Test Hammer',
                type: 'hammer',
                emoji: '🔨',
                bullish: true,
                confidence: 0.85,
                description: 'Test bullish reversal pattern',
                index: 25,
                price: 100.5,
                datetime: new Date().toISOString()
            },
            {
                name: 'Test Gravestone Doji',
                type: 'gravestone',
                emoji: '🪦',
                bullish: false,
                confidence: 0.78,
                description: 'Test bearish reversal pattern',
                index: 35,
                price: 102.1,
                datetime: new Date().toISOString()
            }
        ];
        
        // Update the UI with test patterns
        if (window.updateDetectedPatternsList) {
            window.updateDetectedPatternsList(window.detectedPatterns);
            window.updatePatternSummary(window.detectedPatterns);
            window.highlightDetectedPatternsInGuide(window.detectedPatterns);
        }
        
        console.log('Test patterns injected and UI updated');
    },
    
    // Check timing issues
    checkTimingIssues: function() {
        console.log('Checking for timing issues...');
        
        const startTime = performance.now();
        
        // Check if DOM elements exist
        const candlestickTab = document.getElementById('candlestick-tab');
        const candlestickContent = document.getElementById('candlestick-content');
        const patternsList = document.getElementById('detected-patterns-list');
        const canvas = document.getElementById('candlestick-chart');
        
        console.log('DOM Elements Check:', {
            candlestickTab: !!candlestickTab,
            candlestickContent: !!candlestickContent,
            patternsList: !!patternsList,
            canvas: !!canvas
        });
        
        // Check if functions exist
        console.log('Function Availability:', {
            switchTab: typeof window.switchTab,
            loadCandlestickDataFixed: typeof window.loadCandlestickDataFixed,
            CandlestickPatterns: !!window.CandlestickPatterns,
            updateDetectedPatternsList: typeof window.updateDetectedPatternsList
        });
        
        const endTime = performance.now();
        console.log(`Timing check completed in ${endTime - startTime}ms`);
    },
    
    // Generate test data with guaranteed patterns
    generateTestDataWithPatterns: function() {
        console.log('Generating test data with guaranteed patterns...');
        
        const basePrice = 100;
        const testData = [];
        
        // Generate 50 normal candles
        for (let i = 0; i < 50; i++) {
            const price = basePrice + (Math.random() - 0.5) * 2;
            testData.push({
                open: price,
                high: price * 1.01,
                low: price * 0.99,
                close: price * (0.999 + Math.random() * 0.002),
                datetime: new Date(Date.now() - (50 - i) * 15 * 60 * 1000).toISOString(),
                volume: Math.floor(Math.random() * 100000)
            });
        }
        
        // Add a guaranteed hammer pattern at index 25
        testData[25] = {
            open: 100,
            high: 100.5,
            low: 95, // Long lower shadow
            close: 100.2,
            datetime: new Date(Date.now() - 25 * 15 * 60 * 1000).toISOString(),
            volume: 50000
        };
        
        // Add a guaranteed gravestone doji at index 35
        testData[35] = {
            open: 102,
            high: 107, // Long upper shadow
            low: 101.8,
            close: 102.1, // Small body
            datetime: new Date(Date.now() - 15 * 15 * 60 * 1000).toISOString(),
            volume: 75000
        };
        
        console.log('Test data generated with 2 guaranteed patterns');
        return testData;
    },
    
    // Test with guaranteed patterns
    testWithGuaranteedPatterns: function() {
        console.log('Testing with guaranteed pattern data...');
        
        const testData = this.generateTestDataWithPatterns();
        
        if (window.CandlestickPatterns) {
            const patterns = window.CandlestickPatterns.detectPatterns(testData, 0.75);
            console.log(`Should find 2 patterns, actually found: ${patterns.length}`);
            patterns.forEach((p, i) => {
                console.log(`Pattern ${i + 1}: ${p.name} at index ${p.index} with ${Math.round(p.confidence * 100)}% confidence`);
            });
            
            if (patterns.length < 2) {
                console.log('Pattern detection may have issues');
                console.log('Checking individual candles...');
                
                // Check hammer at index 25
                const hammer = testData[25];
                const hammerBodySize = Math.abs(hammer.close - hammer.open);
                const hammerLowerShadow = Math.min(hammer.open, hammer.close) - hammer.low;
                const hammerUpperShadow = hammer.high - Math.max(hammer.open, hammer.close);
                
                console.log('Hammer candle analysis:', {
                    bodySize: hammerBodySize,
                    lowerShadow: hammerLowerShadow,
                    upperShadow: hammerUpperShadow,
                    shouldBeHammer: hammerLowerShadow > hammerBodySize * 2 && hammerUpperShadow < hammerBodySize * 0.5
                });
            }
            
            return patterns;
        } else {
            console.log('CandlestickPatterns not available');
            return [];
        }
    }
};

// Auto-run basic checks on load
window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('🔍 Running automatic candlestick debug checks...');
        window.debugCandlestick.checkDataState();
        window.debugCandlestick.checkTimingIssues();
        
        console.log('💡 Available debug commands:');
        console.log('  - debugCandlestick.checkDataState()');
        console.log('  - debugCandlestick.forceReloadCandlestick()');
        console.log('  - debugCandlestick.testPatternDetection()');
        console.log('  - debugCandlestick.testWithGuaranteedPatterns()');
        console.log('  - debugCandlestick.injectTestPatterns()');
        console.log('  - debugCandlestick.checkPatternCaching()');
    }, 2000);
});