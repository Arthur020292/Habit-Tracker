<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import HabitList from '$lib/components/HabitList.svelte';
	import HabitTimeFilters from '$lib/components/HabitTimeFilters.svelte';
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import { habits } from '$lib/stores/habits';
	import {
		filterHabitsByTimeFilter,
		getAvailableHabitTimeFilters,
		getTodaySummary,
		type HabitTimeFilter
	} from '$lib/utils/habits';
	import { todayKey } from '$lib/utils/date';
	import type { Habit } from '$lib/types';
	let celebration = '';
	let celebrationTimer: ReturnType<typeof setTimeout> | undefined;
	let hasCelebrated = false;
	let currentDate = new Date();
	let selectedFilter: HabitTimeFilter = 'all';

	$: summary = getTodaySummary($habits, currentDate);
	$: filterOptions = getAvailableHabitTimeFilters($habits);
	$: if (!filterOptions.some((option) => option.value === selectedFilter)) {
		selectedFilter = 'all';
	}
	$: displayedHabits = filterHabitsByTimeFilter($habits, selectedFilter);
	$: if (!summary.allComplete) {
		hasCelebrated = false;
	}

	function toggleHabit(habit: Habit) {
		habits.toggleCompletion(habit.id, todayKey(currentDate));
	}

	$: if (summary.allComplete && summary.total > 0 && !hasCelebrated) {
		celebration = 'All habits completed today. Nice work.';
		hasCelebrated = true;
		if (celebrationTimer) {
			clearTimeout(celebrationTimer);
		}
		celebrationTimer = setTimeout(() => {
			celebration = '';
		}, 2600);
	}

	onMount(() => {
		currentDate = new Date();
	});

	onDestroy(() => {
		if (celebrationTimer) {
			clearTimeout(celebrationTimer);
		}
	});
</script>

<svelte:head>
	<title>Habit Tracker</title>
	<meta
		name="description"
		content="A calm, mobile-first habit tracker with local persistence, streak tracking, and weekly stats."
	/>
</svelte:head>

<section class="space-y-4">
	{#if celebration}
		<div class="panel rounded-[1.5rem] border-emerald-200/50 bg-emerald-50 px-4 py-3 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-100">
			<p class="text-sm font-semibold">{celebration}</p>
		</div>
	{/if}

	<SummaryCard {summary} date={currentDate} />

	<div class="flex items-center justify-between gap-3 pt-2">
		<div>
			<h2 class="mt-1 text-xl font-extrabold">Today's list</h2>
		</div>
	</div>

	{#if filterOptions.length > 0}
		<div class="sticky top-[calc(0.75rem+env(safe-area-inset-top))] z-20 -mx-4 px-4 py-2 md:static md:top-auto md:z-auto md:mx-0 md:px-0 md:py-0">
			<HabitTimeFilters
				filters={filterOptions}
				selected={selectedFilter}
				on:change={(event) => (selectedFilter = event.detail.value)}
			/>
		</div>
	{/if}

	<HabitList
		habits={displayedHabits}
		date={currentDate}
		on:toggle={(event) => toggleHabit(event.detail.habit)}
	/>
</section>
