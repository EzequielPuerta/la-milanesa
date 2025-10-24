<script lang="ts">
    import { onMount } from 'svelte';
    import LegislatorsGraph from './LegislatorsGraph.svelte';
	import { matrices, graphData, threshold, activeMatrixIndex } from '$lib/stores/articles/legislatorsSimilarityMatrix';
    import { LEGISLATORS_BY_PARTY } from '../legislatorsByParty';

    let isLoading: boolean = false;
    let selectedLegislator: string = '';
    let selectedLegislators: string[] = [];
    let selectedParty: string = '';

    async function fetchMatrices() {
        isLoading = true;
        try {
            const res = await fetch('/api/hacerle-el-juego-a-la-derecha/bimonthly-similarity-matrixes');
            const data = await res.json();
            matrices.set(data);

            if (data.length) {
                selectMatrix(0);
            }
        } catch (err) {
            console.error('Error fetching matrices:', err);
        } finally {
            isLoading = false;
        }
    }

    onMount(() => {
        fetchMatrices();
    });

    function selectMatrix(index: number) {
        activeMatrixIndex.set(index);
    }

    function onPartyChange(party: string) {
        selectedParty = party;
        selectedLegislator = '';
        selectedLegislators = LEGISLATORS_BY_PARTY[party] || [];
    }

    function onLegislatorChange(legislator: string) {
        selectedLegislator = legislator;
        selectedParty = '';
        selectedLegislators = legislator ? [legislator] : [];
    }
</script>

<style>
    .filter-container {
        position: absolute;
        bottom: 8.2rem;
        right: -0.8rem;
        z-index: 20;
        background: rgba(0, 0, 0, 0.6);
        padding: 1rem;
        border-radius: 1rem;
        color: white;
    }

    .timeline-vertical {
        top: 1rem;
        left: -0.8rem;
    }

    .timeline-container {
        position: absolute;
        z-index: 20;
        background: rgba(0, 0, 0, 0.6);
        padding: 1rem;
        border-radius: 1rem;
        color: white;
    }
</style>

<div class="relative w-full h-full">
    {#if $graphData.nodes.length}
        <LegislatorsGraph
            nodes={$graphData.nodes}
            edges={$graphData.edges}
            showIsolated={false}
            highlightedLegislators={selectedLegislators}
        />
    {:else}
        <div class="skeleton w-full h-50">
            Cargando datos...
        </div>
    {/if}

    {#if $matrices.length}
    <div class="timeline-container timeline-vertical flex justify-around lg:w-full">
        <ul class="steps steps-vertical lg:steps-horizontal mt-4 mb-4 lg:w-full">
            {#each $matrices as matrix, i}
                <li
                    class="step cursor-pointer {i === $activeMatrixIndex ? 'step-primary' : 'step-neutral'}"
                    on:click={() => selectMatrix(i)}
                >
                    {new Date(matrix.from_date).toISOString().split('T')[0]}
                </li>
            {/each}
        </ul>
    </div>

    <div class="filter-container w-64 mt-16">
        <fieldset class="fieldset bg-base-100 border-base-300 rounded-box border p-4">
            <legend class="fieldset-legend text-sm">Umbral de similitud</legend>
            <input
                type="range"
                min="0.75"
                max="1"
                step="0.01"
                bind:value={$threshold}
                class="range range-primary"
            />
            <div class="flex justify-between px-2.5 mt-2 text-xs text-gray-300">
                <span>0.75</span>
                <span>0.80</span>
                <span>0.85</span>
                <span>0.90</span>
                <span>0.95</span>
                <span>1</span>
            </div>
            {#if isLoading}
                <p class="mt-2 text-xs text-gray-400 italic">Cargando...</p>
            {:else}
                <label class="mt-2 text-xs text-gray-400 italic">
                    Actual: {$threshold.toFixed(2)}
                </label>
            {/if}
        </fieldset>

        <fieldset class="fieldset bg-base-100 border-base-300 rounded-box border p-4">
            <legend class="fieldset-legend text-sm">Buscar legislador</legend>
            <select
                placeholder="Escribí un nombre..."
                value={selectedLegislator}
                on:change={(e) => onLegislatorChange(e.target.value)}
                class="select"
            >
                {#each [...$graphData.nodes].sort((a, b) => a.full_name.localeCompare(b.full_name, 'es')) as node}
                    <option value={node.full_name}>
                        {node.full_name}
                    </option>
                {/each}
            </select>
        </fieldset>

        <fieldset class="fieldset bg-base-100 border-base-300 rounded-box border p-4 mb-4">
            <legend class="fieldset-legend text-sm">Destacar partido</legend>
            <select
                placeholder="Ingresá un partido..."
                value={selectedParty}
                on:change={(e) => onPartyChange(e.target.value)}
                class="select"
            >
                {#each Object.keys(LEGISLATORS_BY_PARTY).sort((a, b) => a.localeCompare(b, 'es')) as party_name}
                    <option value={party_name}>
                        {party_name}
                    </option>
                {/each}
            </select>
        </fieldset>
    </div>
    {/if}
</div>