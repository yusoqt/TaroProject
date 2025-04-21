let tarotData = [];
let isDrawing = false;
let soundEnabled = true;

// Initialize card flip sound using Web Audio API
let playCardFlipSound = window.createCardFlipSound ? window.createCardFlipSound() : null;

// Define the positions for the 10-card Celtic Cross spread
const spreadPositions = [
  { top: '40%', left: '30%', zIndex: 1, label: '1. Present' },           // Center/Present
  { top: '40%', left: '30%', rotate: '90deg', zIndex: 2, label: '2. Challenge', isChallenge: true },  // Crossing
  { top: '65%', left: '30%', zIndex: 3, label: '3. Foundation' },        // Below
  { top: '15%', left: '30%', zIndex: 3, label: '4. Crown' },             // Above
  { top: '40%', left: '12%', zIndex: 3, label: '5. Past' },              // Left
  { top: '40%', left: '48%', zIndex: 3, label: '6. Future' },            // Right
  { top: '66%', left: '70%', zIndex: 4, label: '7. Advice' },            // Bottom of staff (drawn first)
  { top: '49%', left: '70%', zIndex: 5, label: '8. External' },          // Second from bottom
  { top: '32%', left: '70%', zIndex: 6, label: '9. Hopes/Fears' },       // Third from bottom
  { top: '15%', left: '70%', zIndex: 7, label: '10. Outcome' }           // Top of staff (drawn last)
];

