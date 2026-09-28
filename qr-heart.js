(function () {
  var INK = "#2b0d18";

  var ALIGNMENT = [
    [],
    [],
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50],
    [6, 30, 54],
    [6, 32, 58],
    [6, 34, 62],
    [6, 26, 46, 66],
    [6, 26, 48, 70],
    [6, 26, 50, 74],
    [6, 30, 54, 78],
    [6, 30, 56, 82],
    [6, 30, 58, 86],
    [6, 34, 62, 90],
    [6, 28, 50, 72, 94],
    [6, 26, 50, 74, 98],
    [6, 30, 54, 78, 102],
    [6, 28, 54, 80, 106],
    [6, 32, 58, 84, 110],
    [6, 30, 58, 86, 114],
    [6, 34, 62, 90, 118],
    [6, 26, 50, 74, 98, 122],
    [6, 30, 54, 78, 102, 126],
    [6, 26, 52, 78, 104, 130],
    [6, 30, 56, 82, 108, 134],
    [6, 34, 60, 86, 112, 138],
    [6, 30, 58, 86, 114, 142],
    [6, 34, 62, 90, 118, 146],
    [6, 30, 54, 78, 102, 126, 150],
    [6, 24, 50, 76, 102, 128, 154],
    [6, 28, 54, 80, 106, 132, 158],
    [6, 32, 58, 84, 110, 136, 162],
    [6, 26, 54, 82, 110, 138, 166],
    [6, 30, 58, 86, 114, 142, 170]
  ];

  function isPlaceholder(url) {
    return !url || url.indexOf("alamat-website-nanti") !== -1;
  }

  function createQr(text) {
    qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];
    var qr = qrcode(0, "H");
    qr.addData(text);
    qr.make();
    return qr;
  }

  function heartPath(ctx, x, y, size) {
    var s = size;
    var cx = x + s * 0.5;
    ctx.beginPath();
    ctx.moveTo(cx, y + s * 0.9);
    ctx.bezierCurveTo(
      x + s * 0.06, y + s * 0.56,
      x + s * 0.02, y + s * 0.28,
      x + s * 0.24, y + s * 0.16
    );
    ctx.bezierCurveTo(
      x + s * 0.4, y + s * 0.06,
      x + s * 0.47, y + s * 0.2,
      cx, y + s * 0.34
    );
    ctx.bezierCurveTo(
      x + s * 0.53, y + s * 0.2,
      x + s * 0.6, y + s * 0.06,
      x + s * 0.76, y + s * 0.16
    );
    ctx.bezierCurveTo(
      x + s * 0.98, y + s * 0.28,
      x + s * 0.94, y + s * 0.56,
      cx, y + s * 0.9
    );
    ctx.closePath();
  }

  function versionOf(moduleCount) {
    return (moduleCount - 17) / 4;
  }

  function alignmentCenters(moduleCount) {
    var positions = ALIGNMENT[versionOf(moduleCount)] || [];
    var centers = [];
    var i;
    var j;
    var row;
    var col;
    for (i = 0; i < positions.length; i += 1) {
      for (j = 0; j < positions.length; j += 1) {
        row = positions[i];
        col = positions[j];
        if (row <= 8 && col <= 8) continue;
        if (row <= 8 && col >= moduleCount - 9) continue;
        if (row >= moduleCount - 9 && col <= 8) continue;
        centers.push([row, col]);
      }
    }
    return centers;
  }

  function isFinder(row, col, moduleCount) {
    function box(row0, col0) {
      return row >= row0 && row < row0 + 7 && col >= col0 && col < col0 + 7;
    }
    return box(0, 0) || box(moduleCount - 7, 0) || box(0, moduleCount - 7);
  }

  function isAlignment(row, col, centers) {
    var i;
    for (i = 0; i < centers.length; i += 1) {
      if (Math.abs(row - centers[i][0]) <= 2 && Math.abs(col - centers[i][1]) <= 2) {
        return true;
      }
    }
    return false;
  }

  function paintModules(ctx, qr, originX, originY, cell) {
    var moduleCount = qr.getModuleCount();
    var centers = alignmentCenters(moduleCount);
    var quiet = 4;
    var row;
    var col;
    var x;
    var y;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(originX, originY, (moduleCount + quiet * 2) * cell, (moduleCount + quiet * 2) * cell);
    ctx.fillStyle = INK;

    for (row = 0; row < moduleCount; row += 1) {
      for (col = 0; col < moduleCount; col += 1) {
        if (!qr.isDark(row, col)) continue;
        x = originX + (col + quiet) * cell;
        y = originY + (row + quiet) * cell;
        if (isFinder(row, col, moduleCount) || row === 6 || col === 6 || isAlignment(row, col, centers)) {
          ctx.fillRect(x, y, cell, cell);
        } else {
          ctx.fillRect(x + cell * 0.2, y + cell * 0.2, cell * 0.6, cell * 0.6);
          heartPath(ctx, x + cell * 0.05, y + cell * 0.02, cell * 0.9);
          ctx.fill();
        }
      }
    }
  }

  function drawCode(canvas, url) {
    var qr = createQr(url);
    var moduleCount = qr.getModuleCount();
    var cell = 12;
    var qrSize = (moduleCount + 8) * cell;
    var bleed = Math.ceil(qrSize * 0.38);
    var size = qrSize + bleed * 2;
    var dpr = 3;
    var ctx = canvas.getContext("2d");
    var heartSize = qrSize * 1.78;
    var heartX;
    var heartY;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    heartX = bleed + qrSize / 2 - heartSize / 2;
    heartY = bleed + qrSize / 2 - heartSize * 0.58;
    ctx.fillStyle = "rgba(180, 35, 75, 0.14)";
    ctx.strokeStyle = "rgba(158, 28, 68, 0.7)";
    ctx.lineWidth = Math.max(3, qrSize * 0.012);
    heartPath(ctx, heartX, heartY, heartSize);
    ctx.fill();
    ctx.stroke();

    paintModules(ctx, qr, bleed, bleed, cell);
    return qr;
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }

  function nameLines(name) {
    var full = name.indexOf("♥") >= 0 ? name : name + " ♥";
    var marker = "Ayang beb ";
    if (full.indexOf(marker) === 0) {
      return ["Ayang beb", full.slice(marker.length)];
    }
    return [full];
  }

  function fitFont(ctx, text, maxWidth, family, size, minSize, weight) {
    var next = size;
    while (next > minSize) {
      ctx.font = weight + " " + next + "px " + family;
      if (ctx.measureText(text).width <= maxWidth) break;
      next -= 2;
    }
    return next;
  }

