<script lang="ts">
	import '../app.css';
    import 'katex/dist/katex.min.css';
	import { onMount } from 'svelte';
    import { logoSmall } from '$lib/stores/logoVariants';
    import ThemeController from '../components/ThemeController.svelte';
    import { injectAnalytics } from '@vercel/analytics/sveltekit'
    injectAnalytics();

    let mounted = false;
	onMount(() => {
		mounted = true;
	});
</script>

<main>
    <div class="navbar bg-base-300 fixed top-0 left-0 right-0 z-50">
        <div class="flex-12/12">
            <a href="/" class="btn btn-ghost text-xl">
                {#if mounted}
                    <img src={$logoSmall} alt="La verdad de la milanesa - logo" class="max-w-sm" />
                {/if}
            </a>
        </div>
        <div class="flex-1/12">
            <!-- <button class="btn btn-square btn-ghost">
                <ThemeController />
            </button> -->
        </div>
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
