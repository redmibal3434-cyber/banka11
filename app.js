const BANKS=["Ziraat Bankası","VakıfBank","Halkbank","Türkiye İş Bankası","Garanti BBVA","Yapı Kredi","Akbank","QNB","DenizBank","ING","TEB","Kuveyt Türk","Türkiye Finans","Albaraka Türk","Fibabanka","Odea Bank","Şekerbank","Alternatif Bank","Anadolubank","Burgan Bank","ICBC Turkey Bank","HSBC","Hayat Finans","TOM Bank"];
const rows=document.getElementById('rows');
const money=n=>new Intl.NumberFormat('tr-TR').format(+n||0)+' TL';

function used(except){return [...rows.querySelectorAll('.bank')].filter(x=>x!==except).map(x=>x.value).filter(Boolean)}
function refresh(){[...rows.querySelectorAll('.bank')].forEach(s=>{let c=s.value,u=used(s);s.innerHTML='<option value="">Banka seçiniz</option>'+BANKS.map(b=>`<option value="${b}" ${b===c?'selected':''} ${u.includes(b)?'disabled':''}>${b}</option>`).join('')})}
function calc(){document.getElementById('total').textContent=money([...rows.querySelectorAll('.limit')].reduce((a,x)=>a+(+x.value||0),0))}
function add(){
  let d=document.createElement('div'); d.className='ref';
  d.innerHTML=`<div class="refgrid">
  <div><label>Banka</label><select class="bank" required></select></div>
  <div><label>Talep Numarası</label><input class="requestNo" inputmode="numeric" maxlength="17" placeholder="Opsiyonel"></div>
  <div><label>Talep Gönderim Tarihi</label><input class="requestDate" inputmode="numeric" maxlength="5" placeholder="AA/YY"></div>
  <div><label>3 Haneli Talep Kodu</label><input class="requestCode" inputmode="numeric" maxlength="3" placeholder="___"></div>
  <div><label>Kullanılabilir Limit (TL)</label><input class="limit" type="number" min="0" required></div>
  </div><button type="button" class="btn danger remove" style="margin-top:10px">Bu Bankayı Kaldır</button>`;
  rows.appendChild(d); refresh();
  d.querySelector('.bank').onchange=refresh;
  d.querySelector('.limit').oninput=calc;
  d.querySelector('.requestNo').oninput=e=>e.target.value=e.target.value.replace(/\D/g,'').slice(0,17);
  d.querySelector('.requestCode').oninput=e=>e.target.value=e.target.value.replace(/\D/g,'').slice(0,3);
  d.querySelector('.requestDate').oninput=e=>{let v=e.target.value.replace(/\D/g,'').slice(0,4);e.target.value=v.length>2?v.slice(0,2)+'/'+v.slice(2):v};
  d.querySelector('.remove').onclick=()=>{if(rows.children.length>1){d.remove();refresh();calc()}};
}
document.getElementById('add').onclick=add; add();

document.getElementById('form').onsubmit=async e=>{
  e.preventDefault();
  const f=new FormData(e.target);
  const refs=[...rows.children].map(r=>({
    bank:r.querySelector('.bank').value,
    requestNo:r.querySelector('.requestNo').value,
    requestDate:r.querySelector('.requestDate').value,
    requestCode:r.querySelector('.requestCode').value,
    limit:+r.querySelector('.limit').value
  }));
  const payload={
    firstName:f.get('firstName'),
    lastName:f.get('lastName'),
    tc:f.get('tc'),
    phone:f.get('phone'),
    requestedAmount:+f.get('requestedAmount'),
    references:refs
  };
  const s=document.getElementById('success');
  try{
    const response=await fetch('/api/applications',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });
    const result=await response.json();
    if(!response.ok) throw new Error(result.error||'Başvuru kaydedilemedi.');
    s.style.display='block';
    s.textContent='Başvurunuz alınmıştır. Başvuru numarası: '+result.applicationNo;
    e.target.reset(); rows.innerHTML=''; add(); calc();
  }catch(err){
    s.style.display='block';
    s.textContent='Başvurunuz şu anda kaydedilemedi. Lütfen tekrar deneyiniz.';
    console.error(err);
  }
};