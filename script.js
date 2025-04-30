/**
 * Tarot Card Reading Application
 * A mystical tarot card reading experience with Celtic Cross spread
 */

// Application state
let tarotData = [];
let isDrawing = false;
let soundEnabled = true;

// DOM element cache for frequently accessed elements
const domElements = {};

// Initialize card flip sound using Web Audio API
let playCardFlipSound = window.createCardFlipSound ? window.createCardFlipSound() : null;

// Define the positions for the 10-card Celtic Cross spread
// Optimized Celtic Cross layout with improved spacing on both X and Y axes
// Enhanced visual separation between cards for better readability
// Adjusted to be less tall at the top and more space at the bottom
const spreadPositions = [
  { top: '38%', left: '35%', zIndex: 10, label: '1. Present' },           // Center/Present - adjusted for better balance
  { top: '38%', left: '35%', rotate: '90deg', zIndex: 11, label: '2. Challenge', isChallenge: true, offsetY: '0px' },  // Crossing card - positioned on top of Present card
  { top: '65%', left: '35%', zIndex: 3, label: '3. Foundation' },        // Below - better vertical spacing
  { top: '12%', left: '35%', zIndex: 3, label: '4. Crown' },             // Above - better vertical spacing (moved down slightly)
  { top: '38%', left: '15%', zIndex: 3, label: '5. Past' },              // Left - better horizontal spacing
  { top: '38%', left: '55%', zIndex: 3, label: '6. Future' },            // Right - better horizontal spacing
  { top: '70%', left: '75%', zIndex: 4, label: '7. Advice' },            // Bottom of staff - moved up and left to stay within boundaries
  { top: '55%', left: '75%', zIndex: 5, label: '8. External' },          // Second from bottom - better vertical spacing
  { top: '38%', left: '75%', zIndex: 6, label: '9. Hopes/Fears' },       // Third from bottom - better vertical spacing
  { top: '20%', left: '75%', zIndex: 7, label: '10. Outcome' }           // Top of staff - better vertical spacing
];

// Create deck visualization
function createDeck() {
  const deckContainer = document.getElementById('deckContainer');
  if (!deckContainer) return;

  deckContainer.innerHTML = '';

  // Create 7 cards for the deck visual (more cards for a fuller deck appearance)
  for (let i = 0; i < 7; i++) {
    const deckCard = document.createElement('div');
    deckCard.className = 'deck-card';
    deckCard.style.transform = `translateX(${i * 2}px) translateY(${i * 2}px) rotate(${i - 3}deg)`;

    // Add a more mystical symbol to the card back
    const symbols = ['✧', '☽', '☀', '⚝', '⚹', '✵', '⚘'];
    const symbol = symbols[i % symbols.length];

    deckCard.innerHTML = `<div class="text-center text-3xl opacity-40">${symbol}</div>`;
    deckContainer.appendChild(deckCard);
  }

  // Add a subtle shine effect when hovering over the deck
  deckContainer.addEventListener('mouseover', () => {
    const cards = deckContainer.querySelectorAll('.deck-card');
    cards.forEach((card, index) => {
      card.style.transform = `translateX(${index * 2.5}px) translateY(${index * 2.5}px) rotate(${index - 3}deg) scale(1.05)`;
      card.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.4), 0 0 15px rgba(212, 175, 55, 0.3)';
    });
  });

  deckContainer.addEventListener('mouseout', () => {
    const cards = deckContainer.querySelectorAll('.deck-card');
    cards.forEach((card, index) => {
      card.style.transform = `translateX(${index * 2}px) translateY(${index * 2}px) rotate(${index - 3}deg)`;
      card.style.boxShadow = '';
    });
  });
}

/**
 * Initialize the application
 * Caches DOM elements, loads tarot data, and sets up the UI
 */
function initializeApp() {
  // Cache frequently accessed DOM elements
  cacheElements();

  // Load tarot data
  loadTarotData();
}

/**
 * Cache DOM elements for better performance
 */
function cacheElements() {
  // UI controls
  domElements.soundButton = document.getElementById('soundToggle');
  domElements.drawButton = document.getElementById('drawTenBtn');
  domElements.resetButton = document.getElementById('resetBtn');
  domElements.closeDetailBtn = document.getElementById('closeDetailBtn');
  domElements.loadingIndicator = document.getElementById('loadingIndicator');

  // Card display elements
  domElements.deckContainer = document.getElementById('deckContainer');
  domElements.displayContainer = document.getElementById('tenCardDisplay');
  domElements.detailPanel = document.getElementById('cardDetailPanel');
  domElements.cardName = document.getElementById('detailCardName');
  domElements.cardImage = document.getElementById('detailCardImage');
  domElements.cardDesc = document.getElementById('detailCardDesc');

  // New detail panel elements
  domElements.keywordsUpright = document.getElementById('detailCardKeywordsUpright');
  domElements.keywordsReversed = document.getElementById('detailCardKeywordsReversed');
  domElements.quotesContainer = document.getElementById('detailCardQuotes');
  domElements.meaningGeneral = document.getElementById('detailCardMeaningGeneral');
  domElements.meaningCareer = document.getElementById('detailCardMeaningCareer');
  domElements.meaningRelationships = document.getElementById('detailCardMeaningRelationships');
  domElements.meaningSpirituality = document.getElementById('detailCardMeaningSpirituality');
  domElements.meaningHealth = document.getElementById('detailCardMeaningHealth');
  domElements.promptsList = document.getElementById('detailCardPrompts');
  domElements.combinationsContainer = document.getElementById('detailCardCombinations');

  // For backward compatibility
  domElements.cardMeaning = document.getElementById('detailCardMeaningGeneral');

  // Background elements
  domElements.starsContainer = document.getElementById('starsContainer');
}

