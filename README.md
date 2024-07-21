# rlesports

Visualization of Rocket League's eSports scene.

## Development

```
$ npm install
$ npm start
```

### Data management

The data used by the visualization is retrieved by a Golang-based application from Liquipedia, processed, and stored in a format that's helpful for the visualization. To run this app:

```
$ go build
$ ./rlesports <args>
```

## File layout

| File        | Description                             |
| ----------- | --------------------------------------- |
| `.vscode/`  | Visual Studio Code debug configurations |
| `cmd/`      | Golang executable code                  |
| `internal/` | Golang library code                     |
| `public/`   | React.js public HTML files              |
| `src/`      | React.js source code                    |
