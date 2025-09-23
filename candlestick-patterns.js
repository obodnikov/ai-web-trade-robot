// candlestick-patterns.js - Add this as a separate file for pattern detection

class CandlestickPatterns {
    static detectPatterns(ohlcData, minConfidence = 0.75) {
        const patterns = [];
        
        if (!ohlcData || ohlcData.length < 3) {
            console.log('Insufficient OHLC data for pattern detection');
            return patterns;
        }
        
        console.log(`Detecting patterns in ${ohlcData.length} candles with min confidence ${minConfidence}`);
        
        for (let i = 2; i < ohlcData.length; i++) {
            const current = ohlcData[i];
            const previous = ohlcData[i - 1];
            const beforePrevious = ohlcData[i - 2];
            
            // Validate candle data
            if (!this.isValidCandle(current) || !this.isValidCandle(previous)) {
                continue;
            }
            
            // Detect various patterns
            const detectedPattern = this.detectSingleCandlePatterns(current, previous, i) ||
                                  this.detectTwoCandlePatterns(current, previous, i) ||
                                  this.detectThreeCandlePatterns(current, previous, beforePrevious, i);
            
            if (detectedPattern && detectedPattern.confidence >= minConfidence) {
                patterns.push({
                    ...detectedPattern,
                    index: i,
                    price: current.close,
                    datetime: current.datetime || current.date
                });
            }
        }
        
        console.log(`Found ${patterns.length} patterns above ${minConfidence} confidence`);
        return patterns;
    }
    
    static isValidCandle(candle) {
        return candle && 
               typeof candle.open === 'number' && 
               typeof candle.high === 'number' && 
               typeof candle.low === 'number' && 
               typeof candle.close === 'number' &&
               candle.high >= Math.max(candle.open, candle.close) &&
               candle.low <= Math.min(candle.open, candle.close);
    }
    
    static detectSingleCandlePatterns(current, previous, index) {
        const bodySize = Math.abs(current.close - current.open);
        const upperShadow = current.high - Math.max(current.open, current.close);
        const lowerShadow = Math.min(current.open, current.close) - current.low;
        const totalRange = current.high - current.low;
        
        // Hammer pattern
        if (lowerShadow > bodySize * 2 && upperShadow < bodySize * 0.5 && bodySize > 0) {
            return {
                name: 'Hammer',
                type: 'hammer',
                emoji: '🔨',
                bullish: true,
                confidence: Math.min(0.95, 0.7 + (lowerShadow / totalRange)),
                description: 'Bullish reversal pattern with long lower shadow'
            };
        }
        
        // Gravestone Doji
        if (upperShadow > totalRange * 0.6 && lowerShadow < totalRange * 0.1 && bodySize < totalRange * 0.1) {
            return {
                name: 'Gravestone Doji',
                type: 'gravestone',
                emoji: '🪦',
                bullish: false,
                confidence: Math.min(0.95, 0.75 + (upperShadow / totalRange)),
                description: 'Bearish reversal doji with long upper shadow'
            };
        }
        
        // Dragonfly Doji
        if (lowerShadow > totalRange * 0.6 && upperShadow < totalRange * 0.1 && bodySize < totalRange * 0.1) {
            return {
                name: 'Dragonfly Doji',
                type: 'dragonfly',
                emoji: '🐉',
                bullish: true,
                confidence: Math.min(0.95, 0.8 + (lowerShadow / totalRange)),
                description: 'Bullish reversal doji with long lower shadow'
            };
        }
        
        // Inverted Hammer
        if (upperShadow > bodySize * 2 && lowerShadow < bodySize * 0.5 && bodySize > 0) {
            return {
                name: 'Inverted Hammer',
                type: 'inverted-hammer',
                emoji: '🔨',
                bullish: false,
                confidence: Math.min(0.90, 0.75 + (upperShadow / totalRange)),
                description: 'Bearish reversal pattern with long upper shadow'
            };
        }
        
        return null;
    }
    
