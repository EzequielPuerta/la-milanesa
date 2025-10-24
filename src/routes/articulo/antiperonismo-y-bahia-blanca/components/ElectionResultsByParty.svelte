<script lang="ts">
  import Papa from 'papaparse';
  import LinesPlot from '$components/plots/LinesPlot.svelte';

  export let csvUrl: string;
  export let title: string;
  let parsedData: Row[] = [];
  let loading = true;

  type Row = {
    trace_id: string;
    party: string;
    election: string;
    percentage: number;
    order: number;
    name: string;
  };

  async function loadCsv(url: string) {
    const res = await fetch(url);
    const text = await res.text();
    const result = Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: true });
    return result.data;
  }

  loadCsv(csvUrl).then(data => {
    parsedData = data;
    loading = false;
  });

  const colors = {
    '1': '#68508b',
    '2': '#00b4f0',
    '3': '#facc15'
  };
</script>

{#if loading}
  <div class="text-center py-10">Cargando datos...</div>
{:else}
  <LinesPlot
    {title}
    data={parsedData}
    groupBy={(d) => `${d.trace_id}_${d.name}`}
    sortBy="order"
    traceField="name"
    colors={colors}
    colorField="trace_id"
    xField="election"
    yField="percentage"
    yLabel="Porcentaje"
    tooltipFormatter={(r) => `${r.party}<br>${r.election}<br>${r.percentage.toFixed(2)}%`}
    xaxis={{
      type: 'category',
      tickangle: 300
    }}
  />
{/if}
