<script lang="ts">
	type SummaryCard = {
		label: string;
		value: string;
		note?: string;
	};

	export let cards: SummaryCard[] = [];
</script>

<section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
	{#each cards as card}
		<div class="stats-glass rounded-[1.75rem] p-4">
			<p class="text-sm font-semibold text-slate-500 dark:text-slate-400">{card.label}</p>
			<p class="mt-3 break-words text-3xl font-extrabold leading-tight">{card.value}</p>
			{#if card.note}
				<p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{card.note}</p>
			{/if}
		</div>
	{/each}
</section>
