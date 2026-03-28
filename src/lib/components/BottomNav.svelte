<script lang="ts">
	import { page } from '$app/stores';
	import NavIcon from '$lib/components/NavIcon.svelte';

	type NavIconName = 'today' | 'habits' | 'stats' | 'settings';

	type NavItem = {
		href: string;
		label: string;
		icon: NavIconName;
	};

	const navItems: NavItem[] = [
		{ href: '/', label: 'Today', icon: 'today' },
		{ href: '/habits', label: 'Habits', icon: 'habits' },
		{ href: '/stats', label: 'Stats', icon: 'stats' },
		{ href: '/settings', label: 'Settings', icon: 'settings' }
	];

	let currentPath = '/';

	function normalizePath(pathname: string): string {
		return pathname.replace(/\/$/, '') || '/';
	}

	$: currentPath = normalizePath($page.url.pathname);
</script>

<nav
	class="fixed inset-x-0 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 pointer-events-none md:hidden"
	aria-label="Primary"
>
	<div class="mx-auto w-fit max-w-[calc(100vw-2rem)] px-4">
		<div class="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/45 p-2 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/35">
			{#each navItems as item}
				{@const active = currentPath === item.href}
				<a
					href={item.href}
					class={`tap-target inline-flex h-12 shrink-0 items-center overflow-hidden rounded-full text-sm font-semibold transition-[width,padding,background-color,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
						active
							? 'bg-[var(--brand)] text-[var(--brand-contrast)] shadow-[0_12px_28px_-14px_rgba(79,143,108,0.7)]'
							: 'bg-white text-slate-900 shadow-[0_12px_24px_-16px_rgba(15,23,42,0.55)] hover:scale-[1.03]'
					}`}
					style={`width: ${active ? 'auto' : '3rem'}; padding: ${active ? '0.625rem 0.875rem 0.625rem 0.75rem' : '0'}; justify-content: ${active ? 'flex-start' : 'center'};`}
					aria-current={active ? 'page' : undefined}
					aria-label={item.label}
				>
					<span class={`grid shrink-0 place-items-center ${active ? 'h-6 w-6' : 'h-12 w-12'}`}>
						<NavIcon name={item.icon} />
					</span>
					<span
						class={`min-w-0 whitespace-nowrap overflow-hidden transition-[max-width,opacity,transform,margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
							active
								? 'max-w-32 opacity-100 translate-x-0 ml-1 mr-0.5'
								: 'max-w-0 opacity-0 -translate-x-1'
						}`}
					>
						{item.label}
					</span>
				</a>
			{/each}
		</div>
	</div>
</nav>
