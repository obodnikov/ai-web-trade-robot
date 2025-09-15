# 🤖 Trading Dry-Run Robot

A comprehensive stock market analysis tool that provides real-time trading signals using technical indicators. Built with vanilla JavaScript and powered by Alpha Vantage historical data with Polygon.io fallback support and TwelveData intraday analysis.

![Trading Robot Demo](https://img.shields.io/badge/Status-Ready-brightgreen) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow) ![API](https://img.shields.io/badge/Primary-Alpha%20Vantage-blue) ![API](https://img.shields.io/badge/Fallback-Polygon.io-orange) ![API](https://img.shields.io/badge/Intraday-TwelveData-green) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **🆕 Detailed Analysis View**: Click any stock card for comprehensive analysis with interactive charts
- **📈 Multiple Timeframes**: Daily (Alpha Vantage) + 30-minute intervals (TwelveData API)  
- **🎨 Interactive Charts**: Real-time price visualization with Chart.js and moving averages
- **Enhanced Historical Data**: Alpha Vantage TIME_SERIES_DAILY for accurate technical analysis
- **Smart Fallback System**: Alpha Vantage → Polygon.io → TwelveData → Realistic Demo Data
- **Improved Technical Analysis**: MACD, RSI, and Simple Moving Average indicators with real market data
- **Consistent Trading Signals**: More reliable Buy/Sell/Hold recommendations with confidence levels
- **Professional Data Quality**: Real historical market data for better indicator calculations
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Single-Run Analysis**: On-demand analysis without continuous monitoring
- **Clean Code Architecture**: Separated HTML/CSS and JavaScript files

## 🆕 What's New in v3.0

### 🔍 **NEW: Detailed Analysis View**
- **Clickable Stock Cards**: All main page cards open detailed analysis in new window
- **Interactive Charts**: Chart.js integration with price lines and moving averages
- **Dual Timeframes**: 
  - Daily analysis using Alpha Vantage historical data
  - 30-minute intraday analysis using TwelveData API
- **Enhanced UI**: Tab-based interface for easy timeframe switching
- **Visual Indicators**: Data source quality badges and real-time updates

### 🏗️ **Code Architecture Improvements**
- **Clean Separation**: HTML files contain only structure and CSS
- **External JavaScript**: All functionality moved to separate `.js` files
- **Modular Design**: `trading-robot.js` for main page, `detailed-view.js` for analysis
- **No Inline Code**: Following repository best practices

### 🎯 **Enhanced Data Sources**
- **Primary**: Alpha Vantage TIME_SERIES_DAILY (most reliable historical data)
- **Secondary**: Polygon.io for real-time fallback
- **Intraday**: TwelveData API for 30-minute intervals
- **Demo**: Realistic simulation with actual market-based pricing

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

2. **File Structure**
   ```
   trading-robot/
   ├── index.html              # Main page (clean HTML/CSS)
   ├── trading-robot.js         # Main page JavaScript
   ├── detailed-view.html       # Detailed analysis page (clean HTML/CSS)
   ├── detailed-view.js         # Detailed view JavaScript
   ├── README.md               # This file
   └── deployment/             # Optional: Nginx configs
       └── nginx_deployment_guide.md
   ```

3. **Open in Browser**
   - Simply open `index.html` in your web browser
   - Or serve via local web server for development

## 🔑 API Setup (Recommended for Best Results)

### 1. Alpha Vantage API Key (PRIMARY - Daily Data)
1. Visit [alphavantage.co](https://www.alphavantage.co/support/#api-key)
2. Sign up for free account (5 calls/minute, 500/day)
3. Get your API key from dashboard
4. Replace `'demo'` in `trading-robot.js` and `detailed-view.js`:
   ```javascript
   const apiKey = 'YOUR_ALPHA_VANTAGE_KEY'; // Line ~280 in both files
   ```

### 2. TwelveData API Key (INTRADAY - 30min intervals)
1. Visit [twelvedata.com](https://twelvedata.com/)
2. Sign up for free account (8 calls/minute, 800/day)
3. Get your API key from dashboard
4. Replace `'demo'` in `detailed-view.js`:
   ```javascript
   const apiKey = 'YOUR_TWELVEDATA_KEY'; // Line ~350
   ```

### 3. Polygon.io API Key (FALLBACK)
1. Visit [polygon.io](https://polygon.io/)
2. Sign up for free account (5 calls/minute)
3. Get your API key from dashboard
4. Replace `'DEMO'` in `trading-robot.js`:
   ```javascript
   const apiKey = 'YOUR_POLYGON_API_KEY'; // Line ~400
   ```

## 📱 Usage

### Basic Operation (Main Page)
1. **Enter Stock Tickers**: Add comma-separated symbols (e.g., `AAPL,GOOGL,MSFT`)
2. **Select Strategy**: Choose from MACD, RSI, SMA, or All Combined
3. **Start Analysis**: Click the analysis button for one-time execution
4. **Review Results**: View analysis cards with trading recommendations
5. **🆕 Click Cards**: Click any stock card for detailed analysis

### Detailed Analysis View
1. **Click Any Card**: Opens detailed view in new window/tab
2. **Daily Analysis**: View Alpha Vantage historical data with interactive charts
3. **30-Minute Analysis**: Switch to intraday tab for TwelveData analysis
4. **Interactive Charts**: Hover over charts for detailed data points
5. **Technical Indicators**: Enhanced visual indicators with color coding

### Sample Tickers (Optimized for All APIs)
- **Mega Cap**: AAPL, MSFT, NVDA, GOOGL, AMZN
- **Tech**: META, NFLX, CRM, ADBE, ORCL
- **Finance**: JPM, BAC, GS, V, MA
- **EV/Auto**: TSLA, RIVN, LCID, F, GM
- **Media**: WBD, DIS, SPOT, ROKU
- **Crypto/Fintech**: COIN, MSTR, SQ, PYPL

## 🏗️ Data Sources Priority (Updated v3.0)

### 1. **Primary: Alpha Vantage** (TIME_SERIES_DAILY)
   - 🥇 **Real historical market data** (up to 20+ years)
   - ✅ **Complete OHLC data** with accurate volume
   - ✅ **Proper previous close** calculations
   - ✅ **Enhanced technical indicators** with real price movements
   - ⚡ **5 calls/minute, 500/day** free tier
   - 🎯 **Best for technical analysis** accuracy

### 2. **Intraday: TwelveData** (30-minute intervals)
   - 🆕 **Professional intraday data** for short-term analysis
   - ✅ **30-minute OHLC intervals** (78 data points)
   - ✅ **Real-time intraday patterns**
   - ⚡ **8 calls/minute, 800/day** free tier
   - 📊 **Perfect for day trading** signals

### 3. **Fallback: Polygon.io** (Real-time Quotes)
   - 🥈 **Professional backup** when Alpha Vantage hits limits
   - ✅ **Real-time OHLC data** 
   - ✅ **Volume data**
   - ⚡ **5 calls/minute** free tier
   - 🔄 **Automatic fallback** with mixed real/generated historical data

### 4. **Demo: Realistic Simulation**
   - 🔵 **Final fallback** when all APIs are unavailable
   - ✅ **Based on actual market prices**
   - ✅ **Realistic volatility patterns**
   - ✅ **No API limits**
   - 📚 **Perfect for learning** and demonstration

## 🔧 Development

### Local Development
```bash
# Serve with Python (if needed)
python -m http.server 8000

# Or with Node.js
npx serve .

# Or simply open index.html in browser
```

### Key Architecture Improvements (v3.0)
- **Clean HTML Files**: No embedded JavaScript, only structure and CSS
- **Modular JavaScript**: Separate files for different functionality
- **Chart Integration**: Chart.js for interactive price visualization
- **API Separation**: Different APIs for different use cases
- **Enhanced Error Handling**: Graceful fallbacks between data sources
- **Responsive Design**: Mobile-first approach with adaptive layouts

### File Responsibilities
- **`index.html`**: Main page structure and styling
- **`trading-robot.js`**: Main page logic, data fetching, card creation
- **`detailed-view.html`**: Detailed analysis page structure and styling  
- **`detailed-view.js`**: Chart creation, intraday analysis, tab switching

### Cache Issues During Development
If you modify JavaScript files and don't see changes:

- **Hard Refresh**: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- **Developer Tools**: F12 → Network tab → "Disable cache"
- **Incognito Mode**: `Ctrl+Shift+N` for fresh session

### Customizing Strategies
Edit JavaScript functions in `trading-robot.js` and `detailed-view.js`:
- `calculateMACD()`: Enhanced MACD with proper EMA series
- `calculateRSI()`: Improved with real historical data
- `generateTradingSignal()`: More accurate signal generation
- `createChart()`: Chart.js configuration and styling

## 🌐 Deployment

### Simple Hosting
- Upload all files (`*.html`, `*.js`) to any web server
- Ensure all files are in the same directory
- Configure HTTPS for API access

### Nginx Deployment (Production)
Use the included Nginx configuration for production:
```bash
# Copy files to web directory
sudo cp *.html *.js /var/www/trading-robot/html/

# Configure nginx (see deployment guide)
sudo cp deployment/nginx.conf /etc/nginx/sites-available/trading-robot
```

### Docker Deployment
```bash
# Build and run with Docker
docker build -t trading-robot .
docker run -p 80:80 trading-robot
```

### API Considerations
- **CORS**: All APIs support client-side requests
- **Rate Limits**: Smart fallback system handles API limits gracefully
- **Error Handling**: Comprehensive error handling with automatic fallbacks
- **Caching**: Browser caching for improved performance

## 📊 Output Format (Enhanced v3.0)

### Main Page Analysis
Each stock card provides:

#### Stock Information
- **Data Source Quality**: 🥇 PRIMARY / 🥈 FALLBACK / 🔵 DEMO badges
- Current price with accurate daily change
- Complete OHLC data with proper previous close
- Volume and timestamp information
- **Historical Data Points**: Count and quality indicators
- **Clickable Indicator**: Hover effects showing detailed view availability

#### Technical Indicators (Improved)
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

### 🆕 Detailed Analysis View
Comprehensive analysis includes:

#### Interactive Charts
- **Price Line Chart**: Historical price movement with zoom/pan
- **Moving Averages**: SMA20 and SMA50 overlay lines
- **Responsive Design**: Adapts to screen size
- **Hover Details**: Real-time data point information

#### Dual Timeframes
- **Daily Tab**: Alpha Vantage historical analysis (up to 60 days)
- **30-Minute Tab**: TwelveData intraday analysis (78 intervals)
- **Tab Switching**: Seamless transition between timeframes
- **Independent Analysis**: Each tab shows relevant indicators

#### Enhanced Indicators Grid
- **Visual Layout**: Grid display with color-coded values
- **Real-time Updates**: Live calculation display
- **Condition Indicators**: Overbought/oversold/neutral states
- **Range Information**: High/low and volume data

## ⚠️ Disclaimers

- **Educational Purpose**: This tool is for learning and demonstration only
- **Not Financial Advice**: Do not use for actual trading decisions
- **Data Sources**: Results may vary based on data source quality
- **Risk Warning**: Trading involves substantial risk of loss
- **No Guarantees**: Past performance doesn't predict future results
- **API Dependencies**: Functionality depends on third-party API availability

## 🛠️ Technical Details

### Dependencies
- **Runtime**: Pure vanilla JavaScript (ES6+)
- **Charts**: Chart.js 3.9.1 (CDN)
- **APIs**: Alpha Vantage, TwelveData, Polygon.io
- **Browser**: Modern ES6+ support required

### Performance (v3.0)
- **Lightweight**: ~80KB total size (HTML + JS + CSS)
- **Enhanced**: Better accuracy with real market data
- **Fast**: Single-run analysis completes in seconds
- **Responsive**: Works on all screen sizes with quality indicators
- **Interactive**: Real-time charts with smooth animations

### Data Quality Improvements
- **More Consistent Signals**: Same stock shows similar analysis across runs
- **Better Indicator Accuracy**: RSI, MACD, SMA based on real market data
- **Reliable Calculations**: Proper historical data eliminates false signals
- **Enhanced User Feedback**: Clear indication of data source quality
- **Visual Charts**: Interactive price movement visualization

### Browser Support
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/enhanced-analysis`)
3. **Commit** changes (`git commit -m 'Add enhanced analysis features'`)
4. **Push** to branch (`git push origin feature/enhanced-analysis`)
5. **Open** Pull Request

### Areas for Contribution
- Additional technical indicators (Bollinger Bands, Stochastic)
- Advanced chart types (candlestick, volume charts)
- Portfolio tracking and comparison
- Mobile app development
- Machine learning signal enhancement
- Additional API integrations
- Performance optimizations

## 📝 Changelog

### v3.0.0 (Current - Enhanced Detailed View)
- 🆕 **Detailed analysis view** with interactive charts
- 🆕 **TwelveData API integration** for 30-minute intervals
- 🆕 **Chart.js integration** for price visualization
- 🆕 **Clean code architecture** with separated files
- 🆕 **Tab-based interface** for multiple timeframes
- ✅ **Enhanced error handling** and user feedback
- ✅ **Improved responsive design** for all devices
- ✅ **Visual data quality indicators** 
- ✅ **Better API rate limit handling**

### v2.0.0 (Alpha Vantage Primary)
- 🥇 **Alpha Vantage as primary** data source
- ✅ **Enhanced EMA calculations** for better MACD accuracy
- ✅ **Improved technical indicators** with real historical data
- ✅ **Smart fallback system** (Alpha Vantage → Polygon.io → Demo)
- ✅ **Visual data quality indicators** 
- ✅ **Better signal consistency** across runs
- ✅ **Enhanced error handling** and user feedback

### v1.0.0 (Original - Polygon.io Primary)
- ✅ Initial release with Polygon.io integration
- ✅ MACD, RSI, SMA technical indicators
- ✅ Fallback data system
- ✅ Single-run analysis mode
- ✅ Responsive design

### Planned Features (v4.0)
- 📈 **Candlestick charts** with volume indicators
- 📊 **Portfolio tracking** and performance comparison
- 🔔 **Alert system** for signal notifications
- 📱 **Progressive Web App** capabilities
- 🤖 **Machine learning** enhanced signals
- 📈 **Bollinger Bands** and other advanced indicators
- 🎨 **Customizable themes** and layouts
- 📊 **Export functionality** for analysis results

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/trading-robot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/trading-robot/discussions)
- **Documentation**: [Wiki](https://github.com/your-username/trading-robot/wiki)
- **API Keys**: Check respective provider documentation

### Getting Help
1. **Check Documentation**: Review this README and deployment guide
2. **Console Logs**: Open browser developer tools for detailed logging
3. **API Status**: Verify your API keys are valid and have remaining calls
4. **Network Issues**: Ensure stable internet connection for API calls

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Alpha Vantage**: For providing excellent historical financial data API
- **TwelveData**: For reliable intraday market data and analysis
- **Polygon.io**: For real-time market data as backup
- **Chart.js**: For beautiful and responsive chart visualizations
- **Technical Analysis Community**: For indicator algorithms and trading strategies
- **Open Source Community**: For inspiration and collaborative development
- **Users and Contributors**: For feedback and continuous improvement

---

**⚡ Ready to analyze some stocks with enhanced accuracy?** Just open `index.html` and start trading (virtually)! 

**🔧 Need help?** Check the console logs for detailed data source information and debugging.

**📈 Enhanced Trading Analysis!** Now with interactive charts, multiple timeframes, and detailed technical analysis.

**🔍 NEW in v3.0:** Click any stock card for comprehensive analysis with Chart.js visualizations and dual timeframe support!

---

## 🆕 What Makes v3.0 Special

### 🎯 **Enhanced User Experience**
- **One-Click Detail**: Seamless transition from overview to detailed analysis
- **Visual Excellence**: Professional-grade charts with Chart.js
- **Dual Perspective**: Daily trends + intraday opportunities
- **Clean Architecture**: No more cluttered files, everything organized

### 📊 **Professional Analysis**
- **Real Data Visualization**: Interactive charts with actual market data
- **Multiple Timeframes**: Long-term trends vs short-term opportunities
- **Enhanced Indicators**: Visual representation of technical analysis
- **Data Quality Transparency**: Clear indication of data source reliability

### 🔧 **Developer Friendly**
- **Clean Separation**: HTML/CSS separate from JavaScript logic
- **Modular Design**: Easy to extend and maintain
- **Modern Standards**: Following best practices for web development
- **Documentation**: Comprehensive README and deployment guides

The Trading Robot has evolved from a simple analysis tool to a comprehensive market analysis platform with professional-grade features and clean, maintainable code architecture!