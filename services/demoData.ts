import { Lead, Listing, MatchFeedback, Industry, ListingType, DealStage, FeedbackStatus, Task } from '../types';

// Helper to generate random IDs
const uuid = () => Math.random().toString(36).substr(2, 9);

// Helper for dates
const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

const LOCATIONS = ['JLT Cluster C', 'Dubai Marina Walk', 'Downtown Boulevard', 'DIFC Gate Avenue', 'Business Bay', 'Al Quoz Creative Zone', 'Palm Jumeirah', 'City Walk', 'JBR The Beach', 'Deira Corniche', 'Motor City', 'Dubai Hills', 'Al Barsha 1'];
const AMENITIES = ['Gas Connection', 'Outdoor Terrace', 'Alcohol License Ready', 'Heavy Kitchen', 'Corner Unit', 'Sea View', 'Valet Parking', 'High Footfall', 'Delivery Zone', 'Shisha License'];

// --- NAMES DATABASES FOR REALISM ---
const FIRST_NAMES = ['Mohammed', 'Sarah', 'John', 'Ahmed', 'Priya', 'Wei', 'Fatima', 'David', 'Elena', 'Omar', 'Jessica', 'Rahul', 'Sofia', 'Ali', 'Maria', 'James', 'Layla', 'Arjun', 'Isabella', 'Hassan'];
const LAST_NAMES = ['Al Maktoum', 'Smith', 'Chen', 'Khan', 'Patel', 'Rodriguez', 'Ivanov', 'Al Futtaim', 'Jones', 'Gupta', 'Silva', 'Tanaka', 'Muller', 'Santos', 'Oconnor', 'Kim', 'Lopez', 'Singh', 'Al Sayed'];

export const generateDemoTasks = (): Task[] => {
  return [
    {
      id: 't-1',
      title: 'Draft NDA for Project Blue Sky (SaaS Acquisition)',
      dueDate: 'Today',
      completed: false,
      priority: 'High'
    },
    {
      id: 't-2',
      title: 'Call Sheikh Mohammed re: DIFC valuation discrepancy',
      dueDate: 'Today',
      completed: false,
      priority: 'High'
    },
    {
      id: 't-3',
      title: 'Prepare Investment Memo for "Cloud Kitchen Network"',
      dueDate: 'Tomorrow',
      completed: false,
      priority: 'Normal'
    },
    {
      id: 't-4',
      title: 'Follow up with Sarah Jenkins on lease terms',
      dueDate: 'Tomorrow',
      completed: false,
      priority: 'Normal'
    },
    {
        id: 't-5',
        title: 'Schedule viewing for Marina Yacht Club',
        dueDate: 'Next Week',
        completed: false,
        priority: 'Normal'
    }
  ];
};

