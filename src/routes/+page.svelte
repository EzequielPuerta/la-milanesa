<script>
	import { onMount } from 'svelte';
    import { articles } from './articulo/index.js';
    import ArticleCard from '../components/ArticleCard.svelte';
	import { logoLarge } from '$lib/stores/logoVariants';

    let mounted = false;
	onMount(() => {
		mounted = true;
	});
</script>

<div class="hero bg-base-200 min-h-screen">
	<div class="hero-content flex-col lg:flex-row items-center text-center lg:text-left">
		{#if mounted}
			<img
				src={$logoLarge}
				alt="La verdad de la milanesa - logo"
				class="max-w-xs lg:max-w-sm"
			/>
		{/if}
		<div>
			<h1 class="sm:text-5xl py-6">Datos, gráficos e historias para intentar entender la realidad.</h1>
			<p class="py-2">
				Muy pronto, una intro "como la gente"...
			</p>
		</div>
	</div>
</div>

<div class="max-w-screen-lg mx-auto p-8">
    <h1 class="text-center text-3xl font-bold mb-6">Artículos</h1>
    <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
        {#if articles}
            {#each articles as metadata}
                {#if metadata.is_available}
                    <li>
                        <ArticleCard {metadata} />
                    </li>
                {/if}
            {/each}
        {:else}
            <div class="flex justify-center p-8">
                <span class="loading loading-spinner loading-lg"></span>
            </div>
        {/if}
    </ul>
</div>