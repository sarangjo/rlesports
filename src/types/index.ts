// Types relating to the RL Esports overall data

export enum EventType {
  JOIN = "join",
  LEAVE = "leave",
}

export enum MembershipType {
  MEMBER,
  NOT_MEMBER,
}

export interface Membership {
  team: string;
  join: string;
  leave?: string;
}

export interface Player {
  name: string;
  memberships: Membership[];
}
