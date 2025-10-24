<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  export let data: Record<string, any>;
  export let width = 600;
  export let height = 600;
  export let colorScheme = d3.schemeTableau10;
  export let colorMap: Record<string, string> = {};
  export let gap = 8;
  export let cornerRadius = 4;

  let container: HTMLDivElement;

  function dictToHierarchy(obj: Record<string, any>): d3.HierarchyNode<any> {
    function build(name: string, value: any): any {
      if (typeof value === 'object' && value !== null) {
        return {
          name,
          children: Object.entries(value).map(([k, v]) => build(k, v))
        };
      }
      return { name, value };
    }
    return d3.hierarchy(build('root', obj)).sum((d: any) => d.value ?? 0);
  }

  onMount(() => {
    if (!data) return;
    const hierarchy = dictToHierarchy(data);
    const radius = Math.min(width, height) / 2;

    const autoColor = d3.scaleOrdinal(colorScheme);
    const partition = d3.partition<any>().size([2 * Math.PI, radius]);
    const root = partition(hierarchy);

    const arc = d3
      .arc<d3.HierarchyRectangularNode<any>>()
      .startAngle((d) => d.x0 + 0.06)
      .endAngle((d) => d.x1 - 0.02)
      .innerRadius((d) => d.y0 + gap)
      .outerRadius((d) => d.y1 - gap)
      .cornerRadius(cornerRadius);

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`)
      .style('font', '12px sans-serif');

    const g = svg.append('g');

    const tooltip = d3
      .select(container)
      .append('div')
      .style('position', 'absolute')
      .style('background', 'rgba(0,0,0,0.8)')
      .style('color', 'white')
      .style('padding', '8px 10px')
      .style('border-radius', '6px')
      .style('font', '12px sans-serif')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('transition', 'opacity 0.2s ease');

    const segments = g
      .selectAll('path')
      .data(root.descendants().filter((d) => d.value > 0 && d.depth > 0))
      .join('path')
      .attr('d', arc)
      .attr('fill', (d) => {
        const customColor =
          colorMap[d.data.name] ??
          d.ancestors()
            .map((a) => colorMap[a.data.name])
            .find((c) => !!c);

        return customColor || autoColor(d.ancestors()[1]?.data.name || d.data.name);
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer');

    segments
      .on('mouseover', function (event, d) {
        const ancestors = d.ancestors();

        segments.attr('opacity', (node) =>
          ancestors.includes(node) ? 1 : 0.25
        );

        d3.select(this).attr('stroke', '#000').attr('stroke-width', 2);

        const path = ancestors
          .reverse()
          .slice(1)
          .map((n) => n.data.name)
          .join(' → ');

        const total = root.value ?? 1;
        const percent = ((d.value ?? 0) / total) * 100;

        tooltip
        .style('opacity', 1)
        .html(
          `<strong>${path}</strong><br/>
          Valor: ${d.value?.toLocaleString() ?? ''}<br/>
          (${percent.toFixed(1)}%)`
        )
      })
  });
</script>

<style>
  div.relative {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>

<div bind:this={container} class="relative w-full h-125"></div>
