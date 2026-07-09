// WERTA — общий скрипт
// Номер фирмы для WhatsApp (цифры без «+»)
const WHATSAPP_NUMBER = '79285145049';

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

// Форма заявки: открываем WhatsApp фирмы с готовым сообщением из введённых данных
const form = document.getElementById('leadForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    const phone = form.elements.phone.value.trim();
    const text = encodeURIComponent(`Здравствуйте! Меня зовут ${name}. Хочу получить расчёт стоимости. Мой телефон: ${phone}`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
  });
}
