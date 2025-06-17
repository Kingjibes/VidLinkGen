const config = {
  siteName: "VidLinkGen",
  contact: {
    email: "support@vidlinkgen.com",
    twitter: "@vidlinkgen",
    whatsappNumbers: [
      { id: 'whatsapp1', number: '+233557488116', channelUrl: 'https://whatsapp.com/channel/0029Vb3wqli8V0tfOrWXwk2K' },
      { id: 'whatsapp2', number: '+233504759307', channelUrl: 'https://whatsapp.com/channel/0029VbAUgm5Fi8xfcJspqi3f' },
      { id: 'whatsapp3', number: '', channelUrl: 'https://whatsapp.com/channel/0029VaN2eQQ59PwNixDnvD16' },
    ],
    telegramHandles: [
      { id: 'telegram1', username: 'Richvybs6', link: 'https://t.me/Richvybs6' },
      { id: 'telegram2', username: 'HACK_ERPRO', link: 'https://t.me/HACK_ERPRO' },
    ],
    momoNumber: "MTN 0557488116", // Updated MTN Momo number
  },
  premiumPrices: {
    individual_monthly: {
      tierName: "individual",
      label: "Individual Monthly",
      price: "$2 | ₵25 | ₦3,000", // USD, Ghana Cedis (₵), Nigerian Naira (₦)
      display: "$2/month | ₵25/month | ₦3,000/month",
      durationMonths: 1,
      uploadLimit: 100 * 1024 * 1024 * 1024, // 100GB
      features: ["100GB Upload Limit", "Password Protection", "File Encryption", "Advanced Access Control", "No Ads", "Detailed Analytics", "24/7 Priority Support"]
    },
    individual_yearly: {
      tierName: "individual",
      label: "Individual Yearly",
      price: "$20 | ₵250 | ₦30,000",
      display: "$20/year (Save $4) | ₵250/year (Save ₵50) | ₦30,000/year (Save ₦6,000)",
      durationMonths: 12,
      uploadLimit: 100 * 1024 * 1024 * 1024, // 100GB
      features: ["100GB Upload Limit", "Password Protection", "File Encryption", "Advanced Access Control", "No Ads", "Detailed Analytics", "24/7 Priority Support"]
    },
    team_monthly: {
      tierName: "team",
      label: "Team Monthly",
      price: "$5 | ₵60 | ₦7,500",
      display: "$5/month | ₵60/month | ₦7,500/month",
      durationMonths: 1,
      uploadLimit: 2 * 1024 * 1024 * 1024 * 1024, // 2TB
      features: ["2TB Upload Limit", "Team Collaboration Features", "Password Protection", "File Encryption", "Advanced Access Control", "No Ads", "Detailed Analytics", "24/7 Priority Support"]
    },
    team_yearly: {
      tierName: "team",
      label: "Team Yearly",
      price: "$50 | ₵600 | ₦75,000",
      display: "$50/year (Save $10) | ₵600/year (Save ₵120) | ₦75,000/year (Save ₦15,000)",
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
