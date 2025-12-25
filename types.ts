
export enum Industry {
  Technology = 'Technology',
  Manufacturing = 'Manufacturing',
  Service = 'Service',
  Retail = 'Retail',
  Healthcare = 'Healthcare',
  Construction = 'Construction',
  Hospitality = 'Hospitality',
  FnB = 'F&B' // Added specifically for the demo
}

export enum ListingType {
  Sale = 'Sale', // Business Sale / Key Money
  Rent = 'Rent', // Shell & Core or Fitted Rent
  Vending = 'Vending' // Automated
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
  Note = 'Note',
  WhatsApp = 'WhatsApp'
}

export enum FeedbackStatus {
  Positive = 'Positive',
  Negative = 'Negative',
  Pending = 'Pending',
  Ignored = 'Ignored' // Virtual status for UI logic
}

export interface MatchFeedback {
  id: string;
  leadId: string;
  listingId: string;
  status: FeedbackStatus;
  timestamp: string; // ISO String
}

export interface Interaction {
  id: string;
  entityId: string;
  type: InteractionType;
  date: string;
  notes: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
}

export interface LogEntry {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  relatedEntityId?: string;
  priority: 'High' | 'Normal';
}

export interface Broker {
  id: string;
  name: string;
  firm: string;
  email: string;
  dealsClosed: number;
  referralFee: number;
}

export interface Lead {
  id: string;
  name: string;
  role?: string; // e.g., "Entrepreneur", "Series A Investor", "Seller"
  nationality?: string;
  email: string;
  phone: string;
  minBudget: number;
  maxBudget: number;
  preferredIndustries: Industry[];
  locationPreference: string;
  notes: string;
  dateAdded: string;
  lastContactDate?: string;
  status: 'Active' | 'Cold' | 'Dead' | 'Paused';
  onboardingStatus?: 'Pending' | 'Completed'; // New field for form tracking
  touchCountWeek: number;
  priorityScore: number;
}

export interface Listing {
  id: string;
  title: string;
  type?: ListingType; // New field
  description: string;
  askingPrice: number; // Key Money or Sale Price
  annualRent?: number; // New field for F&B Rent
  revenue: number;
  ebitda: number;
  cashflow: number;
  industry: Industry;
  location: string;
  sqft?: number; // New field
  staffCount?: number; // New field
  amenities?: string[]; // e.g. "Gas Connection", "Terrace"
  stage: DealStage;
  sellerName: string;
  sellerContact: string;
  dateAdded: string;
  lastContactDate?: string;
  touchCountWeek: number;
  priorityScore: number;
  aiSummary?: string;
}

export interface MatchResult {
  entity: Lead | Listing;
  tier: MatchTier;
}

export interface AIMatchResult {
  leadId: string;
  listingId: string;
  score: number;
  reasoning: string;
}

export type VoiceIntent = 'CREATE_LEAD' | 'CREATE_LISTING' | 'LOG_INTERACTION' | 'CREATE_LOG' | 'UNKNOWN';

export interface VoiceCommandResponse {
  transcription: string;
  intent: VoiceIntent;
  data: any;
  matchedEntityName?: string;
}