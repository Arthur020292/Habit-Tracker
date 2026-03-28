<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let open = false;
	export let title = 'Confirm action';
	export let message = 'Are you sure you want to continue?';
	export let confirmLabel = 'Confirm';

	const dispatch = createEventDispatcher<{
		confirm: void;
		cancel: void;
	}>();

	function cancel() {
		dispatch('cancel');
	}

	function confirm() {
		dispatch('confirm');
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/28 px-3 py-3 backdrop-blur-md sm:items-center"
		style="padding-bottom: calc(6rem + env(safe-area-inset-bottom));"
	>
		<div
			class="glass-card w-full max-w-md rounded-[2rem] border border-white/55 bg-white/60 p-5 shadow-[0_28px_70px_-28px_rgba(15,23,42,0.42)] animate-pop dark:border-white/10 dark:bg-slate-950/55"
			role="dialog"
			aria-modal="true"
		>
			<h2 class="text-2xl font-extrabold">{title}</h2>
			<p class="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{message}</p>

			<div class="mt-6 flex gap-3">
				<button
					type="button"
					class="tap-target flex-1 rounded-3xl bg-slate-100 px-4 py-3 font-semibold text-slate-600 transition hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
					on:click={cancel}
				>
					Cancel
				</button>
				<button
					type="button"
					class="tap-target flex-1 rounded-3xl bg-rose-600 px-4 py-3 font-semibold text-white shadow-lg shadow-rose-200/60 transition hover:bg-rose-700"
					on:click={confirm}
				>
					{confirmLabel}
				</button>
			</div>
		</div>
	</div>
{/if}
