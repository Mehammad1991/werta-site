// WERTA — общий скрипт
// Номер фирмы для WhatsApp (цифры без «+»)
const WHATSAPP_NUMBER = '79285145049';

// Цели в Яндекс.Метрике — считаем ключевые касания лида
function ymGoal(name) {
  if (typeof window.ym === 'function') { window.ym(44147844, 'reachGoal', name); }
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) return;
  const href = a.getAttribute('href') || '';
  if (href.includes('kontakty')) ymGoal('cta_click');
  else if (href.includes('wa.me')) ymGoal('whatsapp_click');
  else if (href.startsWith('tel:')) ymGoal('call_click');
  else if (href.includes('t.me/')) ymGoal('telegram_click');
});

// Слайд-шоу фона на первом экране — смена картинки каждые 5 секунд
const heroSlides = document.querySelectorAll('.hero__slide');
if (heroSlides.length > 1) {
  let heroIndex = 0;
  setInterval(() => {
    heroSlides[heroIndex].classList.remove('is-active');
    heroIndex = (heroIndex + 1) % heroSlides.length;
    heroSlides[heroIndex].classList.add('is-active');
  }, 5000);
}

// Мобильное меню
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
if (burger && nav) {
  burger.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
}

// Индикатор "сейчас на связи" — по реальным часам работы Пн-Сб 09:00-18:00 (МСК, Дагестан = МСК)
const statusBadge = document.getElementById('statusBadge');
if (statusBadge) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Moscow', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(new Date());
  const get = (t) => parts.find(p => p.type === t).value;
  const weekdayMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  const day = weekdayMap[get('weekday')];
  const minutes = parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10);
  const isOpen = day <= 6 && minutes >= 9 * 60 && minutes < 18 * 60;
  statusBadge.classList.add(isOpen ? 'status-badge--open' : 'status-badge--closed');
  statusBadge.innerHTML = `<span class="status-badge__dot"></span>${isOpen ? 'Сейчас на связи — отвечаем быстро' : 'Сейчас нерабочее время — ответим Пн–Сб с 9:00'}`;
}

// Вкладки портфолио по городам
const cityTabs = document.querySelectorAll('.city-tab');
if (cityTabs.length) {
  const panels = document.querySelectorAll('[data-city-panel]');
  cityTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const city = tab.dataset.city;
      cityTabs.forEach(t => t.classList.toggle('city-tab--active', t === tab));
      panels.forEach(p => { p.hidden = p.dataset.cityPanel !== city; });
    });
  });
}

// UTM-метки: считываем из URL при заходе и сохраняем на сессию, чтобы не
// терять источник трафика, даже если посетитель перед заявкой походил по сайту.
(function captureUtm() {
  const params = new URLSearchParams(location.search);
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const found = {};
  keys.forEach((k) => { const v = params.get(k); if (v) found[k] = v; });
  if (Object.keys(found).length) sessionStorage.setItem('werta_utm', JSON.stringify(found));
})();
function getStoredUtm() {
  try { return JSON.parse(sessionStorage.getItem('werta_utm') || '{}'); } catch (e) { return {}; }
}

// Квиз-калькулятор в форме заявки: один вопрос на экран, выбор радио-кнопки
// сразу листает дальше. Без JS форма остаётся обычной длинной анкетой —
// все шаги видны сразу (см. .quiz__step в style.css) и реально отправляются
// через action=formsubmit.co на форме.
const quiz = document.getElementById('leadForm');
if (quiz && quiz.classList.contains('quiz')) {
  quiz.classList.add('quiz--js');
  const quizSteps = [...quiz.querySelectorAll('.quiz__step')];
  const quizProgressWrap = quiz.querySelector('.quiz__progress');
  const quizProgressBar = quiz.querySelector('.quiz__progress-bar');
  const quizBackBtn = quiz.querySelector('.quiz__back');
  let quizCurrent = 0;

  function showQuizStep(i) {
    quizSteps.forEach((s, idx) => s.classList.toggle('is-active', idx === i));
    quizCurrent = i;
    quizProgressBar.style.width = `${((i + 1) / quizSteps.length) * 100}%`;
    quizBackBtn.hidden = i === 0;
  }
  quizProgressWrap.hidden = false;
  showQuizStep(0);

  function quizNext() {
    if (quizCurrent < quizSteps.length - 1) {
      showQuizStep(quizCurrent + 1);
      ymGoal('quiz_step');
    }
  }
  quizBackBtn.addEventListener('click', () => { if (quizCurrent > 0) showQuizStep(quizCurrent - 1); });
  quiz.querySelectorAll('input[type=radio].chip-input').forEach((r) => {
    r.addEventListener('change', () => setTimeout(quizNext, 180));
  });
  quiz.querySelectorAll('[data-next]').forEach((btn) => btn.addEventListener('click', quizNext));
}

// Отправка заявки: собираем ответы квиза в сообщение WhatsApp фирмы
// + резервная копия на почту через FormSubmit (без бэкенда, ключ не нужен —
// только email в URL; при первой реальной заявке FormSubmit пришлёт на почту
// письмо с подтверждением адреса, его нужно один раз открыть и подтвердить).
const form = document.getElementById('leadForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    const phone = form.elements.phone.value.trim();
    const field = (n) => (form.elements[n] ? form.elements[n].value : '');
    const object = field('object');
    const area = field('area');
    const city = field('city');
    const stage = field('stage');
    const need = field('need');
    const problems = [...form.querySelectorAll('input[name="problem[]"]:checked')].map((i) => i.value).join(', ');
    const utm = getStoredUtm();
    const utmLine = Object.entries(utm).map(([k, v]) => `${k}=${v}`).join(', ');
    if (form.elements.utm) form.elements.utm.value = utmLine;

    const lines = [
      `Здравствуйте! Меня зовут ${name}.`,
      object && `Объект: ${object}${area ? ', ' + area : ''}${city ? ', ' + city : ''}`,
      problems && `Беспокоит: ${problems}`,
      stage && `Ремонт: ${stage}`,
      need && `Нужно: ${need}`,
      `Телефон: ${phone}`
    ].filter(Boolean);
    const text = encodeURIComponent(lines.join('\n'));

    ymGoal('lead_form_submit');
    const goToWhatsapp = () => {
      // location.href вместо window.open: на части мобильных браузеров (особенно iOS Safari
      // и встроенные webview) window.open из submit-обработчика блокируется как всплывающее
      // окно, и заявка молча теряется. Прямая навигация такому блокированию не подвержена.
      location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    };
    const emailBackup = fetch('https://formsubmit.co/ajax/dadaev1991@bk.ru', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _subject: 'Новая заявка с сайта WERTA',
        Имя: name,
        Телефон: phone,
        Объект: object,
        Площадь: area,
        Город: city,
        Беспокоит: problems,
        Ремонт: stage,
        Нужно: need,
        UTM: utmLine,
        Страница: location.href
      })
    }).catch(() => {});
    // Не ждём email дольше 1.2с — почта уходит в фоне, но клиент не должен
    // ждать медленный сторонний сервис, чтобы попасть в WhatsApp.
    Promise.race([emailBackup, new Promise(resolve => setTimeout(resolve, 1200))]).then(goToWhatsapp);
  });
}
