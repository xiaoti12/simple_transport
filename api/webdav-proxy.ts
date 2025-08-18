import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { path } = req.query
  
  // 构建目标URL
  const targetPath = Array.isArray(path) ? path.join('/') : (path || '')
  const targetUrl = `https://app.koofr.net/dav/${targetPath}`
  
  // 获取Authorization头
  const authorization = req.headers.authorization
  if (!authorization) {
    return res.status(401).json({ error: 'Authorization header required' })
  }

  try {
    // 设置请求头
    const headers: Record<string, string> = {
      'Authorization': authorization,
      'User-Agent': 'WebDAV-Client/1.0',
      'Content-Type': req.headers['content-type'] || 'application/xml'
    }

    // 如果有请求体，添加Content-Length
    let body: string | undefined
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
      if (body) {
        headers['Content-Length'] = Buffer.byteLength(body).toString()
      }
    }

    // 转发请求到Koofr
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body
    })

    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PROPFIND, MKCOL')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Depth, Content-Length')
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type, ETag, Last-Modified')

    // 处理预检请求
    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }

    // 转发响应状态
    res.status(response.status)

    // 转发响应头
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-encoding') {
        res.setHeader(key, value)
      }
    })

    // 转发响应体
    const responseText = await response.text()
    res.send(responseText)

  } catch (error) {
    console.error('WebDAV proxy error:', error)
    res.status(500).json({ 
      error: 'Proxy request failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}