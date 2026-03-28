<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Habit } from '$lib/types';
	import { formatHabitTime, frequencyLabel } from '$lib/utils/habits';

	export let habit: Habit;

	const dispatch = createEventDispatcher<{
		edit: void;
	}>();

	function handleEdit() {
		dispatch('edit');
	}
</script>

<article
	class="glass-card group relative animate-pop overflow-hidden rounded-[1.75rem] p-4 transition hover:-translate-y-0.5 hover:border-[var(--brand)]/30 hover:bg-white/70 hover:shadow-xl dark:hover:bg-slate-900/80"
>
	<button
		type="button"
		class="absolute inset-0 z-0 cursor-pointer rounded-[1.75rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/30"
		aria-label={`Edit ${habit.name}`}
		on:click={handleEdit}
	></button>

	<div class="pointer-events-none flex items-center gap-4">
		<div
			class="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl text-2xl shadow-sm"
			style={`background:${habit.color}20;color:${habit.color}`}
			aria-hidden="true"
		>
			{habit.icon || '•'}
		</div>

		<div class="relative z-10 min-w-0 flex-1">
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div class="min-w-0 flex-1">
					<h2 class="text-base font-bold leading-snug break-words sm:text-lg">{habit.name}</h2>
					<div class="mt-2 flex flex-wrap items-center gap-2">
						<div class="settings-control inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
							<span class="text-base leading-none">🕒</span>
							<span>{formatHabitTime(habit.time)}</span>
						</div>
						<div class="settings-control inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
							<span class="text-base leading-none">⌁</span>
							<span>{frequencyLabel(habit.frequency)}</span>
						</div>
					</div>
				</div>

			</div>

			<div class="absolute inset-x-4 bottom-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-400 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 dark:text-slate-500">
				<span class="h-px flex-1 bg-slate-200 dark:bg-slate-800"></span>
				<span>Click to edit</span>
			</div>
		</div>
	</div>
</article>
