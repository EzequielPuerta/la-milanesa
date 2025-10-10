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
  let currentPlotlyDiv: any = null;
  let cleanupFn: (() => void) | null = null;

  type Row = {
    icv_bucket: string;
    party: string;
    votes: number;
  };

  async function loadCsv(url: string): Promise<Row[]> {
    const res = await fetch(url);
    const text = await res.text();
    const result = Papa.parse<Row>(text, {
      header: true,
      skipEmptyLines: true
    });
    return result.data.map(row => ({
      ...row,
      votes: parseFloat(row.votes as any)
    }));
  }

  onMount(async () => {
    if (typeof window === 'undefined') return;
    isMobile = window.innerWidth < 768;

    try {
      Plotly = await loadPlotlyFromCdn();
    } catch (err) {
      console.error('No se pudo cargar Plotly:', err);
      return;
    }

    const df = await loadCsv(csvUrl);

    const uniqueBuckets = Array.from(new Set(df.map(d => d.icv_bucket)));
    const uniqueParties = Array.from(new Set(df.map(d => d.party)));

    const traces = uniqueParties.map(party => {
      const y = uniqueBuckets.map(bucket => {
        const row = df.find(d => d.icv_bucket === bucket && d.party === party);
        return row ? row.votes : 0;
      });

      return {
        x: uniqueBuckets,
        y,
        name: party,
        type: 'bar',
        marker: { color: partidosColors[party] ?? '#999999' },
        text: y.map(v => v > 0 ? v.toString() : ''),
        textposition: 'auto',
        hovertemplate:
          "<b>%{fullData.name}</b><br>" +
          "Intervalo ICV: %{x}<br>" +
          "Votos totales: %{y}" +
          "<extra></extra>"
      };
    });

    const layout: any = {
      title: {
          text: splitTitleForMobile(title, isMobile),
          x: 0,
          xanchor: 'left',
          pad: { l: isMobile ? 20 : 60, t: 10 },
          font: { size: 16 } 
      },
      barmode: 'group',
      xaxis: {
        title: 'Intervalo ICV',
        type: 'category',
        categoryorder: 'array',
        categoryarray: uniqueBuckets.sort(
          (a, b) =>
            parseFloat(a.split(',')[0].replace('[', '')) -
            parseFloat(b.split(',')[0].replace('[', ''))
        )
      },
      yaxis: { title: 'Cantidad de votos', automargin: true },
      autosize: true,
      showlegend: !isMobile
    };

    if (plotContainer) {
      await Plotly.newPlot(plotContainer, traces, layout, { responsive: true });
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

<div
  bind:this={plotContainer}
  class="w-full max-w-screen-xl mx-auto"
  style="height:500px;"
></div>
