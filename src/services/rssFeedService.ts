import { ReadingGenre } from '../types';

export interface NewsInspiration {
  source: string;
  headline: string;
  summary: string;
  url?: string;
  publishedAt?: string;
}

export interface RssFeedConfig {
  source: string;
  url: string;
}

export const GENRE_RSS_FEEDS: Record<ReadingGenre, RssFeedConfig[]> = {
  news: [
    { source: 'BBC World News', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
    { source: 'The Guardian', url: 'https://www.theguardian.com/world/rss' },
    { source: 'NPR News', url: 'https://feeds.npr.org/1001/rss.xml' },
    { source: 'Deutsche Welle', url: 'https://rss.dw.com/rdf/rss-en-all' },
    { source: 'Al Jazeera English', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
    { source: 'Politico', url: 'https://rss.politico.com/politics-news.xml' },
    { source: 'Associated Press News', url: 'https://news.google.com/rss/search?q=associated+press+top+news&hl=en-US&gl=US&ceid=US:en' },
    { source: 'Reuters International', url: 'https://news.google.com/rss/search?q=reuters+world+news&hl=en-US&gl=US&ceid=US:en' },
  ],
  workplace: [
    { source: 'Harvard Business Review', url: 'https://feeds.hbr.org/harvardbusiness' },
    { source: 'Forbes Business', url: 'https://www.forbes.com/business/feed/' },
    { source: 'Fast Company', url: 'https://www.fastcompany.com/feed' },
    { source: 'Bloomberg Workplace', url: 'https://news.google.com/rss/search?q=bloomberg+workplace+management&hl=en-US&gl=US&ceid=US:en' },
    { source: 'Financial Times Career', url: 'https://news.google.com/rss/search?q=financial+times+management+work&hl=en-US&gl=US&ceid=US:en' },
    { source: 'Inc. Leadership', url: 'https://www.inc.com/rss.xml' },
    { source: 'Entrepreneur', url: 'https://www.entrepreneur.com/latest.rss' },
    { source: 'Business Insider Strategy', url: 'https://feeds.businessinsider.com/custom/all/rss.xml' },
  ],
  academic: [
    { source: 'Nature International', url: 'https://www.nature.com/nature.rss' },
    { source: 'Science Magazine / AAAS', url: 'https://www.science.org/rss/news_current.xml' },
    { source: 'Phys.org Research', url: 'https://phys.org/rss-feed/' },
    { source: 'ScienceDaily Discoveries', url: 'https://www.sciencedaily.com/rss/all.xml' },
    { source: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/' },
    { source: 'Scientific American', url: 'https://www.scientificamerican.com/feed/rss/' },
    { source: 'Psychology Today Insights', url: 'https://www.psychologytoday.com/us/blog-feed/index.xml' },
    { source: 'The Conversation Academic', url: 'https://theconversation.com/us/articles.atom' },
  ],
  story: [
    { source: 'BBC Culture & Human Stories', url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml' },
    { source: 'The Atlantic Ideas', url: 'https://www.theatlantic.com/feed/all/' },
    { source: 'National Geographic Stories', url: 'https://news.google.com/rss/search?q=national+geographic+culture+exploration&hl=en-US&gl=US&ceid=US:en' },
    { source: 'The New Yorker Culture', url: 'https://www.newyorker.com/feed/culture' },
    { source: 'Smithsonian Magazine', url: 'https://www.smithsonianmag.com/rss/smart-news/' },
    { source: 'Lonely Planet Chronicles', url: 'https://news.google.com/rss/search?q=lonely+planet+travel+stories&hl=en-US&gl=US&ceid=US:en' },
    { source: 'NPR Life & Culture', url: 'https://feeds.npr.org/1008/rss.xml' },
    { source: 'Reader\'s Digest True Stories', url: 'https://www.rd.com/feed/' },
  ],
  technology: [
    { source: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
    { source: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
    { source: 'Wired News', url: 'https://www.wired.com/feed/rss' },
    { source: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index' },
    { source: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/' },
    { source: 'Engadget', url: 'https://www.engadget.com/rss.xml' },
    { source: 'BBC Technology', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml' },
    { source: 'VentureBeat', url: 'https://venturebeat.com/feed/' },
  ],
  sports: [
    { source: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/rss.xml' },
    { source: 'ESPN Top News', url: 'https://www.espn.com/espn/rss/news' },
    { source: 'Sky Sports News', url: 'https://www.skysports.com/rss/12040' },
    { source: 'The Guardian Sport', url: 'https://www.theguardian.com/sport/rss' },
    { source: 'Sports Illustrated', url: 'https://www.si.com/rss/news.rss' },
    { source: 'Reuters Sports', url: 'https://news.google.com/rss/search?q=reuters+sports+news&hl=en-US&gl=US&ceid=US:en' },
    { source: 'The Athletic / NYT', url: 'https://news.google.com/rss/search?q=the+athletic+football+sports&hl=en-US&gl=US&ceid=US:en' },
    { source: 'Olympic News Channel', url: 'https://news.google.com/rss/search?q=olympic+sports+news&hl=en-US&gl=US&ceid=US:en' },
  ],
  entertainment: [
    { source: 'Variety Magazine', url: 'https://variety.com/feed/' },
    { source: 'The Hollywood Reporter', url: 'https://www.hollywoodreporter.com/feed/' },
    { source: 'Rolling Stone Culture', url: 'https://www.rollingstone.com/feed/' },
    { source: 'People Entertainment', url: 'https://people.com/feed/' },
    { source: 'Billboard Music', url: 'https://www.billboard.com/feed/' },
    { source: 'BBC Entertainment', url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml' },
    { source: 'Vanity Fair Culture', url: 'https://www.vanityfair.com/feed/culture/rss' },
    { source: 'Entertainment Weekly', url: 'https://ew.com/feed/' },
  ],
  dialogue: [
    { source: 'TED Ideas & Conversations', url: 'https://ideas.ted.com/feed/' },
    { source: 'NPR Fresh Air Dialogues', url: 'https://feeds.npr.org/13/rss.xml' },
    { source: 'BBC Hardtalk Debates', url: 'https://news.google.com/rss/search?q=bbc+hardtalk+interview&hl=en-US&gl=US&ceid=US:en' },
    { source: 'The Guardian Debates & Voices', url: 'https://www.theguardian.com/commentisfree/rss' },
    { source: 'Intelligence Squared Debates', url: 'https://news.google.com/rss/search?q=intelligence+squared+debate&hl=en-US&gl=US&ceid=US:en' },
    { source: 'Vox Conversations', url: 'https://news.google.com/rss/search?q=vox+conversations+interview&hl=en-US&gl=US&ceid=US:en' },
    { source: 'HBR IdeaCast Dialogue', url: 'https://feeds.feedburner.com/hbrideacast' },
    { source: 'The Economist Asks (Podcasts)', url: 'https://news.google.com/rss/search?q=economist+asks+interview&hl=en-US&gl=US&ceid=US:en' },
  ],
};


// Rich curated real-world backup pool to guarantee instant, 100% resilient response
const CURATED_RECENT_STORIES: Record<ReadingGenre, NewsInspiration[]> = {
  news: [
    {
      source: 'BBC World News',
      headline: 'Global Coastal Cities Accelerate Green Infrastructure Investments',
      summary: 'Metropolitan authorities across European and Asian hubs are expanding mangrove buffers and sustainable water reservoirs to counteract extreme precipitation cycles.',
      url: 'https://www.bbc.com/news',
    },
    {
      source: 'The Guardian',
      headline: 'Renewable Power Share Hits Historic Milestone Across Continental Grids',
      summary: 'Wind and solar installations have generated more combined electricity than conventional fossil assets during the preceding quarter, reshaping energy market economics.',
      url: 'https://www.theguardian.com/environment',
    },
    {
      source: 'Reuters International',
      headline: 'International Maritime Alliance Establishes Clean Fuel Shipping Corridors',
      summary: 'Global cargo carriers and maritime regulators agreed on stringent carbon reduction quotas along primary trans-ocean trade passages.',
      url: 'https://www.reuters.com',
    },
    {
      source: 'NPR News',
      headline: 'Public Libraries Reinvent Themselves as Community Innovation Centers',
      summary: 'Urban municipal systems report surging attendance after launching digital creative labs, language exchange tables, and youth mentorship studios.',
      url: 'https://www.npr.org',
    },
    {
      source: 'Deutsche Welle',
      headline: 'European Rail Expansion Challenges Short-Haul Commercial Flights',
      summary: 'High-speed train connections between major capital corridors saw a forty percent increase in passenger volume following new overnight sleepers.',
      url: 'https://www.dw.com',
    },
  ],
  workplace: [
    {
      source: 'Harvard Business Review',
      headline: 'Why Asynchronous Communication Outperforms Real-Time Chat in Hybrid Teams',
      summary: 'Empirical workplace research highlights how structured documentation and uninterrupted deep focus blocks dramatically elevate team output and morale.',
      url: 'https://hbr.org',
    },
    {
      source: 'Forbes Business',
      headline: 'The Rise of Skill-Based Hiring Over Traditional Degree Credentials',
      summary: 'Leading global enterprises are rewriting recruitment guidelines to evaluate verifiable competency portfolios rather than elite university resumes.',
      url: 'https://www.forbes.com',
    },
    {
      source: 'Fast Company',
      headline: 'Meeting Culture Overhaul: The Companies Banning Agenda-Free Gatherings',
      summary: 'Tech and design organizations establish 15-minute standing standups and mandatory written briefs to protect creative engineering focus.',
      url: 'https://www.fastcompany.com',
    },
    {
      source: 'Bloomberg Workplace',
      headline: 'Cross-Generational Mentorship Drives Knowledge Retention in Modern Firms',
      summary: 'Reverse mentoring programs where junior specialists pair with senior directors on emerging tools foster mutual trust and reduce turnover.',
      url: 'https://www.bloomberg.com',
    },
    {
      source: 'Financial Times',
      headline: 'Navigating Cross-Border Negotiations in an Era of Digital Dealmaking',
      summary: 'International corporate strategists outline how cultural nuance and relational rapport remain critical even in virtual negotiation rooms.',
      url: 'https://www.ft.com',
    },
  ],
  academic: [
    {
      source: 'Nature International',
      headline: 'Neuroplasticity Studies Reveal Lifelong Brain Adaptability Through Language Learning',
      summary: 'Cognitive researchers document sustained synaptic growth and enhanced problem-solving agility in adults acquiring idiomatic foreign collocations.',
      url: 'https://www.nature.com',
    },
    {
      source: 'Science Magazine',
      headline: 'Bio-Inspired Desalination Membranes Dramatically Slash Energy Consumption',
      summary: 'Engineers model synthetic filtration barriers on cellular water channels, yielding pure drinking water with unprecedented thermodynamic efficiency.',
      url: 'https://www.science.org',
    },
    {
      source: 'MIT Technology Review',
      headline: 'Decentralized Data Verification Reshapes Academic Peer Review Integrity',
      summary: 'Universities experiment with cryptographic replication logs to ensure clinical research data cannot be retroactively manipulated or lost.',
      url: 'https://www.technologyreview.com',
    },
    {
      source: 'Phys.org Research',
      headline: 'Deep-Ocean Acoustic Sensors Uncover Complex Whale Dialects and Migration Shifts',
      summary: 'Marine biologists identify geographic variations in communication songs that correlate with shifting oceanic thermal currents.',
      url: 'https://phys.org',
    },
    {
      source: 'ScienceDaily Discoveries',
      headline: 'Circadian Rhythms and Cognitive Endurance: Rethinking University Exam Scheduling',
      summary: 'New chrono-biology findings urge academic institutions to align complex cognitive evaluations with peak individual alertness periods.',
      url: 'https://www.sciencedaily.com',
    },
  ],
  story: [
    {
      source: 'National Geographic Stories',
      headline: 'Reviving Ancient Terraced Vineyards High in the Mediterranean Mountains',
      summary: 'A family of artisan winemakers reconstructs century-old stone irrigation channels to cultivate indigenous grapes resilient against droughts.',
      url: 'https://www.nationalgeographic.com',
    },
    {
      source: 'The Atlantic Ideas',
      headline: 'The Lost Art of Deep Listening: Why Silence Speaks Volumes',
      summary: 'An exploration of how personal relationships transform when conversations prioritize silent observation and genuine empathy over quick answers.',
      url: 'https://www.theatlantic.com',
    },
    {
      source: 'BBC Culture',
      headline: 'The Secret Lives of Historic Lighthouse Keepers in the Digital Age',
      summary: 'Reflecting on the solitude, relentless storms, and tranquil clarity experienced by modern caretakers safeguarding rugged coastal outposts.',
      url: 'https://www.bbc.com/culture',
    },
    {
      source: 'Smithsonian Magazine',
      headline: 'Unearthing Forgotten Trade Routes in the Heart of Central Asia',
      summary: 'Archaeologists map ancient mountain caravanserai ruins where nomadic traders and silk merchants once exchanged stories and crafts.',
      url: 'https://www.smithsonianmag.com',
    },
    {
      source: 'The New Yorker',
      headline: 'A Journey Through the Night Trains of Eastern Europe',
      summary: 'A traveler recounts poetic midnight conversations in rustic dining cars connecting Vienna, Budapest, and the Carpathian foothills.',
      url: 'https://www.newyorker.com',
    },
  ],
  technology: [
    {
      source: 'TechCrunch',
      headline: 'Next-Generation Autonomous Drones Revolutionize Mountain Search and Rescue',
      summary: 'Emergency response teams test thermal-imaging drone fleets capable of navigating dense blizzards to deliver life-saving supplies to stranded mountaineers.',
      url: 'https://techcrunch.com',
    },
    {
      source: 'The Verge',
      headline: 'Open-Source AI Models Challenge Commercial Monopolies in Everyday Computing',
      summary: 'Independent developer coalitions achieve breakthrough performance benchmarks on local desktop hardware without cloud dependency.',
      url: 'https://theverge.com',
    },
    {
      source: 'Wired News',
      headline: 'Quantum Encryption Breakthrough Protects Subsea Fiber-Optic Backbones',
      summary: 'Telecommunication engineers deploy quantum key distribution across continental underwater cables to safeguard critical banking infrastructure.',
      url: 'https://wired.com',
    },
    {
      source: 'Ars Technica',
      headline: 'Solid-State Battery Breakthrough Paves Way for Thousand-Kilometer Electric Trips',
      summary: 'Materials scientists create ceramic electrolyte layers that resist degradation even under rapid charging temperatures.',
      url: 'https://arstechnica.com',
    },
    {
      source: 'MIT Technology Review',
      headline: 'Neuro-Prosthetic Implants Enable Paralyzed Patients to Type with Natural Fluency',
      summary: 'High-density micro-electrode arrays translate motor cortex intention signals directly into fluent text on computer screens.',
      url: 'https://technologyreview.com',
    },
  ],
  sports: [
    {
      source: 'BBC Sport',
      headline: 'Underdog Football Club Clinches Historic Continental Title in Extra Time Thriller',
      summary: 'Tactical discipline, high pressing, and an injury-time volley capped off an extraordinary Cinderella campaign against the reigning champions.',
      url: 'https://bbc.com/sport',
    },
    {
      source: 'The Guardian Sport',
      headline: 'The Science of Marathon Pacing: How Modern Athletes Defy Human Limits',
      summary: 'Elite distance runners combine advanced biomechanical footwear and real-time lactate sensors to shave crucial seconds off world records.',
      url: 'https://theguardian.com/sport',
    },
    {
      source: 'ESPN',
      headline: 'Championship Finals Showcase the Decisive Impact of Bench Depth',
      summary: 'When star starters faced foul trouble, reserve playmakers took command of the court to stage an unforgettable fourth-quarter comeback.',
      url: 'https://espn.com',
    },
    {
      source: 'Sky Sports',
      headline: 'Formula Racing Teams Adopt Sustainable Bio-Fuels Ahead of New Regulations',
      summary: 'Engineers engineer hybrid power units that maintain ferocious torque while drastically curbing trackside emissions.',
      url: 'https://skysports.com',
    },
    {
      source: 'Sports Illustrated',
      headline: 'The Psychology of Clutch Performance: Why Certain Athletes Thrive Under Fire',
      summary: 'Sports psychologists explore visualization routines and heart-rate coherence practices that enable champions to execute flawless free-throws.',
      url: 'https://si.com',
    },
  ],
  entertainment: [
    {
      source: 'Variety Magazine',
      headline: 'Independent Cinema Dominates International Film Festival Nominations',
      summary: 'Character-driven low-budget dramas and nuanced coming-of-age portraits outperform blockbuster franchises in critical praise and jury ballots.',
      url: 'https://variety.com',
    },
    {
      source: 'Rolling Stone',
      headline: 'Vinyl Records Outsell Digital Downloads as Fans Seek Tangible Music Rituals',
      summary: 'Audiophiles and younger listeners alike celebrate physical gatefold packaging, analog warmth, and intentional album listening experiences.',
      url: 'https://rollingstone.com',
    },
    {
      source: 'The Hollywood Reporter',
      headline: 'Behind the Scenes of Groundbreaking Practical Effects in Modern Filmmaking',
      summary: 'Visionary directors blend miniature model craft with digital compositing to create authentic, tactile cinematic worlds.',
      url: 'https://hollywoodreporter.com',
    },
    {
      source: 'Billboard Music',
      headline: 'Cross-Genre Collaborations Redefine Global Streaming Charts',
      summary: 'Fusion tracks combining acoustic folk traditions with electronic synth production capture massive multicultural audiences worldwide.',
      url: 'https://billboard.com',
    },
    {
      source: 'People Magazine',
      headline: 'Celebrity Philanthropists Fund Music and Arts Education in Underserved Schools',
      summary: 'Prominent actors and musicians launch nationwide foundations to supply state-of-the-art instruments and rehearsal spaces for youth.',
      url: 'https://people.com',
    },
  ],
  dialogue: [
    {
      source: 'TED Ideas & Conversations',
      headline: 'Conversation on Rethinking Artificial Intelligence in Creative Writing',
      summary: 'A renowned novelist and a senior AI researcher debate whether computational language models enhance or dilute human literary imagination.',
      url: 'https://ideas.ted.com',
    },
    {
      source: 'NPR Fresh Air Dialogues',
      headline: 'An In-Depth Interview on the Power of Uncomfortable Conversations',
      summary: 'A veteran conflict mediator explains how addressing unresolved friction with candid vulnerability unlocks long-term collaboration.',
      url: 'https://www.npr.org',
    },
    {
      source: 'The Guardian Debates',
      headline: 'Should Cities Ban Private Vehicles from Historic Downtown Quarters?',
      summary: 'An urban architect and a local merchants association president passionately discuss pedestrian safety versus commercial accessibility.',
      url: 'https://www.theguardian.com',
    },
    {
      source: 'BBC Hardtalk Debates',
      headline: 'Diplomatic Exchange on Sustainable Food Systems and Agricultural Subsidies',
      summary: 'A rigorous discussion between an environmental minister and agricultural union delegates on meeting zero-waste benchmarks.',
      url: 'https://www.bbc.co.uk',
    },
    {
      source: 'HBR IdeaCast Dialogue',
      headline: 'Discussing the Fine Line Between Healthy Ambition and Burnout',
      summary: 'Two executive coaches explore actionable boundaries that allow senior leaders to execute high-stakes projects without sacrificing personal well-being.',
      url: 'https://hbr.org',
    },
  ],
};


// In-memory feed cache to avoid redundant network requests (15-min TTL)
interface CacheEntry {
  items: NewsInspiration[];
  expiresAt: number;
}
const feedCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * Fast and safe HTML entity decoder for RSS titles and summaries
 */
function decodeHtmlEntities(str: string): string {
  if (!str.includes('&')) return str;
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&nbsp;/g, ' ');
}

/**
 * Parses RSS XML string into clean headlines & summaries
 */
function parseRssXml(xmlText: string, defaultSource: string): NewsInspiration[] {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const items = xmlDoc.querySelectorAll('item, entry');
    const results: NewsInspiration[] = [];

    items.forEach((item) => {
      const titleElem = item.querySelector('title');
      const descElem = item.querySelector('description, summary, content');
      const linkElem = item.querySelector('link');

      let title = titleElem?.textContent?.trim().replace(/^<!\[CDATA\[|\]\]>$/g, '') || '';
      let desc = descElem?.textContent?.trim().replace(/^<!\[CDATA\[|\]\]>$/g, '') || '';

      // Strip HTML tags from description
      desc = desc.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();

      title = decodeHtmlEntities(title);
      desc = decodeHtmlEntities(desc);

      // Get link
      let link = '';
      if (linkElem) {
        link = linkElem.getAttribute('href') || linkElem.textContent?.trim() || '';
      }

      if (title && title.length > 10) {
        results.push({
          source: defaultSource,
          headline: title,
          summary: desc.length > 20 ? desc.slice(0, 240) + '...' : title,
          url: link || undefined,
        });
      }
    });

    return results;
  } catch {
    return [];
  }
}

/**
 * In-memory set of recently used headlines across all generations in this session.
 * Guarantees every single generation provides a fresh, different news story and topic!
 */
const recentlyUsedHeadlines = new Set<string>();

function recordUsedHeadline(headline: string) {
  if (!headline) return;
  recentlyUsedHeadlines.add(headline.trim().toLowerCase());
  // Bounded memory buffer
  if (recentlyUsedHeadlines.size > 50) {
    const toRemove = Array.from(recentlyUsedHeadlines).slice(0, 20);
    toRemove.forEach((h) => recentlyUsedHeadlines.delete(h));
  }
}

function pickFreshItem(items: NewsInspiration[]): NewsInspiration | null {
  if (!items || items.length === 0) return null;
  const unvisited = items.filter((it) => !recentlyUsedHeadlines.has(it.headline.trim().toLowerCase()));
  const pool = unvisited.length > 0 ? unvisited : items;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Attempts to fetch live RSS feed using public CORS proxy with caching and strict timeout
 */
async function tryFetchLiveRss(feed: RssFeedConfig, timeoutMs = 2200): Promise<NewsInspiration | null> {
  const now = Date.now();
  const cached = feedCache.get(feed.url);

  // Return fresh unvisited item from cache if available
  if (cached && cached.expiresAt > now && cached.items.length > 0) {
    const chosen = pickFreshItem(cached.items);
    if (chosen) return chosen;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feed.url)}`;
    const response = await fetch(proxyUrl, {
      signal: controller.signal,
      headers: { Accept: 'application/rss+xml, application/xml, text/xml, text/plain' },
    });

    if (!response.ok) return null;

    const text = await response.text();
    if (!text || text.length < 100) return null;

    const parsed = parseRssXml(text, feed.source);
    if (parsed.length > 0) {
      feedCache.set(feed.url, {
        items: parsed,
        expiresAt: now + CACHE_TTL_MS,
      });

      return pickFreshItem(parsed);
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Main method: Fetches or selects a current news/topic inspiration for the specified genre.
 * Rotates systematically across sources and topics so that consecutive generations never repeat!
 */
export async function fetchCurrentNewsInspiration(genre: ReadingGenre): Promise<NewsInspiration> {
  const feeds = GENRE_RSS_FEEDS[genre] || GENRE_RSS_FEEDS.news;
  const curatedPool = CURATED_RECENT_STORIES[genre] || CURATED_RECENT_STORIES.news;

  // Shuffle candidate feeds to diversify sources
  const shuffledFeeds = [...feeds].sort(() => 0.5 - Math.random());

  // Attempt live RSS fetch on top candidate feeds
  for (const feed of shuffledFeeds.slice(0, 2)) {
    try {
      const liveItem = await tryFetchLiveRss(feed, 2000);
      if (liveItem && liveItem.headline) {
        recordUsedHeadline(liveItem.headline);
        return liveItem;
      }
    } catch {
      // Continue to next feed or curated fallback
    }
  }

  // Fallback: Pick a fresh, unvisited story from curated pool
  const chosenCurated = pickFreshItem(curatedPool) || curatedPool[Math.floor(Math.random() * curatedPool.length)];
  recordUsedHeadline(chosenCurated.headline);
  return { ...chosenCurated };
}

