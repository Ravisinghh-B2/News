const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  content: { type: String },
  url: { type: String, required: true, unique: true },
  imageUrl: { type: String },
  source: { type: String },
  category: { type: String, required: true },
  subCategory: { type: String },
  isTrending: { type: Boolean, default: false },
  publishedAt: { type: Date },
  fetchedAt: { type: Date, default: Date.now },
  // Similar news grouping
  groupId: { type: String, default: null },
  keywords: [{ type: String }],
  // Multi-source tracking
  alsoCoveredBy: [{
    source: String,
    url: String,
    title: String
  }]
});

// Compound indexes for fast queries
newsSchema.index({ category: 1, publishedAt: -1 });
newsSchema.index({ category: 1, subCategory: 1, publishedAt: -1 });
newsSchema.index({ isTrending: 1, publishedAt: -1 });
newsSchema.index({ groupId: 1 });
newsSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 86400 }); // TTL: 24h auto-delete

module.exports = mongoose.model('News', newsSchema);
