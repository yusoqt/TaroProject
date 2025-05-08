/**
 * Tarot Reading Summary Integration
 *
 * This file provides functionality to request and display a summarized tarot reading
 * using the Gemini API through a backend service.
 *
 * @version 1.1.0
 * @author Tarot Project Team
 */

// Store the current reading data
let currentReadingCards = [];

// Debug mode flag - set to true for troubleshooting
const DEBUG = true;

/**
 * Custom logger function that only logs in debug mode
 * @param {string} message - The message to log
 * @param {any} data - Optional data to log
 */
function debugLog(message, data) {
  if (!DEBUG) return;

  if (data) {
    console.log(`[Tarot Summary] ${message}`, data);
  } else {
    console.log(`[Tarot Summary] ${message}`);
  }
}

/**
 * Initialize the tarot summary functionality
 */
function initTarotSummary() {
  debugLog('Initializing tarot summary functionality');

  let summaryElementsCreated = false;

  // Create the summary button immediately instead of lazily
  createSummaryButton();
  summaryElementsCreated = true;
  debugLog('Summary elements created on initialization');

  function lazyCreateSummaryElements() {
    if (summaryElementsCreated) {
      debugLog('Summary elements already created, showing button');
      showSummaryButton();
      return;
    }

    createSummaryButton();
    summaryElementsCreated = true;
    debugLog('Summary elements created lazily');
    showSummaryButton();
  }

  document.addEventListener('click', function(event) {
    const resetBtn = event.target.closest('#resetBtn');
    if (resetBtn) {
      currentReadingCards = [];
      hideSummaryPanel();
      debugLog('Reading data cleared');
    }
  }, { passive: true });

  document.addEventListener('click', function(event) {
    const cardElement = event.target.closest('.tarot-position');
    if (cardElement && !summaryElementsCreated) {
      debugLog('Card clicked, creating summary elements');
      requestAnimationFrame(lazyCreateSummaryElements);
    }
  }, { passive: true });

  document.addEventListener('allCardsDrawn', function(event) {
    debugLog('All cards drawn event received, showing summary button');
    requestAnimationFrame(() => {
      showSummaryButton();
    });
  }, { passive: true });
}

/**
 * Create and add the summary button to the UI
 */
function createSummaryButton() {
  debugLog('Creating summary button');

  // Check if button already exists to avoid duplicates
  if (document.getElementById('summaryBtn')) {
    debugLog('Summary button already exists, not creating a duplicate');
    return;
  }

  // Create the button container
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'flex justify-center mt-6';
  buttonContainer.id = 'summaryBtnContainer';

  // Create the summary button - note we're not adding 'hidden' class initially
  const summaryButton = document.createElement('button');
  summaryButton.id = 'summaryBtn';
  summaryButton.className = 'px-6 py-3 bg-gradient-to-br from-mystic-purple via-deep-purple to-midnight-blue text-light-gold rounded-xl shadow-xl hover:shadow-gold-glow transition-all duration-500 font-cinzel text-lg flex items-center justify-center relative overflow-hidden group transform hover:-translate-y-1';
  summaryButton.style.display = 'flex'; // Explicitly set display style

  // Create button inner HTML with decorative elements
  summaryButton.innerHTML = `
    <!-- Animated background effect -->
    <div class="absolute inset-0 bg-gradient-to-r from-gold/10 to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

    <!-- Decorative elements -->
    <div class="absolute top-0 left-0 w-3 h-3 border-t border-l border-gold/40 rounded-tl-md"></div>
    <div class="absolute top-0 right-0 w-3 h-3 border-t border-r border-gold/40 rounded-tr-md"></div>
    <div class="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-gold/40 rounded-bl-md"></div>
    <div class="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-gold/40 rounded-br-md"></div>

    <!-- Icon with animation -->
    <div class="mr-2 relative">
      <i class="fas fa-scroll text-gold text-sm group-hover:text-light-gold transition-colors duration-300"></i>
      <span class="absolute -top-1 -right-1 w-1.5 h-1.5 bg-gold/50 rounded-full opacity-0 group-hover:opacity-100 animate-pulse"></span>
    </div>

    <!-- Text with subtle animation -->
    <span class="relative z-10 group-hover:tracking-wider transition-all duration-300 text-base">สรุปคำทำนาย</span>
  `;

  // Add click event to request a reading summary
  summaryButton.addEventListener('click', requestReadingSummary);

  // Add the button to the container
  buttonContainer.appendChild(summaryButton);

  // Try multiple insertion strategies to ensure the button is added to the DOM
  let buttonAdded = false;

  // Strategy 1: Add after reset button (preferred location)
  const resetButton = document.getElementById('resetBtn');
  if (resetButton && resetButton.parentNode) {
    debugLog('Adding summary button after reset button');
    resetButton.parentNode.insertBefore(buttonContainer, resetButton.nextSibling);
    buttonAdded = true;
  }

  // Strategy 2: Add to the main container
  if (!buttonAdded) {
    const mainContainer = document.querySelector('.container');
    if (mainContainer) {
      debugLog('Adding summary button to main container');
      mainContainer.appendChild(buttonContainer);
      buttonAdded = true;
    }
  }

  // Strategy 3: Add to the flex container that contains the reset button
  if (!buttonAdded) {
    const flexContainer = document.querySelector('.flex.justify-center.mb-12.mt-10');
    if (flexContainer) {
      debugLog('Adding summary button to flex container');
      flexContainer.appendChild(buttonContainer);
      buttonAdded = true;
    }
  }

  // Strategy 4: Last resort - add to body
  if (!buttonAdded) {
    debugLog('Adding summary button to body as last resort');
    document.body.appendChild(buttonContainer);
    buttonAdded = true;
  }

  debugLog(`Summary button created and added to DOM: ${buttonAdded}`);

  // Force the button to be visible for testing
  if (DEBUG) {
    setTimeout(() => {
      const btn = document.getElementById('summaryBtn');
      if (btn) {
        debugLog('DEBUG: Making summary button visible for testing');
        btn.classList.remove('hidden');
        btn.style.display = 'flex';
      }
    }, 5000);
  }
}

