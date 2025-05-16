<script lang="ts">
    import { onMount } from 'svelte';
    import Slider from './Slider.svelte';
    import { computeElectionResults } from '../dhondt';
    import ChamberDiagram from './ChamberDiagram.svelte';
    import { seatsAlreadyOccupied } from '../data/parties-metadata';
    import type { ElectionMetadata, ColumnSlider, PartyResult } from "../types";
    import {
        TOTAL_VOTERS,
        BLANK_VOTE_NAME,
        BLANK_VOTE_COLOR,
        NULL_VOTE_NAME,
        NULL_VOTE_COLOR,
    } from '../constants';

    let blankVote = {
        name: BLANK_VOTE_NAME,
        color: BLANK_VOTE_COLOR,
        percentage: 0,
    }
    let nullVote = {
        name: NULL_VOTE_NAME,
        color: NULL_VOTE_COLOR,
        percentage: 0,
    }
    export let candidatesMetadata: ElectionMetadata[];
    const initialSliders: ElectionMetadata[] = [...candidatesMetadata, blankVote, nullVote];
    let allSliders: ElectionMetadata[] = [...initialSliders];

    function resetSliders() {
        allSliders = [...initialSliders];
        sortByPercentage();
    }

    let partyResults: PartyResult[] = [];
    let sliderColumns: ColumnSlider[][];
    let slidersPerColumn = 3;
    let affirmativeVotes: number;
    let availableVoters: number;
    let thresholdDhondt: number;

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
        

        const {
            allSliders: newSliders,
            partyResults: newPartyResults,
            affirmativeVotes: newAffirmativeVotes,
            availableVoters: newAvailableVoters,
            thresholdDhondt: newThreshold,
        } = computeElectionResults({
            allSlidersInput: allSliders,
            totalVoters: TOTAL_VOTERS,
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

    function handleSliderChange(index: number, value: number) {
        const otherTotal = allSliders.reduce((sum, s, i) => i === index ? sum : sum + s.percentage, 0);
        const maxAllowed = Math.max(0, 100 - otherTotal);
        const clampedValue = Math.min(value, maxAllowed);
        allSliders = allSliders.map((s, i) => i === index ? { ...s, percentage: clampedValue } : s);
    }
</script>

<div class="flex justify-end w-full px-4 py-2">
    <button class="btn btn-outline btn-sm" on:click={resetSliders}>
        Reiniciar
    </button>
</div>

<div class="flex flex-col md:flex-row w-full relative">
    <div class="md:grid md:grid-cols-3 gap-4 w-full p-4 flex md:auto overflow-x-auto md:overflow-visible snap-x">
        {#each sliderColumns as column}
            <div class="flex flex-col gap-4 min-w-[60vw] md:min-w-0">
                {#each column as slider}
                    <div class="flex flex-col items-center gap-2">
                        {#if slider.name !== BLANK_VOTE_NAME && slider.name !== NULL_VOTE_NAME}
                            <Slider 
                                data={slider}
                                seats={slider.seats}
                                rank={rank[slider.globalIndex].rank}
                                asNeutral={affirmativeVotes > 0 && slider.seats === 0}
                                maxAllowed={Math.max(0, 100 - allSliders.reduce((sum, s, i) => i === slider.globalIndex ? sum : sum + s.percentage, 0))}
                                onChange={value => handleSliderChange(slider.globalIndex, value)} 
                            />
                        {:else}
                            <Slider 
                                data={slider}
                                seats={null}
                                rank={null}
                                asNeutral={affirmativeVotes > 0 && slider.percentage === 0}
                                maxAllowed={Math.max(0, 100 - allSliders.reduce((sum, s, i) => i === slider.globalIndex ? sum : sum + s.percentage, 0))}
                                onChange={value => handleSliderChange(slider.globalIndex, value)} 
                            />
                        {/if}
                    </div>
                {/each}
            </div>
        {/each}
    </div>

    <div class="sticky bottom-0 left-0 bg-base-100 w-full">
        <ChamberDiagram {partyResults} {affirmativeVotes} {availableVoters} {thresholdDhondt} showCounters={true} />
    </div>
</div>