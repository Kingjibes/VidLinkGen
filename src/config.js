const config = {
  siteName: "VidLinkGen",
  contact: {
    email: "richvybs7@gmail.com",
    twitter: "@vidlinkgen",
    whatsappNumbers: [
      { id: 'main', number: '+233557488116', channelUrl: 'https://whatsapp.com/channel/0029Vb3wqli8V0tfOrWXwk2K' },
      { id: 'main2', number: '+233504759307', channelUrl: 'https://whatsapp.com/channel/0029VbAUgm5Fi8xfcJspqi3f' },
      { channelUrl: 'https://whatsapp.com/channel/0029VaN2eQQ59PwNixDnvD16' },
    ],
    telegramHandles: [
      { id: 'ʜᴀᴄᴋᴇʀᴘʀᴏ', username: 'Vidlinkgen_support', link: 'https://t.me/HACK_ERPRO' },
      { id: 'ʜᴀᴄᴋᴇʀᴘʀᴏ', username: 'vidlinkgen_sales', link: 'https://t.me/Richvybs6' },
    ],
    momoNumber: "0557488116",
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
