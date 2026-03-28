<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Habit } from '$lib/types';
	import { sortHabitsByTime } from '$lib/utils/habits';
	import HabitManageCard from './HabitManageCard.svelte';

	export let habits: Habit[] = [];
	let orderedHabits: Habit[] = [];
	$: orderedHabits = sortHabitsByTime(habits);

	const dispatch = createEventDispatcher<{
		edit: { habit: Habit };
	}>();

	function handleEdit(habit: Habit) {
		dispatch('edit', { habit });
	}

</script>

{#if habits.length === 0}
	<section class="panel rounded-[1.75rem] p-6 text-center">
		<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--brand-soft)] text-3xl">
			🌿
		</div>
		<h2 class="mt-4 text-xl font-bold">No habits yet</h2>
		<p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
			Add your first routine to start building a schedule you can manage in one place.
		</p>
	</section>
{:else}
	<div class="space-y-4">
		{#each orderedHabits as habit (habit.id)}
			<HabitManageCard
				{habit}
				on:edit={() => handleEdit(habit)}
			/>
		{/each}
	</div>
{/if}
