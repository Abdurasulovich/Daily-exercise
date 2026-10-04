// Built-in exercise library (with Uzbek technique guides) and the default plan.
//
// kind:  weight  – kg × reps
//        reps    – reps, optional extra/assist kg (pull-ups, crunches)
//        time    – seconds per set (plank)
//        cardio  – one item measured in minutes (warm-up)

export const GROUPS = ['Kardio', 'Ko‘krak', 'Yelka', 'Triceps', 'Orqa', 'Biceps', 'Oyoq', 'Qorin'];

export const EXERCISES = [
  {
    id: 'treadmill', name: 'Yugurish yo‘lakchasida qizish', gymName: 'Treadmill', group: 'Kardio', kind: 'cardio',
    muscles: ['Yurak va o‘pka', 'Son', 'Boldir'],
    guide: {
      position: [
        'Yo‘lakcha to‘xtagan paytda tasmaga chiqing; avval yon tomondagi chetlarga turib, so‘ng tasmaga o‘ting.',
        'Xavfsizlik qisqichini kiyimingizga taqing.',
        'Tana tik, yelkalar bo‘sh, nigoh oldinga — oyoqqa emas.',
      ],
      steps: [
        '1–2 daqiqa: 4–6 km/soat tezlikda yuring.',
        'Keyingi 4–5 daqiqa: 8 km/soat tezlikda yengil yuguring (gaplasha oladigan darajada).',
        'Oxirgi 2 daqiqa: tezlikni 6 dan 3 km/soatgacha asta pasaytirib, sovuting.',
        'Qadamni kalta tuting, oyoqni tananing ostiga yumshoq qo‘ying.',
      ],
      breathing: [
        'Bir maromda nafas oling: burun orqali olib, og‘iz orqali chiqaring.',
        'Nafas qisib qolsa — tezlikni pasaytiring.',
      ],
      mistakes: [
        'Tutqichlarni mahkam ushlab yurish — muvozanat va yuklama buziladi.',
        'Juda uzun qadam tashlab, tovon bilan qattiq urish.',
        'Tasmaning old chetiga, panelga juda yaqin yurish.',
        'Isinishni o‘tkazib yuborib, birdan og‘ir mashqqa o‘tish.',
      ],
      safety: 'Tasma harakatlanayotganda undan sakrab tushmang — avval to‘xtating. Bosh aylansa yoki ko‘krakda og‘riq bo‘lsa, darhol to‘xtang.',
    },
  },
  {
    id: 'bench', name: 'Yotib shtanga itarish', gymName: 'Bench press', group: 'Ko‘krak', kind: 'weight', step: 2.5,
    muscles: ['Ko‘krak', 'Yelka oldi', 'Triceps'],
    guide: {
      position: [
        'Skameykaga chalqancha yoting: ko‘zlaringiz shtanga ostida bo‘lsin.',
        'Bosh, yelka kuraklari va dumba skameykaga tegib tursin; oyoqlar polda mahkam, tizzalar taxminan 90°.',
        'Kuraklarni orqaga va pastga yig‘ing — ko‘krak biroz ko‘tariladi, belda kichik tabiiy egilish qoladi.',
        'Grifni yelkadan biroz kengroq ushlang, bosh barmoq grifni o‘rab tursin; bilaklar tik, orqaga qayrilmasin.',
      ],
      steps: [
        'Shtangani stoykadan oling va qo‘llarni tik holda yelkalar ustida ushlang.',
        '2–3 soniyada nazorat bilan ko‘krakning pastki qismiga (ko‘krak uchlari chizig‘i) tushiring.',
        'Pastda tirsaklar tanadan 45–70° burchakda, bilaklar tirsak ustida tik bo‘lsin.',
        'Grif ko‘krakka yengil tekkach, oyoqlarni polga tirab, shtangani yuqoriga va biroz bosh tomonga itaring.',
        'Tepada tirsakni keskin qulflamang; keyingi takrorga o‘ting.',
      ],
      breathing: [
        'Tepada nafas oling va tushirish paytida ushlab turing.',
        'Itarishning eng og‘ir qismidan o‘tgach nafas chiqaring.',
      ],
      mistakes: [
        'Tirsaklarni 90° ga yoyib yuborish — yelka bo‘g‘imiga ortiqcha yuk tushadi.',
        'Shtangani ko‘krakdan sakratish yoki dumbani skameykadan ko‘tarish.',
        'Bilaklarni orqaga bukish.',
        'Kuraklarni bo‘shatib, yelkalarni oldinga chiqarish.',
      ],
      safety: 'Og‘irlik oshganda sug‘urtachi bilan ishlang yoki stoykaning xavfsizlik tayanchlarini ko‘krak balandligiga qo‘ying. Disklarga albatta qulf (zamok) taqing.',
    },
  },
  {
    id: 'incline-db', name: 'Qiya o‘rindiqda gantel itarish', gymName: 'Incline dumbbell press', group: 'Ko‘krak', kind: 'weight', step: 1,
    muscles: ['Ko‘krakning yuqori qismi', 'Yelka oldi', 'Triceps'],
    guide: {
      position: [
        'Skameyka suyanchig‘ini 30–45° ga qo‘ying.',
        'Gantellarni sonlarga qo‘yib o‘tiring, so‘ng orqaga yotib, tizza yordamida ko‘krak yoniga olib chiqing.',
        'Bosh, kuraklar va dumba suyanchiqqa tegib tursin; oyoqlar polda.',
        'Kaftlar oyoq tomonga qaragan, gantellar yelka chizig‘ida.',
      ],
      steps: [
        'Gantellarni yuqoriga itaring — tepada yelkalar ustida bir-biriga yaqinlashadi, lekin urilmaydi.',
        '2–3 soniyada ko‘krakning yuqori qismi yoniga nazorat bilan tushiring.',
        'Pastda tirsaklar tanadan 45–60°, bilaklar tirsak ustida tik bo‘lsin.',
        'Ko‘krakda yengil cho‘zilish sezilganda qayta itaring.',
      ],
      breathing: ['Tushirishda nafas oling.', 'Itarishda nafas chiqaring.'],
      mistakes: [
        'Suyanchiqni juda tik (60° dan ortiq) qo‘yish — yuk asosan yelkaga o‘tadi.',
        'Gantellarni pastda nazoratsiz tashlab yuborish.',
        'Belni haddan ortiq bukib, dumbani o‘rindiqdan ko‘tarish.',
        'Tepada gantellarni bir-biriga urish.',
      ],
      safety: 'Tugatgach, gantellarni ko‘krakka olib, oyoqlarni ko‘tarib o‘tirish holatiga qayting — gantellarni yon tomonga tashlamang.',
    },
  },
  {
    id: 'shoulder-press', name: 'O‘tirib gantel bilan yelka pressi', gymName: 'Seated dumbbell shoulder press', group: 'Yelka', kind: 'weight', step: 1,
    muscles: ['Yelka (oldingi va o‘rta qism)', 'Triceps', 'Trapetsiya'],
    guide: {
      position: [
        'Skameyka suyanchig‘ini 80–90° (deyarli tik) qo‘ying.',
        'O‘tiring: bel, kuraklar va bosh suyanchiqqa tegib tursin; oyoqlar polda, yelka kengligida.',
        'Gantellarni quloq balandligiga ko‘taring: kaftlar oldinga, bilaklar tirsak ustida tik.',
        'Tirsaklar biroz oldinda (tanadan taxminan 30° oldinga), to‘liq yonga yoyilmagan.',
      ],
      steps: [
        'Gantellarni yuqoriga va biroz ichkariga itaring — tepada bosh ustida yaqinlashadi.',
        'Tepada tirsaklarni keskin qulflamang.',
        '2–3 soniyada quloq balandligiga qadar nazorat bilan tushiring.',
        'Butun harakat davomida bel suyanchiqdan ajralmasin.',
      ],
      breathing: ['Pastda nafas oling.', 'Yuqoriga itarganda nafas chiqaring.'],
      mistakes: [
        'Belni egib, ko‘krakni oldinga chiqarish (suyanchiqdan uzilish).',
        'Gantellarni yarim yo‘lgacha tushirib, qisqa amplitudada ishlash.',
        'Bilaklarni orqaga qayirish.',
        'Bo‘yinni oldinga cho‘zish yoki yelkalarni quloqqa qisish.',
      ],
      safety: 'Yelkada o‘tkir og‘riq bo‘lsa, amplitudani qisqartiring yoki og‘irlikni kamaytiring.',
    },
  },
  {
    id: 'lateral-raise', name: 'Gantelni yonga ko‘tarish', gymName: 'Dumbbell lateral raise', group: 'Yelka', kind: 'weight', step: 1,
    muscles: ['Yelkaning o‘rta qismi', 'Trapetsiya'],
    guide: {
      position: [
        'Tik turing, oyoqlar son kengligida, tizzalar biroz bukilgan.',
        'Gantellar son yonida, kaftlar tanaga qaragan.',
        'Tanani juda ozgina oldinga engashtiring; qorin taranglangan, yelkalar pastda.',
        'Tirsaklar biroz bukilgan — bu burchak butun harakat davomida saqlanadi.',
      ],
      steps: [
        'Gantellarni yon tomonlarga yelka balandligigacha ko‘taring — harakatni tirsak bilan “yetaklang”.',
        'Tepada tirsak bilakdan biroz yuqori yoki bir xil balandlikda bo‘lsin.',
        '1 soniya to‘xtang.',
        '2–3 soniyada sekin pastga tushiring.',
      ],
      breathing: ['Ko‘tarishda nafas chiqaring.', 'Tushirishda nafas oling.'],
      mistakes: [
        'Tana bilan silkitib (inersiya bilan) ko‘tarish.',
        'Yelkadan yuqori ko‘tarib, yelkalarni quloqqa qisish.',
        'Juda og‘ir gantel olish — texnika buziladi.',
        'Qo‘llarni butunlay tekis qilib qulflash.',
      ],
      safety: 'Bu mashqda to‘g‘ri texnika og‘irlikdan muhimroq. Yelkada chimchilash sezilsa, ko‘tarish balandligini kamaytiring.',
    },
  },
  {
    id: 'pushdown', name: 'Blokda qo‘lni pastga yozish', gymName: 'Cable triceps pushdown', group: 'Triceps', kind: 'weight', step: 2.5,
    muscles: ['Triceps'],
    guide: {
      position: [
        'Yuqori blokka to‘g‘ri grif yoki arqon ulang, blokka yuzlanib turing.',
        'Oyoqlar son kengligida, tizzalar biroz bukilgan, tana juda ozgina oldinga engashgan.',
        'Tirsaklarni tana yoniga mahkam qo‘ying — mashq davomida ular joyidan qimirlamaydi.',
        'Grifni kaftlar pastga qaragan holda ushlang, bilaklar to‘g‘ri.',
      ],
      steps: [
        'Boshlanishda bilaklar taxminan polga parallel (yoki biroz yuqori).',
        'Faqat tirsakda bukib, grifni qo‘llar to‘liq tekislanguncha pastga bosing.',
        'Pastda 1 soniya tricepsni qisib turing.',
        'Sekin, nazorat bilan bilaklarni boshlang‘ich holatga qaytaring.',
      ],
      breathing: ['Pastga bosishda nafas chiqaring.', 'Qaytarishda nafas oling.'],
      mistakes: [
        'Tirsaklarni oldinga-orqaga yurgizish (yelka ishlab ketadi).',
        'Tana og‘irligi bilan grifga osilib bosish.',
        'Grifni ko‘krakdan tepaga qaytarib yuborish.',
        'Bilaklarni bukish.',
      ],
      safety: 'Og‘irlik plitalari yuqoriga “sakramasin” — qaytarishni sekin bajaring.',
    },
  },
  {
    id: 'overhead-ext', name: 'Bosh ustidan blokda qo‘l yozish', gymName: 'Overhead cable triceps extension', group: 'Triceps', kind: 'weight', step: 2.5,
    muscles: ['Triceps (ayniqsa uzun boshi)'],
    guide: {
      position: [
        'Blokni bosh balandligiga yoki biroz yuqoriga qo‘ying, arqon ulang.',
        'Arqonni ikki qo‘llab ushlab, apparatga ORQA o‘girib turing va bir qadam oldinga chiqing.',
        'Bir oyoq oldinda, ikkinchisi orqada; tana 20–30° oldinga engashgan, bel to‘g‘ri.',
        'Yelka qismi bosh yonida, tirsaklar oldinga-yuqoriga qaragan; arqon bosh orqasida.',
      ],
      steps: [
        'Faqat tirsakda yozib, arqonni oldinga-yuqoriga, qo‘llar tekislanguncha chiqaring.',
        'Oxirida tricepsni 1 soniya qisib turing.',
        'Sekin bosh orqasiga qaytaring — tricepsda cho‘zilish sezilsin.',
        'Tirsaklar butun harakat davomida bir joyda va bir-biriga yaqin tursin.',
      ],
      breathing: ['Yozishda nafas chiqaring.', 'Qaytarishda nafas oling.'],
      mistakes: [
        'Tirsaklarni yon tomonlarga keng yoyib yuborish.',
        'Belni haddan tashqari bukib, ko‘krakni oldinga “tashlash”.',
        'Yelkalar bilan tortish — tirsak qimirlab ketadi.',
        'Bosh orqasiga yetarlicha qaytarmaslik (qisqa amplituda).',
      ],
      safety: 'Silkinmasdan bajaring. Yelka bo‘g‘imida og‘riq bo‘lsa, og‘irlikni kamaytiring yoki tirsakni biroz pastroq tuting.',
    },
  },
  {
    id: 'pullup', name: 'Keng ushlab turnikda tortilish', gymName: 'Wide-grip pull-up', group: 'Orqa', kind: 'reps', step: 2.5,
    muscles: ['Keng orqa mushagi', 'Biceps', 'Orqa yelka', 'Romboid'],
    guide: {
      position: [
        'Turnikni yelkadan kengroq, kaftlar oldinga qaragan holda ushlang.',
        'Qo‘llar deyarli tekis holda osilib turing; oyoqlarni biroz bukib chalishtirish mumkin.',
        'Qorin va dumba taranglangan, tana tebranmasin.',
        'Boshlashdan oldin yelkalarni pastga tushiring (kuraklarni “cho‘ntakka” soling).',
      ],
      steps: [
        'Tirsaklarni pastga va yonga tortib, ko‘krakni turnik tomon ko‘taring.',
        'Iyak turnikdan oshganda 1 soniya to‘xtang.',
        '2–3 soniyada qo‘llar deyarli tekislanguncha sekin tushing.',
        'Texnika buzilmaguncha imkon qadar ko‘p takrorlang.',
      ],
      breathing: ['Tortilishda nafas chiqaring.', 'Tushishda nafas oling.'],
      mistakes: [
        'Oyoqlarni silkitib (kipping) ko‘tarilish.',
        'Faqat iyakni cho‘zish, ko‘krakni ko‘tarmaslik.',
        'Pastda yelkalarni bo‘shatib osilib qolish yoki yarim amplitudada ishlash.',
        'Tushishda o‘zini tashlab yuborish.',
      ],
      safety: 'Hali tortila olmasangiz: yordamchi trenajyor (assisted pull-up), rezina lenta yoki yuqori blokni ko‘krakka tortish (lat pulldown) bilan bajaring — o‘sha harakat, o‘sha mushaklar. Yordamchi trenajyorda kg maydoniga yordam og‘irligini yozing.',
    },
  },
  {
    id: 'cable-row', name: 'O‘tirib blokni tortish', gymName: 'Seated cable row', group: 'Orqa', kind: 'weight', step: 2.5,
    muscles: ['Keng orqa mushagi', 'Romboid va trapetsiya o‘rtasi', 'Biceps', 'Orqa yelka'],
    guide: {
      position: [
        'O‘rindiqqa o‘tiring, oyoqlarni tayanchga qo‘ying, tizzalar biroz bukilgan.',
        'Dastakni (V-shaklli) ushlab, bel to‘g‘ri holda o‘tiring; ko‘krak oldinga, yelkalar pastda.',
        'Boshlanishda qo‘llar oldinga cho‘zilgan, tana biroz oldinga engashgan, lekin bel bukilmagan.',
      ],
      steps: [
        'Avval kuraklarni bir-biriga yaqinlashtiring, so‘ng tirsaklarni tana yonidan orqaga torting.',
        'Tanani tik holatga keltirib, dastakni qorinning yuqori qismiga olib keling.',
        'Oxirida kuraklarni 1 soniya qisib turing.',
        'Sekin, qo‘llar to‘liq cho‘zilguncha qaytaring.',
      ],
      breathing: ['Tortishda nafas chiqaring.', 'Qaytarishda nafas oling.'],
      mistakes: [
        'Tana bilan orqaga yotib, silkitib tortish.',
        'Belni bukib, orqani yumaloqlash.',
        'Yelkalarni quloqqa ko‘tarish.',
        'Faqat qo‘llar bilan tortish, kuraklarni ishlatmaslik.',
      ],
      safety: 'Tugatgach, og‘irlikni tizzalarni bukib, bel to‘g‘ri holda joyiga qaytaring.',
    },
  },
  {
    id: 'straight-arm', name: 'Bir qo‘lda to‘g‘ri qo‘l bilan blok tortish', gymName: 'Single-arm straight-arm pulldown', group: 'Orqa', kind: 'weight', step: 2.5, perSide: true,
    muscles: ['Keng orqa mushagi', 'Katta yumaloq mushak', 'Triceps uzun boshi'],
    guide: {
      position: [
        'Blokni yuqori holatga qo‘yib, bitta dastak ulang; apparatga yuzlanib turing.',
        'Dastakni bir qo‘lda ushlang va bir-ikki qadam orqaga chiqing.',
        'Tos-sondan bukilib, tanani polga deyarli parallel (taxminan 90°) holatga keltiring; bel to‘g‘ri, tizzalar biroz bukilgan.',
        'Ishlovchi qo‘l oldinga-yuqoriga cho‘zilgan, tirsak juda ozgina bukilgan; ikkinchi qo‘l songa tiralgan.',
      ],
      steps: [
        'Tirsak burchagini o‘zgartirmasdan, qo‘lni yoy bo‘ylab pastga va orqaga — songa qadar torting.',
        'Oxirida keng orqa mushagining qisilishini his qiling, 1 soniya ushlang.',
        'Sekin boshlang‘ich holatga qaytaring — qo‘ltiq ostida cho‘zilish sezilsin.',
        'Barcha takrorlarni bajarib, keyin ikkinchi qo‘lga o‘ting.',
      ],
      breathing: ['Pastga tortishda nafas chiqaring.', 'Qaytarishda nafas oling.'],
      mistakes: [
        'Tirsakni bukib, harakatni oddiy tortishga aylantirish (biceps ishlab ketadi).',
        'Tana bilan aylanib, siltab tortish.',
        'Belni yumaloqlash.',
        'Yelkani quloqqa ko‘tarish.',
      ],
      safety: 'Bel og‘risa, tanani biroz ko‘taring (45–60°). Ikkala qo‘lga bir xil takror qiling.',
    },
  },
  {
    id: 'barbell-curl', name: 'Shtangani bitsepsga ko‘tarish', gymName: 'Barbell curl', group: 'Biceps', kind: 'weight', step: 2.5,
    muscles: ['Biceps', 'Brachialis', 'Bilak'],
    guide: {
      position: [
        'Tik turing, oyoqlar son kengligida, tizzalar biroz bukilgan.',
        'Shtangani yelka kengligida, kaftlar oldinga qaragan holda ushlang.',
        'Qo‘llar pastda, tirsaklar tana yonida; yelkalar orqaga tortilgan, qorin taranglangan.',
      ],
      steps: [
        'Tirsaklarni joyidan qimirlatmay, shtangani yoy bo‘ylab yelka balandligigacha ko‘taring.',
        'Tepada bicepsni 1 soniya qisib turing.',
        '2–3 soniyada qo‘llar deyarli tekislanguncha sekin tushiring.',
      ],
      breathing: ['Ko‘tarishda nafas chiqaring.', 'Tushirishda nafas oling.'],
      mistakes: [
        'Tana va bel bilan silkitib ko‘tarish.',
        'Tirsaklarni oldinga chiqarish (yelka ishlab ketadi).',
        'Pastda to‘liq tushirmaslik yoki shtangani tashlab yuborish.',
        'Bilaklarni bukish.',
      ],
      safety: 'Belda og‘riq sezilsa, devorga suyanib bajaring yoki og‘irlikni kamaytiring.',
    },
  },
  {
    id: 'db-curl', name: 'Gantelni bitsepsga ko‘tarish', gymName: 'Dumbbell curl', group: 'Biceps', kind: 'weight', step: 1,
    muscles: ['Biceps', 'Brachialis', 'Bilak'],
    guide: {
      position: [
        'Tik turing, gantellar son yonida, kaftlar tanaga qaragan.',
        'Tirsaklar tana yonida, yelkalar pastda va orqada, qorin taranglangan.',
      ],
      steps: [
        'Ko‘tarayotib kaftni yuqoriga burang (supinatsiya) va gantelni yelka tomon ko‘taring.',
        'Tepada 1 soniya qisib turing; tirsak oldinga chiqmasin.',
        'Sekin tushiring — pastda kaft yana tanaga qaraydi.',
        'Ikkala qo‘l bilan bir vaqtda yoki navbatma-navbat bajarish mumkin.',
      ],
      breathing: ['Ko‘tarishda nafas chiqaring.', 'Tushirishda nafas oling.'],
      mistakes: [
        'Silkitib, tana bilan yordam berish.',
        'Kaftni burmaslik — bicepsning to‘liq qisqarishi yo‘qoladi.',
        'Tirsakni oldinga-orqaga yurgizish.',
        'Juda tez tushirish.',
      ],
      safety: 'Gantellarni polga tashlamang — tizzani bukib, joyiga qo‘ying.',
    },
  },
  {
    id: 'leg-press', name: 'Oyoq pressi, yelka kengligida', gymName: 'Leg press', group: 'Oyoq', kind: 'weight', step: 5,
    muscles: ['Son oldi (kvadritseps)', 'Dumba', 'Son orqasi'],
    guide: {
      position: [
        'O‘rindiqqa o‘tiring: bel va dumba suyanchiqqa to‘liq tegib tursin, yon dastaklarni ushlang.',
        'Oyoqlarni platformaning o‘rtasiga, yelka kengligida, parallel (yoki biroz tashqariga) qo‘ying.',
        'Tovonlar platformadan ko‘tarilmasin.',
      ],
      steps: [
        'Platformani biroz itarib, xavfsizlik qulflarini oching.',
        'Tizzalarni taxminan 90° gacha bukib, platformani sekin tushiring; tizzalar oyoq panjasi yo‘nalishida.',
        'Tovonlar orqali itarib, platformani yuqoriga chiqaring.',
        'Tepada tizzalarni to‘liq qulflamang — biroz bukilgan qolsin.',
      ],
      breathing: ['Tushirishda nafas oling.', 'Itarishda nafas chiqaring.'],
      mistakes: [
        'Juda chuqur tushib, dumba va belni o‘rindiqdan ko‘tarish (bel yumaloqlanadi).',
        'Tizzalarni ichkariga “yiqitish”.',
        'Tepada tizzani to‘liq qulflash.',
        'Tovonni ko‘tarib, panja bilan itarish.',
      ],
      safety: 'Tugatgach, xavfsizlik qulflarini albatta yoping. Og‘ir yukda tizzani tepada hech qachon qulflamang.',
    },
  },
  {
    id: 'leg-press-wide', name: 'Oyoq pressi, keng turish', gymName: 'Wide-stance leg press', group: 'Oyoq', kind: 'weight', step: 5,
    muscles: ['Dumba', 'Sonning ichki mushaklari', 'Son oldi'],
    guide: {
      position: [
        'O‘rindiqqa to‘liq suyanib o‘tiring, yon dastaklarni ushlang.',
        'Oyoqlarni platformaga yelkadan kengroq qo‘ying, panjalar 30–45° tashqariga qaragan.',
        'Oyoqlar platformaning o‘rtasida yoki biroz yuqoriroqda bo‘lsin.',
      ],
      steps: [
        'Xavfsizlik qulflarini oching.',
        'Tizzalarni panjalar yo‘nalishida tashqariga ochib, platformani sekin tushiring (taxminan 90°).',
        'Tovonlar orqali itarib qaytaring.',
        'Tepada tizzani qulflamang.',
      ],
      breathing: ['Tushirishda nafas oling.', 'Itarishda nafas chiqaring.'],
      mistakes: [
        'Tizzalarning ichkariga bukilishi (panjalar yo‘nalishiga mos emas).',
        'Haddan tashqari keng turish — tos bo‘g‘imi noqulay holatga tushadi.',
        'Dumbani o‘rindiqdan ko‘tarish.',
        'Tovonni ko‘tarish.',
      ],
      safety: 'Tugatgach, xavfsizlik qulflarini yoping. Tos yoki tizzada og‘riq bo‘lsa, oyoqlar orasini toraytiring.',
    },
  },
  {
    id: 'leg-curl', name: 'Yotib oyoqni bukish', gymName: 'Lying leg curl', group: 'Oyoq', kind: 'weight', step: 2.5,
    muscles: ['Son orqasi', 'Boldir'],
    guide: {
      position: [
        'Trenajyorga qorin bilan yoting; tizzalar skameyka chetidan biroz chiqib tursin (tizza trenajyor o‘qi bilan bir chiziqda).',
        'Valikni to‘piqdan biroz yuqoriga, boldirning pastki qismiga sozlang.',
        'Old dastaklarni ushlang, tos skameykaga mahkam bosilgan.',
      ],
      steps: [
        'Tovonlarni dumba tomon yoy bo‘ylab imkon qadar yuqori torting.',
        'Tepada 1 soniya son orqasini qisib turing.',
        '2–3 soniyada oyoq deyarli tekislanguncha sekin tushiring.',
      ],
      breathing: ['Bukishda nafas chiqaring.', 'Tushirishda nafas oling.'],
      mistakes: [
        'Tosni skameykadan ko‘tarish.',
        'Og‘irlikni tashlab yuborish — tushirish ham nazoratli bo‘lsin.',
        'Silkitib, inersiya bilan bukish.',
        'Valikni noto‘g‘ri sozlash (tizza ostida yoki tovonda).',
      ],
      safety: 'Tizza ostida og‘riq bo‘lsa, og‘irlikni kamaytiring va valik holatini tekshiring.',
    },
  },
  {
    id: 'calf-press', name: 'Oyoq pressida boldir ko‘tarish', gymName: 'Calf press on leg press', group: 'Oyoq', kind: 'weight', step: 5,
    muscles: ['Boldir (gastroknemius, kambalasimon)'],
    guide: {
      position: [
        'Oyoq pressi o‘rindig‘iga o‘tiring, oyoqlar deyarli tekis (tizza biroz bukilgan).',
        'Faqat panjalar (oyoq kaftining old qismi) platformaning pastki chetida; tovonlar chetdan chiqib turadi.',
        'Oyoqlar son kengligida, panjalar to‘g‘ri oldinga.',
      ],
      steps: [
        'Tovonlarni pastga tushirib, boldirni yaxshilab cho‘zing.',
        'Panjalar bilan platformani itaring — xuddi barmoq uchida turgandek.',
        'Tepada 1 soniya qisib turing.',
        'Sekin, to‘liq cho‘zilguncha qaytaring.',
      ],
      breathing: ['Itarishda nafas chiqaring.', 'Qaytarishda nafas oling.'],
      mistakes: [
        'Tizzalarni bukib, son bilan itarish.',
        'Juda tez, sakratib bajarish — amplituda yo‘qoladi.',
        'Panjani juda chetga qo‘yish — oyoq sirpanib ketishi mumkin.',
        'Tizzalarni to‘liq qulflash.',
      ],
      safety: 'Oyoq sirpansa platforma tushib ketishi mumkin: panjalarni mahkam qo‘ying, sekin ishlang va qulflar qo‘l yetadigan joyda bo‘lsin.',
    },
  },
  {
    id: 'crunch', name: 'Qorin uchun tanani bukish', gymName: 'Crunches', group: 'Qorin', kind: 'reps', step: 2.5,
    muscles: ['Qorinning to‘g‘ri mushagi', 'Qiyshiq mushaklar'],
    guide: {
      position: [
        'Gilamchaga chalqancha yoting, tizzalar bukilgan, oyoq kaftlari polda.',
        'Qo‘llarni ko‘krakda chalishtiring (yoki barmoq uchlarini chakkaga qo‘ying).',
        'Bel polga tegib tursin; iyak bilan ko‘krak orasida musht sig‘adigan masofa qolsin.',
      ],
      steps: [
        'Qorinni qisib, yelka kuraklarini poldan ko‘taring — tananing yuqori qismi taxminan 30° ko‘tariladi.',
        'Bel polda qoladi; qovurg‘alarni tos tomon “yaqinlashtiring”.',
        'Tepada 1 soniya ushlang.',
        'Sekin tushiring, lekin boshni polga qo‘yib dam olmang.',
      ],
      breathing: ['Ko‘tarilishda nafas chiqaring.', 'Tushishda nafas oling.'],
      mistakes: [
        'Qo‘llar bilan bo‘yinni tortish.',
        'To‘liq o‘tirib olish — bu boshqa mashq, belga yuk tushadi.',
        'Tez, siltab bajarish.',
        'Belni poldan ko‘tarish.',
      ],
      safety: 'Bo‘yinda zo‘riqish sezilsa, qo‘llarni ko‘krakda chalishtirib bajaring va nigohni shiftga qarating.',
    },
  },
  {
    id: 'plank', name: 'Planka', gymName: 'Plank', group: 'Qorin', kind: 'time',
    muscles: ['Qorin (to‘g‘ri va ko‘ndalang)', 'Dumba', 'Yelka stabilizatorlari'],
    guide: {
      position: [
        'Bilaklarga tayaning: tirsaklar to‘g‘ri yelkalar ostida, bilaklar parallel.',
        'Oyoqlar tekis, oyoq barmoqlari polda, son kengligida.',
        'Bosh, yelka, tos va tovon bir to‘g‘ri chiziqda; nigoh polga.',
      ],
      steps: [
        'Qorinni ichga tortib qising, dumbani siqing.',
        'Tirsaklarni polga “bosib”, kuraklarni biroz yoying.',
        'Belgilangan vaqt (30–45 s) shu holatda turing.',
        'Texnika buzila boshlasa — to‘xtang.',
      ],
      breathing: ['Nafasni ushlab turmang: bir maromda, qisqa-qisqa nafas oling va chiqaring.'],
      mistakes: [
        'Tosni pastga osiltirish — bel bukiladi.',
        'Dumbani tepaga ko‘tarish.',
        'Boshni osiltirish yoki tepaga qarash.',
        'Nafasni ushlab turish.',
      ],
      safety: 'Belda og‘riq sezilsa, darhol to‘xtang; tizzaga tayanib bajariladigan yengil variantdan boshlang.',
    },
  },
];

