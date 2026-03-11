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
  'ndtv', 'aajtak', 'indiatoday', 'timesnow', 'republic', 'zeenews', 'abpnews',
  'thehindu', 'news18', 'indianexpress', 'economictimes', 'businessstandard',
  'livemint', 'theprint', 'thequint', 'firstpost', 'scroll', 'wire', 'cricbuzz',
  'bollywoodhungama', 'pinkvilla', 'financialexpress', 'asianet', 'manorama',
  'deccanherald', 'bbc', 'cnn', 'reuters', 'bloomberg', 'aljazeera', 'guardian',
  'techcrunch', 'theverge', 'wired', 'wsj', 'nytimes', 'forbes', 'cnbc', 'espn',
  'variety', 'hollywoodreporter', 'ap', 'skynews', 'france24', 'dw', 'engadget',
  'mashable', 'gizmodo', 'cnet', 'skysports', 'nbcsports'
];

const channelDir = path.join(__dirname, 'Frontend', 'assets', 'channels');
fs.mkdirSync(channelDir, { recursive: true });

async function run() {
  for (const name of channels) {
    const dest = path.join(channelDir, name + '.png');
    if (!fs.existsSync(dest)) {
        try {
            await download(`https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=200`, dest);
            console.log('Downloaded', name);
        } catch (e) {
            console.log('Failed', name, e.message);
        }
    }
  }
}

run();
