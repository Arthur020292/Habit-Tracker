<script lang="ts">
	import type { TodaySummary } from '$lib/types';
	import { formatTodayLabel } from '$lib/utils/date';

	export let summary: TodaySummary;
	export let date = new Date();
</script>

<section
	class="relative overflow-hidden rounded-[2rem] border border-white/15 p-5 text-white shadow-glow"
	style="background: linear-gradient(135deg, rgba(79, 143, 108, 0.98), rgba(47, 109, 76, 0.94));"
>
	<div
		class="pointer-events-none absolute inset-0"
		style="background: radial-gradient(circle at top right, rgba(255,255,255,0.18), transparent 30%), radial-gradient(circle at bottom left, rgba(255,255,255,0.12), transparent 28%);"
	></div>
	<div class="relative z-10 flex items-start justify-between gap-4">
		<div>
			<p class="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-50/70">Today</p>
			<h1 class="mt-2 text-2xl font-extrabold leading-tight sm:text-3xl">{formatTodayLabel(date)}</h1>
		</div>
		<div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white/15 text-3xl backdrop-blur">
			🌱
		</div>
	</div>

	<div class="relative z-10 mt-6 grid grid-cols-3 gap-3">
		<div class="rounded-3xl bg-white/14 p-4 backdrop-blur">
			<p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-50/75">Done</p>
			<p class="mt-2 text-2xl font-bold">{summary.completed}</p>
		</div>
		<div class="rounded-3xl bg-white/14 p-4 backdrop-blur">
			<p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-50/75">Total</p>
			<p class="mt-2 text-2xl font-bold">{summary.total}</p>
		</div>
		<div class="rounded-3xl bg-white/14 p-4 backdrop-blur">
			<p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-50/75">Rate</p>
			<p class="mt-2 text-2xl font-bold">{summary.percentage}%</p>
		</div>
	</div>
</section>