/**
 * Create the summary panel to display the reading
 */
function createSummaryPanel() {
  // Check if the panel already exists
  if (document.getElementById('summaryPanel')) {
    return;
  }

  // Create the panel container
  const summaryPanel = document.createElement('div');
  summaryPanel.id = 'summaryPanel';
  summaryPanel.className = 'hidden w-full max-w-4xl mx-auto mt-8 bg-gradient-to-b from-deep-purple/90 to-midnight-blue/90 backdrop-blur-md rounded-xl border border-gold/30 shadow-2xl overflow-hidden transition-all duration-500 ease-in-out transform scale-100 opacity-100';

  // Add decorative corner elements
  const cornerElements = `
    <div class="absolute top-3 left-3 w-12 h-12 border-t border-l border-gold/30 rounded-tl-lg pointer-events-none"></div>
    <div class="absolute top-3 right-3 w-12 h-12 border-t border-r border-gold/30 rounded-tr-lg pointer-events-none"></div>
    <div class="absolute bottom-3 left-3 w-12 h-12 border-b border-l border-gold/30 rounded-bl-lg pointer-events-none"></div>
    <div class="absolute bottom-3 right-3 w-12 h-12 border-b border-r border-gold/30 rounded-br-lg pointer-events-none"></div>
  `;

  // Create a div for the corner elements
  const cornersDiv = document.createElement('div');
  cornersDiv.className = 'absolute inset-0 pointer-events-none';
  cornersDiv.innerHTML = cornerElements;
  summaryPanel.appendChild(cornersDiv);

  // Create the panel header
  const panelHeader = document.createElement('div');
  panelHeader.className = 'relative flex justify-between items-center p-5 border-b border-gold/30 bg-gradient-to-r from-mystic-purple/40 via-deep-purple/20 to-mystic-purple/40';

  // Add the title with decorative elements
  const panelTitle = document.createElement('h2');
  panelTitle.className = 'text-2xl font-cinzel text-light-gold flex items-center';
  panelTitle.innerHTML = `
    <i class="fas fa-star mr-3 text-gold/80"></i>
    <span>คำทำนายโดยรวม</span>
    <div class="ml-4 h-[1px] w-16 bg-gradient-to-r from-gold/50 to-transparent"></div>
  `;
  panelHeader.appendChild(panelTitle);

  // Add close button with enhanced styling
  const closeButton = document.createElement('button');
  closeButton.className = 'w-8 h-8 rounded-full bg-mystic-purple/50 text-gold hover:text-light-gold hover:bg-mystic-purple/70 transition-all duration-300 flex items-center justify-center';
  closeButton.innerHTML = '<i class="fas fa-times"></i>';
  closeButton.addEventListener('click', hideSummaryPanel);
  panelHeader.appendChild(closeButton);

  // Add the panel content
  const panelContent = document.createElement('div');
  panelContent.className = 'p-6';

  // Add loading indicator with enhanced mystical styling
  const loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'summaryLoading';
  loadingIndicator.className = 'flex flex-col items-center justify-center py-12';
  loadingIndicator.innerHTML = `
    <div class="relative mb-8">
      <!-- Spinning wheel -->
      <div class="animate-spin-slow text-5xl text-gold">
        <i class="fas fa-dharmachakra"></i>
      </div>

      <!-- Decorative elements -->
      <div class="absolute -top-4 -left-4 w-2 h-2 bg-gold/60 rounded-full animate-pulse"></div>
      <div class="absolute -bottom-4 -right-4 w-2 h-2 bg-gold/60 rounded-full animate-pulse" style="animation-delay: 0.5s"></div>
      <div class="absolute top-1/2 -right-6 w-1 h-1 bg-gold/60 rounded-full animate-pulse" style="animation-delay: 1s"></div>
      <div class="absolute top-1/2 -left-6 w-1 h-1 bg-gold/60 rounded-full animate-pulse" style="animation-delay: 1.5s"></div>
    </div>

    <div class="text-center">
      <p class="text-light-gold/80 text-xl font-cinzel mb-2">กำลังวิเคราะห์ไพ่</p>
      <p class="text-gold/60 text-lg italic">หมอดูกำลังเรียบเรียงคำทำนาย...</p>
    </div>

    <!-- Decorative divider -->
    <div class="flex items-center justify-center w-full mt-6">
      <div class="h-[1px] w-16 bg-gradient-to-r from-transparent to-gold/30"></div>
      <div class="mx-4 text-gold/60 text-sm">✧</div>
      <div class="h-[1px] w-16 bg-gradient-to-l from-transparent to-gold/30"></div>
    </div>
  `;
  panelContent.appendChild(loadingIndicator);

  // Add the reading content container
  const readingContent = document.createElement('div');
  readingContent.id = 'summaryContent';
  readingContent.className = 'hidden text-white/90 leading-relaxed space-y-4 font-cormorant text-lg';
  panelContent.appendChild(readingContent);

  // Assemble the panel
  summaryPanel.appendChild(panelHeader);
  summaryPanel.appendChild(panelContent);

  // Add to the page
  const mainContainer = document.querySelector('.container');
  if (mainContainer) {
    mainContainer.appendChild(summaryPanel);
  } else {
    document.body.appendChild(summaryPanel);
  }
}

