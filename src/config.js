const config = {
  contact: {
    whatsappNumbers: [
      { id: 'whatsapp1', number: '+233557488116', channelUrl: 'https://whatsapp.com/channel/0029VaN2eQQ59PwNixDnvD16/7593' },
      { id: 'whatsapp2', number: '+233550000000', channelUrl: 'https://whatsapp.com/channel/YOUR_NEW_CHANNEL_ID_2' }, 
    ],
    telegramHandles: [
      { id: 'telegram1', username: 'HACK_ERPRO', link: 'https://t.me/HACK_ERPRO' },
      { id: 'telegram2', username: 'YOUR_NEW_TELEGRAM_USERNAME', link: 'https://t.me/YOUR_NEW_TELEGRAM_USERNAME' },
    ],
    momoNumber: '0557488116',
  },
  premiumPrices: {
    individualMonthly: { amount: 2, display: '$2', durationMonths: 1, tierName: 'individual_monthly', label: 'Individual Monthly' },
    individualYearly: { amount: 20, display: '$20', durationMonths: 12, tierName: 'individual_yearly', label: 'Individual Yearly' },
    teamMonthly: { amount: 5, display: '$5', durationMonths: 1, tierName: 'team_monthly', label: 'Team Monthly' },
    teamYearly: { amount: 50, display: '$50', durationMonths: 12, tierName: 'team_yearly', label: 'Team Yearly' },
  },
  uploadLimits: {
    free: 500 * 1024 * 1024, // 500MB
    individual_monthly: 100 * 1024 * 1024 * 1024, // 100GB
    individual_yearly: 100 * 1024 * 1024 * 1024, // 100GB
    team_monthly: 2 * 1024 * 1024 * 1024 * 1024, // 2TB
    team_yearly: 2 * 1024 * 1024 * 1024 * 1024, // 2TB
    legacy_premium: 2 * 1024 * 1024 * 1024 * 1024, // Default for existing premium users, can be 2TB
  },
  defaultPremiumPriceDisplay: '$2', 
};

export default config;