<script lang="ts">
	import { browser } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';
	import HabitList from '$lib/components/HabitList.svelte';
	import HabitTimeFilters from '$lib/components/HabitTimeFilters.svelte';
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import { stickyState } from '$lib/actions/sticky';
	import { habits } from '$lib/stores/habits';
	import { storageNotice } from '$lib/stores/storageNotice';
	import {
		filterHabitsByTimeFilter,
		getAvailableHabitTimeFilters,
		getTodaySummary,
		type HabitTimeFilter
	} from '$lib/utils/habits';
	import { todayKey } from '$lib/utils/date';
	import type { Habit } from '$lib/types';

	const CELEBRATION_STORAGE_PREFIX = 'habitmate:celebration-seen:';
	let celebration = '';
	let celebrationTimer: ReturnType<typeof setTimeout> | undefined;
	let hasCelebrated = false;
	let celebrationLoaded = false;
	let currentDate = new Date();
	let selectedFilter: HabitTimeFilter = 'all';
	let isFilterStuck = false;

	$: summary = getTodaySummary($habits, currentDate);
	$: filterOptions = getAvailableHabitTimeFilters($habits);
	$: if (!filterOptions.some((option) => option.value === selectedFilter)) {
		selectedFilter = 'all';
	}
	$: displayedHabits = filterHabitsByTimeFilter($habits, selectedFilter);
	$: if (!summary.allComplete) {
		hasCelebrated = false;
	}
	$: celebrationKey = todayKey(currentDate);
	$: celebrationStorageKey = `${CELEBRATION_STORAGE_PREFIX}${celebrationKey}`;
	$: celebrationAlreadySeen = browser && celebrationLoaded ? localStorage.getItem(celebrationStorageKey) === '1' : false;

	function toggleHabit(habit: Habit) {
		habits.toggleCompletion(habit.id, todayKey(currentDate));
	}

	$: if (summary.allComplete && summary.total > 0 && celebrationLoaded && !celebrationAlreadySeen && !hasCelebrated) {
		celebration = 'All habits completed today. Nice work.';
		hasCelebrated = true;
		if (browser) {
			try {
				localStorage.setItem(celebrationStorageKey, '1');
			} catch {
				storageNotice.report('Your browser blocked a local save for the celebration message.');
			}
		}
		if (celebrationTimer) {
			clearTimeout(celebrationTimer);
		}
		celebrationTimer = setTimeout(() => {
			celebration = '';
		}, 2600);
	}

	onMount(() => {
		currentDate = new Date();
		celebrationLoaded = true;
	});

	onDestroy(() => {
		if (celebrationTimer) {
			clearTimeout(celebrationTimer);
		}
	});
</script>

<svelte:head>
	<title>HabitMate</title>
	<meta
		name="description"
		content="A calm, mobile-first habit tracker with local persistence, streak tracking, and weekly stats."
	/>
</svelte:head>

<section class="space-y-4">
	{#if celebration}
		<div
			class="pointer-events-none fixed inset-x-0 top-[calc(0.75rem+env(safe-area-inset-top))] z-50 flex justify-center px-4"
			aria-live="polite"
			role="status"
		>
			<div
				class="stats-glass inline-flex w-full max-w-md items-center gap-3 rounded-full px-4 py-3 text-[var(--brand-strong)] shadow-[0_24px_60px_-32px_rgba(79,143,108,0.45)] animate-pop dark:text-[var(--brand-contrast)] sm:w-auto"
			>
				<span
					class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-base font-black"
					aria-hidden="true"
				>
					✓
				</span>
				<p class="text-sm font-semibold leading-6">{celebration}</p>
			</div>
		</div>
	{/if}

	<SummaryCard {summary} date={currentDate} />

	<div class="flex items-center justify-between gap-3 pt-2">
		<div>
			<h2 class="mt-1 text-xl font-extrabold">Today's list</h2>
		</div>
	</div>

	{#if filterOptions.length > 0}
		<div
			use:stickyState={{ offset: 12, onChange: (stuck) => (isFilterStuck = stuck) }}
			class="sticky top-[calc(0.75rem+env(safe-area-inset-top))] z-20 -mx-4 px-4 py-2 md:static md:top-auto md:z-auto md:mx-0 md:px-0 md:py-0"
		>
			<HabitTimeFilters
				filters={filterOptions}
				selected={selectedFilter}
				stuck={isFilterStuck}
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
