Welcome to the show of shows, the first comment to organize thoughts! Okay so what do we want here?

So we want to kind of merge the `forceGraph` and `timeline` views. Visually we want to be similar to `timeline` where each player is comprised of a sequence of line segments but instead of caring about exact dates when players join/leave teams, we just care about whether there were changes to team membership between tournaments.

**Invariant for now**: players in a team stay constant during a tournament

We loosely have two kinds of player segments:
- "bundled" segments
    - either represented as
        - a thick solid line that represents the team is together
        - a collection of lines that are close together
    - during tournaments where the player is participating
    - between tournaments where there are no team changes
- simple segments
    - when without team
    - when there are team changes

How do we represent this?

- Bundled segments are represented by rectangles, and they are the "nodes" of the force simulation
- Loose segments interleave between the bundled segments, and they are the "links" of the force sim?

Okay great. There's definitely common functionality we can draw from `timeline`... But how?

Let's not for now; as and when we need stuff we can pull stuff in.

- [ ] How do we "contain" bundled segments (i.e. teams) within specific bounds that represent tournaments?
