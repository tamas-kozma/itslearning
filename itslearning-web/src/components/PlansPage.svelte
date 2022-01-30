<script lang="ts">
  import { Menu, List, ListItem, Chip, ProgressCircular } from 'svelte-materialify';
  import Button from './Button.svelte';
  import ButtonGroup from "./ButtonGroup.svelte";
  import type { Plan } from "../models/Plan";
  import { addIfNotPresent } from "../CollectionUtils";
  import Fuse from 'fuse.js';
  import { onMount } from 'svelte';
  import { planListStore } from "../DataService";

  /**
   * The possible plan availability period filter options.
   */
  const dateFilterOptions = [
    { id: "current", text: "Current" },
    { id: "past", text: "Past" },
    { id: "withoutDate", text: "Without date" }
  ];

  let planList: Plan[] = null;
  let selectedDateFilterOption = dateFilterOptions[0];  
  let searchInput = "";
  let pastPlans: Plan[];
  let currentPlans: Plan[];
  let withoutDatePlans: Plan[];
  let plansToDisplay: Plan[] = [];
  let hasFilterExpression = false;
  let upcomingSeparatorIndex = -1;
  let selectedPlanList: Plan[] = [];
  
  /**
   * The number of different colors available for tags. Defined in App.svelte as classes "tag-color-<n>".
   * See also buildTagColorIndexMap().
   */
  const tagColorCount = 4;
  
  onMount(async () => {
    try {
      await planListStore.load();
    } catch {
      // TODO: Display the error properly.
      alert("Failed to fetch plans.");
    }
	});
  planListStore.subscribe(p => planList = p);

  $: tagSearchTermToTagMap = buildTagMap(planList);
  $: tagColorIndexMap = buildTagColorIndexMap(planList);
  $: planListSorted = sortPlansByDate(planList);
  $: filteredPlans = filterPlans(planListSorted, searchInput);
  $: makeTemporalPlanLists(filteredPlans);
  $: onDateFilterChanged(selectedDateFilterOption);
  $: isLoading = (planList == null);

  /**
   * Finds all the distinct tags assigned to plans and assigns a color index to each.
   * If there are more tags than colors defined then multiple tags can get the same index.
   * Returns a Map from tag to color index. This will be used to display tag chips in fancy colors.
   * @param planList The list of all plans.
   */
  function buildTagColorIndexMap(planList: Plan[]): Map<string, number> {
    if (planList == null) {
      return null;
    }

    let tagList = [ ...new Set(planList.flatMap(p => p.tags)) ];
    let map = new Map<string, number>();
    for (let i = 0; i < tagList.length; i++) {
      let tag = tagList[i];
      map.set(tag, i % tagColorCount);
    }
    return map;
  }

  /**
   * Resets plan selection and updates the list of plans to display according to the selected 
   * availability period filter.
   * @param selectedOption The currently selected filter option object.
   */
  function onDateFilterChanged(selectedOption: any) {
    if (planList == null) {
      return;
    }

    selectedPlanList = [];
    setPlansToDisplay();
  }

  /**
   * Based on the currently selected plan availability period filter, sets the list of plans to display.
   * See also makeTemporalPlanLists();
   */
  function setPlansToDisplay() {
    if (selectedDateFilterOption.id == "past") {
      plansToDisplay = pastPlans;
    } else if (selectedDateFilterOption.id == "withoutDate") {
      plansToDisplay = withoutDatePlans;
    } else {
      plansToDisplay = currentPlans;
      calculateListSeparatorIndex();
    }
  }

  /**
   * In the "Current" view, when no search term is entered, upcoming plans are separated with a line from
   * ones available now. This method calculates the position of that separator.
   */
  function calculateListSeparatorIndex() {
    upcomingSeparatorIndex = -1;
    
    if (hasFilterExpression) {
      // When searching, the plan list is not sorted by date, so the "upcoming plans" separator is not needed.
      return;
    }
    
    let now = new Date();
    for (let i = 0; i < plansToDisplay.length; i++) {
      let plan = plansToDisplay[i];
      let fromAsDate = toDate(plan.availableFrom);
      if (fromAsDate == null) {
        continue;
      }

      if (fromAsDate > now) {
        if (i == 0) {
          // We only have future plans, no separator.
          return;
        }
        
        upcomingSeparatorIndex = i;
      }
    }
  }

  /**
   * Populates the lists pastPlans, currentPlans and withoutDatePlans based on availability period.
   * @param planList Input plan list, which is either all plans, or ones matching the search text. The order is preserved.
   */
  function makeTemporalPlanLists(planList: Plan[]): void {
    if (planList == null) {
      return;
    }

    pastPlans = [];
    currentPlans = [];
    withoutDatePlans = [];

    let now = new Date();
    for (let plan of planList) {
      if (plan.availableFrom == null) {
        currentPlans.push(plan);
        withoutDatePlans.push(plan);
        continue;
      }

      let to = new Date(Date.parse(plan.availableTo));
      if (to < now) {
        pastPlans.push(plan);
      } else {
        currentPlans.push(plan);
      }
    }

    setPlansToDisplay();
  }

  /**
   * When searching for a tag, they need to be entered with a leading # and spaces replaced 
   * with dashes (OUR EARTH -> #OUR-EARTH). Here we build map from #-form to original tag.
   * @param planList The list of all plans.
   */
  function buildTagMap(planList: Plan[]): Map<string, string> {
    if (planList == null) {
      return null;
    }

    let tagMap = new Map<string, string>();
    let allTagsWithDuplicates = planList.flatMap(p => p.tags);
    let allTagsSet = new Set(allTagsWithDuplicates);
    allTagsSet.forEach(tag => {
      let tagSearchTerm = getSearchTermForTag(tag);
      tagMap.set(tagSearchTerm, tag);
    });

    return tagMap;
  }

  /**
   * Converts a tag to its search term form (OUR EARTH -> #OUR-EARTH).
   * @param tag The tag string to convert.
   */
  function getSearchTermForTag(tag: string): string {
    return "#" + tag.replaceAll(/\s/g, "-");
  }

  /**
   * Sorts a list of plans in place in ascending order by start of availability period. 
   * Always available plans (period start is null) come first.
   * @param planList The list of plans to sort.
   */
  function sortPlansByDate(planList: Plan[]): Plan[] {
    if (planList == null) {
      return null;
    }

    return planList.sort((left, right) => {
      if (left.availableFrom == null) {
        return (right.availableFrom == null) ? 0 : -1;
      }
      
      if (right.availableFrom == null) {
        return 1;
      }
      
      return Date.parse(left.availableFrom) - Date.parse(right.availableFrom);
    });
  }

  /**
   * Filters a list of plans based on a search text.
   * The search text can contain special terms specifying tags. Such tag terms start with the # character
   * and consist of the tag string, with whitespace replaced with dashes (ENERGY SOURCES -> #ENERGY-SOURCES).
   * If multiple such tags are specified then plan tagged with any of them (OR) are returned.
   * The rest of the search text is used to perform a fuzzy search in the title and summary of the plans.
   * @param planList The list of plans to filter.
   * @param searchInput The search text.
   */
  function filterPlans(planList: Plan[], searchInput: string): Plan[] {
    if (planList == null) {
      return null;
    }

    hasFilterExpression = searchInput != null && !searchInput.match(/^\s*$/g);
    if (!hasFilterExpression) {
      return planList;
    }

    let resultList: Plan[];

    if (searchInput.includes("#")) {
      // Iterating over all words in the search input, looking for tags (#SOME-TAG).
      // Multiple tags are interpreted with OR.
      resultList = [];
      let partList = searchInput.split(/\s/) as string[];
      let textSearchInput = "";
      for (let part of partList) {
        if (!part.startsWith("#")) {
          textSearchInput += part + " ";
          continue;
        }

        let tag = tagSearchTermToTagMap .get(part);
        if (!tag) {
          continue;
        }

        let taggedPlans = planList.filter(p => p.tags.some(t => t === tag));
        taggedPlans.forEach(p => addIfNotPresent(resultList, p));
      }

      resultList = sortPlansByDate(resultList);
      searchInput = textSearchInput;
    } else {
      resultList = planList;
    }

    // Doing a fuzzy search on the results so far, that is, either all plans, or the ones filtered by tags.
    // Results are ordered by relevance.
    if (!searchInput.match(/^\s*$/g)) {
      let fuse = new Fuse(resultList, {
        ignoreLocation: true,
        threshold: 0.3,
        keys: [
          "title",
          "summary"
        ]
      });

      let searchResults = fuse.search(searchInput);
      resultList = searchResults.map(r => r.item);
    }

    return resultList;
  }

  /**
   * Handles plan tag clicks, by entering the corresponding search tag into the search box.
   * @param tag The string tag value of the clicked tag chip.
   */
  function onTagClicked(tag: string) {
    searchInput = getSearchTermForTag(tag);
  }

  function toDate(dateString: string): Date | null {
    if (dateString == null) {
      return null;
    }

    return new Date(Date.parse(dateString));
  }

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

