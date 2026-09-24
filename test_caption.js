const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const IG_ACCESS_TOKEN = env.match(/IG_ACCESS_TOKEN=(.*)/)[1].trim();
const IG_USER_ID = env.match(/IG_USER_ID=(.*)/)[1].trim();

async function run() {
  let url = `https://graph.facebook.com/v19.0/${IG_USER_ID}/media?fields=id,caption&limit=20&access_token=${IG_ACCESS_TOKEN}`;
  const res = await fetch(url);
  const data = await res.json();
  if(data.data) {
    data.data.forEach(post => {
      console.log("-------------------");
      console.log(post.caption ? post.caption.substring(0, 100).replace(/\n/g, '\\n') : "NO CAPTION");
    });
  }
}
run();
