// apiKey.js - Centralized API Key Management
// This is the only place where you should put API keys

// Alpha Vantage API Key (Primary data source for trading_robot.js)
// Get your free key at: https://www.alphavantage.co/support/#api-key
window.ALPHA_VANTAGE_API_KEY = 'demo';

// Polygon.io API Key (Fallback data source for trading_robot.js)
// Get your free key at: https://polygon.io/
window.POLYGON_API_KEY = 'DEMO';

// TwelveData API Key (For intraday data in detailed-view.js)
// Get your free key at: https://twelvedata.com/
window.TWELVEDATA_API_KEY = 'demo';

// Instructions:
// 1. Replace 'demo' and 'DEMO' above with your actual API keys
// 2. Keep your API keys secure and never share them publicly
// 3. All other JavaScript files will import keys from these global variables