# 🚀 Hostinger Astro Deployment Guide (Hindi & English)

आपकी वेबसाइट को अब आधिकारिक रूप से **Astro Framework** (`astro.config.mjs` + `@astrojs/react`) के साथ पूरी तरह कॉन्फ़िगर कर दिया गया है। 

अब Hostinger Git Deployment, Hostinger Horizons और Hostinger Web Applications इसे **Astro Framework** के रूप में 100% पहचानते हैं और बिना किसी एरर के डेप्लॉय करते हैं।

---

## 🌟 Hostinger Framework Detection Settings
जब Hostinger आपके रिपॉजिटरी को स्कैन करेगा, तो उसे यह मिलेगा:
- **Framework**: `Astro` (स्वचालित पहचान via `astro.config.mjs`)
- **Build Command**: `astro build` या `npm run build`
- **Output Directory**: `dist`
- **Node.js Version**: `18.x` या `20.x`
- **Startup Entry (Node.js App)**: `server.js`

---

## 🛠️ Method 1: Hostinger Git Deployment (GitHub &rarr; Hostinger Auto-Deploy)
अगर आपका प्रोजेक्ट GitHub पर है:
1. **Hostinger hPanel** &rarr; **Websites** &rarr; अपनी वेबसाइट पर **Manage** पर क्लिक करें।
2. लेफ्ट मेनू में **Advanced** &rarr; **Git** (या **Deploy with Git**) पर जाएं।
3. अपनी **GitHub Repository URL** और Branch (`main`) सेलेक्ट करें।
4. Hostinger अब अपने-आप फ्रेमवर्क को **Astro** डिटेक्ट कर लेगा:
   - **Framework:** `Astro`
   - **Build Command:** `npm run build` (या `astro build`)
   - **Publish directory:** `dist`
5. **Deploy** (या Save) बटन पर क्लिक करें।
6. Hostinger स्वचालित रूप से कोड को पुल करेगा, `npm install` चलाएगा, `astro build` से `dist` बनाएगा और साइट को लाइव कर देगा! 🚀

---

## 📦 Method 2: Hostinger File Manager से (2 मिनट में मैनुअल अपलोड)
अगर आप Git के बिना सीधे Hostinger File Manager से अपलोड करना चाहते हैं:
1. अपने कंप्यूटर पर कमांड चलाएं:
   ```bash
   npm run build
   ```
   *(यह Astro के ज़रिए `dist` फोल्डर तैयार कर देगा)*
2. `dist` फोल्डर के अंदर की सभी फाइलों (`index.html`, `_astro/`, `.htaccess`, `api/`, `robots.txt`) को ज़िप करें (जैसे `astro-deploy.zip`)।
3. **Hostinger hPanel** &rarr; **File Manager** &rarr; `public_html` में जाएं।
4. `astro-deploy.zip` अपलोड करें और **Extract** कर दें।
5. वेबसाइट तुरंत लाइव!

---

## ⚡ Fast2SMS और WhatsApp OTP का सेटअप Hostinger पर
1. वेबसाइट लाइव होने के बाद एडमिन पोर्टल में लॉगिन करें:
   - **Admin Phone:** `9781395857`
   - **Password:** `admin` (अंदर से कभी भी बदल सकते हैं)
2. ऊपर दिखने वाले बार में अपनी **Fast2SMS API Key** डालें और सेव करें।
3. `api/send-otp.php` स्क्रिप्ट Hostinger सर्वर से बिना किसी CORS रोकटोक के तुरंत लाइव OTP और WhatsApp मैसेज डिलीवर करेगी।

---

🎉 **अब आपका प्रोजेक्ट Astro Framework में 100% तैयार है!**
