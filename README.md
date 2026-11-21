# scanner

Camera barcode / QR scanning for The Actors Studio door, as plain web pages.

- `camtest.html` — does this browser (or FileMaker Go's web viewer) allow the camera? Open it, tap *Start camera*, read the four lines. Point it at any QR code and it prints the text.
- `scanner.js` — generic module: `Scanner.create({video, onRead})`, camera in a box on the page, decodes QR and barcodes (ZXing, bundled as `zxing.min.js`), calls your handler once per code. No backend built in.
- `index.html` — the door scanner. Inside a FileMaker web viewer it calls the FileMaker script `Pub_Scan` with `{code}` (change with `?script=Name`); FileMaker can push a reply to `window.fromServer(json)` to show ok / already in / not found. Outside FileMaker it shows the code, or POSTs `{code}` to `?post=https://…`. `?auto=1` starts the camera on load.

Why a hosted page: browsers (and FileMaker Go's web viewer) only grant the camera to pages served over https, never to a local file.

Published with GitHub Pages: https://kylenyc212.github.io/scanner/
