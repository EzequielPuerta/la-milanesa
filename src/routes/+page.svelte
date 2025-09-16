<script lang="ts">
    import { onMount } from 'svelte';
    import { articles } from './articulo/articles';
    import ArticleCard from '../components/ArticleCard.svelte';
    import { logoLarge } from '$lib/stores/logoVariants';
    import type { ArticleMetadata } from '../components/types.js';

    let mounted: boolean = false;
    let sortedArticles: ArticleMetadata[] = articles;
    onMount(() => {
        mounted = true;

        sortedArticles = sortedArticles.filter(a => a.is_available).sort((a, b) => b.date.getTime() - a.date.getTime());
    });
</script>

<svelte:head>
    <!-- Open Graph -->
    <meta property="og:url" content="https://la-milanesa.vercel.app/">
    <meta property="og:type" content="website">
    <meta property="og:title" content="La Verdad de La Milanesa">
    <meta property="og:description" content="Sean bienvenidos a este espacio, donde los datos se convierten en gráficos e historias para intentar entender la realidad.">
    <meta property="og:image" content={`https://la-milanesa.vercel.app$/favicons/favicon.png`}>

    <!-- Twitter Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta property="twitter:domain" content="la-milanesa.vercel.app">
    <meta property="twitter:url" content="https://la-milanesa.vercel.app/">
    <meta name="twitter:title" content="La Verdad de La Milanesa">
    <meta name="twitter:description" content="Sean bienvenidos a este espacio, donde los datos se convierten en gráficos e historias para intentar entender la realidad.">
    <meta property="og:image" content={`https://la-milanesa.vercel.app$/logos/dark-logo-transparency.png`}>
</svelte:head>

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
                En un mundo saturado de opiniones y algoritmos, donde todos proclaman tener la <em>posta</em> y cualquiera puede gritar una “verdad” en 280 caracteres, queremos frenar la pelota. Este <em>blog</em> nace con el deseo de pensar, dudar, analizar y contar historias desde los datos.
            </p>
            <p class="py-2">
                No tenemos verdades absolutas ni queremos tenerlas, pero sí preguntas (y muchas) que merecen algo más que un tuit. Acá vas a encontrar gráficos, contexto, números y algo de filosofía de sobremesa acerca de tópicos de actualidad.
            </p>
            <p class="py-2">
                Porque creemos que los datos no hablan solos:
            </p>
            <p class="py-2">
                Necesitan ser mirados con criterio para encontrar <strong><em>La verdad de la milanesa</em></strong>.
            </p>
        </div>
    </div>
</div>

<div class="max-w-screen-lg mx-auto p-8">
    <h1 class="text-center text-3xl font-bold mb-6">Artículos</h1>
    <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
        {#if sortedArticles}
            {#each sortedArticles as metadata}
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