const https = require('https');
const fs = require('fs');
const path = require('path');

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('Failed to get ' + url + ' status: ' + res.statusCode));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

const channels = [
  { name: 'ndtv', url: 'https://logo.clearbit.com/ndtv.com' },
  { name: 'aajtak', url: 'https://logo.clearbit.com/aajtak.in' },
  { name: 'indiatoday', url: 'https://logo.clearbit.com/indiatoday.in' },
  { name: 'timesnow', url: 'https://logo.clearbit.com/timesnownews.com' },
  { name: 'republic', url: 'https://logo.clearbit.com/republicworld.com' },
  { name: 'zeenews', url: 'https://logo.clearbit.com/zeenews.india.com' },
  { name: 'abpnews', url: 'https://logo.clearbit.com/abplive.com' },
  { name: 'thehindu', url: 'https://logo.clearbit.com/thehindu.com' },
  { name: 'news18', url: 'https://logo.clearbit.com/news18.com' },
  { name: 'indianexpress', url: 'https://logo.clearbit.com/indianexpress.com' },
  { name: 'economictimes', url: 'https://logo.clearbit.com/economictimes.indiatimes.com' },
  { name: 'businessstandard', url: 'https://logo.clearbit.com/business-standard.com' },
  { name: 'livemint', url: 'https://logo.clearbit.com/livemint.com' },
  { name: 'theprint', url: 'https://logo.clearbit.com/theprint.in' },
  { name: 'thequint', url: 'https://logo.clearbit.com/thequint.com' },
  { name: 'firstpost', url: 'https://logo.clearbit.com/firstpost.com' },
  { name: 'scroll', url: 'https://logo.clearbit.com/scroll.in' },
  { name: 'wire', url: 'https://logo.clearbit.com/thewire.in' },
  { name: 'cricbuzz', url: 'https://logo.clearbit.com/cricbuzz.com' },
  { name: 'bollywoodhungama', url: 'https://logo.clearbit.com/bollywoodhungama.com' },
  { name: 'pinkvilla', url: 'https://logo.clearbit.com/pinkvilla.com' },
  { name: 'financialexpress', url: 'https://logo.clearbit.com/financialexpress.com' },
  { name: 'asianet', url: 'https://logo.clearbit.com/asianetnews.com' },
  { name: 'manorama', url: 'https://logo.clearbit.com/manoramaonline.com' },
  { name: 'deccanherald', url: 'https://logo.clearbit.com/deccanherald.com' },
  { name: 'bbc', url: 'https://logo.clearbit.com/bbc.com' },
  { name: 'cnn', url: 'https://logo.clearbit.com/cnn.com' },
  { name: 'reuters', url: 'https://logo.clearbit.com/reuters.com' },
  { name: 'bloomberg', url: 'https://logo.clearbit.com/bloomberg.com' },
  { name: 'aljazeera', url: 'https://logo.clearbit.com/aljazeera.com' },
  { name: 'guardian', url: 'https://logo.clearbit.com/theguardian.com' },
  { name: 'techcrunch', url: 'https://logo.clearbit.com/techcrunch.com' },
  { name: 'theverge', url: 'https://logo.clearbit.com/theverge.com' },
  { name: 'wired', url: 'https://logo.clearbit.com/wired.com' },
  { name: 'wsj', url: 'https://logo.clearbit.com/wsj.com' },
  { name: 'nytimes', url: 'https://logo.clearbit.com/nytimes.com' },
  { name: 'forbes', url: 'https://logo.clearbit.com/forbes.com' },
  { name: 'cnbc', url: 'https://logo.clearbit.com/cnbc.com' },
  { name: 'espn', url: 'https://logo.clearbit.com/espn.com' },
  { name: 'variety', url: 'https://logo.clearbit.com/variety.com' },
  { name: 'hollywoodreporter', url: 'https://logo.clearbit.com/hollywoodreporter.com' },
  { name: 'ap', url: 'https://logo.clearbit.com/apnews.com' },
  { name: 'skynews', url: 'https://logo.clearbit.com/news.sky.com' },
  { name: 'france24', url: 'https://logo.clearbit.com/france24.com' },
  { name: 'dw', url: 'https://logo.clearbit.com/dw.com' },
  { name: 'engadget', url: 'https://logo.clearbit.com/engadget.com' },
  { name: 'mashable', url: 'https://logo.clearbit.com/mashable.com' },
  { name: 'gizmodo', url: 'https://logo.clearbit.com/gizmodo.com' },
  { name: 'cnet', url: 'https://logo.clearbit.com/cnet.com' },
  { name: 'skysports', url: 'https://logo.clearbit.com/skysports.com' },
  { name: 'nbcsports', url: 'https://logo.clearbit.com/nbcsports.com' }
];

const placeholders = [
  { name: 'technology', keyword: 'technology' },
  { name: 'sports', keyword: 'sports' },
  { name: 'business', keyword: 'business' },
  { name: 'health', keyword: 'health' },
  { name: 'science', keyword: 'science' },
  { name: 'entertainment', keyword: 'entertainment' },
  { name: 'world', keyword: 'world' },
  { name: 'news', keyword: 'news' }
];

const channelDir = path.join(__dirname, 'Frontend', 'assets', 'channels');
const placeholderDir = path.join(__dirname, 'Frontend', 'assets', 'placeholders');

fs.mkdirSync(channelDir, { recursive: true });
fs.mkdirSync(placeholderDir, { recursive: true });

async function run() {
  for (const c of channels) {
    const dest = path.join(channelDir, c.name + '.png');
    if (!fs.existsSync(dest)) {
        try {
            await download(c.url, dest);
            console.log('Downloaded', c.name);
        } catch (e) {
            console.log('Failed', c.name, e.message);
        }
    }
  }

  for (const p of placeholders) {
    // Just copy a generic placeholder from a robust provider since unspash is unreliable via API script
    const dest = path.join(placeholderDir, p.name + '.jpg');
    if (!fs.existsSync(dest)) {
      try {
        await download(`https://ui-avatars.com/api/?name=${p.keyword}&background=random&size=512`, dest);
        console.log('Downloaded placeholder', p.name);
      } catch (e) {
        console.log('Failed placeholder', p.name, e.message);
      }
    }
  }
}

run();
