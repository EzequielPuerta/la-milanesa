<script lang="ts">
	import '../app.css';
    import 'katex/dist/katex.min.css';
	import { onMount } from 'svelte';
    import { logoSmall } from '$lib/stores/logoVariants';
    import { injectAnalytics } from '@vercel/analytics/sveltekit';
    injectAnalytics();

    let mounted = false;
	onMount(() => {
		mounted = true;
        
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const currentTheme = prefersDark ? 'sunset' : 'autumn';
		document.documentElement.dataset.theme = currentTheme;

        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = (e: MediaQueryListEvent) => {
            const prefersDark = e.matches;
            const initialTheme = prefersDark ? 'sunset' : 'autumn';
            document.documentElement.dataset.theme = initialTheme;
        };
        mq.addEventListener('change', listener);
        return () => mq.removeEventListener('change', listener);
	});
</script>

<main>
    <div class="navbar bg-base-300 fixed top-0 left-0 right-0 z-50 flex items-center">
        <a href="/" class="btn btn-ghost text-xl">
            {#if mounted}
                <img src={$logoSmall} alt="La verdad de la milanesa - logo" class="max-w-sm" />
            {/if}
        </a>
    </div>
    
    <div class="pt-16">
        <slot />
    </div>

    <footer class="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4 z-100">
        <aside>
            <p>Copyleft 🄯 {new Date().getFullYear()} - Todos los derechos sin reservar</p>
        </aside>
    </footer>
</main>
