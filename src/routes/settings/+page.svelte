<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { habits } from '$lib/stores/habits';
	import { settings } from '$lib/stores/settings';
	import { theme } from '$lib/stores/theme';
	import {
		MAX_BACKUP_FILE_BYTES,
		createHabitsBackup,
		downloadJsonFile,
		parseHabitsBackup
	} from '$lib/utils/backup';
	import { todayKey } from '$lib/utils/date';
	import {
		hasPersistentStorageSupport,
		isPersistentStorageEnabled,
		requestPersistentStorage
	} from '$lib/utils/storage';
	import type { Habit } from '$lib/types';

	let importInput: HTMLInputElement | null = null;
	let dialogMode: 'import' | 'reset' | null = null;
	let pendingImport: Habit[] | null = null;
	let feedback: { tone: 'success' | 'error'; text: string } | null = null;
	let storageProtectionSupported = false;
	let storageProtectionEnabled = false;
	let storageProtectionLoading = false;

	const weekStartOptions = [
		{ value: 0, label: 'Sunday' },
		{ value: 1, label: 'Monday' }
	] as const;

	const reminderCadenceOptions = [
		{ value: 'daily', label: 'Daily' },
		{ value: 'weekdays', label: 'Weekdays' }
	] as const;

	$: dialogTitle = dialogMode === 'reset' ? 'Clear all data?' : 'Restore backup?';
	$: dialogMessage =
		dialogMode === 'reset'
			? 'This will clear your habits, theme choice, reminder settings, and week-start preference on this device.'
			: 'Restoring will replace the current habits with the backup file you selected.';
	$: dialogConfirmLabel = dialogMode === 'reset' ? 'Clear' : 'Restore';

	function setFeedback(tone: 'success' | 'error', text: string) {
		feedback = { tone, text };
	}

	function clearFeedback() {
		feedback = null;
	}

	async function refreshStorageProtectionStatus() {
		storageProtectionSupported = hasPersistentStorageSupport();
		storageProtectionEnabled = await isPersistentStorageEnabled();
	}

	async function protectThisDevice() {
		clearFeedback();
		storageProtectionLoading = true;
		storageProtectionSupported = hasPersistentStorageSupport();
		storageProtectionEnabled = await requestPersistentStorage();
		storageProtectionLoading = false;

		if (storageProtectionEnabled) {
			setFeedback('success', 'Your browser is now trying to keep HabitMate data on this device.');
		} else if (storageProtectionSupported) {
			setFeedback('error', 'The browser did not grant persistent storage on this device.');
		} else {
			setFeedback('error', 'Your browser does not support persistent storage.');
		}
	}

	function exportHabits() {
		const filename = `habitmate-backup-${todayKey(new Date())}.json`;
		downloadJsonFile(filename, createHabitsBackup($habits));
		setFeedback('success', 'Backup downloaded.');
	}

	function triggerImport() {
		importInput?.click();
	}

	async function handleImportFile(event: Event) {
		clearFeedback();

		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];

		if (!file) {
			return;
		}

		if (file.size > MAX_BACKUP_FILE_BYTES) {
			input.value = '';
			setFeedback('error', 'That backup file is too large to import on this device.');
			return;
		}

		const text = await file.text();
		const importedHabits = parseHabitsBackup(text);
		input.value = '';

		if (!importedHabits) {
			setFeedback('error', 'That file does not look like a valid backup.');
			return;
		}

		if ($habits.length > 0) {
			pendingImport = importedHabits;
			dialogMode = 'import';
			return;
		}

		habits.replaceAll(importedHabits);
		setFeedback('success', `Restored ${importedHabits.length} habit${importedHabits.length === 1 ? '' : 's'} from backup.`);
	}

	function confirmDialog() {
		if (dialogMode === 'reset') {
			habits.clear();
			settings.reset();
			theme.clear();
			setFeedback('success', 'All app data has been cleared.');
		} else if (pendingImport) {
			habits.replaceAll(pendingImport);
			setFeedback('success', `Restored ${pendingImport.length} habit${pendingImport.length === 1 ? '' : 's'} from backup.`);
		}

		dialogMode = null;
		pendingImport = null;
	}

	function cancelDialog() {
		dialogMode = null;
		pendingImport = null;
	}

	onMount(() => {
		void refreshStorageProtectionStatus();
	});
</script>

<svelte:head>
	<title>HabitMate Settings</title>
	<meta name="description" content="Theme, week start, reminders, and local data controls for HabitMate." />
</svelte:head>

