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

// Форма заявки: открываем WhatsApp фирмы с готовым сообщением из введённых данных
// + резервная копия на почту через FormSubmit (без бэкенда, ключ не нужен —
// только email в URL; при первой реальной заявке FormSubmit пришлёт на почту
// письмо с подтверждением адреса, его нужно один раз открыть и подтвердить).
const form = document.getElementById('leadForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    const phone = form.elements.phone.value.trim();
    const text = encodeURIComponent(`Здравствуйте! Меня зовут ${name}. Хочу получить расчёт стоимости. Мой телефон: ${phone}`);
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
        Страница: location.href
      })
    }).catch(() => {});
    // Не ждём email дольше 1.2с — почта уходит в фоне, но клиент не должен
    // ждать медленный сторонний сервис, чтобы попасть в WhatsApp.
    Promise.race([emailBackup, new Promise(resolve => setTimeout(resolve, 1200))]).then(goToWhatsapp);
  });
}
