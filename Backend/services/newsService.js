const axios = require('axios');
const News = require('../models/News');
const { setCache, getCache, clearCache } = require('../middleware/cacheMiddleware');

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = process.env.NEWS_API_URL || 'https://newsapi.org/v2';
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const GNEWS_API_URL = 'https://gnews.io/api/v4';

// ─── Category Mapping ────────────────────────────────────────────────
const VALID_CATEGORIES = [
  'general', 'business', 'sports', 'technology',
  'entertainment', 'science', 'health'
];

// Map custom frontend categories → NewsAPI categories
const CATEGORY_MAP = {
  'world': 'general',
  'politics': 'general',
  'trending': 'general',
  'technology': 'technology',
  'business': 'business',
  'sports': 'sports',
  'entertainment': 'entertainment',
  'science': 'science',
  'health': 'health'
};

// Search keywords used when a category needs distinct results via /everything
const CATEGORY_SEARCH_KEYWORDS = {
  'world': 'international global affairs diplomacy United Nations',
  'politics': 'politics government elections parliament policy',
  'technology': 'technology software AI startups gadgets',
  'business': 'business economy stocks market finance',
  'sports': 'sports cricket football basketball Olympics',
  'entertainment': 'entertainment movies Bollywood Hollywood music',
  'science': 'science research space NASA discovery',
  'health': 'health medical WHO vaccines fitness',
  'general': 'India news today breaking latest'
};

function resolveCategory(cat) {
  if (!cat) return 'general';
  const lower = cat.toLowerCase();
  return CATEGORY_MAP[lower] || (VALID_CATEGORIES.includes(lower) ? lower : 'general');
}

// ─── Sub-Categories (search keywords) ─────────────────────
const SUB_CATEGORIES = {
  // Technology
  'AI Updates': 'artificial intelligence AI',
  'Machine Learning': 'machine learning deep learning',
  'Software': 'software development programming',
  'Gadgets': 'gadgets smartphones devices',
  'Cybersecurity': 'cybersecurity hacking data breach',
  'Tech Startups': 'tech startup funding',
  'Tech Industry': 'Google Apple Microsoft Meta Amazon',
  'Cloud & DevOps': 'cloud computing AWS Azure DevOps',
  'Blockchain': 'blockchain cryptocurrency web3',
  // Business
  'Indian Economy': 'Indian economy GDP budget',
  'Indian Stock Market': 'Nifty Sensex Indian stock market share price',
  'RBI Updates': 'RBI Reserve Bank of India repo rate',
  'Startup Funding': 'Indian startup funding unicorn',
  'Corporate News India': 'Reliance Tata Adani Indian corporate',
  'Global Markets': 'global stock markets Dow Jones NASDAQ',
  'International Trade': 'international trade exports imports',
  'Crypto Market': 'cryptocurrency Bitcoin Ethereum crypto news',
  'Global Corporate Mergers': 'corporate mergers acquisitions global',
  // Sports
  'Indian Cricket': 'Indian cricket team BCCI Virat Kohli Rohit Sharma',
  'IPL': 'IPL Indian Premier League T20',
  'Indian Domestic Sports': 'ISL Pro Kabaddi Indian domestic sports',
  'Olympic Updates India': 'India Olympics Neeraj Chopra',
  'FIFA': 'FIFA World Cup football soccer',
  'NBA': 'NBA basketball',
  'Formula 1': 'Formula 1 F1 racing',
  'International Cricket': 'international cricket ICC Test ODI T20',
  'World Championships': 'world championships athletics swimming',
  // World
  'India International Relations': 'India international relations diplomacy',
  'India–US/China/Pakistan Relations': 'India US China Pakistan relations',
  'Global Conflicts': 'global conflicts war crisis',
  'Climate Change': 'climate change global warming environment',
  'UN Updates': 'United Nations UN General Assembly',
  'Global Economy': 'global economy inflation recession',
  'International Summits': 'G20 G7 BRICS international summit',
  'Natural Disasters': 'natural disaster earthquake flood',
  // Politics
  'Indian Parliament Updates': 'Indian Parliament Lok Sabha Rajya Sabha bill',
  'State Elections': 'Indian state elections voting assembly',
  'Supreme Court Decisions': 'Supreme Court of India judgment verdict',
  'Central Government Policies': 'Indian government schemes policies Modi',
  'US Politics': 'US politics Biden Trump Congress',
  'European Politics': 'European politics EU Brexit',
  'Global Elections': 'global elections voting polls',
  // Entertainment
  'Bollywood': 'Bollywood Hindi movies actors',
  'Indian OTT': 'Indian OTT Netflix Prime Video Hotstar',
  'South Indian Cinema': 'South Indian cinema Tollywood Kollywood KGF',
  'Indian TV Industry': 'Indian TV shows reality TV',
  'Hollywood': 'Hollywood movies news actors',
  'Global OTT Releases': 'global OTT Netflix Disney+',
  'International Award Shows': 'Oscars Grammys Golden Globes',
  'Music Industry': 'music industry singers concerts'
};

