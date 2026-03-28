<script lang="ts">
	import { onDestroy } from 'svelte';
	import AddHabitModal from '$lib/components/AddHabitModal.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import HabitManageList from '$lib/components/HabitManageList.svelte';
	import { habits } from '$lib/stores/habits';
	import { ui } from '$lib/stores/ui';
	import type { Habit, HabitFormValues } from '$lib/types';

	let addOpen = false;
	let editingHabit: Habit | null = null;
	let deleteHabit: Habit | null = null;

	$: ui.setOverlayOpen(addOpen || deleteHabit !== null);

	function openAddHabit() {
		editingHabit = null;
		addOpen = true;
	}

	function openEditHabit(habit: Habit) {
		editingHabit = habit;
		addOpen = true;
	}

	function closeHabitModal() {
		addOpen = false;
		editingHabit = null;
	}

	function saveHabit(values: HabitFormValues) {
		if (editingHabit) {
			habits.updateHabit(editingHabit.id, values);
		} else {
			habits.add(values);
		}
		closeHabitModal();
	}

	function requestDeleteFromModal() {
		deleteHabit = editingHabit;
	}

	function confirmDelete() {
		const target = deleteHabit;

		if (target) {
			if (editingHabit?.id === target.id) {
				closeHabitModal();
			}

			habits.deleteHabit(target.id);
		}

		deleteHabit = null;
	}

	function cancelDelete() {
		deleteHabit = null;
	}

	onDestroy(() => {
		ui.setOverlayOpen(false);
	});
</script>

<svelte:head>
	<title>Manage Habits</title>
	<meta
		name="description"
		content="Create, edit, and delete habits in one dedicated place."
	/>
</svelte:head>

<section class="space-y-4">
	<div class="flex items-end justify-between gap-4">
		<div>
			<p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
				Habits
			</p>
			<h1 class="mt-1 text-3xl font-extrabold">Manage habits</h1>
		</div>
		<button
			type="button"
			class="rounded-full bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-[var(--brand-contrast)] shadow-lg shadow-emerald-200/60 transition hover:bg-[var(--brand-strong)]"
			on:click={openAddHabit}
		>
			Add habit
		</button>
	</div>

	<HabitManageList
		habits={$habits}
		on:edit={(event) => openEditHabit(event.detail.habit)}
	/>
</section>

<AddHabitModal
	open={addOpen}
	mode={editingHabit ? 'edit' : 'add'}
	habit={editingHabit}
	on:save={(event) => saveHabit(event.detail)}
	on:close={closeHabitModal}
	on:delete={requestDeleteFromModal}
/>

<ConfirmDialog
	open={deleteHabit !== null}
	title="Delete habit?"
	message={`This will remove "${deleteHabit?.name ?? 'this habit'}" and its completion history.`}
	confirmLabel="Delete"
	on:confirm={confirmDelete}
	on:cancel={cancelDelete}
/>
