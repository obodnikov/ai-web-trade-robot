# 🤖 Trading Dry-Run Robot

A comprehensive stock market analysis tool that provides real-time trading signals using technical indicators. Built with vanilla JavaScript featuring clean architecture with separated HTML, CSS, and JavaScript files. Powered by Alpha Vantage historical data with Polygon.io fallback and TwelveData for detailed analysis.

![Trading Robot Demo](https://img.shields.io/badge/Status-Ready-brightgreen) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow) ![Primary API](https://img.shields.io/badge/Primary-Alpha%20Vantage-blue) ![Fallback API](https://img.shields.io/badge/Fallback-Polygon.io-orange) ![Detailed Analysis](https://img.shields.io/badge/Detailed-TwelveData-green) ![Architecture](https://img.shields.io/badge/Architecture-Clean%20Separation-purple) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **🆕 Clean Code Architecture**: Complete separation of HTML, CSS, and JavaScript files
- **📈 Dual Data Sources**: Alpha Vantage for main analysis + TwelveData for detailed charts
- **🎨 Interactive Charts**: Real-time price visualization with Chart.js and moving averages
- **🔍 Enhanced Detailed Analysis**: Click any stock card for comprehensive TwelveData analysis
- **📊 Multiple Timeframes**: Daily analysis (Alpha Vantage) + Daily, 30-minute, 15-minute & 5-minute intervals (TwelveData)
- **🕯️ Advanced Candlestick Pattern Recognition**: 15-minute & 5-minute patterns tabs with visual pattern identification and interactive pattern details
- **Smart Fallback System**: Alpha Vantage → Polygon.io → TwelveData → Realistic Demo Data
- **Improved Technical Analysis**: MACD, RSI, and Simple Moving Average indicators with real market data
- **Consistent Trading Signals**: More reliable Buy/Sell/Hold recommendations with confidence levels
- **Professional Data Quality**: Real historical market data for better indicator calculations
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Single-Run Analysis**: On-demand analysis without continuous monitoring

## 🏗️ What's New in v4.1 - Enhanced Pattern Recognition

### 🕯️ **NEW: Advanced Candlestick Pattern Analysis**
- **Visual Pattern Recognition**: 12 different candlestick patterns with emoji indicators
- **Dual Timeframes**: 15-minute and 5-minute pattern analysis tabs
- **Pattern Details Modal**: Click any pattern card for comprehensive pattern information with examples
- **Configurable Tooltips**: Toggle market data and pattern information independently
- **Pattern Confidence Levels**: High/medium confidence indicators with color coding
- **Real-time Detection**: Patterns detected from live TwelveData feeds (15-min & 5-min intervals)
- **Interactive Pattern Guide**: Reference cards that highlight when patterns are detected

### 📊 **Supported Candlestick Patterns**
**Bullish Reversal Patterns:**
- 🔨 **Hammer** - Long lower shadow indicating potential upward reversal
- 🐉 **Dragonfly Doji** - Doji with long lower shadow, bullish reversal signal
- 🤏 **Tweezer Bottom** - Two candles with similar lows, bullish reversal
- 🌟 **Morning Star** - Three-candle bullish reversal pattern
- 🐂 **Bullish Engulfing** - Large bullish candle engulfing previous bearish candle
- ⚪ **Three White Soldiers** - Three consecutive bullish candles

**Bearish Reversal Patterns:**
- 🪦 **Gravestone Doji** - Doji with long upper shadow, bearish reversal signal
- 🔨 **Inverted Hammer** - Long upper shadow indicating potential downward reversal
- 🤏 **Tweezer Top** - Two candles with similar highs, bearish reversal
- 🌙 **Evening Star** - Three-candle bearish reversal pattern
- 🐻 **Bearish Engulfing** - Large bearish candle engulfing previous bullish candle
- ⚫ **Three Black Crows** - Three consecutive bearish candles

### 🔧 **Enhanced User Experience**
- **🆕 Configurable Tooltips**: Toggle market data and pattern information tooltips independently
- **Clean Chart Display**: Tooltips disabled by default for focused pattern viewing
- **Dedicated Pattern Panel**: Right-side panel shows detected patterns with confidence levels
- **Pattern Summary Statistics**: Bullish vs bearish pattern counts with overall market bias
- **Interactive Pattern Cards**: Click reference patterns for detailed explanations
- **Responsive Pattern Layout**: Optimized for all screen sizes

## 🏗️ What's New in v4.2 - Modular JavaScript Architecture

### 🧩 **Modular JavaScript Structure**
- **Function Separation**: JavaScript code split into logical modules in `js/` folder
- **Clean Organization**: Each module handles specific functionality for better maintainability
- **Technical Analysis Module**: `common.js` contains all technical indicator calculations
- **UI Interaction Module**: `ui.js` handles all user interface interactions and modals
- **Pattern Analysis Module**: `patterns.js` manages candlestick pattern detection and charts
- **Data Fetching Modules**: `daily.js` and `intraday.js` handle API calls and data processing
- **ChatGPT Integration**: `chatgpt.js` for AI analysis features
- **Improved Maintainability**: Easier to find, modify, and extend specific functionality

### 📁 **JavaScript Module Breakdown**
```
js/
├── common.js                 # Technical analysis (SMA, EMA, MACD, RSI, signals)
├── ui.js                     # User interface (tabs, modals, pattern cards)
├── patterns.js               # Candlestick pattern analysis & charts
├── chatgpt.js                # ChatGPT integration
├── daily.js                  # Daily data fetching & chart creation
├── intraday.js               # Intraday data (30-min, 15-min, 5-min)
├── candlestick-patterns.js   # Pattern detection engine
└── debug.js                  # Development utilities
```

### 🔧 **Benefits of Modular Structure**
- **Better Code Organization**: Functions grouped by purpose
- **Easier Debugging**: Specific modules for targeted troubleshooting
- **Enhanced Collaboration**: Multiple developers can work on different modules
- **Simplified Maintenance**: Changes isolated to relevant modules
- **Improved Testing**: Individual modules can be tested independently
- **Faster Development**: Clear separation of concerns

## 🏗️ What's New in v4.0 - Clean Architecture

### 🧹 **Clean Code Architecture**
- **Separated Files**: HTML contains only structure, CSS only styling, JS only logic
- **External Stylesheets**: `styles.css`, `detailed-view-styles.css`, and `candlestick-styles.css`
- **External JavaScript**: `trading-robot.js`, `detailed-view.js`, and `candlestick-patterns.js`
- **No Inline Code**: Following modern web development best practices
- **Maintainable Structure**: Easy to modify and extend individual components

### 🔍 **Enhanced Detailed Analysis**
- **TwelveData Integration**: Both daily and 30-minute intervals use TwelveData API
- **Consistent Data Source**: No more mixing APIs in detailed view
- **Interactive Charts**: Chart.js integration with price lines and moving averages
- **Multiple Timeframes**:
  - Daily analysis using TwelveData daily data
  - 30-minute intraday analysis using TwelveData API
  - 15-minute intraday analysis using TwelveData API
  - 5-minute intraday analysis using TwelveData API
  - **🆕 15-minute candlestick patterns tab** with visual pattern recognition and modal details
  - **🆕 5-minute candlestick patterns tab** with high-frequency pattern detection
- **Enhanced UI**: Tab-based interface for easy timeframe switching
- **Visual Indicators**: Data source quality badges and real-time updates

### 📊 **Improved File Organization**
```
trading-robot/
├── index.html                    # Main page (clean HTML structure)
├── detailed-view.html            # Detailed analysis page (clean HTML)
├── styles.css                    # Main page styles
├── detailed-view-styles.css      # Detailed view styles
├── candlestick-styles.css        # 🆕 Candlestick pattern styles
├── trading-robot.js              # Main page functionality
├── favicon.svg                   # 🆕 Custom trading chart favicon
├── apiKey.js                     # Centralized API key management
├── README.md                     # This documentation
├── js/                           # 🆕 Modular JavaScript files
│   ├── common.js                 # 🆕 Common utilities & technical analysis
│   ├── ui.js                     # 🆕 User interface & interaction functions
│   ├── patterns.js               # 🆕 Candlestick pattern analysis
│   ├── chatgpt.js                # 🆕 ChatGPT integration
│   ├── daily.js                  # 🆕 Daily data fetching & analysis
│   ├── intraday.js               # 🆕 Intraday data & multiple timeframes
│   ├── candlestick-patterns.js   # Pattern detection engine
│   └── debug.js                  # Debug utilities for development
└── deployment/                   # Optional: Nginx configs
    └── nginx_deployment_guide.md
```

## 📊 Technical Indicators (Enhanced)

### MACD (Moving Average Convergence Divergence)
- **Improved Calculation**: Enhanced EMA algorithms using real historical data
- **Buy Signal**: MACD line crosses above signal line with positive histogram
- **Sell Signal**: MACD line crosses below signal line with negative histogram
- **Better Accuracy**: Real market data eliminates artificial crossovers
- **Visual Charts**: Interactive MACD visualization in detailed view

### RSI (Relative Strength Index)
- **Enhanced Precision**: Real price movements capture actual market volatility
- **Buy Signal**: RSI below 30 (oversold condition)
- **Sell Signal**: RSI above 70 (overbought condition)
- **More Reliable**: Genuine overbought/oversold conditions based on historical patterns
- **Color-Coded Display**: Visual RSI levels with condition indicators

### Simple Moving Averages
- **Consistent Trends**: Real data provides cleaner crossover signals
- **Buy Signal**: Price above SMA20 and SMA20 > SMA50
- **Sell Signal**: Price below SMA20 and SMA20 < SMA50
- **Trustworthy Signals**: Eliminates false signals from generated data
- **Chart Overlays**: SMA20 and SMA50 lines displayed on price charts

### 🆕 Candlestick Pattern Analysis
- **Pattern Recognition Engine**: Advanced algorithm detecting 12 common patterns
- **Confidence Scoring**: Each pattern rated with confidence percentage (75%+ threshold)
- **Visual Chart Integration**: Patterns highlighted directly on 15-minute charts
- **Bullish/Bearish Classification**: Clear indication of market sentiment
- **Historical Context**: Patterns detected using proper OHLC data validation

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for API access
- **Recommended**: Free API keys from Alpha Vantage, Polygon.io, and TwelveData

### Installation

1. **Clone or Download**
   ```bash
   git clone https://github.com/your-username/trading-robot.git
   cd trading-robot
   ```

2. **File Structure (Clean Architecture)**
   ```
   trading-robot/
   ├── index.html                    # Main page HTML (clean structure)
   ├── detailed-view.html            # Detailed analysis HTML (clean)
   ├── styles.css                    # Main page styles
   ├── detailed-view-styles.css      # Detailed view styles
   ├── candlestick-styles.css        # Candlestick pattern styles
   ├── trading-robot.js              # Main page JavaScript
   ├── favicon.svg                   # Custom trading favicon
   ├── apiKey.js                     # Centralized API key management
   ├── README.md                     # This file
   ├── js/                           # 🆕 Modular JavaScript files
   │   ├── common.js                 # Common utilities & technical analysis
   │   ├── ui.js                     # User interface & interaction functions
   │   ├── patterns.js               # Candlestick pattern analysis
   │   ├── chatgpt.js                # ChatGPT integration
   │   ├── daily.js                  # Daily data fetching & analysis
   │   ├── intraday.js               # Intraday data & multiple timeframes
   │   ├── candlestick-patterns.js   # Pattern detection engine
   │   └── debug.js                  # Debug utilities
   └── deployment/                   # Optional: Server configs
       └── nginx_deployment_guide.md
   ```

3. **Open in Browser**
   - Simply open `index.html` in your web browser
   - Or serve via local web server for development
   - All files must be in the same directory for proper linking

## 🔑 API Setup (Recommended for Best Results)

### 🆕 Centralized API Key Management
All API keys are now managed in the dedicated `apiKey.js` file for better organization and security:

1. **Open `apiKey.js`** in your preferred text editor
2. **Replace demo keys** with your actual API keys:
   ```javascript
   // Replace these placeholder values with your real API keys
   window.ALPHA_VANTAGE_API_KEY = 'YOUR_ALPHA_VANTAGE_KEY';
   window.POLYGON_API_KEY = 'YOUR_POLYGON_API_KEY';
   window.TWELVEDATA_API_KEY = 'YOUR_TWELVEDATA_KEY';
   ```

### 1. Alpha Vantage API Key (PRIMARY - Main Page Daily Data)
1. Visit [alphavantage.co](https://www.alphavantage.co/support/#api-key)
2. Sign up for free account (5 calls/minute, 500/day)
3. Get your API key from dashboard
4. Replace `'demo'` in `apiKey.js`:
   ```javascript
   window.ALPHA_VANTAGE_API_KEY = 'YOUR_ALPHA_VANTAGE_KEY';
   ```

### 2. TwelveData API Key (DETAILED VIEW - All Intervals + Patterns)
1. Visit [twelvedata.com](https://twelvedata.com/)
2. Sign up for free account (8 calls/minute, 800/day)
3. Get your API key from dashboard
4. Replace `'demo'` in `apiKey.js`:
   ```javascript
   window.TWELVEDATA_API_KEY = 'YOUR_TWELVEDATA_KEY';
   ```

### 3. Polygon.io API Key (FALLBACK - Main Page)
1. Visit [polygon.io](https://polygon.io/)
2. Sign up for free account (5 calls/minute)
3. Get your API key from dashboard
4. Replace `'DEMO'` in `apiKey.js`:
   ```javascript
   window.POLYGON_API_KEY = 'YOUR_POLYGON_API_KEY';
   ```

### 🔒 Security Benefits
- **Single Location**: All API keys in one secure file
- **Easy Management**: Update all keys from one place
- **Better Organization**: Clear separation of credentials from business logic
- **Version Control**: Add `apiKey.js` to `.gitignore` to prevent accidental commits

## 📱 Usage

### Basic Operation (Main Page)
1. **Enter Stock Tickers**: Add comma-separated symbols (e.g., `AAPL,GOOGL,MSFT`)
2. **Select Strategy**: Choose from MACD, RSI, SMA, or All Combined
3. **Start Analysis**: Click the analysis button for one-time execution
4. **Review Results**: View analysis cards with trading recommendations
5. **🆕 Click Cards**: Click any stock card for detailed TwelveData analysis

### Enhanced Detailed Analysis View
1. **Click Any Card**: Opens detailed view in new window/tab with TwelveData
2. **Daily Analysis**: View TwelveData daily data with interactive charts
3. **30-Minute Analysis**: Switch to intraday tab for TwelveData 30-min analysis
4. **15-Minute Analysis**: Switch to 15-min intraday tab for detailed short-term analysis
5. **5-Minute Analysis**: Switch to 5-min intraday tab for high-frequency trading analysis
6. **🆕 15-Minute Patterns**: View candlestick pattern analysis with visual recognition
7. **🆕 5-Minute Patterns**: High-frequency pattern detection for scalping strategies
8. **🆕 Pattern Details**: Click any pattern card for comprehensive explanations with examples
9. **Interactive Charts**: Hover over charts for detailed data points (except pattern charts)
10. **Technical Indicators**: Enhanced visual indicators with color coding
11. **Consistent Data**: All intervals use TwelveData for reliability

### 🕯️ NEW: Candlestick Pattern Analysis
1. **Switch to Patterns Tab**: Click "🕯️ 15-Min Patterns" or "🕯️ 5-Min Patterns" tab in detailed view
2. **View Chart**: Interactive candlestick chart with pattern markers (🔨, 🪦, etc.) and SMA lines
3. **🆕 Configure Tooltips**: Use checkboxes below chart to toggle market data and pattern tooltips
4. **Check Detected Patterns**: Right panel shows all detected patterns with confidence levels
5. **Pattern Summary**: View bullish vs bearish pattern counts and overall market bias
6. **Learn Patterns**: Click any reference pattern card for detailed explanations
7. **🆕 Dual Timeframes**: Compare 15-minute trends with 5-minute scalping opportunities
8. **🆕 Customizable Display**: Choose between clean charts or information-rich tooltips

### Sample Tickers (Optimized for All APIs)
- **Mega Cap**: AAPL, MSFT, NVDA, GOOGL, AMZN
- **Tech**: META, NFLX, CRM, ADBE, ORCL
- **Finance**: JPM, BAC, GS, V, MA
- **EV/Auto**: TSLA, RIVN, LCID, F, GM
- **Media**: WBD, DIS, SPOT, ROKU
- **Crypto/Fintech**: COIN, MSTR, SQ, PYPL

## 🏗️ Data Sources Priority (Updated v4.1)

### 1. **Main Page Analysis**
   - 🥇 **Primary**: Alpha Vantage (TIME_SERIES_DAILY) - Real historical market data
   - 🥈 **Fallback**: Polygon.io (Real-time quotes) - Professional backup
   - 🔵 **Demo**: Realistic simulation - Final fallback

### 2. **Detailed View Analysis** (TwelveData Only)
   - 🥇 **Daily Interval**: TwelveData Daily API (1day interval, 60 points)
   - ⚡ **30-Min Interval**: TwelveData Intraday API (30min interval, 78 points)
   - ⚡ **15-Min Interval**: TwelveData Intraday API (15min interval, 78 points)
   - ⚡ **5-Min Interval**: TwelveData Intraday API (5min interval, 78 points)
   - 🕯️ **🆕 15-Min Patterns**: Advanced candlestick pattern recognition with visual identification
   - 🕯️ **🆕 5-Min Patterns**: High-frequency pattern detection for scalping strategies
   - 🔵 **Demo Fallback**: Realistic simulation for all intervals
   - **Benefit**: Consistent data source ensures reliable comparisons

### 3. **🆕 Pattern Recognition Pipeline**
   - **Data Validation**: OHLC data validation before pattern detection
   - **Pattern Engine**: Advanced algorithm detecting 12 common patterns
   - **Confidence Filtering**: Only patterns above 75% confidence shown
   - **Visual Integration**: Patterns highlighted directly on charts with emoji markers
   - **Modal Details**: Comprehensive pattern explanations with markdown documentation

### 4. **Why This Architecture?**
   - **Main Page**: Alpha Vantage provides best historical data for overview analysis
   - **Detailed View**: TwelveData provides consistent multi-timeframe analysis
   - **Pattern Analysis**: 15-minute intervals for swing trading, 5-minute for scalping
   - **Multi-Timeframe Strategy**: Compare patterns across different time horizons
   - **No API Mixing**: Each view optimized for its specific use case
   - **Better UX**: Users get specialized tools for different analysis needs

## 🔧 Development

### Local Development
```bash
# Serve with Python (if needed)
python -m http.server 8000

# Or with Node.js
npx serve .

# Or simply open index.html in browser
# Note: All files must be in same directory
```

### Key Architecture Benefits (v4.1)
- **Clean Separation**: HTML structure, CSS presentation, JS behavior
- **Maintainable**: Easy to modify individual components
- **Scalable**: Simple to add new features or pages
- **Team-Friendly**: Multiple developers can work simultaneously
- **Performance**: External files enable browser caching
- **SEO-Optimized**: Clean HTML structure improves search rankings
- **🆕 Pattern Recognition**: Modular pattern detection engine

### File Responsibilities
- **`index.html`**: Main page structure (no styles or scripts)
- **`detailed-view.html`**: Detailed analysis structure (no styles or scripts)
- **`styles.css`**: Main page styling and responsive design
- **`detailed-view-styles.css`**: Detailed analysis styling and charts
- **`candlestick-styles.css`**: 🆕 Candlestick pattern styling and animations
- **`trading-robot.js`**: Main page logic, Alpha Vantage/Polygon.io, card creation
- **`apiKey.js`**: Centralized API key storage and management
- **`favicon.svg`**: 🆕 Custom trading chart favicon
- **`js/common.js`**: 🆕 Technical analysis functions (SMA, EMA, MACD, RSI, signals)
- **`js/ui.js`**: 🆕 User interface interactions (tab switching, modals, pattern cards)
- **`js/patterns.js`**: 🆕 Candlestick pattern analysis and chart creation
- **`js/chatgpt.js`**: 🆕 ChatGPT integration and AI analysis
- **`js/daily.js`**: 🆕 Daily data fetching and chart creation
- **`js/intraday.js`**: 🆕 Intraday data (30-min, 15-min, 5-min intervals)
- **`js/candlestick-patterns.js`**: Pattern detection algorithms and validation
- **`js/debug.js`**: Development debugging utilities

### Cache Issues During Development
If you modify files and don't see changes:

- **Hard Refresh**: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- **Developer Tools**: F12 → Network tab → "Disable cache"
- **Incognito Mode**: `Ctrl+Shift+N` for fresh session

### Customizing Features
Edit the appropriate files:
- **Styling**: Modify `styles.css`, `detailed-view-styles.css`, or `candlestick-styles.css`
- **Main Logic**: Edit functions in `trading-robot.js`
- **Technical Analysis**: Edit functions in `js/common.js`
- **User Interface**: Edit functions in `js/ui.js`
- **Pattern Analysis**: Edit functions in `js/patterns.js`
- **Data Fetching**: Edit functions in `js/daily.js` or `js/intraday.js`
- **ChatGPT Integration**: Edit functions in `js/chatgpt.js`
- **🆕 Pattern Detection**: Modify algorithms in `js/candlestick-patterns.js`
- **Structure**: Modify HTML files (maintain external references)

### 🆕 Pattern Development
To add new candlestick patterns:

1. **Add Pattern Detection**: Extend `js/candlestick-patterns.js` with new pattern logic
2. **Update Pattern Analysis**: Modify `js/patterns.js` if needed for UI integration
3. **Update Pattern Cards**: Add reference card in `detailed-view.html`
4. **Style Pattern**: Add styling in `candlestick-styles.css`
5. **Create Documentation**: Add pattern markdown file in `Docs/patterns/` (if implemented)
6. **Test Pattern**: Use `js/debug.js` utilities for testing pattern detection

## 🌐 Deployment

### Simple Hosting
- Upload all files to any web server
- Ensure all files are in the same directory
- Configure HTTPS for API access
- **Required Files**: `*.html`, `*.css`, `*.js` (including `apiKey.js`)

### Professional Deployment
```bash
# Copy files to web directory
sudo cp *.html *.css *.js /var/www/trading-robot/html/
sudo cp -r js /var/www/trading-robot/html/

# Copy Docs directory (if pattern details implemented)
sudo cp -r Docs /var/www/trading-robot/html/

# IMPORTANT: Secure your API keys file
sudo chmod 600 /var/www/trading-robot/html/apiKey.js

# Configure nginx (see configuration below)
sudo nano /etc/nginx/sites-available/trading-robot
```

### Nginx Configuration
For proper functionality, especially for the pattern detail popups, your nginx configuration should include markdown file serving:

```nginx
server {
    listen 80;  # or your preferred port (e.g., 10000)

    server_name your-domain.com;  # Replace with your domain or server IP

    root /var/www/trading-robot/html;
    index index.html index.htm;

    # Logging
    access_log /var/www/trading-robot/logs/access.log;
    error_log /var/www/trading-robot/logs/error.log;

    # Main location
    location / {
        try_files $uri $uri/ =404;

        # Add security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }

    # IMPORTANT: Serve markdown files for pattern details
    location ~ \.md$ {
        add_header Content-Type "text/markdown; charset=utf-8" always;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;

        # Add CORS headers for fetch requests
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type" always;

        try_files $uri =404;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        text/markdown
        application/javascript
        application/xml+rss
        application/json;

    # Security: Hide nginx version
    server_tokens off;

    # Prevent access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

**Enable the site:**
```bash
# Create directories
sudo mkdir -p /var/www/trading-robot/logs

# Enable site
sudo ln -s /etc/nginx/sites-available/trading-robot /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

**Key nginx features for this application:**
- ✅ **Markdown serving**: Essential for pattern detail popups (if implemented)
- ✅ **CORS headers**: Allows fetch requests for markdown files
- ✅ **Security headers**: Protection against common attacks
- ✅ **Gzip compression**: Better performance for all text files
- ✅ **Static file caching**: Optimized loading for assets

### Docker Deployment
```dockerfile
FROM nginx:alpine
COPY *.html *.css *.js /usr/share/nginx/html/
COPY js/ /usr/share/nginx/html/js/
# Secure API keys file
RUN chmod 600 /usr/share/nginx/html/apiKey.js
EXPOSE 80
```

### API Considerations
- **CORS**: All APIs support client-side requests
- **Rate Limits**: Smart fallback system handles API limits gracefully
- **Error Handling**: Comprehensive error handling with automatic fallbacks
- **Caching**: Browser caching for improved performance

## 📊 Output Format (Enhanced v4.1)

### Main Page Analysis (Alpha Vantage Primary)
Each stock card provides:

#### Stock Information
- **Data Source Quality**: 🥇 PRIMARY / 🥈 FALLBACK / 🔵 DEMO badges
- Current price with accurate daily change
- Complete OHLC data with proper previous close
- Volume and timestamp information
- **Historical Data Points**: Count and quality indicators
- **Clickable Indicator**: Hover effects showing detailed view availability

#### Technical Indicators (Alpha Vantage Data)
- **RSI value**: Color-coded with enhanced accuracy
- **MACD line and signal**: More reliable crossover detection
- **SMA20 and SMA50**: Cleaner trend identification
- **Price position**: Relative to moving averages

#### Trading Recommendation
- **Action**: BUY, SELL, or HOLD with improved confidence
- **Confidence**: Percentage based on enhanced signal strength
- **Target Price**: More accurate entry/exit points
- **Reasoning**: Clear explanation of signal generation
- **Data Quality Note**: Source reliability indicator

### 🆕 Enhanced Detailed Analysis View (TwelveData)
Comprehensive analysis includes:

#### Interactive Charts (Chart.js)
- **Price Line Chart**: Historical price movement with zoom/pan
- **Moving Averages**: SMA20 and SMA50 overlay lines
- **Responsive Design**: Adapts to screen size
- **Hover Details**: Real-time data point information (Daily, 30-min, 15-min tabs only)

#### Multiple TwelveData Timeframes
- **Daily Tab**: TwelveData daily analysis (up to 60 days)
- **30-Minute Tab**: TwelveData intraday analysis (78 intervals)
- **15-Minute Tab**: TwelveData intraday analysis (78 intervals)
- **5-Minute Tab**: TwelveData intraday analysis (78 intervals)
- **🆕 15-Minute Patterns Tab**: Advanced candlestick pattern recognition
- **🆕 5-Minute Patterns Tab**: High-frequency pattern detection for scalping
- **Tab Switching**: Seamless transition between timeframes
- **Consistent Source**: All tabs use TwelveData for reliability

#### Enhanced Indicators Grid
- **Visual Layout**: Grid display with color-coded values
- **Real-time Updates**: Live calculation display
- **Condition Indicators**: Overbought/oversold/neutral states
- **Range Information**: High/low and volume data

#### 🆕 Advanced Candlestick Pattern Recognition
The new "15-Min Patterns" and "5-Min Patterns" tabs provide comprehensive pattern analysis:

**Visual Chart Features:**
- **🆕 Configurable Tooltips**: Two independent checkboxes control market data and pattern information display
- **Pattern Markers**: Emoji indicators (🔨, 🪦, 🐉, etc.) directly on chart
- **Confidence Glow**: High-confidence patterns (>85%) have subtle glow effects
- **Last 20 Candles**: Optimized view showing recent price action
- **User Control**: Choose between clean visualization or detailed hover information

**Pattern Detection Panel:**
- **Real-time Detection**: Patterns detected from live 15-minute and 5-minute data
- **Confidence Scoring**: Only patterns above 75% confidence threshold shown
- **Pattern Categories**: Clear bullish/bearish classification
- **Time & Price Location**: Exact candle index and price level for each pattern
- **Dual Timeframes**: Compare swing trading patterns (15-min) with scalping opportunities (5-min)

**Pattern Summary Statistics:**
- **Bullish Count**: Number of detected bullish reversal patterns
- **Bearish Count**: Number of detected bearish reversal patterns
- **Average Confidence**: Overall confidence level of detected patterns
- **Market Bias Signal**: Overall bullish/bearish/neutral market sentiment

**Interactive Pattern Reference:**
- **12 Pattern Types**: Comprehensive coverage of common candlestick patterns
- **Visual Highlights**: Detected patterns glow on reference cards
- **Pattern Details**: Click any pattern card for detailed explanations (if modal implemented)
- **Educational Content**: Learn pattern recognition and trading implications

**Supported Pattern Types:**
- **Bullish**: Hammer, Dragonfly Doji, Tweezer Bottom, Morning Star, Bullish Engulfing, Three White Soldiers
- **Bearish**: Gravestone Doji, Inverted Hammer, Tweezer Top, Evening Star, Bearish Engulfing, Three Black Crows

## ⚠️ Disclaimers

- **Educational Purpose**: This tool is for learning and demonstration only
- **Not Financial Advice**: Do not use for actual trading decisions
- **Data Sources**: Results may vary based on data source quality
- **Risk Warning**: Trading involves substantial risk of loss
- **No Guarantees**: Past performance doesn't predict future results
- **API Dependencies**: Functionality depends on third-party API availability
- **Pattern Recognition**: Candlestick patterns are technical indicators, not guarantees of future price movement

## 🛠️ Technical Details

### Dependencies
- **Runtime**: Pure vanilla JavaScript (ES6+)
- **Charts**: Chart.js 3.9.1 (CDN)
- **Pattern Recognition**: Custom JavaScript algorithms
- **Markdown Parsing**: Marked.js (for pattern details, if implemented)
- **APIs**: Alpha Vantage, TwelveData, Polygon.io
- **Browser**: Modern ES6+ support required
- **Architecture**: Clean separation of HTML/CSS/JS

### Performance (v4.1)
- **Lightweight**: ~120KB total size (HTML + CSS + JS)
- **Enhanced**: Better accuracy with real market data
- **Fast**: Single-run analysis completes in seconds
- **Responsive**: Works on all screen sizes with quality indicators
- **Interactive**: Real-time charts with smooth animations
- **Pattern Engine**: Efficient OHLC validation and pattern detection
- **Cacheable**: External files improve loading performance

### Data Quality Improvements
- **Consistent Analysis**: TwelveData provides unified detailed analysis
- **Better Indicator Accuracy**: RSI, MACD, SMA based on real market data
- **Reliable Calculations**: Proper historical data eliminates false signals
- **Enhanced User Feedback**: Clear indication of data source quality
- **Visual Charts**: Interactive price movement visualization
- **🆕 Pattern Validation**: Rigorous OHLC data validation for accurate pattern detection

### Browser Support
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ Mobile browsers (responsive design)

### 🆕 Pattern Recognition Algorithm
- **OHLC Validation**: Ensures data integrity before pattern detection
- **Multi-Pattern Detection**: Single, dual, and triple candle patterns
- **Confidence Scoring**: Mathematical confidence calculation based on pattern characteristics
- **False Positive Reduction**: Minimum thresholds to avoid noise
- **Performance Optimized**: Efficient scanning of 15-minute intervals

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/enhanced-patterns`)
3. **Commit** changes (`git commit -m 'Add enhanced pattern recognition'`)
4. **Push** to branch (`git push origin feature/enhanced-patterns`)
5. **Open** Pull Request

### Areas for Contribution
- Additional candlestick patterns (Cup & Handle, Head & Shoulders)
- Advanced chart types (real candlestick charts, volume analysis)
- Portfolio tracking and comparison
- Mobile app development
- Machine learning pattern enhancement
- Additional API integrations
- Performance optimizations
- UI/UX improvements
- Pattern documentation and educational content

## 📝 Changelog

### v4.2.0 (Current - Modular JavaScript Architecture)
- 🧩 **Modular JavaScript Structure**: Functions split into logical modules in `js/` folder
- 📁 **Function Organization**: Technical analysis, UI, patterns, data fetching in separate files
- 🔧 **Enhanced Maintainability**: Easier to find, modify, and extend specific functionality
- 🚀 **Better Code Organization**: Functions grouped by purpose and responsibility
- 👥 **Team-Friendly Development**: Multiple developers can work on different modules
- 🎯 **Improved Debugging**: Specific modules for targeted troubleshooting
- 📦 **Module Breakdown**: `common.js`, `ui.js`, `patterns.js`, `chatgpt.js`, `daily.js`, `intraday.js`
- 🔍 **Clear Separation**: Technical analysis, UI interactions, pattern detection, and data fetching isolated

### v4.1.0 (Advanced Pattern Recognition + 5-Minute Intervals)
- 🕯️ **Advanced candlestick pattern recognition**: 12 patterns with visual detection on dual timeframes
- ⚡ **NEW: 5-minute intervals**: Both standard analysis and pattern recognition for scalping strategies
- 🎯 **Pattern confidence scoring**: High/medium/low confidence indicators
- 🔧 **🆕 Configurable tooltips**: Independent controls for market data and pattern information
- 🔍 **Interactive pattern details**: Modal popups with comprehensive explanations (if implemented)
- 📊 **Pattern summary statistics**: Bullish vs bearish counts with market bias
- 🎨 **Flexible chart display**: User-controlled tooltip visibility for customized viewing experience
- ⚡ **High-frequency trading support**: 5-minute intervals for day trading and scalping analysis
- 🖼️ **Custom favicon**: Trading chart themed favicon.svg
- 🐛 **Debug utilities**: Enhanced debugging tools for development
- 📱 **Mobile optimization**: Improved responsive design for pattern analysis

### v4.0.0 (Clean Architecture + Basic Pattern Recognition)
- 🧹 **Complete code separation**: HTML, CSS, and JavaScript in separate files
- 🆕 **TwelveData detailed view**: Daily, 30-minute, and 15-minute intervals
- 🕯️ **Basic candlestick pattern recognition**: Initial pattern identification in 15-minute timeframe
- 🔑 **Centralized API key management**: Single `apiKey.js` file for all API credentials
- 🎨 **Enhanced styling**: Dedicated CSS files for each page
- 🔧 **Improved maintainability**: Clean, modular code structure
- ✅ **Better performance**: External file caching and optimization
- 📱 **Mobile optimization**: Responsive design improvements
- 🔍 **Consistent detailed analysis**: Single API source for multiple timeframes

### v3.0.0 (Enhanced Detailed View)
- 🆕 **Detailed analysis view** with interactive charts
- 🆕 **TwelveData API integration** for 30-minute intervals
- 🆕 **Chart.js integration** for price visualization
- 🆕 **Tab-based interface** for multiple timeframes
- ✅ **Enhanced error handling** and user feedback
- ✅ **Improved responsive design** for all devices

### v2.0.0 (Alpha Vantage Primary)
- 🥇 **Alpha Vantage as primary** data source
- ✅ **Enhanced EMA calculations** for better MACD accuracy
- ✅ **Improved technical indicators** with real historical data
- ✅ **Smart fallback system** (Alpha Vantage → Polygon.io → Demo)

### v1.0.0 (Original - Polygon.io Primary)
- ✅ Initial release with Polygon.io integration
- ✅ MACD, RSI, SMA technical indicators
- ✅ Fallback data system
- ✅ Single-run analysis mode
- ✅ Responsive design

### Planned Features (v5.0)
- 📈 **True candlestick charts** with OHLC visualization and volume indicators
- 🔍 **Advanced pattern detection** (Cup & Handle, Head & Shoulders, Flags, Pennants)
- 📊 **Portfolio tracking** and performance comparison
- 🔔 **Alert system** for signal notifications and pattern detection
- 📱 **Progressive Web App** capabilities with offline functionality
- 🤖 **Machine learning** enhanced pattern recognition and signal accuracy
- 📈 **Volume analysis** integration with pattern confirmation
- 🎨 **Customizable themes** and layouts with dark mode
- 📊 **Export functionality** for analysis results and pattern reports
- 🔄 **Real-time updates** with WebSocket integration
- 🌍 **Multi-market support** (Forex, Crypto, Commodities)
- 📚 **Pattern education** with interactive tutorials

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/trading-robot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/trading-robot/discussions)
- **Documentation**: [Wiki](https://github.com/your-username/trading-robot/wiki)
- **API Keys**: Check respective provider documentation

### Getting Help
1. **Check Documentation**: Review this README and deployment guide
2. **Console Logs**: Open browser developer tools for detailed logging
3. **API Status**: Verify your API keys in `apiKey.js` are valid and have remaining calls
4. **Network Issues**: Ensure stable internet connection for API calls
5. **File Structure**: Ensure all files are in the same directory (including `apiKey.js`)
6. **🆕 Pattern Issues**: Use `debug.js` utilities for pattern detection troubleshooting

### 🆕 Pattern Recognition Troubleshooting
If patterns aren't being detected:

1. **Check Browser Console**: Look for pattern detection logs
2. **Verify Data**: Ensure TwelveData API is returning valid OHLC data
3. **Test Pattern Engine**: Use `debugCandlestick.testPatternDetection()` in console
4. **Force Reload**: Use `debugCandlestick.forceReloadCandlestick()` to refresh data
5. **Inject Test Patterns**: Use `debugCandlestick.injectTestPatterns()` for testing UI
6. **Check Confidence**: Lower threshold patterns may not meet 75% confidence requirement

### Debug Commands (Available in Browser Console)
```javascript
// Check current data state and pattern detection
debugCandlestick.checkDataState();

// Test pattern detection with current data
debugCandlestick.testPatternDetection();

// Force reload candlestick data and patterns
debugCandlestick.forceReloadCandlestick('AAPL');

// Inject test patterns for UI testing
debugCandlestick.injectTestPatterns();

// Test with guaranteed pattern data
debugCandlestick.testWithGuaranteedPatterns();

// Clear all cached data
debugCandlestick.clearAllData();
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Alpha Vantage**: For providing excellent historical financial data API
- **TwelveData**: For reliable multi-timeframe market data and pattern analysis
- **Polygon.io**: For real-time market data as backup
- **Chart.js**: For beautiful and responsive chart visualizations
- **Technical Analysis Community**: For candlestick pattern recognition algorithms and trading strategies
- **Open Source Community**: For inspiration and collaborative development
- **Marked.js**: For markdown parsing in pattern detail modals
- **Users and Contributors**: For feedback and continuous improvement

---

**⚡ Ready to analyze stocks with advanced pattern recognition?** 

Open `index.html` and start trading analysis with the new enhanced pattern detection system!

**🔧 Need help?** Check the console logs for detailed data source information and debugging, or use the debug utilities for pattern troubleshooting.

**📈 Professional Trading Analysis!** Now with advanced candlestick pattern recognition, clean architecture, and comprehensive pattern education.

**🔍 NEW in v4.1:** Advanced pattern detection with 12 candlestick patterns, confidence scoring, interactive pattern details, and enhanced visual recognition system!

---

## 🆕 What Makes v4.1 Special

### 🎯 **Advanced Pattern Recognition**
- **12 Professional Patterns**: Comprehensive coverage of the most reliable candlestick patterns
- **Confidence Scoring**: Mathematical confidence calculation ensures only high-quality patterns are shown
- **Visual Integration**: Seamless pattern highlighting directly on price charts
- **Educational Value**: Learn pattern recognition through interactive reference cards
- **Real Market Data**: Patterns detected from live TwelveData 15-minute intervals

### 📊 **Enhanced User Experience**
- **🆕 Configurable Tooltips**: Two independent toggles for market data and pattern information
- **Pattern Summary**: Quick overview of market sentiment through pattern statistics
- **Interactive Learning**: Click pattern cards for detailed explanations and examples
- **Responsive Design**: Optimized pattern display across all device sizes
- **Performance Optimized**: Efficient pattern detection algorithms
- **User Control**: Customize information display based on analysis preferences

### 🔧 **Developer Experience**
- **Modular Architecture**: Separate pattern detection engine for easy extension
- **Debug Utilities**: Comprehensive debugging tools for pattern development
- **Clean Code**: Well-documented pattern algorithms with clear validation
- **Easy Extension**: Simple framework for adding new pattern types
- **Testing Tools**: Built-in pattern testing and validation utilities

### 🚀 **Professional Features**
- **Multi-Timeframe Analysis**: Daily, 30-minute, 15-minute, and pattern-specific views
- **Real-Time Updates**: Live pattern detection from TwelveData feeds
- **Data Quality Assurance**: Rigorous OHLC validation before pattern analysis
- **Confidence Filtering**: Customizable thresholds to reduce false positives
- **Market Bias Detection**: Overall sentiment analysis from pattern combinations

The Trading Robot has evolved from a simple analysis tool to a comprehensive pattern recognition platform, offering both novice and experienced traders the tools they need for effective technical analysis with clean, maintainable code architecture.