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
let allTeam = false;
function renderTeam() {
 $('#team-grid').innerHTML = salon.masters.slice(0,allTeam?12:4).map(m=>`<article class="master-card"><div class="master-photo">${m.image?`<img src="${esc(m.image)}" alt="${esc(m.name)}" loading="lazy" width="400" height="500">`:`<span aria-label="Фотография отсутствует">${esc(m.name.split(' ').map(s=>s[0]).slice(0,2).join(''))}</span>`}<span class="master-rating">★ ${esc(m.rating)} <span>(${esc(m.count)})</span></span></div><h3>${esc(m.name)}</h3><p class="master-role">${esc(m.role)}</p><a class="master-link" href="${esc(m.url)}" target="_blank" rel="noopener" aria-label="Профиль и запись: ${esc(m.name)}">Профиль и запись ↗</a></article>`).join('');
 $('#more-team').textContent = allTeam ? 'Свернуть список' : 'Все 12 специалистов';
 $('#more-team').setAttribute('aria-expanded',String(allTeam));
}
$('#more-team').addEventListener('click',()=>{allTeam=!allTeam;renderTeam();if(!allTeam)$('#team').scrollIntoView({block:'start'});});
renderTeam();
let galleryType='works', allPhotos=false, photoIndex=0;
function renderGallery(){
 const photos=salon[galleryType];
 $('#gallery-grid').innerHTML=photos.slice(0,allPhotos?photos.length:6).map((src,i)=>`<button class="gallery-item" data-photo="${i}" aria-label="Открыть фото ${i+1}: ${galleryType==='works'?'работа мастера':'интерьер салона'}"><img src="${esc(src)}" alt="${galleryType==='works'?'Работа мастера БИГУДИ':'Интерьер салона БИГУДИ'}, фото ${i+1}" loading="lazy" width="600" height="650"><span aria-hidden="true">↗</span></button>`).join('');
 $('#more-gallery').hidden=photos.length<=6;
 $('#more-gallery').textContent=allPhotos?'Свернуть галерею':`Все фотографии (${photos.length})`;
 $('#more-gallery').setAttribute('aria-expanded',String(allPhotos));
 document.querySelectorAll('[data-gallery]').forEach(b=>{b.classList.toggle('active',b.dataset.gallery===galleryType);b.setAttribute('aria-pressed',String(b.dataset.gallery===galleryType));});
}
document.querySelectorAll('[data-gallery]').forEach(b=>b.addEventListener('click',()=>{galleryType=b.dataset.gallery;allPhotos=false;renderGallery();}));
$('#more-gallery').addEventListener('click',()=>{allPhotos=!allPhotos;renderGallery();});
const lightbox=$('#lightbox');
function showPhoto(){const photos=salon[galleryType];lightbox.querySelector('img').src=photos[photoIndex];lightbox.querySelector('img').alt=`${galleryType==='works'?'Работа мастера':'Интерьер БИГУДИ'}, фото ${photoIndex+1}`;$('#lightbox-count').textContent=`${photoIndex+1} / ${photos.length}`;}
$('#gallery-grid').addEventListener('click',e=>{const b=e.target.closest('[data-photo]');if(!b)return;photoIndex=Number(b.dataset.photo);showPhoto();lightbox.showModal();});
$('.lightbox-close').addEventListener('click',()=>lightbox.close());
function movePhoto(step){photoIndex=(photoIndex+step+salon[galleryType].length)%salon[galleryType].length;showPhoto();}
$('.lightbox-prev').addEventListener('click',()=>movePhoto(-1));$('.lightbox-next').addEventListener('click',()=>movePhoto(1));
lightbox.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')movePhoto(-1);if(e.key==='ArrowRight')movePhoto(1);});
lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close();});
renderGallery();
$('#reviews-grid').innerHTML=salon.reviews.filter(r=>r.text).map(r=>`<article class="review-card"><span class="stars" aria-label="5 звёзд">★★★★★</span><blockquote>${esc(r.text)}</blockquote><strong>${esc(r.name)}</strong><small>${esc(r.date)}</small><p class="review-service">${esc(r.service)}<br>${esc(r.master)}</p></article>`).join('');
document.querySelectorAll('[data-value]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-value]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});$('#gift-note').innerHTML=`Выбран номинал ${Number(b.dataset.value).toLocaleString('ru-RU')} ₽. Укажите его при оформлении в DIKIDI.<br>Сертификат действует 6 месяцев.`;}));
$('.menu-toggle').addEventListener('click',()=>{const open=$('.menu-toggle').getAttribute('aria-expanded')!=='true';$('.menu-toggle').setAttribute('aria-expanded',String(open));$('.menu-toggle').setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');$('#mobile-nav').hidden=!open;});
$('#mobile-nav').addEventListener('click',e=>{if(e.target.closest('a')){$('#mobile-nav').hidden=true;$('.menu-toggle').setAttribute('aria-expanded','false');$('.menu-toggle').setAttribute('aria-label','Открыть меню');}});