/**
 * Show the summary panel with loading state
 */
function showSummaryPanel() {
  createSummaryPanel();

  const summaryPanel = document.getElementById('summaryPanel');
  const loadingIndicator = document.getElementById('summaryLoading');
  const summaryContent = document.getElementById('summaryContent');

  if (summaryPanel) {
    // Reset the panel state
    if (loadingIndicator) loadingIndicator.classList.remove('hidden');
    if (summaryContent) summaryContent.classList.add('hidden');

    // Show the panel with animation
    summaryPanel.classList.remove('hidden');
    setTimeout(() => {
      summaryPanel.classList.add('fade-in');
    }, 10);

    // Scroll to the panel
    summaryPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/**
 * Hide the summary panel
 */
function hideSummaryPanel() {
  const summaryPanel = document.getElementById('summaryPanel');

  if (summaryPanel) {
    // Add fade-out animation
    summaryPanel.classList.add('fade-out');

    // Hide after animation completes
    setTimeout(() => {
      summaryPanel.classList.remove('fade-in', 'fade-out');
      summaryPanel.classList.add('hidden');
    }, 300);
  }
}

/**
 * Collect data about the current tarot reading
 * @returns {Array} Array of card objects with position, name, isReversed, and meaning
 */
function collectReadingData() {
  if (currentReadingCards.length === 10) {
    debugLog('Using cached reading data', currentReadingCards);
    return currentReadingCards;
  }

  const positions = [
    { label: '1. Present' },
    { label: '2. Challenge' },
    { label: '3. Foundation' },
    { label: '4. Crown' },
    { label: '5. Past' },
    { label: '6. Future' },
    { label: '7. Advice' },
    { label: '8. External' },
    { label: '9. Hopes/Fears' },
    { label: '10. Outcome' }
  ];

  const cards = [];

  const cardElements = document.querySelectorAll('.tarot-position');
  debugLog(`Found ${cardElements.length} card elements`);

  const len = cardElements.length;
  for (let i = 0; i < len; i++) {
    try {
      const cardElement = cardElements[i];
      const position = positions[i] || { label: `Position ${i+1}` };

      let isReversed = cardElement.classList.contains('reversed-challenge');

      if (!isReversed) {
        isReversed = !!cardElement.querySelector('.card-image.reversed, .card-name-label.reversed');
      }

      const nameLabel = cardElement.querySelector('.card-name-label');
      const name = nameLabel ? nameLabel.textContent.trim() : '';

      if (DEBUG) {
        debugLog(`Card ${i}: ${name}, reversed: ${isReversed}`);
      }

      cards.push({
        position: position.label.replace(/^\d+\.\s*/, ''),
        name: name,
        isReversed: isReversed,
        meaning: "Will be determined by the backend"
      });
    } catch (error) {
      console.error(`Error processing card ${i}:`, error);
    }
  }

  debugLog(`Collected ${cards.length} cards data`, cards);
  currentReadingCards = cards;
  return cards;
}

/**
 * Request a reading summary from the backend with retry capability
 * @param {number} retryCount - Number of retries attempted (default: 0)
 * @param {number} maxRetries - Maximum number of retries to attempt (default: 3)
 * @param {number} retryDelay - Delay between retries in ms (default: 2000)
 */
function requestReadingSummary(retryCount = 0, maxRetries = 3, retryDelay = 2000) {
  debugLog(`Requesting reading summary (retry: ${retryCount}/${maxRetries})`);

  requestAnimationFrame(() => {
    showSummaryPanel();
  });

  setTimeout(() => {
    const cards = collectReadingData();

    if (cards.length === 0) {
      debugLog('No cards found for reading');
      displaySummaryError("ไม่พบข้อมูลไพ่ หมอดูต้องการไพ่เพื่อทำนาย โปรดกดปุ่ม 'Reveal Your Destiny' เพื่อสุ่มไพ่ใหม่อีกครั้ง");
      return;
    }

    if (retryCount > 0) {
      const loadingIndicator = document.getElementById('summaryLoading');
      if (loadingIndicator) {
        loadingIndicator.innerHTML = `
          <div class="animate-spin-slow text-4xl text-gold mb-4">
            <i class="fas fa-dharmachakra"></i>
          </div>
          <p class="text-light-gold/70 text-lg">กำลังวิเคราะห์ไพ่และเรียบเรียงคำทำนาย...</p>
          <p class="text-gold/50 text-sm mt-2">กำลังพยายามเชื่อมต่อใหม่ (ครั้งที่ ${retryCount}/${maxRetries})</p>
        `;
      }
    }

    if (window.location.protocol === 'file:') {
      debugLog('Running in local file mode, using mock response');
      setTimeout(() => {
        const mockReading = `
        สวัสดีค่ะคุณผู้ชม ดิฉันหมอดูพรพิมล ยินดีที่ได้อ่านไพ่ทาโร่ให้คุณในวันนี้ค่ะ

        ไพ่ที่ออกมาบอกว่า ช่วงนี้คุณกำลังเผชิญกับความท้าทายในชีวิต แต่อย่ากังวลไปค่ะ ดวงดาวกำลังส่งพลังงานดีๆ มาให้คุณ ไพ่บ่งบอกว่าคุณมีพลังภายในที่แข็งแกร่ง และสามารถผ่านอุปสรรคไปได้แน่นอน

        ในเรื่องความรัก ดวงบอกว่าคุณอาจต้องใช้ความอดทนสักหน่อย อย่าเพิ่งใจร้อนตัดสินใจอะไรในตอนนี้ ให้รอจังหวะที่เหมาะสม ส่วนเรื่องการงาน มีโอกาสดีๆ กำลังจะเข้ามา แต่ต้องเตรียมตัวให้พร้อมรับโอกาสนั้น

        สุดท้ายนี้ หมอขอฝากไว้ว่า จงเชื่อมั่นในตัวเอง เพราะพลังงานจากจักรวาลกำลังสนับสนุนคุณอยู่ ทุกอย่างจะผ่านไปด้วยดีค่ะ
        `;
        displaySummary(mockReading);
      }, 2000);
      return;
    }

    debugLog('Sending API request to backend', { cards });

    if (!window.tarotApiUrl) {
      window.tarotApiUrl = window.location.protocol === 'file:'
        ? 'http://localhost:5000/api/tarot-reading'
        : window.location.protocol === 'http:' && window.location.port === '8000'
          ? 'http://localhost:5000/api/tarot-reading'
          : '/api/tarot-reading';
    }

    const apiUrl = window.tarotApiUrl;
    debugLog(`Using API URL: ${apiUrl}`);

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cards: cards }),
      cache: 'no-cache',
      keepalive: false,
      priority: 'high',
    })
    .then(response => {
      debugLog(`Received response with status: ${response.status}`);
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.status);
      }
      return response.json();
    })
    .then(data => {
      debugLog('Successfully received reading data', data);
      requestAnimationFrame(() => {
        displaySummary(data.reading);
      });
    })
    .catch(error => {
      console.error('Error fetching reading summary:', error);

      if (error.message) {
        debugLog('Error details:', error.message);
      }

      if (retryCount < maxRetries) {
        debugLog(`Retrying (${retryCount + 1}/${maxRetries}) after ${retryDelay}ms...`);

        const summaryContent = document.getElementById('summaryContent');
        if (summaryContent) {
          summaryContent.innerHTML = `
            <div class="text-center">
              <p class="text-gold/70 mb-4">กำลังพยายามเชื่อมต่อใหม่อีกครั้ง...</p>
              <div class="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin-slow mx-auto"></div>
            </div>
          `;
          summaryContent.classList.remove('hidden');
        }

        const loadingIndicator = document.getElementById('summaryLoading');
        if (loadingIndicator) {
          loadingIndicator.classList.add('hidden');
        }

        setTimeout(() => {
          requestReadingSummary(retryCount + 1, maxRetries, retryDelay);
        }, retryDelay);
      } else {
        debugLog('Max retries reached, showing error message');
        const errorMsg = "ไม่สามารถเชื่อมต่อกับหมอดูได้หลังจากพยายามหลายครั้ง โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้งในภายหลัง";
        displaySummaryError(errorMsg);
      }
    });
  }, 0); // End of setTimeout - use 0 to defer but execute as soon as possible
}

