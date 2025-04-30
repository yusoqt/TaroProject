/**
 * Card Flip Sound Generator
 *
 * This file creates a synthesized card flip sound using the Web Audio API
 * We use this instead of an actual MP3 file for better performance and no external dependencies
 */

function createCardFlipSound() {
  // Create a single AudioContext instance
  let audioContext;

  try {
    // Handle browser compatibility for AudioContext
    let AudioContextClass = null;

    if (window.AudioContext) {
      AudioContextClass = window.AudioContext;
    } else if (window['webkitAudioContext']) {
      // For older browsers that use the webkit prefix
      AudioContextClass = window['webkitAudioContext'];
    }

    if (!AudioContextClass) {
      console.warn('Web Audio API is not supported in this browser');
      return null;
    }

    audioContext = new AudioContextClass();
  } catch (error) {
    console.error('Error creating audio context:', error);
    return null;
  }

  // Return the sound player function
  return function playCardFlip() {
    if (!audioContext) return null;

    try {
      // Resume audio context if it was suspended (needed for some browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      // Create and connect audio nodes
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filterNode = audioContext.createBiquadFilter();

      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configure sound parameters
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(60, audioContext.currentTime + 0.2);

      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(800, audioContext.currentTime);
      filterNode.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.02);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);

      // Play the sound
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);

      return true;
    } catch (error) {
      console.error('Error playing card flip sound:', error);
      return null;
    }
  };
}

// Export the function
window.createCardFlipSound = createCardFlipSound;
