<script lang="ts">
	import { DEFAULT_HABIT_FORM, HIGHLIGHT_COLORS, ICON_CHOICES, WEEKDAY_LABELS } from '$lib/constants';
	import type { Habit, HabitFormValues, Weekday } from '$lib/types';
	import { normalizeCustomDays } from '$lib/utils/habits';
	import { createEventDispatcher } from 'svelte';

	export let open = false;
	export let mode: 'add' | 'edit' = 'add';
	export let habit: Habit | null = null;

	const dispatch = createEventDispatcher<{
		save: HabitFormValues;
		close: void;
		delete: void;
	}>();

	let name = DEFAULT_HABIT_FORM.name;
	let color = DEFAULT_HABIT_FORM.color;
	let icon = DEFAULT_HABIT_FORM.icon;
	let time = DEFAULT_HABIT_FORM.time;
	let frequencyType: HabitFormValues['frequency']['type'] = 'daily';
	let customDays: Weekday[] = [];
	let error = '';

	$: if (open) {
		name = habit?.name ?? DEFAULT_HABIT_FORM.name;
		color = habit?.color ?? DEFAULT_HABIT_FORM.color;
		icon = habit?.icon ?? DEFAULT_HABIT_FORM.icon;
		time = habit?.time ?? DEFAULT_HABIT_FORM.time;
		frequencyType = habit?.frequency.type ?? 'daily';
		customDays = habit?.frequency.type === 'custom' ? habit.frequency.days : [];
		error = '';
	}

	function closeModal() {
		dispatch('close');
	}

	function handleDelete() {
		dispatch('delete');
	}

	function toggleDay(day: Weekday) {
		customDays = customDays.includes(day)
			? customDays.filter((value) => value !== day)
			: [...customDays, day];
	}

	function handleSubmit() {
		const trimmed = name.trim();

		if (!trimmed) {
			error = 'Please add a habit name.';
			return;
		}

		if (frequencyType === 'custom' && customDays.length === 0) {
			error = 'Choose at least one day for a custom schedule.';
			return;
		}

		dispatch('save', {
			name: trimmed,
			color,
			icon: icon.trim() || '•',
			time,
			frequency:
				frequencyType === 'custom'
					? { type: 'custom', days: normalizeCustomDays(customDays) }
					: { type: frequencyType }
		});
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/28 px-3 py-3 backdrop-blur-md sm:items-center"
		style="padding-bottom: calc(6rem + env(safe-area-inset-bottom));"
	>
		<div
			class="glass-card w-full max-w-md rounded-[2rem] border border-white/55 bg-white/60 p-5 shadow-[0_28px_70px_-28px_rgba(15,23,42,0.42)] animate-pop max-h-[calc(100vh-8rem)] overflow-y-auto dark:border-white/10 dark:bg-slate-950/55 sm:max-h-[90vh]"
			role="dialog"
			aria-modal="true"
		>
			<div class="flex items-start justify-between gap-4">
				<div>
					<p class="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
						{mode === 'add' ? 'New Habit' : 'Edit Habit'}
					</p>
					<h2 class="mt-2 text-2xl font-extrabold">
						{mode === 'add' ? 'Build a better routine' : 'Refine this habit'}
					</h2>
				</div>
				<button
					type="button"
					class="tap-target rounded-full bg-slate-100 px-3 py-2 text-lg text-slate-600 transition hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
					on:click={closeModal}
				>
					×
				</button>
			</div>

			<div class="mt-5 space-y-4">
				<label class="block">
					<span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Habit name</span>
					<input
						bind:value={name}
						type="text"
						placeholder="Drink water, stretch, journal..."
						class="tap-target w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-base outline-none ring-0 transition placeholder:text-slate-400 focus:border-[var(--brand)] focus:outline-none dark:border-slate-700 dark:bg-slate-950"
					/>
				</label>

				<div class="grid gap-4 sm:grid-cols-2">
					<label class="block">
						<span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Time</span>
						<input
							bind:value={time}
							type="time"
							class="tap-target w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-[var(--brand)] dark:border-slate-700 dark:bg-slate-950"
						/>
					</label>

					<label class="block">
						<span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Icon</span>
						<select
							bind:value={icon}
							class="tap-target w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-[var(--brand)] dark:border-slate-700 dark:bg-slate-950"
						>
							{#each ICON_CHOICES as choice}
								<option value={choice}>{choice}</option>
							{/each}
						</select>
					</label>

					<label class="block">
						<span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Color</span>
						<div class="flex flex-wrap gap-2 rounded-3xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950">
							{#each HIGHLIGHT_COLORS as swatch}
								<button
									type="button"
									class={`tap-target h-9 w-9 rounded-full ring-offset-2 transition ${
										color === swatch ? 'ring-2 ring-[var(--brand)]' : 'ring-0'
									}`}
									style={`background:${swatch}`}
									aria-label={`Choose color ${swatch}`}
									on:click={() => (color = swatch)}
								></button>
							{/each}
						</div>
					</label>
				</div>

				<label class="block">
					<span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Frequency</span>
					<div class="grid grid-cols-3 gap-2">
						{#each ['daily', 'weekdays', 'custom'] as option}
							<button
								type="button"
								class={`tap-target rounded-3xl px-3 py-3 text-sm font-semibold capitalize transition ${
									frequencyType === option
										? 'bg-[var(--brand)] text-[var(--brand-contrast)] shadow-md'
										: 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300'
								}`}
								on:click={() => (frequencyType = option as HabitFormValues['frequency']['type'])}
							>
								{option}
							</button>
						{/each}
					</div>
				</label>

				{#if frequencyType === 'custom'}
					<div>
						<p class="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Select days</p>
						<div class="grid grid-cols-4 gap-2 sm:grid-cols-7">
							{#each WEEKDAY_LABELS as day}
								<button
									type="button"
									class={`tap-target rounded-3xl px-2 py-3 text-sm font-semibold transition ${
										customDays.includes(day.day)
											? 'bg-[var(--brand)] text-[var(--brand-contrast)]'
											: 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300'
									}`}
									on:click={() => toggleDay(day.day)}
								>
									{day.short}
								</button>
							{/each}
						</div>
					</div>
				{/if}

				{#if error}
					<p class="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:bg-rose-950/60 dark:text-rose-200">
						{error}
					</p>
				{/if}
			</div>

			<div class="mt-6 flex flex-col gap-3 sm:flex-row">
				{#if mode === 'edit'}
					<button
						type="button"
						class="tap-target rounded-3xl bg-rose-50 px-4 py-3 font-semibold text-rose-600 transition hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-200 dark:hover:bg-rose-950 sm:flex-1"
						on:click={handleDelete}
					>
						Delete
					</button>
				{/if}
				<button
					type="button"
					class="tap-target rounded-3xl bg-slate-100 px-4 py-3 font-semibold text-slate-600 transition hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 sm:flex-1"
					on:click={closeModal}
				>
					Cancel
				</button>
				<button
					type="button"
					class="tap-target rounded-3xl bg-[var(--brand)] px-4 py-3 font-semibold text-[var(--brand-contrast)] shadow-lg shadow-emerald-200/60 transition hover:bg-[var(--brand-strong)] sm:flex-1"
					on:click={handleSubmit}
				>
					{mode === 'add' ? 'Add habit' : 'Save changes'}
				</button>
			</div>
		</div>
	</div>
{/if}
