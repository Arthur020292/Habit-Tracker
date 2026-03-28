<script lang="ts">
	type PeriodBar = {
		key: string;
		label: string;
		shortLabel?: string;
		completed: number;
		eligible: number;
		percentage: number;
	};

	export let bars: PeriodBar[] = [];
	export let badgeLabel = 'All time';
	export let eyebrow = 'Lifetime trend';
	export let title = 'Monthly progress';
	export let emptyMessage = 'Add habits to build a lifetime trend.';
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

	{#if bars.length === 0}
		<div class="stats-chip mt-5 rounded-[1.5rem] border border-dashed border-white/45 px-4 py-6 text-sm text-slate-500 dark:text-slate-400">
			{emptyMessage}
		</div>
	{:else}
		<div class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
			{#each bars as bar}
				<div class="stats-chip rounded-[1.5rem] p-4">
					<div class="flex items-end justify-between gap-3">
						<div>
							<p class="text-sm font-bold">{bar.label}</p>
							<p class="text-xs text-slate-500 dark:text-slate-400">{bar.completed}/{bar.eligible} completed</p>
						</div>
						<p class="text-lg font-extrabold">{bar.percentage}%</p>
					</div>

					<div class="mt-4 flex h-40 items-end gap-3">
						<div class="flex h-full w-12 items-end overflow-hidden rounded-full bg-white/40 dark:bg-slate-950/50">
							<div
								class="w-full rounded-full bg-[var(--brand)] transition-all"
								style={`height:${Math.max(4, bar.percentage)}%`}
							></div>
						</div>
						<div class="flex-1">
							<p class="text-sm font-semibold text-slate-600 dark:text-slate-300">
								{bar.shortLabel ?? bar.label}
							</p>
							<p class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
								Completion by month or period, showing how much of the available schedule was actually hit.
							</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>
