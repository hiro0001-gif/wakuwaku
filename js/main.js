const pages=[['home','トップ','index.html'],['activity','できること','activity.html'],['price','料金・サービス','price.html'],['reservation','会員予約','reservation.html'],['access','アクセス','access.html']];
const current=document.body.dataset.page;
const header=document.querySelector('#siteHeader');
header.className='site-header';
header.innerHTML=`<div class="header-inner"><a class="logo" href="index.html" aria-label="わくわくB&S トップ"><span class="logo-mark" aria-hidden="true"><img src="images/logo.png" alt=""></span><span class="logo-type"><strong>わくわく <em>B&S</em></strong><small>みんなの健康コミュニティ</small></span></a><nav class="global-nav" id="globalNav" aria-label="メインメニュー">${pages.map(([id,label,url])=>`<a href="${url}" ${id===current?'aria-current="page"':''} class="${id==='reservation'?'header-reserve':''}">${label}</a>`).join('')}</nav></div>`;
const footer=document.querySelector('#siteFooter');footer.className='site-footer';footer.innerHTML=`<div class="wrap"><div class="footer-grid"><div><a class="footer-logo" href="index.html"><span class="footer-logo-mark"><img src="images/logo.png" alt=""></span> わくわくB&S</a><p>遊ぶ・話す・動く・健康を知る。<br>古民家で楽しむ、地域のコミュニティ。</p></div><div><h3>施設情報</h3><p>営業：木・金・土</p><p>年末年始等、休日がある場合は事前にお知らせします。</p><p>時間：9:00〜18:00</p><p>〒030-0854<br>青森県青森市千富町（仮住所）</p><p><a href="tel:0000000000">電話：000-0000-0000</a></p></div><div><h3>メニュー</h3><nav class="footer-links">${pages.map(([,label,url])=>`<a href="${url}">${label}</a>`).join('')}</nav></div></div><p class="copyright">© 2026 WAKUWAKU B&S</p></div>`;
const slides=[...document.querySelectorAll('[data-slide]')];
if(slides.length>1){
 let index=0;
 setInterval(()=>{
  slides[index].classList.remove('is-active');
  index=(index+1)%slides.length;
  slides[index].classList.add('is-active');
 },6000);
}
document.querySelectorAll('[data-demo-form]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();form.querySelector('.form-status').textContent='入力内容を確認しました。送信機能は運用開始時に接続します。'}));

document.querySelectorAll('.news-item').forEach(item=>{
 const button=item.querySelector('.news-summary');
 const detail=item.querySelector('.news-detail');
 const icon=button.querySelector('.news-toggle');
 const title=button.querySelector('strong').textContent;
 button.addEventListener('click',()=>{
  const open=button.getAttribute('aria-expanded')!=='true';
  button.setAttribute('aria-expanded',String(open));
  button.setAttribute('aria-label',`${title}の詳細を${open?'閉じる':'開く'}`);
  detail.hidden=!open;
  icon.textContent=open?'×':'＋';
 });
});

const reservationForm=document.querySelector('[data-reservation-form]');
if(reservationForm){
  const dateInput=reservationForm.elements.date;
  const timeSelect=reservationForm.elements.time;
  const durationSelect=reservationForm.elements.duration;
  const peopleSelect=reservationForm.elements.people;
  const remainingText=reservationForm.querySelector('[data-remaining]');
  const status=reservationForm.querySelector('.form-status');
  const startHours=[9,10,11,12,13,14,15,16,17];
  const capacity=8;
  const storageKey='wakuwaku-bs-reservations';
  const today=new Date();
  const localToday=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);
  dateInput.min=localToday;
  const readBookings=()=>{try{return JSON.parse(localStorage.getItem(storageKey)||'{}')}catch{return {}}};
  const slotKey=(date,hour)=>`${date}|${hour}:00`;
  const isOpenDay=date=>{const day=new Date(`${date}T12:00:00`).getDay();return day>=4&&day<=6};
  const occupiedHours=(start,duration)=>{
    const hours=duration==='day'?18-start:Number(duration);
    return Array.from({length:hours},(_,i)=>start+i);
  };
  const availableFor=(date,start,duration)=>{
    const bookings=readBookings();
    return Math.min(...occupiedHours(start,duration).map(hour=>Math.max(0,capacity-(bookings[slotKey(date,hour)]||0))));
  };
  const updatePeople=()=>{
    peopleSelect.innerHTML='<option value="">人数を選択してください</option>';
    const date=dateInput.value;const start=Number(timeSelect.value);const duration=durationSelect.value;
    if(!date||!timeSelect.value||!duration){peopleSelect.disabled=true;remainingText.textContent='開始時間と利用時間を選ぶと残席が表示されます。';return}
    const remaining=availableFor(date,start,duration);
    remainingText.textContent=remaining===0?'選択した時間帯は満席です。':`選択した時間帯は、残り${remaining}人まで予約できます。`;
    peopleSelect.disabled=remaining===0;
    for(let i=1;i<=remaining;i++){peopleSelect.insertAdjacentHTML('beforeend',`<option value="${i}">${i}人</option>`)}
  };
  const updateDurations=()=>{
    durationSelect.innerHTML='<option value="">利用時間を選択してください</option>';peopleSelect.innerHTML='<option value="">利用時間を選択してください</option>';peopleSelect.disabled=true;
    if(!timeSelect.value){durationSelect.disabled=true;remainingText.textContent='開始時間を選択してください。';return}
    const start=Number(timeSelect.value);const remainingHours=18-start;
    const options=[{value:'1',label:'1時間',hours:1},{value:'3',label:'3時間',hours:3},{value:'day',label:'1日（18:00まで・4時間以上）',hours:4}];
    options.filter(option=>remainingHours>=option.hours).forEach(option=>{
      const remaining=availableFor(dateInput.value,start,option.value);const selectOption=document.createElement('option');selectOption.value=option.value;selectOption.textContent=remaining===0?`${option.label}（満席）`:`${option.label}（残り${remaining}人）`;selectOption.disabled=remaining===0;durationSelect.appendChild(selectOption);
    });
    durationSelect.disabled=false;remainingText.textContent='利用時間を選択してください。';
  };
  const updateTimes=()=>{
    timeSelect.innerHTML='<option value="">開始時間を選択してください</option>';durationSelect.innerHTML='<option value="">開始時間を選択してください</option>';peopleSelect.innerHTML='<option value="">利用時間を選択してください</option>';durationSelect.disabled=true;peopleSelect.disabled=true;status.textContent='';
    if(!dateInput.value){timeSelect.disabled=true;remainingText.textContent='各1時間枠につき8人まで予約できます。';return}
    if(!isOpenDay(dateInput.value)){timeSelect.disabled=true;remainingText.textContent='営業日は木・金・土曜日です。別の日を選択してください。';return}
    timeSelect.disabled=false;const bookings=readBookings();
    startHours.forEach(hour=>{const remaining=Math.max(0,capacity-(bookings[slotKey(dateInput.value,hour)]||0));const option=document.createElement('option');option.value=String(hour);option.textContent=remaining===0?`${hour}:00（満席）`:`${hour}:00（残り${remaining}人）`;option.disabled=remaining===0;timeSelect.appendChild(option)});
    remainingText.textContent='開始時間を選択してください。';
  };
  dateInput.addEventListener('change',updateTimes);timeSelect.addEventListener('change',updateDurations);durationSelect.addEventListener('change',updatePeople);
  reservationForm.addEventListener('submit',e=>{
    e.preventDefault();status.textContent='';
    if(!reservationForm.reportValidity())return;
    if(!isOpenDay(dateInput.value)){status.textContent='営業日は木・金・土曜日です。';return}
    const start=Number(timeSelect.value);const duration=durationSelect.value;const requested=Number(peopleSelect.value);
    if(availableFor(dateInput.value,start,duration)<requested){status.textContent='残席数が変わりました。日時・利用時間・人数をもう一度選択してください。';updateTimes();return}
    const bookings=readBookings();occupiedHours(start,duration).forEach(hour=>{const key=slotKey(dateInput.value,hour);bookings[key]=(bookings[key]||0)+requested});
    localStorage.setItem(storageKey,JSON.stringify(bookings));
    status.textContent='予約を受け付けました。施設からの確認連絡をもって予約確定となります。';reservationForm.reset();timeSelect.disabled=true;durationSelect.disabled=true;peopleSelect.disabled=true;remainingText.textContent='各1時間枠につき8人まで予約できます。';
  });
}
