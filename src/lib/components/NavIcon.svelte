<script lang="ts">
	type NavIconName = 'today' | 'habits' | 'stats' | 'settings';

	export let name: NavIconName;
</script>

{#if name === 'today'}
	<svg
		viewBox="0 0 24 24"
		class="h-6 w-6 select-none"
		fill="none"
		stroke="currentColor"
		stroke-width="1.8"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<rect x="4" y="5" width="16" height="15" rx="3" />
		<path d="M8 3v4" />
		<path d="M16 3v4" />
		<path d="M4 9h16" />
		<path d="M8 13h4" />
	</svg>
{:else if name === 'habits'}
	<svg
		viewBox="0 0 24 24"
		class="h-6 w-6 select-none"
		fill="none"
		stroke="currentColor"
		stroke-width="1.8"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<path d="M5 7h4" />
		<path d="M11 7h8" />
		<path d="M5 12h4" />
		<path d="M11 12h8" />
		<path d="M5 17h4" />
		<path d="M11 17h8" />
		<path d="m5.8 6.4.9.9 1.7-1.7" />
		<path d="m5.8 16.4.9.9 1.7-1.7" />
	</svg>
{:else if name === 'stats'}
	<svg
		viewBox="0 0 24 24"
		class="h-6 w-6 select-none"
		fill="none"
		stroke="currentColor"
		stroke-width="1.8"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<path d="M5 19h14" />
		<rect x="6" y="11" width="2.8" height="5" rx="1.1" />
		<rect x="10.6" y="8" width="2.8" height="8" rx="1.1" />
		<rect x="15.2" y="5" width="2.8" height="11" rx="1.1" />
		<path d="M6 13.5c1.6-1.1 2.8-1.8 4.1-1.8 1.3 0 2.4.6 3.5 1.3 1.2.7 2.4 1.4 4.4 1.2" />
	</svg>
{:else}
	<svg
		viewBox="0 0 24 24"
		class="h-6 w-6 select-none"
		fill="none"
		stroke="currentColor"
		stroke-width="1.8"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<circle cx="12" cy="12" r="3.2" />
		<path d="M19.4 15a7.9 7.9 0 0 0 0-6" />
		<path d="M4.6 9a7.9 7.9 0 0 0 0 6" />
		<path d="M15 4.6a7.9 7.9 0 0 0-6 0" />
		<path d="M9 19.4a7.9 7.9 0 0 0 6 0" />
		<path d="M16.8 7.2 18.4 5.6" />
		<path d="M5.6 18.4 7.2 16.8" />
		<path d="M16.8 16.8 18.4 18.4" />
		<path d="M5.6 5.6 7.2 7.2" />
	</svg>
{/if}
