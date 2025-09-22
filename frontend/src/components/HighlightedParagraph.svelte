<script lang="ts">
    import { Info } from 'lucide-svelte';
    import clsx from 'clsx';

    export let className: string = '';
    export let title: string = 'Disclaimer';
    export let color: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'info' | 'error' = 'primary';
    export let Icon = Info;

    // mapping colores a clases Tailwind/DaisyUI
    const colorMap: Record<typeof color, { line: string; text: string }> = {
        primary: { line: 'border-primary', text: 'text-primary' },
        secondary: { line: 'border-secondary', text: 'text-secondary' },
        accent: { line: 'border-accent', text: 'text-accent' },
        success: { line: 'border-success', text: 'text-success' },
        warning: { line: 'border-warning', text: 'text-warning' },
        info: { line: 'border-info', text: 'text-info' },
        error: { line: 'border-error', text: 'text-error' },
    };

    const lineClass = colorMap[color].line;
    const titleClass = colorMap[color].text;
</script>

<div class={clsx("border-l-4 mx-10 my-8 pl-4 py-4 flex items-start gap-4", lineClass, className)}>
    <div class="flex-shrink-0 mt-1">
        <Icon class={clsx("w-6 h-6", titleClass)} />
    </div>
    <div class="flex-1">
        <h3 class={clsx("font-bold mb-2 text-lg", titleClass)}>{title}</h3>
        <slot />
    </div>
</div>
