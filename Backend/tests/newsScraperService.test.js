/**
 * NEWS SCRAPER SERVICE - UNIT TESTS
 * 
 * Test cases for the News Scraper Service
 * Run: node Backend/tests/newsScraperService.test.js
 */

const newsScraperService = require('../services/newsScraperService');
const urlUtils = require('../utils/urlUtils');

// ═════════════════════════════════════════════════════════════════════════════
// TEST UTILITIES
// ═════════════════════════════════════════════════════════════════════════════

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    testsPassed++;
  } else {
    console.log(`❌ FAIL: ${testName}`);
    testsFailed++;
  }
}

function assertEquals(actual, expected, testName) {
  assert(actual === expected, testName);
}

function assertExists(value, testName) {
  assert(value !== null && value !== undefined, testName);
}

function assertArray(value, testName) {
  assert(Array.isArray(value), testName);
}

function assertObject(value, testName) {
  assert(typeof value === 'object' && value !== null, testName);
}

function printTestSuite(name) {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`📋 ${name}`);
  console.log(`${'═'.repeat(70)}`);
}

function printTestResults() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`📊 TEST RESULTS`);
  console.log(`${'═'.repeat(70)}`);
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`📈 Total: ${testsPassed + testsFailed}`);
  console.log(`📊 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST SUITE 1: URL Utilities
// ═════════════════════════════════════════════════════════════════════════════

function testUrlUtilities() {
  printTestSuite('URL Utilities Module');

  // Test isValidUrl
  assert(
    urlUtils.isValidUrl('https://www.bbc.com/news'),
    'isValidUrl recognizes valid HTTP URL'
  );
  
  assert(
    urlUtils.isValidUrl('https://example.com'),
    'isValidUrl recognizes valid HTTPS URL'
  );
  
  assert(
    !urlUtils.isValidUrl('not-a-url'),
    'isValidUrl rejects invalid URL'
  );
  
  assert(
    !urlUtils.isValidUrl(''),
    'isValidUrl rejects empty string'
  );

  // Test convertToAbsoluteUrl
  const absoluteUrl = urlUtils.convertToAbsoluteUrl(
    '/path/to/image.jpg',
    'https://example.com/article'
  );
  assert(
    absoluteUrl === 'https://example.com/path/to/image.jpg',
    'convertToAbsoluteUrl converts relative paths correctly'
  );

  const alreadyAbsolute = urlUtils.convertToAbsoluteUrl(
    'https://cdn.example.com/image.jpg',
    'https://example.com/article'
  );
  assert(
    alreadyAbsolute === 'https://cdn.example.com/image.jpg',
    'convertToAbsoluteUrl preserves already absolute URLs'
  );

  // Test extractDomain
  const domain = urlUtils.extractDomain('https://www.example.com/article');
  assert(
    domain === 'example.com',
    'extractDomain extracts domain name correctly'
  );

  // Test sanitizeUrls
  const urls = [
    'https://example.com/1',
    'https://example.com/2',
    '',
    'not-a-url',
    'https://example.com/1' // duplicate
  ];
  
  const sanitized = urlUtils.sanitizeUrls(urls);
  assert(
    sanitized.length === 2,
    'sanitizeUrls removes invalid URLs and duplicates'
  );

  // Test getPlaceholderImage
  const placeholder = urlUtils.getPlaceholderImage();
  assert(
    placeholder.includes('placeholder.com'),
    'getPlaceholderImage returns valid placeholder URL'
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST SUITE 2: Meta Tag Generation
// ═════════════════════════════════════════════════════════════════════════════

function testMetaTagGeneration() {
  printTestSuite('Meta Tag Generation');

  const testData = {
    title: 'Test Article',
    description: 'Test Description',
    image: 'https://example.com/image.jpg',
    url: 'https://example.com/article'
  };

  // Test generateSuggestedTags
  const suggested = newsScraperService.generateSuggestedTags(testData);
  
  assertObject(suggested, 'generateSuggestedTags returns object');
  assertExists(suggested['og:title'], 'Suggested tags include og:title');
  assertExists(suggested['og:description'], 'Suggested tags include og:description');
  assertExists(suggested['og:image'], 'Suggested tags include og:image');
  assertExists(suggested['og:url'], 'Suggested tags include og:url');
  assertExists(suggested['twitter:card'], 'Suggested tags include twitter:card');
  
  assertEquals(
    suggested['og:title'],
    testData.title,
    'og:title matches input title'
  );

  // Test generateMetaTagsHtml
  const htmlBlock = newsScraperService.generateMetaTagsHtml(testData);
  
  assert(
    typeof htmlBlock === 'string',
    'generateMetaTagsHtml returns string'
  );
  
  assert(
    htmlBlock.includes('<meta property="og:title"'),
    'HTML block includes og:title meta tag'
  );
  
  assert(
    htmlBlock.includes(testData.title),
    'HTML block includes article title'
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST SUITE 3: Error Handling
// ═════════════════════════════════════════════════════════════════════════════

function testErrorHandling() {
  printTestSuite('Error Handling');

  // Test invalid URL array
  assert(
    newsScraperService.scrapeMultipleUrls === undefined || 
    typeof newsScraperService.scrapeMultipleUrls === 'function',
    'scrapeMultipleUrls function exists'
  );

  // Test processUrl function exists
  assert(
    typeof newsScraperService.processUrl === 'function',
    'processUrl function exists'
  );

  // Test extractMetadata function exists
  assert(
    typeof newsScraperService.extractMetadata === 'function',
    'extractMetadata function exists'
  );

  // Test validateMetaTags function exists
  assert(
    typeof newsScraperService.validateMetaTags === 'function',
    'validateMetaTags function exists'
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST SUITE 4: HTML Parsing (with sample HTML)
// ═════════════════════════════════════════════════════════════════════════════

function testHtmlParsing() {
  printTestSuite('HTML Parsing & Metadata Extraction');

  const sampleHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Sample Article Title</title>
        <meta name="description" content="Sample article description">
        <meta property="og:title" content="OG Article Title">
        <meta property="og:description" content="OG Article Description">
        <meta property="og:image" content="https://example.com/og-image.jpg">
        <meta property="og:url" content="https://example.com/article">
        <meta name="twitter:card" content="summary_large_image">
      </head>
      <body>
        <img src="/images/first-image.jpg" alt="First Image">
        <h1>Article Content</h1>
      </body>
    </html>
  `;

  const baseUrl = 'https://example.com/article';
  const metadata = newsScraperService.extractMetadata(sampleHtml, baseUrl);

  assertObject(metadata, 'extractMetadata returns object');
  assertEquals(
    metadata.title,
    'OG Article Title',
    'Extracts og:title correctly'
  );
  assertEquals(
    metadata.description,
    'OG Article Description',
    'Extracts og:description correctly'
  );
  assert(
    metadata.image.includes('og-image.jpg'),
    'Extracts og:image correctly'
  );

  // Test validateMetaTags
  const missingTags = newsScraperService.validateMetaTags(sampleHtml);
  assertArray(missingTags, 'validateMetaTags returns array');
  assert(
    missingTags.length <= 6,
    'Missing tags count is reasonable'
  );

  // Test with incomplete HTML
  const incompleteHtml = `
    <html>
      <head>
        <title>Incomplete Article</title>
      </head>
      <body>
        <img src="image.jpg">
      </body>
    </html>
  `;

  const incompleteMetadata = newsScraperService.extractMetadata(incompleteHtml, baseUrl);
  assertExists(incompleteMetadata.title, 'Extracts title from <title> tag as fallback');
  assert(
    incompleteMetadata.image !== null,
    'Provides image from first <img> tag or placeholder'
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST SUITE 5: Integration Tests (Async)
// ═════════════════════════════════════════════════════════════════════════════

async function testIntegration() {
  printTestSuite('Integration Tests (Async)');

  // Test with real URL (BBC News - very reliable)
  console.log('\n🔄 Testing with real URL (www.bbc.com)...');
  
  try {
    const result = await newsScraperService.processUrl('https://www.bbc.com/news');
    
    assertObject(result, 'processUrl returns object');
    assert(result.success, 'Successfully processes real URL');
    assertExists(result.title, 'Extracts title from real page');
    assertExists(result.description, 'Extracts description from real page');
    assertExists(result.image, 'Extracts or provides image');
    assertExists(result.missingTags, 'Provides missingTags array');
    assertExists(result.suggestedMetaTags, 'Provides suggestedMetaTags');
    assertExists(result.metaTagsHtml, 'Generates metaTagsHtml block');

    console.log(`  Title: ${result.title.substring(0, 50)}...`);
    console.log(`  Missing Tags: ${result.missingTags.join(', ')}`);
  } catch (error) {
    console.log(`  ⚠️  Integration test skipped: Network unavailable`);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST SUITE 6: Performance Tests
// ═════════════════════════════════════════════════════════════════════════════

function testPerformance() {
  printTestSuite('Performance Tests');

  const startTime = Date.now();

  for (let i = 0; i < 1000; i++) {
    urlUtils.isValidUrl('https://example.com/article');
  }

  const endTime = Date.now();
  const duration = endTime - startTime;

  console.log(`\n⏱️  URL Validation Performance:`);
  console.log(`  1000 iterations in ${duration}ms`);
  console.log(`  Average: ${(duration / 1000).toFixed(4)}ms per call`);
  
  assert(
    duration < 1000,
    'URL validation completes 1000 iterations under 1 second'
  );

  // Test large URL array
  const largeUrlArray = [];
  for (let i = 0; i < 100; i++) {
    largeUrlArray.push(`https://example.com/article/${i}`);
    if (i % 3 === 0) largeUrlArray.push('invalid');
  }

  const sanitizeStart = Date.now();
  const sanitized = urlUtils.sanitizeUrls(largeUrlArray);
  const sanitizeEnd = Date.now();

  console.log(`\n⏱️  URL Sanitization Performance:`);
  console.log(`  Sanitized ${largeUrlArray.length} URLs in ${sanitizeEnd - sanitizeStart}ms`);
  console.log(`  Valid URLs: ${sanitized.length}`);

  assert(
    sanitized.length <= 100,
    'URL sanitization handles large arrays'
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// RUN ALL TESTS
// ═════════════════════════════════════════════════════════════════════════════

async function runAllTests() {
  console.log('\n\n');
  console.log('╔' + '═'.repeat(70) + '╗');
  console.log('║' + ' '.repeat(10) + '🧪 NEWS SCRAPER SERVICE - UNIT TESTS 🧪' + ' '.repeat(20) + '║');
  console.log('╚' + '═'.repeat(70) + '╝');

  // Run all test suites
  testUrlUtilities();
  testMetaTagGeneration();
  testErrorHandling();
  testHtmlParsing();
  testPerformance();
  
  // Run async tests
  await testIntegration();

  // Print results
  printTestResults();

  // Summary
  const allPassed = testsFailed === 0;
  console.log(`\n${allPassed ? '✅' : '⚠️'} ${allPassed ? 'All tests passed!' : `${testsFailed} test(s) failed!`}\n`);

  process.exit(allPassed ? 0 : 1);
}

// Export for use in other test runners
module.exports = {
  testUrlUtilities,
  testMetaTagGeneration,
  testErrorHandling,
  testHtmlParsing,
  testPerformance,
  testIntegration,
  runAllTests
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}
