(() => {
  const shadow = document.querySelector('.shadow');
  const wrapper = document.querySelector('.wrapper');
  const heartsLayer = document.getElementById('hearts');
  const starsLayer = document.getElementById('stars');
  const hint = document.getElementById('hint');
  const hiddenText = document.getElementById('hiddenText');
  const openNotebook = document.getElementById('openNotebook');
  const toggleAudio = document.getElementById('toggleAudio');
  const bgMusic = document.getElementById('bgMusic');
  const writingOverlay = document.getElementById('writingOverlay');
  const overlayHearts = document.getElementById('overlayHearts');
  const closeNotebook = document.getElementById('closeNotebook');

  let inactivityTimer;
  let overlayHeartsTimer;
  let hasTriedAutoplay = false;
  let autoplayRetryTimer;
  let autoplayRetries = 0;

  const playMusic = async () => {
    if (!(bgMusic instanceof HTMLAudioElement)) {
      return;
    }

    try {
      await bgMusic.play();
      if (autoplayRetryTimer) {
        clearInterval(autoplayRetryTimer);
        autoplayRetryTimer = undefined;
      }
      if (toggleAudio) {
        toggleAudio.textContent = 'Pausar musica';
      }
    } catch {
      if (toggleAudio) {
        toggleAudio.textContent = 'Reproducir musica';
      }
    }
  };

  const pauseMusic = () => {
    if (!(bgMusic instanceof HTMLAudioElement)) {
      return;
    }

    bgMusic.pause();
    if (toggleAudio) {
      toggleAudio.textContent = 'Reproducir musica';
    }
  };

  const tryAutoplayNow = () => {
    if (!hasTriedAutoplay) {
      hasTriedAutoplay = true;
      playMusic();
    }
  };

  const startAutoplayRetry = () => {
    if (!(bgMusic instanceof HTMLAudioElement) || autoplayRetryTimer) {
      return;
    }

    autoplayRetryTimer = setInterval(() => {
      autoplayRetries += 1;

      if (!bgMusic.paused) {
        clearInterval(autoplayRetryTimer);
        autoplayRetryTimer = undefined;
        return;
      }

      playMusic();

      if (autoplayRetries >= 20) {
        clearInterval(autoplayRetryTimer);
        autoplayRetryTimer = undefined;
      }
    }, 1000);
  };

  const checkTextReveal = (x, y) => {
    const textRect = hiddenText?.getBoundingClientRect();
    if (!textRect || !hiddenText) {
      return;
    }

    const textCenterX = textRect.left + textRect.width / 2;
    const textCenterY = textRect.top + textRect.height / 2;
    const distance = Math.hypot(x - textCenterX, y - textCenterY);

    const maskX = x - textRect.left;
    const maskY = y - textRect.top;
    const maskGradient = `radial-gradient(circle 180px at ${maskX}px ${maskY}px, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.8) 60%, rgba(0, 0, 0, 0) 100%)`;

    hiddenText.style.maskImage = maskGradient;
    hiddenText.style.webkitMaskImage = maskGradient;

    if (distance < 260) {
      hiddenText.classList.add('revealed');
    } else {
      hiddenText.classList.remove('revealed');
    }
  };

  const setSpot = (x, y) => {
    if (!shadow) {
      return;
    }

    shadow.style.setProperty('--cX', `${(x / window.innerWidth) * 100}%`);
    shadow.style.setProperty('--cY', `${y}px`);

    checkTextReveal(x, y);
  };

  const swayLamp = (x) => {
    if (!wrapper) {
      return;
    }

    const half = window.innerWidth / 2;
    const delta = Math.max(-1, Math.min(1, (x - half) / half));
    wrapper.style.transform = `rotate(${delta * 10}deg)`;
  };

  const onMove = (event) => {
    const point = event.touches?.[0] ?? event;
    const x = point.clientX;
    const y = point.clientY;

    setSpot(x, y);
    swayLamp(x);

    hint?.classList.add('hidden');

    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      hint?.classList.remove('hidden');
    }, 3000);
  };

  const spawnHeart = (targetLayer = heartsLayer) => {
    if (!targetLayer) {
      return;
    }

    const h = document.createElement('div');
    h.className = 'heart';

    const props = {
      '--size': `${Math.random() * 14 + 12}px`,
      '--left': `${Math.random() * 100}%`,
      '--dur': `${Math.random() * 6 + 10}s`,
      '--dx': `${(Math.random() * 2 - 1) * 120}px`,
      '--op': `${Math.random() * 0.4 + 0.6}`,
      '--scale': `${Math.random() * 0.6 + 0.8}`
    };

    Object.entries(props).forEach(([key, value]) => {
      h.style.setProperty(key, value);
    });

    h.addEventListener('animationend', () => h.remove());
    targetLayer.appendChild(h);
  };

  const startOverlayHearts = () => {
    if (!overlayHearts || overlayHeartsTimer) {
      return;
    }

    for (let i = 0; i < 14; i += 1) {
      setTimeout(() => spawnHeart(overlayHearts), i * 110);
    }

    overlayHeartsTimer = setInterval(() => {
      spawnHeart(overlayHearts);
    }, 550);
  };

  const stopOverlayHearts = () => {
    if (overlayHeartsTimer) {
      clearInterval(overlayHeartsTimer);
      overlayHeartsTimer = undefined;
    }

    overlayHearts?.replaceChildren();
  };

  const spawnStar = () => {
    if (!starsLayer) {
      return;
    }

    const s = document.createElement('div');
    s.className = 'star';

    const props = {
      '--left': `${Math.random() * 100}%`,
      '--top': `${Math.random() * 100}%`,
      '--size': `${Math.random() * 1.5 + 0.5}px`,
      '--delay': `${Math.random() * 3}s`
    };

    Object.entries(props).forEach(([key, value]) => {
      s.style.setProperty(key, value);
    });

    s.addEventListener('animationend', () => s.remove());
    starsLayer.appendChild(s);
  };

  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: true });

  for (let i = 0; i < 22; i += 1) {
    setTimeout(spawnHeart, i * 120);
  }

  for (let i = 0; i < 15; i += 1) {
    setTimeout(spawnStar, i * 200);
  }

  setInterval(spawnHeart, 700);
  setInterval(spawnStar, 2000);

  tryAutoplayNow();
  startAutoplayRetry();

  window.addEventListener('load', () => {
    setSpot(window.innerWidth / 2, 260);
  });

  bgMusic?.addEventListener('canplay', () => {
    tryAutoplayNow();
    startAutoplayRetry();
  }, { once: true });

  openNotebook?.addEventListener('click', () => {
    if (!hasTriedAutoplay) {
      hasTriedAutoplay = true;
      playMusic();
    }

    writingOverlay?.classList.add('open');
    writingOverlay?.setAttribute('aria-hidden', 'false');
    startOverlayHearts();
  });

  toggleAudio?.addEventListener('click', () => {
    if (!(bgMusic instanceof HTMLAudioElement)) {
      return;
    }

    if (bgMusic.paused) {
      playMusic();
    } else {
      pauseMusic();
    }
  });

  closeNotebook?.addEventListener('click', () => {
    writingOverlay?.classList.remove('open');
    writingOverlay?.setAttribute('aria-hidden', 'true');
    stopOverlayHearts();
  });

  writingOverlay?.addEventListener('click', (event) => {
    if (event.target === writingOverlay) {
      writingOverlay.classList.remove('open');
      writingOverlay.setAttribute('aria-hidden', 'true');
      stopOverlayHearts();
    }
  });
})();
