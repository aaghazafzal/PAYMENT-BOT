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
    id: 'CINEMAHUB',
    name: '🎬 CinemaHub Bot VIP',
    description: 'Fast movie streams, direct links, and unlimited downloads',
    icon: '🎬',
    plans: [
      { id: '1_MONTH', name: '1 Month VIP Pass', durationDays: 30, amount: 49 },
      { id: '3_MONTHS', name: '3 Months VIP Pass', durationDays: 90, amount: 129 },
      { id: '1_YEAR', name: '1 Year VIP Pass', durationDays: 365, amount: 399 },
    ]
  },
  {
    id: 'SHARE_BOX',
    name: '📦 ShareBox Bot Pro',
    description: 'High-speed file storage, custom link generation & stream links',
    icon: '📦',
    plans: [
      { id: '1_MONTH', name: '1 Month Starter', durationDays: 30, amount: 39 },
      { id: '3_MONTHS', name: '3 Months Pro', durationDays: 90, amount: 99 },
      { id: '1_YEAR', name: '1 Year Unlimited', durationDays: 365, amount: 299 },
    ]
  },
  {
    id: 'FORWARD_BOT',
    name: '⏩ Forward Bot Pro',
    description: 'Unlimited batch auto-forwarding across private/public channels',
    icon: '⏩',
    plans: [
      { id: '1_MONTH', name: '1 Month Pro', durationDays: 30, amount: 59 },
      { id: '3_MONTHS', name: '3 Months Pro', durationDays: 90, amount: 149 },
      { id: '1_YEAR', name: '1 Year VIP', durationDays: 365, amount: 499 },
    ]
  },
  {
    id: 'INSTA_AUTOMATION',
    name: '📸 Insta Automation Pro',
    description: 'Scheduled uploads, automated reel downloads and analytics',
    icon: '📸',
    plans: [
      { id: '1_MONTH', name: '1 Month Pro', durationDays: 30, amount: 79 },
      { id: '3_MONTHS', name: '3 Months Pro', durationDays: 90, amount: 199 },
      { id: '1_YEAR', name: '1 Year Unlimited', durationDays: 365, amount: 599 },
    ]
  },
  {
    id: 'ECHO_TRACE',
    name: '🔍 Echo Trace Bot VIP',
    description: 'Deep OSINT search, identity lookup & advanced tracing tools',
    icon: '🔍',
    plans: [
      { id: '1_MONTH', name: '1 Month Search Pass', durationDays: 30, amount: 99 },
      { id: '3_MONTHS', name: '3 Months Search Pass', durationDays: 90, amount: 249 },
      { id: '1_YEAR', name: '1 Year Search Pass', durationDays: 365, amount: 799 },
    ]
  },
  {
    id: 'UNIVORA_WEB_HUB',
    name: '🌐 Univora Web Hub Premium',
    description: 'Access premium web tools, web player, and unified user dashboard',
    icon: '🌐',
    plans: [
      { id: '1_MONTH', name: '1 Month Web Pass', durationDays: 30, amount: 89 },
      { id: '3_MONTHS', name: '3 Months Web Pass', durationDays: 90, amount: 219 },
      { id: '1_YEAR', name: '1 Year Web Pass', durationDays: 365, amount: 699 },
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
