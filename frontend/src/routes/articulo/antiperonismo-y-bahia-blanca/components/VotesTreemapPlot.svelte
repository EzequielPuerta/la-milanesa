<script lang="ts">
  import Papa from 'papaparse';
  import { onMount, onDestroy } from 'svelte';
  import { loadPlotlyFromCdn } from '$lib/plotly/load'
  import { splitTitleForMobile } from '$lib/plotly/split-title'
  import partidosColors from '../data/colores-partidos.json';

  export let csvUrl: string;
  export let title: string;

  let plotContainer: HTMLDivElement | null = null;
  let Plotly: any = null;
  let isMobile = false;
  let mounted = false;
  let currentPlotlyDiv: any = null;
  let cleanupFn: (() => void) | null = null;

  type Voto = { party: string; votes: number };

  async function loadCsv(url: string): Promise<Voto[]> {
    const res = await fetch(url);
    const text = await res.text();
    const result = Papa.parse<Voto>(text, {
      header: true,
      skipEmptyLines: true
    });
    return result.data.map(row => ({
      ...row,
      votes: parseFloat(row.votes as any),
    }));
  }

  onMount(async () => {
    if (typeof window === 'undefined') return;
    mounted = true;
    isMobile = window.innerWidth < 768;

    try {
      Plotly = await loadPlotlyFromCdn();
    } catch (err) {
      console.error('No se pudo cargar Plotly:', err);
      return;
    }

    const df = await loadCsv(csvUrl);

    // Agrupar votos por partido
    const totals: Record<string, number> = {};
    df.forEach((row) => {
      totals[row.party] = (totals[row.party] || 0) + row.votes;
    });

    const parties = Object.keys(totals);
    const votes = parties.map((p) => totals[p]);
    const totalVotes = votes.reduce((a, b) => a + b, 0);
    const percentages = votes.map((v) => (v / totalVotes) * 100);

    const data = [
    {
        type: 'treemap',
        labels: parties,
        parents: Array(parties.length).fill(''),
        values: votes,
        texttemplate: '%{label}<br>%{percentRoot:.2%}',
        textposition: 'inside',
        marker: {
        colors: parties.map((p) => partidosColors[p] ?? '#999999')
        },
        hovertemplate: 
        '%{label}<br>' + 
        'Total de votos: %{value}<br>' + 
        'Porcentaje: %{percentRoot:.2%}<extra></extra>'
    }
    ];

    const layout: any = {
      title: {
          text: splitTitleForMobile(title, isMobile),
          x: 0,
          xanchor: 'left',
          pad: { l: isMobile ? 20 : 60, t: 10 },
          font: { size: 16 } 
      },
      margin: { t: 80, l: isMobile ? 50 : 50, r: 50, b: 80 },
      autosize: true,
      showlegend: true
    };

    if (plotContainer) {
      await Plotly.newPlot(plotContainer, data, layout, { responsive: true });
      currentPlotlyDiv = plotContainer;
    }

    cleanupFn = () => {
      try {
        if (currentPlotlyDiv && Plotly && Plotly.purge) {
          Plotly.purge(currentPlotlyDiv);
        }
      } catch {}
    };
  });

  onDestroy(() => {
    if (cleanupFn) cleanupFn();
  });
</script>

<div bind:this={plotContainer} class="w-full max-w-screen-xl mx-auto" style="height:500px;"></div>
