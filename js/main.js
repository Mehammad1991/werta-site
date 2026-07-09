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
const form = document.getElementById('leadForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    const phone = form.elements.phone.value.trim();
    const text = encodeURIComponent(`Здравствуйте! Меня зовут ${name}. Хочу получить расчёт стоимости. Мой телефон: ${phone}`);
    ymGoal('lead_form_submit');
    // location.href вместо window.open: на части мобильных браузеров (особенно iOS Safari
    // и встроенные webview) window.open из submit-обработчика блокируется как всплывающее
    // окно, и заявка молча теряется. Прямая навигация такому блокированию не подвержена.
    location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
  });
}