/**
 * Load tarot card data from JSON file
 */
function loadTarotData() {
  fetch('newtarot.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // The new JSON structure is an array directly, not an object with a cards property
      tarotData = data;
      createDeck();
      createStars(); // Create the mystical star background
      initializeEventListeners(); // Set up all event listeners
    })
    .catch(error => {
      console.error('Error loading tarot data:', error);
      showError('Error loading tarot data. Please refresh the page.');
    });
}

/**
 * Display an error message to the user
 * @param {string} message - The error message to display
 */
function showError(message) {
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  document.body.appendChild(errorElement);

  // Automatically remove the error after 10 seconds
  setTimeout(() => {
    if (errorElement.parentNode) {
      errorElement.parentNode.removeChild(errorElement);
    }
  }, 10000);
}

/**
 * Toggle sound on/off
 */
function toggleSound() {
  soundEnabled = !soundEnabled;
  if (domElements.soundButton) {
    domElements.soundButton.innerHTML = soundEnabled ?
      '<i class="fas fa-volume-up"></i>' :
      '<i class="fas fa-volume-mute"></i>';

    // Add aria-label for accessibility
    domElements.soundButton.setAttribute('aria-label',
      soundEnabled ? 'Mute sound' : 'Enable sound');
  }
}



/**
 * Reset the reading to initial state
 */
function resetReading() {
  // Clear the display
  if (domElements.displayContainer) {
    domElements.displayContainer.innerHTML = '';
  }

  // Reset the draw button
  if (domElements.drawButton) {
    domElements.drawButton.disabled = false;
    domElements.drawButton.classList.remove('opacity-50', 'cursor-not-allowed');
  }

  // Hide the reset button
  if (domElements.resetButton) {
    domElements.resetButton.classList.add('hidden');
  }

  // Hide the detail panel
  if (domElements.detailPanel) {
    domElements.detailPanel.classList.add('hidden');
  }

  // Remove selected state from all cards
  document.querySelectorAll('.tarot-position').forEach(card => {
    card.classList.remove('card-selected');
  });

  // Reset drawing state and recreate the deck
  isDrawing = false;
  createDeck();
}

/**
 * Show card details in the side panel
 * @param {Object} card - The tarot card object
 * @param {boolean} isReversed - Whether the card is reversed
 * @param {string} meaning - The card meaning (upright or reversed) - kept for backward compatibility but not used
 * @param {string} imageSrc - Path to the card image
 * @param {string} positionLabel - The position label in the spread
 */
