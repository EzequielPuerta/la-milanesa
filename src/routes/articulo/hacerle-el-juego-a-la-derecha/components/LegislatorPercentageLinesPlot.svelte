<script lang="ts">
  import LinesPlot from '$components/plots/LinesPlot.svelte';
  import { LEGISLATOR_PERCENTAGES_BY_BUCKET } from '../legislatorPercentagesByBucket';
  import { PARTY_COLORS } from '../partyColors';
  import { PARTIES_BY_LEGISLATORS } from '../partiesByLegislators';
  import { PROVINCES_BY_LEGISLATORS } from '../provincesByLegislators';

  export let title: string;
  export let metric: string;
  export let selectedLegislators: string[] = [];

  type Row = {
    month: string;
    monthKey: string;
    date: Date;
    legislator: string;
    party: string;
    province: string;
    value: number;
    trace_id: string;
    order: number;
  };

  let data: Row[] = [];
  export let selectedMode: 'estricto' | 'ausencias' = 'estricto';
  export let enableModeSelection: boolean = true;

  function transformBucketsToRows(mode: 'estricto' | 'ausencias', selected: string[]): Row[] {
    const dataset = LEGISLATOR_PERCENTAGES_BY_BUCKET[mode];
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
      const legislators = dataset[monthKey];
      const [yearRaw, monthRaw] = monthKey.split('-').map(s => s.trim());
      const year = Number(yearRaw);
      const monthNum = Number(monthRaw);

      if (isNaN(year) || isNaN(monthNum)) continue;

      const date = new Date(Date.UTC(year, monthNum - 1, 1));
      const monthLabel = fmt.format(date);

      for (const [legislator, values] of Object.entries(legislators)) {
        if ((!selected.length) || (selected.length && !selected.includes(legislator))) continue;
        const party = PARTIES_BY_LEGISLATORS[legislator];
        const province = PROVINCES_BY_LEGISLATORS[legislator];
        if (values[metric] != null) {
          rows.push({
            month: monthLabel,
            monthKey,
            date,
            legislator,
            party,
            province: province,
            value: values[metric],
            trace_id: legislator,
            order: order++,
          });
        }
      }
    }

    return rows;
  }

  $: data = transformBucketsToRows(selectedMode, selectedLegislators);
</script>

<div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
  <fieldset class="fieldset bg-base-100 border-base-300 rounded-box border p-4 w-full sm:w-auto">
    <label class="label cursor-pointer flex gap-2 items-center">
      <span class="label-text text-sm">Incluir ausencias</span>
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

  <div class="dropdown dropdown-hover w-full sm:w-150 sm:w-auto">
    <label
      tabindex="0"
      class="btn btn-sm btn-outline w-full sm:w-150 text-left justify-between"
    >
      {selectedLegislators.length
        ? `${selectedLegislators.length} seleccionados`
        : 'Seleccionar legisladores'}
      <span class="ml-2">▼</span>
    </label>
    <ul
      tabindex="0"
      class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full sm:w-150 max-h-64 overflow-y-auto"
    >
      {#each Object.keys(PROVINCES_BY_LEGISLATORS).sort((a, b) => a.localeCompare(b, 'es')) as name}
        <li>
          <label class="label cursor-pointer justify-start gap-2">
            <input
              type="checkbox"
              class="checkbox checkbox-sm"
              checked={selectedLegislators.includes(name)}
              on:change={(e) => {
                if (e.currentTarget.checked) {
                  selectedLegislators = [...selectedLegislators, name];
                } else {
                  selectedLegislators = selectedLegislators.filter((l) => l !== name);
                }
              }}
            />
            <span>
              {name}
              <span class="text-xs opacity-70">
                ({PARTIES_BY_LEGISLATORS[name]})
              </span>
            </span>
          </label>
        </li>
      {/each}
    </ul>
  </div>
</div>

<LinesPlot
  {title}
  data={data}
  groupBy="legislator"
  sortBy="order"
  traceField="legislator"
  colorField="party"
  colors={PARTY_COLORS}
  xField="date"
  yField="value"
  yLabel="Porcentaje"
  tooltipFormatter={(r) => `
    ${r.legislator}<br>
    ${r.party}<br>
    ${r.province}<br>
    ${r.month}<br>
    ${r.value.toFixed(1)}%
  `}
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
