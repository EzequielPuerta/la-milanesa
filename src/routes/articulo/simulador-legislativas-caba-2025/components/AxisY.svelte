<script lang="ts">
    import { scaleLinear, type ScaleLinear } from 'd3-scale';

    export let width: number;
    export let height: number;
    export let margin: { top: number; right: number; bottom: number; left: number };
    export let yScale: ScaleLinear<number, number, never>;
    let yTicks = Array.from({ length: 11 }, (_, i) => i * 10);
</script>

<g transform="translate({margin.left} {margin.top})">
    {#each yTicks as tick}
        <text
            x={-25}
            y={yScale(tick)}
            dy=-6
            text-anchor="hanging"
            font-size="12"
            class="fill-current"
        >
            {tick}
        </text>
        <line
            x1=0
            y1={yScale(tick)}
            x2={width}
            y2={yScale(tick)}
            stroke="#CECECE"
            stroke-width=1
            stroke-dasharray=4
            stroke-opacity=0.3
        />
    {/each}
</g>