/**
 * Display the reading summary in the panel
 * @param {string} summary The reading summary text
 */
function displaySummary(summary) {
  debugLog('Displaying reading summary');

  const loadingIndicator = document.getElementById('summaryLoading');
  const summaryContent = document.getElementById('summaryContent');

  if (loadingIndicator && summaryContent) {
    loadingIndicator.classList.add('hidden');

    const formattedSummary = summary
      .split('\n\n')
      .filter(para => para.trim() !== '')
      .map(para => `<p class="mb-4">${para}</p>`)
      .join('');

    summaryContent.innerHTML = `
      <div class="text-center mb-6">
        <div class="inline-block text-gold text-2xl">✧ ✦ ✧</div>
        <div class="h-[1px] w-32 mx-auto bg-gradient-to-r from-transparent via-gold/40 to-transparent mt-2"></div>
      </div>

      <div class="relative px-4 py-2">
        <div class="absolute top-0 left-0 text-gold/20 text-4xl leading-none">"</div>
        <div class="absolute bottom-0 right-0 text-gold/20 text-4xl leading-none">"</div>

        <div class="text-white/90 leading-relaxed text-lg px-6">
          ${formattedSummary}
        </div>
      </div>

      <div class="text-center mt-6">
        <div class="h-[1px] w-32 mx-auto bg-gradient-to-r from-transparent via-gold/40 to-transparent mb-2"></div>
        <div class="inline-block text-gold text-2xl">✧ ✦ ✧</div>
      </div>

      <div class="text-right mt-6 text-gold/60 italic text-sm">
        ~ หมอดูพรพิมล ~
      </div>
    `;

    summaryContent.classList.remove('hidden');
    debugLog('Summary displayed successfully');
  } else {
    debugLog('Error: Could not find summary panel elements', {
      loadingIndicator: !!loadingIndicator,
      summaryContent: !!summaryContent
    });
  }
}

