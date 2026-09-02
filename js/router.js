/**
 * CASEWEB - Hash-Based Router
 */

export let route = { view: 'dashboard', id: null, tab: null };

export function setRoute(newRoute) {
  route = newRoute;
}

export function parseHash() {
  const h = (location.hash || '').replace('#', '');
  const parts = h.split('/').filter(Boolean);
  return {
    view: parts[0] || 'dashboard',
    id: parts[1] || null,
    tab: parts[2] || null
  };
}

export function go(hash) {
  location.hash = hash;
}

export function initRouter(onRouteChanged) {
  window.addEventListener('hashchange', () => {
    route = parseHash();
    if (typeof onRouteChanged === 'function') {
      onRouteChanged(route);
    }
  });
  route = parseHash();
  return route;
}
