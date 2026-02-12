import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/white.css'; // Light mode theme
import './style.css';
import Reveal from 'reveal.js';

const deck = new Reveal();
deck.initialize({
  hash: true,
  slideNumber: true,
});
