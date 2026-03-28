<script lang="ts">
	import { habits } from '$lib/stores/habits';
	import { settings } from '$lib/stores/settings';
	import { stickyState } from '$lib/actions/sticky';
	import MonthlyTrend from '$lib/components/MonthlyTrend.svelte';
	import StatsSummary from '$lib/components/StatsSummary.svelte';
	import WeeklyProgress from '$lib/components/WeeklyProgress.svelte';
	import {
		frequencyLabel,
		formatHabitTime,
		getDateRangeProgress,
		getHabitStats,
		getHabitStatsInRange,
		getWeekdayBreakdown
	} from '$lib/utils/habits';
	import type { Habit, HabitStats, WeeklyDayProgress } from '$lib/types';

	type HabitRow = {
		habit: Habit;
		rangeStats: HabitStats;
		allTimeStats: HabitStats;
	};

	let monthOffset = 0;
	let currentDate = new Date();
	let isMonthToolbarStuck = false;

	function getMonthWindow(referenceDate: Date, offset: number) {
		const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + offset, 1);
		monthStart.setHours(0, 0, 0, 0);

		const monthEnd =
			offset === 0
				? new Date(referenceDate)
				: new Date(referenceDate.getFullYear(), referenceDate.getMonth() + offset + 1, 0);
		monthEnd.setHours(23, 59, 59, 999);

		return {
			start: monthStart,
			end: monthEnd
		};
	}

	$: monthWindow = getMonthWindow(currentDate, monthOffset);
	$: monthLabel = monthWindow.start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
	$: rangeMeta = {
		title: monthLabel,
		description: `A calendar-month view for ${monthLabel}.`,
		groupLabel: 'Monthly snapshot',
		groupTitle: 'Daily trend',
		emptyMessage: `Add a few habits to see ${monthLabel.toLowerCase()}.`,
		completionLabel: 'Monthly completion'
	};
	$: rangeStart = monthWindow.start;
	$: rangeEnd = monthWindow.end;
	$: rangeProgress = getDateRangeProgress($habits, rangeStart, rangeEnd);
	$: rangeCompleted = rangeProgress.reduce((sum, day) => sum + day.completed, 0);
	$: rangeEligible = rangeProgress.reduce((sum, day) => sum + day.eligible, 0);
	$: rangeRate = rangeEligible === 0 ? 0 : Math.round((rangeCompleted / rangeEligible) * 100);
	$: bestDay =
		$habits.length === 0 || rangeProgress.length === 0
			? null
			: rangeProgress.reduce((best, day) => {
					if (day.percentage > best.percentage) {
						return day;
					}

					if (day.percentage === best.percentage && day.completed > best.completed) {
						return day;
					}

					if (
						day.percentage === best.percentage &&
						day.completed === best.completed &&
						day.eligible > best.eligible
					) {
						return day;
					}

			return best;
				});
	$: habitRows = $habits.map((habit) => ({
		habit,
		rangeStats: getHabitStatsInRange(habit, rangeStart, currentDate),
		allTimeStats: getHabitStats(habit, currentDate)
	}));
	$: rankedHabits = [...habitRows].sort((left, right) => {
		if (right.rangeStats.completionRate !== left.rangeStats.completionRate) {
			return right.rangeStats.completionRate - left.rangeStats.completionRate;
		}

		if (right.allTimeStats.currentStreak !== left.allTimeStats.currentStreak) {
			return right.allTimeStats.currentStreak - left.allTimeStats.currentStreak;
		}

		if (right.allTimeStats.bestStreak !== left.allTimeStats.bestStreak) {
			return right.allTimeStats.bestStreak - left.allTimeStats.bestStreak;
		}

		return left.habit.name.localeCompare(right.habit.name);
	});
	$: bestStreakLeader = habitRows.reduce<HabitRow | null>((best, row) => {
		if (!best) {
			return row;
		}

		if (row.allTimeStats.bestStreak !== best.allTimeStats.bestStreak) {
			return row.allTimeStats.bestStreak > best.allTimeStats.bestStreak ? row : best;
		}

		if (row.allTimeStats.currentStreak !== best.allTimeStats.currentStreak) {
			return row.allTimeStats.currentStreak > best.allTimeStats.currentStreak ? row : best;
		}

		return row.habit.name.localeCompare(best.habit.name) < 0 ? row : best;
	}, null);
	$: weekdayProgress = $habits.length === 0 ? [] : getWeekdayBreakdown($habits, rangeStart, rangeEnd);
	$: visualDays = $habits.length === 0 ? [] : rangeProgress;
	$: summaryCards = [
		{
			label: rangeMeta.completionLabel,
			value: `${rangeRate}%`,
			note: `${rangeCompleted} completed of ${rangeEligible} scheduled`
		},
		{
			label: 'Best streak',
				value: bestStreakLeader ? bestStreakLeader.habit.name : 'No habits yet',
				note: bestStreakLeader
					? `${bestStreakLeader.allTimeStats.bestStreak} day${bestStreakLeader.allTimeStats.bestStreak === 1 ? '' : 's'} best`
				: 'Add habits to track streaks'
		}
	];
