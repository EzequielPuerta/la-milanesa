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

  type Row = {
    icv_bucket: string;
    first_place_party: string;
    percentage: number;
    count: number;
    total_schools: number
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
      percentage: parseFloat(row.percentage as any),
      count: parseFloat(row.count as any),
      total_schools: parseFloat(row.total_schools as any)
    }));
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
    const uniqueBuckets = Array.from(new Set(df.map(d => d.icv_bucket)));
    const uniqueParties = Array.from(new Set(df.map(d => d.first_place_party)));
    const bucketPartyMap: Record<string, Record<string, number>> = {};

    df.forEach(row => {
      if (!bucketPartyMap[row.icv_bucket]) bucketPartyMap[row.icv_bucket] = {};
      bucketPartyMap[row.icv_bucket][row.first_place_party] = row.count;
    });

    const traces = uniqueParties.map(party => {
      const y = uniqueBuckets.map(bucket => {
        const row = df.find(d => d.icv_bucket === bucket && d.first_place_party === party);
        return row ? row.percentage : 0;
      });

      const customdata = uniqueBuckets.map(bucket => {
        const row = df.find(d => d.icv_bucket === bucket && d.first_place_party === party);
        return row ? [row.count, row.total_schools] : [0, 0];
      });

      return {
        x: uniqueBuckets,
        y,
        name: party,
        type: 'bar',
        marker: { color: partidosColors[party] ?? '#999999' },
        customdata,
        hovertemplate:
          "<b>%{fullData.name}</b><br>" +
          "Intervalo ICV: %{x}<br>" +
          "% de escuelas: %{y:.1f}%<br>" +
          "Escuelas: %{customdata[0]} de %{customdata[1]}" +
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
      barmode: 'stack',
      xaxis: {
        title: 'Intervalo ICV',
        automargin: true,
        type: 'category',
        categoryorder: 'array',
        categoryarray: uniqueBuckets.sort((a,b) => parseFloat(a.split(',')[0].replace('[','')) - parseFloat(b.split(',')[0].replace('[','')))
      },
      yaxis: { title: 'Porcentaje de escuelas ganadas', automargin: true },
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
