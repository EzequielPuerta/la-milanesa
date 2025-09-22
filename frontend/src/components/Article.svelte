<script lang="ts">
    import SocialButtons from '$components/SocialButtons.svelte';
    import type { ArticleMetadata } from './types'
    import PhotoCredit from './PhotoCredit.svelte';

    export let metadata: ArticleMetadata;

    const url = `https://la-milanesa.vercel.app/articulo/${metadata.slug}`;
    const title = metadata.title;
    const desc = metadata.abstract;
</script>

<svelte:head>
    <title>{title} | La Verdad de la Milanesa</title>
    <meta name="description" content={desc}>

    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:url" content={url}>
    <meta property="og:title" content={title}>
    <meta property="og:description" content={desc}>
    <meta property="og:image" content={`https://la-milanesa.vercel.app${metadata.photo}`}>

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content={url}>
    <meta name="twitter:title" content={title}>
    <meta name="twitter:description" content={desc}>
    <meta name="twitter:image" content={`https://la-milanesa.vercel.app${metadata.photo}`}>
</svelte:head>

{#if metadata}
    <div
        class="hero min-h-screen relative"
        style={`background-image: url(${metadata.hero_photo})`}
    >
        <div class="hero-overlay"></div>
        <div class="hero-overlay"></div>
        <div class="hero-overlay"></div>
        <div class="hero-content text-neutral-content text-center">
            <div class="max-w-md lg:max-w-3xl">
                <h1 class="mb-5 text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-base-content">
                    {metadata.title}
                </h1>
                <p class="mb-5 font-bold px-4 py-2 text-base-content rounded-lg inline-block">
                    {metadata.abstract}
                </p>
                <p><strong>{metadata.date.toLocaleDateString('es-AR')} - CABA, Argentina</strong></p>
                <div class="pt-6">
                    {#each metadata.tags as tag}
                        <span class="badge badge-primary mx-3">{tag}</span>
                    {/each}
                </div>
            </div>
        </div>
        <div class="absolute bottom-6 right-6 group">
            <PhotoCredit
                tooltip={metadata.hero_credit_tooltip}
                link={metadata.hero_credit_link}
            />
        </div>
    </div>

    <div class="max-w-screen-xl mx-auto text-justify">
        <slot />
        <div class="flex w-full flex-col">
            <div class="divider">Compartir</div>
            <div class="py-4 flex justify-center w-full">
                <SocialButtons {url} {title} {desc}/>
            </div>
        </div>
    </div>
{/if}