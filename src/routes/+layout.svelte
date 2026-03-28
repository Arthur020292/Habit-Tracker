<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import { habits } from '$lib/stores/habits';
	import { storageNotice } from '$lib/stores/storageNotice';
	import { settings } from '$lib/stores/settings';
	import { ui } from '$lib/stores/ui';
	import { theme } from '$lib/stores/theme';
	import { requestPersistentStorage } from '$lib/utils/storage';

	onMount(() => {
		theme.init();
		habits.init();
		settings.init();
		void requestPersistentStorage();
	});
</script>

<svelte:head>
	<meta name="theme-color" content={$theme === 'dark' ? '#07110b' : '#f4f7f2'} />
</svelte:head>

<div class="app-shell min-h-screen">
	<div class="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-28 pt-2 sm:px-6 lg:px-8">
		{#if $storageNotice}
			<div class="mx-auto w-full max-w-2xl pb-3">
				<div
					class={`flex items-start justify-between gap-3 rounded-[1.5rem] border px-4 py-3 text-sm shadow-[0_20px_45px_-30px_rgba(15,23,42,0.45)] ${
						$storageNotice.tone === 'error'
							? 'settings-glass border-rose-200/70 text-rose-700 dark:border-rose-500/20 dark:text-rose-100'
							: 'settings-glass border-emerald-200/70 text-emerald-800 dark:border-emerald-500/20 dark:text-emerald-100'
					}`}
					role="status"
					aria-live="polite"
				>
					<p class="leading-6">{ $storageNotice.message }</p>
					<button
						type="button"
						class="tap-target rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 transition hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
						on:click={storageNotice.clear}
						aria-label="Dismiss storage notice"
					>
						Dismiss
					</button>
				</div>
			</div>
		{/if}
		<main class="flex-1 py-4 sm:py-5">
			<div class="mx-auto w-full max-w-2xl">
				<slot />
			</div>
		</main>
	</div>

	{#if !$ui.overlayOpen}
		<BottomNav />
	{/if}
</div>
