import { readable } from 'svelte/store';

export function createThemeLogoSrc(selector: (isDark: boolean) => string) {
	return readable('', (set) => {
		const matcher = window.matchMedia('(prefers-color-scheme: dark)');

		const update = () => {
			set(selector(matcher.matches));
		};

		update();
		matcher.addEventListener('change', update);
		return () => matcher.removeEventListener('change', update);
	});
}
