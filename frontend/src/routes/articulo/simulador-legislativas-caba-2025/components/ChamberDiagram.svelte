<script lang="ts">
    import type { PartyResult } from "../types";
    import { candidatesMetadata } from '../data/parties-metadata';
    import {
        NEUTRAL_PARTY_NAME,
        PRESIDENCY_PARTY,
    } from '../constants';

    export let partyResults: PartyResult[];
    export let affirmativeVotes: number;
    export let availableVoters: number;
    export let thresholdDhondt: number;
    export let showCounters: boolean;

    const width = 600;
    const height = 230;
    const centerX = width / 2;
    const centerY = height+10;
    const innerRadius = 125;
    const middleRadius = 175;
    const outerRadius = 225;
    const radius = 8;
    const presidencyColor = candidatesMetadata.find(p => p.party === PRESIDENCY_PARTY)?.color;

    const angleMargin = (Math.PI / 180) * 10;
    const startLeft = Math.PI / 2 + angleMargin;
    const endLeft = Math.PI - angleMargin;
    const startRight = angleMargin;
    const endRight = Math.PI / 2 - angleMargin;

    function generateArcPoints(count: number, radius: number, startAngle: number, endAngle: number) {
        return Array.from({ length: count }, (_, i) => {
            const angle = startAngle + ((endAngle - startAngle) / (count - 1)) * i;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY - radius * Math.sin(angle);
            return { x, y };
        });
    }

    const dots = [
        ...generateArcPoints(13, outerRadius, startLeft, endLeft),
        ...generateArcPoints(10, middleRadius, startLeft, endLeft),
        ...generateArcPoints(7, innerRadius, startLeft, endLeft),
        ...generateArcPoints(13, outerRadius, startRight, endRight),
        ...generateArcPoints(10, middleRadius, startRight, endRight),
        ...generateArcPoints(7, innerRadius, startRight, endRight),
    ];

    $: colors = partyResults.flatMap(result =>
        Array(result.seats).fill(result.color)
    );

    $: groupedResults = (() => {
        const partyMap = new Map<string | null, PartyResult>();

        for (const { party, alias, seats, position, color } of partyResults) {
            if (party === NEUTRAL_PARTY_NAME) continue;

            if (!partyMap.has(party)) {
                partyMap.set(party, { party, alias, seats, position, color });
            } else {
                const existing = partyMap.get(party)!;
                existing.seats += seats;
            }
        }

        const grouped: Record<string, PartyResult[]> = {};

        for (const result of partyMap.values()) {
            const key = result.position;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(result);
        }

        for (const key in grouped) {
            grouped[key].sort((a, b) => b.seats - a.seats);
        }

        return grouped;
    })();
  
    $: partyResultsForTooltip = partyResults.flatMap(result =>
        Array(result.seats).fill(
            result.party === NEUTRAL_PARTY_NAME
                ? result.party
                : result.alias
                    ? ((result.originalParty) && (result.originalParty !== result.party))
                        ? `${result.party} (${result.alias} - ex ${result.originalParty})`
                        : `${result.party} (${result.alias})`
                    : result.party
        )
    );

    $: totalsByPosition = Object.fromEntries(
        Object.entries(groupedResults).map(([position, results]) => [
            position,
            results.reduce((sum, r) => sum + r.seats, 0)
        ])
    );

    $: governmentSeats = partyResults
        .filter(p => p.position === "Oficialismo" || p.position === "Aliados")
        .reduce((sum, p) => sum + p.seats, 0);

    $: oppositionSeats = partyResults
        .filter(p => p.position === "Oposición")
        .reduce((sum, p) => sum + p.seats, 0);

    $: governmentAdvantage  = governmentSeats - oppositionSeats;
</script>

