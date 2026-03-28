<script lang="ts">
	const iconMap = {
		today: 'calendar_month',
		habits: 'checklist',
		stats: 'bar_chart',
		settings: 'settings'
	} as const;

	type NavIconName = keyof typeof iconMap;

	export let name: NavIconName;
</script>

<span class="material-symbols-rounded select-none">{iconMap[name]}</span>