export const generateDemoListings = (): Listing[] => {
  const listings: Listing[] = [];
  
  // 1. High-End Restaurants (Sale) - HOT DEAL
  listings.push({
    id: uuid(),
    title: 'La Dolce Vita Italian',
    type: ListingType.Sale,
    industry: Industry.FnB,
    location: 'DIFC Gate Avenue',
    askingPrice: 8500000,
    annualRent: 650000,
    revenue: 12000000,
    ebitda: 2800000,
    cashflow: 2500000,
    sqft: 3200,
    staffCount: 18,
    amenities: ['Alcohol License Ready', 'Valet Parking', 'Heavy Kitchen'],
    description: 'Award-winning authentic Italian fine dining. Fully fitted with wood-fire oven. 120 covers.',
    stage: DealStage.NDA_Signed,
    sellerName: 'Marco P.',
    sellerContact: 'marco@dolce.ae',
    dateAdded: daysAgo(45),
    lastContactDate: daysAgo(2),
    touchCountWeek: 2,
    priorityScore: 90
  });

  // 2. Coffee Shop (Rent/Key Money) - ROUTINE FOLLOW UP
  listings.push({
    id: uuid(),
    title: 'Brew & Bean Corner',
    type: ListingType.Rent, // Key money for location
    industry: Industry.FnB,
    location: 'JLT Cluster C',
    askingPrice: 450000, // Key money
    annualRent: 120000,
    revenue: 1500000,
    ebitda: 350000,
    cashflow: 320000,
    sqft: 800,
    staffCount: 4,
    amenities: ['Outdoor Terrace', 'Corner Unit', 'High Footfall'],
    description: 'Cozy specialty coffee shop in busy office cluster. Low rent, high margins on coffee.',
    stage: DealStage.New,
    sellerName: 'Ahmed K.',
    sellerContact: 'ahmed@brew.ae',
    dateAdded: daysAgo(5),
    lastContactDate: daysAgo(6),
    touchCountWeek: 0,
    priorityScore: 75
  });

  // 3. Tech Company - AT RISK
  listings.push({
    id: uuid(),
    title: 'Project Nexus - AI Logistics',
    type: ListingType.Sale,
    industry: Industry.Technology,
    location: 'Internet City',
    askingPrice: 15000000,
    revenue: 5000000,
    ebitda: 1200000,
    cashflow: 1000000,
    sqft: 2000,
    description: 'B2B Logistics platform with recurring revenue. Seller is losing patience.',
    stage: DealStage.Contacted,
    sellerName: 'Dr. Alistair',
    sellerContact: 'alistair@nexus.ai',
    dateAdded: daysAgo(60),
    lastContactDate: daysAgo(35), // > 30 days
    touchCountWeek: 0,
    priorityScore: 60
  });

  // Generate 7 more listings (Total ~10 for manageable routine list)
  for (let i = 0; i < 7; i++) {
    const isSale = Math.random() > 0.4;
    const isVending = Math.random() > 0.9; // Rare
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    const revenue = Math.floor(Math.random() * 5000000) + 500000;
    const contactDaysAgo = Math.floor(Math.random() * 45); // Mix of recent and old
    
    listings.push({
      id: `lst-${i}`,
      title: isVending ? `Auto-Vend Station #${100+i}` : `${location.split(' ')[0]} ${isSale ? 'Bistro' : 'Eatery'}`,
      type: isVending ? ListingType.Vending : (isSale ? ListingType.Sale : ListingType.Rent),
      industry: Industry.FnB,
      location: location,
      askingPrice: isVending ? 80000 : (isSale ? Math.floor(Math.random() * 8000000) + 500000 : Math.floor(Math.random() * 1000000) + 200000),
      annualRent: isVending ? 12000 : Math.floor(Math.random() * 500000) + 80000,
      revenue: revenue,
      ebitda: Math.floor(revenue * (Math.random() * 0.25 + 0.1)),
      cashflow: 0,
      sqft: isVending ? 20 : Math.floor(Math.random() * 4000) + 500,
      staffCount: isVending ? 0 : Math.floor(Math.random() * 25) + 3,
      amenities: AMENITIES.sort(() => 0.5 - Math.random()).slice(0, 3),
      description: `Generated F&B opportunity in ${location}. Great potential for ${isSale ? 'acquisition' : 'concept takeover'}.`,
      stage: Object.values(DealStage)[Math.floor(Math.random() * Object.values(DealStage).length)],
      sellerName: `Seller ${i}`,
      sellerContact: `seller${i}@demo.com`,
      dateAdded: daysAgo(Math.floor(Math.random() * 60)),
      lastContactDate: daysAgo(contactDaysAgo),
      touchCountWeek: contactDaysAgo > 7 ? 0 : Math.floor(Math.random() * 3),
      priorityScore: Math.floor(Math.random() * 100)
    });
  }

  return listings;
};