function showCardDetails(card, isReversed, _meaning, imageSrc, positionLabel) {
  if (!domElements.detailPanel) return;

  // Update the panel content
  if (domElements.cardName) {
    domElements.cardName.textContent = `${card.name} ${isReversed ? "(Reversed)" : ""} - ${positionLabel}`;
  }

  if (domElements.cardImage) {
    domElements.cardImage.src = imageSrc;
    domElements.cardImage.alt = card.name;
    domElements.cardImage.className = isReversed ? 'detail-card-image reversed' : 'detail-card-image';

    // Handle error for image loading
    domElements.cardImage.onerror = function() {
      this.onerror = null;
      // Create a fallback SVG image if the card image fails to load
      this.src = createFallbackCardImage(card.name);
    };
  }

  // Update keywords
  const keywordsUpright = document.getElementById('detailCardKeywordsUpright');
  const keywordsReversed = document.getElementById('detailCardKeywordsReversed');

  if (keywordsUpright) {
    keywordsUpright.textContent = card.keywords.upright || '-';
  }

  if (keywordsReversed) {
    keywordsReversed.textContent = card.keywords.reversed || '-';
  }

  // Update quotes with enhanced styling
  const quotesContainer = document.getElementById('detailCardQuotes');
  if (quotesContainer && card.quotes) {
    quotesContainer.innerHTML = '';
    card.quotes.forEach(quote => {
      // Extract author if available (text after the last dash)
      let quoteText = quote;
      let author = '';

      const lastDashIndex = quote.lastIndexOf('–');
      if (lastDashIndex !== -1) {
        quoteText = quote.substring(0, lastDashIndex).trim();
        author = quote.substring(lastDashIndex + 1).trim();
      }

      // Create quote container with decorative elements
      const quoteElement = document.createElement('div');
      quoteElement.className = 'bg-mystic-purple/10 p-4 rounded-lg border border-gold/10 relative mb-4';

      // Add decorative quote marks
      const leftQuote = document.createElement('div');
      leftQuote.className = 'absolute -top-2 -left-2 text-gold/30 text-3xl';
      leftQuote.innerHTML = '<i class="fas fa-quote-left"></i>';

      const rightQuote = document.createElement('div');
      rightQuote.className = 'absolute -bottom-2 -right-2 text-gold/30 text-3xl';
      rightQuote.innerHTML = '<i class="fas fa-quote-right"></i>';

      quoteElement.appendChild(leftQuote);
      quoteElement.appendChild(rightQuote);

      // Add quote text
      const quoteTextElement = document.createElement('p');
      quoteTextElement.className = 'text-white/90 italic text-center px-6 py-2';
      quoteTextElement.textContent = `"${quoteText}"`;
      quoteElement.appendChild(quoteTextElement);

      // Add author if available
      if (author) {
        const authorElement = document.createElement('p');
        authorElement.className = 'text-gold/70 text-right text-sm mt-2';
        authorElement.textContent = `— ${author}`;
        quoteElement.appendChild(authorElement);
      }

      quotesContainer.appendChild(quoteElement);
    });
  } else if (quotesContainer) {
    quotesContainer.innerHTML = '<p class="text-white/70 italic text-center">No quotes available for this card.</p>';
  }

  // Update description
  if (domElements.cardDesc) {
    domElements.cardDesc.textContent = card.description || 'No description available';
  }

  // Update meanings
  const meaningPrefix = isReversed ? 'reversed_meanings' : 'upright_meanings';

  // General meaning
  const meaningGeneral = document.getElementById('detailCardMeaningGeneral');
  if (meaningGeneral) {
    meaningGeneral.textContent = card[meaningPrefix].general || 'No general meaning available';
  }

  // Career meaning
  const meaningCareer = document.getElementById('detailCardMeaningCareer');
  if (meaningCareer) {
    meaningCareer.textContent = card[meaningPrefix].career_work_finances || 'No career meaning available';
  }

  // Relationships meaning
  const meaningRelationships = document.getElementById('detailCardMeaningRelationships');
  if (meaningRelationships) {
    meaningRelationships.textContent = card[meaningPrefix].relationships_love || 'No relationships meaning available';
  }

  // Spirituality meaning
  const meaningSpirituality = document.getElementById('detailCardMeaningSpirituality');
  if (meaningSpirituality) {
    meaningSpirituality.textContent = card[meaningPrefix].spirituality || 'No spirituality meaning available';
  }

  // Health meaning
  const meaningHealth = document.getElementById('detailCardMeaningHealth');
  if (meaningHealth) {
    meaningHealth.textContent = card[meaningPrefix].well_being_health || 'No health meaning available';
  }

  // Update journaling prompts with enhanced styling
  const promptsList = document.getElementById('detailCardPrompts');
  if (promptsList && card.journaling_prompts) {
    promptsList.innerHTML = '';
    card.journaling_prompts.forEach((prompt, index) => {
      // Create prompt item with decorative elements
      const promptItem = document.createElement('li');
      promptItem.className = 'flex items-start mb-3 relative';

      // Add decorative bullet point
      const bulletPoint = document.createElement('div');
      bulletPoint.className = 'flex-shrink-0 w-6 h-6 rounded-full bg-mystic-purple/30 border border-gold/20 flex items-center justify-center mr-3 mt-0.5';
      bulletPoint.innerHTML = `<span class="text-gold text-xs">${index + 1}</span>`;

      // Add prompt text with styling
      const promptText = document.createElement('div');
      promptText.className = 'flex-1 text-white/90';
      promptText.textContent = prompt;

      // Add subtle highlight effect on hover
      promptItem.addEventListener('mouseover', () => {
        promptItem.classList.add('bg-mystic-purple/10', 'rounded');
        bulletPoint.classList.add('bg-mystic-purple/50');
      });

      promptItem.addEventListener('mouseout', () => {
        promptItem.classList.remove('bg-mystic-purple/10', 'rounded');
        bulletPoint.classList.remove('bg-mystic-purple/50');
      });

      promptItem.appendChild(bulletPoint);
      promptItem.appendChild(promptText);
      promptsList.appendChild(promptItem);
    });
  } else if (promptsList) {
    promptsList.innerHTML = '<p class="text-white/70 italic text-center">No journaling prompts available for this card.</p>';
  }

  // Update suggested combinations
  const combinationsContainer = document.getElementById('detailCardCombinations');
  if (combinationsContainer) {
    combinationsContainer.innerHTML = '';

    // Create upright combinations group if available with enhanced styling
    if (card.upright_suggested_combinations && card.upright_suggested_combinations.length > 0) {
      const uprightGroup = document.createElement('div');
      uprightGroup.className = 'mb-5';

      const uprightTitle = document.createElement('h5');
      uprightTitle.className = 'text-light-gold font-cinzel mb-3 flex items-center';
      uprightTitle.innerHTML = '<i class="fas fa-sun text-gold/70 mr-2"></i> Upright Combinations';
      uprightGroup.appendChild(uprightTitle);

      // Create a container for the combinations
      const combosContainer = document.createElement('div');
      combosContainer.className = 'space-y-3 pl-2';

      card.upright_suggested_combinations.forEach(combo => {
        // Create combo item with enhanced styling
        const comboItem = document.createElement('div');
        comboItem.className = 'bg-mystic-purple/10 p-3 rounded-lg border border-gold/10 transition-all duration-300 hover:bg-mystic-purple/20';

        // Create card name with pill styling
        const comboCard = document.createElement('div');
        comboCard.className = 'inline-block bg-mystic-purple/40 text-light-gold px-2 py-1 rounded-full text-sm mb-2';
        comboCard.textContent = combo.card;

        // Create meaning with styling
        const comboMeaning = document.createElement('div');
        comboMeaning.className = 'text-white/90 text-sm';
        comboMeaning.textContent = combo.meaning;

        comboItem.appendChild(comboCard);
        comboItem.appendChild(comboMeaning);
        combosContainer.appendChild(comboItem);
      });

      uprightGroup.appendChild(combosContainer);
      combinationsContainer.appendChild(uprightGroup);
    }

    // Create reversed combinations group if available with enhanced styling
    if (card.reversed_suggested_combinations && card.reversed_suggested_combinations.length > 0) {
      const reversedGroup = document.createElement('div');
      reversedGroup.className = 'mb-5';

      const reversedTitle = document.createElement('h5');
      reversedTitle.className = 'text-light-gold font-cinzel mb-3 flex items-center';
      reversedTitle.innerHTML = '<i class="fas fa-moon text-gold/70 mr-2"></i> Reversed Combinations';
      reversedGroup.appendChild(reversedTitle);

      // Create a container for the combinations
      const combosContainer = document.createElement('div');
      combosContainer.className = 'space-y-3 pl-2';

      card.reversed_suggested_combinations.forEach(combo => {
        // Create combo item with enhanced styling
        const comboItem = document.createElement('div');
        comboItem.className = 'bg-mystic-purple/10 p-3 rounded-lg border border-gold/10 transition-all duration-300 hover:bg-mystic-purple/20';

        // Create card name with pill styling
        const comboCard = document.createElement('div');
        comboCard.className = 'inline-block bg-deep-purple/60 text-light-gold px-2 py-1 rounded-full text-sm mb-2';
        comboCard.textContent = combo.card;

        // Create meaning with styling
        const comboMeaning = document.createElement('div');
        comboMeaning.className = 'text-white/90 text-sm';
        comboMeaning.textContent = combo.meaning;

        comboItem.appendChild(comboCard);
        comboItem.appendChild(comboMeaning);
        combosContainer.appendChild(comboItem);
      });

      reversedGroup.appendChild(combosContainer);
      combinationsContainer.appendChild(reversedGroup);
    } else if (combinationsContainer && !card.upright_suggested_combinations && !card.reversed_suggested_combinations) {
      combinationsContainer.innerHTML = '<p class="text-white/70 italic text-center">No suggested combinations available for this card.</p>';
    }
  }

  // Show the panel with a fade-in effect
  domElements.detailPanel.classList.remove('hidden');
  // Add flex display for proper layout
  domElements.detailPanel.classList.add('flex', 'flex-col');

  // Initialize collapsible sections
  initializeCollapsibleSections();

  // Initialize meaning tabs
  initializeMeaningTabs();
}

