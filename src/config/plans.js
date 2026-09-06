/**
 * Univora Ecosystem Platforms & Pricing Configuration
 * Configured for all real Univora ecosystem bots and web services.
 */
export const PLATFORMS = [
  {
    id: 'UNIVORA_ALL_ACCESS',
    name: '👑 Univora All-In-One VIP Pass',
    description: 'Unlock ALL Univora bots, web apps, tools, and future releases!',
    icon: '👑',
    plans: [
      { id: '1_MONTH', name: '1 Month All-Access Pass', durationDays: 30, amount: 199 },
      { id: '3_MONTHS', name: '3 Months All-Access Pass', durationDays: 90, amount: 499 },
      { id: '1_YEAR', name: '1 Year VIP Master Pass', durationDays: 365, amount: 1499 },
    ]
  },
  {
    id: 'STREAMDROP',
    name: '💧 StreamDrop Bot',
    description: 'Upload files and get streaming links with long expiry',
    icon: '💧',
    plans: [
      { 
        id: '1_WEEK', 
        name: '1 Week Plan', 
        durationDays: 7, 
        amount: 70,
        features: '✨ *Plan Details:*\n• Uploads: Unlimited\n• Link Expiry: 6 Months'
      },
      { 
        id: '1_MONTH', 
        name: '1 Month Plan', 
        durationDays: 30, 
        amount: 219,
        features: '✨ *Plan Details:*\n• Uploads: Unlimited\n• Link Expiry: 8 Months'
      },
      { 
        id: '2_MONTHS', 
        name: '2 Months Plan', 
        durationDays: 60, 
        amount: 499,
        features: '✨ *Plan Details:*\n• Uploads: Unlimited\n• Link Expiry: 1 Year'
      },
      { 
        id: 'LIFETIME', 
        name: 'Lifetime Plan', 
        durationDays: 36500, 
        amount: 2999,
        features: '✨ *Plan Details:*\n• Uploads: Unlimited\n• Link Expiry: Lifetime (Never Expire)'
      }
    ]
  },
  {
    id: 'CINEMAHUB',
    name: '🎬 CinemaHub Bot VIP',
    description: 'Fast movie streams, direct links, and unlimited downloads',
    icon: '🎬',
    plans: [
      { id: '7_DAYS', name: '7 Days VIP', durationDays: 7, amount: 20 },
      { id: '15_DAYS', name: '15 Days VIP', durationDays: 15, amount: 50 },
      { id: '30_DAYS', name: '30 Days VIP', durationDays: 30, amount: 100 },
      { id: '45_DAYS', name: '45 Days VIP', durationDays: 45, amount: 130 },
      { id: '60_DAYS', name: '60 Days VIP', durationDays: 60, amount: 150 },
      { id: 'LIFETIME', name: 'Lifetime VIP', durationDays: 36500, amount: 2999 }
    ].map(plan => ({
      ...plan,
      features: `✨ *ʙᴇɴᴇꜰɪᴛs ᴏꜰ ʙᴇɪɴɢ ᴀ ᴘʀᴇᴍɪᴜᴍ ᴍᴇᴍʙᴇʀ:*\n⊛ ɴᴏ ɴᴇᴇᴅ ᴛᴏ ᴠᴇʀɪꜰʏ ʟɪɴᴋs 🛑\n⊛ ɢᴇᴛ ꜰɪʟᴇs ᴅɪʀᴇᴄᴛʟʏ ɪɴ PM 🚀\n⊛ 100% ᴀᴅ-ꜰʀᴇᴇ ᴇxᴘᴇʀɪᴇɴᴄᴇ 🚫\n⊛ ᴜɴʟɪᴍɪᴛᴇᴅ ᴍᴏᴠɪᴇs & sᴇʀɪᴇs 🍿\n⊛ ʜɪɢʜ-sᴘᴇᴇᴅ ᴅᴏᴡɴʟᴏᴀᴅ ʟɪɴᴋs ⚡️\n⊛ ᴍᴜʟᴛɪ-ᴘʟᴀʏᴇʀ sᴛʀᴇᴀᴍɪɴɢ ʟɪɴᴋs 🎥\n⊛ 24/7 ꜰᴜʟʟ ᴀᴅᴍɪɴ sᴜᴘᴘᴏʀᴛ 📞\n⊛ ʀᴇǫᴜᴇsᴛs ᴄᴏᴍᴘʟᴇᴛᴇᴅ ɪɴ 1 ʜᴏᴜʀ ✅`
    }))
  },
  {
    id: 'SHARE_BOX',
    name: '📦 ShareBox Bot Pro',
    description: 'High-speed file storage, custom link generation & stream links',
    icon: '📦',
    plans: [
      { 
        id: 'DAILY_PASS', 
        name: 'Daily Pass', 
        durationDays: 1, 
        amount: 40,
        features: `💎 *PLAN DETAILS: DAILY PASS*\n━━━━━━━━━━━━━━━━━━━━━\n📦 *User Storage:* 200 GB\n🔗 *Max Links:* Unlimited\n🗓️ *Link Expiry:* 180 Days\n\n✨ *Premium Features Included:*\n✅ Custom Link Names\n✅ Password Protection\n✅ Anti-Forward / Protection\n✅ No Ads / Faster Speeds`
      },
      { 
        id: 'MONTHLY_STARTER', 
        name: 'Monthly Starter', 
        durationDays: 30, 
        amount: 299,
        features: `💎 *PLAN DETAILS: MONTHLY STARTER*\n━━━━━━━━━━━━━━━━━━━━━\n📦 *User Storage:* Unlimited\n🔗 *Max Links:* Unlimited\n🗓️ *Link Expiry:* 240 Days\n\n✨ *Premium Features Included:*\n✅ Custom Link Names\n✅ Password Protection\n✅ Anti-Forward / Protection\n✅ No Ads / Faster Speeds`
      },
      { 
        id: 'BI_MONTHLY_PRO', 
        name: 'Bi-Monthly Pro', 
        durationDays: 60, 
        amount: 499,
        features: `💎 *PLAN DETAILS: BI-MONTHLY PRO*\n━━━━━━━━━━━━━━━━━━━━━\n📦 *User Storage:* Unlimited\n🔗 *Max Links:* Unlimited\n🗓️ *Link Expiry:* 365 Days\n\n✨ *Premium Features Included:*\n✅ Custom Link Names\n✅ Password Protection\n✅ Anti-Forward / Protection\n✅ No Ads / Faster Speeds`
      },
      { 
        id: 'LIFETIME', 
        name: 'Lifetime Access', 
        durationDays: 36500, 
        amount: 2999,
        features: `💎 *PLAN DETAILS: LIFETIME ACCESS*\n━━━━━━━━━━━━━━━━━━━━━\n📦 *User Storage:* Unlimited\n🔗 *Max Links:* Unlimited\n🗓️ *Link Expiry:* Forever\n\n✨ *Premium Features Included:*\n✅ Custom Link Names\n✅ Password Protection\n✅ Anti-Forward / Protection\n✅ No Ads / Faster Speeds`
      }
    ]
  },
  {
    id: 'FORWARD_BOT',
    name: '⏩ Forward Bot Pro',
    description: 'Unlimited batch auto-forwarding across private/public channels',
    icon: '⏩',
    plans: [
      { id: '1_WEEK', name: 'Weekly Plan', durationDays: 7, amount: 49 },
      { id: '1_MONTH', name: 'Monthly Plan', durationDays: 30, amount: 149 }
    ].map(plan => ({
      ...plan,
      features: `⚡️ *Wʜʏ ᴜᴘɢʀᴀᴅᴇ ᴛᴏ Pʀᴇᴍɪᴜᴍ?*\n├ 🚀 Sᴜᴘᴇʀ Fᴀsᴛ Sᴘᴇᴇᴅ (No Delays)\n├ 🔄 Mᴜʟᴛɪᴘʟᴇ Tᴀsᴋs (Up to 5 Parallel)\n└ 🛡️ Pʀɪᴏʀɪᴛʏ Sᴜᴘᴘᴏʀᴛ`
    }))
  },
  {
    id: 'BUTTON_BOT',
    name: '🔘 Button Bot Premium',
    description: 'Add premium inline buttons and manage auto-adder projects',
    icon: '🔘',
    plans: [
      { 
        id: '1_MONTH', 
        name: 'Premium Upgrade', 
        durationDays: 30, 
        amount: 99,
        features: `💎 *PREMIUM PLAN BENEFITS*\n━━━━━━━━━━━━━━━━━━━━━━\nGet Premium features:\n✅ +200 Posts permanently\n✅ 40 Buttons per post (1 Month)\n✅ 5 Auto Adder Projects (1 Month)`
      }
    ]
  },
  {
    id: 'EXTRACT_X',
    name: '🧲 Extract X Bot',
    description: 'Bypass restricted channels and clone content blazing fast',
    icon: '🧲',
    plans: [
      { 
        id: 'DAILY_PASS', 
        name: 'Daily Pass', 
        durationDays: 1, 
        amount: 39,
        features: `⚡️ *DAILY PASS LIMITS:*\n  🔢 Total Tasks: 5\n  🔗 Fast Copy: 100,000 files\n  📦 DL+Upload: 1,000 files\n  📡 Live Monitors: 2\n━━━━━━━━━━━━━━━━━━━━━━\n✅ *All Features Included:*\n• 🔓 Private & restricted channel bypass\n• 🎯 Smart filters (Video/Doc/Photo/Audio)\n• ✏️ Caption Edit, Prefix/Suffix, Replace\n• 🖼️ Custom Thumbnail Override\n• 📤 Multi-destination forwarding\n• ⚡️ Server-side blazing-fast copy\n• 📡 Live auto-forward monitor`
      },
      { 
        id: 'MONTHLY_PRO', 
        name: 'Monthly Pro', 
        durationDays: 30, 
        amount: 259,
        features: `💎 *MONTHLY PRO LIMITS:*\n  🔢 Total Tasks: 50\n  🔗 Fast Copy: 1,000,000 files\n  📦 DL+Upload: 3,000 files\n  📡 Live Monitors: 5\n━━━━━━━━━━━━━━━━━━━━━━\n✅ *All Features Included:*\n• 🔓 Private & restricted channel bypass\n• 🎯 Smart filters (Video/Doc/Photo/Audio)\n• ✏️ Caption Edit, Prefix/Suffix, Replace\n• 🖼️ Custom Thumbnail Override\n• 📤 Multi-destination forwarding\n• ⚡️ Server-side blazing-fast copy\n• 📡 Live auto-forward monitor`
      },
      { 
        id: 'ULTRA_PASS', 
        name: 'Ultra Pass (3 Days)', 
        durationDays: 3, 
        amount: 389,
        features: `🚀 *ULTRA PASS LIMITS:*\n  🔢 Total Tasks: ∞ Unlimited\n  🔗 Fast Copy: ∞ Unlimited files\n  📦 DL+Upload: 5,000 files\n  📡 Live Monitors: 15\n━━━━━━━━━━━━━━━━━━━━━━\n✅ *All Features Included:*\n• 🔓 Private & restricted channel bypass\n• 🎯 Smart filters (Video/Doc/Photo/Audio)\n• ✏️ Caption Edit, Prefix/Suffix, Replace\n• 🖼️ Custom Thumbnail Override\n• 📤 Multi-destination forwarding\n• ⚡️ Server-side blazing-fast copy\n• 📡 Live auto-forward monitor`
      },
      { 
        id: 'LIFETIME', 
        name: 'Lifetime Access', 
        durationDays: 36500, 
        amount: 5999,
        features: `♾️ *LIFETIME LIMITS:*\n  🔢 Total Tasks: ∞ Unlimited\n  🔗 Fast Copy: ∞ Unlimited files\n  📦 DL+Upload: 3,000 files\n  📡 Live Monitors: 30\n━━━━━━━━━━━━━━━━━━━━━━\n✅ *All Features Included:*\n• 🔓 Private & restricted channel bypass\n• 🎯 Smart filters (Video/Doc/Photo/Audio)\n• ✏️ Caption Edit, Prefix/Suffix, Replace\n• 🖼️ Custom Thumbnail Override\n• 📤 Multi-destination forwarding\n• ⚡️ Server-side blazing-fast copy\n• 📡 Live auto-forward monitor`
      }
    ]
  }
];

export function getPlatformById(platformId) {
  return PLATFORMS.find(p => p.id === platformId);
}

export function getPlan(platformId, planId) {
  const platform = getPlatformById(platformId);
  if (!platform) return null;
  return platform.plans.find(p => p.id === planId);
}
