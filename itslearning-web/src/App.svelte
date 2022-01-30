<script lang="ts">
	import { MaterialAppMin } from 'svelte-materialify';
	import PlansPage from "./components/PlansPage.svelte";

	//localStorage.theme = 'light';
  localStorage.theme = 'dark';
	//localStorage.removeItem('theme'); 

	let theme = localStorage.theme;

	// On page load or when changing themes, best to add inline in `head` to avoid FOUC
	if (theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
		document.documentElement.classList.add('dark')
	} else {
  	document.documentElement.classList.remove('dark')
	}
</script>

<main>
	<MaterialAppMin {theme}>
		<div class="w-full md:w-[768px] bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark min-h-screen mx-auto px-8 py-2">
			<PlansPage></PlansPage>
		</div>
	</MaterialAppMin>
</main>

<style global lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;

	@layer base {
		.page-title {
			@apply font-bold text-xl;
		}

		.card-title {
			@apply font-bold text-lg;
		}
	}

	.tag-color-0 {
		background-color: #FEEBBB !important;
	}
	.tag-color-1 {
		background-color: #C4ECFF !important;
	}
	.tag-color-2 {
		background-color: #C0E8DC !important;
	}
	.tag-color-3 {
		background-color: #F6C8C5 !important;
	}
</style>
