
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
  // Enhanced pricing structure to support multiple currencies
  currencies: {
    USD: { symbol: '$', name: 'US Dollar' },
    GHS: { symbol: '₵', name: 'Ghanaian Cedi' },
    EUR: { symbol: '€', name: 'Euro' },
    GBP: { symbol: '£', name: 'British Pound' },
    NGN: { symbol: '₦', name: 'Nigerian Naira' },
  },
  // Default currency (can be changed based on user location or preference)
  defaultCurrency: 'USD',
  premiumPrices: {
    individual_monthly: {
      tierName: "individual",
      label: "Individual Monthly",
      prices: {
        USD: { amount: 2, display: "$2/month" },
        GHS: { amount: 30, display: "₵30/month" },
        EUR: { amount: 2, display: "€2/month" },
        GBP: { amount: 2, display: "£2/month" },
        NGN: { amount: 3000, display: "₦3,000/month" },
      },
      durationMonths: 1,
      uploadLimit: 100 * 1024 * 1024 * 1024, // 100GB
      features: ["100GB Upload Limit", "Password Protection", "File Encryption", "Advanced Access Control", "No Ads", "Detailed Analytics", "24/7 Priority Support"]
    },
    individual_yearly: {
      tierName: "individual",
      label: "Individual Yearly",
      prices: {
        USD: { amount: 20, display: "$20/year (Save $4)" },
        GHS: { amount: 300, display: "₵300/year (Save ₵60)" },
        EUR: { amount: 20, display: "€20/year (Save €4)" },
        GBP: { amount: 20, display: "£20/year (Save £4)" },
        NGN: { amount: 30000, display: "₦30,000/year (Save ₦6,000)" },
      },
      durationMonths: 12,
      uploadLimit: 100 * 1024 * 1024 * 1024, // 100GB
      features: ["100GB Upload Limit", "Password Protection", "File Encryption", "Advanced Access Control", "No Ads", "Detailed Analytics", "24/7 Priority Support"]
    },
    team_monthly: {
      tierName: "team",
      label: "Team Monthly",
      prices: {
        USD: { amount: 5, display: "$5/month" },
        GHS: { amount: 75, display: "₵75/month" },
        EUR: { amount: 5, display: "€5/month" },
        GBP: { amount: 5, display: "£5/month" },
        NGN: { amount: 7500, display: "₦7,500/month" },
      },
      durationMonths: 1,
      uploadLimit: 2 * 1024 * 1024 * 1024 * 1024, // 2TB
      features: ["2TB Upload Limit", "Team Collaboration Features", "Password Protection", "File Encryption", "Advanced Access Control", "No Ads", "Detailed Analytics", "Bulk Operations", "24/7 Priority Support"]
    },
    team_yearly: {
      tierName: "team",
      label: "Team Yearly",
      prices: {
        USD: { amount: 50, display: "$50/year (Save $10)" },
        GHS: { amount: 750, display: "₵750/year (Save ₵150)" },
        EUR: { amount: 50, display: "€50/year (Save €10)" },
        GBP: { amount: 50, display: "£50/year (Save £10)" },
        NGN: { amount: 75000, display: "₦75,000/year (Save ₦15,000)" },
      },
      durationMonths: 12,
      uploadLimit: 2 * 1024 * 1024 * 1024 * 1024, // 2TB
      features: ["2TB Upload Limit", "Team Collaboration Features", "Password Protection", "File Encryption", "Advanced Access Control", "No Ads", "Detailed Analytics", "Bulk Operations", "24/7 Priority Support"]
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
  
  // Helper function to get price for current currency
  getPriceForCurrency: (planKey, currency = null) => {
    const plan = config.premiumPrices[planKey];
    if (!plan) return null;
    
    const targetCurrency = currency || config.defaultCurrency;
    return plan.prices[targetCurrency] || plan.prices[config.defaultCurrency];
  },
  
  // Helper function to get all available currencies
  getAvailableCurrencies: () => {
    return Object.keys(config.currencies);
  },
};

export default config;
        
