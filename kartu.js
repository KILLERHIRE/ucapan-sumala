(function () {
  var cfg = window.SITE_CONFIG;
  var canvas = document.getElementById("card-canvas");
  var painted = false;

  function paint() {
    window.SumalaQr.drawCard(canvas, cfg);
    painted = true;
  }

  paint();

  canvas.addEventListener("click", function () {
    if (!painted) paint();
    canvas.toBlob(function (blob) {
      var link = document.createElement("a");
      var url = URL.createObjectURL(blob);
      link.href = url;
      link.download = "qr-sumala.png";
      link.click();
      window.setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 1000);
    }, "image/png");
  });
})();
