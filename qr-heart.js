(function () {
  var RED = "#e10600";

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

function isFormat(row, col, moduleCount) {
  if (row === 8 && (col < 9 || col >= moduleCount - 8)) return true;
  if (col === 8 && (row < 9 || row >= moduleCount - 8)) return true;
  return false;
}

function isProtected(row, col, moduleCount, centers) {
  return isFinder(row, col, moduleCount) || row === 6 || col === 6 || isFormat(row, col, moduleCount);
}

function inHeartShape(col, row, moduleCount) {
  var u = (col + 0.5) / moduleCount;
  var v = (row + 0.5) / moduleCount;
  var lobe = 0.26;
  var t;
  var half;
  var left;
  var right;

  if (Math.hypot(u - 0.3, v - 0.27) <= lobe || Math.hypot(u - 0.7, v - 0.27) <= lobe) {
    return true;
  }
  if (row < 6 && Math.abs(col - (moduleCount - 1) / 2) < (6 - row) * 1.65) {
    return false;
  }
  if (v < 0.14) return false;

  t = Math.max(0, (v - 0.2) / 0.8);
  half = 0.5 * Math.pow(1 - t, 0.35);
  left = 0.5 - half;
  right = 0.5 + half;
  if (v > 0.7) {
    left *= 1 - Math.min(1, (v - 0.7) / 0.22);
  }
  return u >= left && u <= right;
}

function moduleKept(row, col, moduleCount, centers) {
  return isProtected(row, col, moduleCount, centers) || inHeartShape(col, row, moduleCount);
}

function paintModules(ctx, qr, originX, originY, cell) {
  var moduleCount = qr.getModuleCount();
  var centers = alignmentCenters(moduleCount);
  var row;
  var col;
  var x;
  var y;
  var span = cell + 0.6;

  for (row = 0; row < moduleCount; row += 1) {
    for (col = 0; col < moduleCount; col += 1) {
      if (!moduleKept(row, col, moduleCount, centers)) continue;
      x = originX + col * cell;
      y = originY + row * cell;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y, span, span);
    }
  }

  ctx.fillStyle = RED;
  for (row = 0; row < moduleCount; row += 1) {
    for (col = 0; col < moduleCount; col += 1) {
      if (!qr.isDark(row, col) || !moduleKept(row, col, moduleCount, centers)) continue;
      x = originX + col * cell;
      y = originY + row * cell;
      ctx.fillRect(x, y, span, span);
    }
  }
}

function drawCode(canvas, url) {
  var qr = createQr(url);
  var moduleCount = qr.getModuleCount();
  var cell = 14;
  var pad = cell * 2;
  var size = moduleCount * cell + pad * 2;
  var dpr = 3;
  var ctx = canvas.getContext("2d");

  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);
  paintModules(ctx, qr, pad, pad, cell);
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
  var qrSize = moduleCount * cell;
  var lines = nameLines(config.partnerName);
  var scale = 2;
  var width = 1080;
  var qrY = 500;
  var height = qrY + qrSize + 270;
  var ctx = canvas.getContext("2d");
  var script = '"Great Vibes", cursive';
  var serif = '"Cormorant Garamond", Georgia, serif';
  var sans = 'Nunito, "Segoe UI", sans-serif';
  var qrX = (width - qrSize) / 2;
  var gradient;
  var nameSize;
  var i;

  while (qrSize > 640 && cell > 8) {
    cell -= 1;
    qrSize = moduleCount * cell;
    height = qrY + qrSize + 270;
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

  paintModules(ctx, qr, qrX, qrY, cell);

  ctx.fillStyle = "#4a2030";
  ctx.font = "700 38px " + sans;
  ctx.fillText("Scan untuk membuka ucapan", width / 2, qrY + qrSize + 86);

  ctx.fillStyle = "#9f1d45";
  ctx.font = "600 36px " + serif;
  ctx.fillText("dari " + config.fromName, width / 2, qrY + qrSize + 140);

  ctx.fillStyle = "#8d5a6b";
  ctx.font = "700 28px " + sans;
  ctx.fillText(config.fromTagline, width / 2, qrY + qrSize + 188);
}

  window.SumalaQr = {
    isPlaceholder: isPlaceholder,
    drawCode: drawCode,
    drawCard: drawCard
  };
})();