/**
 * Create a fallback SVG image for cards when the image fails to load
 * @param {string} cardName - The name of the card
 * @returns {string} - Data URL for the SVG image
 */
function createFallbackCardImage(cardName) {
  // Encode the card name to prevent XML parsing issues
  const encodedName = cardName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"><rect width="200" height="300" fill="%234A266A" /><text x="100" y="150" font-family="Arial" font-size="16" fill="white" text-anchor="middle">${encodedName}</text></svg>`;
}

/**
 * Close the card detail panel
 */
function closeCardDetails() {
  if (!domElements.detailPanel) return;

  // Add a fade-out effect before hiding
  domElements.detailPanel.classList.add('fade-out');

  // Remove flex display to prevent layout shift during animation
  domElements.detailPanel.classList.remove('flex');

  // Remove selected state from all cards
  document.querySelectorAll('.tarot-position').forEach(card => {
    card.classList.remove('card-selected');
  });

  // Wait for animation to complete before hiding
  setTimeout(() => {
    domElements.detailPanel.classList.remove('fade-out');
    domElements.detailPanel.classList.add('hidden');
  }, 300);
}

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
  // Sound toggle
  if (domElements.soundButton) {
    domElements.soundButton.addEventListener('click', toggleSound);
  }



  // Reset button
  if (domElements.resetButton) {
    domElements.resetButton.addEventListener('click', resetReading);
  }

  // Draw button
  if (domElements.drawButton) {
    domElements.drawButton.addEventListener('click', drawCards);
  }

  // Close detail panel button
  if (domElements.closeDetailBtn) {
    domElements.closeDetailBtn.addEventListener('click', closeCardDetails);
  }

  // Add keyboard accessibility
  document.addEventListener('keydown', handleKeyboardEvents);

  // Add window resize handler to adjust layout if needed
  window.addEventListener('resize', handleWindowResize);
}

