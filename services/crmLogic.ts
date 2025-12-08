import { Lead, Listing, Interaction, DealStage, MatchTier, Industry } from '../types';

// --- Constants ---
const BUYER_WEEKLY_CAP = 3;
const SELLER_WEEKLY_CAP = 2;

// --- Helper: Calculate Days Since ---
const daysSince = (dateStr?: string) => {
  if (!dateStr) return 999;
  const diff = new Date().getTime() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 3600 * 24));
};

// --- Core Logic: Priority Scoring ---
export const calculatePriorityScore = (entity: Lead | Listing): number => {
  let score = 50; // Base score

  // 1. Recency Decay
  const days = daysSince(entity.lastContactDate);
  if (days > 14) score += 20; // Urgent need to follow up
  else if (days < 3) score -= 10; // Recently touched

  // 2. Value/Budget Impact
  const value = 'askingPrice' in entity ? (entity as Listing).askingPrice : (entity as Lead).maxBudget;
  if (value > 2000000) score += 15;
  if (value > 5000000) score += 10;

  // 3. Stage Impact (Listings only)
  if ('stage' in entity) {
    const l = entity as Listing;
    if (l.stage === DealStage.Offer || l.stage === DealStage.Closing) score += 30;
    if (l.stage === DealStage.New) score += 10;
  }

  return Math.min(100, Math.max(0, score));
};

// --- Core Logic: Match Tiering Formula ---
export const calculateMatchTier = (listing: Listing, lead: Lead): MatchTier => {
  const budgetFit = lead.maxBudget >= listing.askingPrice * 0.9; // Within 10% margin
  const industryFit = lead.preferredIndustries.includes(listing.industry);
  const roi = listing.askingPrice > 0 ? listing.cashflow / listing.askingPrice : 0;
  
  // 1. Ideal: Budget Fits + Industry Fits
  if (budgetFit && industryFit) return MatchTier.Ideal;

  // 2. Good Fit: Budget Fits OR (Budget close & Industry Perfect)
  if (budgetFit) return MatchTier.GoodFit;

  // 3. Share Widely: Exceptional Metrics regardless of fit
  if (roi > 0.4) return MatchTier.ShareWidely; // 40% ROI is insane, share it

  // 4. Stretch: Budget is tight (within 25%) but industry fits
  if (lead.maxBudget >= listing.askingPrice * 0.75 && industryFit) return MatchTier.Stretch;

  return MatchTier.None;
};

// --- Core Logic: My Day Generation ---
export const getDailyFocusList = (leads: Lead[], listings: Listing[]) => {
  // Combine and standardize
  const allContacts = [
    ...leads.map(l => ({ ...l, type: 'Buyer', cap: BUYER_WEEKLY_CAP })),
    ...listings.map(l => ({ ...l, type: 'Seller', cap: SELLER_WEEKLY_CAP }))
  ];

  // Filter by Caps and Sort by Priority
  const focusList = allContacts
    .filter(c => c.touchCountWeek < c.cap) // Enforce Protocol
    .sort((a, b) => b.priorityScore - a.priorityScore) // Highest priority first
    .slice(0, 10); // Daily limit

  return focusList;
};

export const getHotDeals = (listings: Listing[]) => {
  return listings
    .filter(l => [DealStage.Offer, DealStage.Closing, DealStage.NDA_Signed].includes(l.stage))
    .sort((a, b) => b.askingPrice - a.askingPrice)
    .slice(0, 3);
};

export const getAgingItems = (leads: Lead[], listings: Listing[]) => {
  // Items with no contact in 30+ days
  const agingLeads = leads.filter(l => daysSince(l.lastContactDate) > 30);
  const agingListings = listings.filter(l => daysSince(l.lastContactDate) > 30);
  return [...agingLeads.map(l => ({...l, type: 'Buyer'})), ...agingListings.map(l => ({...l, type: 'Seller'}))].slice(0, 5);
};