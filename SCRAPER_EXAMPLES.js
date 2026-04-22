

const newsScraperService = require('./services/newsScraperService');

// ═════════════════════════════════════════════════════════════════════════════
// EXAMPLE 1: Scrape Multiple News URLs (API Usage)
// ═════════════════════════════════════════════════════════════════════════════

async function exampleScrapingMultipleUrls() {
  console.log('\n📰 EXAMPLE 1: Scraping Multiple News URLs');
  console.log('═'.repeat(70));

  const newsUrls = [
    'https://www.bbc.com/news',
    'https://www.cnbc.com',
    'https://www.theverge.com',
    'https://techcrunch.com',
    'https://www.theguardian.com/international',
    'https://www.reuters.com',
    'https://www.apnews.com'
  ];

  try {
    const result = await newsScraperService.scrapeMultipleUrls(newsUrls);
    
    console.log('\n✅ Scraping Results:');
    console.log(`Total URLs: ${result.statistics.total}`);
    console.log(`Successful: ${result.statistics.successful}`);
    console.log(`Failed: ${result.statistics.failed}`);
    console.log(`Success Rate: ${result.statistics.successRate}`);
    
    console.log('\n📄 First Article Metadata:');
    const firstArticle = result.articles[0];
    console.log(`Title: ${firstArticle.title}`);
    console.log(`Description: ${firstArticle.description}`);
    console.log(`Image: ${firstArticle.image}`);
    console.log(`URL: ${firstArticle.url}`);
    console.log(`Source: ${firstArticle.source}`);
    console.log(`Missing Tags: ${firstArticle.missingTags.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// EXAMPLE 2: Process a Single URL
// ═════════════════════════════════════════════════════════════════════════════

async function exampleProcessSingleUrl() {
  console.log('\n📰 EXAMPLE 2: Processing Single URL');
  console.log('═'.repeat(70));

  const url = 'https://www.bbc.com/news';

  try {
    const result = await newsScraperService.processUrl(url);
    
    console.log('\n✅ Single URL Results:');
    console.log(`Title: ${result.title}`);
    console.log(`Description: ${result.description}`);
    console.log(`Image: ${result.image}`);
    console.log(`Source: ${result.source}`);
    
    console.log('\n🏷️ Missing Meta Tags:');
    console.log(result.missingTags);
    
    console.log('\n💡 Suggested Meta Tags:');
    console.log(JSON.stringify(result.suggestedMetaTags, null, 2));
    
    console.log('\n🔗 HTML Meta Tag Block:');
    console.log(result.metaTagsHtml);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// EXAMPLE 3: API Response Format
// ═════════════════════════════════════════════════════════════════════════════

function exampleApiResponseFormat() {
  console.log('\n📡 EXAMPLE 3: API Response Format');
  console.log('═'.repeat(70));

  const exampleResponse = {
    success: true,
    statistics: {
      total: 5,
      successful: 4,
      failed: 1,
      successRate: "80%"
    },
    articles: [
      {
        success: true,
        title: "Breaking News: Technology Update",
        description: "Latest updates in the tech industry",
        image: "https://example.com/image.jpg",
        url: "https://example.com/article",
        source: "example.com",
        missingTags: ["og:image", "twitter:card"],
        suggestedMetaTags: {
          "og:title": "Breaking News: Technology Update",
          "og:description": "Latest updates in the tech industry",
          "og:image": "https://example.com/image.jpg",
          "og:url": "https://example.com/article",
          "og:type": "article",
          "twitter:card": "summary_large_image",
          "twitter:title": "Breaking News: Technology Update",
          "twitter:description": "Latest updates in the tech industry",
          "twitter:image": "https://example.com/image.jpg"
        },
        metaTagsHtml: `<meta property="og:title" content="Breaking News: Technology Update">
<meta property="og:description" content="Latest updates in the tech industry">
<meta property="og:image" content="https://example.com/image.jpg">
<meta property="og:url" content="https://example.com/article">
<meta property="og:type" content="article">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Breaking News: Technology Update">
<meta name="twitter:description" content="Latest updates in the tech industry">
<meta name="twitter:image" content="https://example.com/image.jpg">`,
        timestamp: "2024-01-15T10:30:00.000Z"
      },
      {
        success: false,
        url: "https://invalid.example.com/article",
        source: "invalid.example.com",
        error: "Failed to fetch https://invalid.example.com/article: getaddrinfo ENOTFOUND invalid.example.com",
        timestamp: "2024-01-15T10:30:05.000Z"
      }
    ],
    timestamp: "2024-01-15T10:30:10.000Z"
  };

  console.log('\n✅ Full API Response Structure:');
  console.log(JSON.stringify(exampleResponse, null, 2));
}

// ═════════════════════════════════════════════════════════════════════════════
// EXAMPLE 4: API Endpoint Calls (HTTP Examples)
// ═════════════════════════════════════════════════════════════════════════════

function exampleHttpCalls() {
  console.log('\n🌐 EXAMPLE 4: HTTP API Calls');
  console.log('═'.repeat(70));

  console.log('\n📤 POST Request to Scrape Multiple URLs:');
  console.log(`
URL: POST http://localhost:5000/api/v1/news/scrape

Request Body:
{
  "urls": [
    "https://www.bbc.com/news",
    "https://www.cnbc.com",
    "https://www.theverge.com",
    "https://techcrunch.com",
    "https://www.theguardian.com/international"
  ]
}

cURL Example:
curl -X POST http://localhost:5000/api/v1/news/scrape \\
  -H "Content-Type: application/json" \\
  -d '{
    "urls": [
      "https://www.bbc.com/news",
      "https://www.cnbc.com",
      "https://www.theverge.com"
    ]
  }'
  `);

  console.log('\n📤 POST Request to Scrape Single URL:');
  console.log(`
URL: POST http://localhost:5000/api/v1/news/scrape/single

Request Body:
{
  "url": "https://www.bbc.com/news"
}

cURL Example:
curl -X POST http://localhost:5000/api/v1/news/scrape/single \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://www.bbc.com/news"
  }'
  `);
}

// ═════════════════════════════════════════════════════════════════════════════
// EXAMPLE 5: Features & Benefits
// ═════════════════════════════════════════════════════════════════════════════

function exampleFeaturesAndBenefits() {
  console.log('\n⭐ EXAMPLE 5: Features & Benefits');
  console.log('═'.repeat(70));

  const features = {
    'Multi-URL Scraping': 'Process up to 50 URLs efficiently using Promise.allSettled()',
    'Open Graph Extraction': 'Extract og:title, og:description, og:image, og:url',
    'Fallback Mechanism': 'Gracefully fallback to <title>, <meta name="description">, <img>',
    'Meta Tag Validation': 'Identify missing critical meta tags',
    'Suggestions': 'Generate suggested meta tags for better SEO',
    'URL Conversion': 'Convert relative image URLs to absolute URLs',
    'Error Handling': '5-second timeout per request, graceful error handling',
    'Placeholder Support': 'Use placeholder images for missing images',
    'HTML Generation': 'Generate ready-to-use HTML meta tag blocks',
    'Performance': 'Concurrent requests with minimal resource usage'
  };

  console.log('\n✨ Key Features:');
  Object.entries(features).forEach(([feature, description], index) => {
    console.log(`${index + 1}. ${feature}: ${description}`);
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// EXAMPLE 6: Error Handling
// ═════════════════════════════════════════════════════════════════════════════

async function exampleErrorHandling() {
  console.log('\n🚨 EXAMPLE 6: Error Handling');
  console.log('═'.repeat(70));

  console.log('\nScenarios handled by the scraper:');
  console.log('✓ Invalid URLs (malformed URLs)');
  console.log('✓ Network timeouts (5 second limit per request)');
  console.log('✓ HTTP errors (404, 500, etc.)');
  console.log('✓ Broken or incomplete HTML');
  console.log('✓ Missing meta tags (fallback to standard tags)');
  console.log('✓ Missing images (placeholder provided)');
  console.log('✓ Relative image URLs (converted to absolute)');
  console.log('✓ Large response bodies (limited to reasonable sizes)');
  console.log('✓ Duplicate URLs (eliminated)');
  console.log('✓ Too many URLs (limited to 50 max)');

  console.log('\nExample error response:');
  const errorExample = {
    success: false,
    url: "https://invalid-url.com/article",
    source: "invalid-url.com",
    error: "Failed to fetch https://invalid-url.com/article: getaddrinfo ENOTFOUND invalid-url.com",
    missingTags: ["og:title", "og:description", "og:image", "og:url", "twitter:card", "description"],
    suggestedMetaTags: {
      "og:title": "Unable to fetch article",
      "og:description": "Could not retrieve article metadata",
      "og:image": "https://via.placeholder.com/600x400?text=No+Image+Available",
      "og:url": "https://invalid-url.com/article"
    },
    timestamp: "2024-01-15T10:30:00.000Z"
  };

  console.log(JSON.stringify(errorExample, null, 2));
}

// ═════════════════════════════════════════════════════════════════════════════
// RUN ALL EXAMPLES
// ═════════════════════════════════════════════════════════════════════════════

async function runAllExamples() {
  console.log('\n\n');
  console.log('╔' + '═'.repeat(70) + '╗');
  console.log('║' + ' '.repeat(15) + '📰 NEWS SCRAPER SERVICE EXAMPLES 📰' + ' '.repeat(17) + '║');
  console.log('╚' + '═'.repeat(70) + '╝');

  // Non-async examples first
  exampleFeaturesAndBenefits();
  exampleApiResponseFormat();
  exampleHttpCalls();
  await exampleErrorHandling();

  // Async examples (commented out to avoid actual network calls)
  // Uncomment to test with real URLs:
  // await exampleScrapingMultipleUrls();
  // await exampleProcessSingleUrl();

  console.log('\n\n📖 Documentation:');
  console.log('═'.repeat(70));
  console.log('📌 Maximum 50 URLs per request');
  console.log('📌 5-second timeout per request');
  console.log('📌 Returns complete metadata with suggestions');
  console.log('📌 Handles errors gracefully');
  console.log('📌 Uses Promise.allSettled() for reliability');
  console.log('📌 Converts relative URLs to absolute');
  console.log('📌 Generates ready-to-use HTML meta tags');
  console.log('\n✅ Service is production-ready and fully documented!\n');
}

// Export for use in tests
module.exports = {
  exampleScrapingMultipleUrls,
  exampleProcessSingleUrl,
  exampleApiResponseFormat,
  exampleHttpCalls,
  exampleFeaturesAndBenefits,
  exampleErrorHandling,
  runAllExamples
};

// Uncomment to run examples:
// runAllExamples().catch(console.error);