/**
 * Initialize collapsible sections in the card detail panel
 */
function initializeCollapsibleSections() {
  // Target the correct collapsible elements with the class 'collapsible'
  const sectionHeaders = document.querySelectorAll('.collapsible');

  // First, close all sections initially
  document.querySelectorAll('.section-content').forEach(content => {
    content.style.maxHeight = '0';
    content.style.padding = '0';
    content.classList.remove('active');
  });

  sectionHeaders.forEach((header, index) => {
    // Remove existing event listeners to prevent duplicates
    const newHeader = header.cloneNode(true);
    header.parentNode.replaceChild(newHeader, header);

    // Reset the chevron icon initially
    const chevronIcon = newHeader.querySelector('i.fa-chevron-down');
    if (chevronIcon) {
      chevronIcon.style.transform = 'rotate(0deg)';
    }

    // Remove active class initially
    newHeader.classList.remove('active');

    // Add click event listener
    newHeader.addEventListener('click', () => {
      // Find the chevron icon inside the header
      const chevronIcon = newHeader.querySelector('i.fa-chevron-down');

      // Get the content section that follows the header
      const content = newHeader.nextElementSibling;

      // Toggle active class on header
      newHeader.classList.toggle('active');

      // Rotate chevron icon when active
      if (chevronIcon) {
        if (newHeader.classList.contains('active')) {
          chevronIcon.style.transform = 'rotate(180deg)';
        } else {
          chevronIcon.style.transform = 'rotate(0deg)';
        }
      }

      // Toggle section content visibility
      if (content && content.classList.contains('section-content')) {
        if (newHeader.classList.contains('active')) {
          // Set padding first so it's included in the scrollHeight calculation
          content.style.padding = '1rem';
          // Use a very large max-height value to ensure all content is visible
          content.style.maxHeight = '9999px';
          content.classList.add('active');
        } else {
          content.style.maxHeight = '0';
          content.style.padding = '0';
          content.classList.remove('active');
        }
      }
    });

    // Open first section by default on initial load
    if (index === 0) {
      newHeader.classList.add('active');
      const content = newHeader.nextElementSibling;

      if (content && content.classList.contains('section-content')) {
        content.classList.add('active');
        // Use setTimeout to ensure the DOM has updated
        setTimeout(() => {
          content.style.padding = '1rem';
          // Use a very large max-height value to ensure all content is visible
          content.style.maxHeight = '9999px';
        }, 10);
      }

      if (chevronIcon) {
        chevronIcon.style.transform = 'rotate(180deg)';
      }
    }
  });
}

/**
 * Initialize meaning tabs in the card detail panel
 */