/**
 * Display an error message in the summary panel
 * @param {string} errorMessage The error message to display
 */
function displaySummaryError(errorMessage) {
  debugLog('Displaying error message', { message: errorMessage });

  const loadingIndicator = document.getElementById('summaryLoading');
  const summaryContent = document.getElementById('summaryContent');

  if (loadingIndicator && summaryContent) {
    // Hide loading indicator
    loadingIndicator.classList.add('hidden');

    // Display error message with enhanced mystical styling and troubleshooting tips
    summaryContent.innerHTML = `
      <div class="text-center">
        <!-- Mystical error icon with animation -->
        <div class="relative inline-block mb-6">
          <div class="text-5xl text-gold/80 relative z-10"><i class="fas fa-magic"></i></div>
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gold/10 rounded-full animate-pulse"></div>
          <div class="absolute top-0 right-0 w-2 h-2 bg-gold/60 rounded-full animate-pulse"></div>
          <div class="absolute bottom-0 left-0 w-2 h-2 bg-gold/60 rounded-full animate-pulse" style="animation-delay: 0.5s"></div>
        </div>

        <!-- Error title with decorative elements -->
        <div class="relative mb-6">
          <h3 class="text-light-gold text-2xl mb-3 font-cinzel">พลังงานแห่งจักรวาลขัดข้อง</h3>
          <div class="h-[1px] w-32 mx-auto bg-gradient-to-r from-transparent via-gold/40 to-transparent"></div>
        </div>

        <!-- Error message with styling -->
        <p class="text-gold/70 mb-6 text-lg">${errorMessage}</p>

        <!-- Troubleshooting tips with enhanced styling -->
        <div class="mt-6 p-6 bg-gradient-to-b from-midnight-blue/40 to-deep-purple/20 rounded-lg border border-gold/20 text-left max-w-xl mx-auto">
          <p class="text-light-gold/90 text-base mb-4 font-cinzel flex items-center">
            <i class="fas fa-tools text-gold/70 mr-2"></i> วิธีแก้ไข:
          </p>
          <ul class="text-white/80 text-base space-y-3">
            <li class="flex items-start">
              <i class="fas fa-check-circle text-gold/70 mr-2 mt-1"></i>
              <span>ตรวจสอบว่าเซิร์ฟเวอร์ Python กำลังทำงานอยู่ (port 5000)</span>
            </li>
            <li class="flex items-start">
              <i class="fas fa-check-circle text-gold/70 mr-2 mt-1"></i>
              <span>ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต</span>
            </li>
            <li class="flex items-start">
              <i class="fas fa-check-circle text-gold/70 mr-2 mt-1"></i>
              <span>ตรวจสอบว่ามีการตั้งค่า API key ใน .env file แล้ว</span>
            </li>
          </ul>
        </div>

        <!-- Retry button with enhanced styling -->
        <button id="retryButton" class="mt-8 px-6 py-3 bg-gradient-to-br from-mystic-purple via-deep-purple to-midnight-blue text-light-gold rounded-xl shadow-xl hover:shadow-gold-glow transition-all duration-500 font-cinzel text-lg flex items-center justify-center relative overflow-hidden group transform hover:-translate-y-1 mx-auto">
          <!-- Animated background effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-gold/10 to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <!-- Icon with animation -->
          <i class="fas fa-sync-alt mr-2 group-hover:rotate-180 transform transition-transform duration-700"></i>

          <!-- Text with subtle animation -->
          <span class="relative z-10 group-hover:tracking-wider transition-all duration-300">ลองอีกครั้ง</span>
        </button>
      </div>
    `;

    // Add event listener to retry button
    const retryButton = document.getElementById('retryButton');
    if (retryButton) {
      retryButton.addEventListener('click', requestReadingSummary);
      debugLog('Added event listener to retry button');
    }

    // Show the content
    summaryContent.classList.remove('hidden');
    debugLog('Error message displayed successfully');
  } else {
    // If we can't display in the panel, at least log the error
    console.error('Tarot reading error:', errorMessage);
    debugLog('Error: Could not find summary panel elements', {
      loadingIndicator: !!loadingIndicator,
      summaryContent: !!summaryContent
    });
  }
}

