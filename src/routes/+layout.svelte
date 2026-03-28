<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import { habits } from '$lib/stores/habits';
	import { settings } from '$lib/stores/settings';
	import { ui } from '$lib/stores/ui';
	import { theme } from '$lib/stores/theme';

	onMount(() => {
		theme.init();
		habits.init();
		settings.init();
	});
</script>

<svelte:head>
	<meta name="theme-color" content={$theme === 'dark' ? '#07110b' : '#f4f7f2'} />
</svelte:head>

<div class="app-shell min-h-screen">
	<div class="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-28 pt-2 sm:px-6 lg:px-8">
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
