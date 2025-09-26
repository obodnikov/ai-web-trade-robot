// ================== UI & TAB HANDLERS ==================
function switchTab(tabName) {
    console.log(`Switching to tab: ${tabName}

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


function initializePatternModal() {
    const modal = document.getElementById('pattern-modal');
    const closeBtn = document.querySelector('.pattern-modal-close');

    // Close modal when clicking the X button
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        }

function showPatternDetails(patternType) {
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


function initializeReferencePatternCards() {
    // Add click handlers to all reference pattern cards
    const patternCards = document.querySelectorAll('.pattern-card[data-pattern]');

    patternCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';

        card.addEventListener('click', function() {
            const patternType = this.getAttribute('data-pattern');
            showPatternDetails(patternType);
        }