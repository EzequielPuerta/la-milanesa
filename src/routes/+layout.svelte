<script lang="ts">
	import '../app.css';
    import 'katex/dist/katex.min.css';
	import { onMount } from 'svelte';
    import { logoSmall } from '$lib/stores/logoVariants';
    import { injectAnalytics } from '@vercel/analytics/sveltekit';
    import { Instagram, Twitter, Mail } from 'lucide-svelte';
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

    <footer class="footer sm:footer-horizontal bg-base-300 text-base-content p-10">
        <nav>
            <h6 class="footer-title">Nosotros</h6>
            <a class="link link-hover">Acerca de</a>
            <a class="link link-hover">Contacto</a>
        </nav>
        <nav>
            <h6 class="footer-title">Social</h6>
            <div class="grid grid-flow-col gap-4 items-center">
				<a
					href="https://www.instagram.com/la.milanesa.ok/"
					target="_blank"
					rel="noopener"
					class="hover:text-pink-400 transition-colors"
					aria-label="Instagram"
				>
					<Instagram size="22" />
				</a>

				<a
					href="https://x.com/LaMilanesaOk"
					target="_blank"
					rel="noopener"
					class="hover:text-sky-400 transition-colors"
					aria-label="Twitter"
				>
					<Twitter size="22" />
				</a>

                <a
                    href="mailto:hola.la.milanesa@gmail.com"
                    class="flex items-center gap-2 hover:text-primary"
                >
                    <Mail class="w-5 h-5" />
                </a>

                <a
                    href='https://cafecito.app/holalamilanesa'
                    rel='noopener'
                    target='_blank'
                >
                    <img srcset='https://cdn.cafecito.app/imgs/buttons/button_4.png 1x, https://cdn.cafecito.app/imgs/buttons/button_4_2x.png 2x, https://cdn.cafecito.app/imgs/buttons/button_4_3.75x.png 3.75x' src='https://cdn.cafecito.app/imgs/buttons/button_4.png' alt='Invitame un café en cafecito.app' />
                </a>
            </div>
        </nav>
    </footer>
</main>
