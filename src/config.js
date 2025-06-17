const config = {
  siteName: "VidLinkGen",
  contact: {
    email: "support@vidlinkgen.com",
    twitter: "@vidlinkgen",
    whatsappNumbers: [
      { id: 'whatsapp1', number: '+15551234567', channelUrl: 'https://whatsapp.com/channel/YOUR_CHANNEL_URL_1' },
      { id: 'whatsapp2', number: '+15557654321', channelUrl: 'https://whatsapp.com/channel/YOUR_CHANNEL_URL_2' },
    ],
    telegramHandles: [
      { id: 'telegram1', username: 'vidlinkgen_support', link: 'https://t.me/vidlinkgen_support' },
      { id: 'telegram2', username: 'vidlinkgen_sales', link: 'https://t.me/vidlinkgen_sales' },
    ],
    momoNumber: "024XXXXXXX",
  },
  premiumPrices: {
    individual_monthly: {
      tierName: "individual",
      label: "Individual Monthly",
      price: "$2",
      display: "$2/month",
      durationMonths: 1,
      uploadLimit: 100 * 1024 * 1024 * 1024, // 100GB
      features: ["100GB Upload Limit", "Password Protection", "File Encryption", "Advanced Access Control", "No Ads", "Detailed Analytics", "24/7 Priority Support"]
    },
    individual_yearly: {
      tierName: "individual",
      label: "Individual Yearly",
      price: "$20",
      display: "$20/year (Save $4)",
      durationMonths: 12,
      uploadLimit: 100 * 1024 * 1024 * 1024, // 100GB
      features: ["100GB Upload Limit", "Password Protection", "File Encryption", "Advanced Access Control", "No Ads", "Detailed Analytics", "24/7 Priority Support"]
    },
    team_monthly: {
      tierName: "team",
      label: "Team Monthly",
      price: "$5",
      display: "$5/month",
      durationMonths: 1,
      uploadLimit: 2 * 1024 * 1024 * 1024 * 1024, // 2TB
      features: ["2TB Upload Limit", "Team Collaboration Features", "Password Protection", "File Encryption", "Advanced Access Control", "No Ads", "Detailed Analytics", "24/7 Priority Support"]
    },
    team_yearly: {
      tierName: "team",
      label: "Team Yearly",
      price: "$50",
      display: "$50/year (Save $10)",
      durationMonths: 12,
      uploadLimit: 2 * 1024 * 1024 * 1024 * 1024, // 2TB
      features: ["2TB Upload Limit", "Team Collaboration Features", "Password Protection", "File Encryption", "Advanced Access Control", "No Ads", "Detailed Analytics", "24/7 Priority Support"]
    },
  },
  uploadLimits: {
    free: 200 * 1024 * 1024, // 200MB
    individual: 100 * 1024 * 1024 * 1024, // 100GB
    team: 2 * 1024 * 1024 * 1024 * 1024, // 2TB
    legacy_premium: 2 * 1024 * 1024 * 1024 * 1024, // 2TB for any premium user without a specific tier (fallback)
  },
  urlSchemes: ['http://', 'https://'],
  defaultVideoName: "My VidLinkGen Video",
  defaultLinkExpiryDays: 30,
  qrCodeSettings: {
    size: 128,
    level: 'H', // Error correction level: L, M, Q, H
    bgColor: "#FFFFFF",
    fgColor: "#0F172A", // A dark color, e.g., your primary dark text color
  },
  supabaseBucketName: "videos",
  maxCustomNameLength: 100,
  maxDescriptionLength: 500,
};

export default config;