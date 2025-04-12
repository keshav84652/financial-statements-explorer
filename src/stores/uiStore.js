import { writable } from 'svelte/store';

// Current view in the main content area
export const currentView = writable('dashboard');

// Track which statement is being viewed in the statements section
export const currentStatement = writable('balance-sheet');

// Controls for transaction simulator
export const simulatorState = writable({
  selectedTransaction: null,
  customTransaction: {
    name: '',
    type: '',
    amount: 0,
    affectsAccounts: []
  },
  showImpactPreview: true,
  animationSpeed: 1
});

// Controls for the learning center
export const learningState = writable({
  currentTopic: 'intro',
  completedTopics: [],
  showHints: true
});

// Settings
export const settings = writable({
  darkMode: false,
  compactView: false,
  showAnimations: true,
  currencySymbol: '$',
  decimalPlaces: 2,
  showTutorialTips: true
});