/**
 * Update the UI after cards are drawn to show the summary button
 * This function should be called after all cards are drawn
 */
function showSummaryButton() {
  debugLog('Attempting to show summary button');

  const summaryButton = document.getElementById('summaryBtn');
  if (summaryButton) {
    debugLog('Summary button found, removing hidden class');
    summaryButton.classList.remove('hidden');

    // Make sure the button is visible by checking its display style
    const computedStyle = window.getComputedStyle(summaryButton);
    debugLog(`Button display style: ${computedStyle.display}`);

    // Force the button to be visible if needed
    if (computedStyle.display === 'none') {
      debugLog('Button still hidden, forcing display style');
      summaryButton.style.display = 'flex';
    }

    // Make sure the button is in the DOM at a visible location
    const resetButton = document.getElementById('resetBtn');
    if (resetButton && resetButton.parentNode) {
      debugLog('Reset button found, ensuring summary button is properly positioned');
      resetButton.parentNode.insertBefore(summaryButton.parentNode, resetButton.nextSibling);
    }
  } else {
    debugLog('Summary button not found in DOM, creating it now');
    createSummaryButton();

    // Try to show it again after creation
    setTimeout(() => {
      const newSummaryButton = document.getElementById('summaryBtn');
      if (newSummaryButton) {
        newSummaryButton.classList.remove('hidden');
        debugLog('Summary button created and shown');
      } else {
        debugLog('Failed to create summary button');
      }
    }, 100);
  }
}

