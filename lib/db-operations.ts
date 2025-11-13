import { query, execute } from './db'
import { TABLES } from './init-tables'

// 通用数据记录接口
interface DataRecord {
  id: number
  data: any
  published_at: Date
  created_at: Date
  updated_at: Date
}

// 从数据库读取 Bilibili 视频数据
export async function getBilibiliVideosFromDB(limit: number = 30): Promise<any[]> {
  // 确保 limit 是整数，并直接在 SQL 中使用（避免参数化查询的类型问题）
  const limitValue = Math.floor(Number(limit)) || 30
  // 使用字符串插值而不是参数化查询，因为 LIMIT 必须是整数常量
  const sql = `
    SELECT 
      id,
      data,
      published_at,
      created_at,
      updated_at
    FROM \`${TABLES.BILIBILI_VIDEOS}\`
    ORDER BY published_at DESC
    LIMIT ${limitValue}
  `
  
  const records = await query<DataRecord>(sql)
  return records.map(record => {
    // TiDB/MySQL 的 JSON 字段在查询时已经自动解析为对象
    const data = typeof record.data === 'string' ? JSON.parse(record.data) : record.data
    return {
      ...data,
      id: record.id,
      published_at: record.published_at,
      created_at: record.created_at,
      updated_at: record.updated_at
    }
  })
}

