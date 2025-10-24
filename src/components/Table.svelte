<script lang="ts">
  export let headers: string[] = [];
  export let rows: any[][] = [];
  export let withIndex: boolean = false;
</script>


<table class="table table-zebra w-full">
  <thead>
    <tr>
        {#if withIndex}
            <th>#</th>
        {/if}
      {#each headers as header}
        <th>{header}</th>
      {/each}
    </tr>
  </thead>

  <tbody>
    {#each rows as row, i}
      <tr>
        {#if withIndex}
            <th>{i + 1}</th>
        {/if}
        {#each row as cell}
          <td>{cell}</td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>
