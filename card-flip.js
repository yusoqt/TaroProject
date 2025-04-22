/**
 * Card Flip Sound Generator
 *
 * This file creates a synthesized card flip sound using the Web Audio API
 * We use this instead of an actual MP3 file for better performance and no external dependencies
 */

function createCardFlipSound() {
  // Check if AudioContext is available
  if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') {
    console.warn('Web Audio API is not supported in this browser');
    return null;
  }

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContextClass();

    // Create a function that generates a card flip sound
    return function playCardFlip() {
      try {
        // Resume audio context if it was suspended (needed for some browsers)
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }

        // Create oscillator and gain nodes
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filterNode = audioContext.createBiquadFilter();

        // Connect the nodes
        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Set parameters for a more realistic card flip sound
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(60, audioContext.currentTime + 0.2);

        // Add filter for a more natural sound
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(800, audioContext.currentTime);
        filterNode.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.2);

        // Volume envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.02);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);

        // Start and stop the oscillator
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);

        return audioContext;
      } catch (error) {
        console.error('Error playing card flip sound:', error);
        return null;
      }
    };
  } catch (error) {
    console.error('Error creating audio context:', error);
    return null;
  }
}

// Export the function
window.createCardFlipSound = createCardFlipSound;
