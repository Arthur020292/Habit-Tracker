<script lang="ts">
	import type { WeeklyDayProgress } from '$lib/types';

	export let days: WeeklyDayProgress[] = [];
	export let badgeLabel = 'Last 30 days';
	export let eyebrow = 'Trend';
	export let title = 'Selected range';
	export let emptyMessage = 'Add a few habits to start building a trend.';
	export let completedDays = 0;
	export let eligibleDays = 0;
	export let bestDayLabel = '—';
	export let bestDayRate = 0;

	function getCellClass(percentage: number): string {
		if (percentage === 0) {
			return 'border-[rgba(79,143,108,0.12)] bg-[rgba(79,143,108,0.04)] text-[var(--text-muted)] shadow-[0_14px_30px_-24px_rgba(15,23,42,0.12)] dark:border-[rgba(124,196,148,0.12)] dark:bg-[rgba(124,196,148,0.06)] dark:text-slate-400';
		}

		if (percentage < 35) {
			return 'border-[rgba(79,143,108,0.18)] bg-[rgba(79,143,108,0.08)] text-[var(--brand-strong)] shadow-[0_14px_30px_-24px_rgba(15,23,42,0.14)] dark:border-[rgba(124,196,148,0.18)] dark:bg-[rgba(124,196,148,0.08)] dark:text-[var(--brand-contrast)]';
		}

		if (percentage < 70) {
			return 'border-[rgba(79,143,108,0.24)] bg-[rgba(79,143,108,0.16)] text-[var(--brand-strong)] shadow-[0_14px_28px_-24px_rgba(15,23,42,0.16)] dark:border-[rgba(124,196,148,0.20)] dark:bg-[rgba(124,196,148,0.16)] dark:text-[var(--brand-contrast)]';
		}

		return 'border-[rgba(79,143,108,0.34)] bg-[linear-gradient(180deg,rgba(79,143,108,0.94),rgba(47,109,76,0.96))] text-[var(--brand-contrast)] shadow-lg shadow-emerald-200/20 dark:border-[rgba(124,196,148,0.26)] dark:bg-[linear-gradient(180deg,rgba(124,196,148,0.42),rgba(79,143,108,0.42))] dark:text-[var(--brand-contrast)]';
	}

	$: gridClass =
		days.length <= 7
			? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7'
			: days.length <= 14
				? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7'
				: 'grid-cols-3 sm:grid-cols-5 lg:grid-cols-10';
</script>

<section class="stats-glass rounded-[1.75rem] p-5">
	<div class="flex items-start justify-between gap-4">
		<div>
			<p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
				{eyebrow}
			</p>
			<h2 class="mt-2 text-xl font-extrabold">{title}</h2>
		</div>
		<div class="stats-chip rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-strong)]">
			{badgeLabel}
		</div>
	</div>

	{#if days.length === 0}
		<div class="stats-chip mt-5 rounded-[1.5rem] border border-dashed border-white/45 px-4 py-6 text-sm text-slate-500 dark:text-slate-400">
			{emptyMessage}
		</div>
	{:else}
		<div class={`mt-5 grid gap-2 ${gridClass}`}>
			{#each days as day}
				<div
			class={`min-h-[5.5rem] rounded-2xl border p-3 transition ${getCellClass(day.percentage)}`}
			title={`${day.label}: ${day.completed}/${day.eligible}`}
		>
					<div class="flex h-full flex-col justify-between">
						<div class="flex items-start justify-between gap-2">
							<p class="text-[0.68rem] font-bold uppercase tracking-[0.18em]">
								{day.shortLabel}
							</p>
							<p class="text-[0.68rem] font-semibold">{day.percentage}%</p>
						</div>
						<div>
							<p class="text-sm font-extrabold leading-tight">{day.label}</p>
							<p class="mt-1 text-[0.72rem] font-medium">
								{day.completed}/{day.eligible}
							</p>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-4 grid gap-3 sm:grid-cols-3">
			<div class="stats-chip rounded-3xl px-4 py-3">
				<p class="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
					Completed
				</p>
				<p class="mt-2 text-xl font-extrabold">{completedDays}</p>
			</div>
			<div class="stats-chip rounded-3xl px-4 py-3">
				<p class="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
					Eligible
				</p>
				<p class="mt-2 text-xl font-extrabold">{eligibleDays}</p>
			</div>
			<div class="stats-chip rounded-3xl px-4 py-3">
				<p class="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
					Best day
				</p>
				<p class="mt-2 text-lg font-extrabold leading-tight">{bestDayLabel}</p>
				<p class="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{bestDayRate}%</p>
			</div>
		</div>
	{/if}
</section>