// 保存 Bilibili 视频数据到数据库
export async function saveBilibiliVideosToDB(videos: any[]): Promise<void> {
  if (videos.length === 0) return
  
  // 使用 INSERT ... ON DUPLICATE KEY UPDATE 或先检查是否存在
  // 这里使用简单的 INSERT，如果需要去重，可以根据 url 或其他唯一标识
  for (const video of videos) {
    // 确保 published_at 是 Date 对象或 ISO 字符串
    let publishedAt: Date | string = video.published_at || video.published || new Date()
    if (typeof publishedAt === 'string') {
      publishedAt = new Date(publishedAt)
    }
    const dataJson = JSON.stringify(video)
    
    // 检查是否已存在（根据 url）
    const checkSql = `
      SELECT id FROM \`${TABLES.BILIBILI_VIDEOS}\`
      WHERE JSON_EXTRACT(data, '$.url') = ?
      LIMIT 1
    `
    const existing = await query(checkSql, [video.url])
    
    if (existing.length === 0) {
      // 插入新记录
      const insertSql = `
        INSERT INTO \`${TABLES.BILIBILI_VIDEOS}\` (data, published_at)
        VALUES (?, ?)
      `
      await execute(insertSql, [dataJson, publishedAt])
    } else {
      // 更新现有记录
      const updateSql = `
        UPDATE \`${TABLES.BILIBILI_VIDEOS}\`
        SET data = ?, published_at = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
      await execute(updateSql, [dataJson, publishedAt, existing[0].id])
    }
  }
}

// 从数据库读取简书文章数据
export async function getJianshuArticlesFromDB(limit: number = 30): Promise<any[]> {
  // 确保 limit 是整数，并直接在 SQL 中使用（避免参数化查询的类型问题）
  const limitValue = Math.floor(Number(limit)) || 30
  // 使用字符串插值而不是参数化查询，因为 LIMIT 必须是整数常量
  const sql = `
    SELECT 
      id,
      data,
      published_at,
      created_at,
      updated_at
    FROM \`${TABLES.JIANSHU_ARTICLES}\`
    ORDER BY published_at DESC
    LIMIT ${limitValue}
  `
  
  const records = await query<DataRecord>(sql)
  return records.map(record => {
    // TiDB/MySQL 的 JSON 字段在查询时已经自动解析为对象
    const data = typeof record.data === 'string' ? JSON.parse(record.data) : record.data
    return {
      ...data,
      id: record.id,
      published_at: record.published_at,
      created_at: record.created_at,
      updated_at: record.updated_at
    }
  })
}

// 保存简书文章数据到数据库
export async function saveJianshuArticlesToDB(articles: any[]): Promise<void> {
  if (articles.length === 0) return
  
  for (const article of articles) {
    const publishedAt = article.published_at || article.published || new Date()
    const dataJson = JSON.stringify(article)
    
    // 检查是否已存在（根据 link 或 slug）
    const checkSql = `
      SELECT id FROM \`${TABLES.JIANSHU_ARTICLES}\`
      WHERE JSON_EXTRACT(data, '$.link') = ? OR JSON_EXTRACT(data, '$.slug') = ?
      LIMIT 1
    `
    const existing = await query(checkSql, [article.link || '', article.slug || ''])
    
    if (existing.length === 0) {
      const insertSql = `
        INSERT INTO \`${TABLES.JIANSHU_ARTICLES}\` (data, published_at)
        VALUES (?, ?)
      `
      await execute(insertSql, [dataJson, publishedAt])
    } else {
      const updateSql = `
        UPDATE \`${TABLES.JIANSHU_ARTICLES}\`
        SET data = ?, published_at = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
      await execute(updateSql, [dataJson, publishedAt, existing[0].id])
    }
  }
}

// 从数据库读取 YouTube 视频数据
export async function getYouTubeVideosFromDB(limit: number = 30): Promise<any[]> {
  // 确保 limit 是整数，并直接在 SQL 中使用（避免参数化查询的类型问题）
  const limitValue = Math.floor(Number(limit)) || 30
  // 使用字符串插值而不是参数化查询，因为 LIMIT 必须是整数常量
  const sql = `
    SELECT 
      id,
      data,
      published_at,
      created_at,
      updated_at
    FROM \`${TABLES.YOUTUBE_VIDEOS}\`
    ORDER BY published_at DESC
    LIMIT ${limitValue}
  `
  
  const records = await query<DataRecord>(sql)
  return records.map(record => {
    // TiDB/MySQL 的 JSON 字段在查询时已经自动解析为对象
    const data = typeof record.data === 'string' ? JSON.parse(record.data) : record.data
    return {
      ...data,
      id: record.id,
      published_at: record.published_at,
      created_at: record.created_at,
      updated_at: record.updated_at
    }
  })
}

// 保存 YouTube 视频数据到数据库
export async function saveYouTubeVideosToDB(videos: any[]): Promise<void> {
  if (videos.length === 0) return
  
  for (const video of videos) {
    // 确保 published_at 是 Date 对象或 ISO 字符串
    let publishedAt: Date | string = video.published_at || video.published || new Date()
    if (typeof publishedAt === 'string') {
      publishedAt = new Date(publishedAt)
    }
    const dataJson = JSON.stringify(video)
    
    // 检查是否已存在（根据 video_id 或 url）
    const checkSql = `
      SELECT id FROM \`${TABLES.YOUTUBE_VIDEOS}\`
      WHERE JSON_EXTRACT(data, '$.video_id') = ? OR JSON_EXTRACT(data, '$.url') = ?
      LIMIT 1
    `
    const existing = await query(checkSql, [video.video_id || '', video.url || ''])
    
    if (existing.length === 0) {
      const insertSql = `
        INSERT INTO \`${TABLES.YOUTUBE_VIDEOS}\` (data, published_at)
        VALUES (?, ?)
      `
      await execute(insertSql, [dataJson, publishedAt])
    } else {
      const updateSql = `
        UPDATE \`${TABLES.YOUTUBE_VIDEOS}\`
        SET data = ?, published_at = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
      await execute(updateSql, [dataJson, publishedAt, existing[0].id])
    }
  }
}

// 从数据库读取豆瓣兴趣数据
export async function getDoubanInterestsFromDB(limit: number = 30): Promise<any[]> {
  // 确保 limit 是整数，并直接在 SQL 中使用（避免参数化查询的类型问题）
  const limitValue = Math.floor(Number(limit)) || 30
  // 确保 limitValue 是有效的正整数
  if (isNaN(limitValue) || limitValue < 1) {
    throw new Error(`Invalid limit value: ${limitValue}`)
  }
  // 使用字符串插值而不是参数化查询，因为 LIMIT 必须是整数常量
  // 注意：limitValue 已经过验证，是安全的整数
  const sql = `SELECT id, data, published_at, created_at, updated_at FROM \`${TABLES.DOUBAN_INTERESTS}\` ORDER BY published_at DESC LIMIT ${limitValue}`
  
  console.log('[数据库] 执行豆瓣查询:', { sql, limitValue, limitType: typeof limitValue, isInteger: Number.isInteger(limitValue) })
  const records = await query<DataRecord>(sql)
  return records.map(record => {
    // TiDB/MySQL 的 JSON 字段在查询时已经自动解析为对象
    const data = typeof record.data === 'string' ? JSON.parse(record.data) : record.data
    return {
      ...data,
      id: record.id,
      published_at: record.published_at,
      created_at: record.created_at,
      updated_at: record.updated_at
    }
  })
}

// 解析 RFC 822 格式的日期字符串（如 "Fri, 19 Sep 2025 22:26:16 GMT"）
function parseRFC822Date(dateString: string | Date): Date {
  // 如果已经是 Date 对象，直接返回
  if (dateString instanceof Date) {
    return dateString
  }
  
  // 如果是字符串，尝试解析
  if (typeof dateString === 'string') {
    // 优先手动解析 RFC 822/GMT 格式
    const gmtMatch = dateString.match(/^(\w+),\s+(\d{1,2})\s+(\w+)\s+(\d{4})\s+(\d{2}):(\d{2}):(\d{2})\s+(GMT|UTC)$/i)
    if (gmtMatch) {
      const months: Record<string, number> = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      }
      
      const day = parseInt(gmtMatch[2], 10)
      const monthName = gmtMatch[3]
      const month = months[monthName.charAt(0).toUpperCase() + monthName.slice(1).toLowerCase()] ?? 0
      const year = parseInt(gmtMatch[4], 10)
      const hour = parseInt(gmtMatch[5], 10)
      const minute = parseInt(gmtMatch[6], 10)
      const second = parseInt(gmtMatch[7], 10)
      
      const date = new Date(Date.UTC(year, month, day, hour, minute, second))
      if (!isNaN(date.getTime())) {
        return date
      }
    }
    
    // 尝试使用 Date 构造函数解析（支持 ISO 和其他格式）
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      return date
    }
  }
  
  // 如果所有解析都失败，返回当前时间
  console.warn('[数据库] 无法解析日期字符串，使用当前时间:', dateString)
  return new Date()
}

// 保存豆瓣兴趣数据到数据库
export async function saveDoubanInterestsToDB(interests: any[]): Promise<void> {
  if (interests.length === 0) return
  
  for (const interest of interests) {
    // 解析日期字符串为 Date 对象
    const dateString = interest.published_at || interest.published || interest.created_at
    const publishedAt = dateString ? parseRFC822Date(dateString) : new Date()
    
    const dataJson = JSON.stringify(interest)
    
    // 检查是否已存在（根据 url）
    const checkSql = `
      SELECT id FROM \`${TABLES.DOUBAN_INTERESTS}\`
      WHERE JSON_EXTRACT(data, '$.url') = ?
      LIMIT 1
    `
    const existing = await query(checkSql, [interest.url || ''])
    
    if (existing.length === 0) {
      const insertSql = `
        INSERT INTO \`${TABLES.DOUBAN_INTERESTS}\` (data, published_at)
        VALUES (?, ?)
      `
      await execute(insertSql, [dataJson, publishedAt])
    } else {
      const updateSql = `
        UPDATE \`${TABLES.DOUBAN_INTERESTS}\`
        SET data = ?, published_at = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
      await execute(updateSql, [dataJson, publishedAt, existing[0].id])
    }
  }
}

