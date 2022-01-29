<script lang="ts">
	import { MaterialApp, Button } from 'svelte-materialify';
	import PlanList from "./components/PlanList.svelte";

	localStorage.theme = 'light';
	//localStorage.theme = 'dark';
	//localStorage.removeItem('theme');

	// On page load or when changing themes, best to add inline in `head` to avoid FOUC
	if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
		document.documentElement.classList.add('dark')
	} else {
  	document.documentElement.classList.remove('dark')
	}
</script>

<MaterialApp>
	<div class="w-full md:w-[768px] bg-neutral-50 dark:bg-neutral-700 h-screen mx-auto px-8 py-2">
		<PlanList></PlanList>
	</div>
</MaterialApp>

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
</style>
