(function () {
  var cfg = window.SITE_CONFIG;
  var shots = Array.prototype.slice.call(document.querySelectorAll(".shot"));
  var scroller = document.getElementById("scroller");
  var lightbox = document.getElementById("lightbox");
  var lightImg = document.getElementById("light-img");
  var activeIndex = 0;
  var timer = 0;
  var touchStartX = 0;

  function nameLines(name) {
    var full = name.indexOf("♥") >= 0 ? name : name + " ♥";
    var marker = "Ayang beb ";
    if (full.indexOf(marker) === 0) {
      return ["Ayang beb", full.slice(marker.length)];
    }
    return [full, ""];
  }

  function applyCopy() {
    var lines = nameLines(cfg.partnerName);
    document.getElementById("birthday-label").textContent = cfg.birthdayLabel;
    document.getElementById("countdown-date").textContent = cfg.birthdayLabel;
    document.getElementById("age").textContent = String(cfg.age);
    document.getElementById("name-line-1").textContent = lines[0];
    document.getElementById("name-line-2").textContent = lines[1] || "";
    document.getElementById("letter-name").textContent = cfg.partnerName + ",";
    document.getElementById("sign-name").textContent = cfg.fromName;
    document.getElementById("sign-tag").textContent = cfg.fromTagline;
    document.getElementById("arrived").textContent = "Hari ini milikmu. Selamat ulang tahun ke-" + cfg.age + ".";
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function renderCountdown(now) {
    var target = new Date(cfg.birthdayIso).getTime();
    var diff = target - now;
    var countdown = document.getElementById("countdown");
    var arrived = document.getElementById("arrived");
    var dayMs = 24 * 60 * 60 * 1000;

    if (diff <= 0) {
      countdown.hidden = true;
      arrived.hidden = false;
      window.clearInterval(timer);
      return;
    }

    countdown.hidden = false;
    arrived.hidden = true;
    document.getElementById("days").textContent = String(Math.floor(diff / dayMs));
    document.getElementById("hours").textContent = pad(Math.floor(diff / (60 * 60 * 1000)) % 24);
    document.getElementById("minutes").textContent = pad(Math.floor(diff / (60 * 1000)) % 60);
    document.getElementById("seconds").textContent = pad(Math.floor(diff / 1000) % 60);
  }

  function currentNow() {
    if (new URLSearchParams(window.location.search).get("preview") === "hari") {
      return new Date(cfg.birthdayIso).getTime() + 1000;
    }
    return Date.now();
  }

  function openGift() {
    document.documentElement.classList.add("is-open", "just-opened");
    try {
      sessionStorage.setItem("sumala-open", "1");
    } catch (err) {}
    document.getElementById("hero-title").focus();
  }

  function spawnHearts() {
    var sky = document.getElementById("sky");
    var i;
    var heart;
    for (i = 0; i < 12; i += 1) {
      heart = document.createElement("span");
      heart.className = "floater";
      heart.textContent = "♥";
      heart.style.left = (Math.random() * 100) + "%";
      heart.style.fontSize = (12 + Math.random() * 18) + "px";
      heart.style.animationDuration = (11 + Math.random() * 10) + "s";
      heart.style.animationDelay = (-Math.random() * 16) + "s";
      sky.appendChild(heart);
    }
  }

  function scrollToIndex(index) {
    var card = shots[index] && shots[index].closest(".polaroid");
    if (!card) return;
    scroller.scrollTo({
      left: card.offsetLeft - (scroller.clientWidth - card.offsetWidth) / 2,
      behavior: "smooth"
    });
  }

  function setDots(index) {
    var dots = document.querySelectorAll(".dot");
    Array.prototype.forEach.call(dots, function (dot, dotIndex) {
      if (dotIndex === index) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  }

  function buildDots() {
    var wrap = document.getElementById("dots");
    shots.forEach(function (shot, index) {
      var dot = document.createElement("button");
      dot.className = "dot";
      dot.type = "button";
      dot.setAttribute("aria-label", "Lihat foto " + (index + 1));
      dot.addEventListener("click", function () {
        scrollToIndex(index);
      });
      wrap.appendChild(dot);
    });
    setDots(0);
  }

  function watchGallery() {
    var frame = 0;
    function visibleWidth(card) {
      var scrollerRect = scroller.getBoundingClientRect();
      var rect = card.getBoundingClientRect();
      var left = Math.max(rect.left, scrollerRect.left);
      var right = Math.min(rect.right, scrollerRect.right);
      return Math.max(0, right - left);
    }

    function updateActive() {
      var best = 0;
      var bestVisible = -1;
      shots.forEach(function (shot, index) {
        var visible = visibleWidth(shot.closest(".polaroid"));
        if (visible > bestVisible + 1) {
          bestVisible = visible;
          best = index;
        }
      });
      activeIndex = best;
      setDots(best);
    }
    scroller.addEventListener("scroll", function () {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateActive);
    }, { passive: true });
    updateActive();
  }

  function showPhoto(index) {
    var total = shots.length;
    activeIndex = (index + total) % total;
    var img = shots[activeIndex].querySelector("img");
    lightImg.src = img.src;
    lightImg.alt = img.alt;
    if (!lightbox.open) lightbox.showModal();
  }

  function bindLightbox() {
    shots.forEach(function (shot) {
      shot.addEventListener("click", function () {
        showPhoto(Number(shot.getAttribute("data-index")));
      });
    });
    document.getElementById("light-close").addEventListener("click", function () {
      lightbox.close();
    });
    document.getElementById("light-prev").addEventListener("click", function () {
      showPhoto(activeIndex - 1);
    });
    document.getElementById("light-next").addEventListener("click", function () {
      showPhoto(activeIndex + 1);
    });
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) lightbox.close();
    });
    lightbox.addEventListener("touchstart", function (event) {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener("touchend", function (event) {
      var delta = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) < 40) return;
      showPhoto(activeIndex + (delta < 0 ? 1 : -1));
    }, { passive: true });
    document.addEventListener("keydown", function (event) {
      if (!lightbox.open) return;
      if (event.key === "ArrowRight") showPhoto(activeIndex + 1);
      if (event.key === "ArrowLeft") showPhoto(activeIndex - 1);
    });
  }

  function paintQr() {
    var note = document.getElementById("url-note");
    note.hidden = !window.SumalaQr.isPlaceholder(cfg.siteUrl);
    window.SumalaQr.drawCode(document.getElementById("qr-canvas"), cfg.siteUrl);
  }

  applyCopy();
  spawnHearts();
  buildDots();
  scroller.scrollLeft = 0;
  watchGallery();
  bindLightbox();
  paintQr();
  renderCountdown(currentNow());
  timer = window.setInterval(function () {
    renderCountdown(currentNow());
  }, 1000);

  document.getElementById("open-gift").addEventListener("click", openGift);
  document.getElementById("gal-prev").addEventListener("click", function () {
    scrollToIndex(Math.max(0, activeIndex - 1));
  });
  document.getElementById("gal-next").addEventListener("click", function () {
    scrollToIndex(Math.min(shots.length - 1, activeIndex + 1));
  });
})();
