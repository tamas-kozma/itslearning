<script lang="ts">
  export let selectedItem = null;
  export let selectedIndex: number = 0;
  export let items = [];
  let klass = '';
  export { klass as class };

  const buttonClasses = "cursor-default flex-auto px-2 py-2 h-10 relative hover:bg-neutral-200 dark:hover:bg-neutral-600";
  const selectedButtonClasses = "after:bg-black dark:after:bg-neutral-200 after:absolute after:left-0 after:top-0 after:h-full after:w-[2px] sm:after:top-[calc(100%-1px)] sm:after:w-full sm:after:h-[2px]";

  $: selectedItem = (items != null && selectedIndex >= 0 && selectedIndex < items.length) ? items[selectedIndex] : null;
  function onButtonClick(item: any, i: number): void {
    selectedItem = item;
    selectedIndex = i;
  }
</script>

<div class="{klass} flex flex-col sm:flex-row">
  {#each items as item, i}
    <div
      class="{buttonClasses} {i === selectedIndex ? selectedButtonClasses : ""}"
      on:click={() => onButtonClick(item, i)}
    >{item.text}</div>
  {/each}
</div>

<style>
</style>