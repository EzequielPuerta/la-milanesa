<script lang="ts">
    import { goto } from '$app/navigation';
    import PhotoCredit from './PhotoCredit.svelte';
    import type { ArticleMetadata } from './types'
    
    export let metadata: ArticleMetadata;
</script>

<div
    class="card bg-neutral w-75 shadow-lg cursor-pointer"
    role="button"
    tabindex="0"
    on:click={() => goto(`/articulo/${metadata.slug}`)}
    on:keydown={(e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            goto(`/articulo/${metadata.slug}`);
        }
    }}
>
    <figure class="relative">
        <img
            src={metadata.photo}
            alt={metadata.alt_photo}
            class="w-full h-auto"
        />
        <div class="absolute top-2 right-2 bg-black bg-opacity-90 text-white text-xs px-2 py-1 rounded">
            {metadata.date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
        <div class="absolute bottom-2 right-2 group">
            <div class="absolute bottom-0 right-0 group">
                <PhotoCredit
                    tooltip={metadata.credit_tooltip}
                    link={metadata.credit_link}
                />
            </div>
        </div>
    </figure>
    <div class="card-body h-65">
        <h2 class="card-title">
            {metadata.title}
            {#if metadata.is_new}
                <div class="badge badge-primary">Nuevo</div>
            {/if}
        </h2>
        <p class="px-0">{metadata.abstract}</p>
        <div class="card-actions justify-end">
            {#each metadata.tags as tag}
                <div class="badge badge-outline">{tag}</div>
            {/each}
        </div>
    </div>
</div>
