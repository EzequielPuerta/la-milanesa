import { readable } from 'svelte/store';

export const isMobile = readable(false, (set) => {
	if (typeof window === 'undefined') return;

	const mql = window.matchMedia('(max-width: 768px)');
	set(mql.matches);

	const handler = (event: MediaQueryListEvent) => set(event.matches);
	mql.addEventListener('change', handler);

	return () => mql.removeEventListener('change', handler);
});
