export function loadPlotlyFromCdn(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('No window'));
    if ((window as any).Plotly) return resolve((window as any).Plotly);

    const src = 'https://cdn.plot.ly/plotly-2.24.1.min.js'; // versión fija; cambiá si querés
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve((window as any).Plotly));
      existing.addEventListener('error', () => reject(new Error('Load error')));
      return;
    }

    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => {
      if ((window as any).Plotly) resolve((window as any).Plotly);
      else reject(new Error('Plotly not available after script load'));
    };
    s.onerror = () => reject(new Error('Failed to load Plotly script'));
    document.head.appendChild(s);
  });
}