export const generateDemoLeads = (): Lead[] => {
  const leads: Lead[] = [];
  
  // Specific Scenario Leads
  // 1. VIP - Active
  leads.push({
    id: 'lead-vip-1',
    name: 'Sheikh Mohammed A.',
    role: 'Corporate Investor',
    nationality: 'UAE',
    email: 'shk.mo@invest.ae',
    phone: '+971 50 000 0001',
    minBudget: 10000000,
    maxBudget: 50000000,
    preferredIndustries: [Industry.FnB, Industry.Hospitality],
    locationPreference: 'Downtown / DIFC',
    notes: 'Looking for flagship restaurants with >20% EBITDA. Cash ready.',
    dateAdded: daysAgo(10),
    lastContactDate: daysAgo(2),
    status: 'Active',
    touchCountWeek: 1,
    priorityScore: 95
  });

  // 2. Entrepreneur - Active
  leads.push({
    id: 'lead-ent-1',
    name: 'Sarah Jenkins',
    role: 'Restaurateur',
    nationality: 'UK',
    email: 'sarah.j@londonfood.com',
    phone: '+971 55 123 9999',
    minBudget: 500000,
    maxBudget: 2000000,
    preferredIndustries: [Industry.FnB],
    locationPreference: 'Marina / JLT',
    notes: 'Ex-London chef opening first Dubai concept. Needs gas connection and terrace.',
    dateAdded: daysAgo(20),
    lastContactDate: daysAgo(5),
    status: 'Active',
    touchCountWeek: 2,
    priorityScore: 80
  });

  // 3. Ghost Lead - At Risk
  leads.push({
    id: 'lead-ghost-1',
    name: 'Marcus Thorne',
    role: 'Silent Investor',
    nationality: 'USA',
    email: 'm.thorne@vcap.com',
    phone: '+1 212 555 1234',
    minBudget: 5000000,
    maxBudget: 10000000,
    preferredIndustries: [Industry.Technology, Industry.Manufacturing],
    locationPreference: 'Any',
    notes: 'Showed interest in Project Nexus then went silent.',
    dateAdded: daysAgo(90),
    lastContactDate: daysAgo(40), // > 30 days -> AT RISK
    status: 'Active',
    touchCountWeek: 0,
    priorityScore: 65
  });

  // Generate 12 more generic leads (Total ~15 for manageable routine list)
  const ROLES = ['Serial Entrepreneur', 'First-time Buyer', 'Franchise Operator', 'Family Office', 'Chef Owner', 'Silent Investor'];
  const NATIONALITIES = ['Indian', 'Russian', 'French', 'Saudi', 'Chinese', 'British', 'American', 'Lebanese', 'Egyptian'];

  for (let i = 0; i < 12; i++) {
    const budget = Math.floor(Math.random() * 8000000) + 300000;
    const fName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const contactDaysAgo = Math.floor(Math.random() * 60);

    leads.push({
      id: `lead-${i}`,
      name: `${fName} ${lName}`,
      role: ROLES[Math.floor(Math.random() * ROLES.length)],
      nationality: NATIONALITIES[Math.floor(Math.random() * NATIONALITIES.length)],
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@demo.com`,
      phone: '+971 50 ...',
      minBudget: budget * 0.7,
      maxBudget: budget,
      preferredIndustries: [Industry.FnB],
      locationPreference: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
      notes: 'Generated demo lead interested in high ROI assets.',
      dateAdded: daysAgo(Math.floor(Math.random() * 45)),
      lastContactDate: daysAgo(contactDaysAgo),
      status: 'Active',
      touchCountWeek: contactDaysAgo > 7 ? 0 : Math.floor(Math.random() * 4),
      priorityScore: Math.floor(Math.random() * 100)
    });
  }

  return leads;
};

// Generate Massive Feedback Dataset
// Ensures every lead has at least 4 matches
export const generateDemoFeedback = (leads: Lead[], listings: Listing[]): MatchFeedback[] => {
  const feedbacks: MatchFeedback[] = [];

  // Helper to get random subset of listings
  const getRandomListings = (count: number) => {
    const shuffled = [...listings].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  leads.forEach(lead => {
    // 1. Determine how many listings this lead was sent (4 to 8)
    const matchCount = Math.floor(Math.random() * 5) + 4; 
    const assignedListings = getRandomListings(matchCount);

    assignedListings.forEach((listing, index) => {
      // 2. Determine the status of this match
      // Weighted probabilities:
      // 15% Positive
      // 25% Negative
      // 20% Pending (Recent - < 24h)
      // 40% Pending (Ignored - > 72h) -> Emphasizing the "Non-Responder" demo
      
      const rand = Math.random();
      let status: FeedbackStatus;
      let dateOffset: number; // days ago

      if (rand < 0.15) {
        status = FeedbackStatus.Positive;
        dateOffset = Math.floor(Math.random() * 5) + 1;
      } else if (rand < 0.40) {
        status = FeedbackStatus.Negative;
        dateOffset = Math.floor(Math.random() * 5) + 1;
      } else if (rand < 0.60) {
        status = FeedbackStatus.Pending;
        dateOffset = 0; // Today/Yesterday (Fresh)
      } else {
        status = FeedbackStatus.Pending;
        dateOffset = Math.floor(Math.random() * 4) + 3; // 3 to 7 days ago (Ignored)
      }

      // 3. Specific Overrides for Demo Narrative
      if (lead.id === 'lead-ent-1' && index < 3) {
         // Sarah Jenkins ignores first 3
         status = FeedbackStatus.Pending;
         dateOffset = 4;
      }

      feedbacks.push({
        id: uuid(),
        leadId: lead.id,
        listingId: listing.id,
        status: status,
        timestamp: daysAgo(dateOffset)
      });
    });
  });

  return feedbacks;
};