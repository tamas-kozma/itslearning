<script lang="ts">
  import type { Plan } from "../models/Plan";
  import { Chip } from 'svelte-materialify';
  import { createEventDispatcher } from 'svelte';

  export let planList: Plan[] = [];
  export let selectedPlanList: Plan[] = [];
  export let tagColorIndexMap: Map<string, number> = null;

  const dispatch = createEventDispatcher();

  function formatDate(isoDateString: string): string {
    let milliseconds = Date.parse(isoDateString);
    return new Date(milliseconds).toDateString();
  }

  function planPeriodToString(plan: any): string {
    if (plan?.availableFrom != null) {
      return formatDate(plan.availableFrom) + " - " + formatDate(plan.availableTo);
    } else {
      return "Always available";
    }
  }
</script>

<!-- Plan cards -->
<div class="mb-4">
  {#each planList as plan, i}
    <div class="flex flex-col sm:flex-row w-full bg-background-highlight dark:bg-background-highlight-dark p-4 mb-4 max-h-76 sm:max-h-56">
      <div class="h-24 w-auto sm:h-auto sm:w-1/4 flex flex-row">
        <div class="w-6 mr-2">
          <input class="w-4 h-4" type="checkbox" bind:group={selectedPlanList} value="{plan.id}" />
        </div>
        <div class="sm:mr-4">
          <img  class="rounded-md max-h-full" src="{plan.thumbnail}" alt="Illustration for the topic '{plan.title}'." />
        </div>  
      </div>
      <div class="w-3/4 overflow-hidden">
        <h2 class="card-title">
          <span>{plan.title}</span>
          {#each plan.tags as tag, j}
            <Chip 
              label 
              size="x-small"
              class="text-xs text-black uppercase tag-color-{tagColorIndexMap.get(tag)}"
              on:click={() => dispatch('tagClicked', tag)}
            >{tag}</Chip>
          {/each}
        </h2>
        <span class="line-clamp-4 mb-2">{plan.summary}</span>
        <span>
          <span class="material-icons text-base">calendar_today</span>
          <span>{planPeriodToString(plan)}</span>
        </span>
      </div>
    </div>
  {/each}
</div>

<style>
</style>