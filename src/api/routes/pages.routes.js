import express from 'express';
import { getPlatformById, getPlan } from '../../config/plans.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { platform: platformId, plan: planId } = req.query;
  const platform = getPlatformById(platformId);
  const plan = getPlan(platformId, planId);

  const platformName = platform ? platform.name.replace(/\[UNIVORA\]/g, '').trim() : 'Univora Services';
  const planName = plan ? plan.name : 'Premium Plan';
  const isLifetime = planId === 'LIFETIME' || (plan && plan.durationDays > 1000);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Terms & Conditions - ${platformName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root {
      --bg-light: #f3f4f6;
      --bg-dark: #111827;
      --card-light: #ffffff;
      --card-dark: #1f2937;
      --text-light: #1f2937;
      --text-dark: #f9fafb;
      --text-muted-light: #4b5563;
      --text-muted-dark: #9ca3af;
      --accent: #3b82f6;
    }
    body {
      transition: background-color 0.3s, color 0.3s;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    body.light-theme {
      background-color: var(--bg-light);
      color: var(--text-light);
    }
    body.dark-theme {
      background-color: var(--bg-dark);
      color: var(--text-dark);
    }
    .card {
      transition: background-color 0.3s;
    }
    .light-theme .card { background-color: var(--card-light); }
    .dark-theme .card { background-color: var(--card-dark); }
    .light-theme .text-muted { color: var(--text-muted-light); }
    .dark-theme .text-muted { color: var(--text-muted-dark); }
    
    .terms-content { display: none; }
    .terms-content.active { display: block; animation: fadeIn 0.3s; }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body class="dark-theme min-h-screen pb-10">

  <header class="sticky top-0 z-50 shadow-md backdrop-blur-md bg-opacity-80 dark:bg-opacity-80" style="background-color: inherit;">
    <div class="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
      <div class="font-bold text-lg tracking-tight flex items-center gap-2">
        <span class="text-3xl">⚖️</span>
        <div class="leading-tight">
          Univora Legal<br>
          <span class="text-xs font-normal text-muted">${platformName}</span>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <button id="langToggle" class="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100 transition-colors">
          English
        </button>
        <button id="themeToggle" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xl">
          🌞
        </button>
      </div>
    </div>
  </header>

  <main class="max-w-3xl mx-auto px-4 mt-6">
    <div class="card p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
      <h1 class="text-2xl font-bold mb-2">Terms & Conditions</h1>
      <p class="text-sm text-muted mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
        Review the terms before purchasing <b>${planName}</b> for <b>${platformName}</b>.
      </p>

      <!-- EN -->
      <div id="content-en" class="terms-content active space-y-6 text-sm md:text-base leading-relaxed">
        <section>
          <h2 class="text-lg font-bold mb-2 text-blue-600 dark:text-blue-400">1. Service & Purpose</h2>
          <p>By purchasing this premium subscription, you gain automated access and VIP features to <b>${platformName}</b>. This service is intended for personal and lawful use only. Abuse, unauthorized API scraping, or commercial resale of features is strictly prohibited.</p>
        </section>
        <section>
          <h2 class="text-lg font-bold mb-2 text-blue-600 dark:text-blue-400">2. Content Logging & Privacy</h2>
          <p>Files, messages, or links processed by the bot may be temporarily monitored for abuse prevention, performance tracking, and analytics. Renamed or forwarded files may be logged in private channels for transparency and audit purposes. Do not use the bot to process highly sensitive or personal data.</p>
        </section>
        <section>
          <h2 class="text-lg font-bold mb-2 text-red-500">3. Strictly NO NSFW / Illegal Content</h2>
          <p>You are strictly prohibited from using the bot for:
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>Child Sexual Abuse Material (CSAM)</li>
              <li>Non-consensual pornography (Revenge Porn)</li>
              <li>Rape, gore, or extreme violence</li>
              <li>Malware or phishing links</li>
            </ul>
            Violation of this clause will result in an immediate, permanent ban without warning. Logs may be handed over to authorities.
          </p>
        </section>
        <section>
          <h2 class="text-lg font-bold mb-2 text-blue-600 dark:text-blue-400">4. Service Reliability & Uptime</h2>
          <p>We strive to provide 99% uptime, but we do not guarantee that the service will be flawless. Telegram API limits, server load, and network conditions may cause delays or temporary outages. Instant processing is not guaranteed.</p>
        </section>
        <section class="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/50">
          <h2 class="text-lg font-bold mb-2 text-red-600 dark:text-red-400">5. Strict No-Refund Policy</h2>
          <p><b>All payments are final.</b> Once a payment is made and premium is activated, <b>no refunds</b> will be provided under any circumstances. This includes, but is not limited to: account bans, Telegram server issues, dissatisfaction with speed, or unexpected downtime. Please test the free version before purchasing.</p>
        </section>
        ${isLifetime ? `
        <section class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800/50">
          <h2 class="text-lg font-bold mb-2 text-yellow-700 dark:text-yellow-400">6. Lifetime Plan Clause</h2>
          <p>You have selected a <b>Lifetime Plan</b>. "Lifetime" strictly refers to the lifetime of the <i>service</i>, not the purchaser. As long as the bot is operational, you will have premium access. However, if the project is discontinued, shut down, or banned by Telegram, the lifetime plan will automatically end. No partial or full refunds will be issued in the event of service closure.</p>
        </section>
        ` : ''}
        <p class="text-xs text-muted mt-8 pt-4 border-t border-gray-200 dark:border-gray-800">
          By proceeding with the payment on Telegram, you electronically agree to all these terms. Close this page and click "Yes, I Agree" in the bot to continue.
        </p>
      </div>

      <!-- HI -->
      <div id="content-hi" class="terms-content space-y-6 text-sm md:text-base leading-relaxed">
        <section>
          <h2 class="text-lg font-bold mb-2 text-blue-600 dark:text-blue-400">1. Service aur Upyog</h2>
          <p>Premium plan kharidne par aapko <b>${platformName}</b> ke VIP features milenge. Ye service sirf personal aur legal (kanooni) upyog ke liye hai. Iska galat istemaal, API scraping ya business ke liye bechna sakht mana hai.</p>
        </section>
        <section>
          <h2 class="text-lg font-bold mb-2 text-blue-600 dark:text-blue-400">2. Privacy aur File Logging</h2>
          <p>Bot ke dwara process ki gayi files, messages ya links ko abuse rokne aur performance check karne ke liye temporarily monitor kiya ja sakta hai. System safety ke liye files private log channels me save ho sakti hain. Kripya apni highly personal ya sensitive files bot par na bhejein.</p>
        </section>
        <section>
          <h2 class="text-lg font-bold mb-2 text-red-500">3. NSFW aur Illegal Content Par Ban</h2>
          <p>Bot ka istemaal in chizon ke liye karna sakht mana hai:
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>Child Sexual Abuse Material (CSAM)</li>
              <li>Bina marzi ki videos/photos (Revenge Porn)</li>
              <li>Rape, gore, ya extreme violence</li>
              <li>Malware, virus ya fraud links</li>
            </ul>
            Agar aisi file mili, toh aapka account bina kisi warning ke permanently BAN kar diya jayega aur details authorities ko di ja sakti hain.
          </p>
        </section>
        <section>
          <h2 class="text-lg font-bold mb-2 text-blue-600 dark:text-blue-400">4. Speed aur Guarantee</h2>
          <p>Hum 99% uptime dene ki koshish karte hain, par Telegram API limits ya server load ki wajah se delay ho sakta hai. Hum har file ki instant processing ki guarantee nahi dete. Technical issue aane par thoda intezaar karna padh sakta hai.</p>
        </section>
        <section class="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/50">
          <h2 class="text-lg font-bold mb-2 text-red-600 dark:text-red-400">5. Strict No-Refund Policy (Koi Paisa Wapas Nahi)</h2>
          <p><b>Saare payments final hain.</b> Ek baar payment hone aur premium activate hone ke baad, <b>kisi bhi haal mein Refund nahi milega.</b> Chahe aapka account ban ho jaye, Telegram down ho, ya speed slow ho. Paisa dene se pehle kripya free version ko test kar lein.</p>
        </section>
        ${isLifetime ? `
        <section class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800/50">
          <h2 class="text-lg font-bold mb-2 text-yellow-700 dark:text-yellow-400">6. Lifetime Plan Ke Niyam</h2>
          <p>Aapne <b>Lifetime Plan</b> select kiya hai. Yahan "Lifetime" ka matlab <i>is service (bot) ki life</i> se hai, aapki life se nahi. Jab tak bot chal raha hai, aapko premium milta rahega. Agar kisi wajah se project band karna pada ya Telegram ne bot ban kar diya, toh lifetime plan khatam mana jayega aur is case mein koi refund nahi hoga.</p>
        </section>
        ` : ''}
        <p class="text-xs text-muted mt-8 pt-4 border-t border-gray-200 dark:border-gray-800">
          Telegram par payment karke, aap in sabhi sharton ko maante hain. Is page ko close karein aur bot mein "Yes, I Agree" button par click karein.
        </p>
      </div>
    </div>
  </main>

  <script>
    const themeBtn = document.getElementById("themeToggle");
    const body = document.body;
    let isDark = true; 
    
    if (window.Telegram && window.Telegram.WebApp) {
      if (window.Telegram.WebApp.colorScheme === "light") {
        isDark = false;
      }
    }

    const updateTheme = () => {
      if (isDark) {
        body.classList.remove("light-theme");
        body.classList.add("dark-theme");
        themeBtn.innerText = "🌞";
      } else {
        body.classList.remove("dark-theme");
        body.classList.add("light-theme");
        themeBtn.innerText = "🌙";
      }
    };
    
    updateTheme();

    themeBtn.addEventListener("click", () => {
      isDark = !isDark;
      updateTheme();
    });

    let lang = "en";
    const langBtn = document.getElementById("langToggle");
    const enContent = document.getElementById("content-en");
    const hiContent = document.getElementById("content-hi");

    langBtn.addEventListener("click", () => {
      if (lang === "en") {
        lang = "hi";
        langBtn.innerText = "हिंदी";
        enContent.classList.remove("active");
        hiContent.classList.add("active");
      } else {
        lang = "en";
        langBtn.innerText = "English";
        hiContent.classList.remove("active");
        enContent.classList.add("active");
      }
    });
  </script>
</body>
</html>
  `;
  
  res.send(html);
});

export default router;
