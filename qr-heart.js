(function () {
  var RED = "#e10600";

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

  function visualPads(moduleCount) {
    return {
      left: Math.max(4, Math.round(moduleCount * 7 / 37)),
      right: Math.max(4, Math.round(moduleCount * 7 / 37)),
      top: Math.max(3, Math.round(moduleCount * 5 / 37)),
      bottom: Math.max(10, Math.round(moduleCount * 18 / 37))
    };
  }

  function lerpKeys(v, keys) {
    var i;
    var t;
    if (v <= keys[0][0]) return keys[0][1];
    for (i = 1; i < keys.length; i += 1) {
      if (v <= keys[i][0]) {
        t = (v - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]);
        t = t * t * (3 - 2 * t);
        return keys[i - 1][1] + (keys[i][1] - keys[i - 1][1]) * t;
      }
    }
    return keys[keys.length - 1][1];
  }

  function inHeartShape(u, v) {
    var lx = (u - 0.302) / 0.292;
    var rx = (u - 0.698) / 0.292;
    var ly = (v - 0.252) / 0.218;
    var half;
    if (lx * lx + ly * ly <= 1) return true;
    if (rx * rx + ly * ly <= 1) return true;
    if (v < 0.22 || v > 0.995) return false;
    half = lerpKeys(v, [
      [0.22, 0.495],
      [0.45, 0.455],
      [0.62, 0.392],
      [0.705, 0.36],
      [0.78, 0.24],
      [0.87, 0.125],
      [0.94, 0.052],
      [0.995, 0.012]
    ]);
    return Math.abs(u - 0.5) <= half;
  }

  function isFinder(row, col, moduleCount) {
    function box(row0, col0) {
      return row >= row0 && row < row0 + 7 && col >= col0 && col < col0 + 7;
    }
    return box(0, 0) || box(moduleCount - 7, 0) || box(0, moduleCount - 7);
  }

  function decorativeDark(row, col) {
    var n = ((row * 131 + col * 137 + row * col * 17) ^ (row * 7 + col * 13)) >>> 0;
    return n % 97 < 47;
  }

  function touchesFinderHalo(vr, vc, padT, padL, moduleCount) {
    var r = vr - padT;
    var c = vc - padL;
    var dr;
    var dc;
    var rr;
    var cc;
    if (r >= 0 && r < moduleCount && c >= 0 && c < moduleCount) return false;
    for (dr = -1; dr <= 1; dr += 1) {
      for (dc = -1; dc <= 1; dc += 1) {
        rr = r + dr;
        cc = c + dc;
        if (rr >= 0 && rr < moduleCount && cc >= 0 && cc < moduleCount && isFinder(rr, cc, moduleCount)) {
          return true;
        }
      }
    }
    return false;
  }

  function heartMetrics(moduleCount, cell) {
    var pad = visualPads(moduleCount);
    return {
      pad: pad,
      cols: moduleCount + pad.left + pad.right,
      rows: moduleCount + pad.top + pad.bottom,
      width: (moduleCount + pad.left + pad.right) * cell,
      height: (moduleCount + pad.top + pad.bottom) * cell
    };
  }

  function paintModules(ctx, qr, originX, originY, cell) {
    var moduleCount = qr.getModuleCount();
    var metrics = heartMetrics(moduleCount, cell);
    var pad = metrics.pad;
    var cols = metrics.cols;
    var rows = metrics.rows;
    var span = cell + 0.4;
    var vr;
    var vc;
    var u;
    var v;
    var r;
    var c;
    var real;
    var finder;
    var inside;
    var dark;
    var x;
    var y;

    ctx.imageSmoothingEnabled = false;

    for (vr = 0; vr < rows; vr += 1) {
      for (vc = 0; vc < cols; vc += 1) {
        u = (vc + 0.5) / cols;
        v = (vr + 0.5) / rows;
        r = vr - pad.top;
        c = vc - pad.left;
        real = r >= 0 && r < moduleCount && c >= 0 && c < moduleCount;
        finder = real && isFinder(r, c, moduleCount);
        inside = inHeartShape(u, v);
        if (!finder && !inside) continue;

        if (real) {
          dark = qr.isDark(r, c);
        } else if (touchesFinderHalo(vr, vc, pad.top, pad.left, moduleCount)) {
          dark = false;
        } else {
          dark = decorativeDark(vr, vc);
        }

        x = originX + vc * cell;
        y = originY + vr * cell;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x, y, span, span);
        if (dark) {
          ctx.fillStyle = RED;
          ctx.fillRect(x, y, span, span);
        }
      }
    }

    return metrics;
  }

  function drawCode(canvas, url) {
    var qr = createQr(url);
    var moduleCount = qr.getModuleCount();
    var cell = 12;
    var metrics = heartMetrics(moduleCount, cell);
    var quiet = cell * 3;
    var width = metrics.width + quiet * 2;
    var height = metrics.height + quiet * 2;
    var dpr = 3;
    var ctx = canvas.getContext("2d");

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    paintModules(ctx, qr, quiet, quiet, cell);
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
    var lines = nameLines(config.partnerName);
    var scale = 2;
    var width = 1080;
    var cell = 13;
    var metrics = heartMetrics(moduleCount, cell);
    var measure = canvas.getContext("2d");
    var ctx;
    var script = '"Great Vibes", cursive';
    var serif = '"Cormorant Garamond", Georgia, serif';
    var sans = 'Nunito, "Segoe UI", sans-serif';
    var sidePad = 120;
    var qrX;
    var qrY;
    var nameSize = 86;
    var nameStep;
    var nameTop = 318;
    var innerTop = 48;
    var innerBottom = 48;
    var height;
    var gradient;
    var i;

    while (metrics.width > width - sidePad * 2 && cell > 8) {
      cell -= 1;
      metrics = heartMetrics(moduleCount, cell);
    }

    for (i = 0; i < lines.length; i += 1) {
      nameSize = Math.min(nameSize, fitFont(measure, lines[i], width - 240, script, nameSize, 48, "400"));
    }
    nameStep = Math.round(nameSize * 0.78);
    qrY = nameTop + lines.length * nameStep + 28;
    qrX = (width - metrics.width) / 2;
    height = qrY + metrics.height + 196 + innerBottom;

    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx = canvas.getContext("2d");
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

    roundRect(ctx, 58, innerTop, width - 116, height - innerTop - innerBottom, 46);
    ctx.fillStyle = "#fffdfb";
    ctx.fill();

    ctx.textAlign = "center";
    ctx.fillStyle = "#8d5a6b";
    ctx.font = "700 28px " + sans;
    ctx.fillText(config.birthdayLabel.toUpperCase(), width / 2, 128);

    ctx.fillStyle = "#4a2030";
    ctx.font = "600 62px " + serif;
    ctx.fillText("Selamat Ulang Tahun", width / 2, 198);

    ctx.fillStyle = "#9f1d45";
    ctx.font = "600 48px " + serif;
    ctx.fillText("ke-" + config.age, width / 2, 256);

    ctx.fillStyle = "#9f1d45";
    for (i = 0; i < lines.length; i += 1) {
      ctx.font = "400 " + nameSize + "px " + script;
      ctx.fillText(lines[i], width / 2, nameTop + i * nameStep);
    }

    paintModules(ctx, qr, qrX, qrY, cell);

    ctx.fillStyle = "#4a2030";
    ctx.font = "700 36px " + sans;
    ctx.fillText("Scan untuk membuka ucapan", width / 2, qrY + metrics.height + 58);

    ctx.fillStyle = "#9f1d45";
    ctx.font = "600 34px " + serif;
    ctx.fillText("dari " + config.fromName, width / 2, qrY + metrics.height + 106);

    ctx.fillStyle = "#8d5a6b";
    ctx.font = "700 26px " + sans;
    ctx.fillText(config.fromTagline, width / 2, qrY + metrics.height + 148);
  }

  window.SumalaQr = {
    isPlaceholder: isPlaceholder,
    drawCode: drawCode,
    drawCard: drawCard
  };
})();
