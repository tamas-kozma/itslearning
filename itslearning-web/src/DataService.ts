import { Readable, Subscriber, Unsubscriber, writable } from 'svelte/store';
import type { Plan } from "./models/Plan";

/**
 * Course plan data store.
 */
class PlanListStore implements Readable<Plan[]> {
  private readonly planListStore = writable<Plan[]>(null);

  public subscribe(run: Subscriber<Plan[]>, invalidate?: (value?: Plan[]) => void): Unsubscriber {
    return this.planListStore.subscribe(run, invalidate);
  }

  /**
   * Loads plans from the server.
   */
  public async load() {
    await new Promise(r => setTimeout(r, 2000));
    let response = await fetch("./plans.json");
    if (!response.ok) {
      console.log("Failed to fetch plans (" + response.status + ").");
      throw new Error("Failed to fetch plans.");
    }
  
    let json = await response.json();
    this.planListStore.set(json as Plan[]);
  }
}

export const planListStore = new PlanListStore();