<h1 class="page-title">Plans</h1>

<!-- Menu bar -->
<div class="flex flex-col sm:flex-row my-4 border-b-2 border-decoration-faint dark:border-decoration-faint-dark border-solid">
  <nav>
    <ButtonGroup 
      class="flex-none"
      items={dateFilterOptions} 
      bind:selectedItem={selectedDateFilterOption}
    />
  </nav>
  <div class="flex-auto h-0"></div>
  <input 
    role="search"
    type="search" 
    title="Search" 
    placeholder="🔎︎ Search" 
    class="w-56 h-8 my-auto p-2 bg-background-highlight dark:bg-background-highlight-dark"
    bind:value="{searchInput}"
  />
</div>

<!-- Action button row -->
<div class="mb-4" role="region" aria-label="Plan actions">
  <Button class="bg-green mr-4" disabled={isLoading}>
    <span class="normal-case text-white">Add plan</span>
  </Button>
  <Menu disabled={selectedPlanList.length == 0}>
    <div 
      slot="activator" 
      title={selectedPlanList.length == 0 
        ? "Select one or more plans to perform an action on." 
        : "Perform various actions on the selected plans."}>
      <Button 
        disabled={selectedPlanList.length == 0}
        class="bg-background-highlight dark:bg-background-highlight-dark"
      >
        <span class="normal-case">Actions</span>
        <span class="material-icons">arrow_drop_down</span>
      </Button>
    </div>
    <List>
      <ListItem>Activate</ListItem>
      <ListItem>Deactivate</ListItem>
      <ListItem>Set date</ListItem>
      <ListItem>Copy</ListItem>
    </List>
  </Menu>  
