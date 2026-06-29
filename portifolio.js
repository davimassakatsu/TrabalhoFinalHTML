
// =============================================
// 1. CANVAS — ESTRELAS ANIMADAS
//    Gera e anima pontos piscantes no fundo
// =============================================
(function initStarCanvas() {
  const canvas = document.getElementById('star-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let stars = [];
  const STAR_COUNT = 160;

  /** Cria um objeto estrela com posição e brilho aleatórios */
  function createStar() {
    return {
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      radius:  Math.random() * 1.4 + 0.3,
      alpha:   Math.random(),
      delta:   (Math.random() * 0.006 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
      // algumas estrelas têm brilho 4 pontas (diamond)
      diamond: Math.random() > 0.93,
    };
  }

  /** Ajusta o canvas ao tamanho da janela */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /** Desenha uma estrela de 4 pontas */
  function drawDiamond(x, y, size, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#c8c8e8';
    ctx.beginPath();
    ctx.moveTo(x,          y - size * 3);
    ctx.lineTo(x + size,   y);
    ctx.lineTo(x,          y + size * 3);
    ctx.lineTo(x - size,   y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /** Loop de animação principal */
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const star of stars) {
      // piscar suavemente
      star.alpha += star.delta;
      if (star.alpha >= 1 || star.alpha <= 0) star.delta *= -1;
      star.alpha = Math.max(0, Math.min(1, star.alpha));

      if (star.diamond) {
        drawDiamond(star.x, star.y, star.radius * 0.8, star.alpha);
      } else {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 200, 232, ${star.alpha})`;
        ctx.fill();
      }
    }

    requestAnimationFrame(animate);
  }

  // Inicialização
  resize();
  stars = Array.from({ length: STAR_COUNT }, createStar);
  animate();

  window.addEventListener('resize', () => {
    resize();
    // Redistribui estrelas ao redimensionar
    stars = Array.from({ length: STAR_COUNT }, createStar);
  });
})();


// =============================================
// 2. SCROLL REVEAL
//    Observa elementos com .reveal e adiciona
//    .visible quando entram na viewport
// =============================================
(function initReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  // Só agora marcamos como "pending" (invisível) — se algo falhar depois,
  // o conteúdo já está garantidamente visível por padrão via CSS.
  targets.forEach(el => el.classList.add('reveal-pending'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // observa só uma vez
        }
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach(el => observer.observe(el));
})();


// =============================================
// 3. NAV — ACTIVE LINK + MENU MOBILE
//    Marca o link ativo com base na URL atual
//    e controla abertura/fechamento do menu
// =============================================
(function initActiveNav() {
  const links = document.querySelectorAll('.nav__links a');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

(function initMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const menu   = document.querySelector('.nav__links');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Fecha o menu ao clicar em um link (navegação entre seções/páginas)
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();


// =============================================
// 4. FORMULÁRIO DE CONTATO
//    Valida campos e exibe feedback no DOM
//    sem recarregar a página (manipulação DOM)
// =============================================
(function initContactForm() {
  const form     = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  if (!form) return;

  /**
   * Valida um endereço de e-mail simples
   * @param {string} email
   * @returns {boolean}
   */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Exibe mensagem de feedback no DOM
   * @param {string} msg - Texto a exibir
   * @param {'success'|'error'} type
   */
  function showFeedback(msg, type) {
    feedback.textContent = msg;
    feedback.style.color = type === 'success' ? '#6cde90' : '#e06c75';
    feedback.style.opacity = '1';

    // Limpa após 4 segundos (manipulação DOM)
    setTimeout(() => {
      feedback.style.opacity = '0';
      setTimeout(() => { feedback.textContent = ''; }, 400);
    }, 4000);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault(); // impede reload

    // Captura valores dos campos via DOM
    const name    = document.getElementById('input-name').value.trim();
    const email   = document.getElementById('input-email').value.trim();
    const message = document.getElementById('input-message').value.trim();

    // Validações
    if (!name) {
      showFeedback('⚠ Por favor, informe seu nome.', 'error');
      return;
    }
    if (!isValidEmail(email)) {
      showFeedback('⚠ Informe um e-mail válido.', 'error');
      return;
    }
    if (message.length < 10) {
      showFeedback('⚠ Escreva uma mensagem com pelo menos 10 caracteres.', 'error');
      return;
    }

    // Sucesso — exibe confirmação no DOM e limpa formulário
    showFeedback(`✓ Mensagem enviada, ${name}! Retornarei em breve.`, 'success');
    form.reset();
  });
})();


// =============================================
// 5. CONTADOR DE SKILLS (somente skills.html)
//    Exemplo extra de manipulação do DOM
// =============================================
(function initSkillFilter() {
  const filterBtns = document.querySelectorAll('[data-filter]');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Marca botão ativo
      filterBtns.forEach(b => b.classList.remove('filter-active'));
      btn.classList.add('filter-active');

      const cat = btn.dataset.filter;
      const cards = document.querySelectorAll('[data-category]');

      // Filtra os cards de skill no DOM
      cards.forEach(card => {
        if (cat === 'all' || card.dataset.category === cat) {
          card.style.display = '';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
})();
