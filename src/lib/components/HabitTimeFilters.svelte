<script lang="ts">
	import type { HabitTimeFilterOption, HabitTimeFilter } from '$lib/utils/habits';
	import { createEventDispatcher } from 'svelte';

	export let filters: HabitTimeFilterOption[] = [];
	export let selected: HabitTimeFilter = 'all';
	export let stuck = false;

	const dispatch = createEventDispatcher<{
		change: { value: HabitTimeFilter };
	}>();

	function selectFilter(value: HabitTimeFilter) {
		dispatch('change', { value });
	}
</script>

{#if filters.length > 0}
	<div
		class={`rounded-full p-2 transition-[background-color,border-color,box-shadow,backdrop-filter,transform] duration-200 ease-out ${
			stuck
				? 'green-glass-surface'
				: 'border border-transparent bg-transparent shadow-none backdrop-blur-0'
		}`}
	>
		<div class="flex items-center gap-2 overflow-x-auto scrollbar-hide">
			{#each filters as filter (filter.value)}
				<button
					type="button"
					class={`tap-target shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-[background-color,color,box-shadow,transform] duration-200 ease-out ${
						selected === filter.value
							? 'bg-[var(--brand)] text-[var(--brand-contrast)] shadow-[0_12px_28px_-14px_rgba(79,143,108,0.45)]'
							: 'green-glass-chip text-slate-700 hover:bg-white/90 dark:text-slate-200'
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
