<script lang="ts">
  import Table from '$components/Table.svelte';
  import { PARLIAMENTARY_BLOCS } from '../parliamentaryBlocs';
  import { LEGISLATORS_BY_PARTY } from '../legislatorsByParty';
  import { SEATS_BY_PARTY } from '../seatsByParty';
</script>

<div class="collapse-content text-sm flex justify-center">
  <div class="join join-vertical bg-base-100">
    <div tabindex="0" class="collapse collapse-arrow max-w-95 lg:max-w-150 join-item bg-base-100 border-base-300 border">
      <div class="collapse-title font-semibold bg-primary text-primary-content">Ver bloques parlamentarios (36)</div>
      <div class="collapse-content text-xs">
        <div class="overflow-x-auto">
          <Table
              headers={["Bloques Parlamentarios"]}
              rows={PARLIAMENTARY_BLOCS.map(bloc_name => [bloc_name])}
          />
        </div>
      </div>
    </div>
  
    <div tabindex="1" class="collapse collapse-arrow max-w-95 lg:max-w-150 join-item bg-base-100 border-base-300 border">
      <div class="collapse-title font-semibold bg-primary text-primary-content">Ver partidos políticos (13)</div>
      <div class="collapse-content text-xs">
        <div class="overflow-x-auto">
          <Table
              headers={["Partido", "Bancas", "Legisladores"]}
              rows={Object.entries(LEGISLATORS_BY_PARTY).map(
                ([party_name, legislators]) => [party_name, SEATS_BY_PARTY[party_name], legislators.length]
              )}
          />
        </div>
      </div>
    </div>
  </div>
</div>