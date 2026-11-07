'use strict';
const salon = window.SALON;
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const order = ['Парикмахерские услуги','Ногтевой сервис','Brow & Lash Bar','Косметология','Лазерная эпиляция','Перманент','Подология','Без категории'];
const categoryName = (c) => c === 'Brow & Lash Bar' ? 'Брови и ресницы' : c === 'Без категории' ? 'Другие услуги' : c;
let category = order[0], serviceLimit = 8;
const categories = $('#categories');
for (const c of order) {
 const button = document.createElement('button');
 button.type = 'button'; button.dataset.category = c;
 button.innerHTML = `${esc(categoryName(c))}<span>${salon.services.filter(s=>s.category===c).length}</span>`;
 button.addEventListener('click',()=>{ category=c; serviceLimit=8; $('#service-search').value=''; renderServices(); });
 categories.append(button);
}
function renderServices() {
 const query = $('#service-search').value.toLocaleLowerCase('ru').trim().replace(/ё/g,'е');
 const selected = salon.services.filter(s => query ? `${s.name} ${categoryName(s.category)}`.toLocaleLowerCase('ru').replace(/ё/g,'е').includes(query) : s.category === category);
 categories.querySelectorAll('button').forEach(b=>{b.classList.toggle('active',!query&&b.dataset.category===category);b.setAttribute('aria-pressed',String(!query&&b.dataset.category===category));});
 $('#category-title').textContent = query ? 'Результаты поиска' : categoryName(category);
 $('#result-count').textContent = `Найдено: ${selected.length}`;
 const featured = ['Стрижка женская (короткие волосы)','Стрижка мужская (модельная)','Окрашивание волос в один тон (короткие волосы)','Маникюр с покрытием гель-лак (однотонное)','Маникюр комбинированный женский','Педикюр с покрытием гель-лак'];
 if(!query) selected.sort((a,b)=>{let ai=featured.indexOf(a.name),bi=featured.indexOf(b.name);return (ai<0?999:ai)-(bi<0?999:bi);});
 $('#service-list').innerHTML = selected.length ? selected.slice(0,serviceLimit).map(s=>`<div class="service-row"><div><h4>${esc(s.name)}</h4><small>${esc(s.duration)}${query?' · '+esc(categoryName(s.category)):''}</small></div><span class="service-price">${esc(s.price)}</span><a class="service-book" href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="Записаться: ${esc(s.name)}">↗</a></div>`).join('') : '<p class="empty-state">Такой услуги не нашли. Попробуйте другое название или позвоните: <a href="tel:+79150620114">+7 (915) 062-01-14</a>.</p>';
 $('#more-services').hidden = selected.length <= serviceLimit;
 $('#more-services').textContent = `Показать ещё услуги (${selected.length-serviceLimit})`;
}
$('#service-search').addEventListener('input',()=>{serviceLimit=8;renderServices();});
$('#more-services').addEventListener('click',()=>{serviceLimit+=12;renderServices();});
renderServices();
document.querySelectorAll('[data-category-link]').forEach(link=>link.addEventListener('click',()=>{category=link.dataset.categoryLink;serviceLimit=8;$('#service-search').value='';renderServices();}));
$('#hero-search-form').addEventListener('submit',e=>{e.preventDefault();$('#service-search').value=$('#hero-search-input').value;serviceLimit=8;renderServices();$('#services').scrollIntoView({block:'start'});$('#service-search').focus({preventScroll:true});});
function renderTeam() {
 $('#team-grid').innerHTML = salon.masters.map(m=>`<article class="master-card"><div class="master-photo">${m.image?`<img src="${esc(m.image)}" alt="${esc(m.name)}" loading="lazy" width="400" height="500">`:`<span aria-label="Фотография отсутствует">${esc(m.name.split(' ').map(s=>s[0]).slice(0,2).join(''))}</span>`}<span class="master-rating">★ ${esc(m.rating)} <span>(${esc(m.count)})</span></span></div><h3>${esc(m.name)}</h3><p class="master-role">${esc(m.role)}</p><a class="master-link" href="${esc(m.url)}" target="_blank" rel="noopener" aria-label="Профиль и запись: ${esc(m.name)}">Профиль и запись ↗</a></article>`).join('');
}
renderTeam();
const teamTrack = $('#team-grid');
const teamPrev = $('#team-prev');
const teamNext = $('#team-next');
function updateTeamControls() {
 teamPrev.disabled = teamTrack.scrollLeft <= 2;
 teamNext.disabled = teamTrack.scrollLeft + teamTrack.clientWidth >= teamTrack.scrollWidth - 2;
}
function scrollTeam(direction) {
 const card = teamTrack.querySelector('.master-card');
 const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(teamTrack).columnGap);
 teamTrack.scrollBy({left: direction * step, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
}
teamPrev.addEventListener('click', () => scrollTeam(-1));
teamNext.addEventListener('click', () => scrollTeam(1));
teamTrack.addEventListener('scroll', updateTeamControls, {passive: true});
teamTrack.addEventListener('keydown', e => {
 if (e.target === teamTrack && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
  e.preventDefault();
  scrollTeam(e.key === 'ArrowLeft' ? -1 : 1);
 }
});
window.addEventListener('resize', updateTeamControls);
updateTeamControls();
const galleryLabels = {hair:'Стрижки и окрашивание', nails:'Маникюр и педикюр', interiors:'Интерьер салона БИГУДИ'};
let galleryType='hair', photoIndex=0;
function renderGallery(){
 const photos=salon[galleryType];
 $('#gallery-grid').innerHTML=photos.map((src,i)=>`<button class="gallery-item" data-photo="${i}" aria-label="Открыть фото ${i+1}: ${galleryLabels[galleryType]}"><img src="${esc(src)}" alt="${galleryLabels[galleryType]}, фото ${i+1}" loading="lazy" width="600" height="650"><span aria-hidden="true">↗</span></button>`).join('');
 document.querySelectorAll('[data-gallery]').forEach(b=>{b.classList.toggle('active',b.dataset.gallery===galleryType);b.setAttribute('aria-pressed',String(b.dataset.gallery===galleryType));});
}
document.querySelectorAll('[data-gallery]').forEach(b=>b.addEventListener('click',()=>{galleryType=b.dataset.gallery;photoIndex=0;renderGallery();galleryTrack.scrollTo({left:0,behavior:"instant"});updateGalleryControls();}));
const lightbox=$('#lightbox');
function showPhoto(){const photos=salon[galleryType];lightbox.querySelector('img').src=photos[photoIndex];lightbox.querySelector('img').alt=`${galleryLabels[galleryType]}, фото ${photoIndex+1}`;$('#lightbox-count').textContent=`${photoIndex+1} / ${photos.length}`;}
$('#gallery-grid').addEventListener('click',e=>{const b=e.target.closest('[data-photo]');if(!b)return;photoIndex=Number(b.dataset.photo);showPhoto();lightbox.showModal();});
$('.lightbox-close').addEventListener('click',()=>lightbox.close());
function movePhoto(step){photoIndex=(photoIndex+step+salon[galleryType].length)%salon[galleryType].length;showPhoto();}
$('.lightbox-prev').addEventListener('click',()=>movePhoto(-1));$('.lightbox-next').addEventListener('click',()=>movePhoto(1));
lightbox.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')movePhoto(-1);if(e.key==='ArrowRight')movePhoto(1);});
lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close();});
renderGallery();
function reviewDisplayName(name) {
 const parts = name.trim().split(/\s+/);
 return parts.map((part, index) => index === 0 ? part : `${Array.from(part)[0]}.`).join(' ');
}