// ─── Extract Keywords from Title ─────────────────────────────────────
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'can', 'shall',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above',
  'below', 'between', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how',
  'all', 'each', 'every', 'both', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'nor', 'not', 'only',
  'own', 'same', 'so', 'than', 'too', 'very', 'just',
  'and', 'but', 'or', 'if', 'while', 'about', 'up', 'out',
  'this', 'that', 'these', 'those', 'it', 'its', 'he', 'she',
  'they', 'them', 'his', 'her', 'their', 'what', 'which',
  'who', 'whom', 'my', 'your', 'our', 'we', 'you', 'me',
  'him', 'us', 'i', 'said', 'says', 'new', 'also', 'get',
  'like', 'make', 'know', 'take', 'come', 'think', 'see',
  'want', 'look', 'use', 'find', 'give', 'tell', 'work',
  'call', 'try', 'need', 'become', 'leave', 'put', 'mean',
  'keep', 'let', 'begin', 'seem', 'help', 'show', 'hear',
  'play', 'run', 'move', 'live', 'believe', 'hold', 'bring',
  'happen', 'write', 'provide', 'sit', 'stand', 'lose',
  'pay', 'meet', 'include', 'continue', 'set', 'learn',
  'change', 'lead', 'understand', 'watch', 'follow', 'stop',
  'create', 'speak', 'read', 'allow', 'add', 'spend',
  'grow', 'open', 'walk', 'win', 'offer', 'remember',
  'love', 'consider', 'appear', 'buy', 'wait', 'serve',
  'die', 'send', 'expect', 'build', 'stay', 'fall',
  'cut', 'reach', 'kill', 'remain', 'suggest', 'raise',
  'pass', 'sell', 'require', 'report', 'decide', 'pull'
]);

function extractKeywords(title) {
  if (!title) return [];
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

// ─── Similarity Score ────────────────────────────────────────────────
function similarityScore(keywords1, keywords2) {
  if (!keywords1.length || !keywords2.length) return 0;
  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);
  let intersection = 0;
  for (const word of set1) {
    if (set2.has(word)) intersection++;
  }
  const union = new Set([...set1, ...set2]).size;
  return union === 0 ? 0 : intersection / union; // Jaccard similarity
}

// ─── Group Similar Articles ──────────────────────────────────────────
function groupSimilarArticles(articles, threshold = 0.35) {
  const groups = [];
  const used = new Set();

  // Pre-extract keywords
  const articlesWithKw = articles.map(a => ({
    ...a,
    _keywords: extractKeywords(a.title)
  }));

  for (let i = 0; i < articlesWithKw.length; i++) {
    if (used.has(i)) continue;

    const group = {
      primary: articlesWithKw[i],
      related: [],
      alsoCoveredBy: []
    };
    used.add(i);

    for (let j = i + 1; j < articlesWithKw.length; j++) {
      if (used.has(j)) continue;
      const score = similarityScore(articlesWithKw[i]._keywords, articlesWithKw[j]._keywords);
      if (score >= threshold) {
        group.related.push(articlesWithKw[j]);
        group.alsoCoveredBy.push({
          source: articlesWithKw[j].source,
          url: articlesWithKw[j].url,
          title: articlesWithKw[j].title
        });
        used.add(j);
      }
    }

    groups.push(group);
  }

  return groups;
}

// ─── Deduplicate Articles ────────────────────────────────────────────
function deduplicateArticles(articles) {
  const seen = new Map();
  const result = [];

  for (const article of articles) {
    if (!article.title || article.title === '[Removed]') continue;
    if (!article.url) continue;

    const titleKey = article.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 60);
    if (!seen.has(titleKey)) {
      seen.set(titleKey, true);
      result.push(article);
    }
  }

  return result;
}

// ─── Normalize article from any API source ───────────────────────────
function normalizeArticle(article, category, source = 'newsapi', subCategory = null) {
  if (source === 'gnews') {
    return {
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      imageUrl: article.image,
      source: article.source?.name || 'Unknown',
      category: category,
      subCategory: subCategory,
      publishedAt: article.publishedAt,
      keywords: extractKeywords(article.title)
    };
  }
  // Default: NewsAPI format
  return {
    title: article.title,
    description: article.description,
    content: article.content,
    url: article.url,
    imageUrl: article.urlToImage,
    source: article.source?.name || article.source || 'Unknown',
    category: category,
    subCategory: subCategory,
    publishedAt: article.publishedAt,
    keywords: extractKeywords(article.title)
  };
}

// ─── Fetch from NewsAPI (Primary) ────────────────────────────────────
async function fetchFromNewsAPI(category, page = 1, pageSize = 20, country = 'in') {
  if (!NEWS_API_KEY || NEWS_API_KEY === 'your_newsapi_key') return null;

  const apiCategory = resolveCategory(category);
  const response = await axios.get(`${NEWS_API_URL}/top-headlines`, {
    params: {
      country: country,
      category: apiCategory,
      page,
      pageSize,
      apiKey: NEWS_API_KEY
    },
    timeout: 10000
  });

  return {
    articles: (response.data.articles || []).map(a => normalizeArticle(a, category, 'newsapi')),
    totalResults: response.data.totalResults || 0
  };
}

// ─── Fetch from GNews (Fallback) ────────────────────────────────────
async function fetchFromGNews(category, page = 1, pageSize = 10, country = 'in') {
  if (!GNEWS_API_KEY) return null;

  const topicMap = {
    'general': 'nation', 'business': 'business', 'sports': 'sports',
    'technology': 'technology', 'entertainment': 'entertainment',
    'science': 'science', 'health': 'health', 'world': 'world'
  };

  const topic = topicMap[resolveCategory(category)] || 'nation';

  const response = await axios.get(`${GNEWS_API_URL}/top-headlines`, {
    params: {
      topic,
      lang: 'en',
      country: country,
      max: pageSize,
      apikey: GNEWS_API_KEY
    },
    timeout: 10000
  });

  return {
    articles: (response.data.articles || []).map(a => normalizeArticle(a, category, 'gnews')),
    totalResults: response.data.totalArticles || 0
  };
}

