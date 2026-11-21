/* scanner.js — generic camera barcode / QR reader for a web page.
 *
 *   var s = Scanner.create({
 *     video: document.getElementById('v'),      // a <video playsinline muted autoplay> element
 *     onRead: function (text, format) { ... },  // called once per distinct code
 *     onStatus: function (msg, level) { ... },  // optional: 'info' | 'ok' | 'bad'
 *     repeatAfterMs: 2500,                      // same code again only after this long (default 2500)
 *     facingMode: 'environment'                 // back camera (default)
 *   });
 *   s.start();  s.stop();  s.running  // true while the camera is on
 *
 * Needs: a page served over https (or localhost), the ZXing UMD build loaded first (window.ZXing),
 * and a browser that grants getUserMedia — Safari, Chrome, and FileMaker Go's web viewer all do for https pages.
 * Nothing in here knows about FileMaker, Eventbrite, or any backend: onRead gets the text and decides.
 */
(function (global) {
  function create(opts) {
    opts = opts || {};
    var video = opts.video, onRead = opts.onRead || function () {}, onStatus = opts.onStatus || function () {};
    var repeatAfterMs = opts.repeatAfterMs == null ? 2500 : opts.repeatAfterMs;
    var facing = opts.facingMode || 'environment';
    var stream = null, reader = null, lastText = '', lastAt = 0;
    var api = { running: false };

    function stopTracks() {
      if (stream) { stream.getTracks().forEach(function (t) { try { t.stop(); } catch (e) {} }); stream = null; }
      if (video) { try { video.srcObject = null; } catch (e) {} }
    }

    api.start = function () {
      if (api.running) return Promise.resolve();
      if (!global.isSecureContext) { onStatus('This page is not https, so the browser will not open the camera.', 'bad'); return Promise.reject(new Error('insecure')); }
      if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) { onStatus('No camera API in this browser.', 'bad'); return Promise.reject(new Error('no_api')); }
      if (typeof global.ZXing === 'undefined') { onStatus('Decoder not loaded.', 'bad'); return Promise.reject(new Error('no_decoder')); }
      onStatus('Starting camera…', 'info');
      return navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 15, max: 20 } }, audio: false }).then(function (s) {   // a QR needs little: low resolution and frame rate keep the device cool
        stream = s; api.running = true;
        if (video) video.srcObject = s;
        reader = new global.ZXing.BrowserMultiFormatReader();
        reader.decodeFromStream(s, video, function (result) {
          if (!result || !api.running) return;
          var text = result.getText(), now = Date.now();
          if (text === lastText && now - lastAt < repeatAfterMs) return;   // the same code sitting in front of the camera
          lastText = text; lastAt = now;
          var fmt = ''; try { fmt = String(result.getBarcodeFormat()); } catch (e) {}
          onRead(text, fmt);
        });
        onStatus('Camera on. Hold a code in view.', 'ok');
      }).catch(function (err) {
        api.running = false; stopTracks();
        onStatus('Camera refused: ' + (err && err.name ? err.name : 'unknown'), 'bad');
        throw err;
      });
    };

    api.stop = function () {
      api.running = false;
      if (reader) { try { reader.reset(); } catch (e) {} reader = null; }
      stopTracks();
      onStatus('Camera off.', 'info');
    };

    api.forget = function () { lastText = ''; lastAt = 0; };   // allow the last code to be read again at once
    return api;
  }
  global.Scanner = { create: create };
})(window);
