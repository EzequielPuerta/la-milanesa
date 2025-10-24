<script lang="ts">
  import LinesPlot from '$components/plots/LinesPlot.svelte';
  import { PARTY_PERCENTAGES_BY_BUCKET } from '../partyPercentagesByBucket';
  import { PARTY_COLORS } from '../partyColors';

  export let title: string;
  export let metric: string;

  type Row = {
    month: string;
    party: string;
    value: number;
    trace_id: string;
    order: number;
  };

  let data: Row[] = [];
  export let selectedMode: 'estricto' | 'ausencias' = 'estricto';
  export let enableModeSelection: boolean = true;

  function transformBucketsToRows(mode: 'estricto' | 'ausencias'): Row[] {
    const dataset = PARTY_PERCENTAGES_BY_BUCKET[mode];
    if (!dataset) return [];

    const months = Object.keys(dataset).sort((a, b) => {
      const [yearAraw, monthAraw] = a.split('-');
      const [yearBraw, monthBraw] = b.split('-');

      const yearA = Number(yearAraw);
      const monthA = Number(monthAraw);
      const yearB = Number(yearBraw);
      const monthB = Number(monthBraw);

      if (isNaN(yearA) || isNaN(monthA) || isNaN(yearB) || isNaN(monthB)) {
        return a.localeCompare(b);
      }

      return yearA - yearB || monthA - monthB;
    });

    let order = 0;
    const rows: Row[] = [];
    const fmt = new Intl.DateTimeFormat('es-AR', { month: 'short', year: 'numeric' });

    for (const monthKey of months) {
      const parties = dataset[monthKey];
      const [yearRaw, monthRaw] = monthKey.split('-').map(s => s.trim());
      const year = Number(yearRaw);
      const monthNum = Number(monthRaw);

      if (isNaN(year) || isNaN(monthNum)) continue;

      const date = new Date(Date.UTC(year, monthNum - 1, 1));
      const monthLabel = fmt.format(date);

      for (const [party, values] of Object.entries(parties)) {
        if (values[metric] != null) {
          rows.push({
            month: monthLabel,
            monthKey,
            date,
            party,
            value: values[metric],
            trace_id: party,
            order: order++,
          });
        }
      }
    }

    return rows;
  }

  $: data = transformBucketsToRows(selectedMode);
</script>

<div class="flex items-center gap-4 mb-4">
  <fieldset class="fieldset bg-base-100 border-base-300 rounded-box border p-4">
    <label class="label cursor-pointer flex gap-2 items-center">
      <span class="label-text text-sm">Incluir ausentes</span>
      <input
        type="checkbox"
        class="toggle toggle-primary"
        checked={selectedMode === 'ausencias'}
        on:change={(e) => {
          selectedMode = e.currentTarget.checked ? 'ausencias' : 'estricto';
        }}
        disabled={!enableModeSelection}
      />
    </label>
  </fieldset>
</div>

<LinesPlot
  {title}
  data={data}
  groupBy="party"
  sortBy="order"
  traceField="party"
  colorField="trace_id"
  colors={PARTY_COLORS}
  xField="date"
  yField="value"
  yLabel="Porcentaje"
  tooltipFormatter={(r) => `${r.party}<br>${r.month}<br>${r.value.toFixed(1)}%`}
  ignoreTraces={(t) => [
    'Frente Renovador De La Concordia Social',
    'Juntos Somos Rio Negro',
    'Movimiento Popular Neuquino',
    'Somos Energia Para Renovar Santa Cruz - Ser',
    'Frente Amplio Progresista',
    'Somos Fueguinos',
    'Alianza Por Santa Cruz',
    'Alianza Fuerza San Luis',
    'Republicanos Unidos',
    'Hacemos Por Nuestro Pais',
  ].includes(t.name)}
  milestones={[
    { date: '2024-02-06', label: 'Aprob. facultades delegadas' },
    { date: '2024-04-30', label: 'Aprob. de Ley Bases' },
    { date: '2024-06-27', label: 'Sanción de Ley Bases y fac. deleg.' },
    { date: '2024-09-11', label: 'Veto a la Ley de Mov. Jubilatoria' },
    { date: '2024-10-09', label: 'Veto al financiamiento de las UUNN' },
    { date: '2025-02-20', label: 'Negativa a la Comisión $LIBRA' },
    { date: '2025-04-08', label: 'Creación Comisión $LIBRA' },
    { date: '2025-07-08', label: 'Vencen las facultades delegadas' },
    { date: '2025-08-06', label: 'Anulación de decretos' }
  ]}
  xaxis={{
    type: 'date',
    tickformat: '%b %Y',
    tickangle: 300,
    dtick: "M2" 
  }}
/>
