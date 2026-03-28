<script lang="ts">
	import { theme } from '$lib/stores/theme';

	const toggle = () => theme.toggle();
</script>

<button
	type="button"
	class="soft-button tap-target inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
	on:click={toggle}
	aria-label="Toggle color theme"
	aria-pressed={$theme === 'dark'}
>
	<span class="text-base">{ $theme === 'dark' ? '☀️' : '🌙' }</span>
	<span class="hidden sm:inline">{ $theme === 'dark' ? 'Light mode' : 'Dark mode' }</span>
</button>
