<script lang="ts">
    import { Camera } from 'lucide-svelte';

    export let tooltip: string;
    export let link: string;
</script>

<div>
    <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        class="bg-black bg-opacity-70 text-white rounded-full p-1 flex items-center justify-center"
        on:click|stopPropagation
    >
        <Camera class="w-4 h-4" />
    </a>
    <div
        class="absolute bottom-8 right-0 hidden group-hover:block 
            bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded shadow-lg 
            whitespace-nowrap"
    >
        Créditos: {tooltip}
    </div>
</div>