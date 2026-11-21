# scanner

Camera barcode / QR scanning for The Actors Studio door, as plain web pages.

- `camtest.html` — does this browser (or FileMaker Go's web viewer) allow the camera? Open it, tap *Start camera*, read the four lines. Point it at any QR code and it prints the text.
- `scanner.js` — (next) a generic module: camera in a box on the page, decodes codes, calls your handler with the text. No backend built in.
- `index.html` — (next) the door scanner: `scanner.js` plus an adapter that sends each code to a configurable endpoint (FileMaker Data API first).

Published with GitHub Pages: https://kylenyc212.github.io/scanner/
