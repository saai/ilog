import { query, execute } from './db'

// 表名定义
export const TABLES = {
  BILIBILI_VIDEOS: 'bilibili_videos',
  JIANSHU_ARTICLES: 'jianshu_articles',
  YOUTUBE_VIDEOS: 'youtube_videos',
  DOUBAN_INTERESTS: 'douban_interests'
} as const

// 初始化所有表
export async function initTables(): Promise<void> {
  console.log('[数据库] 开始初始化表结构...')
  
  try {
    // 初始化 Bilibili 视频表
    await initBilibiliVideosTable()
    
    // 初始化简书文章表
    await initJianshuArticlesTable()
    
    // 初始化 YouTube 视频表
    await initYouTubeVideosTable()
    
    // 初始化豆瓣兴趣表
    await initDoubanInterestsTable()
    
    console.log('[数据库] 所有表初始化完成')
  } catch (error) {
    console.error('[数据库] 表初始化失败:', error)
    throw error
  }
}

// 初始化 Bilibili 视频表
async function initBilibiliVideosTable(): Promise<void> {
  const tableName = TABLES.BILIBILI_VIDEOS
  const sql = `
    CREATE TABLE IF NOT EXISTS \`${tableName}\` (
      \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      \`data\` JSON NOT NULL COMMENT '视频数据 JSON',
      \`published_at\` DATETIME NOT NULL COMMENT '发布时间',
      \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
      INDEX \`idx_published_at\` (\`published_at\` DESC),
      INDEX \`idx_created_at\` (\`created_at\` DESC),
      INDEX \`idx_updated_at\` (\`updated_at\` DESC)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='B站视频数据表';
  `
  
  try {
    await execute(sql)
    console.log(`[数据库] 表 ${tableName} 初始化成功（如果已存在则忽略）`)
  } catch (error) {
    console.error(`[数据库] 表 ${tableName} 初始化失败:`, error)
    throw error
  }
}

// 初始化简书文章表
async function initJianshuArticlesTable(): Promise<void> {
  const tableName = TABLES.JIANSHU_ARTICLES
  const sql = `
    CREATE TABLE IF NOT EXISTS \`${tableName}\` (
      \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      \`data\` JSON NOT NULL COMMENT '文章数据 JSON',
      \`published_at\` DATETIME NOT NULL COMMENT '发布时间',
      \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
      INDEX \`idx_published_at\` (\`published_at\` DESC),
      INDEX \`idx_created_at\` (\`created_at\` DESC),
      INDEX \`idx_updated_at\` (\`updated_at\` DESC)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='简书文章数据表';
  `
  
  try {
    await execute(sql)
    console.log(`[数据库] 表 ${tableName} 初始化成功（如果已存在则忽略）`)
  } catch (error) {
    console.error(`[数据库] 表 ${tableName} 初始化失败:`, error)
    throw error
  }
}

// 初始化 YouTube 视频表
async function initYouTubeVideosTable(): Promise<void> {
  const tableName = TABLES.YOUTUBE_VIDEOS
  const sql = `
    CREATE TABLE IF NOT EXISTS \`${tableName}\` (
      \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      \`data\` JSON NOT NULL COMMENT '视频数据 JSON',
      \`published_at\` DATETIME NOT NULL COMMENT '发布时间',
      \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
      INDEX \`idx_published_at\` (\`published_at\` DESC),
      INDEX \`idx_created_at\` (\`created_at\` DESC),
      INDEX \`idx_updated_at\` (\`updated_at\` DESC)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='YouTube视频数据表';
  `
  
  try {
    await execute(sql)
    console.log(`[数据库] 表 ${tableName} 初始化成功（如果已存在则忽略）`)
  } catch (error) {
    console.error(`[数据库] 表 ${tableName} 初始化失败:`, error)
    throw error
  }
}

// 初始化豆瓣兴趣表
async function initDoubanInterestsTable(): Promise<void> {
  const tableName = TABLES.DOUBAN_INTERESTS
  const sql = `
    CREATE TABLE IF NOT EXISTS \`${tableName}\` (
      \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      \`data\` JSON NOT NULL COMMENT '兴趣数据 JSON',
      \`published_at\` DATETIME NOT NULL COMMENT '发布时间',
      \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
      INDEX \`idx_published_at\` (\`published_at\` DESC),
      INDEX \`idx_created_at\` (\`created_at\` DESC),
      INDEX \`idx_updated_at\` (\`updated_at\` DESC)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='豆瓣兴趣数据表';
  `
  
  try {
    await execute(sql)
    console.log(`[数据库] 表 ${tableName} 初始化成功（如果已存在则忽略）`)
  } catch (error) {
    console.error(`[数据库] 表 ${tableName} 初始化失败:`, error)
    throw error
  }
}

