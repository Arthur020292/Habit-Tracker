<script lang="ts">
	import { habits } from '$lib/stores/habits';
	import { settings } from '$lib/stores/settings';
	import MonthlyTrend from '$lib/components/MonthlyTrend.svelte';
	import PeriodBars from '$lib/components/PeriodBars.svelte';
	import StatsSummary from '$lib/components/StatsSummary.svelte';
	import WeeklyProgress from '$lib/components/WeeklyProgress.svelte';
	import {
		frequencyLabel,
		formatHabitTime,
		getDateRangeProgress,
		getHabitStats,
		getHabitStatsInRange,
		getStatsRangeStartDate,
		getWeekdayBreakdown
	} from '$lib/utils/habits';
	import { fromDateKey } from '$lib/utils/date';
	import type { Habit, HabitStats, StatsRange, WeeklyDayProgress } from '$lib/types';

	type HabitRow = {
		habit: Habit;
		rangeStats: HabitStats;
		allTimeStats: HabitStats;
	};

	type MonthBar = {
		key: string;
		label: string;
		shortLabel: string;
		completed: number;
		eligible: number;
		percentage: number;
	};

	const RANGE_OPTIONS: Array<{
		value: StatsRange;
		label: string;
		description: string;
	}> = [
		{ value: 'total', label: 'Total', description: 'Lifetime trend' },
		{ value: 'month', label: 'Monthly', description: 'Last 30 days' },
		{ value: 'week', label: 'Weekly', description: 'This week' }
	];

	let selectedRange: StatsRange = 'month';
	let currentDate = new Date();

	function getRangeMeta(range: StatsRange, weekStart: number) {
		if (range === 'total') {
			return {
				title: 'All-time stats',
				badge: 'Lifetime',
				description: 'Your entire habit history, from the first logged habit to today.',
				groupLabel: 'Lifetime timeline',
				groupTitle: 'Monthly progress',
				emptyMessage: 'Add habits to build a lifetime trend.',
				completionLabel: 'Lifetime completion'
			};
		}

		if (range === 'month') {
			return {
				title: 'Monthly stats',
				badge: 'Last 30 days',
				description: 'A trailing 30-day view of consistency, streaks, and completion patterns.',
				groupLabel: '30-day pulse',
				groupTitle: 'Daily trend',
				emptyMessage: 'Add a few habits to see the last 30 days.',
				completionLabel: '30-day completion'
			};
		}

		return {
			title: 'Weekly stats',
			badge: weekStart === 1 ? 'Monday start' : 'Sunday start',
			description: 'The current week so far, anchored to your selected week start.',
			groupLabel: 'Current week',
			groupTitle: 'Daily trend',
			emptyMessage: 'Add a few habits to see this week.',
			completionLabel: 'Weekly completion'
		};
	}

	function buildMonthBars(days: WeeklyDayProgress[]): MonthBar[] {
		const buckets = new Map<string, MonthBar>();

		for (const day of days) {
			const date = fromDateKey(day.dateKey);
			const key = `${date.getFullYear()}-${date.getMonth()}`;
			const label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
			const shortLabel = date.toLocaleDateString('en-US', { month: 'short' });
			const existing =
				buckets.get(key) ?? {
					key,
					label,
					shortLabel,
					completed: 0,
					eligible: 0,
					percentage: 0
				};

			existing.completed += day.completed;
			existing.eligible += day.eligible;
			buckets.set(key, existing);
		}

		return Array.from(buckets.values()).map((bucket) => ({
			...bucket,
			percentage: bucket.eligible === 0 ? 0 : Math.round((bucket.completed / bucket.eligible) * 100)
		}));
	}

	$: rangeStart = getStatsRangeStartDate($habits, selectedRange, currentDate, $settings.weekStart);
	$: rangeMeta = getRangeMeta(selectedRange, $settings.weekStart);
	$: rangeProgress = getDateRangeProgress($habits, rangeStart, currentDate);
	$: rangeCompleted = rangeProgress.reduce((sum, day) => sum + day.completed, 0);
	$: rangeEligible = rangeProgress.reduce((sum, day) => sum + day.eligible, 0);
	$: rangeRate = rangeEligible === 0 ? 0 : Math.round((rangeCompleted / rangeEligible) * 100);
	$: bestDay =
		$habits.length === 0 || selectedRange === 'total' || rangeProgress.length === 0
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
	$: currentStreakLeader = [...habitRows].sort((left, right) => {
		if (right.allTimeStats.currentStreak !== left.allTimeStats.currentStreak) {
			return right.allTimeStats.currentStreak - left.allTimeStats.currentStreak;
		}

		if (right.allTimeStats.bestStreak !== left.allTimeStats.bestStreak) {
			return right.allTimeStats.bestStreak - left.allTimeStats.bestStreak;
		}

		return left.habit.name.localeCompare(right.habit.name);
	})[0];
	$: bestStreakLeader = [...habitRows].sort((left, right) => {
		if (right.allTimeStats.bestStreak !== left.allTimeStats.bestStreak) {
			return right.allTimeStats.bestStreak - left.allTimeStats.bestStreak;
		}

		if (right.allTimeStats.currentStreak !== left.allTimeStats.currentStreak) {
			return right.allTimeStats.currentStreak - left.allTimeStats.currentStreak;
		}

		return left.habit.name.localeCompare(right.habit.name);
	})[0];
	$: weekdayProgress = $habits.length === 0 ? [] : getWeekdayBreakdown($habits, rangeStart, currentDate);
	$: bestWeekday = weekdayProgress.reduce(
		(best, day) => {
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
		},
			{ dateKey: '0', label: 'Sunday', shortLabel: 'Sun', completed: 0, eligible: 0, percentage: 0 }
		);
	$: worstWeekday = weekdayProgress.reduce(
		(worst, day) => {
			if (day.percentage < worst.percentage) {
				return day;
			}

			if (day.percentage === worst.percentage && day.eligible > worst.eligible) {
				return day;
			}

			return worst;
		},
		{ dateKey: '0', label: 'Sunday', shortLabel: 'Sun', completed: 0, eligible: 0, percentage: 100 }
	);
	$: visualDays = $habits.length === 0 || selectedRange === 'total' ? [] : rangeProgress;
	$: monthlyBars = $habits.length === 0 || selectedRange !== 'total' ? [] : buildMonthBars(rangeProgress);
	$: summaryCards = [
		{
			label: rangeMeta.completionLabel,
			value: `${rangeRate}%`,
			note: `${rangeCompleted} completed of ${rangeEligible} scheduled`
		},
		{
			label: 'Top habit',
			value: rankedHabits[0] ? rankedHabits[0].habit.name : 'No habits yet',
			note: rankedHabits[0]
				? `${rankedHabits[0].rangeStats.completionRate}% in the selected view`
				: 'Add habits to start ranking them'
		},
		{
			label: 'Current streak leader',
			value: currentStreakLeader ? currentStreakLeader.habit.name : 'No habits yet',
			note: currentStreakLeader
				? `${currentStreakLeader.allTimeStats.currentStreak} day${currentStreakLeader.allTimeStats.currentStreak === 1 ? '' : 's'} in a row`
				: 'Add habits to see streak leaders'
		},
		{
			label: 'Best weekday',
			value: bestWeekday.eligible > 0 ? bestWeekday.label : '—',
			note:
				bestWeekday.eligible > 0
					? `${bestWeekday.percentage}% completion; weakest day is ${worstWeekday.label}`
					: 'No weekday patterns yet'
		}
	];
