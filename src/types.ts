import { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";

// Events as read in from the JSON
export interface PlayerEvent {
  start: string;
  team: string;
  end?: string;
  role?: string;
}

// Each player has a full list of their events
export interface FullPlayer {
  name: string;
  events: PlayerEvent[];
}

// The translated Player node which stays fixed, with the team changing based on the date chosen
export interface Player extends SimulationNodeDatum {
  name: string;
  team?: string;
}

// We use links to ensure proximity of teammates
export type Teammates = SimulationLinkDatum<Player>;
