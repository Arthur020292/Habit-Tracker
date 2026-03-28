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

	<div class="mt-5 space-y-3">
		{#if days.length === 0}
			<div class="stats-chip rounded-[1.5rem] border border-dashed border-white/45 px-4 py-6 text-sm text-slate-500 dark:text-slate-400">
				{emptyMessage}
			</div>
		{:else}
			{#each days as day}
				<div class="grid grid-cols-[3rem,1fr,3rem] items-center gap-3">
					<div>
						<p class="text-sm font-semibold">{day.shortLabel}</p>
						<p class="text-xs text-slate-500 dark:text-slate-400">{day.label}</p>
					</div>
					<div class="h-3 overflow-hidden rounded-full bg-white/40 dark:bg-slate-950/50">
						<div
							class="h-full rounded-full bg-[var(--brand)] transition-all"
							style={`width:${day.percentage}%`}
						></div>
					</div>
					<p class="text-right text-sm font-bold">{day.percentage}%</p>
				</div>
			{/each}
		{/if}
	</div>
</section>
