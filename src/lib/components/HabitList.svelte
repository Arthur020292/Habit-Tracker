<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Habit } from '$lib/types';
	import { isHabitCompleteForDate } from '$lib/utils/habits';
	import { toDateKey } from '$lib/utils/date';
	import { sortHabitsByTime } from '$lib/utils/habits';
	import HabitCard from './HabitCard.svelte';

	export let habits: Habit[] = [];
	export let date = new Date();
	let orderedHabits: Habit[] = [];
	$: orderedHabits = sortHabitsByTime(habits);

	const dispatch = createEventDispatcher<{
		toggle: { habit: Habit };
	}>();

	function handleToggle(habit: Habit) {
		dispatch('toggle', { habit });
	}
</script>

{#if habits.length === 0}
	<section class="panel rounded-[1.75rem] p-6 text-center">
		<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--brand-soft)] text-3xl">
			🌿
		</div>
		<h2 class="mt-4 text-xl font-bold">No habits yet</h2>
		<p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
			Go to Habits to add your first routine and start tracking streaks, daily wins, and weekly progress.
		</p>
		<a
			href="/habits"
			class="mt-5 inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-[var(--brand-contrast)] shadow-lg shadow-emerald-200/60 transition hover:bg-[var(--brand-strong)]"
		>
			Manage habits
		</a>
	</section>
{:else}
	<div class="space-y-4">
		{#each orderedHabits as habit (habit.id)}
			{@const completedToday = isHabitCompleteForDate(habit, toDateKey(date))}
			<HabitCard {habit} {completedToday} on:toggle={() => handleToggle(habit)} />
		{/each}
	</div>
{/if}
