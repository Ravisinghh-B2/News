/**
 * URL Utilities - Helper functions for URL validation and manipulation
 */

const { URL } = require('url');

/**
 * Validate if a string is a valid URL
 * @param {string} urlString - URL to validate
 * @returns {boolean} - True if valid URL
 */
function isValidUrl(urlString) {
  try {
    new URL(urlString);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Convert relative URLs to absolute URLs
 * @param {string} relativeUrl - Relative URL path
 * @param {string} baseUrl - Base URL
 * @returns {string} - Absolute URL
 */
function convertToAbsoluteUrl(relativeUrl, baseUrl) {
  if (!relativeUrl) return null;
  
  // If already absolute, return as is
  if (isValidUrl(relativeUrl)) {
    return relativeUrl;
  }
  
  try {
    const base = new URL(baseUrl);
    const absolute = new URL(relativeUrl, base.href);
    return absolute.href;
  } catch (err) {
    return null;
  }
}

/**
 * Extract domain from URL
 * @param {string} urlString - URL string
 * @returns {string} - Domain name
 */
function extractDomain(urlString) {
  try {
    const url = new URL(urlString);
    return url.hostname.replace('www.', '');
  } catch (err) {
    return 'unknown';
  }
}

/**
 * Sanitize URLs array
 * @param {array} urls - Array of URLs
 * @returns {array} - Filtered array of valid URLs
 */
function sanitizeUrls(urls) {
  if (!Array.isArray(urls)) return [];
  
  return urls
    .filter(url => typeof url === 'string' && url.trim().length > 0)
    .map(url => url.trim())
    .filter(url => isValidUrl(url))
    .filter((url, index, self) => self.indexOf(url) === index); // Remove duplicates
}

/**
 * Generate placeholder image URL
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Placeholder image URL
 */
function getPlaceholderImage(width = 600, height = 400) {
  return `https://via.placeholder.com/${width}x${height}?text=No+Image+Available`;
}

module.exports = {
  isValidUrl,
  convertToAbsoluteUrl,
  extractDomain,
  sanitizeUrls,
  getPlaceholderImage
};
