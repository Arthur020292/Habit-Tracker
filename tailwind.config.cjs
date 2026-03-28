/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			boxShadow: {
				glow: '0 20px 60px -20px rgba(74, 124, 89, 0.28)'
			},
			keyframes: {
				pop: {
					'0%': { transform: 'scale(0.98)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				}
			},
			animation: {
				pop: 'pop 180ms ease-out'
			}
		}
	},
	plugins: []
};
