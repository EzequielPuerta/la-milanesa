<script lang="ts">
  import * as d3 from 'd3';
  import Papa from 'papaparse';
  import { onMount, onDestroy } from 'svelte';
  import { loadPlotlyFromCdn } from '$lib/plotly/load';
  import { splitTitleForMobile } from '$lib/plotly/split-title';
  import partidosColors from '../data/colores-partidos.json';

  export let csvUrl: string;
  export let geojsonUrl: string;
  export let title: string;

  let plotContainer: HTMLDivElement | null = null;
  let Plotly: any = null;
  let isMobile = false;
  let currentPlotlyDiv: any = null;
  let cleanupFn: (() => void) | null = null;

  type Row = Record<string, any>;

  async function loadCsv(url: string): Promise<Row[]> {
    const res = await fetch(url);
    const text = await res.text();
    const result = Papa.parse<Row>(text, {
      header: true,
      skipEmptyLines: true
    });
    // convertir números
    return result.data.map(d => {
      for (let n = 1; n <= 16; n++) {
        d[`place_${n}_votes`] = parseFloat(d[`place_${n}_votes`] ?? 0);
        d[`place_${n}_percentage`] = parseFloat(d[`place_${n}_percentage`] ?? 0);
      }
      d.lat = parseFloat(d.lat);
      d.lng = parseFloat(d.lng);
      d.diff_between_1_and_2 = d.place_1_percentage - d.place_2_percentage;
      return d;
    });
  }

  function blendWithWhiteLimited(hex: string, factor: number, minFactor = 0.05) {
    factor = Math.max(factor, minFactor);
    const c = d3.color(hex)?.rgb() ?? d3.rgb(128,128,128);
    return d3.rgb(
      255 * (1 - factor) + c.r * factor,
      255 * (1 - factor) + c.g * factor,
      255 * (1 - factor) + c.b * factor
    ).formatHex();
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

    const df_schools = await loadCsv(csvUrl);
    const geojson = await fetch(geojsonUrl).then(r => r.json());
    const diffs = df_schools.map(d => d.diff_between_1_and_2).filter(v => !isNaN(v));
    const maxDiff = d3.quantile(diffs.sort((a,b)=>a-b), 0.95) || 1;
    const maxVotes = Math.max(...df_schools.map(d => d.place_1_votes)) || 1;

    df_schools.forEach(d => {
      if (isNaN(d.diff_between_1_and_2)) d.diff_between_1_and_2 = 0;
      d.diff_norm = Math.min(Math.max(Math.sqrt(d.diff_between_1_and_2 / maxDiff), 0), 1);
      d.votes_norm = d.place_1_votes / maxVotes;
      d.marker_size = 8 + 8 * d.votes_norm;
      d.marker_border_size = 13 + 13 * d.votes_norm;
    });

    const markerColorsFill = df_schools.map(d => partidosColors[d.place_1_party] ?? '#888888');
    const markerColorsLine = df_schools.map(d => {
      if (!d.place_1_party || !(d.place_1_party in partidosColors)) return "#CCCCCC";
      return blendWithWhiteLimited(partidosColors[d.place_1_party], d.diff_norm);
    });

    const hoverText = df_schools.map(d => {
      const totalVotes = Array.from({length:16}, (_, i) => d[`place_${i+1}_votes`] || 0).reduce((a,b)=>a+b,0);
      return `${d.school}<br>
1º: ${d.place_1_party} (${d.place_1_votes} - ${d.place_1_percentage.toFixed(1)}%)<br>
2º: ${d.place_2_party} (${d.place_2_votes} - ${d.place_2_percentage.toFixed(1)}%)<br>
3º: ${d.place_3_party} (${d.place_3_votes} - ${d.place_3_percentage.toFixed(1)}%)<br><br>
Total votos: ${totalVotes}<br>
Diferencia entre 1º y 2º: ${d.diff_between_1_and_2.toFixed(2)}%`;
    });

    const choropleth = {
      type: 'choroplethmapbox',
      geojson,
      locations: geojson.features.map(f => f.properties.id),
      z: geojson.features.map(f => f.properties.icv2010),
      colorscale: [[0,'red'],[0.2,'orange'],[0.6,'yellow'],[1,'green']],
      zmin: 4,
      zmax: 9,
      marker: { line: { width: 0.5 } },
      featureidkey: 'properties.id',
      opacity: 0.9,
      colorbar: {
        title: 'ICV 2010',
        orientation: isMobile ? 'h' : 'v',
        x: isMobile ? 0.5 : 1.05,
        y: isMobile ? 0 : 0.5,
        xanchor: isMobile ? 'center' : 'left',
        yanchor: isMobile ? 'top' : 'middle'
      }
    };

    const sizeFactor = 0.002;
    const borders = {
      type: 'scattermapbox',
      lat: df_schools.map(d => d.lat),
      lon: df_schools.map(d => d.lng),
      mode: 'markers',
      marker: {
        size: df_schools.map(d => d.marker_border_size * sizeFactor),
        color: markerColorsLine,
        opacity: 1
      },
      hoverinfo: 'skip',
      name: 'Diferencia entre el 1º y el 2º',
    };

    const points = {
      type: 'scattermapbox',
      lat: df_schools.map(d => d.lat),
      lon: df_schools.map(d => d.lng),
      mode: 'markers',
      marker: { size: df_schools.map(d => d.marker_size * sizeFactor), color: markerColorsFill, opacity: 1 },
      text: hoverText,
      hoverinfo: 'text',
      name: 'Escuelas'
    };

    const layout = {
      mapbox: { style: 'carto-positron', center: { lat: -38.6496, lon: -62.2724 }, zoom: 10 },
      title: {
          text: splitTitleForMobile(title, isMobile),
          x: 0,
          xanchor: 'left',
          pad: { l: isMobile ? 20 : 60, t: 10 },
          font: { size: 16 } 
      },
      height: 900,
      margin: {
          l: isMobile ? 0 : 60,
          r: isMobile ? 0 : 60,
          t: 120,
          b: isMobile ? 100 : 80
      },
      legend: {
        orientation: 'h',
        x: 0.5,
        y: isMobile ? -0.1 : 1.01,
        xanchor: 'center',
        yanchor: isMobile ? 'top' : 'bottom'
      }
    };

    if (plotContainer) {
      await Plotly.newPlot(plotContainer, [choropleth, borders, points], layout, { responsive:true });
      currentPlotlyDiv = plotContainer;
    }

    cleanupFn = () => { try { if (currentPlotlyDiv && Plotly?.purge) Plotly.purge(currentPlotlyDiv); } catch{} };
  });

  onDestroy(() => { if (cleanupFn) cleanupFn(); });
</script>

<div bind:this={plotContainer} class="w-full max-w-screen-xl mx-auto" style="height:900px;"></div>
