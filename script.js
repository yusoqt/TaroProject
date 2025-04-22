/**
 * Tarot Card Reading Application
 * A mystical tarot card reading experience with Celtic Cross spread
 */

// Application state
let tarotData = [];
let isDrawing = false;
let soundEnabled = true;
let isDarkTheme = true;

// DOM element cache for frequently accessed elements
const domElements = {};

// Initialize card flip sound using Web Audio API
let playCardFlipSound = window.createCardFlipSound ? window.createCardFlipSound() : null;

// Define the positions for the 10-card Celtic Cross spread
// Standard Celtic Cross layout with improved spacing and positioning
// Increased vertical spacing between cards for better readability
const spreadPositions = [
  { top: '40%', left: '30%', zIndex: 10, label: '1. Present' },           // Center/Present
  { top: '40%', left: '30%', rotate: '90deg', zIndex: 11, label: '2. Challenge', isChallenge: true, offsetY: '-5px' },  // Crossing card - positioned on top of Present card
  { top: '85%', left: '30%', zIndex: 3, label: '3. Foundation' },        // Below (moved even further down for more spacing)
  { top: '0%', left: '30%', zIndex: 3, label: '4. Crown' },              // Above (moved to top)
  { top: '40%', left: '5%', zIndex: 3, label: '5. Past' },               // Left (moved further left)
  { top: '40%', left: '55%', zIndex: 3, label: '6. Future' },            // Right (moved further right)
  { top: '95%', left: '75%', zIndex: 4, label: '7. Advice' },            // Bottom of staff (moved even further down for more spacing)
  { top: '65%', left: '75%', zIndex: 5, label: '8. External' },          // Second from bottom (increased vertical spacing)
  { top: '35%', left: '75%', zIndex: 6, label: '9. Hopes/Fears' },       // Third from bottom (increased vertical spacing)
  { top: '5%', left: '75%', zIndex: 7, label: '10. Outcome' }            // Top of staff (moved slightly down from top for better visibility)
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
  domElements.themeButton = document.getElementById('themeToggle');
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
  domElements.cardMeaning = document.getElementById('detailCardMeaning');

  // Background elements
  domElements.starsContainer = document.getElementById('starsContainer');
}

/**
 * Load tarot card data from JSON file
 */
