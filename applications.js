const {SUPABASE_URL,headers,okConfig}=require('./_supabase');

module.exports=async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  if(!okConfig()) return res.status(500).json({error:'Sunucu bağlantısı yapılandırılmamış.'});
  try{
    const b=req.body||{};
    const firstName=String(b.firstName||'').trim();
    const lastName=String(b.lastName||'').trim();
    const tc=String(b.tc||'').replace(/\D/g,'');
    const phone=String(b.phone||'').trim();
    const amount=Number(b.requestedAmount);
    const refs=Array.isArray(b.references)?b.references:[];
    if(!firstName||!lastName||tc.length!==11||!phone||!Number.isFinite(amount)||amount<=0||refs.length<1){
      return res.status(400).json({error:'Eksik veya geçersiz başvuru bilgisi.'});
    }
    for(const r of refs){
      if(!r.bank || !Number.isFinite(Number(r.limit)) || Number(r.limit)<0){
        return res.status(400).json({error:'Referans banka bilgileri eksik.'});
      }
    }
    const applicationNo='FDK-'+Date.now().toString().slice(-9)+'-'+Math.floor(100+Math.random()*900);
    const appResp=await fetch(`${SUPABASE_URL}/rest/v1/applications`,{
      method:'POST',
      headers:headers({Prefer:'return=representation'}),
      body:JSON.stringify({
        application_no:applicationNo,
        first_name:firstName,
        last_name:lastName,
        tc_no:tc,
        phone,
        requested_amount:amount,
        status:'Yeni'
      })
    });
    const appData=await appResp.json();
    if(!appResp.ok) throw new Error(JSON.stringify(appData));
    const app=appData[0];
    const bankRows=refs.map(r=>({
      application_id:app.id,
      bank_name:String(r.bank),
      request_no:String(r.requestNo||'')||null,
      request_date:String(r.requestDate||'')||null,
      request_code:String(r.requestCode||'')||null,
      available_limit:Number(r.limit)
    }));
    const refResp=await fetch(`${SUPABASE_URL}/rest/v1/bank_references`,{
      method:'POST',
      headers:headers(),
      body:JSON.stringify(bankRows)
    });
    if(!refResp.ok){
      await fetch(`${SUPABASE_URL}/rest/v1/applications?id=eq.${app.id}`,{method:'DELETE',headers:headers()});
      throw new Error(await refResp.text());
    }
    return res.status(201).json({ok:true,applicationNo});
  }catch(err){
    console.error('application create error',err);
    return res.status(500).json({error:'Başvuru kaydedilemedi.'});
  }
};