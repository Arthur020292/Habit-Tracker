<script lang="ts">
	type SummaryCard = {
		label: string;
		value: string;
		note?: string;
	};

	export let cards: SummaryCard[] = [];
</script>

{#if cards.length === 2}
	<section class="stats-glass rounded-[1.75rem] p-2 sm:p-3">
		<div class="grid grid-cols-2 divide-x divide-[rgba(116,146,128,0.16)] dark:divide-[rgba(148,163,184,0.16)]">
			{#each cards as card}
				<div class="px-3 py-2 sm:px-4 sm:py-3">
					<p class="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
						{card.label}
					</p>
					<p class="mt-1 break-words text-[1.05rem] font-extrabold leading-tight sm:text-[1.2rem]">
						{card.value}
					</p>
					{#if card.note}
						<p class="mt-1 hidden text-[0.7rem] leading-4 text-slate-500 dark:text-slate-400 md:block">
							{card.note}
						</p>
					{/if}
				</div>
			{/each}
		</div>
	</section>
{:else}
	<section class={`grid gap-2 ${cards.length === 2 ? 'grid-cols-2' : 'grid-cols-2 xl:grid-cols-4'}`}>
		{#each cards as card}
			<div class="stats-glass rounded-[1.25rem] p-3">
				<div class="flex items-start justify-between gap-2">
					<p class="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
						{card.label}
					</p>
					<div class="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]/70"></div>
				</div>
				<p class="mt-1 break-words text-[1.05rem] font-extrabold leading-tight sm:text-[1.25rem]">
					{card.value}
				</p>
				{#if card.note}
					<p class="mt-1 hidden text-[0.7rem] leading-4 text-slate-500 dark:text-slate-400 md:block">{card.note}</p>
				{/if}
			</div>
		{/each}
	</section>
{/if}
