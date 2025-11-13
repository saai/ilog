import mysql from 'mysql2/promise'

// TiDB 连接配置（从环境变量读取）
const dbConfig = {
  host: process.env.TIDB_HOST || 'localhost',
  port: parseInt(process.env.TIDB_PORT || '4000'),
  user: process.env.TIDB_USER || 'root',
  password: process.env.TIDB_PASSWORD || '',
  database: process.env.TIDB_DATABASE || 'ilog',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
}

// 创建连接池
let pool: mysql.Pool | null = null

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
    console.log('[数据库] 已创建 TiDB 连接池', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user
    })
  }
  return pool
}

// 获取数据库连接
export async function getConnection(): Promise<mysql.PoolConnection> {
  const pool = getPool()
  return await pool.getConnection()
}

// 执行查询
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  const pool = getPool()
  const [rows] = await pool.execute(sql, params)
  return rows as T[]
}

// 执行单个查询（返回第一条结果）
export async function queryOne<T = any>(
  sql: string,
  params?: any[]
): Promise<T | null> {
  const results = await query<T>(sql, params)
  return results.length > 0 ? results[0] : null
}

// 执行更新/插入/删除
export async function execute(
  sql: string,
  params?: any[]
): Promise<mysql.ResultSetHeader> {
  const pool = getPool()
  const [result] = await pool.execute(sql, params)
  return result as mysql.ResultSetHeader
}

// 关闭连接池
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
    console.log('[数据库] 已关闭 TiDB 连接池')
  }
}

