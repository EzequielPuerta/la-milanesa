<script lang="ts">
    let { children } = $props();
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import type { ArticleMetadata } from '../../components/types';

    let metadata = writable<ArticleMetadata | null>(null);

    onMount(() => {
        const data = sessionStorage.getItem('articleMetadata');
        if (data) {
            try {
                metadata.set(JSON.parse(data));
            } catch (e) {
                console.error('Error parsing metadata from sessionStorage:', e);
            }
        }
    });
</script>

<!-- {#if $metadata}
    <div
        class="hero min-h-screen"
        style={`background-image: url('${$metadata.hero_photo}')`}
    >
        <div class="hero-overlay"></div>
        <div class="hero-overlay"></div>
        <div class="hero-overlay"></div>
        <div class="hero-content text-neutral-content text-center">
            <div class="max-w-md lg:max-w-3xl">
                <h1 class="mb-5 text-5xl text-base-content">{$metadata.title}</h1>
                <p class="mb-5 font-bold px-4 py-2 text-base-content rounded-lg inline-block">
                    {$metadata.abstract}
                </p>
                <p><strong>{$metadata.date && new Date($metadata.date).toLocaleDateString('es-AR')} - CABA, Argentina</strong></p>
                <div class="pt-6">
                    {#each $metadata.tags as tag}
                        <span class="badge badge-primary mx-3">{tag}</span>
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <div class="max-w-screen-xl mx-auto text-justify">
        {@render children()}
    </div>
{:else}
    <div class="flex justify-center p-8">
        <span class="loading loading-spinner loading-lg"></span>
    </div>
{/if} -->

{@render children()}