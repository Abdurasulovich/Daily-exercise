# Daily-exercise

# Mashq Kundaligi

Shaxsiy mashg‘ulot kundaligi — o‘rnatiladigan, to‘liq oflayn ishlaydigan PWA.
Oddiy HTML + CSS + JavaScript (ES modullar), framework yo‘q, build bosqichi yo‘q.

- **Bugun** — kunlik reja, har bir set uchun kg/takror, dam olish taymeri, eslatma, yakuniy natija.
- **Mashqlar** — 18 ta mashq: animatsiyali rasm, boshlang‘ich holat, bajarilishi, nafas, xatolar, xavfsizlik.
- **Natijalar** — kalendar, seriya (streak), mashq bo‘yicha grafiklar, tana vazni, har bir kun tafsiloti.
- **Sozlamalar** — rejani tahrirlash, eslatma, taymer, eksport/import, ma’lumotlarni o‘chirish.

## Lokal ishga tushirish

Service worker faqat `https://` yoki `localhost` da ishlaydi, shuning uchun faylni shunchaki ochish (`file://`) yetmaydi.

```bash
python tools/serve.py 8123
```

So‘ng brauzerda: <http://localhost:8123>. (`tools/serve.py` keshni o‘chirib beradi, ishlab chiqishda qulay.
Oddiy `python -m http.server 8123` ham ishlaydi.)

Sinov uchun boshqa sanani “bugun” deb ko‘rsatish mumkin: `http://localhost:8123/?today=2026-10-05`.
Bu sanaga yozilgan ma’lumot haqiqiy bazaga tushadi; keyin Sozlamalar → “Barcha ma’lumotlarni o‘chirish” bilan tozalang.

Testlar (Node 18+):

```bash
node --test tests/logic.test.mjs
```

Barcha rasmlarni tekshirish sahifasi: <http://localhost:8123/tests/figures.html> (har bir mashq: animatsiya, boshlanish va oxirgi holat).

## Internetga joylash (HTTPS majburiy)

O‘rnatish va oflayn ishlash uchun sayt **HTTPS** orqali ochilishi shart. Istalgan statik hosting mos keladi.

**GitHub Pages:**
1. GitHub’da yangi repozitoriy yarating va barcha fayllarni yuklang (`index.html` ildizda bo‘lsin).
2. Repozitoriy → **Settings → Pages** → *Source*: “Deploy from a branch”, branch `main`, papka `/ (root)` → **Save**.
3. 1–2 daqiqadan so‘ng ilova `https://<username>.github.io/<repo>/` manzilida ochiladi.

Barcha yo‘llar nisbiy, shuning uchun ilova pastki papkada ham ishlaydi. Netlify / Cloudflare Pages / Vercel’da ham
xuddi shunday: papkani “static site” sifatida yuklang, build buyrug‘i kerak emas.

**Yangilash:** fayllarni o‘zgartirgach, `sw.js` dagi `VERSION` ni va `js/version.js` dagi `APP_VERSION` ni oshiring
(masalan `1.0.1`). Telefondagi ilova keyingi ochilishda “Yangi versiya tayyor → Yangilash” xabarini ko‘rsatadi.
Yangi fayl qo‘shsangiz, uni `sw.js` dagi `ASSETS` ro‘yxatiga ham yozing (test buni tekshiradi).

## Telefonga o‘rnatish

**Android (Chrome):** saytni oching → Sozlamalar tabidagi **“Ilovani o‘rnatish”** tugmasi yoki brauzer menyusi (⋮) →
“Ilovani o‘rnatish”. Ilova bosh ekranda alohida ilova sifatida ochiladi.

**iPhone (Safari):** saytni **Safari**’da oching → pastdagi **Ulashish** tugmasi → **Add to Home Screen /
“На экран «Домой»”** → **Add**. Keyin ilovani faqat bosh ekrandagi belgidan oching (bildirishnomalar va
doimiy saqlash shunda ishlaydi).

## Ma’lumotlar qayerda saqlanadi

- Hammasi telefon ichidagi **IndexedDB** bazasida (`mashq-kundaligi`): `exercises`, `plan`, `sessions`
  (sana bo‘yicha), `bodyWeights`, `settings`. Hech qanday server yo‘q, ma’lumot hech qayerga yuborilmaydi.
- Har bir o‘zgarish darhol saqlanadi (yozish paytida 0,4–0,5 s kechikish bilan; ilova fonga o‘tganda darhol).
- Birinchi ochilishda `navigator.storage.persist()` so‘raladi — brauzer bazani o‘zi o‘chirib yubormasligi uchun.
- Sxema versiyalangan: `js/db.js` dagi `DB_VERSION` va `MIGRATIONS` — kelajakdagi o‘zgarishlar eski ma’lumotni ko‘chiradi.
- **Zaxira:** Sozlamalar → Eksport (JSON fayl). Ilova har 7 kunda eksport qilishni eslatadi. Import fayldagi
  ma’lumot bilan joriy ma’lumotni to‘liq almashtiradi (oldin tasdiqlash so‘raladi).
- ⚠️ iPhone’da ilovani bosh ekrandan o‘chirsangiz, uning ma’lumotlari ham o‘chadi — muntazam eksport qiling.

## Bildirishnomalar: nima ishlaydi, nima ishlamaydi

Veb-ilova **yopiq** bo‘lganda aniq vaqtda bildirishnoma yuborishning ishonchli yo‘li faqat **Web Push** (server orqali).
Bu versiyada server yo‘q, shuning uchun quyidagilar amalga oshirilgan:

