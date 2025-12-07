export enum Industry {
  Technology = 'Technology',
  Manufacturing = 'Manufacturing',
  Service = 'Service',
  Retail = 'Retail',
  Healthcare = 'Healthcare',
  Construction = 'Construction',
  Hospitality = 'Hospitality'
}

export enum DealStage {
  New = 'New',
  Contacted = 'Contacted',
  NDA_Signed = 'NDA Signed',
  Offer = 'Offer',
  Closing = 'Closing',
  Sold = 'Sold'
}

export enum MatchTier {
  Ideal = 'Ideal',
  GoodFit = 'Good Fit',
  Stretch = 'Stretch',
  ShareWidely = 'Share Widely',
  None = 'None'
}

export enum InteractionType {
  Call = 'Call',
  Email = 'Email',
  Meeting = 'Meeting',
  Note = 'Note'
}

export interface Interaction {
  id: string;
  entityId: string; // ID of Lead or Listing/Seller
  type: InteractionType;
  date: string;
  notes: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
}

export interface Broker {
  id: string;
  name: string;
  firm: string;
  email: string;
  dealsClosed: number;
  referralFee: number; // percentage
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  minBudget: number;
  maxBudget: number;
  preferredIndustries: Industry[];
  locationPreference: string;
  notes: string;
  dateAdded: string;
  lastContactDate?: string;
  status: 'Active' | 'Cold' | 'Dead';
  touchCountWeek: number; // For cap enforcement (3x/week)
  priorityScore: number; // Computed 0-100
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  askingPrice: number;
  revenue: number;
  ebitda: number; // Also SDE (Seller Discretionary Earnings) often used interchangeably in small biz
  cashflow: number; // For ROI calc
  industry: Industry;
  location: string;
  stage: DealStage;
  sellerName: string;
  sellerContact: string;
  dateAdded: string;
  lastContactDate?: string;
  touchCountWeek: number; // For cap enforcement (2x/week)
  priorityScore: number; // Computed 0-100
  aiSummary?: string;
}

export interface MatchResult {
  id: string;
  listingId: string;
  leadId: string;
  tier: MatchTier;
  score: number; // 0-100
  reasoning: string;
  isSent: boolean; // Has this been pitched?
}