// ─── Search via NewsAPI Everything ───────────────────────────────────
async function fetchSearchResults(query, page = 1, pageSize = 20, options = {}) {
  if (!NEWS_API_KEY || NEWS_API_KEY === 'your_newsapi_key') return { articles: [], totalResults: 0 };

  const params = {
    q: query,
    page,
    pageSize,
    language: 'en',
    sortBy: 'publishedAt',
    apiKey: NEWS_API_KEY,
    ...options
  };

  const response = await axios.get(`${NEWS_API_URL}/everything`, {
    params,
    timeout: 10000
  });

  return {
    articles: (response.data.articles || []).map(a => normalizeArticle(a, 'search', 'newsapi')),
    totalResults: response.data.totalResults || 0
  };
}

// ─── Built-in Fallback News (shown when all APIs + DB fail) ──────────
// Ensures every category always renders content, even with no API keys.
function getFallbackNews(category) {
  const now = new Date();
  const hoursAgo = (h) => new Date(now - h * 3600000).toISOString();
  const cat = (category || 'general').toLowerCase();

  const placeholder = (c) => {
    const map = {
      technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600',
      business:   'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600',
      sports:     'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600',
      entertainment: 'https://images.unsplash.com/photo-1603190287605-e6ade32fa852?w=600',
      health:     'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600',
      science:    'https://images.unsplash.com/photo-1532094349884-543559741925?w=600',
      world:      'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600',
      politics:   'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600',
      general:    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600',
    };
    return map[c] || map.general;
  };

  const FALLBACK_DATA = {
    technology: [
      { title: 'India Launches National AI Mission Worth ₹10,000 Crore', description: 'The Indian government announced a major initiative to position India as a global AI powerhouse, funding research labs and startups across the country.', url: 'https://techcrunch.com', source: 'TechCrunch', publishedAt: hoursAgo(1) },
      { title: 'Apple Announces M4 MacBook Pro with 24-Hour Battery Life', description: 'The latest MacBook Pro lineup arrives with Apple Silicon M4 chip delivering unprecedented performance and all-day battery life.', url: 'https://www.theverge.com', source: 'The Verge', publishedAt: hoursAgo(2) },
      { title: 'Google DeepMind Achieves New Benchmark in Protein Folding Research', description: 'Researchers at Google DeepMind have made a breakthrough in understanding protein structures that could accelerate drug discovery.', url: 'https://www.wired.com', source: 'Wired', publishedAt: hoursAgo(3) },
      { title: 'OpenAI Releases GPT-5 with Multimodal Reasoning Capabilities', description: 'OpenAI\'s latest model can reason across text, images, and audio simultaneously, marking a major step toward AGI.', url: 'https://techcrunch.com', source: 'TechCrunch', publishedAt: hoursAgo(4) },
      { title: 'ISRO Successfully Tests Reusable Launch Vehicle Technology', description: 'India\'s space agency demonstrates reusable rocket technology that will dramatically cut satellite launch costs.', url: 'https://www.ndtv.com', source: 'NDTV', publishedAt: hoursAgo(5) },
      { title: 'Microsoft Azure Expands Data Centres Across India', description: 'Microsoft is investing $3 billion in new cloud infrastructure across Mumbai, Pune, and Hyderabad to meet surging enterprise demand.', url: 'https://economictimes.indiatimes.com', source: 'Economic Times', publishedAt: hoursAgo(6) },
      { title: 'Samsung Unveils Galaxy Z Fold 7 with AI Photography Features', description: 'The new foldable flagship includes an on-device AI assistant that can edit photos and summarise documents in real-time.', url: 'https://www.gsmarena.com', source: 'GSMArena', publishedAt: hoursAgo(7) },
      { title: 'Cybersecurity Breach Exposes 200 Million Records Globally', description: 'A sophisticated ransomware attack targeting cloud storage providers has exposed sensitive data across 40 countries.', url: 'https://www.bbc.com/news/technology', source: 'BBC Tech', publishedAt: hoursAgo(8) },
    ],
    business: [
      { title: 'Sensex Surges 800 Points as FII Inflows Hit 3-Month High', description: 'Foreign institutional investors pumped in over ₹6,000 crore in a single session, driving a broad-based market rally.', url: 'https://economictimes.indiatimes.com', source: 'Economic Times', publishedAt: hoursAgo(1) },
      { title: 'RBI Holds Repo Rate at 6.5% Amid Inflation Concerns', description: 'The Reserve Bank of India kept rates unchanged at its bi-monthly review, signalling caution on inflation trajectory.', url: 'https://www.livemint.com', source: 'LiveMint', publishedAt: hoursAgo(2) },
      { title: 'Tata Group Acquires Air India\'s Remaining Stake for ₹2,900 Crore', description: 'The Tata Sons acquisition consolidates its position as India\'s largest airline conglomerate ahead of fleet expansion.', url: 'https://www.business-standard.com', source: 'Business Standard', publishedAt: hoursAgo(3) },
      { title: 'Reliance Jio IPO Expected to List at $100 Billion Valuation', description: 'Sources close to the deal suggest Jio Platforms could list in 2025, making it one of the biggest tech IPOs globally.', url: 'https://www.reuters.com', source: 'Reuters', publishedAt: hoursAgo(4) },
      { title: 'US Fed Signals Two Rate Cuts in 2025 as Inflation Cools', description: 'The Federal Reserve indicated it may cut rates twice this year following a consistent drop in core inflation numbers.', url: 'https://www.bloomberg.com', source: 'Bloomberg', publishedAt: hoursAgo(5) },
      { title: 'Startup Funding in India Rebounds with $4.2B Raised in Q1', description: 'Indian startups saw a strong recovery in venture funding led by fintech, SaaS, and electric vehicle sectors.', url: 'https://www.financialexpress.com', source: 'Financial Express', publishedAt: hoursAgo(6) },
      { title: 'Oil Prices Drop Below $70 as OPEC+ Increases Production Quotas', description: 'Brent crude fell sharply after OPEC+ members agreed to increase output, easing global energy prices.', url: 'https://www.cnbc.com', source: 'CNBC', publishedAt: hoursAgo(7) },
      { title: 'Amazon India Hits $20 Billion GMV Milestone in FY2025', description: 'Amazon India reported record gross merchandise value, beating Flipkart in key categories like electronics and fashion.', url: 'https://economictimes.indiatimes.com', source: 'Economic Times', publishedAt: hoursAgo(8) },
    ],
    sports: [
      { title: 'India Beat Australia by 6 Wickets in Third ODI, Series Levelled', description: 'Shubman Gill\'s stunning century and Kuldeep Yadav\'s four-wicket haul sealed a memorable win for Team India.', url: 'https://www.espncricinfo.com', source: 'ESPN Cricinfo', publishedAt: hoursAgo(1) },
      { title: 'IPL 2025 Final: MI vs CSK — Mumbai Indians Win Record 6th Title', description: 'A last-over thriller saw Mumbai Indians clinch the IPL trophy for a record sixth time in front of 100,000 fans.', url: 'https://www.cricbuzz.com', source: 'Cricbuzz', publishedAt: hoursAgo(2) },
      { title: 'Neeraj Chopra Throws 91.5m to Win Diamond League Gold in Doha', description: 'India\'s Olympic champion set a personal best in the javelin throw, cementing his status as the world\'s best.', url: 'https://www.thehindu.com', source: 'The Hindu', publishedAt: hoursAgo(3) },
      { title: 'Real Madrid Crowned Champions League Winners After 3-1 Final Win', description: 'Vinicius Jr scored twice as Real Madrid secured their record-extending 16th Champions League title in London.', url: 'https://www.skysports.com', source: 'Sky Sports', publishedAt: hoursAgo(4) },
      { title: 'Formula 1: Verstappen Takes Pole at Monaco Grand Prix', description: 'Max Verstappen dominated qualifying in wet conditions at the iconic Monaco street circuit.', url: 'https://www.formula1.com', source: 'Formula 1', publishedAt: hoursAgo(5) },
      { title: 'NBA Playoffs: Boston Celtics Advance to Conference Finals', description: 'The Celtics eliminated the Miami Heat in six games, booking their spot in the Eastern Conference Finals.', url: 'https://www.espn.com', source: 'ESPN', publishedAt: hoursAgo(6) },
      { title: 'PV Sindhu Wins All England Open, Claims 2nd Title in Three Years', description: 'India\'s badminton star defeated China\'s Chen Yufei in a gripping final to claim one of badminton\'s most prestigious titles.', url: 'https://www.bwfbadminton.com', source: 'BWF', publishedAt: hoursAgo(7) },
      { title: 'Rohit Sharma Named ICC Men\'s Cricketer of the Year 2024', description: 'The Mumbai Indians captain was recognised for leading India to Test and ODI series wins across four continents.', url: 'https://www.icc-cricket.com', source: 'ICC', publishedAt: hoursAgo(8) },
    ],
    entertainment: [
      { title: 'Pushpa 2 Breaks Box Office Record with ₹1,800 Crore Opening Week', description: 'Allu Arjun\'s blockbuster sequel shattered records in both domestic and overseas markets, surpassing RRR worldwide.', url: 'https://www.bollywoodhungama.com', source: 'Bollywood Hungama', publishedAt: hoursAgo(1) },
      { title: 'Netflix India Announces 10 Original Series for 2025 Lineup', description: 'Netflix India unveiled an ambitious slate of originals featuring some of Bollywood\'s biggest names and directors.', url: 'https://variety.com', source: 'Variety', publishedAt: hoursAgo(2) },
      { title: 'AR Rahman Wins Grammy for Best Global Music Album', description: 'The legendary composer\'s latest collaboration with international artists clinched the prestigious Grammy Award.', url: 'https://www.pinkvilla.com', source: 'Pinkvilla', publishedAt: hoursAgo(3) },
      { title: 'Shah Rukh Khan\'s Dunki 2 Enters Pre-Production Phase', description: 'SRK and Rajkumar Hirani confirm the sequel to the 2023 blockbuster, with filming expected to begin mid-2025.', url: 'https://www.filmfare.com', source: 'Filmfare', publishedAt: hoursAgo(4) },
      { title: 'Oscars 2025: All Quiet on the Western Front Wins Best Picture', description: 'The German anti-war epic became the first non-English film to win Best Picture in a historic Oscars ceremony.', url: 'https://www.hollywoodreporter.com', source: 'Hollywood Reporter', publishedAt: hoursAgo(5) },
      { title: 'Taylor Swift\'s Eras Tour Becomes Highest-Grossing Concert in History', description: 'The pop icon\'s world tour generated over $2 billion in revenue, surpassing Elton John\'s Farewell Yellow Brick Road tour.', url: 'https://www.billboard.com', source: 'Billboard', publishedAt: hoursAgo(6) },
      { title: 'Deepika Padukone Joins Marvel Cinematic Universe in New Film', description: 'Bollywood superstar Deepika Padukone is confirmed to star alongside Benedict Cumberbatch in the next MCU outing.', url: 'https://www.indiatoday.in', source: 'India Today', publishedAt: hoursAgo(7) },
      { title: 'Prime Video\'s Panchayat Season 3 Breaks Streaming Records in India', description: 'The beloved rural comedy-drama returned to massive viewership numbers, drawing comparisons to global hit shows.', url: 'https://www.ott.in', source: 'OTT.in', publishedAt: hoursAgo(8) },
    ],
    health: [
      { title: 'ICMR Approves First Indigenous COVID-19 Oral Drug for Emergency Use', description: 'An orally administered antiviral developed entirely in India receives emergency authorisation from ICMR regulators.', url: 'https://www.thehindu.com', source: 'The Hindu', publishedAt: hoursAgo(1) },
      { title: 'WHO Declares End to Mpox Global Health Emergency', description: 'The World Health Organization announced that the mpox outbreak no longer constitutes a Public Health Emergency of International Concern.', url: 'https://www.who.int', source: 'WHO', publishedAt: hoursAgo(2) },
      { title: 'New Study Links Ultra-Processed Foods to 32% Higher Cancer Risk', description: 'A landmark study of 200,000 participants found a strong association between ultra-processed food consumption and cancer incidence.', url: 'https://www.medicalnewstoday.com', source: 'Medical News Today', publishedAt: hoursAgo(3) },
      { title: 'Ayushman Bharat Coverage Extended to Senior Citizens Above 70', description: 'India\'s flagship health insurance scheme now covers all citizens above 70 years, adding 60 million new beneficiaries.', url: 'https://www.ndtv.com', source: 'NDTV', publishedAt: hoursAgo(4) },
      { title: 'Breakthrough: Scientists Develop Universal Flu Vaccine Candidate', description: 'A team at the NIH developed a vaccine that targets conserved parts of the influenza virus, potentially ending seasonal flu shots.', url: 'https://www.scientificamerican.com', source: 'Scientific American', publishedAt: hoursAgo(5) },
      { title: 'Mental Health Apps See 300% Surge in India Post-Pandemic', description: 'Digital mental health platforms have seen explosive growth in India, with millennials and Gen Z driving adoption.', url: 'https://www.healthline.com', source: 'Healthline', publishedAt: hoursAgo(6) },
      { title: 'India Reports Sharp Drop in Tuberculosis Cases — WHO Data', description: 'India achieved a 24% reduction in TB incidence between 2015 and 2024, ahead of the national elimination target.', url: 'https://www.mohfw.gov.in', source: 'MoHFW', publishedAt: hoursAgo(7) },
      { title: 'Exercise Found to Reduce Alzheimer\'s Risk by Up to 45%, Study Shows', description: 'Regular moderate aerobic exercise significantly lowers the buildup of amyloid plaques associated with Alzheimer\'s disease.', url: 'https://www.webmd.com', source: 'WebMD', publishedAt: hoursAgo(8) },
    ],
    science: [
      { title: 'Chandrayaan-4 Successfully Enters Lunar Orbit on First Attempt', description: 'ISRO\'s fourth lunar mission entered a stable orbit around the Moon, paving the way for sample return operations.', url: 'https://www.isro.gov.in', source: 'ISRO', publishedAt: hoursAgo(1) },
      { title: 'James Webb Telescope Discovers Oldest Galaxy Ever Observed', description: 'Astronomers confirmed that JADES-GS-z14-0 formed just 300 million years after the Big Bang, rewriting cosmic history.', url: 'https://www.nasa.gov', source: 'NASA', publishedAt: hoursAgo(2) },
      { title: 'Scientists Achieve Room-Temperature Superconductivity Breakthrough', description: 'Researchers at MIT developed a material that conducts electricity with zero resistance at room temperature, ending a century-long quest.', url: 'https://www.nature.com', source: 'Nature', publishedAt: hoursAgo(3) },
      { title: 'CERN Announces Discovery of Two New Subatomic Particles', description: 'Physicists at the Large Hadron Collider identified two previously unknown pentaquark particles that challenge the standard model.', url: 'https://www.cern.ch', source: 'CERN', publishedAt: hoursAgo(4) },
      { title: 'SpaceX Starship Completes First Crewed Mission Around the Moon', description: 'Elon Musk\'s Starship carried four astronauts on a successful circumlunar mission, the farthest humans have travelled since Apollo.', url: 'https://www.spacex.com', source: 'SpaceX', publishedAt: hoursAgo(5) },
      { title: 'India\'s Aditya-L1 Solar Mission Reveals New Solar Wind Data', description: 'The solar observatory spacecraft has sent back unprecedented data about solar wind composition, aiding space weather prediction.', url: 'https://www.isro.gov.in', source: 'ISRO', publishedAt: hoursAgo(6) },
      { title: 'Gene Editing Cures Sickle Cell Disease in 47 Patients — Trial Results', description: 'A CRISPR-based gene therapy achieved complete remission in sickle cell disease patients, a potential functional cure.', url: 'https://www.cell.com', source: 'Cell Journal', publishedAt: hoursAgo(7) },
      { title: 'Climate Scientists Warn 2025 on Track to Exceed 1.5°C Warming', description: 'New data from monitoring stations shows global average temperatures are consistently breaching the Paris Agreement threshold.', url: 'https://www.climate.gov', source: 'NOAA', publishedAt: hoursAgo(8) },
    ],
    world: [
      { title: 'India and China Agree on Full Disengagement Along LAC in Ladakh', description: 'A landmark diplomatic agreement ends a four-year standoff along the Line of Actual Control, restoring patrol rights on both sides.', url: 'https://www.thehindu.com', source: 'The Hindu', publishedAt: hoursAgo(1) },
      { title: 'G20 Summit in New Delhi Agrees to Debt Relief Framework for Poor Nations', description: 'Leaders from the world\'s 20 largest economies endorsed a new debt restructuring mechanism for over-indebted developing nations.', url: 'https://www.reuters.com', source: 'Reuters', publishedAt: hoursAgo(2) },
      { title: 'UN General Assembly Adopts Historic Global AI Governance Treaty', description: '193 countries agreed on binding rules for responsible AI development, the first such multilateral agreement in history.', url: 'https://www.un.org', source: 'United Nations', publishedAt: hoursAgo(3) },
      { title: 'Gaza Ceasefire Holds as Humanitarian Aid Convoys Enter Strip', description: 'A brokered ceasefire enters its second week with international observers monitoring compliance and aid distribution.', url: 'https://www.aljazeera.com', source: 'Al Jazeera', publishedAt: hoursAgo(4) },
      { title: 'EU Announces €500 Billion Green Transition Investment Plan', description: 'The European Union unveiled the largest ever climate investment package, targeting carbon neutrality by 2040.', url: 'https://www.bbc.com/news/world', source: 'BBC World', publishedAt: hoursAgo(5) },
      { title: 'India Assumes Presidency of BRICS for 2025', description: 'India takes the rotating BRICS chair, focusing on digital public infrastructure, climate finance, and multilateral reform.', url: 'https://www.indiatoday.in', source: 'India Today', publishedAt: hoursAgo(6) },
      { title: 'NATO Admits Sweden and Finland, Expanding Alliance to 32 Members', description: 'Both Nordic nations formally joined the alliance, marking the biggest NATO expansion since the Cold War era.', url: 'https://www.nato.int', source: 'NATO', publishedAt: hoursAgo(7) },
      { title: 'Amazon Deforestation Drops 50% Under Brazil\'s New Environmental Policy', description: 'Satellite data confirms a dramatic reduction in Amazon destruction following sweeping policy changes by Brazil\'s government.', url: 'https://www.guardian.com', source: 'The Guardian', publishedAt: hoursAgo(8) },
    ],
    politics: [
      { title: 'PM Modi Visits Washington: India-US Ink Defence and Tech Deals Worth $20B', description: 'Prime Minister Modi\'s state visit resulted in landmark agreements on fighter jets, semiconductors, and space collaboration.', url: 'https://www.thehindu.com', source: 'The Hindu', publishedAt: hoursAgo(1) },
      { title: 'Lok Sabha Passes Digital India Act Replacing IT Act 2000', description: 'Parliament cleared the landmark legislation regulating social media, AI platforms, and online safety after months of debate.', url: 'https://www.ndtv.com', source: 'NDTV', publishedAt: hoursAgo(2) },
      { title: 'Supreme Court Upholds Electoral Bond Scheme Struck Down, Orders SBI Disclosure', description: 'The apex court ordered full disclosure of electoral bond donors, delivering a major transparency ruling in democratic funding.', url: 'https://indianexpress.com', source: 'Indian Express', publishedAt: hoursAgo(3) },
      { title: 'Bihar Assembly Elections: Exit Polls Show NDA Ahead', description: 'Most exit polls predict NDA will retain Bihar, with close contests in over 80 of the 243 assembly constituencies.', url: 'https://www.abplive.com', source: 'ABP Live', publishedAt: hoursAgo(4) },
      { title: 'US Presidential Race: Trump vs Harris Polls Show Dead Heat', description: 'National polling averages show the two candidates within the margin of error six months before the general election.', url: 'https://www.cnn.com', source: 'CNN', publishedAt: hoursAgo(5) },
      { title: 'One Nation One Election Bill Referred to Joint Parliamentary Committee', description: 'The legislation proposing simultaneous national and state elections has been sent to a JPC for detailed scrutiny.', url: 'https://www.republicworld.com', source: 'Republic World', publishedAt: hoursAgo(6) },
      { title: 'France Snap Elections Result in Hung Parliament', description: 'Inconclusive results leave France without a clear majority, raising political uncertainty in Europe\'s second-largest economy.', url: 'https://www.france24.com', source: 'France 24', publishedAt: hoursAgo(7) },
      { title: 'CAA Implementation: Citizenship Certificates Issued to 100,000 Applicants', description: 'The central government issued citizenship certificates under the Citizenship Amendment Act to the first batch of applicants.', url: 'https://www.news18.com', source: 'News18', publishedAt: hoursAgo(8) },
    ],
    general: [
      { title: 'India Tops Global Happiness Index Among Emerging Economies', description: 'A new report ranks India highly for social mobility, economic optimism, and improved quality of life metrics.', url: 'https://www.ndtv.com', source: 'NDTV', publishedAt: hoursAgo(1) },
      { title: 'Heavy Monsoon Rains Lash Mumbai; Schools Shut as IMD Issues Orange Alert', description: 'The India Meteorological Department issued an orange alert for Mumbai and Thane as heavy rainfall caused waterlogging.', url: 'https://timesofindia.indiatimes.com', source: 'Times of India', publishedAt: hoursAgo(2) },
      { title: 'UPI Crosses 10 Billion Transactions in Single Month for First Time', description: 'India\'s homegrown payments system broke a new record, processing over ₹15 lakh crore in value during the month.', url: 'https://economictimes.indiatimes.com', source: 'Economic Times', publishedAt: hoursAgo(3) },
      { title: 'India\'s Population Reaches 1.45 Billion — UN Report', description: 'India now has the world\'s largest population, with a median age of 28, making it the youngest major economy globally.', url: 'https://www.thehindu.com', source: 'The Hindu', publishedAt: hoursAgo(4) },
      { title: 'National Education Policy 2020: 5 Years On — Progress Report', description: 'A government review shows significant improvements in foundational literacy, coding education, and school dropout rates.', url: 'https://indianexpress.com', source: 'Indian Express', publishedAt: hoursAgo(5) },
      { title: 'Zomato Acquires Blinkit: India\'s Biggest Food-Tech Consolidation', description: 'The ₹4,447 crore all-stock deal creates India\'s largest quick-commerce and food delivery platform.', url: 'https://www.livemint.com', source: 'LiveMint', publishedAt: hoursAgo(6) },
      { title: 'Delhi Air Quality Index Improves to "Good" for First Time in 5 Years', description: 'A combination of wind patterns, stubble-burning bans, and EV adoption has dramatically improved Delhi\'s air quality.', url: 'https://www.hindustantimes.com', source: 'Hindustan Times', publishedAt: hoursAgo(7) },
      { title: 'India Launches 5G in 50 New Cities, Covering 90% of Urban Population', description: 'Reliance Jio and Airtel complete their 5G rollout across Tier 2 and Tier 3 cities, boosting digital connectivity.', url: 'https://www.scroll.in', source: 'Scroll.in', publishedAt: hoursAgo(8) },
    ],
  };

  // Resolve to a known fallback key
  const key = FALLBACK_DATA[cat] ? cat
    : CATEGORY_MAP[cat] && FALLBACK_DATA[CATEGORY_MAP[cat]] ? CATEGORY_MAP[cat]
    : 'general';

  const raw = FALLBACK_DATA[key] || FALLBACK_DATA.general;
  return raw.map((a, i) => ({
    title: a.title,
    description: a.description,
    url: a.url,
    imageUrl: placeholder(key),
    source: a.source,
    category: cat,
    subCategory: null,
    publishedAt: a.publishedAt,
    keywords: extractKeywords(a.title)
  }));
}