| Imkoniyat | Android (Chrome, o‘rnatilgan) | iPhone (iOS 16.4+, bosh ekranga o‘rnatilgan) | Kompyuter brauzeri |
|---|---|---|---|
| Ilova ochilganda “bugungi mashg‘ulot tugamadi” banneri (eslatma vaqtidan keyin) | ✅ | ✅ | ✅ |
| Ilova ochiq/fonda turganda eslatma vaqtida bildirishnoma | ✅ (sahifa tirik bo‘lsa) | ⚠️ ilova to‘xtatilsa ishlamaydi | ✅ (tab ochiq bo‘lsa) |
| Ilova yopiq: Periodic Background Sync | ⚠️ brauzer o‘zi tanlagan vaqtda, taxminan 12+ soatda bir marta; aniq soat kafolatlanmaydi | ❌ qo‘llab-quvvatlanmaydi | ❌ (faqat o‘rnatilgan Chromium ilovada) |
| Dam olish taymeri: tovush + tebranish | ✅ | ⚠️ tebranish yo‘q (iOS `vibrate` API’ni bermaydi), tovush bor | ✅ tovush |
| Dam olish taymeri tugaganda bildirishnoma (ilova fonda) | ⚠️ telefon sahifani “muzlatib” qo‘ymasa | ⚠️ odatda ishlamaydi | ✅ |
| Aniq soatda, ilova yopiq bo‘lsa ham | ❌ Web Push kerak | ❌ Web Push kerak | ❌ Web Push kerak |

Ruxsat: **Sozlamalar → Eslatma → “Bildirishnomaga ruxsat berish”**, keyin “Kunlik eslatmani yoqish”.
Standart: 17:00, Dushanba–Shanba, matn: *“Bugun Itarish kuni — 18:00 da zalda ko‘rishamiz!”*
(eslatma vaqti va zal vaqti alohida sozlanadi). iPhone’da ruxsat so‘rash tugmasi faqat bosh ekranga o‘rnatilgan ilovada ishlaydi.

### Web Push qo‘shish (kelajak uchun)

Kod bunga tayyor: `sw.js` da `push` va `notificationclick` hodisalari bor, `js/notify.js` da `subscribePush()`.
Kerakli qadamlar:

1. VAPID kalitlarini yarating: `npx web-push generate-vapid-keys`.
2. Kichik backend (masalan Node + `web-push` kutubxonasi, Cloudflare Worker yoki Supabase Edge Function):
   - `POST /subscribe` — brauzer obunasini (endpoint + kalitlar) saqlaydi;
   - cron (har kuni 17:00, Toshkent vaqti) — har bir obunaga `{"title","body","url"}` JSON bilan push yuboradi.
     Bugungi mashg‘ulot bajarilganini bilish uchun ilova tugatilgan kunni serverga ham yuborishi mumkin (ixtiyoriy).
3. Ilovada ruxsat olingandan keyin chaqiring:
   `subscribePush({ vapidPublicKey: '<public key>', endpoint: 'https://<server>/subscribe' })`.
4. Push xabari kelganda `sw.js` uni avtomatik ko‘rsatadi; bosilganda ilova `#/bugun` sahifasida ochiladi.
   iPhone’da Web Push faqat bosh ekranga o‘rnatilgan ilovada (iOS 16.4+) ishlaydi.

## Seriya (streak) qoidalari

- Kun **bajarilgan** hisoblanadi, agar mashqlarning kamida **80%** belgilangan bo‘lsa (mashq barcha setlari
  belgilanganda yoki mashqning o‘zi qo‘lda belgilanganda bajarilgan sanaladi).
- 0% dan ko‘p, lekin 80% dan kam — **qisman** (kalendarda sariq). Qisman kun ham seriyani to‘xtatadi.
- **Yakshanba** (va rejada mashqi yo‘q kunlar) dam olish kuni — seriyani hech qachon buzmaydi.
- O‘tkazib yuborilgan mashg‘ulot kuni seriyani nolga tushiradi. Bugungi kun tugamaguncha seriyani buzmaydi.
- Ilova birinchi marta ochilgan kundan oldingi kunlar “o‘tkazilgan” hisoblanmaydi.

## Fayl tuzilishi

```
index.html          ilova qobig‘i
manifest.json       PWA manifest (nom, ikonalar, standalone)
sw.js               service worker: versiyalangan kesh, oflayn, eslatma, push
css/styles.css      dizayn (qorong‘i mavzu, katta tugmalar)
js/app.js           ishga tushirish, marshrutlash, SW ro‘yxati
js/db.js            IndexedDB o‘rami + migratsiyalar
js/store.js         ilova holati, saqlash, eksport/import
js/logic.js         sof mantiq: sanalar, seriya, statistika, progressiya (testlangan)
js/seed.js          mashqlar kutubxonasi, yo‘riqnomalar, standart reja
js/figure.js        SVG figura “skeleti” va CSS animatsiya generatori
js/illustrations.js har bir mashq uchun pozalar va jihozlar
js/timer.js         dam olish taymeri
js/notify.js        bildirishnomalar, periodic sync, push tayyorgarligi
js/install.js       o‘rnatish tugmasi / iOS aniqlash
js/charts.js        SVG grafiklar
js/backup.js        eksport fayli va haftalik eslatma
js/views/*.js       4 ta ekran
icons/              ikonalar (`node tools/make-icons.mjs` bilan qayta yaratiladi)
tests/              unit testlar va rasm tekshiruv sahifasi
```
