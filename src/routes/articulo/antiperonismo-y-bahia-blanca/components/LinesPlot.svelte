<script lang="ts">
  import Papa from 'papaparse';
  import { onMount, onDestroy } from 'svelte';
  import { splitTitleForMobile } from '$lib/plotly/split-title'
  import { loadPlotlyFromCdn } from '$lib/plotly/load';

  let plotContainer: HTMLDivElement | null = null;
  let Plotly: any = null;
  let currentPlot: any = null;
  let isMobile = false;

  export let csvUrl: string;
  export let title: string;

  type Row = {
    trace_id: string;
    party: string;
    election: string;
    percentage: number;
    order: number;
    name: string;
  };

  async function loadCsv(url: string): Promise<Row[]> {
    const res = await fetch(url);
    const text = await res.text();
    const result = Papa.parse<Row>(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    });
    return result.data as Row[];
  }

  onMount(async () => {
    Plotly = await loadPlotlyFromCdn();
    const data = await loadCsv(csvUrl);
    isMobile = window.innerWidth < 768;

    // Agrupar por trace_id + name
    const groups: Record<string, Row[]> = {};
    data.forEach(d => {
      const key = `${d.trace_id}_${d.name}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(d);
    });

    // Ordenar por order dentro de cada grupo
    Object.values(groups).forEach(arr => arr.sort((a, b) => a.order - b.order));

    // Colores según trace_id
    const colors: Record<string, string> = {
      '1': '#68508b',
      '2': '#00b4f0',
      '3': '#facc15'
    };

    // Crear traces
    const traces = Object.entries(groups).map(([key, rows]) => ({
      x: rows.map(r => r.election),
      y: rows.map(r => r.percentage),
      mode: 'lines+markers',
      name: rows[0].name, // usar name como etiqueta
      line: { color: colors[rows[0].trace_id], width: 3 },
      marker: { size: 6, color: colors[rows[0].trace_id] },
      text: rows.map(r => `${r.party}<br>${r.election}<br>${r.percentage.toFixed(2)}%`),
      hoverinfo: 'text'
    }));

    const layout = {
      title: {
        text: splitTitleForMobile(title, isMobile),
        x: 0,
        xanchor: 'left',
        pad: { l: isMobile ? 20 : 60, t: 10 },
        font: { size: 16 } 
      },
      xaxis: {
        title: '',
        type: 'category',
        tickangle: 300,
      },
      yaxis: { title: 'Porcentaje', ticksuffix: '%', range: [0, 100] },
      margin: { l: 80, r: 50, t: 80, b: isMobile ? 160 : 80 },
      legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.3 },
      showlegend: !isMobile
    };

    if (plotContainer) {
      await Plotly.newPlot(plotContainer, traces, layout, { responsive: true });
      currentPlot = plotContainer;
    }
  });

  onDestroy(() => {
    if (currentPlot && Plotly?.purge) Plotly.purge(currentPlot);
  });
</script>

<div
    bind:this={plotContainer}
    class="w-full max-w-screen-xl mx-auto"
    style="height:600px;"
></div>
