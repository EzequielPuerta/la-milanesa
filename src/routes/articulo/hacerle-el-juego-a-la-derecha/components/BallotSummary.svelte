<script lang="ts">
  import type { Question, Ballot, CastVote, Vote } from "../types";
  import NestedDonutChart from './NestedDonutChart.svelte';
  import { PARTY_COLORS } from '../partyColors';

  export let question: Question;
  export let ballot: Ballot;
  export let userVote: CastVote | null;
  export let legislatorsVotes: Vote[];

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const colorMap = {
    'afirmativo': '#22c55e',
    'negativo': '#ef4444',
    'abstencion': '#9ca3af',
    'sin_votar': '#facc15',
    'ausente': '#c4b5fd',
    ...PARTY_COLORS
  };

  $: voteMatches = userVote === ballot.result;
  $: sortedVotes = Object.entries(ballot.totals)
    .map(([key, value]) => ({
      key,
      label: capitalize(key),
      total: value ?? 0,
      color: colorMap[key] ?? "inherit"
    }))
    .sort((a, b) => b.total - a.total);
</script>

<div class="flex flex-col lg:flex-row items-start justify-center w-full max-w-6xl mx-auto h-full max-h-screen px-4 mt-16 lg:mt-60 gap-6">
  <div class="flex flex-col w-full lg:w-1/3 border rounded-lg shadow-sm p-4 bg-base-200">
    <p class="mb-2 text-center">
      <strong>Resultado:</strong>
      <span class="font-medium" style="color: {colorMap[ballot.result]}">
        {ballot.result}
      </span>
      <br/>

      <strong>Tu voto</strong>
      {#if userVote}
        <span class="font-medium" style="color: {colorMap[userVote]}">
          {userVote}
        </span>
        <strong>{voteMatches ? 'coincide' : 'NO coincide'}</strong>
      {:else}
        No votaste
      {/if}
    </p>

    <div class="stats stats-horizontal lg:stats-vertical shadow">
        {#each sortedVotes as vote}
            <div class="stat">
                <div class="stat-title">{vote.label}</div>
                <div class="stat-value" style="color: {vote.color}">
                    {vote.total}
                </div>
            </div>
        {/each}
    </div>
  </div>

  <div class="flex flex-col w-full lg:w-2/3 lg:mt-12 justify-center">
    <NestedDonutChart data={legislatorsVotes} colorMap={colorMap} />
  </div>
</div>
