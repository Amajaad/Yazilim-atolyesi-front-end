import { content as c, directions } from './content.js';

const id = document.body.dataset.design;
const d = directions.find(x => x.id === id);
const q = new URLSearchParams(location.search);
const view = ['register', 'login'].includes(q.get('view')) ? q.get('view') : 'home';
const home = `design-${id}.html`;
const register = `${home}?view=register`;
const login = `${home}?view=login`;
const number = n => String(n + 1).padStart(2, '0');
const brand = `<a class="brand" href="${home}" aria-label="Yazılım Atölyesi — Ana sayfa"><img src="/club-logo.png" width="44" height="44" alt=""><span>Yazılım Atölyesi<small>GÖNÜLLÜ YAZILIM KULÜBÜ</small></span></a>`;
const links = [['anasayfa','Ana sayfa'],['hakkimizda','Hakkımızda'],['duyurular','Duyurular'],['takim','Takım alanı'],['iletisim','İletişim']];
const nav = links.map(([a,b],i)=>`<a href="${home}#${a}"><span class="nav-number">${number(i)}</span>${b}</a>`).join('');
const actions = `<div class="actions"><a class="button" href="${register}">Kulübe Katıl <span aria-hidden="true">↗</span></a><a class="text-link" href="${home}#duyurular">Etkinlikleri Keşfet <span aria-hidden="true">↓</span></a></div>`;
const title = `<h1>Birlikte üretiyor, <br><span>öğreniyor,</span><br><em>geliştiriyoruz.</em></h1>`;
const eyebrow = `<p class="eyebrow">İstanbul Gedik Üniversitesi</p>`;
const intro = `<p class="intro">${c.intro}</p>`;
const miniEvents = `<aside class="hero-agenda"><p class="eyebrow">Gündemden / Duyurular</p>${c.events.map(e=>`<a href="#duyurular"><span>${e[0]}<small>${e[1]}</small></span><strong>${e[2]}</strong><b aria-hidden="true">↗</b></a>`).join('')}</aside>`;
const principles = `<div class="principle-type" aria-hidden="true"><span>Üret.</span><span>Öğren.</span><span>Paylaş.</span><small>YAZILIM ATÖLYESİ / 2010</small></div>`;
const heroVariants = {
 '01': `<div class="hero-copy">${eyebrow}${title}</div><div class="hero-bottom">${intro}${actions}<span class="edition">2010’dan beri<br>Gönüllü topluluk</span></div>`,
 '02': `<div class="hero-copy">${eyebrow}${title}${intro}${actions}</div><div class="build-map"><p class="eyebrow">Birlikte çalışma</p>${c.steps.map((s,i)=>`<div><span>${number(i)}</span><strong>${s[0]}</strong></div>`).join('')}<p>Fikirden teslimata.</p></div>`,
 '03': `<div class="hero-copy">${eyebrow}${title}${intro}${actions}</div><aside class="campus-guide"><span class="eyebrow">Yazılım Atölyesi</span><h2>Merak edenler için<br>bir çalışma alanı.</h2><p>Açık ve kapsayıcı</p><a href="#hakkimizda">Hakkımızda <span aria-hidden="true">→</span></a><a href="#takim">Takım alanı <span aria-hidden="true">→</span></a><a href="#iletisim">İletişim <span aria-hidden="true">→</span></a></aside>`,
 '04': `<div class="poster-top">${eyebrow}<span>Gönüllü topluluk / 2010’dan beri</span></div><div class="hero-copy">${title}</div><div class="poster-bottom">${intro}${actions}</div>`,
 '05': `<div class="hero-copy">${eyebrow}${title}${intro}${actions}</div><div class="community-strip"><span>2010’dan beri</span><span>Gönüllü topluluk</span><span>Açık ve kapsayıcı</span></div>`
};
const hero = `<section class="hero" id="anasayfa">${heroVariants[id]}</section>`;
const pillars = `<section class="pillars" aria-label="Kulüpte seni neler bekliyor">${c.pillars.map((p,i)=>`<article><span class="eyebrow">${number(i)}</span><h2>${p[0]}</h2><p>${p[1]}</p></article>`).join('')}</section>`;
const events = `<section class="events section" id="duyurular"><div class="section-heading"><div><p class="eyebrow">Gündemden</p><h2>Duyurular<span class="count">03</span></h2></div><label class="search-label">Duyurularda ara<input type="search" id="event-search" placeholder="Başlık veya konu"></label></div><div class="event-list">${c.events.map((e,i)=>`<article class="event" data-search="${e[2]} ${e[3]}"><div class="event-date"><strong>${e[0]}</strong><span>${e[1]}</span></div><div class="event-copy"><span class="eyebrow">Etkinlik • İstanbul Gedik Üniversitesi</span><h3>${e[2]}</h3><p>${e[3]}</p></div><span class="event-index" aria-hidden="true">${number(i)}</span></article>`).join('')}</div><p id="empty" class="empty" role="status" hidden>Aramana uygun duyuru bulunamadı. <button type="button" id="clear-search">Aramayı temizle</button></p><p class="source-note">Prototip notu: Mevcut sitedeki tarihler korunmuştur; güncel etkinlik takvimi değildir.</p></section>`;
const about = `<section class="about section" id="hakkimizda"><div><p class="eyebrow">Biz kimiz?</p><h2>Merak edenler için<br><em>bir çalışma alanı.</em></h2></div><div><p class="about-copy">${c.about}</p><div class="values"><span>2010’dan beri</span><span>Gönüllü topluluk</span><span>Açık ve kapsayıcı</span></div></div></section>`;
const teams = `<section class="teams section" id="takim"><div class="section-heading"><div><p class="eyebrow">Takım alanı</p><h2>Hangi alanda <br>üreteceksin?</h2></div><p>İlgi alanını seç, takım arkadaşlarınla birlikte büyüyen projelere katkı sun.</p></div><div class="team-list">${c.teams.map((t,i)=>`<a class="team" href="${register}&interest=${encodeURIComponent(t[0])}"><span class="team-no">${number(i)}</span><div><h3>${t[0]}</h3><p>${t[1]}</p></div><span class="team-action">Katıl <span aria-hidden="true">↗</span></span></a>`).join('')}</div></section>`;
const workflow = `<section class="workflow section"><div class="section-heading"><div><p class="eyebrow">Birlikte çalışma</p><h2>Fikirden teslimata.</h2></div><p>Herkesin takip edebileceği basit ve şeffaf bir akış.</p></div><ol>${c.steps.map((s,i)=>`<li><span>${number(i)}</span><h3>${s[0]}</h3><p>${s[1]}</p></li>`).join('')}</ol></section>`;
const status = `<div class="form-status" role="status" tabindex="-1" hidden></div>`;
const sim = `<label class="simulation">Prototip senaryosu<select name="scenario"><option value="success">Başarılı işlem</option><option value="error">Bağlantı hatası</option></select></label>`;
const contact = `<section class="contact section" id="iletisim"><div><p class="eyebrow">İletişim</p><h2>Bir fikrin mi var?<br><em>Konuşalım.</em></h2><p>Kulüp, etkinlikler veya ekiplerimiz hakkında merak ettiklerini bize gönder.</p><a class="email" href="mailto:yazilimatolyesi@gedik.edu.tr">yazilimatolyesi@gedik.edu.tr</a></div><form data-form="contact" novalidate><p class="form-notice">Etkileşim demosu. Mesaj gönderilmez, bilgiler kaydedilmez.</p><div class="field-row"><label>Ad soyad<input name="name" autocomplete="name" required placeholder="Adın ve soyadın"></label><label>E-posta<input name="email" type="email" autocomplete="email" required placeholder="ornek@mail.com"></label></div><label>Mesajın<textarea name="message" rows="4" required placeholder="Bize ne anlatmak istersin?"></textarea></label>${sim}<button class="button" type="submit">Mesaj gönder <span aria-hidden="true">↗</span></button>${status}</form></section>`;
function auth() {
 const reg = view === 'register';
 return `<section class="auth section"><div class="auth-story"><a class="text-link" href="${home}">← Ana sayfaya dön</a><p class="eyebrow">${reg ? 'Topluluğa katıl' : 'Yazılım Atölyesi'}</p><h1>${reg ? 'Yerini <br><em>ayır.</em>' : 'Tekrar <br><em>hoş geldin.</em>'}</h1><p>${reg ? 'Üretmeye, öğrenmeye ve birlikte geliştirmeye başla.' : 'Kulüp alanına erişmek için giriş yap.'}</p>${id === '02' ? principles : '<div class="auth-rule"></div>'}</div><div class="auth-form"><h2>${reg ? 'Üye Kaydı' : 'Giriş Yap'}</h2><p class="form-notice">Etkileşim demosu. Gerçek hesap oluşturulmaz veya oturum açılmaz. Bilgiler kaydedilmez.</p><form data-form="${view}" novalidate>${reg ? '<label>Ad soyad<input name="name" autocomplete="name" required placeholder="Adın ve soyadın"></label>' : ''}<label>E-posta<input name="email" type="email" autocomplete="email" required placeholder="ornek@mail.com"></label><label>Şifre<span class="password-field"><input id="password" name="password" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}" minlength="6" required aria-describedby="password-help"><button type="button" id="toggle-password" aria-label="Şifreyi göster" aria-pressed="false">Göster</button></span><small id="password-help">${reg ? 'En az 6 karakter. Mevcut demo formunun kuralı korunmuştur.' : 'Demo için en az 6 karakter.'}</small></label>${reg ? `<label>İlgi alanın<select name="interest">${c.teams.map(t=>`<option>${t[0]}</option>`).join('')}</select></label>` : ''}${sim}<button type="submit" class="button">${reg ? 'Üye kaydı oluştur' : 'Giriş yap'} <span aria-hidden="true">↗</span></button>${status}</form><p class="switch-auth">${reg ? 'Zaten üye misin?' : 'Henüz üye değil misin?'} <a href="${reg ? login : register}">${reg ? 'Giriş yap' : 'Üye kaydı oluştur'}</a></p></div></section>`;
}
const footer = `<footer><div>${brand}<p>Birlikte üretmek, paylaşmak ve projeyi adım adım geliştirmek için.</p></div><nav aria-label="Alt navigasyon">${nav}</nav><div class="footer-end"><span>© 2025 Yazılım Atölyesi</span><a href="index.html">← Tasarımları karşılaştır</a></div></footer>`;
const ordered = {'01':hero + pillars + events + about + teams + workflow + contact, '02':hero + teams + workflow + events + pillars + about + contact, '03':hero + pillars + about + events + teams + workflow + contact, '04':hero + events + pillars + teams + about + workflow + contact, '05':hero + about + teams + pillars + events + workflow + contact};
document.title = `${d.name} — ${view === 'home' ? 'Yazılım Atölyesi' : view === 'register' ? 'Üye Kaydı' : 'Giriş Yap'}`;
document.body.innerHTML = `<a class="skip-link" href="#main">İçeriğe geç</a><div class="review-bar"><a href="index.html">← Design Exploration</a><span>${id} / ${d.name}</span><a href="design-${directions[(Number(id)) % 5].id}.html">Sonraki tasarım →</a></div><div class="site"><header>${brand}<button id="menu-button" aria-expanded="false" aria-controls="navigation">Menü <span aria-hidden="true">+</span></button><nav id="navigation" aria-label="Ana navigasyon">${nav}<div class="nav-auth"><a href="${login}">Giriş Yap</a><a class="button" href="${register}">Üye Kaydı <span aria-hidden="true">↗</span></a></div></nav></header><main id="main">${view === 'home' ? ordered[id] : auth()}</main>${footer}</div>`;

