const {SUPABASE_URL,headers,okConfig}=require('./_supabase');

module.exports=async function handler(req,res){
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
  if(!okConfig()) return res.status(500).json({error:'Sunucu bağlantısı yapılandırılmamış.'});
  const adminPassword=process.env.ADMIN_PASSWORD;
  if(!adminPassword) return res.status(500).json({error:'Admin şifresi yapılandırılmamış.'});
  if(req.headers['x-admin-password']!==adminPassword) return res.status(401).json({error:'Yetkisiz erişim.'});
  try{
    const appResp=await fetch(`${SUPABASE_URL}/rest/v1/applications?select=*&order=created_at.desc`,{headers:headers()});
    if(!appResp.ok) throw new Error(await appResp.text());
    const apps=await appResp.json();
    if(!apps.length) return res.status(200).json([]);
    const ids=apps.map(x=>x.id).join(',');
    const refResp=await fetch(`${SUPABASE_URL}/rest/v1/bank_references?select=*&application_id=in.(${ids})&order=id.asc`,{headers:headers()});
    if(!refResp.ok) throw new Error(await refResp.text());
    const refs=await refResp.json();
    const out=apps.map(a=>({...a,references:refs.filter(r=>r.application_id===a.id)}));
    return res.status(200).json(out);
  }catch(err){
    console.error('admin list error',err);
    return res.status(500).json({error:'Başvurular alınamadı.'});
  }
};