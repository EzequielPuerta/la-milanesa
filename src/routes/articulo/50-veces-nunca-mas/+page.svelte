<script lang="ts">
  import { onMount } from "svelte";
  import Article from '$components/Article.svelte';
  import CalendarHeatmap from '$components/plots/CalendarHeatmap.svelte';

  let data = {};

  onMount(async () => {
    const res = await fetch('/api/50-veces-nunca-mas/tweets/by-day');
    data = await res.json();
  });
</script>

<Article slug="50-veces-nunca-mas">
    <CalendarHeatmap
        startDate={new Date(2025, 3, 20)}
        endDate={new Date(2026, 3, 24)}
        {data}
    />
</Article>