document.querySelectorAll('[data-value]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-value]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});$('#gift-note').innerHTML=`Выбран номинал ${Number(b.dataset.value).toLocaleString('ru-RU')} ₽. Укажите его при оформлении в DIKIDI.<br>Сертификат действует 6 месяцев.`;}));
$('.menu-toggle').addEventListener('click',()=>{const open=$('.menu-toggle').getAttribute('aria-expanded')!=='true';$('.menu-toggle').setAttribute('aria-expanded',String(open));$('.menu-toggle').setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');$('#mobile-nav').hidden=!open;});
$('#mobile-nav').addEventListener('click',e=>{if(e.target.closest('a')){$('#mobile-nav').hidden=true;$('.menu-toggle').setAttribute('aria-expanded','false');$('.menu-toggle').setAttribute('aria-label','Открыть меню');}});

const contactToggle = $('.contact-widget-toggle');
const contactPanel = $('#contact-options');
function closeContacts(restoreFocus = false) {
 contactPanel.hidden = true;
 contactToggle.setAttribute('aria-expanded', 'false');
 contactToggle.setAttribute('aria-label', 'Открыть способы связи');
 if (restoreFocus) contactToggle.focus();
}
contactToggle.addEventListener('click', () => {
 const open = contactPanel.hidden;
 contactPanel.hidden = !open;
 contactToggle.setAttribute('aria-expanded', String(open));
 contactToggle.setAttribute('aria-label', open ? 'Закрыть способы связи' : 'Открыть способы связи');
});
document.addEventListener('click', e => {
 if (!e.target.closest('.contact-widget')) closeContacts();
});
document.addEventListener('keydown', e => {
 if (e.key === 'Escape' && !contactPanel.hidden) closeContacts(true);
});
contactPanel.addEventListener('click', e => { if (e.target.closest('a')) closeContacts(); });

const reviewsTrack = $('#reviews-grid');
const reviewsPrev = $('#reviews-prev');
const reviewsNext = $('#reviews-next');
const reviewItems = salon.reviews.filter(r => r.text);
const reviewCard = r => `<article class="review-card"><span class="stars" aria-label="${r.rating || 5} из 5">${"★".repeat(r.rating || 5)}${"☆".repeat(5-(r.rating || 5))}</span><blockquote>${esc(r.text)}</blockquote><strong>${esc(reviewDisplayName(r.name))}</strong><p class="review-service">${esc(r.service)}<br>${esc(r.master)}</p></article>`;
const reviewColumns = [];
for (let i = 0; i < reviewItems.length; i += 4) {
 const columns = [[], []];
 const heights = [0, 0];
 reviewItems.slice(i, i + 4).forEach(review => {
  const column = heights[0] <= heights[1] ? 0 : 1;
  columns[column].push(review);
  heights[column] += review.text.length + 180;
 });
 reviewColumns.push(...columns.filter(column => column.length));
}
reviewsTrack.innerHTML = reviewColumns.map(column => `<div class="reviews-column">${column.map(reviewCard).join('')}</div>`).join('');
function updateReviewControls() {
 reviewsPrev.disabled = reviewsTrack.scrollLeft <= 2;
 reviewsNext.disabled = reviewsTrack.scrollLeft + reviewsTrack.clientWidth >= reviewsTrack.scrollWidth - 2;
}
function scrollReviews(direction) {
 const card = reviewsTrack.firstElementChild;
 if (!card) return;
 reviewsTrack.scrollBy({left: direction * (card.getBoundingClientRect().width + parseFloat(getComputedStyle(reviewsTrack).columnGap)), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
}
reviewsPrev.addEventListener('click', () => scrollReviews(-1));
reviewsNext.addEventListener('click', () => scrollReviews(1));
reviewsTrack.addEventListener('scroll', updateReviewControls, {passive: true});
window.addEventListener('resize', updateReviewControls);
reviewsTrack.addEventListener('keydown', e => {
 if (e.target === reviewsTrack && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
  e.preventDefault();
  scrollReviews(e.key === 'ArrowLeft' ? -1 : 1);
 }
});
updateReviewControls();

// Touch uses native momentum; mouse dragging follows the pointer, then settles on a card.
function enableCarouselDrag(track) {
 let drag = null;
 let suppressClick = false;
 let settleTimer;
 track.addEventListener('dragstart', e => e.preventDefault());
 track.addEventListener('pointerdown', e => {
  if (e.pointerType !== 'mouse' || e.button !== 0) return;
  suppressClick = false;
  clearTimeout(settleTimer);
  track.classList.remove('is-settling');
  drag = {id: e.pointerId, x: e.clientX, left: track.scrollLeft, moved: false};
 });
 track.addEventListener('pointermove', e => {
  if (!drag || drag.id !== e.pointerId) return;
  const dx = e.clientX - drag.x;
  if (!drag.moved && Math.abs(dx) < 6) return;
  if (!drag.moved) {
   drag.moved = true;
   track.classList.add('is-dragging');
   track.setPointerCapture(e.pointerId);
  }
  e.preventDefault();
  track.scrollLeft = drag.left - dx;
 });
 function finish(e) {
  if (!drag || drag.id !== e.pointerId) return;
  const moved = drag.moved;
  const startLeft = drag.left;
  const distance = drag.x - e.clientX;
  const currentLeft = track.scrollLeft;
  if (moved) track.classList.add('is-settling');
  drag = null;
  track.classList.remove('is-dragging');
  if (track.hasPointerCapture(e.pointerId)) track.releasePointerCapture(e.pointerId);
  if (!moved) return;
  suppressClick = true;
  const card = track.firstElementChild;
  if (!card) return;
  const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);
  const startIndex = Math.round(startLeft / step);
  const threshold = Math.min(40, step * 0.1);
  let targetIndex = Math.round(currentLeft / step);
  if (e.type !== 'pointercancel' && Math.abs(distance) >= threshold) {
   targetIndex = distance > 0 ? Math.max(startIndex + 1, targetIndex) : Math.min(startIndex - 1, targetIndex);
  }
  const targetLeft = Math.max(0, Math.min(track.scrollWidth - track.clientWidth, targetIndex * step));
  track.scrollTo({left: targetLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  settleTimer = setTimeout(() => track.classList.remove('is-settling'), 700);
 }
 track.addEventListener('pointerup', finish);
 track.addEventListener('pointercancel', finish);
 track.addEventListener('pointerleave', e => { if (drag && !drag.moved) drag = null; });
 track.addEventListener('click', e => {
  if (suppressClick) { e.preventDefault(); e.stopPropagation(); suppressClick = false; }
 }, true);
}
enableCarouselDrag(teamTrack);
enableCarouselDrag(reviewsTrack);
const galleryTrack = $('#gallery-grid');
const galleryPrev = $('#gallery-prev');
const galleryNext = $('#gallery-next');
function updateGalleryControls() {
 galleryPrev.disabled = galleryTrack.scrollLeft <= 2;
 galleryNext.disabled = galleryTrack.scrollLeft + galleryTrack.clientWidth >= galleryTrack.scrollWidth - 2;
}
function scrollGallery(direction) {
 const card = galleryTrack.firstElementChild;
 if (!card) return;
 const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(galleryTrack).columnGap);
 galleryTrack.scrollBy({left:direction * step,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
}
galleryPrev.addEventListener('click', () => scrollGallery(-1));
galleryNext.addEventListener('click', () => scrollGallery(1));
galleryTrack.addEventListener('scroll',updateGalleryControls,{passive:true});
window.addEventListener('resize',updateGalleryControls);
galleryTrack.addEventListener('keydown',e => {
 if (e.target === galleryTrack && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
  e.preventDefault();scrollGallery(e.key === 'ArrowLeft' ? -1 : 1);
 }
});
enableCarouselDrag(galleryTrack);
updateGalleryControls();


const backToTop = document.querySelector('.back-to-top');
function updateBackToTop() {
 backToTop.hidden = window.scrollY < 500;
}
window.addEventListener('scroll', updateBackToTop, {passive: true});
updateBackToTop();
backToTop.addEventListener('click', () => {
 window.scrollTo({top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
});