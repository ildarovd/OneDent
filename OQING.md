# OneDent bot — sozlash va ishga tushirish

## 1. Kodni sozlash
`index.js` faylini oching va tepasidagi ikkita joyni to'ldiring:
- `TOKEN` — BotFather bergan tokeningiz
- `ADMIN_CHAT_ID` — resepshin xabarlarni ko'radigan guruh ID (pastda qanday olishni ko'rsatilgan)
- `PRICES` ro'yxatini o'z narxlaringizga moslab tahrirlang

## 2. Guruh ID olish
1. Telegram'da yangi guruh yarating (masalan "OneDent — Yozilishlar")
2. Botingizni (@onedent_uz_bot) shu guruhga a'zo qiling
3. Guruhga istalgan xabar yozing
4. Brauzerda oching: `https://api.telegram.org/botTOKENINGIZ/getUpdates`
5. U yerda `"chat":{"id":-1001234567890,...}` ko'rinishidagi **manfiy raqamni** toping — shu guruh ID'si

## 3. Serverga joylashtirish (bot 24/7 ishlashi uchun)
Eng oson yo'l — **Railway.app**:
1. railway.app'da ro'yxatdan o'ting (GitHub akkaunt bilan kirish qulay)
2. "New Project" → "Empty Project"
3. Shu papkadagi fayllarni GitHub repo'siga yuklang (yoki Railway CLI orqali to'g'ridan-to'g'ri joylang)
4. Railway avtomatik `npm install` va `npm start` qiladi
5. "Variables" bo'limida `BOT_TOKEN` va `ADMIN_CHAT_ID` qiymatlarini kiritish ham mumkin (index.js ichiga yozish shart emas)

Muqobil: **Render.com** (Background Worker sifatida), yoki agar dasturlashdan xabaringiz bo'lsa — istalgan VPS'da `npm install && npm start` (yoki `pm2 start index.js` doimiy ishlashi uchun).

## 4. Sinab ko'rish
Serverga joylagandan so'ng, Telegram'da botingizga /start yozing — menyu chiqishi kerak. "📅 Yozilish" tugmasini bosib, jarayonni oxirigacha sinab ko'ring — guruhingizga yangi so'rov tushishi kerak.

## 5. Resepshin dasturi bilan bog'lash
Bemor botga yozib, guruhga so'rov tushgach:
- Guruhdagi xabardan bemorning Chat ID'sini ko'rasiz
- Resepshin dasturida (stomatologiya-resepshin.html) bemorni qo'shing/toping va uning profiliga shu Chat ID'ni kiriting (yoki "Telegram obunachilar" bo'limidan tanlang)
- Shundan keyin dastur orqali unga eslatma xabarlar yubora olasiz
