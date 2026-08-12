// ============================================================
// OneDent Klinika — Telegram bot (menyu + narxlar + yozilish)
// ============================================================
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

// ---------- SOZLAMALAR (shu qismni o'zgartiring) ----------
const TOKEN = process.env.BOT_TOKEN || "TOKENINGIZNI_BU_YERGA_YOZING";

// Yangi yozilish so'rovlari shu chat/guruhga yuboriladi (resepshin shu yerdan ko'radi)
// Guruh ID sini olish uchun pastdagi "GURUH ID OLISH" bo'limini o'qing
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || "GURUH_ID_BU_YERGA";

// Resepshin sayti botga ulanish uchun ishlatadigan maxfiy kalit.
// Buni o'zgartiring (istalgan uzun so'z) va xuddi shuni resepshin saytida ham kiritasiz.
const API_KEY = process.env.API_KEY || "onedent-maxfiy-kalit-2026";

// Narxlar ro'yxati — xohlagancha qator qo'shishingiz/o'zgartirishingiz mumkin
const PRICES = [
  { name: "Konsultatsiya (ko'rik)", price: "BEPUL" },
  { name: "RVG (1 ta tish rentgeni)", price: "40 000" },
  { name: "Professional tozalash (Ultratovush + Air Flow)", price: "500 000" },
  { name: "Oqartirish (Bleaching)", price: "2 500 000" },
  { name: "Kompozit plomba", price: "200 000 – 600 000" },
  { name: "Estetik restavratsiya", price: "800 000 – 1 000 000" },
  { name: "Kanal davolash (1 kanalli)", price: "180 000 – 250 000" },
  { name: "Kanal davolash (2 kanalli)", price: "200 000 – 300 000" },
  { name: "Kanal davolash (3 kanalli)", price: "300 000 – 450 000" },
  { name: "Kanal davolash (4 kanalli)", price: "500 000" },
  { name: "Oddiy tish sug'urish", price: "150 000 – 250 000" },
  { name: "Murakkab tish sug'urish", price: "300 000 – 500 000" },
  { name: "Aql tishini jarrohlik yo'li bilan olish", price: "400 000 – 600 000" },
  { name: "Implant o'rnatish", price: "1 800 000 – 6 000 000" },
  { name: "Metall-keramika koronka", price: "600 000 – 1 200 000" },
  { name: "Sirkoniy koronka", price: "1 200 000 – 2 000 000" },
  { name: "E-max koronka", price: "2 500 000" },
  { name: "Vinir (Vinish)", price: "2 500 000 – 3 500 000" },
  { name: "Shtampovka koronka (Sariq)", price: "300 000" },
  { name: "Protez", price: "1 500 000 – 5 000 000" },
  { name: "Breket", price: "3 500 000 – 12 000 000" },
  { name: "Elayner", price: "8 000 000 – 16 000 000" },
];
// ------------------------------------------------------------

const bot = new TelegramBot(TOKEN, { polling: true });

// Bosilganda ochiladigan doimiy menyu (pastdagi tugmalar)
const mainMenu = {
  reply_markup: {
    keyboard: [
      ["💰 Narxlar", "📅 Yozilish"],
      ["📍 Manzil", "☎️ Bog'lanish"]
    ],
    resize_keyboard: true
  }
};

// Slash-buyruqlar ro'yxati (Telegram'ning "/" menyusida chiqadi)
bot.setMyCommands([
  { command: "start", description: "Botni ishga tushirish" },
  { command: "narxlar", description: "Narxlar ro'yxati" },
  { command: "yozilish", description: "Qabulga yozilish" },
]);

// Har bir bemorning yozilish jarayoni holatini shu yerda saqlaymiz (xotirada)
const sessions = new Map();

// Botga /start bosgan barcha odamlar shu yerda saqlanadi (resepshin sayti shu ro'yxatni o'qiydi)
const subscribers = new Map(); // chatId -> {id, name, username, ts}

function priceListText(){
  const rows = PRICES.map(p => `• ${p.name} — <b>${p.price}</b>${p.price === "BEPUL" ? "" : " so'm"}`).join("\n");
  return `💰 <b>Narxlar ro'yxati</b>\n\n${rows}\n\nAniq narx ko'rikdan so'ng belgilanadi.`;
}

// ---------- /start ----------
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  sessions.delete(chatId);
  bot.sendMessage(chatId,
    `Assalomu alaykum, ${msg.from.first_name || ''}! 👋\nOneDent klinikasi botiga xush kelibsiz.\n\nPastdagi menyudan kerakli bo'limni tanlang 👇`,
    mainMenu
  );
  // Ro'yxatga qo'shamiz — resepshin sayti shu yerdan o'qiydi
  const fullName = [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ');
  subscribers.set(String(chatId), {
    id: String(chatId),
    name: fullName || "Noma'lum",
    username: msg.from.username || "",
    ts: Date.now()
  });

  // Resepshinga xabar: yangi odam botga yozdi
  if(ADMIN_CHAT_ID && ADMIN_CHAT_ID !== "GURUH_ID_BU_YERGA"){
    const username = msg.from.username ? `@${msg.from.username}` : "yo'q";
    bot.sendMessage(ADMIN_CHAT_ID,
      `🆕 <b>Yangi obunachi botga yozdi</b>\n\n👤 Ism: ${fullName}\n🔗 Username: ${username}\n💬 Chat ID: <code>${chatId}</code>\n\n<i>Bu ID'ni resepshin dasturida bemor profiliga kiriting.</i>`,
      { parse_mode: "HTML" }
    );
  }
});

