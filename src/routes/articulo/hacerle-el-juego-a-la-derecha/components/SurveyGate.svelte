<script lang="ts">
  import { onMount, tick } from 'svelte';
  import Table from '$components/Table.svelte';
  import { PARTY_COLORS } from '../partyColors';
  import BallotSummary from './BallotSummary.svelte';
  import { surveyQuestions } from '../surveyQuestions';
  import { PARTIES_BY_LEGISLATORS } from '../partiesByLegislators';
  import type { CastVote, Ballot, Vote, LegislatorMatch } from "../types";
  import ParticlesBackground from '$components/ParticlesBackground.svelte';

  let isClient = false;
  let ballotsById: Record<string, Ballot> = {};
  let votesByBallot: Record<string, Record<string, CastVote>> = {};
  let typeVotesByBallot: Record<string, Record<CastVote, string[]>> = {};
  let totalTypeVotesByBallot: Record<string, Record<CastVote, Record<string, number>>> = {};
  let loadingBallots = true;
  let legislatorSelected: string | null = null;

  const introParagraphs = [
    "Seguramente escuchaste la frase mil veces... 'Le hacen el juego a la derecha'. Muy recurrente acusación entre peronistas y la izquierda.",
    "Uno de los argumentos más usados a la hora de esgrimir dicho reproche se basa en el comportamiento de los legisladores (de uno u otro bando) en determinadas votaciones, especialmente las más polémicas.",
    "Dicho esto, te propongo un 'juego':",
    "Simulemos que estamos de regreso a principios del 2024, y tenes la posibilidad de presenciar varias de las votaciones que acontecieron en la Cámara de Diputados del Congreso Nacional...",
    "De hecho, no sólo eso, ¡sino que también podrás emitir tu propio voto y comparar los resultados! ¿Empezamos? 👇",
  ];

  let currentQuestion = 0;
  let answers: Record<number, CastVote | null> = {};
  let locked = false;
  let completed = false;
  let topLegislators: LegislatorMatch[] = [];
  let photoByLegislators: Record<string, string> = {};
  let container: HTMLDivElement;
  let similarityByLegislators: Record<string, LegislatorMatch> = {};
  let selectedLegislatorMatch: LegislatorMatch;

  async function fetchBallotsAndVotes() {
    try {
      const ids = surveyQuestions.map(q => q.object_id);

      const resBallots = await fetch('/api/hacerle-el-juego-a-la-derecha/ballots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      if (!resBallots.ok) {
        console.error("Error during fetching ballots:", await resBallots.text());
        return;
      }
      const ballots: Ballot[] = await resBallots.json();
      ballotsById = Object.fromEntries(ballots.map(b => [b._id, b]));

      const votesResponses = await Promise.all(
        ids.map(async (id) => {
          const res = await fetch('/api/hacerle-el-juego-a-la-derecha/votes', {
            method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ballot_id: id })
          });
        if (!res.ok) {
          console.warn(`No votes found for ballot ${id}`);
          return [];
        }
          return await res.json() as Vote[];
        })
      );

      typeVotesByBallot = {};
      totalTypeVotesByBallot = {};
      votesResponses.forEach((votesArray, index) => {
        const ballotId = ids[index];
        votesByBallot[ballotId] = {};
        typeVotesByBallot[ballotId] = {};
        totalTypeVotesByBallot[ballotId] = {};

        votesArray.forEach((v) => {
          const legislator = v.legislator_name;
          const photo = v.legislator_photo
          const cast_vote = v.cast_vote;
          const party = PARTIES_BY_LEGISLATORS[legislator];

          if (!votesByBallot[ballotId]) votesByBallot[ballotId] = {};
          votesByBallot[ballotId][legislator] = cast_vote;

          if (!photoByLegislators[legislator]) photoByLegislators[legislator] = photo;
          if (!typeVotesByBallot[ballotId][cast_vote]) typeVotesByBallot[ballotId][cast_vote] = [];
          typeVotesByBallot[ballotId][cast_vote].push(legislator)

          if (!totalTypeVotesByBallot[ballotId][cast_vote]) totalTypeVotesByBallot[ballotId][cast_vote] = {};
          if (!totalTypeVotesByBallot[ballotId][cast_vote][party]) totalTypeVotesByBallot[ballotId][cast_vote][party] = 0;
          totalTypeVotesByBallot[ballotId][cast_vote][party] += 1;
        });
      });
    } catch (err) {
        console.error("Error during fetching ballots and votes:", err);
    } finally {
        loadingBallots = false;
    }
  }

  function initObserver() {
    if (!container) return;
    const steps = container.querySelectorAll('.step');
    const observer = new IntersectionObserver(handleIntersect, { threshold: 0.3 });
    steps.forEach(step => observer.observe(step));
  }

  onMount(() => {
    isClient = true;
    fetchBallotsAndVotes();
  });

  $: if (!loadingBallots && isClient) {
    tick().then(() => {
      initObserver();
    });
  }

  $: if (isClient) {
    document.body.style.overflow = locked ? 'hidden' : 'auto';
  }

  $: if (similarityByLegislators && legislatorSelected) {
    selectedLegislatorMatch = similarityByLegislators[legislatorSelected!];
  }

  function handleIntersect(entries: IntersectionObserverEntry[]) {
    if (completed) return;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        if (element.classList.contains('question-step')) {
          const index = parseInt(element.dataset.index || '0');
          currentQuestion = index;
          locked = true;
          container.style.overflow = 'hidden';
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  }

  function selectAnswer(answer: CastVote) {
    const id = surveyQuestions[currentQuestion].id;
    answers[id] = answer;

    locked = false;
    container.style.overflowY = 'auto';

    const next = container.querySelector(`#after-q${id}`);
    if (next) next.scrollIntoView({ behavior: 'smooth' });

    if (currentQuestion < surveyQuestions.length) {
        currentQuestion += 1;
    } else {
        completed = true;
    }
  }

  $: if (Object.keys(answers).length === surveyQuestions.length) {
    completed = true;
    const legislatorMatches: Record<string, { matches: number; total: number }> = {};

    surveyQuestions.forEach(q => {
        const userVote = answers[q.id];
        if (!userVote) return;

        const votes: Record<CastVote, string[]> = typeVotesByBallot[q.object_id];
        for (const [cast_vote, legislators] of Object.entries(votes)) {
            legislators.forEach(legislator => {
                if (!legislatorMatches[legislator]) legislatorMatches[legislator] = { matches: 0, total: 0 };
                if (cast_vote === userVote) legislatorMatches[legislator].matches += 1;
                legislatorMatches[legislator].total += 1;
            });
        };
    });

    topLegislators = Object.entries(legislatorMatches)
        .map(([name, data]) => ({
            name,
            matches: data.matches,
            total: data.total,
            score: data.total > 0 ? data.matches / data.total : 0
        }))
        .sort((a, b) => b.score - a.score);
    topLegislators.forEach(l => {
        similarityByLegislators[l.name] = l;
    })
    topLegislators = topLegislators.slice(0, 20);
    legislatorSelected = topLegislators[0].name;
  }
</script>

<div
  bind:this={container}
  class="relative max-h-screen overflow-y-auto scroll-smooth"
>
  {#if loadingBallots}
    <div class="h-screen flex items-center justify-center">
    <div 
        class="radial-progress w-32 h-32 animate-spin" 
        style="--value:70;" 
        aria-valuenow="70" 
        role="progressbar">
    </div>
    </div>
  {:else}
    {#if !completed}
        <ParticlesBackground />
        <progress
            class="progress progress-primary fixed bottom-0 left-0 w-full h-2 z-50"
            value={currentQuestion+1}
            max={surveyQuestions.length}
        />
    {/if}

    {#each introParagraphs as text, i}
      <section class="step h-screen flex items-center justify-center" data-index={i}>
        <div class="text-center p-8 bg-neutral text-neutral-content rounded-2xl shadow-lg max-w-2xl mx-4">
          <p class="text-md">{text}</p>
        </div>
      </section>
    {/each}

    {#each surveyQuestions as q, i}
      <section
        class="step question-step h-screen flex items-center justify-center my-16 mx-4"
        data-index={i}
        id={"q" + q.id}
      >
        <div class="max-w-xl bg-base-100 p-8 rounded-2xl shadow-lg bg-neutral text-neutral-content text-center">
          <h5 class="text-xs mb-4">Votación nº{i + 1} - {new Date(ballotsById[q.object_id].date).toLocaleDateString('es-AR', {day: '2-digit', month: 'long', year: 'numeric'})}</h5>
          <h3 class="text-primary">{q.title}</h3>
          <div class="grid w-full items-center gap-2" style="grid-template-columns: 125px 1fr;">
            <p class="font-semibold">Orden del día:</p>
            <h4 class="text-xs text-gray-400 italic">
              <a href={ballotsById[q.object_id].details_link} target="_blank" class="text-info underline ml-2">
                {ballotsById[q.object_id].title}
              </a>
            </h4>
          </div>
          <div class="divider"></div>
          <p>{q.abstract}</p>
          <div class="flex justify-center mt-20 gap-2">
            <button
              class="btn btn-success text-2xs"
              disabled={locked && currentQuestion !== i}
              on:click={() => selectAnswer('afirmativo')}
            >
              Afirmativo
            </button>
            <button
              class="btn btn-error text-2xs"
              disabled={locked && currentQuestion !== i}
              on:click={() => selectAnswer('negativo')}
            >
              Negativo
            </button>
            <button
              class="btn btn-neutral text-2xs"
              disabled={locked && currentQuestion !== i}
              on:click={() => selectAnswer('abstencion')}
            >
              Abstención
            </button>
          </div>
        </div>
      </section>

      <section
        id={"after-q" + q.id}
        class="h-screen flex items-center justify-center step"
        data-index={i + introParagraphs.length + i}
      >
        <BallotSummary
          question={q}
          ballot={ballotsById[q.object_id]}
          userVote={answers[q.id]}
          legislatorsVotes={totalTypeVotesByBallot[q.object_id]}
        />
      </section>
    {/each}
    {#if completed}
        <section class="h-screen flex flex-col items-center justify-start p-8 text-neutral-content step pb-100">
            <p class="mb-10 lg:mx-75">Tus respuestas han sido comparadas con los votos reales de todos legisladores. Éstos son los 20 legisladores que más coinciden con vos:</p>

            <ul class="w-full max-w-xl mx-auto space-y-2">
                {#each topLegislators as l, i}
                    <li class="flex justify-between p-2 bg-base-200 rounded-lg shadow-sm border-2" style="border-color: {PARTY_COLORS[PARTIES_BY_LEGISLATORS[l.name]]}">
                        <div class="avatar">
                            <div class="w-15 rounded-full mr-4">
                                <img src={photoByLegislators[l.name]} />
                            </div>
                        </div>
                        <span>
                            {i + 1}. {l.name}<br/>
                            <strong
                                style="color: {PARTY_COLORS[PARTIES_BY_LEGISLATORS[l.name]]}">
                                    {PARTIES_BY_LEGISLATORS[l.name]}
                            </strong>
                        </span>
                        <span>{(l.score * 100).toFixed(1)}% ({l.matches}/{l.total})</span>
                    </li>
                {/each}
            </ul>

            <p class="my-10 lg:mx-75">¿Te gustaría comparar tus votos contra los de alguien en particular?</p>

            <select
                class="select select-lg w-full max-w-xs mb-16"
                bind:value={legislatorSelected}
            >
                <option disabled selected value={null}>Seleccioná un legislador</option>
                {#each Object.keys(PARTIES_BY_LEGISLATORS) as legislator}
                    <option value={legislator}>{legislator}</option>
                {/each}
            </select>

            {#if legislatorSelected}
                <div class="chat chat-start mb-16">
                    <div class="chat-image avatar">
                        <div class="w-10 rounded-full">
                        <img alt={legislatorSelected} src={photoByLegislators[legislatorSelected]} />
                        </div>
                    </div>
                    <div class="chat-header">
                        {legislatorSelected}
                        <time class="text-xs opacity-50">
                            {new Date().toLocaleString(
                                "es-AR",
                                {timeZone: "America/Argentina/Buenos_Aires", hour: "2-digit", minute: "2-digit"}
                            )}
                        </time>
                    </div>
                    <div class="chat-bubble">
                        Nos parecemos en un {(selectedLegislatorMatch.score * 100).toFixed(1)}%, ya que coincidimos en {selectedLegislatorMatch.matches} de {selectedLegislatorMatch.total}.</div>
                    <div
                        class="chat-footer opacity-50"
                        style="color: {PARTY_COLORS[PARTIES_BY_LEGISLATORS[legislatorSelected]]}"
                    >
                        {PARTIES_BY_LEGISLATORS[legislatorSelected]}
                    </div>
                </div>

                <div class="lg:w-max-700 mb-16">
                    <Table
                        headers={["Votación", "Legislador", "Vos"]}
                        rows={surveyQuestions.map(q => [
                            q.title, votesByBallot[q.object_id!][legislatorSelected!], answers[q.id]
                        ])}
                    />
                </div>
            {/if}

            <p class="pb-20 lg:mx-75">¿Te sorprendieron los resultados? ¿Los votos de algunos legisladores vs. los tuyos? ¿Qué pasaría si usáramos ésta técnica de comparación de votos pero entre los propios legisladores? Tal vez, de esa manera podemos dilucidar quienes están mas cerca de...</p>
        </section>
    {/if}
  {/if}
</div>

<style>
  .scroll-smooth {
    scroll-behavior: smooth;
  }

  .step {
    transition: opacity 0.4s ease;
  }
</style>
