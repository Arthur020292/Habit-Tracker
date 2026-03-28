<script lang="ts">
	import { icons as materialSymbols } from '@iconify-json/material-symbols';

	const iconMap = {
		today: 'calendar-month',
		habits: 'checklist',
		stats: 'bar-chart',
		settings: 'settings'
	} as const;

	type NavIconName = keyof typeof iconMap;

	export let name: NavIconName;

	$: icon = materialSymbols.icons[iconMap[name]];
</script>

<svg
	class="block h-6 w-6 shrink-0 select-none"
	viewBox="0 0 24 24"
	fill="none"
	aria-hidden="true"
	xmlns="http://www.w3.org/2000/svg"
>
	{@html icon.body}
</svg>
