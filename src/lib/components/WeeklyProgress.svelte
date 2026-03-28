<script lang="ts">
	import type { WeeklyDayProgress } from '$lib/types';

	export let days: WeeklyDayProgress[] = [];
	export let badgeLabel = 'Mobile view';
	export let eyebrow = 'Weekly progress';
	export let title = 'This week';
	export let emptyMessage = 'Add a few habits to see progress here.';
</script>

<section class="stats-glass rounded-[1.75rem] p-5">
	<div class="flex items-start justify-between gap-4">
		<div>
			<p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
				{eyebrow}
			</p>
			<h2 class="mt-2 text-xl font-extrabold">{title}</h2>
		</div>
		<div class="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-strong)]">
			{badgeLabel}
		</div>
	</div>

	<div class="mt-5">
		{#if days.length === 0}
			<div class="stats-chip rounded-[1.5rem] border border-dashed border-white/45 px-4 py-6 text-sm text-slate-500 dark:text-slate-400">
				{emptyMessage}
			</div>
		{:else}
			<div class="flex h-28 items-end gap-2">
				{#each days as day}
					<div class="flex min-w-0 flex-1 flex-col items-center gap-2">
						<div class="flex h-20 w-full items-end justify-center rounded-[1rem] bg-white/25 p-1 dark:bg-slate-950/30">
							<div
								class={`w-4 rounded-full transition-all ${
									day.percentage === 0
										? 'bg-white/75 dark:bg-slate-700/80'
										: day.percentage < 35
											? 'bg-emerald-300/70 dark:bg-emerald-700/65'
											: day.percentage < 70
												? 'bg-[rgba(79,143,108,0.22)] dark:bg-[rgba(124,196,148,0.2)]'
												: 'bg-[rgba(79,143,108,0.9)] dark:bg-[rgba(124,196,148,0.9)]'
								}`}
								style={`height: ${Math.max(6, day.percentage)}%;`}
							></div>
						</div>

						<div class="text-center leading-tight">
							<p class="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
								{day.shortLabel}
							</p>
							<p class="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">{day.percentage}%</p>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>
