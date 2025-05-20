<script lang="ts">
    import { onMount } from 'svelte';
	import { BarChart, Pencil, Users } from 'lucide-svelte';
    import Slider from './Slider.svelte';
    import ChamberDiagram from './ChamberDiagram.svelte';
    import CandidatesByPercentageBarChart from './CandidatesByPercentageBarChart.svelte';
    import { computeElectionResults } from '../dhondt';
    import { seatsAlreadyOccupied } from '../data/parties-metadata';
    import type { ElectionMetadata, ColumnSlider, PartyResult } from "../types";
    import {
        TOTAL_VOTERS,
        BLANK_VOTE_NAME,
        BLANK_VOTE_COLOR,
        NULL_VOTE_NAME,
        NULL_VOTE_COLOR,
    } from '../constants';

    

    export let candidatesMetadata: ElectionMetadata[];
    export let initialParticipationRate: number = 100;
    export let initialBlankVotePercentage: number = 0;
    let initialNullVotePercentage: number = 100;
    let participationRate: number = initialParticipationRate;
    let blankVotePercentage: number = initialBlankVotePercentage;
    let nullVotePercentage: number = initialNullVotePercentage;
    
    let blankVote = {
        name: BLANK_VOTE_NAME,
        color: BLANK_VOTE_COLOR,
        percentage: blankVotePercentage,
    }
    let nullVote = {
        name: NULL_VOTE_NAME,
        color: NULL_VOTE_COLOR,
        percentage: nullVotePercentage,
    }

    const initialSliders: ElectionMetadata[] = [...candidatesMetadata, blankVote, nullVote];
    let allSliders: ElectionMetadata[] = [...initialSliders];
    const nullIndex = allSliders.length - 1;

    function resetSliders() {
        allSliders = recalculateNullVote([...initialSliders]);
        participationRate = initialParticipationRate;
        blankVotePercentage = initialBlankVotePercentage;
        nullVotePercentage = initialNullVotePercentage;
        sortByPercentage();
    }

    let partyResults: PartyResult[] = [];
    let sliderColumns: ColumnSlider[][];
    let slidersPerColumn = 3;
    let affirmativeVotes: number;
    let availableVoters: number;
    let thresholdDhondt: number;
    let showGraph = true;

    $: rank = allSliders.slice(0, -2)
        .map((slider, i) => ({ ...slider, index: i }))
        .sort((a, b) => b.percentage - a.percentage)
        .map((slider, i) => ({ ...slider, rank: i + 1 }))
        .sort((a, b) => a.index - b.index);

    function updateSlidersPerColumn() {
        slidersPerColumn = window.innerWidth < 768 ? 3 : 6;
    }

    function sortByPercentage() {
        const rankedSliders = allSliders.filter(
            s => s.name !== BLANK_VOTE_NAME && s.name !== NULL_VOTE_NAME
        );
        const specialSliders = allSliders.filter(
            s => s.name === BLANK_VOTE_NAME || s.name === NULL_VOTE_NAME
        );
        rankedSliders.sort((a, b) => (b.percentage ?? Infinity) - (a.percentage ?? Infinity));
        allSliders = [...rankedSliders, ...specialSliders];
    }

    onMount(() => {
        sortByPercentage();
        updateSlidersPerColumn();
        window.addEventListener('resize', updateSlidersPerColumn);
        return () => window.removeEventListener('resize', updateSlidersPerColumn);
    });

    $: {
        const adjustedTotalVoters = Math.round(TOTAL_VOTERS * participationRate / 100);

        const {
            allSliders: newSliders,
            partyResults: newPartyResults,
            affirmativeVotes: newAffirmativeVotes,
            availableVoters: newAvailableVoters,
            thresholdDhondt: newThreshold,
        } = computeElectionResults({
            allSlidersInput: allSliders,
            totalVoters: adjustedTotalVoters,
            seatsAlreadyOccupied,
        });

        allSliders = newSliders;
        partyResults = newPartyResults;
        affirmativeVotes = newAffirmativeVotes;
        availableVoters = newAvailableVoters;
        thresholdDhondt = newThreshold;
    }

    $ : {
        sliderColumns = (() => {
            const columns = [];
            for (let i = 0; i < allSliders.length; i += slidersPerColumn) {
                columns.push(
                    allSliders
                        .slice(i, i + slidersPerColumn)
                        .map((slider, idx) => ({
                            ...slider,
                            globalIndex: i + idx
                        }))
                );
            }
            return columns;
        })();
    }

    function recalculateNullVote(sliders: ElectionMetadata[]) {
        const nullIndex = sliders.length - 1;
        const totalExceptNull = sliders
            .slice(0, nullIndex)
            .reduce((sum, s) => sum + s.percentage, 0);

        const updatedSliders = [...sliders];
        updatedSliders[nullIndex] = {
            ...updatedSliders[nullIndex],
            percentage: Math.max(0, 100 - totalExceptNull)
        };
        return updatedSliders;
    }

    function handleSliderChange(index: number, value: number) {
        const nullIndex = allSliders.length - 1;

        // Sumamos todos excepto el slider que cambiamos y el voto nulo
        const otherTotal = allSliders.reduce((sum, s, i) => {
            if (i === index || i === nullIndex) return sum;
            return sum + s.percentage;
        }, 0);

        // Limitamos el valor del slider actual para no superar 100%
        const clampedValue = Math.min(value, 100 - otherTotal);

        let updatedSliders = allSliders.map((s, i) =>
            i === index ? { ...s, percentage: clampedValue } : s
        );

        updatedSliders = recalculateNullVote(updatedSliders);

        allSliders = updatedSliders;
    }

    $: {
        const totalExceptNull = allSliders
            .slice(0, -1)
            .reduce((sum, s) => sum + s.percentage, 0);
        const nullPercentage = allSliders[allSliders.length - 1].percentage;

        if (Math.round(totalExceptNull + nullPercentage) !== 100) {
            allSliders = recalculateNullVote(allSliders);
        }
    }
