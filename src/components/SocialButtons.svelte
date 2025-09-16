<script lang="ts">
	import { Email, Reddit, LinkedIn, Telegram, WhatsApp, Facebook, X } from 'svelte-share-buttons-component';

    export let url: string;
    export let title: string;
    export let desc: string;
</script>

<div>
    <Email subject="{title}" body="{desc} {url}" />
    <Reddit class="share-button" {title} {url} />
    <LinkedIn class="share-button" {url} />
    <Telegram class="share-button" text={title} {url} />
    <WhatsApp class="share-button" text="{title} {url}" />
    <Facebook class="share-button" quote="{title}" {url} />
    <X class="share-button" text="{title}" {url} hashtags="LaVerdadDe,LaMilanesa" via="username" related="other,users" />
</div>
