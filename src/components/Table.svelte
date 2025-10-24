<script lang="ts">
  export let headers: string[] = [];
  export let rows: any[][] = [];
</script>


<table class="table table-zebra w-full">
  <thead>
    <tr>
      <th>#</th>
      {#each headers as header}
        <th>{header}</th>
      {/each}
    </tr>
  </thead>

  <tbody>
    {#each rows as row, i}
      <tr>
        <th>{i + 1}</th>
        {#each row as cell}
          <td>{cell}</td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>
