# 🤖 Trading Dry-Run Robot

A comprehensive stock market analysis tool that provides real-time trading signals using technical indicators. Built with vanilla JavaScript and powered by multiple data sources including Polygon.io and Alpha Vantage APIs.

![Trading Robot Demo](https://img.shields.io/badge/Status-Ready-brightgreen) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow) ![API](https://img.shields.io/badge/API-Polygon.io-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **Real-time Stock Data**: Integration with Polygon.io and Alpha Vantage APIs
- **Technical Analysis**: MACD, RSI, and Simple Moving Average indicators
- **Trading Signals**: Buy/Sell/Hold recommendations with confidence levels
- **Fallback System**: Graceful degradation from live data to realistic demo data
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Single-Run Analysis**: On-demand analysis without continuous monitoring
- **Professional UI**: Clean, modern interface with detailed data visualization

## 📊 Technical Indicators

### MACD (Moving Average Convergence Divergence)
- **Buy Signal**: MACD line crosses above signal line with positive histogram
- **Sell Signal**: MACD line crosses below signal line with negative histogram

### RSI (Relative Strength Index)
- **Buy Signal**: RSI below 30 (oversold condition)
- **Sell Signal**: RSI above 70 (overbought condition)

### Simple Moving Averages
- **Buy Signal**: Price above SMA20 and SMA20 > SMA50
- **Sell Signal**: Price below SMA20 and SMA20 < SMA50

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for API access
- Optional: Free API keys from Polygon.io and Alpha Vantage

### Installation

1. **Clone or Download**
   ```bash
   git clone https://github.com/your-username/trading-robot.git
   cd trading-robot
   ```

2. **File Structure**
   ```
   trading-robot/
   ├── index.html          # Main HTML file
   ├── trading-robot.js    # JavaScript functions
   ├── README.md          # This file
   └── deployment/        # Optional: Nginx configs
   ```

3. **Open in Browser**
   - Simply open `index.html` in your web browser
   - Or serve via local web server for development

## 🔑 API Setup (Optional but Recommended)

The robot works with demo data out of the box, but for real-time data:

### 1. Polygon.io API Key
1. Visit [polygon.io](https://polygon.io/)
2. Sign up for free account (5 calls/minute)
3. Get your API key from dashboard
4. Replace `'DEMO'` in `trading-robot.js`:
   ```javascript
   const apiKey = 'YOUR_POLYGON_API_KEY'; // Line ~150
   ```

### 2. Alpha Vantage API Key  
1. Visit [alphavantage.co](https://www.alphavantage.co/support/#api-key)
2. Get free API key (5 calls/minute, 500/day)
3. Replace `'demo'` in `trading-robot.js`:
   ```javascript
   const apiKey = 'YOUR_ALPHA_VANTAGE_KEY'; // Line ~280
   ```

## 📱 Usage

### Basic Operation
1. **Enter Stock Tickers**: Add comma-separated symbols (e.g., `AAPL,GOOGL,MSFT`)
2. **Select Strategy**: Choose from MACD, RSI, SMA, or All Combined
3. **Start Analysis**: Click the analysis button for one-time execution
4. **Review Results**: View detailed analysis cards with trading recommendations

### Sample Tickers
- **Mega Cap**: AAPL, MSFT, NVDA, GOOGL, AMZN
- **Tech**: META, NFLX, CRM, ADBE, ORCL
- **Finance**: JPM, BAC, GS, V, MA
- **EV/Auto**: TSLA, RIVN, LCID, F, GM
- **Media**: WBD, DIS, SPOT, ROKU
- **Crypto**: COIN, MSTR

## 🏗️ Data Sources Priority

1. **Primary**: Polygon.io (Real-time market data)
   - ✅ Live OHLC data
   - ✅ Historical prices
   - ✅ Volume data
   - ⚡ 5 calls/minute free

2. **Fallback**: Alpha Vantage (Financial data API)
   - ✅ Global quote data
   - ✅ Generated historical data
   - ⚡ 5 calls/minute, 500/day free

3. **Demo**: Realistic simulation
   - ✅ Based on actual market prices
   - ✅ Realistic volatility patterns
   - ✅ No API limits

## 🔧 Development

### Local Development
```bash
# Serve with Python (if needed)
python -m http.server 8000

# Or with Node.js
npx serve .

# Or simply open index.html in browser
```

### Cache Issues During Development
If you modify `trading-robot.js` and don't see changes:

- **Hard Refresh**: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- **Developer Tools**: F12 → Network tab → "Disable cache"
- **Incognito Mode**: `Ctrl+Shift+N` for fresh session

### Customizing Strategies
Edit `trading-robot.js` functions:
- `calculateMACD()`: Modify MACD parameters
- `calculateRSI()`: Adjust RSI period
- `generateTradingSignal()`: Add new indicators or modify logic

## 🌐 Deployment

### Simple Hosting
- Upload `index.html` and `trading-robot.js` to any web server
- Ensure both files are in the same directory
- Configure HTTPS for API access

### Nginx Deployment
Use the included Nginx configuration for production:
```bash
# Copy files to web directory
sudo cp index.html trading-robot.js /var/www/trading-robot/html/

# Configure nginx (see deployment guide)
sudo cp nginx.conf /etc/nginx/sites-available/trading-robot
```

### API Considerations
- **CORS**: APIs may require HTTPS in production
- **Rate Limits**: Monitor API usage to avoid limits
- **Error Handling**: Robot gracefully falls back to demo data

## 📊 Output Format

Each analysis provides:

### Stock Information
- Current price and daily change
- Open, High, Low, Close (OHLC)
- Volume and market data
- Data source quality indicators

### Technical Indicators
- RSI value with color coding
- MACD line and signal values
- SMA20 and SMA50 levels
- Price position relative to moving averages

### Trading Recommendation
- **Action**: BUY, SELL, or HOLD
- **Confidence**: Percentage based on signal strength
- **Target Price**: Suggested entry/exit point
- **Reasoning**: Why the signal was generated

## ⚠️ Disclaimers

- **Educational Purpose**: This tool is for learning and demonstration only
- **Not Financial Advice**: Do not use for actual trading decisions
- **Demo Data**: Some results may use simulated data for demonstration
- **No Guarantees**: Past performance doesn't predict future results
- **Risk Warning**: Trading involves substantial risk of loss

## 🛠️ Technical Details

### Dependencies
- **None**: Pure vanilla JavaScript
- **APIs**: Polygon.io and Alpha Vantage (optional)
- **Browser**: Modern ES6+ support required

### Performance
- **Lightweight**: ~50KB total size
- **Fast**: Single-run analysis completes in seconds
- **Responsive**: Works on all screen sizes
- **Offline**: Demo mode works without internet

### Browser Support
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** Pull Request

### Areas for Contribution
- Additional technical indicators
- New data source integrations
- UI/UX improvements
- Performance optimizations
- Mobile app development

## 📝 Changelog

### v1.0.0 (Current)
- ✅ Initial release with Polygon.io integration
- ✅ MACD, RSI, SMA technical indicators
- ✅ Fallback data system
- ✅ Single-run analysis mode
- ✅ Responsive design
- ✅ Comprehensive error handling

### Planned Features
- 📈 Chart visualization
- 📊 Portfolio tracking
- 🔔 Alert system
- 📱 Mobile app
- 🤖 Machine learning signals

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/trading-robot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/trading-robot/discussions)
- **Email**: support@tradingrobot.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Polygon.io**: For providing excellent financial data API
- **Alpha Vantage**: For reliable backup data source
- **Technical Analysis Community**: For indicator algorithms and strategies
- **Open Source**: Built with love for the developer community

---

**⚡ Ready to analyze some stocks?** Just open `index.html` and start trading (virtually)! 

**🔧 Need help?** Check the console logs for detailed data source information and debugging.

**📈 Happy Trading!** (Remember: This is for educational purposes only!)