<script lang="ts">
    import { goto } from '$app/navigation';
    import type { ArticleMetadata } from './types'
    
    export let metadata: ArticleMetadata;

    function handleClick(event: MouseEvent) {
        event.preventDefault();
        sessionStorage.setItem('articleMetadata', JSON.stringify(metadata));
        goto(`/articulo/${metadata.slug}`);
    }
</script>

<div class="card bg-neutral w-70 shadow-lg">
    <a
        href={`/articulo/${metadata.slug}`}
        on:click={handleClick}
        tabindex="0"
        class="w-full text-left"
    >
        <figure>
            <img
                src={metadata.photo}
                alt={metadata.alt_photo}
                class="w-full h-auto"
            />
            <div class="absolute top-2 right-2 bg-black bg-opacity-90 text-white text-xs px-2 py-1 rounded">
                {metadata.date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
        </figure>
        <div class="card-body h-60">
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
    </a>
</div>