function initializeMeaningTabs() {
  const tabs = document.querySelectorAll('.meaning-tab');

  tabs.forEach(tab => {
    // Remove existing event listeners
    const newTab = tab.cloneNode(true);
    tab.parentNode.replaceChild(newTab, tab);

    // Add new event listener
    newTab.addEventListener('click', () => {
      // Remove active class from all tabs
      document.querySelectorAll('.meaning-tab').forEach(t => {
        t.classList.remove('active');
        t.classList.remove('text-light-gold');
        t.classList.remove('border-b-2');
        t.classList.remove('border-gold');
      });

      // Add active class to clicked tab
      newTab.classList.add('active');
      newTab.classList.add('text-light-gold');
      newTab.classList.add('border-b-2');
      newTab.classList.add('border-gold');

      // Hide all content sections
      document.querySelectorAll('.meaning-content').forEach(content => {
        content.classList.add('hidden');
        content.classList.remove('active');
      });

      // Show content section corresponding to clicked tab
      const tabName = newTab.getAttribute('data-tab');
      const contentSection = document.getElementById(`meaning${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);

      if (contentSection) {
        contentSection.classList.remove('hidden');
        contentSection.classList.add('active');
      }
    });
  });
}

/**
 * Handle keyboard events for accessibility
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleKeyboardEvents(event) {
  // ESC key closes the detail panel
  if (event.key === 'Escape' && domElements.detailPanel &&
      !domElements.detailPanel.classList.contains('hidden')) {
    closeCardDetails();
  }
}

/**
 * Handle window resize events
 */
function handleWindowResize() {
  // Recalculate heights for all active section contents to ensure they display properly
  document.querySelectorAll('.section-content.active').forEach(content => {
    // Reset max-height to ensure all content is visible after resize
    content.style.maxHeight = '9999px';
  });
}

/**
 * Create mystical star background
 * Optimized to create a more visually appealing starry background
 */
function createStars() {
  if (!domElements.starsContainer) return;

  const numStars = 120; // Increased number of stars for a more immersive experience
  // Use document fragment for better performance when adding multiple elements
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < numStars; i++) {
    const star = document.createElement('div');
    star.className = 'absolute rounded-full animate-twinkle';

    // Random position
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    star.style.left = `${x}%`;
    star.style.top = `${y}%`;

    // Random size (1-3px) with more variation
    const size = 0.8 + Math.random() * 2.2;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;

    // Random animation delay for twinkling effect
    const delay = Math.random() * 5;
    star.style.animationDelay = `${delay}s`;

    // Random animation duration for more natural twinkling
    const duration = 3 + Math.random() * 3;
    star.style.animationDuration = `${duration}s`;

    // Add a subtle gold tint to some stars
    if (Math.random() > 0.7) {
      star.style.backgroundColor = '#F1E5AC';
    } else if (Math.random() > 0.9) {
      // Add a few brighter stars
      star.style.backgroundColor = '#FFFFFF';
      star.style.boxShadow = '0 0 3px rgba(255, 255, 255, 0.8)';
    } else {
      star.style.backgroundColor = '#FFFFFF';
    }

    fragment.appendChild(star);
  }

  // Add all stars to the container at once (more efficient)
  domElements.starsContainer.appendChild(fragment);
}

/**
 * Main function to draw cards for the Celtic Cross spread
 */
function drawCards() {
  // Validate we have enough cards and aren't already drawing
  if (tarotData.length < 10 || isDrawing) return;

  isDrawing = true;

  // Update UI for drawing state
  if (domElements.drawButton) {
    domElements.drawButton.disabled = true;
    domElements.drawButton.classList.add('opacity-50', 'cursor-not-allowed');
  }

  if (domElements.loadingIndicator) {
    domElements.loadingIndicator.classList.remove('hidden');
  }

  if (domElements.deckContainer) {
    domElements.deckContainer.classList.add('animate-pulse');
  }

  // Play shuffle sound effects
  if (soundEnabled && playCardFlipSound) {
    // Play multiple card flip sounds with slight delay to simulate shuffling
    playShuffleSound(5);
  }

  // Select and shuffle 10 random cards
  const shuffled = [...tarotData].sort(() => 0.5 - Math.random());
  const selectedCards = shuffled.slice(0, 10);

  // Clear the display container
  if (domElements.displayContainer) {
    domElements.displayContainer.innerHTML = '';
  }

  // Show reset button
  if (domElements.resetButton) {
    domElements.resetButton.classList.remove('hidden');
  }

  // Define the drawing sequence and start index
  const drawSequence = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  let currentDrawIndex = 0;

  // Start drawing cards with a delay
  setTimeout(() => {
    drawNextInSequence();
  }, 800);

  /**
   * Draw the next card in sequence
   */
  function drawNextInSequence() {
    if (currentDrawIndex >= drawSequence.length) {
      // All cards have been drawn, reset the drawing state
      isDrawing = false;

      if (domElements.drawButton) {
        domElements.drawButton.disabled = false;
        domElements.drawButton.classList.remove('opacity-50', 'cursor-not-allowed');
      }

      if (domElements.loadingIndicator) {
        domElements.loadingIndicator.classList.add('hidden');
      }

      if (domElements.deckContainer) {
        domElements.deckContainer.classList.remove('animate-pulse');
      }

      return;
    }

    const cardIndex = drawSequence[currentDrawIndex];
    currentDrawIndex++;
    drawNextCard(cardIndex);
  }

  /**
   * Draw a specific card at the given index
   * @param {number} index - The index of the card to draw
   */
  function drawNextCard(index) {
    // Make sure the index is valid
    if (index < 0 || index >= selectedCards.length) {
      console.error('Invalid card index:', index);
      return;
    }

    // Get card data
    const card = selectedCards[index];
    const isReversed = Math.random() < 0.5;
    const meaning = isReversed ? card.reversed_meanings.general : card.upright_meanings.general;

    // Get image path
    const imageName = getImageFileName(card);
    const extension = imageName === 'TheLovers' ? 'jpg' : 'jpeg';
    const imageSrc = `image/${imageName}.${extension}`;

    // Get position data
    const position = spreadPositions[index];

    // Create card container with Tailwind classes
    const cardContainer = document.createElement('div');
    cardContainer.className = 'absolute w-[110px] h-[180px] md:w-[130px] md:h-[210px] rounded-xl shadow-card transition-all duration-500 tarot-position group hover:shadow-gold-glow cursor-pointer';
    cardContainer.style.top = position.top;
    cardContainer.style.left = position.left;

    // Apply position-specific styling using data attributes for CSS
    // This allows CSS to handle the styling instead of inline styles

    // Set z-index if specified
    if (position.zIndex) {
      cardContainer.style.zIndex = position.zIndex;
    }

    // Handle vertical offset
    if (position.offsetY) {
      cardContainer.dataset.offsetY = position.offsetY;
      cardContainer.style.setProperty('--offset-y', position.offsetY);
    }

    // Handle rotation
    if (position.rotate) {
      cardContainer.dataset.rotation = position.rotate;
      cardContainer.style.setProperty('--rotation', position.rotate);
    }

    // Special handling for Challenge card
    if (position.isChallenge) {
      cardContainer.classList.add('challenge-card');
      // Ensure the Challenge card is properly positioned on top of the first card
      cardContainer.style.top = spreadPositions[0].top;
      cardContainer.style.left = spreadPositions[0].left;
      cardContainer.style.zIndex = '11';
    }

    // Create card elements using helper function
    const { cardEl, cardFront, positionLabelEl } = createCardElements(card, isReversed, imageSrc, position.label);

    // Add click event to show card details in the side panel and animate the card
    cardContainer.addEventListener('click', () => {
      // Remove selected class from all cards first
      document.querySelectorAll('.tarot-position').forEach(card => {
        card.classList.remove('card-selected');
      });

      // Add selected class to this card to trigger the animation
      cardContainer.classList.add('card-selected');

      // Play flip sound for the animation
      if (soundEnabled && playCardFlipSound) {
        playCardFlipSound();
      }

      // Show card details in the side panel
      showCardDetails(card, isReversed, meaning, imageSrc, position.label);
    });

    // Append card and position label to container
    cardContainer.appendChild(positionLabelEl);
    cardContainer.appendChild(cardEl);

    // Add a subtle indicator that the card is clickable with Tailwind classes
    const clickIndicator = document.createElement('div');
    clickIndicator.className = 'absolute top-2 right-2 w-5 h-5 rounded-full bg-gold/30 text-white/80 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20';
    clickIndicator.innerHTML = '<i class="fas fa-info-circle"></i>';
    cardContainer.appendChild(clickIndicator);

    // Append to display
    if (domElements.displayContainer) {
      domElements.displayContainer.appendChild(cardContainer);
    }

    // If this is the first card, also show the detail panel with its information
    if (index === 0) {
      setTimeout(() => {
        showCardDetails(card, isReversed, meaning, imageSrc, position.label);
      }, 1500);
    }

    // Animate the card entrance
    setTimeout(() => {
      cardEl.classList.remove('card-enter');
      cardEl.classList.add('card-enter-active');

      // Flip the card after a short delay
      setTimeout(() => {
        // Play flip sound and flip the card
        if (soundEnabled && playCardFlipSound) {
          playCardFlipSound();
        }

        // Add flipped class to both elements
        cardEl.classList.add('flipped');
        cardContainer.classList.add('flipped');

        // Special handling for the Challenge card when flipped
        if (position.isChallenge) {
          // Set the transform for the card element (just the flip, not the rotation)
          cardEl.style.transform = 'rotateY(180deg)';

          // Get the card image and update its class for proper orientation
          const cardImage = cardFront.querySelector('.card-image');
          if (cardImage) {
            // Let CSS handle the rotation and visual effects
            cardImage.classList.add('challenge');
          }

          // Update the name label class for proper positioning
          const nameLabel = cardFront.querySelector('.card-name-label');
          if (nameLabel) {
            nameLabel.classList.add('challenge');
          }

          // Ensure the card container has the correct z-index
          cardContainer.style.zIndex = '11';

          // Add reversed class if needed for CSS styling
          if (isReversed) {
            cardContainer.classList.add('reversed-challenge');
          }
        }

        // Draw the next card after this one is flipped
        setTimeout(drawNextInSequence, 300);
      }, 500);
    }, 50);
  }
}

/**
 * Convert card name to image filename
 * For example: "Ace of Cups" => "aceofcups"
 * @param {Object} card - The tarot card object
 * @returns {string} - The image filename without extension
 */
function getImageFileName(card) {
  // Get the base name from card properties
  const baseName = (card.name || card.name_short || "").toLowerCase().replace(/\s+/g, '');

  // Special case mapping for major arcana and other cards
  // Optimized to handle both with and without 'the' prefix in a single map
  const specialCases = {
    // Major Arcana with 'the' prefix
    'thelastjudgment': 'judgement',
    'thefool': 'thefool',
    'themagician': 'themagician',
    'thehighpriestess': 'thehighpriestess',
    'theempress': 'theempress',
    'theemperor': 'theemperor',
    'thehierophant': 'thehierophant',
    'thelovers': 'TheLovers', // Note: this one has .jpg extension instead of .jpeg
    'thechariot': 'thechariot',
    'thestrength': 'thestrength',
    'thehermit': 'thehermit',
    'wheeloffortune': 'wheeloffortune',
    'justice': 'justice',
    'thehangedman': 'thehangedman',
    'death': 'death',
    'temperance': 'temperance',
    'thedevil': 'thedevil',
    'thetower': 'thetower',
    'thestar': 'thestar',
    'themoon': 'themoon',
    'thesun': 'thesun',
    'judgement': 'judgement',
    'theworld': 'theworld',

    // Variations without 'the' prefix
    'fool': 'thefool',
    'magician': 'themagician',
    'highpriestess': 'thehighpriestess',
    'empress': 'theempress',
    'emperor': 'theemperor',
    'hierophant': 'thehierophant',
    'lovers': 'TheLovers',
    'chariot': 'thechariot',
    'strength': 'thestrength',
    'hermit': 'thehermit',
    'hangedman': 'thehangedman',
    'devil': 'thedevil',
    'tower': 'thetower',
    'star': 'thestar',
    'moon': 'themoon',
    'sun': 'thesun',
    'world': 'theworld',
    'lastjudgment': 'judgement'
  };

  // Check for direct match in special cases first
  if (specialCases[baseName]) {
    return specialCases[baseName];
  }

  // Handle "The" prefix by checking without it
  if (baseName.startsWith('the')) {
    const withoutThe = baseName.substring(3); // Remove 'the' prefix
    if (specialCases[withoutThe]) {
      return specialCases[withoutThe];
    }
    return withoutThe; // Return without 'the' if no special case
  }

  return baseName;
}

/**
 * Create card elements (front, back, image, label)
 * @param {Object} card - The tarot card object
 * @param {boolean} isReversed - Whether the card is reversed
 * @param {string} imageSrc - Path to the card image
 * @param {string} positionLabel - The position label in the spread
 * @returns {Object} - Object containing card elements
 */
function createCardElements(card, isReversed, imageSrc, positionLabel) {
  // Add position label with Tailwind classes
  const positionLabelEl = document.createElement('div');
  positionLabelEl.className = 'absolute -bottom-14 left-1/2 transform -translate-x-1/2 bg-mystic-purple/80 text-light-gold px-2 py-1 rounded text-xs md:text-sm whitespace-nowrap backdrop-blur-sm border border-gold/30';
  positionLabelEl.textContent = positionLabel;

  // Create the card element that will flip with Tailwind classes
  const cardEl = document.createElement('div');
  cardEl.className = 'relative w-full h-full transition-transform duration-800 transform-style-preserve-3d card card-enter';

  // Create card back (initially visible) with Tailwind classes
  const cardBack = document.createElement('div');
  cardBack.className = 'absolute inset-0 backface-hidden flex items-center justify-center rounded-xl border-2 border-gold/60 bg-gradient-to-br from-mystic-purple to-deep-purple shadow-lg';
  cardBack.innerHTML = '<div class="text-4xl">🔮</div>';

  // Create card front (initially hidden, will be revealed on flip) with Tailwind classes
  const cardFront = document.createElement('div');
  cardFront.className = 'absolute inset-0 backface-hidden rounded-xl border-2 border-gold/60 bg-gradient-to-br from-deep-purple/90 to-midnight-blue/90 shadow-lg transform rotate-y-180';

  // Create and append image container with Tailwind classes
  const imageContainer = document.createElement('div');
  imageContainer.className = 'flex items-center justify-center w-full h-[85%] p-2';

  // Create and append image with Tailwind classes
  const img = document.createElement('img');
  img.src = imageSrc;
  img.alt = card.name;
  img.className = `w-full h-full object-contain transition-transform duration-500 ${isReversed ? 'reversed' : ''}`;
  img.setAttribute('loading', 'eager');

  img.onerror = function() {
    this.onerror = null;
    this.src = createFallbackCardImage(card.name);
  };

  // Create and append name label with Tailwind classes
  const nameLabel = document.createElement('div');
  nameLabel.className = `absolute bottom-1 left-0 right-0 text-center text-xs md:text-sm text-light-gold font-cinzel px-1 truncate ${isReversed ? 'reversed' : ''}`;
  nameLabel.textContent = card.name;

  // Append elements to card front
  imageContainer.appendChild(img);
  cardFront.appendChild(imageContainer);
  cardFront.appendChild(nameLabel);

  // Append back and front to the card
  cardEl.appendChild(cardBack);
  cardEl.appendChild(cardFront);

  return { cardEl, cardFront, positionLabelEl, img, nameLabel };
}

/**
 * Play multiple card flip sounds with delay to simulate shuffling
 * @param {number} count - Number of sounds to play
 */
function playShuffleSound(count) {
  if (!soundEnabled || !playCardFlipSound) return;

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      playCardFlipSound();
    }, i * 150);
  }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);
