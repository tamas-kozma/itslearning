<script lang="ts">
  import { Menu, List, ListItem } from 'svelte-materialify';
  import Button from './Button.svelte';
  import ButtonGroup from "./ButtonGroup.svelte";
  import PlanList from "./PlanList.svelte";
  import type { Plan } from "../models/Plan";
  import { addIfNotPresent } from "../CollectionUtils";
  import Fuse from 'fuse.js';

  let dateFilterOptions = [
    { id: "current", text: "Current" },
    { id: "past", text: "Past" },
    { id: "withoutDate", text: "Without date" }
  ];

  let planList: Plan[] = [{
      id: "7f6d2e6e-fd4e-4698-ba9f-f6b98124b855",
      thumbnail: "./solar system.jpg",
      title: "The Solar System",
      summary: "The Solar System is the gravitationally bound system of the Sun and the objects that orbit it, either directly or indirectly. Of the objects that orbit the Sun directly, the largest are the eight planets, with the remainder being smaller objects, the dwarf planets and small Solar System bodies.",
      availableFrom: "2022-01-20T11:38:41Z",
      availableTo: "2022-02-14T11:38:41Z",
      tags: [
        "THE SOLAR SYSTEM"
      ]
    }, {
      id: "a6ddaff0-eabe-418d-9827-4691e9e07850",
      thumbnail: "./northern lights.jpg",
      title: "Northern Lights Research",
      summary: "An aurora borealis, sometimes referred to as polar lights or northern lights, is a natural light display in the Earth's sky, predominantly seen in the high-latitude regions.",
      availableFrom: "2022-01-24T11:38:41Z",
      availableTo: "2022-02-21T11:38:41Z",
      tags: [
        "OUR EARTH"
      ]
    }, {
      id: "a0a0281b-bd05-414f-a777-a74f1ae3f68f",
      thumbnail: "./atmosphere.jpg",
      title: "The Atmosphere",
      summary: "An atmosphere is a layer or a set of layers of gases surrounding a planet or other material body, that is held in place by the gravity of that body. An atmosphere is more likely to be retained if the gravity it is subject to is high and the temperature of the atmosphere is low.",
      availableFrom: "2021-03-01T11:38:41Z",
      availableTo: "2021-03-17T11:38:41Z",
      tags: [
        "OUR EARTH"
      ]
    }, {
      id: "2c87425c-fdd2-4054-8de1-d7848f57d2c1",
      thumbnail: "./dna.png",
      title: "DNA, genes and chromosomes",
      summary: "Genes are made of a chemical called DNA, which is short for 'deoxyribonucleic acid'. The DNA molecule is a double helix: that is, two long, thin strands twisted around each other like a spiral staircase. The sides are sugar and phosphate molecules.",
      availableFrom: null,
      availableTo: null,
      tags: [
        "CHEMISTRY AND BIOLOGY"
      ]
    }, {
      id: "0e9c34ed-ee08-4ec3-ba22-17a0a35f5d91",
      thumbnail: "./energy.jpg",
      title: "Future energy sources",
      summary: "What does the future of energy look like? The world needs to be less reliant on fossil fuels for energy. Getting there will remake the world’s largest economic sector – energy – into one that is more sustainable, secure and affordable for everyone.",
      availableFrom: "2022-05-15T11:38:41Z",
      availableTo: "2022-05-26T11:38:41Z",
      tags: [
        "ENERGY SOURCES"
      ]
    },
  ];

  let selectedDateFilterOption = dateFilterOptions[0];  
  let searchInput = "";
  let pastPlans: Plan[];
  let availablePlans: Plan[];
  let futurePlans: Plan[];
  let withoutDatePlans: Plan[];

  let selectedPlanList1: Plan[] = [];
  let selectedPlanList2: Plan[] = [];

  $: tagSearchTermToTagMap = buildTagMap(planList);
  $: tagColorIndexMap = buildTagColorIndexMap(planList);
  $: planListSorted = sortPlansByDate(planList);
  $: filteredPlans = filterPlans(planListSorted, searchInput);
  $: makeTemporalPlanLists(filteredPlans);
  $: selectedPlanList = selectedPlanList1.concat(selectedPlanList2);
  $: onDateFilterChanged(selectedDateFilterOption);

  function buildTagColorIndexMap(planList: Plan[]): Map<string, number> {
    let tagList = [ ...new Set(planList.flatMap(p => p.tags)) ];
    let map = new Map<string, number>();
    for (let i = 0; i < tagList.length; i++) {
      let tag = tagList[i];
      map.set(tag, i % 4);
    }
    return map;
  }

  function onDateFilterChanged(selectedOption: any) {
    selectedPlanList1 = [];
    selectedPlanList2 = [];
  }

  function makeTemporalPlanLists(planList: Plan[]): void {
    pastPlans = [];
    availablePlans = [];
    futurePlans = [];
    withoutDatePlans = [];

    let now = new Date();
    for (let plan of planList) {
      if (plan.availableFrom == null) {
        availablePlans.push(plan);
        withoutDatePlans.push(plan);
        continue;
      }

      let from = new Date(Date.parse(plan.availableFrom));
      let to = new Date(Date.parse(plan.availableTo));
      if (to < now) {
        pastPlans.push(plan);
      } else if (from > now) {
        futurePlans.push(plan);
      } else {
        availablePlans.push(plan);
      }
    }
  }

  // When searching for a tag, they need to be entered with a leading # and spaces replaced 
  // with dashes (OUR EARTH -> #OUR-EARTH). Here we build map from #-form to original tag.
  function buildTagMap(planList: Plan[]): Map<string, string> {
    let tagMap = new Map<string, string>();
    let allTagsWithDuplicates = planList.flatMap(p => p.tags);
    let allTagsSet = new Set(allTagsWithDuplicates);
    allTagsSet.forEach(tag => {
      let tagSearchTerm = getSearchTermForTag(tag);
      tagMap.set(tagSearchTerm, tag);
    });

    return tagMap;
  }

  function getSearchTermForTag(tag: string): string {
    return "#" + tag.replaceAll(/\s/g, "-");
  }

  function sortPlansByDate(planList: Plan[]): Plan[] {
    return planList.sort((left, right) => {
      if (left.availableFrom == null) {
        return -1;
      }
      
      if (right.availableFrom == null) {
        return 1;
      }
      
      return Date.parse(left.availableFrom) - Date.parse(right.availableFrom);
    });
  }

  function filterPlans(planList: Plan[], searchInput: string): Plan[] {
    // No search needed.
    if (searchInput == null) {
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

  function onTagClicked(tag: string) {
    searchInput = getSearchTermForTag(tag);
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
  <Button class="bg-green mr-4">
    <span class="normal-case text-white">Add plan</span>
  </Button>
  <Menu disabled={selectedPlanList.length == 0}>
    <div slot="activator">
      <Button disabled={selectedPlanList.length == 0} class="bg-background-highlight dark:bg-background-highlight-dark">
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

<!-- This repetition here is disguting. I'd fix it by moving the hr-feature into the PlanList, or even better,
inline the PlanList here. I just don't want to spend time on that in a test assignment. -->
{#if selectedDateFilterOption.id === "current"}
  <PlanList planList={availablePlans} bind:selectedPlanList={selectedPlanList1} {tagColorIndexMap} on:tagClicked={e => onTagClicked(e.detail)}></PlanList>
  <hr class="mb-4 border-decoration-normal relative block after:content-['Upcoming_plans'] after:absolute after:top-[-0.8em] after:left-[50%] after:-translate-x-1/2 bg-inherit after:bg-inherit after:px-2 after:text-xs after:uppercase after:text-neutral-500 after:font-bold" />
  <PlanList planList={futurePlans} bind:selectedPlanList={selectedPlanList2} {tagColorIndexMap} on:tagClicked={e => onTagClicked(e.detail)}></PlanList>
{/if}
{#if selectedDateFilterOption.id === "past"}
  <PlanList planList={pastPlans} bind:selectedPlanList={selectedPlanList1} {tagColorIndexMap} on:tagClicked={e => onTagClicked(e.detail)}></PlanList>
{/if}
{#if selectedDateFilterOption.id === "withoutDate"}
  <PlanList planList={withoutDatePlans} bind:selectedPlanList={selectedPlanList1} {tagColorIndexMap} on:tagClicked={e => onTagClicked(e.detail)}></PlanList>
{/if}

<style>
</style>