// Add a hook to show the summary button after all cards are drawn
// This extends the existing drawCards function
debugLog('Setting up drawCards hook');

// Wait for the drawCards function to be defined
function setupDrawCardsHook() {
  const originalDrawCards = window.drawCards;
  if (originalDrawCards) {
    debugLog('Original drawCards function found, setting up hook');
    window.drawCards = function() {
      debugLog('drawCards called, will show summary button after cards are drawn');

      // Call the original function
      originalDrawCards.apply(this, arguments);

      // After all cards are drawn (with a delay to ensure they're all processed)
      setTimeout(() => {
        debugLog('Delayed call to show summary button after drawCards');
        showSummaryButton();
        console.log("Summary button should now be visible");

        // Double-check after a longer delay
        setTimeout(() => {
          debugLog('Final check to ensure summary button is visible');
          showSummaryButton();
        }, 2000);
      }, 3000); // 3 seconds delay to ensure all cards are drawn
    };
    return true;
  }
  return false;
}

// Try to set up the hook immediately
if (!setupDrawCardsHook()) {
  // If we can't find the original drawCards function yet, try again after DOM is fully loaded
  debugLog('Original drawCards function not found, will try again after page load');

  // Try again when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (!setupDrawCardsHook()) {
        debugLog('Still could not find drawCards after DOM loaded, using fallback');
        useFallbackMethod();
      }
    });
  } else {
    // DOM already loaded, try one more time after a short delay
    setTimeout(() => {
      if (!setupDrawCardsHook()) {
        debugLog('Still could not find drawCards after delay, using fallback');
        useFallbackMethod();
      }
    }, 1000);
  }
}

// Fallback method to show the button
function useFallbackMethod() {
  debugLog('Using fallback method to show summary button');

  // Check periodically if cards are displayed
  const checkInterval = setInterval(() => {
    const cardElements = document.querySelectorAll('.tarot-position');
    debugLog(`Checking for cards, found: ${cardElements.length}`);

    if (cardElements.length > 0) {
      debugLog('Cards found, showing summary button');
      showSummaryButton();
      console.log("Cards found, showing summary button");
      clearInterval(checkInterval);
    }
  }, 2000);

  // Stop checking after 30 seconds to avoid infinite checking
  setTimeout(() => {
    clearInterval(checkInterval);
    debugLog('Stopped checking for cards after timeout');
  }, 30000);
}

