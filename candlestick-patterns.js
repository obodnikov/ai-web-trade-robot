// candlestick-patterns.js - Candlestick pattern detection for all 12 patterns

const CandlestickPatterns = {
    // Pattern emoji mappings
    patternEmojis: {
        'hammer': '🔨',
        'dragonfly': '🐉',
        'gravestone': '🪦',
        'inverted-hammer': '🔨',
        'tweezer-bottom': '🤏',
        'tweezer-top': '🤏',
        'morning-star': '🌟',
        'evening-star': '🌙',
        'bullish-engulfing': '🐂',
        'bearish-engulfing': '🐻',
        'three-white-soldiers': '⚪',
        'three-black-crows': '⚫'
    },

    // Main pattern detection function
    detectPatterns: function(ohlcData) {
        if (!ohlcData || ohlcData.length < 3) {
            return [];
        }

        const patterns = [];
        
        for (let i = 2; i < ohlcData.length; i++) {
            const current = ohlcData[i];
            const prev = ohlcData[i-1];
            const prev2 = ohlcData[i-2];
            
            // Validate candle data
            if (!this.isValidCandle(current) || !this.isValidCandle(prev)) {
                continue;
            }

            // Single candle patterns
            patterns.push(...this.detectSingleCandlePatterns(current, i));
            
            // Two candle patterns
            if (this.isValidCandle(prev)) {
                patterns.push(...this.detectTwoCandlePatterns(prev, current, i));
            }
            
            // Three candle patterns
            if (this.isValidCandle(prev2)) {
                patterns.push(...this.detectThreeCandlePatterns(prev2, prev, current, i));
            }
        }
        
        // Filter by confidence and remove duplicates
        return patterns
            .filter(p => p.confidence >= 0.75)
            .sort((a, b) => b.confidence - a.confidence);
    },

    // Validate candle data
    isValidCandle: function(candle) {
        return candle && 
               typeof candle.open === 'number' && 
               typeof candle.high === 'number' && 
               typeof candle.low === 'number' && 
               typeof candle.close === 'number' &&
               candle.high >= Math.max(candle.open, candle.close) &&
               candle.low <= Math.min(candle.open, candle.close) &&
               candle.high > candle.low;
    },

    // Calculate candle properties
    getCandleProperties: function(candle) {
        const body = Math.abs(candle.close - candle.open);
        const upperShadow = candle.high - Math.max(candle.open, candle.close);
        const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
        const totalRange = candle.high - candle.low;
        const isGreen = candle.close > candle.open;
        const isRed = candle.close < candle.open;
        const isDoji = Math.abs(candle.close - candle.open) < (totalRange * 0.1);
        
        return {
            body,
            upperShadow,
            lowerShadow,
            totalRange,
            isGreen,
            isRed,
            isDoji,
            bodyPercent: totalRange > 0 ? (body / totalRange) : 0,
            upperPercent: totalRange > 0 ? (upperShadow / totalRange) : 0,
            lowerPercent: totalRange > 0 ? (lowerShadow / totalRange) : 0
        };
    },

    // Single candle pattern detection
    detectSingleCandlePatterns: function(candle, index) {
        const patterns = [];
        const props = this.getCandleProperties(candle);
        
        // Hammer Pattern
        const hammer = this.detectHammer(candle, props);
        if (hammer.detected) {
            patterns.push({
                name: 'Hammer',
                type: 'hammer',
                emoji: this.patternEmojis.hammer,
                bullish: true,
                index: index,
                price: candle.close,
                confidence: hammer.confidence,
                description: 'Bullish reversal pattern with long lower shadow'
            });
        }
        
        // Dragonfly Doji
        const dragonfly = this.detectDragonflyDoji(candle, props);
        if (dragonfly.detected) {
            patterns.push({
                name: 'Dragonfly Doji',
                type: 'dragonfly',
                emoji: this.patternEmojis.dragonfly,
                bullish: true,
                index: index,
                price: candle.close,
                confidence: dragonfly.confidence,
                description: 'Bullish reversal doji with long lower shadow'
            });
        }
        
        // Gravestone Doji
        const gravestone = this.detectGravestoneDoji(candle, props);
        if (gravestone.detected) {
            patterns.push({
                name: 'Gravestone Doji',
                type: 'gravestone',
                emoji: this.patternEmojis.gravestone,
                bullish: false,
                index: index,
                price: candle.close,
                confidence: gravestone.confidence,
                description: 'Bearish reversal doji with long upper shadow'
            });
        }
        
        // Inverted Hammer
        const invertedHammer = this.detectInvertedHammer(candle, props);
        if (invertedHammer.detected) {
            patterns.push({
                name: 'Inverted Hammer',
                type: 'inverted-hammer',
                emoji: this.patternEmojis['inverted-hammer'],
                bullish: false,
                index: index,
                price: candle.close,
                confidence: invertedHammer.confidence,
                description: 'Bearish reversal pattern with long upper shadow'
            });
        }
        
        return patterns;
    },

    // Two candle pattern detection
    detectTwoCandlePatterns: function(prev, current, index) {
        const patterns = [];
        
        // Bullish Engulfing
        const bullishEngulfing = this.detectBullishEngulfing(prev, current);
        if (bullishEngulfing.detected) {
            patterns.push({
                name: 'Bullish Engulfing',
                type: 'bullish-engulfing',
                emoji: this.patternEmojis['bullish-engulfing'],
                bullish: true,
                index: index,
                price: current.close,
                confidence: bullishEngulfing.confidence,
                description: 'Bullish reversal - large green candle engulfs previous red candle'
            });
        }
        
        // Bearish Engulfing
        const bearishEngulfing = this.detectBearishEngulfing(prev, current);
        if (bearishEngulfing.detected) {
            patterns.push({
                name: 'Bearish Engulfing',
                type: 'bearish-engulfing',
                emoji: this.patternEmojis['bearish-engulfing'],
                bullish: false,
                index: index,
                price: current.close,
                confidence: bearishEngulfing.confidence,
                description: 'Bearish reversal - large red candle engulfs previous green candle'
            });
        }
        
        // Tweezer Top
        const tweezerTop = this.detectTweezerTop(prev, current);
        if (tweezerTop.detected) {
            patterns.push({
                name: 'Tweezer Top',
                type: 'tweezer-top',
                emoji: this.patternEmojis['tweezer-top'],
                bullish: false,
                index: index,
                price: current.close,
                confidence: tweezerTop.confidence,
                description: 'Bearish reversal - two candles with similar highs'
            });
        }
        
        // Tweezer Bottom
        const tweezerBottom = this.detectTweezerBottom(prev, current);
        if (tweezerBottom.detected) {
            patterns.push({
                name: 'Tweezer Bottom',
                type: 'tweezer-bottom',
                emoji: this.patternEmojis['tweezer-bottom'],
                bullish: true,
                index: index,
                price: current.close,
                confidence: tweezerBottom.confidence,
                description: 'Bullish reversal - two candles with similar lows'
            });
        }
        
        return patterns;
    },

    // Three candle pattern detection
    detectThreeCandlePatterns: function(first, second, third, index) {
        const patterns = [];
        
        // Morning Star
        const morningStar = this.detectMorningStar(first, second, third);
        if (morningStar.detected) {
            patterns.push({
                name: 'Morning Star',
                type: 'morning-star',
                emoji: this.patternEmojis['morning-star'],
                bullish: true,
                index: index,
                price: third.close,
                confidence: morningStar.confidence,
                description: 'Bullish reversal - three candle pattern signaling upward reversal'
            });
        }
        
        // Evening Star
        const eveningStar = this.detectEveningStar(first, second, third);
        if (eveningStar.detected) {
            patterns.push({
                name: 'Evening Star',
                type: 'evening-star',
                emoji: this.patternEmojis['evening-star'],
                bullish: false,
                index: index,
                price: third.close,
                confidence: eveningStar.confidence,
                description: 'Bearish reversal - three candle pattern signaling downward reversal'
            });
        }
        
        // Three White Soldiers
        const threeWhiteSoldiers = this.detectThreeWhiteSoldiers(first, second, third);
        if (threeWhiteSoldiers.detected) {
            patterns.push({
                name: 'Three White Soldiers',
                type: 'three-white-soldiers',
                emoji: this.patternEmojis['three-white-soldiers'],
                bullish: true,
                index: index,
                price: third.close,
                confidence: threeWhiteSoldiers.confidence,
                description: 'Bullish continuation - three consecutive green candles with higher closes'
            });
        }
        
        // Three Black Crows
        const threeBlackCrows = this.detectThreeBlackCrows(first, second, third);
        if (threeBlackCrows.detected) {
            patterns.push({
                name: 'Three Black Crows',
                type: 'three-black-crows',
                emoji: this.patternEmojis['three-black-crows'],
                bullish: false,
                index: index,
                price: third.close,
                confidence: threeBlackCrows.confidence,
                description: 'Bearish continuation - three consecutive red candles with lower closes'
            });
        }
        
        return patterns;
    },

    // Individual pattern detection methods

    // Hammer: Small body, long lower shadow, short upper shadow
    detectHammer: function(candle, props) {
        const conditions = [
            props.bodyPercent < 0.3,                    // Small body
            props.lowerPercent > 0.5,                   // Long lower shadow
            props.upperPercent < 0.2,                   // Short upper shadow
            props.lowerShadow > (props.body * 2)        // Lower shadow > 2x body
        ];
        
        const metConditions = conditions.filter(Boolean).length;
        
        if (metConditions >= 3) {
            let confidence = 0.75 + (metConditions - 3) * 0.05;
            
            // Boost confidence for stronger patterns
            if (props.lowerPercent > 0.6) confidence += 0.1;
            if (props.upperPercent < 0.1) confidence += 0.05;
            
            return { detected: true, confidence: Math.min(confidence, 0.95) };
        }
        
        return { detected: false, confidence: 0 };
    },

    // Dragonfly Doji: Doji with long lower shadow
    detectDragonflyDoji: function(candle, props) {
        const conditions = [
            props.isDoji,                               // Is doji
            props.lowerPercent > 0.5,                   // Long lower shadow
            props.upperPercent < 0.15                   // Very short upper shadow
        ];
        
        if (conditions.every(Boolean)) {
            let confidence = 0.8;
            if (props.lowerPercent > 0.7) confidence += 0.1;
            if (props.upperPercent < 0.05) confidence += 0.05;
            
            return { detected: true, confidence: Math.min(confidence, 0.95) };
        }
        
        return { detected: false, confidence: 0 };
    },

    // Gravestone Doji: Doji with long upper shadow
    detectGravestoneDoji: function(candle, props) {
        const conditions = [
            props.isDoji,                               // Is doji
            props.upperPercent > 0.5,                   // Long upper shadow
            props.lowerPercent < 0.15                   // Very short lower shadow
        ];
        
        if (conditions.every(Boolean)) {
            let confidence = 0.8;
            if (props.upperPercent > 0.7) confidence += 0.1;
            if (props.lowerPercent < 0.05) confidence += 0.05;
            
            return { detected: true, confidence: Math.min(confidence, 0.95) };
        }
        
        return { detected: false, confidence: 0 };
    },

    // Inverted Hammer: Small body, long upper shadow, short lower shadow
    detectInvertedHammer: function(candle, props) {
        const conditions = [
            props.bodyPercent < 0.3,                    // Small body
            props.upperPercent > 0.5,                   // Long upper shadow
            props.lowerPercent < 0.2,                   // Short lower shadow
            props.upperShadow > (props.body * 2)        // Upper shadow > 2x body
        ];
        
        const metConditions = conditions.filter(Boolean).length;
        
        if (metConditions >= 3) {
            let confidence = 0.75 + (metConditions - 3) * 0.05;
            
            if (props.upperPercent > 0.6) confidence += 0.1;
            if (props.lowerPercent < 0.1) confidence += 0.05;
            
            return { detected: true, confidence: Math.min(confidence, 0.95) };
        }
        
        return { detected: false, confidence: 0 };
    },

    // Bullish Engulfing: Green candle completely engulfs previous red candle
    detectBullishEngulfing: function(prev, current) {
        const prevProps = this.getCandleProperties(prev);
        const currProps = this.getCandleProperties(current);
        
        const conditions = [
            prevProps.isRed,                            // Previous candle is red
            currProps.isGreen,                          // Current candle is green
            current.open < prev.close,                  // Opens below previous close
            current.close > prev.open,                  // Closes above previous open
            currProps.body > prevProps.body * 1.1      // Larger body than previous
        ];
        
        if (conditions.every(Boolean)) {
            let confidence = 0.8;
            
            // Boost for stronger engulfing
            const engulfingRatio = currProps.body / prevProps.body;
            if (engulfingRatio > 1.5) confidence += 0.1;
            if (engulfingRatio > 2.0) confidence += 0.05;
            
            return { detected: true, confidence: Math.min(confidence, 0.95) };
        }
        
        return { detected: false, confidence: 0 };
    },

    // Bearish Engulfing: Red candle completely engulfs previous green candle
    detectBearishEngulfing: function(prev, current) {
        const prevProps = this.getCandleProperties(prev);
        const currProps = this.getCandleProperties(current);
        
        const conditions = [
            prevProps.isGreen,                          // Previous candle is green
            currProps.isRed,                            // Current candle is red
            current.open > prev.close,                  // Opens above previous close
            current.close < prev.open,                  // Closes below previous open
            currProps.body > prevProps.body * 1.1      // Larger body than previous
        ];
        
        if (conditions.every(Boolean)) {
            let confidence = 0.8;
            
            const engulfingRatio = currProps.body / prevProps.body;
            if (engulfingRatio > 1.5) confidence += 0.1;
            if (engulfingRatio > 2.0) confidence += 0.05;
            
            return { detected: true, confidence: Math.min(confidence, 0.95) };
        }
        
        return { detected: false, confidence: 0 };
    },

    // Tweezer Top: Two candles with similar highs
    detectTweezerTop: function(prev, current) {
        const prevProps = this.getCandleProperties(prev);
        const currProps = this.getCandleProperties(current);
        
        const highDiff = Math.abs(prev.high - current.high);
        const avgHigh = (prev.high + current.high) / 2;
        const tolerance = avgHigh * 0.002; // 0.2% tolerance
        
        const conditions = [
            highDiff <= tolerance,                      // Similar highs
            prevProps.isGreen && currProps.isRed,      // First green, second red
            prev.close > prev.open,                    // Confirm first is bullish
            current.close < current.open               // Confirm second is bearish
        ];
        
        if (conditions.every(Boolean)) {
            let confidence = 0.75;
            
            if (highDiff <= tolerance * 0.5) confidence += 0.1; // Very similar highs
            if (currProps.body > prevProps.body) confidence += 0.05; // Strong reversal
            
            return { detected: true, confidence: Math.min(confidence, 0.9) };
        }
        
        return { detected: false, confidence: 0 };
    },

    // Tweezer Bottom: Two candles with similar lows
    detectTweezerBottom: function(prev, current) {
        const prevProps = this.getCandleProperties(prev);
        const currProps = this.getCandleProperties(current);
        
        const lowDiff = Math.abs(prev.low - current.low);
        const avgLow = (prev.low + current.low) / 2;
        const tolerance = avgLow * 0.002; // 0.2% tolerance
        
        const conditions = [
            lowDiff <= tolerance,                       // Similar lows
            prevProps.isRed && currProps.isGreen,      // First red, second green
            prev.close < prev.open,                    // Confirm first is bearish
            current.close > current.open               // Confirm second is bullish
        ];
        
        if (conditions.every(Boolean)) {
            let confidence = 0.75;
            
            if (lowDiff <= tolerance * 0.5) confidence += 0.1;
            if (currProps.body > prevProps.body) confidence += 0.05;
            
            return { detected: true, confidence: Math.min(confidence, 0.9) };
        }
        
        return { detected: false, confidence: 0 };
    },

    // Morning Star: Bearish candle, small body/doji, bullish candle
    detectMorningStar: function(first, second, third) {
        const firstProps = this.getCandleProperties(first);
        const secondProps = this.getCandleProperties(second);
        const thirdProps = this.getCandleProperties(third);
        
        const conditions = [
            firstProps.isRed,                          // First candle is bearish
            secondProps.bodyPercent < 0.3,             // Second candle has small body
            thirdProps.isGreen,                        // Third candle is bullish
            second.high < first.close,                 // Gap down after first
            third.open > second.high,                  // Gap up before third
            third.close > (first.open + first.close) / 2  // Third closes above first's midpoint
        ];
        
        const metConditions = conditions.filter(Boolean).length;
        
        if (metConditions >= 4) {
            let confidence = 0.7 + (metConditions - 4) * 0.05;
            
            // Boost for stronger pattern
            if (secondProps.isDoji) confidence += 0.1;
            if (thirdProps.body > firstProps.body) confidence += 0.05;
            
            return { detected: true, confidence: Math.min(confidence, 0.95) };
        }
        
        return { detected: false, confidence: 0 };
    },

    // Evening Star: Bullish candle, small body/doji, bearish candle
    detectEveningStar: function(first, second, third) {
        const firstProps = this.getCandleProperties(first);
        const secondProps = this.getCandleProperties(second);
        const thirdProps = this.getCandleProperties(third);
        
        const conditions = [
            firstProps.isGreen,                        // First candle is bullish
            secondProps.bodyPercent < 0.3,             // Second candle has small body
            thirdProps.isRed,                          // Third candle is bearish
            second.low > first.close,                  // Gap up after first
            third.open < second.low,                   // Gap down before third
            third.close < (first.open + first.close) / 2  // Third closes below first's midpoint
        ];
        
        const metConditions = conditions.filter(Boolean).length;
        
        if (metConditions >= 4) {
            let confidence = 0.7 + (metConditions - 4) * 0.05;
            
            if (secondProps.isDoji) confidence += 0.1;
            if (thirdProps.body > firstProps.body) confidence += 0.05;
            
            return { detected: true, confidence: Math.min(confidence, 0.95) };
        }
        
        return { detected: false, confidence: 0 };
    },

    // Three White Soldiers: Three consecutive bullish candles
    detectThreeWhiteSoldiers: function(first, second, third) {
        const firstProps = this.getCandleProperties(first);
        const secondProps = this.getCandleProperties(second);
        const thirdProps = this.getCandleProperties(third);
        
        const conditions = [
            firstProps.isGreen && secondProps.isGreen && thirdProps.isGreen,  // All green
            second.close > first.close,                 // Each closes higher
            third.close > second.close,
            second.open > first.open,                   // Each opens higher
            third.open > second.open,
            firstProps.bodyPercent > 0.6,               // Good-sized bodies
            secondProps.bodyPercent > 0.6,
            thirdProps.bodyPercent > 0.6
        ];
        
        const metConditions = conditions.filter(Boolean).length;
        
        if (metConditions >= 6) {
            let confidence = 0.75 + (metConditions - 6) * 0.03;
            
            // Boost for consistent progression
            const progression1 = (second.close - first.close) / first.close;
            const progression2 = (third.close - second.close) / second.close;
            
            if (Math.abs(progression1 - progression2) < 0.01) confidence += 0.1;
            
            return { detected: true, confidence: Math.min(confidence, 0.9) };
        }
        
        return { detected: false, confidence: 0 };
    },

    // Three Black Crows: Three consecutive bearish candles
    detectThreeBlackCrows: function(first, second, third) {
        const firstProps = this.getCandleProperties(first);
        const secondProps = this.getCandleProperties(second);
        const thirdProps = this.getCandleProperties(third);
        
        const conditions = [
            firstProps.isRed && secondProps.isRed && thirdProps.isRed,  // All red
            second.close < first.close,                 // Each closes lower
            third.close < second.close,
            second.open < first.open,                   // Each opens lower
            third.open < second.open,
            firstProps.bodyPercent > 0.6,               // Good-sized bodies
            secondProps.bodyPercent > 0.6,
            thirdProps.bodyPercent > 0.6
        ];
        
        const metConditions = conditions.filter(Boolean).length;
        
        if (metConditions >= 6) {
            let confidence = 0.75 + (metConditions - 6) * 0.03;
            
            const progression1 = (first.close - second.close) / first.close;
            const progression2 = (second.close - third.close) / second.close;
            
            if (Math.abs(progression1 - progression2) < 0.01) confidence += 0.1;
            
            return { detected: true, confidence: Math.min(confidence, 0.9) };
        }
        
        return { detected: false, confidence: 0 };
    }
};