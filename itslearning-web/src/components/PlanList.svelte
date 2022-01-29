<script lang="ts">
  import { Button, Menu, List, ListItem, Card, Row, Col, CardTitle, CardText } from 'svelte-materialify';
  import ButtonGroup from "./ButtonGroup.svelte";

  let dateFilterOptions = [
    { text: "Current" },
    { text: "Past" },
    { text: "Without date" }
  ];
  let selectedDateFilterOption = null;

  let planList = [{
      id: "7f6d2e6e-fd4e-4698-ba9f-f6b98124b855",
      thumbnail: "./solar system.jpg",
      title: "The Solar System",
      summary: "The Solar System is the gravitationally bound system of the Sun and the objects that orbit it, either directly or indirectly. Of the objects that orbit the Sun directly, the largest are the eight planets, with the remainder being smaller objects, the dwarf planets and small Solar System bodies.",
      availableFrom: "2022-01-20T11:38:41Z",
      availableTo: "2022-02-14T11:38:41Z",
      isAvailable: true,
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
      isAvailable: true,
      tags: [
        "OUR EARTH"
      ]
    }, {
      id: "a0a0281b-bd05-414f-a777-a74f1ae3f68f",
      thumbnail: "./atmosphere.jpg",
      title: "The Atmosphere",
      summary: "An atmosphere is a layer or a set of layers of gases surrounding a planet or other material body, that is held in place by the gravity of that body. An atmosphere is more likely to be retained if the gravity it is subject to is high and the temperature of the atmosphere is low.",
      availableFrom: "2022-03-01T11:38:41Z",
      availableTo: "2022-03-17T11:38:41Z",
      isAvailable: false,
      tags: [
        "OUR EARTH"
      ]
    }, {
      id: "2c87425c-fdd2-4054-8de1-d7848f57d2c1",
      thumbnail: "./dna.png",
      title: "DNA, genes and chromosomes",
      summary: "Genes are made of a chemical called DNA, which is short for 'deoxyribonucleic acid'. The DNA molecule is a double helix: that is, two long, thin strands twisted around each other like a spiral staircase. The sides are sugar and phosphate molecules.",
      availableFrom: "2022-04-07T11:38:41Z",
      availableTo: "2022-04-23T11:38:41Z",
      isAvailable: false,
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
      isAvailable: false,
      tags: [
        "ENERGY SOURCES"
      ]
    },
  ];

  function formatDate(isoDateString: string): string {
    let milliseconds = Date.parse(isoDateString);
    return new Date(milliseconds).toDateString();
  }
</script>

<h1 class="page-title">Plans</h1>

<!-- Menu bar -->
<div class="flex flex-col sm:flex-row my-4 border-b-2 border-neutral-300 border-solid">
  <ButtonGroup 
    class="flex-none"
    items={dateFilterOptions} 
    bind:selectedItem={selectedDateFilterOption}
  />
  <div class="flex-auto h-0"></div>
  <input 
    type="text" 
    title="Search" 
    placeholder="🔎︎ Search" 
    class="w-56 h-8 my-auto p-2"
  />
</div>

<!-- Action button row -->
<div class="mb-4">
  <Button class="bg-green-600">Add plan</Button>
  <Menu>
    <div slot="activator">
      <Button>
        <span>Actions</span>
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
<div class="mb-4">
  {#each planList as plan, i}
    <div class="flex flex-col sm:flex-row w-full bg-white p-4 mb-4 max-h-56">
      <div class="w-1/4 flex flex-row">
        <div class="w-6 mr-2">
          <input class="w-4 h-4" type="checkbox" />
        </div>
        <div class="w-auto mr-4">
          <img  class="rounded-md" src="{plan.thumbnail}" alt="Illustration for the topic {plan.title}" />
        </div>  
      </div>
      <div class="w-3/4 overflow-hidden">
        <h2 class="card-title">{plan.title}</h2>
        <span class="line-clamp-4">{plan.summary}</span>
        <span>
          <span class="material-icons text-base">calendar_today</span>
          <span>{formatDate(plan.availableFrom)} - {formatDate(plan.availableTo)}</span>
        </span>
      </div>
    </div>
  {/each}
</div>

<style>
</style>