const menu = document.querySelector('#menu-button');
function closeMenu() { menu.setAttribute('aria-expanded','false'); document.querySelector('header').classList.remove('menu-open'); }
menu.addEventListener('click',()=>{ const open = menu.getAttribute('aria-expanded') === 'false'; menu.setAttribute('aria-expanded',String(open)); document.querySelector('header').classList.toggle('menu-open',open); });
document.querySelector('#navigation').addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape' && menu.getAttribute('aria-expanded')==='true'){closeMenu(); menu.focus();}});
const search = document.querySelector('#event-search');
function filterEvents(){let count=0; const term=search.value.toLocaleLowerCase('tr').trim(); document.querySelectorAll('.event').forEach(el=>{el.hidden=!el.dataset.search.toLocaleLowerCase('tr').includes(term); if(!el.hidden)count++;});document.querySelector('#empty').hidden=count>0;}
search?.addEventListener('input',filterEvents);
document.querySelector('#clear-search')?.addEventListener('click',()=>{search.value='';filterEvents();search.focus();});
const interest = document.querySelector('[name="interest"]');
if(interest && c.teams.some(t=>t[0]===q.get('interest'))) interest.value=q.get('interest');
document.querySelector('#toggle-password')?.addEventListener('click',e=>{const input=document.querySelector('#password');const show=input.type==='password';input.type=show?'text':'password';e.currentTarget.textContent=show?'Gizle':'Göster';e.currentTarget.setAttribute('aria-label',show?'Şifreyi gizle':'Şifreyi göster');e.currentTarget.setAttribute('aria-pressed',String(show));});
document.querySelectorAll('form').forEach(form=>{
 form.addEventListener('input',e=>{if(e.target.matches('input,textarea')){e.target.removeAttribute('aria-invalid');e.target.removeAttribute('aria-errormessage');e.target.parentElement.querySelector('.field-error')?.remove();}});
 form.addEventListener('submit',async e=>{
  e.preventDefault(); const box=form.querySelector('.form-status');box.hidden=true;
  form.querySelectorAll('.field-error').forEach(el=>el.remove());
  let first;
  form.querySelectorAll('input,textarea').forEach((el,i)=>{el.removeAttribute('aria-invalid');el.removeAttribute('aria-errormessage');const bad=!el.checkValidity() || (el.required&&!el.value.trim());if(bad){first ||= el;el.setAttribute('aria-invalid','true');const error=document.createElement('small');error.className='field-error';error.id=`${form.dataset.form}-error-${i}`;error.textContent=el.validity.typeMismatch?'Geçerli bir e-posta adresi gir.':el.value.length && el.type==='password'?'En az 6 karakter kullan.':'Bu alanı doldur.';el.setAttribute('aria-errormessage',error.id);el.parentElement.append(error);}});
  if(first){first.focus();return;}
  const button=form.querySelector('[type="submit"]');const label=button.innerHTML;button.disabled=true;button.textContent='İşleniyor…';form.setAttribute('aria-busy','true');box.hidden=false;box.className='form-status';box.textContent='Demo işlem sürüyor…';
  await new Promise(resolve=>setTimeout(resolve,850));
  const fail=form.querySelector('[name="scenario"]').value==='error';
  box.className=`form-status ${fail?'error':'success'}`;
  box.textContent=fail?'Bağlantı kurulamadı (demo). Bilgilerin formda duruyor. Senaryoyu değiştirip tekrar deneyebilirsin.':form.dataset.form==='contact'?'Mesaj akışı tamamlandı (demo). Gerçek mesaj gönderilmedi.':form.dataset.form==='register'?'Kayıt akışı tamamlandı (demo). Gerçek üyelik oluşturulmadı.':'Giriş akışı tamamlandı (demo). Gerçek oturum açılmadı.';
  form.removeAttribute('aria-busy');button.disabled=false;button.innerHTML=label;box.focus();
 });
});

