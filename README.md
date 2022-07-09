# Timeline

1. Version 1: just certain known players and their histories
2. Version 2: add team information

Let's separate the UI concerns from the data management concerns.

### Stage 1: Raw data

What information do we get from the source?

- player team histories: list of Memberships, each with join/leave date

### Stage 2: Computation

Here, we convert the input data into the data shape we need for drawing

-

### Stage 3: Drawing

- Players: For each player, we draw a single "line" from start to finish
    - circles
        - `x`: fixed - they are bound directly to time
        - `y`: computed based on heuristics
        - `color`: fixed
    - segments/curves connecting the circles (**COMPLETELY COMPUTED FROM CIRCLES**)
        - `x`: fixed - from start clrcle `x` to finish `x`
        - `y`: This is the complicated part; these can be simple lines to start, or complex weaving to accommodate for the y value of the circles. The point though is that we go from circle to circle with the same color
        - `color`: fixed
- Timeframe: start/end dates to draw

- [ ] Attach data to improve UI

Once we have data in this shape, drawing it should be a breeze.

---

3. Version 3: advanced toggles (TODO copy from OneNote)
