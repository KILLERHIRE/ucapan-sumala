(function () {
  var cfg = window.SITE_CONFIG;
  var shots = Array.prototype.slice.call(document.querySelectorAll(".shot"));
  var lightbox = document.getElementById("lightbox");
  var lightImg = document.getElementById("light-img");
  var activeIndex = 0;
  var touchStartX = 0;
  var revealsBound = false;

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
    document.getElementById("age").textContent = String(cfg.age);
    document.getElementById("name-line-1").textContent = lines[0];
    document.getElementById("name-line-2").textContent = lines[1] || "";
    document.getElementById("letter-name").textContent = cfg.partnerName + ",";
    document.getElementById("sign-name").textContent = cfg.fromName;
    document.getElementById("sign-tag").textContent = cfg.fromTagline;
  }

  function openGift() {
    document.documentElement.classList.add("is-open", "just-opened");
    try {
      sessionStorage.setItem("sumala-open", "1");
    } catch (err) {}
    document.getElementById("hero-title").focus();
  }

  var HEART_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
  var HEART_COLORS = ["#c22555", "#e25b86", "#9f1d45", "#f07aa0", "#d41f5c"];

  function prefersLessMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function spawnHearts() {
    var sky = document.getElementById("sky");
    var i;
    var heart;
    for (i = 0; i < 14; i += 1) {
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

  function playLoveIntro(done) {
    var intro = document.getElementById("love-intro");
    var count = 56;
    var i;
    var heart;
    var delay;
    var duration;

    if (!intro || prefersLessMotion()) {
      done();
      return;
    }

    for (i = 0; i < count; i += 1) {
      heart = document.createElement("span");
      heart.className = "love-burst";
      heart.innerHTML = HEART_SVG;
      heart.style.left = (Math.random() * 94) + "%";
      heart.style.fontSize = (22 + Math.random() * 46) + "px";
      heart.style.color = HEART_COLORS[i % HEART_COLORS.length];
      if (i < 24) {
        delay = 0;
        heart.style.top = (8 + Math.random() * 78) + "%";
        heart.style.bottom = "auto";
      } else {
        delay = 0.25 + Math.random() * 1.8;
      }
      duration = 3.4 + Math.random() * 1.3;
      heart.style.animationDelay = delay + "s";
      heart.style.animationDuration = duration + "s";
      heart.style.setProperty("--drift", Math.round(-90 + Math.random() * 180) + "px");
      intro.appendChild(heart);
    }

    window.setTimeout(function () {
      intro.classList.add("is-done");
      done();
    }, 3600);
  }

  function watchReveals() {
    var nodes;

    if (revealsBound) return;
    revealsBound = true;
    nodes = document.querySelectorAll(".reveal");

    function showAll() {
      Array.prototype.forEach.call(nodes, function (el) {
        el.classList.add("is-in");
      });
    }

    if (prefersLessMotion() || !("IntersectionObserver" in window)) {
      showAll();
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.18,
      rootMargin: "0px 0px -10% 0px"
    });

    Array.prototype.forEach.call(nodes, function (el) {
      observer.observe(el);
    });
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

  applyCopy();
  bindLightbox();
  playLoveIntro(function () {
    openGift();
    spawnHearts();
    window.requestAnimationFrame(function () {
      watchReveals();
    });
  });

  document.getElementById("open-gift").addEventListener("click", function () {
    openGift();
    watchReveals();
  });
})();