</script>

<svelte:head>
	<title>HabitMate Stats</title>
	<meta name="description" content="Total, monthly, and weekly habit analytics." />
</svelte:head>

<section class="space-y-4">
	<div class="flex items-end justify-between gap-4">
		<div>
			<p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
				Analytics
			</p>
			<h1 class="mt-1 text-3xl font-extrabold">{rangeMeta.title}</h1>
			<p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
				{rangeMeta.description}
			</p>
		</div>
	<a
		href="/"
		class="green-glass-chip hidden rounded-full px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 md:inline-flex"
	>
		Back to Today
	</a>
</div>

	<div
		use:stickyState={{ offset: 12, onChange: (stuck) => (isMonthToolbarStuck = stuck) }}
		class="sticky top-[calc(0.75rem+env(safe-area-inset-top))] z-20 -mx-4 px-4 py-2 md:static md:top-auto md:z-auto md:mx-0 md:px-0 md:py-0"
	>
		<div
			class={`rounded-[1.5rem] p-2 transition-[background-color,border-color,box-shadow,backdrop-filter,transform] duration-200 ease-out ${
				isMonthToolbarStuck
					? 'green-glass-surface'
					: 'stats-glass'
			}`}
		>
			<div class="flex w-full items-center justify-between gap-3">
				<div class="flex min-w-0 items-center gap-2">
					<button
						type="button"
						class="green-glass-chip inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-700 dark:text-slate-200"
						on:click={() => (monthOffset -= 1)}
						aria-label="Previous month"
					>
						<span aria-hidden="true">‹</span>
					</button>
					<div class="min-w-0 px-1 text-base font-extrabold tracking-tight sm:px-2">{monthLabel}</div>
					<button
						type="button"
						class="green-glass-chip inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-700 dark:text-slate-200"
						on:click={() => (monthOffset += 1)}
						aria-label="Next month"
					>
						<span aria-hidden="true">›</span>
					</button>
				</div>
				<button
					type="button"
					class={`green-glass-chip inline-flex h-11 shrink-0 items-center justify-center rounded-full px-4 text-sm font-semibold transition ${
						monthOffset === 0
							? 'cursor-default opacity-60 text-slate-700 dark:text-slate-300'
							: 'text-slate-700 hover:brightness-105 dark:text-slate-300'
					}`}
					on:click={() => (monthOffset = 0)}
					aria-label="Back to current month"
					disabled={monthOffset === 0}
				>
					Today
				</button>
			</div>
		</div>
	</div>

	{#if $habits.length === 0}
		<div class="stats-glass rounded-[1.75rem] p-5">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
						No habits yet
					</p>
					<h2 class="mt-2 text-xl font-extrabold">Stats will come alive once you add habits.</h2>
					<p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
						Create a few habits and come back here to compare your monthly trend and weekday patterns.
					</p>
				</div>
				<a
					href="/habits"
					class="inline-flex rounded-full bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-[var(--brand-contrast)] shadow-lg shadow-emerald-200/60 transition hover:brightness-105"
				>
					Add habits
				</a>
			</div>
		</div>
	{/if}

	<StatsSummary cards={summaryCards} />

	<MonthlyTrend
		days={visualDays}
		eyebrow={rangeMeta.groupLabel}
		title={rangeMeta.groupTitle}
		emptyMessage={rangeMeta.emptyMessage}
		completedDays={rangeCompleted}
		eligibleDays={rangeEligible}
		bestDayLabel={bestDay ? bestDay.label : '—'}
	/>

	<WeeklyProgress
		days={weekdayProgress}
		badgeLabel="Patterns"
		eyebrow="Weekday pattern"
		title="Where your habits land"
		emptyMessage="Add habits to see which weekdays are strongest and weakest."
	/>

	<div class="space-y-3 pt-2">
		<div class="flex items-center justify-between gap-3">
			<div>
				<h2 class="text-xl font-extrabold">Ranked habits</h2>
				<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
					Sorted by this month, then by your current streaks.
				</p>
			</div>
			<p class="text-sm text-slate-500 dark:text-slate-400">
				{rangeCompleted} of {rangeEligible} completed days
			</p>
		</div>

		{#if $habits.length === 0}
			<div class="panel rounded-[1.75rem] p-6 text-center">
				<p class="text-lg font-bold">Nothing to rank yet</p>
				<p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
					Add habits from the Habits page and this section will rank them by consistency automatically.
				</p>
			</div>
		{:else}
			<div class="space-y-3">
				{#each rankedHabits as item, index (item.habit.id)}
					{@const isLeader = index === 0}
					<div class={`stats-glass rounded-[1.75rem] p-4 ${isLeader ? 'ring-1 ring-[var(--brand)]/20' : ''}`}>
						<div class="flex items-start justify-between gap-3">
							<div class="min-w-0">
								<div class="flex items-center gap-3">
									<div
										class="flex h-11 w-11 items-center justify-center rounded-2xl text-xl"
										style={`background:${item.habit.color}20;color:${item.habit.color}`}
										aria-hidden="true"
									>
										{item.habit.icon}
									</div>
									<div class="min-w-0">
										<div class="flex items-center gap-2">
											<h3 class="truncate text-base font-bold">{item.habit.name}</h3>
											{#if isLeader}
												<span class="rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
													Leader
												</span>
											{/if}
										</div>
										<p class="text-sm text-slate-500 dark:text-slate-400">
											{frequencyLabel(item.habit.frequency)} · {formatHabitTime(item.habit.time)}
										</p>
									</div>
								</div>
							</div>
							<div class="stats-chip rounded-2xl px-3 py-2 text-right">
								<p class="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--brand-strong)]">
									Rate
								</p>
								<p class="mt-1 text-lg font-extrabold">{item.rangeStats.completionRate}%</p>
							</div>
						</div>

						<div class="mt-4 h-3 overflow-hidden rounded-full border border-white/55 bg-slate-200/70 shadow-inner dark:border-slate-700/60 dark:bg-slate-950/55">
							<div
								class="relative h-full rounded-full bg-[linear-gradient(90deg,var(--brand)_0%,var(--brand-strong)_100%)] shadow-[0_10px_20px_-10px_rgba(47,109,76,0.85)] transition-all"
								style={`width:${item.rangeStats.completionRate}%`}
							>
								{#if item.rangeStats.completionRate > 0}
									<span
										class="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-[var(--brand)] bg-white shadow-[0_8px_18px_rgba(15,23,42,0.18)] dark:bg-slate-100"
										aria-hidden="true"
									></span>
								{/if}
							</div>
						</div>

						<div class="mt-4 grid grid-cols-3 divide-x divide-[rgba(116,146,128,0.16)] overflow-hidden rounded-[1.25rem] dark:divide-[rgba(148,163,184,0.16)]">
							<div class="px-3 py-3">
								<p class="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
									Selected
								</p>
								<p class="mt-2 text-xl font-extrabold">{item.rangeStats.currentStreak}</p>
							</div>
							<div class="px-3 py-3">
								<p class="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
									Current
								</p>
								<p class="mt-2 text-xl font-extrabold">{item.allTimeStats.currentStreak}</p>
							</div>
							<div class="px-3 py-3">
								<p class="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
									Best
								</p>
								<p class="mt-2 text-xl font-extrabold">{item.allTimeStats.bestStreak}</p>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>
