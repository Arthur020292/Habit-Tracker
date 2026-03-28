<script lang="ts">
	import type { HabitTimeFilterOption, HabitTimeFilter } from '$lib/utils/habits';
	import { createEventDispatcher } from 'svelte';

	export let filters: HabitTimeFilterOption[] = [];
	export let selected: HabitTimeFilter = 'all';

	const dispatch = createEventDispatcher<{
		change: { value: HabitTimeFilter };
	}>();

	function selectFilter(value: HabitTimeFilter) {
		dispatch('change', { value });
	}
</script>

{#if filters.length > 0}
	<div class="rounded-full border border-white/50 bg-white/45 p-2 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/35">
		<div class="flex items-center gap-2 overflow-x-auto scrollbar-hide">
			{#each filters as filter (filter.value)}
				<button
					type="button"
					class={`tap-target shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-[background-color,color,box-shadow,transform] duration-200 ease-out ${
						selected === filter.value
							? 'bg-[var(--brand)] text-[var(--brand-contrast)] shadow-[0_12px_28px_-14px_rgba(79,143,108,0.45)]'
							: 'border border-white/70 bg-white/70 text-slate-700 shadow-[0_8px_20px_-16px_rgba(15,23,42,0.25)] hover:bg-white/85 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10'
					}`}
					aria-pressed={selected === filter.value}
					on:click={() => selectFilter(filter.value)}
				>
					{filter.label}
				</button>
			{/each}
		</div>
	</div>
{/if}
