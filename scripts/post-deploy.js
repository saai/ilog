#!/usr/bin/env node
/**
 * 部署后自动运行初始化爬虫
 * 这个脚本会在 Vercel 部署成功后自动调用 /api/init
 */

const https = require('https');
const http = require('http');

// 从环境变量获取部署 URL
const deploymentUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_BASE_URL;
const initSecret = process.env.INIT_SECRET || process.env.CRON_SECRET;

if (!deploymentUrl) {
  console.log('⚠️  未找到部署 URL，跳过初始化爬虫');
  console.log('   请手动调用: curl https://your-domain.vercel.app/api/init');
  process.exit(0);
}

const protocol = deploymentUrl.startsWith('https://') ? https : http;
const url = deploymentUrl.startsWith('http') 
  ? `${deploymentUrl}/api/init`
  : `https://${deploymentUrl}/api/init`;

const headers = {};
if (initSecret) {
  headers['Authorization'] = `Bearer ${initSecret}`;
}

console.log(`🚀 正在初始化爬虫: ${url}`);

const request = protocol.get(url, { headers }, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const result = JSON.parse(data);
        if (result.success) {
          console.log('✅ 爬虫初始化成功!');
          console.log(`   完成 ${result.message}`);
          if (result.results) {
            result.results.forEach(r => {
              const icon = r.success ? '✅' : '❌';
              console.log(`   ${icon} ${r.name}: ${r.message}`);
            });
          }
        } else {
          console.log('⚠️  爬虫初始化部分成功:', result.message);
        }
      } catch (e) {
        console.log('✅ 爬虫初始化请求已发送');
      }
    } else {
      console.log(`⚠️  初始化请求返回状态码: ${res.statusCode}`);
      console.log('   请手动调用: curl', url);
    }
  });
});

request.on('error', (error) => {
  console.log('⚠️  初始化请求失败:', error.message);
  console.log('   请手动调用: curl', url);
});

request.setTimeout(60000, () => {
  request.destroy();
  console.log('⚠️  初始化请求超时');
  console.log('   请手动调用: curl', url);
});