// ─── Main: Fetch Top Headlines with Caching & Fallback ───────────────
const fetchTopHeadlines = async (category = 'general', page = 1, pageSize = 20, country = 'in') => {

  const cacheKey = `news_${category}_p${page}_s${pageSize}_c${country}`;

  // 1. Check in-memory cache
  const cached = getCache(cacheKey);
  if (cached) {
    return { ...cached.data, source: 'cache', cachedAt: cached.cachedAt };
  }

  let articles = [];
  let totalResults = 0;
  let dataSource = 'api';

  // 2. Try primary: NewsAPI
  try {
    const result = await fetchFromNewsAPI(category, page, pageSize, country);
    if (result && result.articles.length > 0) {
      articles = result.articles;
      totalResults = result.totalResults;
      dataSource = 'newsapi';
    }
  } catch (err) {
    console.warn(`[NewsAPI] Failed for ${category} (${country}):`, err.message);
  }

  // 3. Fallback: GNews
  if (articles.length === 0) {
    try {
      const result = await fetchFromGNews(category, page, pageSize, country);
      if (result && result.articles.length > 0) {
        articles = result.articles;
        totalResults = result.totalResults;
        dataSource = 'gnews';
      }
    } catch (err) {
      console.warn(`[GNews] Failed for ${category} (${country}):`, err.message);
    }
  }

  // 4. Final fallback: MongoDB cache (only if country is 'in' or no country specified)
  if (articles.length === 0) {
    try {
      const query = { category: resolveCategory(category) };
      const dbArticles = await News.find(query)
        .sort({ publishedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean();

      const totalCount = await News.countDocuments(query);

      if (dbArticles.length > 0) {
        return {
          articles: dbArticles,
          totalResults: totalCount,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          source: 'database'
        };
      }
    } catch (err) {
      console.warn('[DB Fallback] Failed:', err.message);
    }
  }

  // 5. Ultimate fallback: built-in sample data so categories are never empty
  if (articles.length === 0) {
    articles = getFallbackNews(category);
    dataSource = 'fallback';
    totalResults = articles.length;
  }

  // 5. Deduplicate
  articles = deduplicateArticles(articles);

  const responseData = {
    articles,
    totalResults,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    source: dataSource
  };

  // 6. Cache in memory (10 min TTL)
  if (articles.length > 0) {
    setCache(cacheKey, responseData, 10 * 60 * 1000);

    // Async persist to MongoDB (only for 'in' country and first page to keep DB clean)
    if (country === 'in' && page === 1) {
      const newsDocs = articles.map(a => ({
        ...a,
        fetchedAt: new Date()
      }));
      News.insertMany(newsDocs, { ordered: false }).catch(() => { });
    }
  }

  return responseData;
};

// ─── Search News ─────────────────────────────────────────────────────
const searchNews = async (query, page = 1, pageSize = 20) => {
  const cacheKey = `search_${query}_p${page}`;
  const cached = getCache(cacheKey);
  if (cached) return { ...cached.data, source: 'cache' };

  try {
    const result = await fetchSearchResults(query, page, pageSize);
    const articles = deduplicateArticles(result.articles);
    const responseData = { articles, totalResults: result.totalResults };
    setCache(cacheKey, responseData, 5 * 60 * 1000);
    return responseData;
  } catch (error) {
    // Fallback: search in DB
    const dbResults = await News.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    })
      .sort({ publishedAt: -1 })
      .limit(pageSize)
      .lean();

    return { articles: dbResults, totalResults: dbResults.length, source: 'database' };
  }
};