function drawCard(canvas, config) {
  var qr = createQr(config.siteUrl);
  var moduleCount = qr.getModuleCount();
  var cell = 14;
  var qrSize = (moduleCount + 8) * cell;
  var lines = nameLines(config.partnerName);
  var scale = 2;
  var width = 1080;
  var heartSize = qrSize * 1.52;
  var heartTop = 530;
  var heartY = heartTop;
  var qrY = heartY + heartSize * 0.58 - qrSize / 2;
  var heartBottom = heartY + heartSize;
  var height = Math.ceil(heartBottom + 250);
  var ctx = canvas.getContext("2d");
  var script = '"Great Vibes", cursive';
  var serif = '"Cormorant Garamond", Georgia, serif';
  var sans = 'Nunito, "Segoe UI", sans-serif';
  var qrX = (width - qrSize) / 2;
  var gradient;
  var nameSize;
  var i;

  while (qrSize > 620 && cell > 8) {
    cell -= 1;
    qrSize = (moduleCount + 8) * cell;
    heartSize = qrSize * 1.52;
    qrY = heartY + heartSize * 0.58 - qrSize / 2;
    heartBottom = heartY + heartSize;
    height = Math.ceil(heartBottom + 250);
  }

  canvas.width = width * scale;
  canvas.height = height * scale;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#fff7f8");
  gradient.addColorStop(0.55, "#fde8ee");
  gradient.addColorStop(1, "#f6d0dc");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = "#c22555";
  heartPath(ctx, -10, 20, 90);
  ctx.fill();
  heartPath(ctx, width - 80, 36, 100);
  ctx.fill();
  heartPath(ctx, -6, height - 100, 86);
  ctx.fill();
  heartPath(ctx, width - 92, height - 120, 108);
  ctx.fill();
  ctx.restore();

  roundRect(ctx, 58, 48, width - 116, height - 96, 46);
  ctx.fillStyle = "#fffdfb";
  ctx.fill();

  ctx.textAlign = "center";
  ctx.fillStyle = "#8d5a6b";
  ctx.font = "700 28px " + sans;
  ctx.fillText(config.birthdayLabel.toUpperCase(), width / 2, 150);

  ctx.fillStyle = "#4a2030";
  ctx.font = "600 62px " + serif;
  ctx.fillText("Selamat Ulang Tahun", width / 2, 230);

  ctx.fillStyle = "#9f1d45";
  ctx.font = "600 48px " + serif;
  ctx.fillText("ke-" + config.age, width / 2, 292);

  nameSize = 86;
  for (i = 0; i < lines.length; i += 1) {
    nameSize = Math.min(nameSize, fitFont(ctx, lines[i], width - 240, script, nameSize, 48, "400"));
  }
  ctx.fillStyle = "#9f1d45";
  for (i = 0; i < lines.length; i += 1) {
    ctx.font = "400 " + nameSize + "px " + script;
    ctx.fillText(lines[i], width / 2, 390 + i * Math.round(nameSize * 0.78));
  }

  ctx.fillStyle = "rgba(180, 35, 75, 0.13)";
  ctx.strokeStyle = "rgba(158, 28, 68, 0.75)";
  ctx.lineWidth = 8;
  heartPath(ctx, width / 2 - heartSize / 2, heartY, heartSize);
  ctx.fill();
  ctx.stroke();

  paintModules(ctx, qr, qrX, qrY, cell);

  ctx.fillStyle = "#4a2030";
  ctx.font = "700 38px " + sans;
  ctx.fillText("Scan untuk membuka ucapan", width / 2, heartBottom + 64);

  ctx.fillStyle = "#9f1d45";
  ctx.font = "600 36px " + serif;
  ctx.fillText("dari " + config.fromName, width / 2, heartBottom + 122);

  ctx.fillStyle = "#8d5a6b";
  ctx.font = "700 28px " + sans;
  ctx.fillText(config.fromTagline, width / 2, heartBottom + 172);
}

  window.SumalaQr = {
    isPlaceholder: isPlaceholder,
    drawCode: drawCode,
    drawCard: drawCard
  };
})();
