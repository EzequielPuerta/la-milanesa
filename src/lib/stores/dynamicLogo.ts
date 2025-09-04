import { readable, type Readable } from 'svelte/store';
import { browser } from '$app/environment';

function isDarkTheme(): boolean {
	if (!browser) return false;
	const theme = document.documentElement.dataset.theme ?? 'autumn';
	return theme === 'sunset';
}

export function createThemeLogoSrc(getSrc: (isDark: boolean) => string): Readable<string> {
	return readable(getSrc(isDarkTheme()), (set) => {
		if (!browser) return () => {};

		const update = () => {set(getSrc(isDarkTheme()));};
        
		const observer = new MutationObserver(update);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});

		update();

		return () => observer.disconnect();
	});
}
