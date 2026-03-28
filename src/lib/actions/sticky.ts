type StickyOptions = {
	offset?: number;
	onChange?: (stuck: boolean) => void;
};

export function stickyState(node: HTMLElement, options: StickyOptions = {}) {
	let offset = options.offset ?? 12;
	let onChange = options.onChange;
	let raf = 0;
	const mediaQuery = window.matchMedia('(max-width: 767px)');

	function emit() {
		const mobile = mediaQuery.matches;
		const stuck = mobile && node.getBoundingClientRect().top <= offset + 1;
		onChange?.(stuck);
	}

	function schedule() {
		cancelAnimationFrame(raf);
		raf = requestAnimationFrame(emit);
	}

	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule);
	mediaQuery.addEventListener('change', schedule);
	schedule();

	return {
		update(nextOptions: StickyOptions = {}) {
			offset = nextOptions.offset ?? offset;
			onChange = nextOptions.onChange ?? onChange;
			schedule();
		},
		destroy() {
			cancelAnimationFrame(raf);
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
			mediaQuery.removeEventListener('change', schedule);
		}
	};
}