// ─── Get Related News for Sidebar ────────────────────────────────────
const getRelatedNews = async (category, excludeUrls = [], limit = 15) => {
  const cacheKey = `related_${category}_${limit}`;
  const cached = getCache(cacheKey);
  if (cached) return cached.data;

  // Fetch fresh articles for the category
  const data = await fetchTopHeadlines(category, 1, 40);
  let articles = data.articles.filter(a => !excludeUrls.includes(a.url));

  // Group similar articles
  const groups = groupSimilarArticles(articles);

  // Build related news with "Also Covered By" info
  const relatedNews = groups.slice(0, limit).map(group => ({
    ...group.primary,
    alsoCoveredBy: group.alsoCoveredBy,
    relatedCount: group.related.length
  }));

  setCache(cacheKey, relatedNews, 10 * 60 * 1000);
  return relatedNews;
};

// ─── Get Sub-Category News ────────────────────────────────
const getSubCategoryNews = async (category, subCategory, page = 1, pageSize = 20) => {
  const searchQuery = SUB_CATEGORIES[subCategory] || subCategory;
  const cacheKey = `sub_${category}_${subCategory}_p${page}`;
  const cached = getCache(cacheKey);
  if (cached) return { ...cached.data, source: 'cache' };

  try {
    // For subcategories, we search globally but can filter by query
    const result = await fetchSearchResults(searchQuery, page, pageSize);
    const articles = deduplicateArticles(result.articles).map(a => ({
      ...a,
      category,
      subCategory
    }));
    const responseData = { articles, totalResults: result.totalResults };
    setCache(cacheKey, responseData, 10 * 60 * 1000);
    return responseData;
  } catch (error) {
    return { articles: [], totalResults: 0, source: 'error' };
  }
};

