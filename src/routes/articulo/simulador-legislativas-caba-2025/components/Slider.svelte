<script lang="ts">
    import { BLANK_VOTE_NAME, NULL_VOTE_NAME } from '../constants';
    import { darkenColor } from '$lib/colors';

    export let data;
    export let disabled: boolean;
    export let seats: number | null;
    export let rank: number | null;
    export let asNeutral: boolean;
    export let maxAllowed: number = 100;
    export let onChange: (value: number) => void;

    function handleInput(e: Event) {
        const newValue = +(e.target as HTMLInputElement).value;
        onChange(newValue);
    }
</script>
  
<div class="w-50 md:w-30 lg:w-45 flex flex-col gap-0.5 md:gap-2">
    <div class="font-semibold text-xs md:text-sm" style="color: {asNeutral ? darkenColor(data.color, 0.3) : data.color}">
        {#if data.name !== BLANK_VOTE_NAME && data.name !== NULL_VOTE_NAME}
            {rank}°) {data.name} {(rank === 1) && (data.percentage > 0) ? '🎉' : ''}
        {:else}
            {data.name}
        {/if}
    </div>
    {#if data.party}
        <div class="font-thin text-xs" style="color: {asNeutral ? darkenColor(data.color, 0.2) : data.color}">
            {data.party} ({data.alias})
        </div>
    {/if}
    <div class="flex items-center justify-end w-full gap-1">
        <input
            type="range"
            disabled={disabled}
            min="0"
            max={maxAllowed}
            value={data.percentage}
            on:input={handleInput}
            class="range range-vertical h-[15px] md:h-[20px] range-error touch-none"
            style="color: {asNeutral ? darkenColor(data.color) : data.color}"
        />
    </div>
    <div class="flex items-center justify-between w-full gap-1">
        <span class="text-xs" style="color: {asNeutral ? darkenColor(data.color) : data.color}">
            {data.percentage.toFixed(2)}%
        </span>
        {#if data.party}
            <span class="text-xs" style="color: {asNeutral ? darkenColor(data.color) : data.color}">
                {data.currentVoters?.toLocaleString?.()} votos
            </span>
            <span class="text-xs whitespace-nowrap" style="color: {asNeutral ? darkenColor(data.color) : data.color}">
                {seats} {seats === 1 ? 'banca' : 'bancas'}
            </span>
        {:else}
            <span class="text-xs whitespace-nowrap" style="color: {asNeutral ? darkenColor(data.color) : data.color}">
                {data.currentVoters?.toLocaleString?.()} votos
            </span>
        {/if}
    </div>
</div>
