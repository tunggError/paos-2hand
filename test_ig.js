const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const IG_ACCESS_TOKEN = env.match(/IG_ACCESS_TOKEN=(.*)/)[1].trim();
const IG_USER_ID = env.match(/IG_USER_ID=(.*)/)[1].trim();

async function run() {
  let url = `https://graph.facebook.com/v19.0/${IG_USER_ID}/media?fields=id&limit=100&access_token=${IG_ACCESS_TOKEN}`;
  let count = 0;
  while(url) {
    const res = await fetch(url);
    const data = await res.json();
    if(data.data) {
      count += data.data.length;
      console.log(`Fetched ${data.data.length}, total: ${count}`);
    }
    url = data.paging?.next || null;
    if(!url) break;
  }
  console.log("Total posts found:", count);
}
run();
