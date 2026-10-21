const pages=[['home','トップ','index.html'],['activity','できること','activity.html'],['price','料金・サービス','price.html'],['reservation','会員予約','reservation.html'],['access','アクセス','access.html']];
const current=document.body.dataset.page;
const header=document.querySelector('#siteHeader');
header.className='site-header';
header.innerHTML=`<div class="header-inner"><a class="logo" href="index.html" aria-label="わくわくB&S トップ"><span class="logo-mark" aria-hidden="true"><img src="images/logo.png" alt=""></span><span class="logo-type"><strong>わくわく <em>B&S</em></strong><small>みんなの健康コミュニティ</small></span></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="globalNav" aria-label="メニューを開く">☰</button><nav class="global-nav" id="globalNav" aria-label="メインメニュー">${pages.map(([id,label,url])=>`<a href="${url}" ${id===current?'aria-current="page"':''} class="${id==='reservation'?'header-reserve':''}">${label}</a>`).join('')}</nav></div>`;
const footer=document.querySelector('#siteFooter');footer.className='site-footer';footer.innerHTML=`<div class="wrap"><div class="footer-grid"><div><a class="footer-logo" href="index.html"><span class="footer-logo-mark"><img src="images/logo.png" alt=""></span> わくわくB&S</a><p>遊ぶ・話す・動く・健康を知る。<br>古民家で楽しむ、地域のコミュニティ。</p></div><div><h3>施設情報</h3><p>営業：水・木・金・土</p><p>時間：9:00〜18:00</p><p>青森県青森市千富町（仮住所）</p><p><a href="tel:0000000000">電話：000-0000-0000</a></p></div><div><h3>メニュー</h3><nav class="footer-links">${pages.map(([,label,url])=>`<a href="${url}">${label}</a>`).join('')}</nav></div></div><p class="copyright">© 2026 WAKUWAKU B&S</p></div>`;
const toggle=document.querySelector('.menu-toggle');const nav=document.querySelector('#globalNav');toggle.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');toggle.setAttribute('aria-expanded',open);toggle.textContent=open?'×':'☰'});
const slides=[...document.querySelectorAll('[data-slide]')];if(slides.length){const dots=document.querySelector('.hero-dots');let index=0;let timer;slides.forEach((_,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-label',`${i+1}枚目を表示`);b.addEventListener('click',()=>show(i,true));dots.appendChild(b)});const buttons=[...dots.children];function show(next,manual=false){slides[index].classList.remove('is-active');buttons[index].setAttribute('aria-selected','false');index=(next+slides.length)%slides.length;slides[index].classList.add('is-active');buttons[index].setAttribute('aria-selected','true');if(manual)restart()}function restart(){clearInterval(timer);timer=setInterval(()=>show(index+1),6000)}document.querySelector('.hero-arrow.prev').addEventListener('click',()=>show(index-1,true));document.querySelector('.hero-arrow.next').addEventListener('click',()=>show(index+1,true));buttons[0].setAttribute('aria-selected','true');restart()}
document.querySelectorAll('[data-demo-form]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();form.querySelector('.form-status').textContent='入力内容を確認しました。送信機能は運用開始時に接続します。'}));

const reservationForm=document.querySelector('[data-reservation-form]');
if(reservationForm){
  const dateInput=reservationForm.elements.date;
  const timeSelect=reservationForm.elements.time;
  const peopleSelect=reservationForm.elements.people;
  const remainingText=reservationForm.querySelector('[data-remaining]');
  const status=reservationForm.querySelector('.form-status');
  const slots=['9:00〜10:00','10:00〜11:00','11:00〜12:00','12:00〜13:00','13:00〜14:00','14:00〜15:00','15:00〜16:00','16:00〜17:00','17:00〜18:00'];
  const capacity=8;
  const storageKey='wakuwaku-bs-reservations';
  const today=new Date();
  const localToday=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);
  dateInput.min=localToday;
  const readBookings=()=>{try{return JSON.parse(localStorage.getItem(storageKey)||'{}')}catch{return {}}};
  const slotKey=(date,time)=>`${date}|${time}`;
  const isOpenDay=date=>{const day=new Date(`${date}T12:00:00`).getDay();return day>=3&&day<=6};
  const updatePeople=()=>{
    peopleSelect.innerHTML='<option value="">人数を選択してください</option>';
    const date=dateInput.value;const time=timeSelect.value;
    if(!date||!time){peopleSelect.disabled=true;remainingText.textContent='日時を選択すると残席が表示されます。';return}
    const booked=readBookings()[slotKey(date,time)]||0;const remaining=Math.max(0,capacity-booked);
    remainingText.textContent=remaining===0?'この時間は満席です。':`残り${remaining}人まで予約できます。`;
    peopleSelect.disabled=remaining===0;
    for(let i=1;i<=remaining;i++){peopleSelect.insertAdjacentHTML('beforeend',`<option value="${i}">${i}人</option>`)}
  };
  const updateTimes=()=>{
    timeSelect.innerHTML='<option value="">希望時間を選択してください</option>';peopleSelect.innerHTML='<option value="">日時を選択してください</option>';peopleSelect.disabled=true;status.textContent='';
    if(!dateInput.value){timeSelect.disabled=true;remainingText.textContent='1時間につき8人まで予約できます。';return}
    if(!isOpenDay(dateInput.value)){timeSelect.disabled=true;remainingText.textContent='営業日は水・木・金・土曜日です。別の日を選択してください。';return}
    timeSelect.disabled=false;const bookings=readBookings();
    slots.forEach(slot=>{const remaining=Math.max(0,capacity-(bookings[slotKey(dateInput.value,slot)]||0));const option=document.createElement('option');option.value=slot;option.textContent=remaining===0?`${slot}（満席）`:`${slot}（残り${remaining}人）`;option.disabled=remaining===0;timeSelect.appendChild(option)});
    remainingText.textContent='希望時間を選択してください。';
  };
  dateInput.addEventListener('change',updateTimes);timeSelect.addEventListener('change',updatePeople);
  reservationForm.addEventListener('submit',e=>{
    e.preventDefault();status.textContent='';
    if(!reservationForm.reportValidity())return;
    if(!isOpenDay(dateInput.value)){status.textContent='営業日は水・木・金・土曜日です。';return}
    const bookings=readBookings();const key=slotKey(dateInput.value,timeSelect.value);const requested=Number(peopleSelect.value);const booked=bookings[key]||0;
    if(booked+requested>capacity){status.textContent='残席数が変わりました。日時と人数をもう一度選択してください。';updateTimes();return}
    bookings[key]=booked+requested;localStorage.setItem(storageKey,JSON.stringify(bookings));
    status.textContent='予約を受け付けました。施設からの確認連絡をもって予約確定となります。';reservationForm.reset();timeSelect.disabled=true;peopleSelect.disabled=true;remainingText.textContent='1時間につき8人まで予約できます。';
  });
}
