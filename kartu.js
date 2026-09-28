(function () {
  var cfg = window.SITE_CONFIG;
  var canvas = document.getElementById("card-canvas");
  var note = document.getElementById("url-note");

  function paint() {
    note.hidden = !window.SumalaQr.isPlaceholder(cfg.siteUrl);
    window.SumalaQr.drawCard(canvas, cfg);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(paint);
  }
  window.setTimeout(paint, 1200);

  document.getElementById("save-card").addEventListener("click", function () {
    paint();
    canvas.toBlob(function (blob) {
      var link = document.createElement("a");
      var url = URL.createObjectURL(blob);
      link.href = url;
      link.download = "kartu-ultah-sumala.png";
      link.click();
      window.setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 1000);
    }, "image/png");
  });
})();
