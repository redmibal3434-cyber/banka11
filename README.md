# V8 — Supabase merkezi veritabanı

Gerekli Vercel Production Environment Variables:
- SUPABASE_URL
- SUPABASE_SECRET_KEY
- SUPABASE_PUBLISHABLE_KEY (projede bulunabilir; V8 backend şu an secret key kullanır)
- ADMIN_PASSWORD (sizin belirleyeceğiniz güçlü admin şifresi)

V8:
- Başvurular localStorage yerine /api/applications üzerinden Supabase'e yazılır.
- Telefon, tablet ve bilgisayar başvuruları aynı veritabanına düşer.
- /admin merkezi veritabanını okur.
- Admin API'si ADMIN_PASSWORD olmadan veri döndürmez.
- SUPABASE_SECRET_KEY hiçbir zaman tarayıcıya gönderilmez.
