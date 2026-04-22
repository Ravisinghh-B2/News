/**
 * News Scraper Service - Fetches and extracts Open Graph data from news articles
 * Features:
 * - Batch fetch multiple URLs with Promise.allSettled()
 * - Extract OG tags with fallbacks
 * - Meta tag validation and suggestions
 * - Image URL conversion to absolute URLs
 * - Error handling with timeouts
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { convertToAbsoluteUrl, extractDomain, getPlaceholderImage } = require('../utils/urlUtils');

// ─── Configuration ──────────────────────────────────────────────────
const REQUEST_TIMEOUT = 5000; // 5 seconds
const REQUIRED_OG_TAGS = ['og:title', 'og:description', 'og:image', 'og:url'];
const RECOMMENDED_TAGS = ['twitter:card', 'og:type', 'og:site_name'];
const META_TAGS_TO_CHECK = ['og:title', 'og:description', 'og:image', 'og:url', 'twitter:card', 'description'];

/**
 * Fetch HTML content from a single URL with timeout
 * @param {string} url - Article URL
 * @returns {Promise<string>} - HTML content
 */
async function fetchHtmlContent(url) {
  try {
    const response = await axios.get(url, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      maxRedirects: 5,
      validateStatus: (status) => status < 400 // Accept all non-error statuses
    });
    
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch ${url}: ${error.message}`);
  }
}

/**
 * Extract text content from HTML, cleaning up whitespace
 * @param {string} text - Raw text
 * @returns {string} - Cleaned text
 */
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 300); // Limit to 300 chars
}

/**
 * Extract meta tag value from HTML element
 * @param {cheerio.Cheerio} $ - Cheerio instance
 * @param {string} property - Meta property name
 * @param {string} attribute - HTML attribute (property or name)
 * @returns {string|null} - Meta tag value
 */
function getMetaTagContent($, property, attribute = 'property') {
  return $(`meta[${attribute}="${property}"]`).attr('content') || null;
}

/**
 * Extract Open Graph and meta data from HTML
 * @param {string} html - HTML content
 * @param {string} url - Article URL (for relative URL conversion)
 * @returns {object} - Extracted data
 */
function extractMetadata(html, url) {
  const $ = cheerio.load(html);
  const data = {
    title: null,
    description: null,
    image: null,
    url: url,
    ogTags: {}
  };

  // ─── Extract Open Graph Tags ────────────────────────────────────
  data.ogTags['og:title'] = getMetaTagContent($, 'og:title');
  data.ogTags['og:description'] = getMetaTagContent($, 'og:description');
  data.ogTags['og:image'] = getMetaTagContent($, 'og:image');
  data.ogTags['og:url'] = getMetaTagContent($, 'og:url');
  data.ogTags['og:type'] = getMetaTagContent($, 'og:type');
  data.ogTags['og:site_name'] = getMetaTagContent($, 'og:site_name');
  data.ogTags['twitter:card'] = getMetaTagContent($, 'twitter:card');
  
  // ─── Primary data from OG tags ──────────────────────────────────
  data.title = data.ogTags['og:title'];
  data.description = data.ogTags['og:description'];
  data.image = data.ogTags['og:image'];

  // ─── Fallback to standard meta tags ─────────────────────────────
  if (!data.title) {
    data.title = cleanText($('title').text());
  }
  
  if (!data.description) {
    data.description = cleanText(
      getMetaTagContent($, 'description', 'name') ||
      $('meta[name="og:description"]').attr('content')
    );
  }

  // ─── Fallback to first image if OG image not found ──────────────
  if (!data.image) {
    const imgTag = $('img').first();
    const imgSrc = imgTag.attr('src') || imgTag.attr('data-src');
    if (imgSrc) {
      data.image = convertToAbsoluteUrl(imgSrc, url);
    }
  }

  // ─── Convert relative URLs to absolute ──────────────────────────
  if (data.image) {
    data.image = convertToAbsoluteUrl(data.image, url);
  }

  // ─── Use placeholder if image still missing ─────────────────────
  if (!data.image) {
    data.image = getPlaceholderImage();
  }

  return data;
}

/**
 * Validate which meta tags are present
 * @param {string} html - HTML content
 * @returns {array} - Array of missing tags
 */
function validateMetaTags(html) {
  const $ = cheerio.load(html);
  const missingTags = [];

  for (const tag of META_TAGS_TO_CHECK) {
    let exists = false;

    if (tag === 'description') {
      exists = !!getMetaTagContent($, 'description', 'name');
    } else {
      exists = !!getMetaTagContent($, tag);
    }

    if (!exists) {
      missingTags.push(tag);
    }
  }

  return missingTags;
}

/**
 * Generate suggested meta tags based on extracted data
 * @param {object} data - Extracted metadata
 * @returns {object} - Suggested meta tags
 */
function generateSuggestedTags(data) {
  return {
    'og:title': data.title || 'Article Title',
    'og:description': data.description || 'Article description',
    'og:image': data.image || getPlaceholderImage(),
    'og:url': data.url,
    'og:type': 'article',
    'twitter:card': 'summary_large_image',
    'twitter:title': data.title || 'Article Title',
    'twitter:description': data.description || 'Article description',
    'twitter:image': data.image || getPlaceholderImage()
  };
}

/**
 * Generate HTML meta tag block for an article
 * @param {object} data - Article data
 * @returns {string} - HTML meta tags block
 */
function generateMetaTagsHtml(data) {
  const tags = generateSuggestedTags(data);
  
  const htmlTags = [
    `<meta property="og:title" content="${escapeHtml(tags['og:title'])}">`,
    `<meta property="og:description" content="${escapeHtml(tags['og:description'])}">`,
    `<meta property="og:image" content="${escapeHtml(tags['og:image'])}">`,
    `<meta property="og:url" content="${escapeHtml(tags['og:url'])}">`,
    `<meta property="og:type" content="${escapeHtml(tags['og:type'])}">`,
    `<meta name="twitter:card" content="${escapeHtml(tags['twitter:card'])}">`,
    `<meta name="twitter:title" content="${escapeHtml(tags['twitter:title'])}">`,
    `<meta name="twitter:description" content="${escapeHtml(tags['twitter:description'])}">`,
    `<meta name="twitter:image" content="${escapeHtml(tags['twitter:image'])}">`
  ];

  return htmlTags.join('\n');
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Process a single URL and extract metadata
 * @param {string} url - Article URL
 * @returns {Promise<object>} - Processed article data
 */
async function processUrl(url) {
  try {
    // Fetch HTML content
    const html = await fetchHtmlContent(url);

    // Extract metadata
    const metadata = extractMetadata(html, url);

    // Validate meta tags
    const missingTags = validateMetaTags(html);

    // Generate suggested tags
    const suggestedMetaTags = generateSuggestedTags(metadata);

    // Generate HTML meta tags
    const metaTagsHtml = generateMetaTagsHtml(metadata);

    return {
      success: true,
      title: metadata.title,
      description: metadata.description,
      image: metadata.image,
      url: metadata.url,
      source: extractDomain(url),
      missingTags,
      suggestedMetaTags,
      metaTagsHtml,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error processing URL ${url}:`, error.message);
    
    return {
      success: false,
      url,
      source: extractDomain(url),
      error: error.message,
      missingTags: META_TAGS_TO_CHECK,
      suggestedMetaTags: {
        'og:title': 'Unable to fetch article',
        'og:description': 'Could not retrieve article metadata',
        'og:image': getPlaceholderImage(),
        'og:url': url
      },
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Batch fetch and extract metadata from multiple URLs
 * @param {array} urls - Array of article URLs
 * @returns {Promise<object>} - Batch results with statistics
 */
async function scrapeMultipleUrls(urls) {
  if (!Array.isArray(urls) || urls.length === 0) {
    throw new Error('URLs array is required and must not be empty');
  }

  // Limit to 50 URLs max
  const limitedUrls = urls.slice(0, 50);

  console.log(`🔄 Scraping ${limitedUrls.length} URLs...`);
  
  // Process all URLs concurrently with Promise.allSettled
  const promises = limitedUrls.map(url => processUrl(url));
  const results = await Promise.allSettled(promises);

  // Process results
  const articles = results
    .map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          url: limitedUrls[index],
          source: extractDomain(limitedUrls[index]),
          error: result.reason?.message || 'Unknown error',
          timestamp: new Date().toISOString()
        };
      }
    });

  // Calculate statistics
  const stats = {
    total: articles.length,
    successful: articles.filter(a => a.success).length,
    failed: articles.filter(a => !a.success).length,
    successRate: `${Math.round((articles.filter(a => a.success).length / articles.length) * 100)}%`
  };

  console.log(`✅ Scraping complete: ${stats.successful}/${stats.total} successful`);

  return {
    success: true,
    statistics: stats,
    articles,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  scrapeMultipleUrls,
  processUrl,
  extractMetadata,
  validateMetaTags,
  generateSuggestedTags,
  generateMetaTagsHtml,
  fetchHtmlContent
};
