/* ===========================================================
   CAFÉ MORI — Landing Page Scripts
   =========================================================== */
(function () {
  'use strict';

  const header    = document.getElementById('header');
  const body       = document.body;
  const navToggle = document.getElementById('navToggle');

  /* ---------------------------------------------------------
     1. スムーススクロール（ヘッダー高さ分のオフセット込み）
        CSS の scroll-behavior に加え、JS でも制御することで
        固定ヘッダーに隠れないようにする
     --------------------------------------------------------- */
  const HEADER_H = 72;

  function smoothScrollTo(targetEl) {
    const top = targetEl.getBoundingClientRect().top + window.pageYOffset - HEADER_H;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  document.querySelectorAll('[data-scroll]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || !id.startsWith('#')) return;
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      smoothScrollTo(target);

      // モバイルメニューが開いていれば閉じる
      if (body.classList.contains('nav-open')) {
        body.classList.remove('nav-open');
      }
    });
  });

  /* ---------------------------------------------------------
     2. スクロールに応じてヘッダーの見た目を変える
     --------------------------------------------------------- */
  function onScroll() {
    if (window.pageYOffset > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     3. ハンバーガーメニュー（モバイル）
     --------------------------------------------------------- */
  navToggle.addEventListener('click', () => {
    body.classList.toggle('nav-open');
    const open = body.classList.contains('nav-open');
    navToggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  });

  /* ---------------------------------------------------------
     4. スクロールで要素をふわっと表示（Intersection Observer）
     --------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // 同時に入った要素を少しずつ遅らせて表示
          const delay = (entry.target.dataset.delay || (i * 90)) + 'ms';
          entry.target.style.transitionDelay = delay;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach((el) => io.observe(el));
  } else {
    // 非対応ブラウザはそのまま表示
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------------------------------------------------------
     5. ナビのアクティブ表示（現在のセクションを下線でハイライト）
     --------------------------------------------------------- */
  const sections = ['about', 'menu', 'access', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinks = document.querySelectorAll('.nav__list a');

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((a) => {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
        });
      });
    }, { threshold: 0.5 });

    sections.forEach((sec) => spy.observe(sec));
  }

  /* ---------------------------------------------------------
     6. お問い合わせフォームのバリデーション＆送信
     --------------------------------------------------------- */
  const form = document.getElementById('contactForm');

  if (form) {
    // メール形式チェック用の正規表現（一般的な簡易パターン）
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // フィールドごとの検証ルール
    const rules = {
      name: (v) => {
        if (!v.trim()) return 'お名前を入力してください。';
        return '';
      },
      email: (v) => {
        if (!v.trim()) return 'メールアドレスを入力してください。';
        if (!EMAIL_RE.test(v.trim())) return 'メールアドレスの形式が正しくありません。';
        return '';
      },
      message: (v) => {
        if (!v.trim()) return 'お問い合わせ内容を入力してください。';
        return '';
      }
    };

    // 1フィールドを検証してエラー表示を更新。OK なら true を返す
    function validateField(name) {
      const input = form.elements[name];
      const field = input.closest('.field');
      const errorEl = form.querySelector('[data-error-for="' + name + '"]');
      const message = rules[name](input.value);

      if (message) {
        field.classList.add('has-error');
        errorEl.textContent = message;
        return false;
      }
      field.classList.remove('has-error');
      errorEl.textContent = '';
      return true;
    }

    // 入力中・フォーカスが外れたタイミングで都度チェック
    Object.keys(rules).forEach((name) => {
      const input = form.elements[name];
      input.addEventListener('blur', () => validateField(name));
      input.addEventListener('input', () => {
        // すでにエラー表示中の項目だけリアルタイムで再検証
        if (input.closest('.field').classList.contains('has-error')) {
          validateField(name);
        }
      });
    });

    // 送信時にすべて検証
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // すべてのフィールドを検証（途中で止めず全部チェックしてエラー表示）
      const results = Object.keys(rules).map((name) => validateField(name));
      const isValid = results.every(Boolean);

      if (!isValid) {
        // 最初のエラー項目へフォーカス
        const firstError = form.querySelector('.field.has-error input, .field.has-error textarea');
        if (firstError) firstError.focus();
        return;
      }

      // バリデーション通過 → 送信完了（デモのためアラート表示）
      alert('送信しました');
      form.reset();
    });
  }
})();
