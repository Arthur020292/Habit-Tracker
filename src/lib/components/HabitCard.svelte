<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Habit } from '$lib/types';
	import { formatHabitTime } from '$lib/utils/habits';

	export let habit: Habit;
	export let completedToday = false;

	const dispatch = createEventDispatcher<{
		toggle: void;
	}>();

	function handleToggle() {
		dispatch('toggle');
	}
</script>

<button
	type="button"
	class={`group animate-pop block w-full rounded-[1.75rem] border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/40 ${
		completedToday
			? 'border-transparent text-[var(--brand-contrast)] shadow-lg shadow-emerald-200/60 hover:-translate-y-0.5'
			: 'glass-card hover:-translate-y-0.5 hover:shadow-lg'
	}`}
	style={
		completedToday
			? 'background: linear-gradient(135deg, rgba(79, 143, 108, 0.88), rgba(47, 109, 76, 0.82)); backdrop-filter: blur(20px);'
			: undefined
	}
	on:click={handleToggle}
	aria-pressed={completedToday}
	aria-label={`Toggle ${habit.name}`}
>
	<div class="flex items-start gap-4">
		<div
			class={`flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl text-2xl shadow-sm transition ${
				completedToday ? 'bg-white/15 text-white' : ''
			}`}
			style={!completedToday ? `background:${habit.color}20;color:${habit.color}` : undefined}
			aria-hidden="true"
		>
			{habit.icon || '•'}
		</div>

		<div class="min-w-0 flex-1">
			<div class="space-y-4">
				<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div class="min-w-0 flex-1">
						<h2 class="text-base font-bold leading-snug break-words sm:text-lg">{habit.name}</h2>
						<div class="mt-2 flex flex-wrap items-center gap-2">
							<div
							class={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
								completedToday
									? 'bg-white/15 text-white'
									: 'settings-control text-slate-600 dark:text-slate-300'
							}`}
						>
								<span class="text-base leading-none">🕒</span>
								<span>{formatHabitTime(habit.time)}</span>
							</div>
							{#if completedToday}
								<div class="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white">
									<span class="text-base leading-none">✓</span>
									Done
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</button>
