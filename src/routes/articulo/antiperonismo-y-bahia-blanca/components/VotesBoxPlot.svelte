<script lang="ts">
  import Papa from 'papaparse';
  import { onMount, onDestroy } from 'svelte';
  import { loadPlotlyFromCdn } from '$lib/plotly/load'
  import { splitTitleForMobile } from '$lib/plotly/split-title'
  import partidosColors from '../data/colores-partidos.json';

  export let csvUrl: string;
  export let title: string;
  export let logosBasePath: string = '/images/articles/antiperonismo-y-bahia-blanca/partidos';

  let plotContainer: HTMLDivElement | null = null;
  let Plotly: any = null;
  let isMobile = false;
  let mounted = false;

  type Voto = { party: string; percentage: number };

  async function loadCsv(url: string): Promise<Voto[]> {
    const res = await fetch(url);
    const text = await res.text();
    const result = Papa.parse<Voto>(text, {
      header: true,
      skipEmptyLines: true
    });
    return result.data.map(row => ({
      ...row,
      percentage: parseFloat(row.percentage as any),
    }));
  }

  function partyToFilename(party) {
    return party
      .replace(/\./g, ' ')
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase() + '.png';
  }

  let currentPlotlyDiv: any = null;
  let cleanupFn: (() => void) | null = null;

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
    const uniqueParties = Array.from(new Set(df.map(d => d.party)));

    const traces = uniqueParties.map(party => {
      const percentages = df.filter(d => d.party === party).map(d => d.percentage);
      return {
        type: 'box',
        name: party,
        width: 0.4,
        orientation: isMobile ? 'h' : 'v',
        marker: { color: partidosColors[party] ?? '#999999' },
        x: isMobile ? percentages : party,
        y: isMobile ? party : percentages,
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
      margin: { t: 80, l: isMobile ? 50 : 80, r: 50, b: 80 },
      boxmode: 'group',
      boxgap: 1,
      xaxis: {
        title: isMobile ? 'Porcentaje' : '',
        automargin: true,
        showticklabels: false
      },
      yaxis: {
        title: isMobile ? '' : 'Porcentaje',
        automargin: true,
        showticklabels: !isMobile
      },
      autosize: true,
      showlegend: !isMobile
    };

    if (plotContainer) {
      await Plotly.newPlot(plotContainer, traces, layout, { responsive: true });
      currentPlotlyDiv = plotContainer;
    }

    const images: any[] = [];
    await Promise.all(uniqueParties.map(async (party, i) => {
      const filename = partyToFilename(party);
      const path = `${logosBasePath}/${filename}`;

      try {
        const head = await fetch(path, { method: 'HEAD' });
        if (!head.ok) return;
      } catch {
        return;
      }

      if (isMobile) {
        images.push({
          source: path,
          xref: 'paper',
          yref: 'y',
          x: -0.1,
          y: i+0.1,
          sizex: 0.12,
          sizey: 0.8,
          xanchor: 'left',
          yanchor: 'middle',
          layer: 'above'
        });
      } else {
        images.push({
          source: path,
          xref: 'x',
          yref: 'paper',
          x: i,
          y: 0.0,
          sizex: 0.8,
          sizey: 0.15,
          xanchor: 'center',
          yanchor: 'top',
          layer: 'above'
        });
      }
    }));

    if (images.length && currentPlotlyDiv) {
      Plotly.relayout(currentPlotlyDiv, { images });
    }

    cleanupFn = () => {
      try {
        if (currentPlotlyDiv && Plotly && Plotly.purge) {
          Plotly.purge(currentPlotlyDiv);
        }
      } catch (e) {
        // ignore
      }
    };
  });

  onDestroy(() => {
    if (cleanupFn) cleanupFn();
  });
</script>

<div bind:this={plotContainer} class="w-full max-w-screen-xl mx-auto" style="height:500px;"></div>
