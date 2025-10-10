<script lang="ts">
    import type { ElectionMetadata } from "../types";
    import { scaleLinear } from 'd3-scale';
    import { max } from 'd3-array';
    import { isMobile } from '$lib/stores/isMobile';
    import { darkenColor } from '$lib/colors';
	import { derived } from 'svelte/store';
    import AxisY from "./AxisY.svelte";

    export let allSliders: ElectionMetadata[];

    $: externalSliders = [...allSliders];
    $: slidersForBarChart = [...externalSliders.sort((a, b) => b.percentage - a.percentage)];
    $: maxPercentage = max(externalSliders, s => s.percentage) ?? 100;
    
    const barWidth = derived(isMobile, ($isMobile) => $isMobile ? 25 : 25);
    const barGap = derived(isMobile, ($isMobile) => $isMobile ? 10 : 10);
    const nameLegend = derived(isMobile, ($isMobile) => $isMobile ? -5 : -2);
    const titlePosition = derived(isMobile, ($isMobile) => $isMobile ? 200 : width/2);
    const height = derived(isMobile, ($isMobile) => $isMobile ? 200 : 400);
    const marginBottom = derived(isMobile, ($isMobile) => $isMobile ? 24 : 28);
    const margin = {
        top: 25,
        right: 0,
        left: 30,
        bottom: $marginBottom,
    }

    $: width = margin.left + margin.right + ($barWidth + $barGap) * externalSliders.length;
    $: chartHeight = $height - margin.top - margin.bottom;
    $: yScale = scaleLinear()
        .domain([0, maxPercentage || 100])
        .range([chartHeight - margin.top - margin.bottom, 0])
</script>

<div class="w-full p-4 overflow-x-auto text-gray-400">
    <svg {width} height={$height}>
        <text
            x={$titlePosition}
            y={margin.top / 2}
            text-anchor="middle"
            font-size="16"
            font-weight="bold"
            class="fill-current"
        >
            Porcentajes y bancas
        </text>
        <AxisY
            width={width - margin.left - margin.right}
            height={chartHeight}
            {margin}
            {yScale}
        />
        {#each slidersForBarChart as slider, i}
            <g transform={`translate(${margin.left + (i * ($barWidth + $barGap))}, ${margin.top})`}>
                <rect
                    x=0
                    y={yScale(slider.percentage)}
                    width={$barWidth}
                    height={yScale(0) - yScale(slider.percentage)}
                    fill={slider.seats == 0 ? darkenColor(slider.color, 0.7) : slider.color}
                />
                <text
                    x={$barWidth/2}
                    y={yScale(slider.percentage)-5}
                    text-anchor="middle"
                    fill={slider.seats == 0 ? darkenColor(slider.color, 0.7) : slider.color}
                    font-weight=1000
                    font-size="12">
                        {slider.percentage.toFixed(0)}%
                </text>
                {#if slider.seats}
                    <text
                        x={$barWidth/2}
                        y={yScale(slider.percentage/2)+5}
                        text-anchor="middle"
                        class="fill-neutral"
                        font-weight=1000
                        font-size="12">
                            +{slider.seats}
                    </text>
                {/if}
                <text
                    x={$nameLegend}
                    font-size=12
                    fill={slider.seats == 0 ? darkenColor(slider.color, 0.7) : slider.color}
                    transform="rotate(-55, 0, {yScale(0)})"
                    text-anchor="end"
                    y={yScale($nameLegend)}
                >
                        {slider.name.split(',')[0]}
                </text>
            </g>
        {/each}
    </svg>
</div>