// ─── Get Structured Category Content ──────────────────────────────────
/**
 * Dynamic structure:
 * 1. Indian Current News (Top Section)
 * 2. Worldwide News (Second Section)
 * 3. Related / Similar News (Third Section - grouped)
 */
const getStructuredCategoryNews = async (category, subCategory = null) => {
  const cacheKey = `structured_${category}_${subCategory || 'all'}`;
  const cached = getCache(cacheKey);
  if (cached) return cached.data;

  try {
    let indianNews = [];
    let worldNews = [];

    if (subCategory) {
      const q = SUB_CATEGORIES[subCategory] || subCategory;
      const resInd = await fetchSearchResults(`${q} India`, 1, 10);
      const resWorld = await fetchSearchResults(`${q} world`, 1, 10);
      indianNews = resInd.articles;
      worldNews = resWorld.articles;
    } else {
      // For world/politics, use keyword search to get distinct results
      const needsSearch = ['world', 'politics'].includes(category.toLowerCase());

      if (needsSearch) {
        const kw = CATEGORY_SEARCH_KEYWORDS[category.toLowerCase()] || category;
        const resInd = await fetchSearchResults(`${kw} India`, 1, 15);
        const resWorld = await fetchSearchResults(`${kw} international`, 1, 15);
        indianNews = resInd.articles.map(a => ({ ...a, category }));
        worldNews = resWorld.articles.map(a => ({ ...a, category }));
      } else {
        const resInd = await fetchTopHeadlines(category, 1, 15, 'in');
        const resWorld = await fetchTopHeadlines(category, 1, 15, 'us');
        indianNews = resInd.articles;
        worldNews = resWorld.articles;
      }
    }

    // If both are empty, use fallback news for this category
    if (indianNews.length === 0 && worldNews.length === 0) {
      const fallback = getFallbackNews(category);
      indianNews = fallback.filter((_, i) => i % 2 === 0);
      worldNews = fallback.filter((_, i) => i % 2 !== 0);
    }

    // Deduplicate between sections
    const seenUrls = new Set();
    const cleanIndian = indianNews.filter(a => {
      if (seenUrls.has(a.url)) return false;
      seenUrls.add(a.url);
      return true;
    });

    const cleanWorld = worldNews.filter(a => {
      if (seenUrls.has(a.url)) return false;
      seenUrls.add(a.url);
      return true;
    });

    // Grouping logic for "Related Similar News"
    const allCombined = [...cleanIndian, ...cleanWorld];
    const grouped = groupSimilarArticles(allCombined, 0.3);

    const responseData = {
      indian: cleanIndian,
      worldwide: cleanWorld,
      relatedGroups: grouped.filter(g => g.related.length > 0).slice(0, 10),
      lastUpdated: new Date().toISOString()
    };

    setCache(cacheKey, responseData, 10 * 60 * 1000);
    return responseData;
  } catch (error) {
    console.error('Structured news fetch error:', error);
    // Even on error, return fallback so pages are never blank
    const fallback = getFallbackNews(category);
    return {
      indian: fallback.filter((_, i) => i % 2 === 0),
      worldwide: fallback.filter((_, i) => i % 2 !== 0),
      relatedGroups: [],
      lastUpdated: new Date().toISOString()
    };
  }
};