// ---------- Narxlar ----------
bot.onText(/\/narxlar|💰 Narxlar/, (msg) => {
  bot.sendMessage(msg.chat.id, priceListText(), { parse_mode: "HTML" });
});

// ---------- Manzil / Bog'lanish (ixtiyoriy, xohlasangiz to'ldiring) ----------
bot.onText(/📍 Manzil/, (msg) => {
  bot.sendMessage(msg.chat.id, "📍 Manzil: shahringiz, ko'changiz, mo'ljal.\n🕒 Ish vaqti: 09:00–19:00");
});
bot.onText(/☎️ Bog'lanish/, (msg) => {
  bot.sendMessage(msg.chat.id, "☎️ Telefon: +998 90 888 15 55\n📷 Instagram: @onedent_uz\n\nSavollaringiz bo'lsa shu raqamga qo'ng'iroq qiling.");
});

// ---------- Yozilish (band qilish) jarayoni ----------
bot.onText(/\/yozilish|📅 Yozilish/, (msg) => {
  const chatId = msg.chat.id;
  sessions.set(chatId, { step: "name" });
  bot.sendMessage(chatId, "Ismingiz va familiyangizni yozing:\n(Bekor qilish uchun /bekor deb yozing)");
});

bot.onText(/\/bekor/, (msg) => {
  sessions.delete(msg.chat.id);
  bot.sendMessage(msg.chat.id, "Bekor qilindi.", mainMenu);
});

// Chat ID'ni bilish uchun (guruhda yoki shaxsiy chatda /chatid deb yozing)
bot.onText(/\/chatid/, (msg) => {
  bot.sendMessage(msg.chat.id, `Bu chatning ID'si: <code>${msg.chat.id}</code>`, { parse_mode: "HTML" });
});

// Barcha oddiy matnli xabarlarni ushlab, yozilish jarayonini boshqaramiz
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = (msg.text || "").trim();

  // Menyu tugmalari yoki buyruqlar bo'lsa, bu handlerda ishlov bermaymiz
  if(!text || text.startsWith('/') || ["💰 Narxlar","📅 Yozilish","📍 Manzil","☎️ Bog'lanish"].includes(text)) return;

  const session = sessions.get(chatId);
  if(!session) return; // hech qanday jarayon boshlanmagan — e'tiborsiz qoldiramiz

  if(session.step === "name"){
    session.name = text;
    session.step = "phone";
    bot.sendMessage(chatId, "Telefon raqamingizni yozing (masalan: +998901234567):");
    return;
  }
  if(session.step === "phone"){
    session.phone = text;
    session.step = "date";
    bot.sendMessage(chatId, "Qaysi sanaga yozilmoqchisiz? (masalan: 15.08.2026)");
    return;
  }
  if(session.step === "date"){
    session.date = text;
    session.step = "time";
    bot.sendMessage(chatId, "Soat nechida qulay? (masalan: 14:00)");
    return;
  }
  if(session.step === "time"){
    session.time = text;
    session.step = "note";
    bot.sendMessage(chatId, "Qo'shimcha izoh bormi? (masalan: qaysi tish og'riyapti). Bo'lmasa \"yo'q\" deb yozing:");
    return;
  }
  if(session.step === "note"){
    session.note = text;
    sessions.delete(chatId);

    // Bemorga tasdiq
    bot.sendMessage(chatId,
      `✅ So'rovingiz qabul qilindi!\n\n👤 ${session.name}\n📞 ${session.phone}\n📅 ${session.date} ${session.time}\n\nResepshin siz bilan tez orada bog'lanadi.`,
      mainMenu
    );

    // Resepshinga (guruhga) yuborish
    if(ADMIN_CHAT_ID && ADMIN_CHAT_ID !== "GURUH_ID_BU_YERGA"){
      bot.sendMessage(ADMIN_CHAT_ID,
        `🆕 <b>Yangi yozilish so'rovi</b>\n\n` +
        `👤 Ism: ${session.name}\n` +
        `📞 Telefon: ${session.phone}\n` +
        `📅 Sana: ${session.date}\n` +
        `🕒 Vaqt: ${session.time}\n` +
        `📝 Izoh: ${session.note}\n\n` +
        `💬 Telegram Chat ID: <code>${chatId}</code>\n` +
        `<i>(Bu ID'ni resepshin dasturida "Telegram obunachilar" bo'limidan yoki bemor profilidan topib, unga bog'lang)</i>`,
        { parse_mode: "HTML" }
      );
    }
    return;
  }
});

console.log("Bot ishga tushdi...");

// ============================================================
// Kichik web-server — resepshin sayti shu orqali obunachilar
// ro'yxatini va yozilish so'rovlarini oladi
// ============================================================
const app = express();
app.use(cors());
app.use(express.json());

function checkKey(req, res, next){
  if(req.query.key !== API_KEY){
    return res.status(401).json({ ok:false, error:"Noto'g'ri kalit" });
  }
  next();
}

// Obunachilar ro'yxati
app.get('/api/subscribers', checkKey, (req, res) => {
  res.json({ ok:true, subscribers: Array.from(subscribers.values()) });
});

// Serverning tirikligini tekshirish uchun
app.get('/', (req, res) => {
  res.send('OneDent bot server ishlayapti ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishga tushdi`);
});
