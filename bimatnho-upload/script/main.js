(() => {
  'use strict';

  const C = window.CARD;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PALETTE = ['#f7a1c0', '#ffd1dc', '#d9c8ff', '#ffe08a', '#c9f0e1', '#ffffff', '#e0608f'];

  // ---------- Tuổi & ngày (lấy lần sinh nhật gần hôm nay nhất) ----------
  const [by, bm, bd] = C.birthday.split('-').map(Number);
  const now = new Date();
  const bdate = [-1, 0, 1]
    .map(k => new Date(now.getFullYear() + k, bm - 1, bd))
    .reduce((a, b) => (Math.abs(b - now) < Math.abs(a - now) ? b : a));
  const age = bdate.getFullYear() - by;
  const pad = n => String(n).padStart(2, '0');
  const dateStr = `${pad(bd)} · ${pad(bm)} · ${bdate.getFullYear()}`;
  const ordinal = n => {
    const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  const VARS = { name: C.name, fullName: C.fullName, sender: C.sender, age, ageth: ordinal(age), date: dateStr };
  const f = s => String(s ?? '').replace(/\{(\w+)\}/g, (m, k) => (k in VARS ? VARS[k] : m));
  const plain = s => s.replace(/<[^>]+>/g, '');
  const readTime = s => gsap.utils.clamp(2.6, 6.5, 2.2 + plain(s).length * 0.05);

  // ---------- Tách chữ thành từng ký tự (an toàn với emoji & dấu tiếng Việt) ----------
  const seg = window.Intl && Intl.Segmenter ? new Intl.Segmenter('vi', { granularity: 'grapheme' }) : null;
  const graphemes = s => (seg ? Array.from(seg.segment(s), x => x.segment) : Array.from(s));
  function splitChars(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
        const w = document.createElement('span');
        w.className = 'w';
        graphemes(part).forEach(g => {
          const c = document.createElement('span');
          c.className = 'ch';
          c.textContent = g;
          w.appendChild(c);
        });
        frag.appendChild(w);
      });
      node.replaceWith(frag);
    });
    return $$('.ch', el);
  }
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };

  // ---------- Điều phối cảnh: chạy tuần tự, tua nhanh, xem lại ----------
  const ABORT = Symbol('abort');
  let cur = null;    // timeline đang chạy
  let waiter = null; // đang chờ người xem làm gì đó (thổi nến, trả lời)

  function play(tl) {
    return new Promise((res, rej) => {
      cur = { tl, rej };
      tl.eventCallback('onComplete', () => { cur = null; res(); });
    });
  }
  const hold = sec => play(gsap.timeline().to({}, { duration: sec }));
  const leave = s => play(gsap.timeline().to(s, { autoAlpha: 0, y: -24, filter: 'blur(6px)', duration: 0.7, ease: 'power2.in' }));

  function skip() {
    if (waiter) { waiter.onSkip && waiter.onSkip(); return; }
    if (cur) cur.tl.progress(1);
  }
  function abort() {
    const c = cur, w = waiter;
    cur = waiter = null;
    if (c) { c.tl.kill(); c.rej(ABORT); }
    if (w) w.rej(ABORT);
  }

  // ---------- Nhạc ----------
  const audio = new Audio();
  audio.preload = 'auto';
  let musicStart = C.music.start || 0;
  let musicEnd = C.music.end || 0;
  audio.loop = !musicEnd;
  let started = false;
  // Tự vòng lại đoạn đã cắt thay vì phát lại từ giây 0
  const rewind = () => { audio.currentTime = musicStart; audio.play().catch(() => {}); };
  audio.addEventListener('timeupdate', () => { if (musicEnd && audio.currentTime >= musicEnd) rewind(); });
  audio.addEventListener('ended', () => { if (musicEnd) rewind(); });
  audio.addEventListener('error', () => {
    if (C.music.fallback && !audio.src.endsWith(C.music.fallback)) {
      musicStart = musicEnd = 0;
      audio.loop = true;
      audio.src = C.music.fallback;
      if (started) audio.play().catch(() => {});
    }
  });
  audio.addEventListener('loadedmetadata', () => {
    if (musicStart && audio.currentTime < musicStart) audio.currentTime = musicStart;
  });
  audio.src = C.music.src;

  function startMusic() {
    started = true;
    try { audio.currentTime = musicStart; } catch (e) { /* chưa tải xong, loadedmetadata sẽ lo */ }
    audio.volume = 0;
    audio.play().catch(() => {});
    gsap.to(audio, { volume: C.music.volume ?? 0.85, duration: 2.5 });
  }
  const muteBtn = $('#btn-mute');
  muteBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    muteBtn.textContent = audio.muted ? '🔇' : '🔊';
    if (!audio.muted && started) audio.play().catch(() => {});
  });
  document.addEventListener('visibilitychange', () => {
    if (!started) return;
    if (document.hidden) audio.pause();
    else if (!audio.muted) audio.play().catch(() => {});
  });

  // ---------- Hiệu ứng ----------
  const burst = opts => window.confetti && confetti({ colors: PALETTE, disableForReducedMotion: true, ...opts });
  function bigConfetti() {
    burst({ particleCount: 120, spread: 90, startVelocity: 45, origin: { y: 0.6 } });
    setTimeout(() => {
      burst({ particleCount: 70, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } });
      burst({ particleCount: 70, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } });
    }, 250);
  }
  function heartRain(ms = 2600) {
    if (!window.confetti) return;
    const shapes = confetti.shapeFromText
      ? ['💗', '💖', '🤍', '🌸'].map(text => confetti.shapeFromText({ text, scalar: 2 }))
      : undefined;
    const end = Date.now() + ms;
    let n = 0;
    (function frame() {
      if (n++ % 3 === 0) confetti({ particleCount: 2, spread: 70, startVelocity: 30, origin: { x: Math.random(), y: -0.05 }, angle: 270,
        gravity: 0.7, scalar: shapes ? 2 : 1, shapes, colors: PALETTE, disableForReducedMotion: true });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  function startFloaties() {
    if (reduceMotion) return;
    const box = $('#floaties');
    const items = ['🤍', '💗', '🌸', '✨', '🫧', '💕'];
    setInterval(() => {
      if (document.hidden || box.childElementCount > 14) return;
      const d = el('div', 'floaty', items[Math.floor(Math.random() * items.length)]);
      const dur = gsap.utils.random(7, 11);
      d.style.left = gsap.utils.random(0, 96) + 'vw';
      d.style.fontSize = gsap.utils.random(14, 28) + 'px';
      d.style.animationDuration = dur + 's';
      d.style.setProperty('--sway', gsap.utils.random(-60, 60) + 'px');
      d.style.setProperty('--spin', gsap.utils.random(-60, 60) + 'deg');
      box.appendChild(d);
      setTimeout(() => d.remove(), dur * 1000);
    }, 1300);
  }

  // ---------- Micro (thổi nến) ----------
  let mic = null;
  async function startMic(onLevel) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('no-mic');
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
    });
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    await ctx.resume();
    const an = ctx.createAnalyser();
    an.fftSize = 1024;
    ctx.createMediaStreamSource(stream).connect(an);
    const buf = new Float32Array(an.fftSize);
    let raf;
    const loop = () => {
      an.getFloatTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
      onLevel(Math.sqrt(sum / buf.length));
      raf = requestAnimationFrame(loop);
    };
    loop();
    mic = { stop() { cancelAnimationFrame(raf); stream.getTracks().forEach(t => t.stop()); ctx.close(); } };
  }
  function stopMic() {
    if (!mic) return;
    mic.stop();
    mic = null;
    // iOS có thể tạm ngắt nhạc khi dùng micro, phát lại cho chắc
    if (started && !audio.muted) audio.play().catch(() => {});
  }

  // ---------- Dựng HTML các cảnh từ config ----------
  const stage = $('#stage');
  const DRIP_H = [18, 32, 22, 38, 20, 28, 16, 34, 24, 30, 19, 36, 23];
  const drips = n => Array.from({ length: n }, (_, k) => `<i style="--h:${DRIP_H[k % DRIP_H.length]}px"></i>`).join('');
  function render() {
    const digits = String(age).split('');
    stage.innerHTML = `
      <section class="scene" id="s-intro">
        <h1 class="hi">${f(C.intro.hi)}</h1>
        <p class="hi-sub">${f(C.intro.sub)}</p>
      </section>

      <section class="scene" id="s-bday">
        <p class="bday-date">${f(C.intro.date)}</p>
        <h1 class="bday-title">${f(C.intro.birthday)}</h1>
        <p class="bday-age script">${f(C.intro.age)}</p>
      </section>

      <section class="scene" id="s-chat">
        <div class="phone">
          <header class="phone-head">
            <div class="avatar">${f(C.sender).charAt(0)}</div>
            <div><b>${f(C.sender)}</b><small>● online</small></div>
          </header>
          <div class="thread"></div>
        </div>
      </section>

      <section class="scene" id="s-lines">
        ${C.lines.map(l => `<p class="line">${f(l)}</p>`).join('')}
        <div class="special">
          <p class="sp-pre">${f(C.special.pre)}</p>
          <p class="sp-word script">${f(C.special.word)}</p>
          <p class="sp-smile">:)</p>
        </div>
      </section>

      <section class="scene" id="s-photos">
        <p class="photos-title script">${f(C.photosTitle)}</p>
        <div class="stack">
          ${C.photos.map(p => `
            <figure class="polaroid">
              <img src="${p.src}" alt="" draggable="false">
              <figcaption>${f(p.caption)}</figcaption>
            </figure>`).join('')}
        </div>
      </section>

      <section class="scene" id="s-cake">
        <div class="cake-head">
          <h2 class="cake-title">${f(C.cake.title)}</h2>
          <h2 class="cake-hbd">${f(C.cake.done)}</h2>
        </div>
        <div class="cake-dim"></div>
        <div class="cake">
          <div class="cake-glow"></div>
          <div class="candles">
            ${digits.map(d => `
              <button class="candle" aria-label="Thổi nến">
                <span class="wick"></span>
                <div class="flame"><div class="halo"></div><div class="flame-core"></div></div>
                <span class="digit">${d}</span>
              </button>`).join('')}
          </div>
          <i class="berry b1"></i><i class="berry b2"></i><i class="berry b3"></i><i class="berry b4"></i>
          <div class="rosettes r-top">${'<span></span>'.repeat(8)}</div>
          <div class="tier tier-top">
            <div class="drip">${drips(9)}</div>
            <div class="pearls"></div>
          </div>
          <div class="rosettes r-bottom">${'<span></span>'.repeat(11)}</div>
          <div class="tier tier-bottom">
            <div class="drip">${drips(13)}</div>
            <div class="sprinkles"></div>
            <div class="pearls"></div>
          </div>
          <div class="stand"><div class="stand-plate"></div><div class="stand-stem"></div><div class="stand-base"></div></div>
        </div>
        <p class="cake-hint">${f(C.cake.hint)}</p>
        <div class="cake-actions">
          <button class="btn btn-primary mic-btn">${f(C.cake.micButton)}</button>
          <small>${f(C.cake.tapHint)}</small>
        </div>
        <p class="cake-after">${f(C.cake.after)}</p>
      </section>

      <section class="scene" id="s-wish">
        <div class="note-wrap">
          <div class="note-photo"><span class="tape"></span><img src="${C.wishPhoto}" alt=""></div>
          <div class="note">${C.wish.map(p => `<p>${f(p)}</p>`).join('')}</div>
        </div>
      </section>

      <section class="scene" id="s-invite">
        <p class="inv-pre">${f(C.invite.pre)}</p>
        <div class="inv-card">
          <div class="inv-emoji">🍰</div>
          <p class="inv-q">${f(C.invite.question)}</p>
          <div class="inv-btns">
            <button class="btn btn-primary btn-yes">${f(C.invite.yes)}</button>
            <button class="btn btn-soft btn-no">${f(C.invite.no)}</button>
          </div>
        </div>
        <div class="yay-wrap">
          <h2 class="yay-title">${f(C.invite.yayTitle)}</h2>
          <p class="yay-sub">${f(C.invite.yaySub)}</p>
          <div class="yay-actions">
            <a class="btn btn-primary btn-dm" href="${C.instagramDM}" target="_blank" rel="noopener">${f(C.invite.dmButton)}</a>
            <button class="btn btn-soft btn-again">${f(C.invite.replayButton)}</button>
          </div>
        </div>
      </section>`;
    $('.btn-again', stage).addEventListener('click', replay);
  }

  // ---------- Các cảnh ----------
  async function sceneIntro() {
    const s = $('#s-intro');
    const chars = splitChars($('.hi', s));
    await play(gsap.timeline()
      .set(s, { autoAlpha: 1 })
      .from(chars, { autoAlpha: 0, y: 40, rotation: -12, scale: 0.6, duration: 0.9, ease: 'back.out(2)', stagger: 0.07 })
      .from($('.hi-sub', s), { autoAlpha: 0, y: 14, duration: 0.8 }, '-=0.3'));
    await hold(3.2);
    await leave(s);

    const b = $('#s-bday');
    const title = splitChars($('.bday-title', b));
    await play(gsap.timeline()
      .set(b, { autoAlpha: 1 })
      .from($('.bday-date', b), { autoAlpha: 0, letterSpacing: '1em', duration: 1.1, ease: 'power2.out' })
      .from(title, { autoAlpha: 0, y: -70, rotation: () => gsap.utils.random(-30, 30), duration: 0.9, ease: 'bounce.out', stagger: 0.045 }, '-=0.5')
      .from($('.bday-age', b), { autoAlpha: 0, scale: 0.3, duration: 0.9, ease: 'elastic.out(1, 0.5)' })
      .call(() => burst({ particleCount: 70, spread: 75, origin: { y: 0.62 } })));
    await hold(3.6);
    await leave(b);
  }

  async function sceneChat() {
    const s = $('#s-chat');
    const thread = $('.thread', s);
    await play(gsap.timeline()
      .set(s, { autoAlpha: 1 })
      .from($('.phone', s), { autoAlpha: 0, y: 60, scale: 0.85, duration: 0.8, ease: 'back.out(1.6)' }));
    for (const raw of C.chat) {
      const text = f(raw);
      const typing = el('div', 'bubble typing', '<i></i><i></i><i></i>');
      thread.appendChild(typing);
      await play(gsap.timeline()
        .from(typing, { autoAlpha: 0, scale: 0.5, transformOrigin: '100% 100%', duration: 0.3 })
        .to({}, { duration: Math.min(1.9, 0.8 + plain(text).length * 0.014) }));
      const msg = el('div', 'bubble', text);
      typing.replaceWith(msg);
      await play(gsap.timeline().from(msg, { autoAlpha: 0, scale: 0.6, transformOrigin: '100% 100%', duration: 0.45, ease: 'back.out(2)' }));
      await hold(readTime(text) * 0.6);
    }
    const seen = el('div', 'seen', f(C.chatSeen));
    thread.appendChild(seen);
    await play(gsap.timeline().from(seen, { autoAlpha: 0, duration: 0.4 }));
    await hold(2.2);
    await leave(s);
  }

  async function sceneLines() {
    const s = $('#s-lines');
    gsap.set(s, { autoAlpha: 1 });
    for (const line of $$('.line', s)) {
      const text = line.textContent;
      const chars = splitChars(line);
      await play(gsap.timeline()
        .set(line, { autoAlpha: 1 })
        .from(line, { filter: 'blur(8px)', duration: 0.8 })
        .from(chars, { autoAlpha: 0, y: 16, rotationX: -70, duration: 0.5, stagger: 0.022, ease: 'power2.out' }, 0));
      await hold(readTime(text));
      await play(gsap.timeline().to(line, { autoAlpha: 0, y: -20, skewX: -8, filter: 'blur(8px)', duration: 0.6, ease: 'power2.in' }));
    }
    const sp = $('.special', s);
    const word = splitChars($('.sp-word', sp));
    const smile = $('.sp-smile', sp);
    await play(gsap.timeline()
      .set(sp, { autoAlpha: 1 })
      .from($('.sp-pre', sp), { autoAlpha: 0, y: 12, duration: 0.7 })
      .from(word, { autoAlpha: 0, y: -50, rotation: 150, skewX: 30, duration: 0.8, ease: 'elastic.out(1, 0.5)', stagger: 0.09 })
      .call(() => burst({ particleCount: 40, spread: 100, scalar: 0.7, origin: { y: 0.5 } }))
      .from(smile, { autoAlpha: 0, duration: 0.4 }, '+=0.3')
      .to(smile, { rotation: 90, duration: 0.6, ease: 'back.out(3)' }, '+=0.7'));
    await hold(2.8);
    await leave(s);
  }

  async function scenePhotos() {
    const s = $('#s-photos');
    const cards = $$('.polaroid', s);
    const rest = cards.map(() => ({ r: gsap.utils.random(-9, 9), x: gsap.utils.random(-14, 14) }));
    cards.forEach((c, i) => gsap.set(c, { zIndex: i + 1, rotation: rest[i].r, x: rest[i].x }));

    const tl = gsap.timeline()
      .set(s, { autoAlpha: 1 })
      .from($('.photos-title', s), { autoAlpha: 0, y: -16, duration: 0.7 });
    cards.forEach((c, i) => tl.fromTo(c,
      { autoAlpha: 1, y: -innerHeight, rotation: rest[i].r + gsap.utils.random(-50, 50) },
      { y: 0, rotation: rest[i].r, duration: 1, ease: 'power3.out' }, i ? '-=0.45' : '+=0.1'));
    await play(tl);

    // Lần lượt rút tấm trên cùng xuống dưới để xem hết từng tấm
    const order = cards.slice();
    for (let k = 0; k < cards.length; k++) {
      await hold(2.5);
      const top = order[order.length - 1];
      const i = cards.indexOf(top);
      await play(gsap.timeline()
        .to(top, { x: Math.min(innerWidth * 0.55, 320), rotation: rest[i].r + 14, duration: 0.5, ease: 'power2.in' })
        .call(() => { order.unshift(order.pop()); order.forEach((c, j) => gsap.set(c, { zIndex: j + 1 })); })
        .to(top, { x: rest[i].x, rotation: rest[i].r, duration: 0.55, ease: 'power2.out' }));
    }
    await hold(1.4);
    await leave(s);
  }

  function blowCandles(s) {
    const candles = $$('.candle', s);
    const life = candles.map(() => 1);
    const power = candles.map(() => gsap.utils.random(0.5, 0.9));
    let left = candles.length;
    const BLOW = 0.11; // ngưỡng âm lượng tính là "đang thổi"

    return new Promise((res, rej) => {
      const out = i => {
        if (life[i] === -1) return;
        life[i] = -1;
        const c = candles[i];
        gsap.to($('.flame', c), { scale: 0, autoAlpha: 0, duration: 0.25 });
        gsap.to($('.cake-glow', s), { autoAlpha: (left - 1) / candles.length, duration: 0.4 });
        for (let k = 0; k < 4; k++) {
          const p = el('div', 'smoke');
          c.appendChild(p);
          gsap.fromTo(p, { autoAlpha: 0.8, y: 0, x: 0, scale: 0.6 },
            { autoAlpha: 0, y: -70 - k * 12, x: gsap.utils.random(-14, 14), scale: 2.4, duration: 1.4, delay: k * 0.12, ease: 'power1.out', onComplete: () => p.remove() });
        }
        if (--left === 0) {
          waiter = null;
          setTimeout(res, 700);
        }
      };
      candles.forEach((c, i) => c.addEventListener('click', () => out(i)));
      waiter = { rej, onSkip: () => candles.forEach((_, i) => out(i)) };

      const micBtn = $('.mic-btn', s);
      const hint = $('.cake-hint', s);
      micBtn.addEventListener('click', async () => {
        micBtn.disabled = true;
        try {
          await startMic(level => {
            const push = Math.max(0, level - BLOW);
            candles.forEach((c, i) => {
              if (life[i] === -1) return;
              gsap.to($('.flame', c), { skewX: -Math.min(35, push * 160), scaleY: 1 - Math.min(0.5, push * 3), duration: 0.12 });
              life[i] -= push * power[i];
              if (life[i] <= 0) out(i);
            });
          });
          hint.textContent = f(C.cake.listening);
        } catch (e) {
          hint.textContent = f(C.cake.micFail);
          micBtn.style.display = 'none';
        }
      });
    });
  }

  async function sceneCake() {
    const s = $('#s-cake');
    await play(gsap.timeline()
      .set(s, { autoAlpha: 1 })
      .from($('.cake-title', s), { autoAlpha: 0, y: -14, duration: 0.6 })
      .from($('.cake', s), { autoAlpha: 0, y: 80, duration: 0.8, ease: 'back.out(1.4)' }, '-=0.2')
      .from($$('.berry, .rosettes span', s), { autoAlpha: 0, scale: 0, y: -20, duration: 0.35, ease: 'back.out(3)', stagger: 0.02 }, '-=0.2')
      .from($$('.candle', s), { autoAlpha: 0, y: -140, duration: 0.7, ease: 'bounce.out', stagger: 0.15 })
      // tắt đèn, thắp nến
      .call(() => s.classList.add('lights-off'))
      .to($('.cake-dim', s), { autoAlpha: 1, duration: 1 })
      .from($$('.flame', s), { scale: 0, duration: 0.5, ease: 'back.out(3)', stagger: 0.25 }, '-=0.4')
      .from($('.cake-glow', s), { autoAlpha: 0, scale: 0.5, duration: 0.8 }, '<')
      .from($$('.cake-hint, .cake-actions', s), { autoAlpha: 0, y: 10, duration: 0.5, stagger: 0.1 }));

    await blowCandles(s);
    stopMic();

    const hbd = $('.cake-hbd', s);
    const chars = splitChars(hbd);
    await play(gsap.timeline()
      .to($$('.cake-hint, .cake-actions, .cake-title', s), { autoAlpha: 0, duration: 0.4 })
      // bật đèn lại
      .call(() => s.classList.remove('lights-off'))
      .to($('.cake-dim', s), { autoAlpha: 0, duration: 0.6 }, '<')
      .call(bigConfetti)
      .set(hbd, { autoAlpha: 1 })
      .from(chars, { autoAlpha: 0, y: -50, rotation: 150, skewX: 30, duration: 0.7, ease: 'elastic.out(1, 0.5)', stagger: 0.06 })
      .to(chars, { scale: 1.3, rotationY: 180, duration: 0.45, stagger: 0.05 })
      .to(chars, { scale: 1, rotationY: 0, color: '#e0608f', duration: 0.45, ease: 'expo.out', stagger: 0.05 })
      .to($('.cake-after', s), { autoAlpha: 1, duration: 0.6 }, '-=0.6'));
    await hold(3.6);
    await leave(s);
  }

  async function sceneWish() {
    const s = $('#s-wish');
    const note = $('.note', s);
    const paras = $$('p', note);
    const words = plain(note.textContent).split(/\s+/).length;
    await play(gsap.timeline()
      .set(s, { autoAlpha: 1 })
      .from(note, { autoAlpha: 0, y: 120, rotation: 6, duration: 0.9, ease: 'power3.out' })
      .from($('.note-photo', s), { autoAlpha: 0, y: -220, rotation: -40, duration: 0.8, ease: 'back.out(1.4)' }, '-=0.3')
      .from($('.tape', s), { scaleX: 0, duration: 0.3 })
      .from(paras, { autoAlpha: 0, y: 10, duration: 0.8, stagger: 1.3 }, '-=0.1'));
    await hold(gsap.utils.clamp(6, 14, words * 0.22));
    await leave(s);
  }

  async function sceneInvite() {
    $('#btn-skip').hidden = true;
    const s = $('#s-invite');
    const pre = $('.inv-pre', s);
    const card = $('.inv-card', s);
    gsap.set(s, { autoAlpha: 1 });
    await play(gsap.timeline().from(pre, { autoAlpha: 0, y: 10, duration: 0.7 }));
    await hold(2.4);
    await play(gsap.timeline()
      .to(pre, { autoAlpha: 0, duration: 0.5 })
      .fromTo(card, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'back.out(1.8)' }));

    await new Promise((res, rej) => {
      waiter = { rej };
      const done = () => { waiter = null; res(); };
      const yes = $('.btn-yes', s);
      const no = $('.btn-no', s);
      const texts = C.invite.noTexts.map(f);
      let dodges = 0, yesScale = 1, armedAt = Infinity, lastDodge = 0;

      const dodge = e => {
        if (dodges > texts.length) return;
        if (Date.now() - lastDodge < 350) { e.preventDefault(); return; }
        lastDodge = Date.now();
        if (dodges === texts.length) { // hết đường chạy -> chịu thua
          dodges++;
          no.textContent = f(C.invite.giveUp);
          no.classList.replace('btn-soft', 'btn-primary');
          armedAt = Date.now() + 450;
          return;
        }
        e.preventDefault();
        if (!no.classList.contains('roaming')) {
          // đưa ra body để position: fixed không bị ảnh hưởng bởi transform của thẻ cha
          const r = no.getBoundingClientRect();
          no.classList.add('roaming');
          Object.assign(no.style, { left: r.left + 'px', top: r.top + 'px' });
          document.body.appendChild(no);
        }
        no.textContent = texts[dodges++];
        const r = no.getBoundingClientRect();
        const m = 16;
        gsap.to(no, {
          left: gsap.utils.random(m, Math.max(m, innerWidth - r.width - m)),
          top: gsap.utils.random(70, Math.max(70, innerHeight - r.height - m)),
          rotation: gsap.utils.random(-12, 12),
          duration: 0.35, ease: 'power3.out'
        });
        yesScale = Math.min(1.7, yesScale + 0.11);
        gsap.to(yes, { scale: yesScale, duration: 0.4, ease: 'back.out(3)' });
      };

      yes.addEventListener('click', done);
      no.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') dodge(e); });
      no.addEventListener('pointerdown', dodge);
      no.addEventListener('click', () => { if (Date.now() > armedAt) done(); });
    });

    $$('.btn-no.roaming').forEach(b => gsap.to(b, { autoAlpha: 0, scale: 0.4, duration: 0.3, onComplete: () => b.remove() }));
    heartRain();
    const yay = $('.yay-wrap', s);
    await play(gsap.timeline()
      .to(card, { autoAlpha: 0, scale: 0.9, duration: 0.45 })
      .set(yay, { autoAlpha: 1 })
      .from($('.yay-title', yay), { autoAlpha: 0, scale: 0.4, duration: 0.9, ease: 'elastic.out(1, 0.5)' })
      .from($$('.yay-sub, .yay-actions', yay), { autoAlpha: 0, y: 12, duration: 0.6, stagger: 0.15 }));
  }

  const SCENES = [sceneIntro, sceneChat, sceneLines, scenePhotos, sceneCake, sceneWish, sceneInvite];
  // Xem thử một cảnh: thêm ?scene=photos (intro, chat, lines, photos, cake, wish, invite) vào cuối link
  const SCENE_NAMES = ['intro', 'chat', 'lines', 'photos', 'cake', 'wish', 'invite'];
  const jumpTo = Math.max(0, SCENE_NAMES.indexOf(new URLSearchParams(location.search).get('scene')));

  async function run(from = 0) {
    render();
    $('#btn-skip').hidden = false;
    try {
      for (const scene of SCENES.slice(from)) await scene();
    } catch (e) {
      if (e !== ABORT) console.error(e);
    }
  }

  function replay() {
    abort();
    stopMic();
    $$('.btn-no.roaming').forEach(b => b.remove());
    if (window.confetti && confetti.reset) confetti.reset();
    if (started) {
      try { audio.currentTime = musicStart; } catch (e) { /* bỏ qua */ }
      if (!audio.muted) audio.play().catch(() => {});
    }
    run();
  }

  // ---------- Mở quà ----------
  function openGift() {
    const gift = $('#gift');
    if (gift.classList.contains('opened')) return;
    gift.classList.add('opened');
    startMusic();
    const r = gift.getBoundingClientRect();
    const origin = { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight };
    gsap.timeline()
      .to(gift, { rotation: -6, duration: 0.08, yoyo: true, repeat: 5, ease: 'none' })
      .set(gift, { rotation: 0 })
      .to('.gift-lid', { y: -190, x: 70, rotation: 38, autoAlpha: 0, duration: 0.9, ease: 'power2.out' })
      .to('.gift-rays', { autoAlpha: 1, scale: 1.2, rotation: 40, duration: 1.2, ease: 'power2.out' }, '<')
      .call(() => burst({ particleCount: 140, spread: 100, startVelocity: 40, origin }), null, '<0.1')
      .to(['.gift-title', '.gift-hint', '.gift-note'], { autoAlpha: 0, y: -10, duration: 0.4 }, '<')
      .to('#s-gift', { autoAlpha: 0, scale: 1.1, duration: 0.7, ease: 'power2.in' }, '+=0.5')
      .call(() => {
        $('#s-gift').remove();
        $('#controls').classList.add('show');
        run();
      });
  }

  // ---------- Khởi động ----------
  async function preload() {
    const srcs = [...new Set([...C.photos.map(p => p.src), C.wishPhoto])];
    const total = srcs.length + 1;
    let done = 0;
    const fill = $('#loader-fill');
    const tick = () => { done++; fill.style.width = Math.round((done / total) * 100) + '%'; };
    const jobs = srcs.map(src => new Promise(r => {
      const img = new Image();
      img.onload = img.onerror = () => { tick(); r(); };
      img.src = src;
    }));
    jobs.push((document.fonts ? document.fonts.ready : Promise.resolve()).then(tick));
    await Promise.race([Promise.all(jobs), new Promise(r => setTimeout(r, 8000))]);
  }

  async function init() {
    document.title = f(C.pageTitle);
    $('#loader-text').textContent = f(C.loading);
    $('#gift-title').innerHTML = f(C.gift.title);
    $('#gift-hint').innerHTML = f(C.gift.hint);
    $('#gift-note').innerHTML = f(C.gift.note);

    if (!window.gsap) {
      $('#loader-text').textContent = 'Không tải được hiệu ứng, kiểm tra mạng rồi tải lại trang nha 🥺';
      return;
    }
    await preload();
    $('#loader').classList.add('done');
    startFloaties();
    $('#btn-skip').addEventListener('click', skip);
    $('#btn-replay').addEventListener('click', replay);

    if (jumpTo > 0) {
      $('#s-gift').remove();
      $('#controls').classList.add('show');
      run(jumpTo);
      return;
    }
    gsap.timeline()
      .set('#s-gift', { autoAlpha: 1 })
      .from('.gift-title', { autoAlpha: 0, y: 20, duration: 0.8 })
      .from('#gift', { autoAlpha: 0, scale: 0.4, duration: 0.9, ease: 'elastic.out(1, 0.55)' }, '-=0.4')
      .from(['.gift-hint', '.gift-note'], { autoAlpha: 0, duration: 0.6, stagger: 0.15 });

    const gift = $('#gift');
    gift.addEventListener('click', openGift);
    gift.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGift(); } });
  }

  init();
})();
