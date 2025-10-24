<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { loadPlotlyFromCdn } from '$lib/plotly/load';
  import { splitTitleForMobile } from '$lib/plotly/split-title';

  export let title: string = '';
  export let data: any[] = [];
  export let groupBy: ((d: any) => string) | string;
  export let sortBy: ((a: any, b: any) => number) | string = 'order';
  export let traceField: string;
  export let colors: Record<string, string> = {};
  export let colorField: string;
  export let xField: string = 'x';
  export let yField: string = 'y';
  export let xaxis: Record<string, any> = {};
  export let yLabel: string = '';
  export let tooltipFormatter: ((row: any) => string) = (r) =>
    `${r.name || ''}<br>${r[xField]}: ${r[yField]}`;
  export let ignoreTraces: ((trace: { name: string; color: string }) => boolean) | null = null;
  export let milestones: {date: string; label: string}[] = [];

  let plotContainer: HTMLDivElement | null = null;
  let Plotly: any = null;
  let currentPlot: any = null;
  let isMobile = false;

  function getKey(d: any): string {
    return typeof groupBy === 'function' ? groupBy(d) : d[groupBy];
  }

  function sortFn(a: any, b: any): number {
    if (typeof sortBy === 'function') return sortBy(a, b);
    if (a[sortBy] < b[sortBy]) return -1;
    if (a[sortBy] > b[sortBy]) return 1;
    return 0;
  }

  function buildTraces(data: any[]) {
    const groups: Record<string, any[]> = {};
    data.forEach(d => {
      const key = getKey(d);
      if (!groups[key]) groups[key] = [];
      groups[key].push(d);
    });

    Object.values(groups).forEach(arr => arr.sort(sortFn));

    return Object.entries(groups).map(([key, rows]) => {
      const color = colors[rows[0][colorField]] || '#888';
      const traceInfo = { name: rows[0][traceField], color };
      const shouldIgnore = ignoreTraces?.(traceInfo) ?? false;

      return {
        x: rows.map(r => r[xField]),
        y: rows.map(r => r[yField]),
        mode: 'lines+markers',
        name: rows[0][traceField],
        line: { color, width: 3 },
        marker: { size: 6, color },
        text: rows.map(r => tooltipFormatter(r)),
        hoverinfo: 'text',
        visible: shouldIgnore ? 'legendonly' : true
      };
    });
  }

  function buildLayout() {
    const shapes: any[] = [];
    const annotations: any[] = [];

    milestones.forEach(m => {
      shapes.push({
        type: 'line',
        x0: m.date,
        x1: m.date,
        yref: 'paper',
        y0: 0,
        y1: 1,
        line: {
          color: '#bbb',
          width: 1,
          dash: 'dot'
        }
      });

      annotations.push({
        x: m.date,
        yref: 'paper',
        y: 0.1,
        text: m.label,
        showarrow: false,
        font: { size: 12, color: '#333' },
        textangle: -90,
        xanchor: 'center'
      });
    });

    return {
      title: {
        text: splitTitleForMobile(title, isMobile),
        x: 0,
        xanchor: 'left',
        pad: { l: isMobile ? 20 : 60, t: 10 },
        font: { size: 16 }
      },
      xaxis: xaxis,
      yaxis: { title: yLabel, ticksuffix: '%', range: [0, 100] },
      margin: { l: 80, r: 50, t: 100, b: isMobile ? 160 : 80 },
      legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.3 },
      showlegend: !isMobile,
      shapes,
      annotations
    };
  }

  onMount(async () => {
    Plotly = await loadPlotlyFromCdn();
    isMobile = window.innerWidth < 768;

    if (plotContainer) {
      const traces = buildTraces(data);
      const layout = buildLayout();
      await Plotly.newPlot(plotContainer, traces, layout, { responsive: true });
      currentPlot = plotContainer;
    }
  });

  $: if (Plotly && plotContainer && data?.length) {
    const traces = buildTraces(data);
    const layout = buildLayout();
    Plotly.react(plotContainer, traces, layout, { responsive: true });
  }

  onDestroy(() => {
    if (currentPlot && Plotly?.purge) Plotly.purge(currentPlot);
  });
</script>

<div
  bind:this={plotContainer}
  class="w-full max-w-screen-xl mx-auto"
  style="height:600px;"
>
</div>