<div class="flex flex-col items-center p-4 w-full">
    <svg viewBox={`0 0 ${width} ${height}`} class="w-full h-auto max-w-[600px]">
        {#each dots as { x, y }, i}
            <circle cx={x} cy={y} r={radius} fill={colors[i]}>
                <title>{partyResultsForTooltip[i]}</title>
            </circle>
        {/each}
        <circle cx={centerX} cy={centerY - 20} r={radius} fill={presidencyColor}>
            <title>PRO</title>
        </circle>
    </svg>

    <div class="flex justify-center gap-4 text-center">
        {#if showCounters}
            <div class="flex flex-col items-center mt-1 md:mt-3">
                <p class="px-0 text-xs md:text-sm font-medium text-gray-500">Votos afirmativos</p>
                <p class="px-0 text-md md:text-2xl font-semibold text-gray-700">{affirmativeVotes.toFixed(0)}%</p>
            </div>
            <div class="flex flex-col items-center mt-1 md:mt-3">
                <p class="px-0 text-xs md:text-sm font-medium text-gray-500">Votos disponibles</p>
                <p class="px-0 text-md md:text-2xl font-semibold"
                    class:text-error={availableVoters > 0}>
                    {availableVoters.toLocaleString()}
                </p>
            </div>
            <div class="flex flex-col items-center mt-1 md:mt-3">
                <p class="px-0 text-xs md:text-sm font-medium text-gray-500">Ventaja Oficialista</p>
                <p class="px-0 text-md md:text-2xl font-semibold"
                    class:text-success={governmentAdvantage > 0}
                    class:text-warning={governmentAdvantage === 0}
                    class:text-error={governmentAdvantage < 0}>
                    {governmentAdvantage > 0 ? '+' : ''}{governmentAdvantage}</p>
            </div>
            <div class="flex flex-col items-center mt-1 md:mt-3">
                <p class="px-0 text-xs md:text-sm font-medium text-gray-500">Umbral D’Hondt</p>
                <p class="px-0 text-md md:text-2xl font-semibold text-gray-700">{thresholdDhondt.toLocaleString()}</p>
            </div>
        {/if}
    </div>

    <div class="mt-2 md:mt-6 w-full max-w-[600px]">
        <div class="flex flex-wrap justify-center gap-4 sm:gap-10">
            <div class="flex flex-col items-start">
                {#if groupedResults['Oficialismo']}
                    <h4 class="text-xs font-semibold text-gray-500 mb-1">Oficialismo ({totalsByPosition['Oficialismo']})</h4>
                    {#each groupedResults['Oficialismo'] as { alias, seats, color }}
                        <div class="flex items-center gap-2 mb-1" style="color: {color}">
                            <p class="px-0 text-xs">{alias}: {seats}</p>
                        </div>
                    {/each}
                {/if}

                {#if groupedResults['Independientes']}
                    <h4 class="text-xs font-semibold text-gray-500 mb-1">Independientes ({totalsByPosition['Independientes']})</h4>
                    <div class="grid grid-cols-2 gap-x-1">
                        {#each [0, 1] as colIndex}
                            <div class="flex flex-col items-start">
                                {#each groupedResults['Independientes'].slice(
                                    colIndex * Math.ceil(groupedResults['Independientes'].length / 2),
                                    (colIndex + 1) * Math.ceil(groupedResults['Independientes'].length / 2)
                                ) as { alias, seats, color }}
                                    <div class="flex items-center gap-1 mb-1" style="color: {color}">
                                        <p class="px-0 text-xs">{alias}: {seats}</p>
                                    </div>
                                {/each}
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>

            <div class="flex flex-col items-start">
                {#if groupedResults['Oposición']}
                    <h4 class="text-xs font-semibold text-gray-500 mb-1">Oposición ({totalsByPosition['Oposición']})</h4>
                    {#each groupedResults['Oposición'] as { alias, seats, color }}
                        <div class="flex items-center gap-2 mb-1" style="color: {color}">
                            <p class="px-0 text-xs">{alias}: {seats}</p>
                        </div>
                    {/each}
                {/if}
            </div>

            <div class="flex flex-col">
                {#if groupedResults['Aliados']}
                    <h4 class="text-xs font-semibold text-gray-500 mb-1">Aliados ({totalsByPosition['Aliados']})</h4>
                    {#each groupedResults['Aliados'] as { alias, seats, color }}
                        <div class="flex items-center gap-2 mb-1" style="color: {color}">
                            <p class="px-0 text-xs">{alias}: {seats}</p>
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
    </div>
</div>