// Create deck visualization
function createDeck() {
  const deckContainer = document.getElementById('deckContainer');
  deckContainer.innerHTML = '';

  // Create 7 cards for the deck visual (more cards for a fuller deck appearance)
  for (let i = 0; i < 7; i++) {
    const deckCard = document.createElement('div');
    deckCard.className = 'deck-card';
    deckCard.style.transform = `translateX(${i * 2}px) translateY(${i * 2}px) rotate(${i - 3}deg)`;

    // Add a more mystical symbol to the card back
    const symbols = ['✧', '☽', '☀', '⚝', '⚹', '✵', '⚘'];
    const symbol = symbols[i % symbols.length];

    deckCard.innerHTML = `<div class="text-gold text-center text-3xl opacity-40">${symbol}</div>`;
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

fetch('tarot.json')
  .then(response => response.json())
  .then(data => {
    tarotData = data.cards;
    createDeck();
    createStars(); // Create the mystical star background
  });

// Toggle sound function
function toggleSound() {
  soundEnabled = !soundEnabled;
  const soundButton = document.getElementById('soundToggle');
  if (soundButton) {
    soundButton.innerHTML = soundEnabled ? '🔊' : '🔇';
  }
}

// Add sound toggle button
function addSoundToggle() {
  const container = document.querySelector('body');
  const soundButton = document.createElement('button');
  soundButton.id = 'soundToggle';
  soundButton.className = 'fixed top-4 right-4 bg-gradient-to-r from-mystic-purple to-deep-purple w-12 h-12 rounded-full flex items-center justify-center text-light-gold text-xl border border-gold/30 shadow-lg z-50 transition-all duration-300 hover:shadow-gold/20';
  soundButton.innerHTML = soundEnabled ? '🔊' : '🔇';
  soundButton.addEventListener('click', toggleSound);
  container.appendChild(soundButton);
}

// Create mystical star background
function createStars() {
  const starsContainer = document.getElementById('starsContainer');
  const numStars = 100;

  for (let i = 0; i < numStars; i++) {
    const star = document.createElement('div');
    star.className = 'star';

    // Random position
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    star.style.left = `${x}%`;
    star.style.top = `${y}%`;

    // Random size (1-3px)
    const size = 1 + Math.random() * 2;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;

    // Random animation delay
    const delay = Math.random() * 4;
    star.style.animationDelay = `${delay}s`;

    // Add a subtle gold tint to some stars
    if (Math.random() > 0.7) {
      star.style.backgroundColor = '#F1E5AC';
    }

    starsContainer.appendChild(star);
  }
}

// Call this after the DOM is loaded
addSoundToggle();

document.getElementById('drawTenBtn').addEventListener('click', () => {
  if (tarotData.length < 10 || isDrawing) return;

  isDrawing = true;
  const drawButton = document.getElementById('drawTenBtn');
  drawButton.disabled = true;
  drawButton.classList.add('opacity-50', 'cursor-not-allowed');

  // Play shuffle sound effect
  if (soundEnabled && playCardFlipSound) {
    // Play multiple card flip sounds with slight delay to simulate shuffling
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        playCardFlipSound();
      }, i * 150);
    }
  }

  // Add animation to the deck
  const deckContainer = document.getElementById('deckContainer');
  deckContainer.classList.add('animate-pulse');

  const shuffled = [...tarotData].sort(() => 0.5 - Math.random());
  const selectedCards = shuffled.slice(0, 10);

  const displayContainer = document.getElementById('tenCardDisplay');
  displayContainer.innerHTML = '';

  // Draw cards one by one with animation
  function drawNextCard(index) {
    // Make sure the index is valid
    if (index < 0 || index >= selectedCards.length) {
      console.error('Invalid card index:', index);
      return;
    }

    const card = selectedCards[index];
    const isReversed = Math.random() < 0.5;
    const meaning = isReversed ? card.meaning_rev : card.meaning_up;

    // 🔄 แปลงชื่อไพ่ให้เป็นชื่อไฟล์
    const imageName = getImageFileName(card);
    // Handle special case for The Lovers card which has .jpg extension
    const extension = imageName === 'TheLovers' ? 'jpg' : 'jpeg';
    const imageSrc = `/image/${imageName}.${extension}`;

    // Get position for this card
    const position = spreadPositions[index];

    // Create card container with 3D perspective
    const cardContainer = document.createElement('div');
    cardContainer.className = 'card-container tarot-position';
    cardContainer.style.top = position.top;
    cardContainer.style.left = position.left;
    if (position.zIndex) {
      cardContainer.style.zIndex = position.zIndex;
    }

    // Store rotation information as a data attribute and CSS variable
    // This will allow us to rotate only the card but not the tooltip
    if (position.rotate) {
      cardContainer.dataset.rotation = position.rotate;
      cardContainer.style.setProperty('--rotation', position.rotate);

      // Add a special class for the Challenge card
      if (position.isChallenge) {
        cardContainer.classList.add('challenge-card');
      }
    }

    // Add position label
    const positionLabel = document.createElement('div');
    positionLabel.className = 'position-label';
    positionLabel.textContent = position.label;
    cardContainer.appendChild(positionLabel);

    // Create the card element that will flip
    const cardEl = document.createElement('div');
    cardEl.className = 'card bg-white/10 p-4 rounded-lg border border-white/20 shadow-md text-center h-full card-enter';

    // Create card back (initially visible)
    const cardBack = document.createElement('div');
    cardBack.className = 'card-back rounded-lg';
    cardBack.innerHTML = '<div class="text-white text-4xl">🔮</div>';

    // Create card front (initially hidden, will be revealed on flip)
    const cardFront = document.createElement('div');
    cardFront.className = 'card-front p-4 rounded-lg';

    // Create tooltip for detailed meaning
    const tooltip = document.createElement('div');
    tooltip.className = 'card-tooltip';
    // Add a specific class for rotated cards to handle them specially
    if (position.rotate) {
      tooltip.classList.add('tooltip-for-rotated-card');
    }
    tooltip.innerHTML = `
      <h3 class="text-base font-cinzel font-semibold mb-1 text-light-gold">${card.name} ${isReversed ? "(Reversed)" : ""}</h3>
      <p class="text-sm mb-2">${card.desc || ''}</p>
      <p class="text-sm italic">${meaning}</p>
    `;

    // Position the tooltip based on the card's position in the spread
    // Position tooltips to avoid overlap with other cards
    if (index < 6) { // Cross positions
      if (index === 1) { // Challenge card (rotated 90 degrees)
        tooltip.style.left = '-180px'; // Move further to the left to avoid overlap
        tooltip.style.top = '0';
        tooltip.classList.add('challenge-tooltip'); // Add special class for styling
      } else if (index === 3) { // Crown position (already at top)
        tooltip.style.left = '0';
        tooltip.style.bottom = '-220px'; // Show below for top card
      } else {
        tooltip.style.left = '0';
        tooltip.style.top = '-220px'; // Show above the card
      }
    } else { // Staff positions - customize each position to prevent overlap
      switch(index) {
        case 6: // Bottom of staff (7. Advice)
          tooltip.style.left = '-240px'; // Show to the left
          tooltip.style.top = '0';
          break;
        case 7: // Second from bottom (8. External)
          tooltip.style.right = '-240px'; // Show to the right
          tooltip.style.top = '0';
          tooltip.style.left = 'auto';
          break;
        case 8: // Third from bottom (9. Hopes/Fears)
          tooltip.style.left = '-240px'; // Show to the left
          tooltip.style.top = '0';
          break;
        case 9: // Top of staff (10. Outcome)
          tooltip.style.right = '-240px'; // Show to the right
          tooltip.style.top = '0';
          tooltip.style.left = 'auto';
          break;
      }
    }

    cardFront.innerHTML = `
      <img src="${imageSrc}" alt="${card.name}" class="mx-auto mb-3 rounded-lg shadow-md max-h-40 object-contain ${isReversed ? 'transform rotate-180' : ''}" />
      <h2 class="text-base font-cinzel font-semibold mb-1 text-light-gold">${card.name} ${isReversed ? "(Reversed)" : ""}</h2>
      <p class="text-purple-200 italic mb-1 text-sm">${meaning.length > 60 ? meaning.substring(0, 60) + '...' : meaning}</p>
    `;

    // Append back and front to the card
    cardEl.appendChild(cardBack);
    cardEl.appendChild(cardFront);

    // Append card to container
    cardContainer.appendChild(cardEl);

    // Append tooltip to container
    cardContainer.appendChild(tooltip);

    // Append to display
    displayContainer.appendChild(cardContainer);

    // Trigger entrance animation
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

        // Draw the next card after this one is flipped
        setTimeout(() => {
          drawNextInSequence();
        }, 300);
      }, 500);
    }, 50);
  }

  // Reorder the drawing sequence for positions 7-10 (bottom to top)
  // Cards 7, 8, 9, and 10 in the tarot spread should be revealed from bottom to top
  const drawSequence = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  let currentDrawIndex = 0;

  // Modified draw function to use our custom sequence
  function drawNextInSequence() {
    if (currentDrawIndex >= drawSequence.length) {
      // All cards have been drawn, reset the drawing state
      isDrawing = false;
      drawButton.disabled = false;
      drawButton.classList.remove('opacity-50', 'cursor-not-allowed');
      deckContainer.classList.remove('animate-pulse');
      return;
    }

    const cardIndex = drawSequence[currentDrawIndex];
    currentDrawIndex++;
    drawNextCard(cardIndex);
  }

  // Start drawing cards
  setTimeout(() => {
    drawNextInSequence();
  }, 800); // Initial delay before starting to draw cards
});

// 🧠 แปลงชื่อไพ่เป็นชื่อไฟล์ เช่น "Ace of Cups" => "aceofcups"
function getImageFileName(card) {
  let baseName = (card.name || card.name_short || "").toLowerCase().replace(/\s+/g, '');

  // Special case mapping for major arcana cards
  const specialCases = {
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
    'theworld': 'theworld'
  };

  // Handle "The" prefix consistently
  if (baseName.startsWith('the')) {
    const withoutThe = baseName.substring(3); // Remove 'the' prefix
    // Check if we have a special case for this card with or without 'the'
    if (specialCases[baseName]) {
      return specialCases[baseName];
    } else if (specialCases[withoutThe]) {
      return specialCases[withoutThe];
    }
    baseName = withoutThe;
  }

  // Check for special cases
  if (specialCases[baseName]) {
    return specialCases[baseName];
  }

  return baseName;
}
