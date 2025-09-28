// ui.js - User interface interaction functions
//
// Functions in this file:
// - switchTab: Handle tab switching functionality with proper data loading
// - initializePatternModal: Initialize pattern modal functionality with event handlers
// - showPatternDetails: Show detailed pattern information in modal dialog
// - initializeReferencePatternCards: Initialize click handlers for reference pattern cards

// Tab switching functionality - FIXED VERSION
function switchTab(tabName) {
    console.log(`Switching to tab: ${tabName}`);

    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Load data based on tab with proper sequencing
    if (tabName === 'intraday' && document.getElementById('intraday-content').style.display === 'none') {
        loadIntradayData(currentSymbol);
    }

    if (tabName === 'intraday15' && document.getElementById('intraday15-content').style.display === 'none') {
        loadIntraday15Data(currentSymbol);
    }

    if (tabName === 'intraday5' && document.getElementById('intraday5-content').style.display === 'none') {
        loadIntraday5Data(currentSymbol);
    }

    // FIXED: Proper candlestick loading with data dependency check
    if (tabName === 'candlestick') {
        // Always reload candlestick to ensure fresh patterns
        loadCandlestickDataFixed(currentSymbol);
    }

    if (tabName === 'candlestick5') {
        // Always reload 5-minute candlestick to ensure fresh patterns
        loadCandlestick5DataFixed(currentSymbol);
    }

    if (tabName === 'chatgpt') {
        initializeChatGPTTab();
    }
}

// Page initialization
window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    currentSymbol = urlParams.get('symbol') || 'AAPL';
    
    document.getElementById('stockTitle').textContent = `Detailed Analysis for ${currentSymbol}`;
    document.title = `Trading Robot - ${currentSymbol} Analysis`;
    
    // Set up tab event listeners
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Set up ChatGPT button if exists
    const generateBtn = document.getElementById('generateAnalysisBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('ChatGPT integration requires middleware setup. See documentation.');
        });
    }
    
    // Ensure daily tab is active initially
    switchTab('daily');
    
    // Load daily data first
    loadDailyData(currentSymbol);
    
    console.log(`Trading Robot detailed view loaded for ${currentSymbol}`);
    console.log('FIXED: Candlestick patterns will load consistently on tab switch');

    // Initialize modal functionality
    initializePatternModal();

    // Initialize reference pattern cards
    initializeReferencePatternCards();
});

// Pattern modal functionality
function initializePatternModal() {
    const modal = document.getElementById('pattern-modal');
    const closeBtn = document.querySelector('.pattern-modal-close');

    // Close modal when clicking the X button
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        };
    }

    // Close modal when clicking outside of it
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    });
}

async function showPatternDetails(patternType) {
    const modal = document.getElementById('pattern-modal');
    const modalTitle = document.getElementById('pattern-modal-title');
    const modalContent = document.getElementById('pattern-modal-content');

    // Show modal with loading state
    modal.style.display = 'flex';
    modalTitle.textContent = 'Loading Pattern Details...';
    modalContent.innerHTML = '<div style="text-align: center; padding: 40px;"><div class="spinner"></div><p>Loading pattern information...</p></div>';

    try {
        // Check if we're running in a file:// context (local file opening)
        if (window.location.protocol === 'file:') {
            throw new Error('Pattern details are not available when opening the file directly. Please serve the application through a web server (e.g., python -m http.server).');
        }

        // Construct the URL for the markdown file using the current page's location as base
        const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
        const markdownUrl = `${baseUrl}Docs/patterns/${patternType}.md`;

        console.log(`Trying to fetch pattern from: ${markdownUrl}`);
        console.log(`Current location: ${window.location.href}`);
        console.log(`Base URL: ${baseUrl}`);

        const response = await fetch(markdownUrl);

        if (!response || !response.ok) {
            throw new Error(`Failed to load pattern file: ${response.status} - ${response.statusText} (URL: ${markdownUrl})`);
        }

        console.log(`Successfully loaded pattern from: ${markdownUrl}`);
        const markdownContent = await response.text();

        // Process the markdown and update image paths
        // Extract the base path from the successful markdownUrl
        const basePath = markdownUrl.substring(0, markdownUrl.lastIndexOf('/') + 1);
        const processedMarkdown = markdownContent.replace(
            /!\[Candlestick Pattern Example\]\(([^)]+)\)/g,
            `![Candlestick Pattern Example](${basePath}$1)`
        );

        // Convert markdown to HTML using the marked library
        const htmlContent = marked.parse(processedMarkdown);

        // Extract the pattern name from the first heading
        const titleMatch = markdownContent.match(/^#\s+(.+)/m);
        const patternName = titleMatch ? titleMatch[1] : 'Pattern Details';

        // Update modal content
        modalTitle.textContent = patternName;
        modalContent.innerHTML = htmlContent;

    } catch (error) {
        console.error('Error loading pattern details:', error);
        modalTitle.textContent = 'Error Loading Pattern';
        modalContent.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #e74c3c;">
                <h3>📋 Unable to Load Pattern Details</h3>
                <p>Sorry, there was an error loading the information for this pattern.</p>
                <p><strong>Pattern:</strong> ${patternType}</p>
                <p><strong>Error:</strong> ${error.message}</p>
            </div>
        `;
    }
}

function initializeReferencePatternCards() {
    // Add click handlers to all reference pattern cards
    const patternCards = document.querySelectorAll('.pattern-card[data-pattern]');

    patternCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';

        card.addEventListener('click', function() {
            const patternType = this.getAttribute('data-pattern');
            showPatternDetails(patternType);
        });

        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        });
    });
}