function loadTarotData() {
  fetch('tarot.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      tarotData = data.cards;
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
 * Toggle between dark and light theme
 */
function toggleTheme() {
  isDarkTheme = !isDarkTheme;
  document.body.classList.toggle('light-theme');

  if (domElements.themeButton) {
    domElements.themeButton.innerHTML = isDarkTheme ?
      '<i class="fas fa-moon"></i>' :
      '<i class="fas fa-sun"></i>';

    // Add aria-label for accessibility
    domElements.themeButton.setAttribute('aria-label',
      isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme');
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

  // Reset drawing state and recreate the deck
  isDrawing = false;
  createDeck();
}

/**
 * Show card details in the side panel
 * @param {Object} card - The tarot card object
 * @param {boolean} isReversed - Whether the card is reversed
 * @param {string} meaning - The card meaning (upright or reversed)
 * @param {string} imageSrc - Path to the card image
 * @param {string} positionLabel - The position label in the spread
 */
function showCardDetails(card, isReversed, meaning, imageSrc, positionLabel) {
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

  if (domElements.cardDesc) {
    domElements.cardDesc.textContent = card.desc || 'No description available';
  }

  if (domElements.cardMeaning) {
    domElements.cardMeaning.textContent = meaning || 'No meaning available';
  }

  // Show the panel with a fade-in effect
  domElements.detailPanel.classList.remove('hidden');
  domElements.detailPanel.classList.add('fade-in');
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

  // Wait for animation to complete before hiding
  setTimeout(() => {
    domElements.detailPanel.classList.remove('fade-in', 'fade-out');
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

  // Theme toggle
  if (domElements.themeButton) {
    domElements.themeButton.addEventListener('click', toggleTheme);
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
  // Could implement responsive adjustments here if needed
  // Currently the CSS handles most of the responsive behavior
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
    star.className = 'star';

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
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        playCardFlipSound();
      }, i * 150);
    }
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

    const card = selectedCards[index];
    const isReversed = Math.random() < 0.5;
    const meaning = isReversed ? card.meaning_rev : card.meaning_up;

    // Get image file name and path
    const imageName = getImageFileName(card);
    const extension = imageName === 'TheLovers' ? 'jpg' : 'jpeg';
    const imageSrc = `image/${imageName}.${extension}`;

    // Get position for this card
    const position = spreadPositions[index];

    // Create card container with 3D perspective
    const cardContainer = document.createElement('div');
    cardContainer.className = 'card-container tarot-position';
    cardContainer.style.top = position.top;
    cardContainer.style.left = position.left;

    // Apply position-specific styling
    if (position.offsetY) {
      cardContainer.style.transform = `translateY(${position.offsetY})`;
      cardContainer.dataset.offsetY = position.offsetY;
      cardContainer.style.setProperty('--offset-y', position.offsetY);
    }

    if (position.zIndex) {
      cardContainer.style.zIndex = position.zIndex;
    }

    // Store rotation information as a data attribute and CSS variable
    if (position.rotate) {
      cardContainer.dataset.rotation = position.rotate;
      cardContainer.style.setProperty('--rotation', position.rotate);

      // Add a special class for the Challenge card
      if (position.isChallenge) {
        cardContainer.classList.add('challenge-card');
        // Ensure the Challenge card is properly positioned on top of the first card
        cardContainer.style.top = spreadPositions[0].top;
        cardContainer.style.left = spreadPositions[0].left;
        // Set z-index to ensure it's above the first card
        cardContainer.style.zIndex = '11';

        // Apply specific styling for the Challenge card container
        cardContainer.style.transformOrigin = 'center center';
        cardContainer.style.transformStyle = 'preserve-3d';
      }
    }

    // Add position label
    const positionLabel = document.createElement('div');
    positionLabel.className = 'position-label';
    positionLabel.textContent = position.label;
    cardContainer.appendChild(positionLabel);

    // Create the card element that will flip
    const cardEl = document.createElement('div');
    cardEl.className = 'card card-enter';

    // Create card back (initially visible)
    const cardBack = document.createElement('div');
    cardBack.className = 'card-back';
    cardBack.innerHTML = '<div class="text-4xl">🔮</div>';

    // Create card front (initially hidden, will be revealed on flip)
    const cardFront = document.createElement('div');
    cardFront.className = 'card-front';

    // Add card image to front with fallback
    cardFront.innerHTML = `
      <div class="card-image-container full-height">
        <img
          src="${imageSrc}"
          alt="${card.name}"
          class="card-image ${isReversed ? 'reversed' : ''}"
          loading="eager"
          onerror="this.onerror=null; this.src='${createFallbackCardImage(card.name)}';"
        />
      </div>
    `;

    // Add click event to show card details in the side panel
    cardContainer.addEventListener('click', () => {
      showCardDetails(card, isReversed, meaning, imageSrc, position.label);
    });

    // Append back and front to the card
    cardEl.appendChild(cardBack);
    cardEl.appendChild(cardFront);

    // Append card to container
    cardContainer.appendChild(cardEl);

    // Add a subtle indicator that the card is clickable
    const clickIndicator = document.createElement('div');
    clickIndicator.className = 'click-indicator';
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
        // Play flip sound
        if (soundEnabled && playCardFlipSound) {
          playCardFlipSound();
        }

        cardEl.classList.add('flipped');
        cardContainer.classList.add('flipped');

        // Ensure Challenge card maintains its rotation when flipped
        if (position.isChallenge) {
          // Set the transform directly on the card element
          cardEl.style.transform = 'rotateY(180deg) rotate(90deg)';

          // Get the card image and adjust its rotation to be horizontal
          const cardImage = cardFront.querySelector('.card-image');
          if (cardImage) {
            if (isReversed) {
              cardImage.style.transform = 'rotate(270deg)';
            } else {
              cardImage.style.transform = 'rotate(90deg)';
            }
          }

          // Ensure the card front also has the correct transform
          cardFront.style.transform = 'rotateY(180deg) rotate(90deg)';

          // Make sure the card container has the correct z-index
          cardContainer.style.zIndex = '11';
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

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);
