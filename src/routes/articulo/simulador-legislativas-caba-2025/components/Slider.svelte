<script lang="ts">
    import { BLANK_VOTE_NAME, NULL_VOTE_NAME } from '../constants';

    export let data;
    export let seats: number | null;
    export let rank: number | null;
    export let asNeutral: boolean;
    export let maxAllowed: number = 100;
    export let onChange: (value: number) => void;

    function handleInput(e: Event) {
        const newValue = +(e.target as HTMLInputElement).value;
        onChange(newValue);
    }

    function darkenColor(hex: string, amount = 0.5): string {
        let color = hex.replace('#', '');
        const num = parseInt(color, 16);
        let r = (num >> 16) & 0xFF;
        let g = (num >> 8) & 0xFF;
        let b = num & 0xFF;

        r = Math.max(0, Math.floor(r * (1 - amount)));
        g = Math.max(0, Math.floor(g * (1 - amount)));
        b = Math.max(0, Math.floor(b * (1 - amount)));

        const newColor = '#' + ((1 << 24) + (r << 16) + (g << 8) + b)
            .toString(16)
            .slice(1)
            .toUpperCase();
        return newColor;
    }
</script>
  
<div class="w-60 md:w-45 flex flex-col gap-2">
    <div class="font-semibold text-sm" style="color: {asNeutral ? darkenColor(data.color, 0.3) : data.color}">
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
            min="0"
            max={maxAllowed}
            value={data.percentage}
            on:input={handleInput}
            class="range range-vertical h-[20px] range-error touch-none"
            style="color: {asNeutral ? darkenColor(data.color) : data.color}"
        />
    </div>
    <div class="flex items-center justify-between w-full gap-1">
        <span class="text-xs" style="color: {asNeutral ? darkenColor(data.color) : data.color}">
            {data.percentage}%
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