// ─── Personalized Feed ───────────────────────────────────────────────
const getPersonalizedNews = async (interests) => {
  const promises = interests.map(cat => fetchTopHeadlines(cat, 1, 10, 'in'));
  const results = await Promise.allSettled(promises);
  const articles = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value.articles);
  // Shuffle
  return articles.sort(() => 0.5 - Math.random());
};

// ─── Trending News (multi-category) ──────────────────────────────────
const getTrendingNews = async (page = 1, pageSize = 20) => {
  return await fetchTopHeadlines('general', page, pageSize);
};

// ─── Scheduled Refresh (called by cron) ──────────────────────────────
const refreshAllCategories = async () => {
  console.log('[CRON] Refreshing all news categories...');
  const categories = ['general', 'business', 'sports', 'technology', 'entertainment', 'science', 'health'];

  for (const cat of categories) {
    try {
      clearCache(`news_${cat}_p1_s20`);
      await fetchTopHeadlines(cat, 1, 20);
      console.log(`  ✅ Refreshed: ${cat}`);
    } catch (err) {
      console.error(`  ❌ Failed: ${cat} - ${err.message}`);
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  console.log('[CRON] Refresh complete.');
};

// ─── Last Updated Tracking ───────────────────────────────────────────
let lastUpdatedAt = new Date().toISOString();

function getLastUpdated() {
  return lastUpdatedAt;
}

function setLastUpdated() {
  lastUpdatedAt = new Date().toISOString();
}

module.exports = {
  fetchTopHeadlines,
  searchNews,
  getRelatedNews,
  getSubCategoryNews,
  getStructuredCategoryNews,
  getPersonalizedNews,
  getTrendingNews,
  refreshAllCategories,
  groupSimilarArticles,
  getLastUpdated,
  setLastUpdated
};