<script lang="ts">
  import { onMount } from "svelte";
  import { timeDay } from "d3-time";
  import { timeFormatLocale } from "d3-time-format";

  export let startDate: Date;
  export let endDate: Date;
  export let cellSize = 14;
  export let gap = 2;
  export let monthGap = 6;
  export let data: Record<string, number> = {};
  export let labelColor = "#ffffff";

  const shortDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const localeEs = timeFormatLocale({
    dateTime: "%A, %e de %B de %Y, %X",
    date: "%d/%m/%Y",
    time: "%H:%M:%S",
    periods: ["AM", "PM"],
    days: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    shortDays,
    months: [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ],
    shortMonths: [
      "ene", "feb", "mar", "abr", "may", "jun",
      "jul", "ago", "sep", "oct", "nov", "dic"
    ]
  });

  let container: HTMLDivElement;
  let containerWidth = 0;

  function updateWidth() {
    containerWidth = container?.clientWidth ?? 0;
  }

  onMount(() => {
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  });

  const topOffset = 20;
  const leftOffset = 30;
  const formatKey = localeEs.format("%d/%m/%Y");
  const formatMonth = localeEs.format("%b");

  type Cell = {
    date: Date;
    weekIndex: number;
    dayOfWeek: number;
    value: number;
    month: number;
  };

  type MonthLabel = {
    month: number;
    weekIndex: number;
    label: string;
  };

  // días
  const days = timeDay.range(startDate, timeDay.offset(endDate, 1));
  const startOffset = startDate.getDay();

  let cells: Cell[] = days.map((date, i) => {
    const weekIndex = Math.floor((i + startOffset) / 7);

    return {
      date,
      weekIndex,
      dayOfWeek: date.getDay(),
      value: data[formatKey(date)] ?? 0,
      month: date.getMonth()
    };
  });

  // detectar meses
  let months: MonthLabel[] = [];
  let lastMonth = -1;

  cells.forEach((c) => {
    if (c.month !== lastMonth) {
      months.push({
        month: c.month,
        weekIndex: c.weekIndex,
        label: formatMonth(c.date)
      });
      lastMonth = c.month;
    }
  });

  // total columnas (semanas)
  const totalWeeks =
    Math.max(...cells.map(c => c.weekIndex)) + 1;

  // tamaño dinámico de celda
  $: usableWidth = Math.max(containerWidth - leftOffset, 0);

  $: dynamicCellSize =
    totalWeeks > 0
      ? (usableWidth - (totalWeeks - 1) * gap) / totalWeeks
      : 10;

  // offsets visuales por semana
  let weekOffsets = new Map<number, number>();
  let extraCols = 0;
  let lastSeenMonth = cells[0]?.month;

  cells.forEach((c) => {
    if (c.month !== lastSeenMonth) {
      extraCols += 1;
      lastSeenMonth = c.month;
    }
    weekOffsets.set(c.weekIndex, extraCols);
  });

  function getX(weekIndex: number) {
    const extra = weekOffsets.get(weekIndex) ?? 0;
    return (
      weekIndex * (dynamicCellSize + gap) +
      extra * monthGap
    );
  }

  $: width = containerWidth;
  $: height =
    topOffset +
    7 * (dynamicCellSize + gap) +
    20;
</script>

<div bind:this={container} style="width: 100%;">
  <svg {width} {height}>
    <!-- días -->
    {#each shortDays as d, i}
      <text
        x={0}
        y={topOffset + i * (dynamicCellSize + gap) + dynamicCellSize}
        font-size="10"
        fill={labelColor}
      >
        {d}
      </text>
    {/each}

    <!-- meses -->
    {#each months as m}
      <text
        x={getX(m.weekIndex) + leftOffset}
        y={12}
        font-size="10"
        fill={labelColor}
      >
        {m.label}
      </text>
    {/each}

    <!-- grid -->
    <g transform="translate({leftOffset},{topOffset})">
      {#each cells as c}
        <rect
          x={getX(c.weekIndex)}
          y={c.dayOfWeek * (dynamicCellSize + gap)}
          width={dynamicCellSize}
          height={dynamicCellSize}
          rx="2"
          fill={c.value ? "#2c7be5" : "#e0e0e0"}
        />
      {/each}
    </g>
  </svg>
</div>