/**
 * Check if the tarot bot server is running
 * @returns {Promise<boolean>} True if server is running, false otherwise
 */
async function checkServerStatus() {
  debugLog('Checking server status');
  try {
    const apiUrl = window.location.protocol === 'file:'
      ? 'http://localhost:5000/api/tarot-reading'
      : window.location.protocol === 'http:' && window.location.port === '8000'
        ? 'http://localhost:5000/api/tarot-reading'
        : '/api/tarot-reading';

    debugLog(`Checking server status using URL: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'HEAD',
      cache: 'no-store'
    });

    debugLog(`Server status check response: ${response.status}`);
    return response.status !== 404;
  } catch (error) {
    debugLog('Server status check failed', { error: error.message });
    return false;
  }
}

/**
 * Create and add a server status indicator to the UI
 */
function createServerStatusIndicator() {
  debugLog('Creating server status indicator');

  const statusContainer = document.createElement('div');
  statusContainer.id = 'serverStatusIndicator';
  statusContainer.className = 'fixed bottom-4 right-4 z-50 flex items-center bg-gradient-to-r from-deep-purple/90 to-midnight-blue/90 px-3 py-2 rounded-lg border border-gold/30 shadow-lg text-sm';

  const statusDot = document.createElement('div');
  statusDot.className = 'w-3 h-3 rounded-full bg-red-500 mr-2';
  statusContainer.appendChild(statusDot);

  const statusText = document.createElement('span');
  statusText.className = 'text-gold/80';
  statusText.textContent = 'กำลังตรวจสอบการเชื่อมต่อ...';
  statusContainer.appendChild(statusText);

  document.body.appendChild(statusContainer);
  debugLog('Server status indicator added to page');

  updateServerStatus();

  setInterval(updateServerStatus, 30000);
  debugLog('Periodic server status checks scheduled');
}

/**
 * Update the server status indicator
 */
async function updateServerStatus() {
  debugLog('Updating server status indicator');

  const statusDot = document.querySelector('#serverStatusIndicator div');
  const statusText = document.querySelector('#serverStatusIndicator span');

  if (!statusDot || !statusText) {
    debugLog('Status indicator elements not found');
    return;
  }

  statusDot.className = 'w-3 h-3 rounded-full bg-yellow-500 mr-2 animate-pulse';
  statusText.textContent = 'กำลังตรวจสอบการเชื่อมต่อ...';

  const isRunning = await checkServerStatus();
  debugLog(`Server status check result: ${isRunning ? 'running' : 'not running'}`);

  if (isRunning) {
    statusDot.className = 'w-3 h-3 rounded-full bg-green-500 mr-2';
    statusText.textContent = 'เชื่อมต่อกับหมอดูสำเร็จ';

    setTimeout(() => {
      const indicator = document.getElementById('serverStatusIndicator');
      if (indicator) {
        indicator.classList.add('opacity-0');
        setTimeout(() => {
          indicator.classList.add('hidden');
        }, 1000);
      }
    }, 5000);
  } else {
    statusDot.className = 'w-3 h-3 rounded-full bg-red-500 mr-2';
    statusText.textContent = 'ไม่สามารถเชื่อมต่อกับหมอดูได้';
    debugLog('Server connection failed, updating indicator to show error');

    const indicator = document.getElementById('serverStatusIndicator');
    if (indicator) {
      indicator.style.cursor = 'pointer';
      indicator.title = 'คลิกเพื่อดูวิธีแก้ไข';
      indicator.onclick = function() {
        debugLog('Status indicator clicked, showing troubleshooting tips');
        displaySummaryError("ไม่สามารถเชื่อมต่อกับหมอดูได้ โปรดตรวจสอบว่าเซิร์ฟเวอร์ Python กำลังทำงานอยู่ และมีการตั้งค่า API key ถูกต้อง");
        showSummaryPanel();
      };
    }
  }
}

/**
 * Initialize all tarot summary functionality when the DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  debugLog('DOM loaded, initializing tarot summary functionality');

  setTimeout(() => {
    initTarotSummary();
    createServerStatusIndicator();
    debugLog('Tarot summary initialization complete');
  }, 1000);
});
