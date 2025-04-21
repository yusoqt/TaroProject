// This file creates a synthesized card flip sound using the Web Audio API
// We'll use this instead of an actual MP3 file

function createCardFlipSound() {
  // Check if AudioContext is available
  if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') {
    console.warn('Web Audio API is not supported in this browser');
    return null;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContextClass();
  
  // Create a function that generates a card flip sound
  return function playCardFlip() {
    // Create oscillator and gain nodes
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect the nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set parameters
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.02);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
    
    // Start and stop the oscillator
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
    
    return audioContext;
  };
}

// Export the function
window.createCardFlipSound = createCardFlipSound;
