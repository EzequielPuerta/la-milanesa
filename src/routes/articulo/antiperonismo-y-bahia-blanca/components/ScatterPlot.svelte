<script lang="ts">
  import Papa from 'papaparse';
  import { onMount, onDestroy } from 'svelte';
  import { loadPlotlyFromCdn } from '$lib/plotly/load';
  import { splitTitleForMobile } from '$lib/plotly/split-title'
  import partidosColors from '../data/colores-partidos.json';

  let plotContainer: HTMLDivElement | null = null;
  let Plotly: any = null;
  let isMobile = false;
  let currentPlot: any = null;

  export let csvUrl: string;
  export let title: string;

  const targetParties = ['LA LIBERTAD AVANZA', 'FUERZA PATRIA'];

  type Row = Record<string, any>;

  async function loadCsv(url: string): Promise<Row[]> {
    const res = await fetch(url);
    const text = await res.text();
    const result = Papa.parse<Row>(text, { header: true, skipEmptyLines: true, dynamicTyping: true });
    return result.data as Row[];
  }

  function getVotesPercentageForParty(row: Row, party: string): number {
    for (let i = 1; i <= 15; i++) {
      const partyCol = `place_${i}_party`;
      const percentageCol = `place_${i}_percentage`;
      if (row[partyCol] === party) return row[percentageCol] ?? 0;
    }
    return 0;
  }

  function linearRegression(x: number[], y: number[]) {
    const n = x.length;
    if (n === 0) return { slope: 0, intercept: 0 };
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
    const sumXX = x.reduce((a, b) => a + b * b, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return { slope, intercept };
  }

  function regressionTrace(x: number[], y: number[], color: string, name: string) {
    const { slope, intercept } = linearRegression(x, y);
    const xMin = Math.min(...x);
    const xMax = Math.max(...x);
    return {
      x: [xMin, xMax],
      y: [slope * xMin + intercept, slope * xMax + intercept],
      mode: 'lines',
      type: 'scatter',
      name: `${name} - regresión`,
      line: { color, dash: 'dash' },
      hoverinfo: 'none'
    };
  }

  onMount(async () => {
    isMobile = window.innerWidth < 768;
    Plotly = await loadPlotlyFromCdn();
    const data = await loadCsv(csvUrl);

    const traces = targetParties.map(party => {
      const x: number[] = [];
      const y: number[] = [];
      const hoverText: string[] = [];

      data.forEach(row => {
        const percentage = getVotesPercentageForParty(row, party);
        if (percentage > 0) {
          x.push(row.icv2010);
          y.push(percentage);
          hoverText.push(`${row.school}<br>${party}<br>${percentage}% de los votos<br>ICV: ${row.icv2010}`);
        }
      });

      return {
        x, y,
        mode: 'markers',
        type: 'scatter',
        name: party,
        marker: { color: partidosColors[party], size: 8, opacity: 1 },
        text: hoverText,
        hoverinfo: 'text'
      };
    });

    // Agregar líneas de regresión
    const regressionTraces = traces.map(t => regressionTrace(t.x, t.y, t.marker.color, t.name));
    const allTraces = [...traces, ...regressionTraces];

    const layout = {
      title: {
          text: splitTitleForMobile(title, isMobile),
          x: 0,
          xanchor: 'left',
          pad: { l: isMobile ? 20 : 60, t: 50 },
          font: { size: 16 } 
      },
      xaxis: { title: 'ICV 2010', range: [5.5, 9] },
      yaxis: { title: 'Porcentaje de votos' },
      height: 600,
      margin: { l: 60, r: 30, t: 60, b: 60 },
      legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.2 }
    };

    if (plotContainer) {
      await Plotly.newPlot(plotContainer, allTraces, layout, { responsive: true });
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
