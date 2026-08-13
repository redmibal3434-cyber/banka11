const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
function headers(extra={}) {
  return {
    apikey: SUPABASE_SECRET_KEY,
    Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
    'Content-Type': 'application/json',
    ...extra
  };
}
function okConfig(){
  return Boolean(SUPABASE_URL && SUPABASE_SECRET_KEY);
}
module.exports={SUPABASE_URL,headers,okConfig};