</div>

<!-- Plan cards -->
<div class="mb-4 bg-inherit" role="list" aria-busy={isLoading}>
  {#if isLoading}
    <ProgressCircular indeterminate class="text-foreground dark:text-foreground-dark mx-auto w-full" />
  {:else}
    {#each plansToDisplay as plan, i}
      {#if upcomingSeparatorIndex === i}
        <hr class="mb-4 border-decoration-normal relative block after:content-['Upcoming_plans'] after:absolute after:top-[-0.8em] after:left-[50%] after:-translate-x-1/2 bg-inherit after:bg-inherit after:px-2 after:text-xs after:uppercase after:text-neutral-500 after:font-bold" />
      {/if}

      <div 
        role="listitem"
        class="flex flex-col sm:flex-row w-full bg-background-highlight dark:bg-background-highlight-dark p-4 mb-4 max-h-76 sm:max-h-56">
        <div class="h-24 w-auto sm:h-auto sm:w-1/4 flex flex-row">
          <div class="w-6 mr-2">
            <input 
              class="w-4 h-4" 
              type="checkbox" 
              bind:group={selectedPlanList} 
              value="{plan.id}"
              aria-label="Select this plan to perform actions on it." />
          </div>
          <div class="sm:mr-4">
            <img 
              class="rounded-md max-h-full" 
              src="{plan.thumbnail}" 
              alt="Illustration for the topic '{plan.title}'."
            />
          </div>  
        </div>
        <div class="w-3/4 overflow-hidden">
          <h2 class="card-title">
            <span>{plan.title}</span>
            {#each plan.tags as tag, j}
              <Chip 
                label 
                size="x-small"
                class="text-xs text-black uppercase tag-color-{tagColorIndexMap.get(tag)} cursor-pointer"
                on:click={() => onTagClicked(tag)}
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
  {/if}
</div>

<style>
</style>