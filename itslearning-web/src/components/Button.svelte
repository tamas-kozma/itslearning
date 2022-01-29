<script lang="ts">
  import { Button } from 'svelte-materialify';

  let klass = '';
  export { klass as class };
</script>

<Button {...$$restProps} class="{klass} focus-visible:outline focus-visible:outline-offset-1 focus-visible:outline-2 outline-black dark:outline-white">
  <slot/>
</Button>

<style>
</style>