    static detectTwoCandlePatterns(current, previous, index) {
        const currentBody = Math.abs(current.close - current.open);
        const previousBody = Math.abs(previous.close - previous.open);
        
        // Bullish Engulfing
        if (previous.close < previous.open && // Previous bearish
            current.close > current.open && // Current bullish
            current.open < previous.close && // Opens below previous close
            current.close > previous.open && // Closes above previous open
            currentBody > previousBody * 1.2) { // Significant engulfing
            
            return {
                name: 'Bullish Engulfing',
                type: 'bullish-engulfing',
                emoji: '🐂',
                bullish: true,
                confidence: Math.min(0.95, 0.8 + (currentBody / previousBody - 1)),
                description: 'Strong bullish reversal - current candle engulfs previous bearish candle'
            };
        }
        
        // Bearish Engulfing
        if (previous.close > previous.open && // Previous bullish
            current.close < current.open && // Current bearish
            current.open > previous.close && // Opens above previous close
            current.close < previous.open && // Closes below previous open
            currentBody > previousBody * 1.2) { // Significant engulfing
            
            return {
                name: 'Bearish Engulfing',
                type: 'bearish-engulfing',
                emoji: '🐻',
                bullish: false,
                confidence: Math.min(0.95, 0.8 + (currentBody / previousBody - 1)),
                description: 'Strong bearish reversal - current candle engulfs previous bullish candle'
            };
        }
        
        // Tweezer Top
        if (Math.abs(current.high - previous.high) < (current.high * 0.005) && // Similar highs
            previous.close > previous.open && current.close < current.open) { // Bullish then bearish
            
            return {
                name: 'Tweezer Top',
                type: 'tweezer-top',
                emoji: '🤏',
                bullish: false,
                confidence: 0.85,
                description: 'Bearish reversal - two candles with similar highs'
            };
        }
        
        // Tweezer Bottom
        if (Math.abs(current.low - previous.low) < (current.low * 0.005) && // Similar lows
            previous.close < previous.open && current.close > current.open) { // Bearish then bullish
            
            return {
                name: 'Tweezer Bottom',
                type: 'tweezer-bottom',
                emoji: '🤏',
                bullish: true,
                confidence: 0.85,
                description: 'Bullish reversal - two candles with similar lows'
            };
        }
        
        return null;
    }
    
    static detectThreeCandlePatterns(current, previous, beforePrevious, index) {
        // Morning Star
        if (beforePrevious.close < beforePrevious.open && // First: bearish
            Math.abs(previous.close - previous.open) < Math.abs(beforePrevious.close - beforePrevious.open) * 0.3 && // Second: small body
            current.close > current.open && // Third: bullish
            current.close > (beforePrevious.open + beforePrevious.close) / 2) { // Closes above midpoint of first
            
            return {
                name: 'Morning Star',
                type: 'morning-star',
                emoji: '🌟',
                bullish: true,
                confidence: 0.90,
                description: 'Strong bullish reversal - three candle pattern indicating trend change'
            };
        }
        
        // Evening Star
        if (beforePrevious.close > beforePrevious.open && // First: bullish
            Math.abs(previous.close - previous.open) < Math.abs(beforePrevious.close - beforePrevious.open) * 0.3 && // Second: small body
            current.close < current.open && // Third: bearish
            current.close < (beforePrevious.open + beforePrevious.close) / 2) { // Closes below midpoint of first
            
            return {
                name: 'Evening Star',
                type: 'evening-star',
                emoji: '🌙',
                bullish: false,
                confidence: 0.90,
                description: 'Strong bearish reversal - three candle pattern indicating trend change'
            };
        }
        
        // Three White Soldiers
        if (beforePrevious.close > beforePrevious.open &&
            previous.close > previous.open &&
            current.close > current.open &&
            previous.close > beforePrevious.close &&
            current.close > previous.close &&
            previous.open > beforePrevious.open &&
            current.open > previous.open) {
            
            return {
                name: 'Three White Soldiers',
                type: 'three-white-soldiers',
                emoji: '⚪',
                bullish: true,
                confidence: 0.88,
                description: 'Strong bullish continuation - three consecutive bullish candles'
            };
        }
        
        // Three Black Crows
        if (beforePrevious.close < beforePrevious.open &&
            previous.close < previous.open &&
            current.close < current.open &&
            previous.close < beforePrevious.close &&
            current.close < previous.close &&
            previous.open < beforePrevious.open &&
            current.open < previous.open) {
            
            return {
                name: 'Three Black Crows',
                type: 'three-black-crows',
                emoji: '⚫',
                bullish: false,
                confidence: 0.88,
                description: 'Strong bearish continuation - three consecutive bearish candles'
            };
        }
        
        return null;
    }
}

// Make it available globally
window.CandlestickPatterns = CandlestickPatterns;