/**
 * CrimeIntel AI - Theme Management System
 * Supports seamless Light / Dark mode switching with instant state syncing and persistence
 */

export const THEME_KEY = 'crimeintel-theme';

export function getPreferredTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch (e) {
    /* storage access error / sandbox fallback */
  }
  return 'light'; // Default is Light
}

export function updateThemeToggleButtons(theme) {
  const activeTheme = theme === 'dark' ? 'dark' : 'light';
  const toggles = document.querySelectorAll('.theme-toggle-control');
  toggles.forEach(ctrl => {
    const lightBtn = ctrl.querySelector('[data-set-theme="light"]');
    const darkBtn = ctrl.querySelector('[data-set-theme="dark"]');
    if (lightBtn && darkBtn) {
      if (activeTheme === 'dark') {
        darkBtn.classList.add('active');
        lightBtn.classList.remove('active');
      } else {
        lightBtn.classList.add('active');
        darkBtn.classList.remove('active');
      }
    }
  });
}

export function setTheme(theme) {
  const targetTheme = theme === 'dark' ? 'dark' : 'light';
  
  // Set attribute on both html and body for maximum selector compatibility
  document.documentElement.setAttribute('data-theme', targetTheme);
  if (document.body) {
    document.body.setAttribute('data-theme', targetTheme);
  }
  
  try {
    localStorage.setItem(THEME_KEY, targetTheme);
  } catch (e) {
    /* ignore storage write failures */
  }

  updateThemeToggleButtons(targetTheme);

  // If correlation SVG web graph is rendered on screen, redraw it
  if (typeof window.drawWeb === 'function' && window._currentCase) {
    try {
      window.drawWeb(window._currentCase);
    } catch (err) {
      /* ignore */
    }
  }
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

let isThemeInitialized = false;

export function initTheme() {
  const current = getPreferredTheme();
  setTheme(current);

  if (!isThemeInitialized) {
    isThemeInitialized = true;
    
    // Global event delegation to handle clicks on theme buttons anytime
    document.addEventListener('click', (e) => {
      const btn = e.target && e.target.closest ? e.target.closest('[data-set-theme]') : null;
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        const t = btn.getAttribute('data-set-theme');
        if (t === 'light' || t === 'dark') {
          setTheme(t);
        }
      }
    }, true);
  }

  // Also bind to window object for inline onclick compatibility
  window.setTheme = setTheme;
  window.toggleTheme = toggleTheme;
  window.getPreferredTheme = getPreferredTheme;
}

