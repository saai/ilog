const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');

const userId = '284853052';
const rssUrl = `https://www.douban.com/feed/people/${userId}/interests`;
const outputPath = path.join(__dirname, 'douban-rss.json');

async function fetchAndSave() {
  const parser = new Parser();
  try {
    console.log('开始抓取豆瓣RSS数据...');
    const feed = await parser.parseURL(rssUrl);
    const collections = (feed.items || []).map(item => ({
      title: item.title || '',
      url: item.link || '',
      type: 'interest',
      rating: '',
      author: item.author || '',
      published: item.pubDate || '',
      formattedDate: item.pubDate ? formatDate(item.pubDate) : ''
    }));
    const data = {
      collections,
      total: collections.length,
      user: {
        id: userId,
        nickname: 'Saai'
      }
    };
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log('豆瓣RSS数据已保存:', outputPath);
    console.log(`共获取 ${collections.length} 条收藏数据`);
  } catch (err) {
    console.error('抓取或保存豆瓣RSS失败:', err);
  }
}

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) return '今天';
    if (diffInDays === 1) return '昨天';
    if (diffInDays < 7) return `${diffInDays}天前`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}周前`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}个月前`;
    return `${Math.floor(diffInDays / 365)}年前`;
  } catch {
    return '未知时间';
  }
}

fetchAndSave(); 