const it = (exerciseId, sets, repMin, repMax, weight, rest = null) => ({ exerciseId, sets, repMin, repMax, weight, rest });
const warmup = () => ({ exerciseId: 'treadmill', sets: 1, repMin: 8, repMax: 10, weight: 0, rest: 0 });

const PUSH = () => [
  warmup(),
  it('bench', 3, 8, 12, 20, 120),
  it('incline-db', 3, 10, 12, 8),
  it('shoulder-press', 3, 10, 12, 8),
  it('lateral-raise', 3, 12, 15, 4),
  it('pushdown', 3, 10, 15, 25),
  it('overhead-ext', 3, 10, 15, 20),
];
const PULL = () => [
  warmup(),
  it('pullup', 3, null, null, 0, 120), // null reps = "max"
  it('cable-row', 3, 10, 12, 30),
  it('straight-arm', 3, 12, 15, 20),
  it('barbell-curl', 3, 10, 12, 15),
  it('db-curl', 3, 10, 12, 8),
];
const LEGS = () => [
  warmup(),
  it('leg-press', 3, 10, 15, 90, 120),
  it('leg-press-wide', 3, 10, 15, 80, 120),
  it('leg-curl', 3, 10, 15, 25),
  it('calf-press', 3, 15, 20, 70),
  it('crunch', 3, 12, 15, 0),
  it('plank', 3, 30, 45, 0),
];

/** day: 1 = Monday … 6 = Saturday (Sunday is always rest). */
export function defaultPlan() {
  const mk = (day, type, title, items) => ({ day, type, title, items });
  return [
    mk(1, 'push', 'Itarish', PUSH()),
    mk(2, 'pull', 'Tortish', PULL()),
    mk(3, 'legs', 'Oyoq + Press', LEGS()),
    mk(4, 'push', 'Itarish', PUSH()),
    mk(5, 'pull', 'Tortish', PULL()),
    mk(6, 'legs', 'Oyoq + Press', LEGS()),
  ];
}

export const DEFAULT_SETTINGS = {
  restDefault: 90,
  reminderEnabled: false,
  reminderTime: '17:00',
  gymTime: '18:00',
  reminderDays: [1, 2, 3, 4, 5, 6],
  lastBackupAt: null,
  backupNagAt: null,
  lastReminderDate: null,
  firstLaunch: null,
  persisted: null,
};

export const exerciseMeta = (id) => EXERCISES.find((e) => e.id === id);