</script>

<div class="flex justify-between items-center w-full px-4 py-6">
    <label class="flex items-center gap-2">
        <BarChart class="w-4 h-4" />
        <input type="checkbox" class="toggle toggle-sm" bind:checked={showGraph} />
        <Pencil class="w-4 h-4" />
    </label>
    <div class="w-full flex justify-center items-center gap-2 px-4">
        <Users class="w-5 h-5 text-base-content" />
        <input
            id="participation"
            type="range"
            min="0"
            max="100"
            bind:value={participationRate}
            class="range range-sm max-w-xs md:w-50"
        />
        <span class="text-sm">{participationRate}%</span>
    </div>
    <button class="btn btn-outline btn-sm" on:click={resetSliders}>
        Reiniciar
    </button>
</div>

<div class="flex flex-col md:flex-row w-full relative">
    {#if showGraph}
        <div class="md:grid md:grid-cols-3 gap-4 w-full p-4 flex md:auto overflow-x-auto md:overflow-visible snap-x">
            {#each sliderColumns as column}
                <div class="flex flex-col gap-4 min-w-[60vw] md:min-w-0">
                    {#each column as slider}
                        <div class="flex flex-col items-center gap-2">
                            {#if slider.name !== BLANK_VOTE_NAME && slider.name !== NULL_VOTE_NAME}
                                <Slider 
                                    data={slider}
                                    disabled={false}
                                    seats={slider.seats}
                                    rank={rank[slider.globalIndex].rank}
                                    asNeutral={affirmativeVotes > 0 && slider.seats === 0}
                                    maxAllowed={(() => {
                                        const nullIndex = allSliders.length - 1;
                                        return Math.max(0, 100 - allSliders.reduce((sum, s, i) => {
                                            if (i === slider.globalIndex || i === nullIndex) return sum;
                                            return sum + s.percentage;
                                        }, 0));
                                    })()}
                                    onChange={value => handleSliderChange(slider.globalIndex, value)} 
                                />
                            {:else if slider.name === BLANK_VOTE_NAME}
                                <Slider 
                                    data={slider}
                                    disabled={false}
                                    seats={null}
                                    rank={null}
                                    asNeutral={affirmativeVotes > 0 && slider.percentage === 0}
                                    maxAllowed={(() => {
                                        const nullIndex = allSliders.length - 1;
                                        return Math.max(0, 100 - allSliders.reduce((sum, s, i) => {
                                            if (i === slider.globalIndex || i === nullIndex) return sum;
                                            return sum + s.percentage;
                                        }, 0));
                                    })()}
                                    onChange={value => handleSliderChange(slider.globalIndex, value)} 
                                />
                            {:else if slider.name === NULL_VOTE_NAME}
                                <Slider 
                                    data={slider}
                                    disabled={true}
                                    seats={null}
                                    rank={null}
                                    asNeutral={affirmativeVotes > 0 && slider.percentage === 0}
                                    maxAllowed={100}
                                    onChange={value => handleSliderChange(slider.globalIndex, value)} 
                                />
                            {/if}
                        </div>
                    {/each}
                </div>
            {/each}
        </div>
    {:else}
        <div class="w-full p-4">
            <CandidatesByPercentageBarChart allSliders={allSliders} />
        </div>
    {/if}
    <div class="sticky bottom-0 left-0 bg-base-100 w-full">
        <ChamberDiagram {partyResults} {affirmativeVotes} {availableVoters} {thresholdDhondt} showCounters={true} />
    </div>
</div>