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
