<script lang="ts">
    import * as d3 from 'd3';
    import { onMount } from 'svelte';
    import type { Edge, Legislator } from '../types';
    import { PARTY_COLORS } from '../partyColors';
    import { PARTIES_BY_LEGISLATORS } from '../partiesByLegislators';
    import { PROVINCES_BY_LEGISLATORS } from '../provincesByLegislators';

    export let nodes: Legislator[] = [];
    export let edges: Edge[] = [];
    export let showIsolated = false;
    export let highlightedLegislators: string[] = [];

    let container: HTMLDivElement;
    let svg, g, simulation, tooltip;
    let nodeSelection: d3.Selection<SVGCircleElement, Legislator, SVGGElement, unknown>;

    const distanceScale = d3.scaleLinear().domain([0, 1]).range([400, 200]);

    onMount(() => {
        tooltip = document.createElement('div');
        tooltip.style.cssText = `
            position:absolute;
            pointer-events:none;
            background:rgba(0,0,0,0.9);
            padding:1rem;
            border-radius:1rem;
            color:white;
            font-size:0.9rem;
            display:none;
        `;
        document.body.appendChild(tooltip);
    });

    function renderGraph() {
        if (!container || !nodes.length || !edges.length) return;
        if (simulation) simulation.stop();
        container.innerHTML = '';

        const connectedIds = new Set(edges.flatMap(l => [l.source, l.target]));
        const filteredNodes = showIsolated ? nodes : nodes.filter(n => connectedIds.has(n._id));
        const filteredEdges = edges.filter(
            l => connectedIds.has(l.source) && connectedIds.has(l.target)
        );

        const width = container.clientWidth;
        const height = container.clientHeight;

        svg = d3.select(container)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', [0, 0, width, height])
            .call(
                d3.zoom<SVGSVGElement, unknown>()
                    .scaleExtent([0.2, 5])
                    .on('zoom', (event) => g.attr('transform', event.transform))
            );

        g = svg.append('g');

        const defs = svg.append('defs');
        defs.append('filter')
            .attr('id', 'grayscale')
            .append('feColorMatrix')
            .attr('type', 'matrix')
            .attr('values', `
                0.333 0.333 0.333 0 0
                0.333 0.333 0.333 0 0
                0.333 0.333 0.333 0 0
                0     0     0     1 0
            `);

        defs.selectAll('pattern')
            .data(filteredNodes)
            .join('pattern')
            .attr('id', d => `photo-${d._id}`)
            .attr('width', 1)
            .attr('height', 1)
            .attr('patternContentUnits', 'objectBoundingBox')
            .append('image')
            .attr('href', d => d.photo)
            .attr('preserveAspectRatio', 'xMidYMid slice')
            .attr('width', 1)
            .attr('height', 1)
            .attr('filter', 'url(#grayscale)');

        const link = g.append('g')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.4)
            .selectAll('line')
            .data(filteredEdges)
            .join('line')
            .attr('stroke-width', d => 1 + d.weight * 2);

        nodeSelection = g.append('g')
            .selectAll('circle')
            .data(filteredNodes)
            .join('circle')
            .attr('r', 20)
            .attr('stroke', d => PARTY_COLORS[PARTIES_BY_LEGISLATORS[d.full_name]])
            .attr('stroke-width', 3)
            .attr('fill', d => `url(#photo-${d._id})`)
            .call(
                d3.drag<SVGCircleElement, any>()
                    .on('start', dragstarted)
                    .on('drag', dragged)
                    .on('end', dragended)
            )
            .on('mouseenter', (event, d) => {
                const party = PARTIES_BY_LEGISLATORS[d.full_name];
                const color = PARTY_COLORS[party];
                const province = PROVINCES_BY_LEGISLATORS[d.full_name];
                tooltip.innerHTML = `
                    <strong>${d.full_name}</strong><br/>
                    <span class="italic">${province}</span><br/>
                    <span style="color:${color};font-weight:600;">${party}</span>
                `;
                tooltip.style.display = 'block';
            })
            .on('mousemove', (event) => {
                tooltip.style.left = event.pageX + 10 + 'px';
                tooltip.style.top = event.pageY + 10 + 'px';
            })
            .on('mouseleave', () => (tooltip.style.display = 'none'));

        simulation = d3.forceSimulation(filteredNodes as any)
            .force('link', d3.forceLink(filteredEdges).id((d: any) => d._id)
                .distance((d: any) => distanceScale(d.weight))
            )
            .force('charge', d3.forceManyBody().strength(-50))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .on('tick', ticked);

        function ticked() {
            link
                .attr('x1', (d: any) => d.source.x)
                .attr('y1', (d: any) => d.source.y)
                .attr('x2', (d: any) => d.target.x)
                .attr('y2', (d: any) => d.target.y);

            nodeSelection
                .attr('cx', (d: any) => d.x)
                .attr('cy', (d: any) => d.y);
        }

        function dragstarted(event: any, d: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        function dragged(event: any, d: any) {
            d.fx = event.x;
            d.fy = event.y;
        }
        function dragended(event: any, d: any) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }

    $: if (nodes.length && edges.length) {
        renderGraph();
    }

    $: if (nodeSelection) {
        nodeSelection
            .attr('r', d => highlightedLegislators.includes(d.full_name) ? 25 : 15)
            .attr('stroke', d => PARTY_COLORS[PARTIES_BY_LEGISLATORS[d.full_name]])
            .attr('stroke-width', d => highlightedLegislators.includes(d.full_name) ? 4 : 3)
            .style('filter', d => highlightedLegislators.length && !highlightedLegislators.includes(d.full_name) ? 'brightness(0.6)' : 'brightness(1)');

        nodeSelection
            .filter(d => highlightedLegislators.includes(d.full_name))
            .raise();
    }
</script>

<style>
    div {
        width: 100%;
        height: 100vh;
        overflow: hidden;
    }
</style>

<div bind:this={container}></div>