<section class="space-y-4">
	<div class="flex items-end justify-between gap-4">
		<div>
			<p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
				Preferences
			</p>
			<h1 class="mt-1 text-3xl font-extrabold">Settings</h1>
			<p class="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
				Customize the app appearance, the weekly view, and your local backup options.
			</p>
		</div>
		<a
			href="/"
			class="settings-control hidden rounded-full px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 md:inline-flex"
		>
			Back to Today
		</a>
	</div>

	{#if feedback}
		<div
			class={`settings-glass rounded-[1.5rem] px-4 py-3 text-sm font-semibold ${
				feedback.tone === 'success'
					? 'border-emerald-200/70 text-emerald-800 dark:border-emerald-500/20 dark:text-emerald-100'
					: 'border-rose-200/70 text-rose-700 dark:border-rose-500/20 dark:text-rose-100'
			}`}
		>
			{feedback.text}
		</div>
	{/if}

	<div class="settings-glass rounded-[1.75rem] p-5 space-y-4">
		<div>
			<p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
				Appearance
			</p>
			<h2 class="mt-2 text-xl font-extrabold">Theme</h2>
			<p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
				Switch between light and dark mode whenever you want.
			</p>
		</div>
		<ThemeToggle />
	</div>

	<div class="settings-glass rounded-[1.75rem] p-5 space-y-4">
		<div>
			<p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
				Weekly view
			</p>
			<h2 class="mt-2 text-xl font-extrabold">Week start</h2>
			<p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
				This changes the order of the weekly progress chart on Stats.
			</p>
		</div>

		<div class="grid grid-cols-2 gap-3">
			{#each weekStartOptions as option}
				<button
					type="button"
					class={`choice-pill tap-target rounded-3xl px-4 py-3 text-sm font-semibold ${
						$settings.weekStart === option.value
							? 'choice-pill-active'
							: 'text-slate-600 dark:text-slate-300'
					}`}
					on:click={() => settings.setWeekStart(option.value)}
				>
					{option.label}
				</button>
			{/each}
		</div>
	</div>

	<div class="settings-glass rounded-[1.75rem] p-5 space-y-4">
		<div class="flex items-start justify-between gap-4">
			<div>
				<p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
					Device data
				</p>
				<h2 class="mt-2 text-xl font-extrabold">Keep data on this device</h2>
				<p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
					HabitMate stores everything locally. Asking the browser for persistent storage can help
					prevent automatic cleanup on this device.
				</p>
			</div>
			<div class="flex shrink-0 items-center gap-2">
				<span
					class={`rounded-full px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] ${
						storageProtectionEnabled
							? 'bg-[var(--brand-soft)] text-[var(--brand-strong)]'
							: 'bg-white/70 text-slate-500 dark:bg-slate-900/70 dark:text-slate-400'
					}`}
				>
					{storageProtectionEnabled ? 'Protected' : 'Local only'}
				</span>
			</div>
		</div>

		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<p class="text-sm leading-6 text-slate-500 dark:text-slate-400">
				{#if storageProtectionEnabled}
					This browser has persistent storage enabled for HabitMate.
				{:else if storageProtectionSupported}
					You can ask the browser to keep this app’s data around longer.
				{:else}
					This browser does not support persistent storage, so backups matter even more.
				{/if}
			</p>
			<button
				type="button"
				class="settings-control tap-target rounded-3xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:brightness-105 dark:text-slate-300 sm:w-auto"
				on:click={protectThisDevice}
				disabled={storageProtectionLoading || storageProtectionEnabled || !storageProtectionSupported}
			>
				{#if storageProtectionLoading}
					Checking...
				{:else if storageProtectionEnabled}
					Protected
				{:else}
					Protect this device
				{/if}
			</button>
		</div>
	</div>

	<div class="settings-glass rounded-[1.75rem] p-5 space-y-4">
		<div class="flex items-start justify-between gap-4">
			<div>
				<p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
					Reminders
				</p>
				<h2 class="mt-2 text-xl font-extrabold">Reminder preferences</h2>
			<p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
				These values are saved locally for now, so you can shape reminders before notifications are built.
			</p>
		</div>
			<button
				type="button"
				class={`settings-control tap-target rounded-full px-4 py-2 text-sm font-semibold transition ${
					$settings.reminders.enabled
						? 'settings-control-active'
						: 'text-slate-600 dark:text-slate-300'
				}`}
				aria-pressed={$settings.reminders.enabled}
				on:click={() => settings.setReminderEnabled(!$settings.reminders.enabled)}
			>
				{$settings.reminders.enabled ? 'Enabled' : 'Disabled'}
			</button>
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			<label class="block">
				<span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Time</span>
				<input
					type="time"
					class="settings-input tap-target w-full rounded-3xl px-4 py-3 text-base outline-none transition focus:border-[var(--brand)]"
					value={$settings.reminders.time}
					on:input={(event) => settings.setReminderTime((event.currentTarget as HTMLInputElement).value)}
				/>
			</label>

			<div class="block">
				<span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Cadence</span>
				<div class="grid grid-cols-2 gap-2">
					{#each reminderCadenceOptions as option}
						<button
							type="button"
							class={`choice-pill tap-target rounded-3xl px-4 py-3 text-sm font-semibold ${
								$settings.reminders.cadence === option.value
									? 'choice-pill-active'
									: 'text-slate-600 dark:text-slate-300'
							}`}
							on:click={() => settings.setReminderCadence(option.value)}
						>
							{option.label}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<div class="panel rounded-[1.75rem] p-5 space-y-4">
		<div>
			<p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
				Data
			</p>
			<h2 class="mt-2 text-xl font-extrabold">Backup and reset</h2>
			<p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
				Download a backup to keep a copy, restore it later, or clear everything from this device.
			</p>
		</div>

		<div class="grid gap-3 sm:grid-cols-3">
			<button
				type="button"
				class="settings-control settings-control-active tap-target rounded-3xl px-4 py-3 font-semibold transition hover:brightness-105"
				on:click={exportHabits}
			>
				Download backup
			</button>
			<button
				type="button"
				class="settings-control tap-target rounded-3xl px-4 py-3 font-semibold text-slate-600 dark:text-slate-300"
				on:click={triggerImport}
			>
				Restore backup
			</button>
			<button
				type="button"
				class="settings-control tap-target rounded-3xl px-4 py-3 font-semibold text-rose-600 dark:text-rose-300"
				on:click={() => {
					pendingImport = null;
					dialogMode = 'reset';
				}}
			>
				Clear all data
			</button>
		</div>

		<input
			bind:this={importInput}
			type="file"
			accept="application/json"
			class="hidden"
			on:change={handleImportFile}
		/>
	</div>
</section>

<ConfirmDialog
	open={dialogMode !== null}
	title={dialogTitle}
	message={dialogMessage}
	confirmLabel={dialogConfirmLabel}
	on:confirm={confirmDialog}
	on:cancel={cancelDialog}
/>
