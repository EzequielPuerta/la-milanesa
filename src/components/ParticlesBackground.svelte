<script lang="ts">
  import { onMount } from "svelte";

  export let id: string = "tsparticles";
  export let configs: any = {
    particles: {
      number: { value: 10 },
      color: { value: "#ffffff" },
      links: { enable: true, distance: 200 },
      shape: { type: "circle" },
      opacity: { value: 0.3 },
      size: { value: { min: 8, max: 15 } },
      move: { enable: true, speed: 0.5 }
    },
    background: { color: "#000000" }
  };

  onMount(async () => {
    const { tsParticles } = await import("tsparticles-engine");
    const { loadAll } = await import("tsparticles-all");

    await loadAll(tsParticles);
    await tsParticles.load({ id, options: configs });
  });
</script>

<style>
  #tsparticles {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: -1;
  }
</style>

<div id={id}></div>