</script>

<svelte:head>
	<title>Habit Tracker Stats</title>
	<meta name="description" content="Total, monthly, and weekly habit analytics." />
</svelte:head>

<section class="space-y-4">
	<div class="flex flex-col gap-4">
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
				class="stats-tab hidden rounded-full px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 md:inline-flex"
			>
				Back to Today
			</a>
		</div>

		<div class="grid gap-2 sm:grid-cols-3">
			{#each RANGE_OPTIONS as option}
				<button
					type="button"
					class={`stats-tab rounded-[1.25rem] px-4 py-3 text-left transition ${
						selectedRange === option.value
							? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-strong)] shadow-lg shadow-emerald-200/30'
							: 'border-white/45 text-slate-700 dark:text-slate-300'
					}`}
					on:click={() => (selectedRange = option.value)}
					aria-pressed={selectedRange === option.value}
				>
					<p class="text-sm font-bold">{option.label}</p>
					<p class="mt-1 text-xs uppercase tracking-[0.18em] opacity-75">{option.description}</p>
				</button>
			{/each}
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
						Create a few habits and come back here to compare your total, monthly, and weekly patterns.
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

	{#if selectedRange === 'total'}
		<PeriodBars
			bars={monthlyBars}
			badgeLabel={rangeMeta.badge}
			eyebrow={rangeMeta.groupLabel}
			title={rangeMeta.groupTitle}
			emptyMessage={rangeMeta.emptyMessage}
		/>
	{:else}
		<MonthlyTrend
			days={visualDays}
			badgeLabel={rangeMeta.badge}
			eyebrow={rangeMeta.groupLabel}
			title={rangeMeta.groupTitle}
			emptyMessage={rangeMeta.emptyMessage}
			completedDays={rangeCompleted}
			eligibleDays={rangeEligible}
			bestDayLabel={bestDay ? bestDay.label : '—'}
			bestDayRate={bestDay ? bestDay.percentage : 0}
		/>
	{/if}

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
					Sorted by the selected view, then by your current streaks.
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

						<div class="mt-4 h-2 overflow-hidden rounded-full bg-white/40 dark:bg-slate-950/50">
							<div
								class="h-full rounded-full bg-[var(--brand)] transition-all"
								style={`width:${item.rangeStats.completionRate}%`}
							></div>
						</div>

						<div class="mt-4 grid grid-cols-3 gap-3">
							<div class="stats-chip rounded-3xl px-3 py-3">
								<p class="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
									Selected
								</p>
								<p class="mt-2 text-xl font-extrabold">{item.rangeStats.currentStreak}</p>
							</div>
							<div class="stats-chip rounded-3xl px-3 py-3">
								<p class="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
									Current
								</p>
								<p class="mt-2 text-xl font-extrabold">{item.allTimeStats.currentStreak}</p>
							</div>
							<div class="stats-chip rounded-3xl px-3 py-3">
								<p class="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
									Best
								</p>
								<p class="mt-2 text-xl font-extrabold">{item.allTimeStats.bestStreak}</p>
								<p class="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
									{item.rangeStats.completedDays}/{item.rangeStats.scheduledDays} in view
								</p>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>
