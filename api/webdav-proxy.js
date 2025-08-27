export default async function handler(req, res) {
  // 设置CORS头 - 在处理开始就设置
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PROPFIND, MKCOL')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Depth, Content-Length')
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type, ETag, Last-Modified')

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const { targetUrl: baseUrl, path } = req.query

    // 构建目标URL
    let targetUrl
    if (baseUrl) {
      // 通用WebDAV服务器
      targetUrl = baseUrl
      if (path) {
        const pathStr = Array.isArray(path) ? path.join('/') : path
        // 确保正确拼接路径
        const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
        const normalizedPath = pathStr.startsWith('/') ? pathStr : '/' + pathStr
        targetUrl = normalizedBase + normalizedPath
      }
    } else if (path) {
      // 兼容旧版Koofr格式
      const targetPath = Array.isArray(path) ? path.join('/') : (path || '')
      const cleanPath = targetPath.replace(/\/$/, '')
      targetUrl = `https://app.koofr.net/dav/${cleanPath}/`
    } else {
      return res.status(400).json({ error: 'Missing targetUrl or path parameter' })
    }

    console.log('Proxying request:', {
      method: req.method,
      baseUrl,
      path,
      targetUrl,
      hasAuth: !!req.headers.authorization
    })

    // 获取Authorization头
    const authorization = req.headers.authorization
    if (!authorization) {
      return res.status(401).json({ error: 'Authorization header required' })
    }

    // 设置请求头
    const headers = {
      'Authorization': authorization,
      'User-Agent': 'WebDAV-Client/1.0'
    }

    // 处理Content-Type和Depth头
    if (req.headers['content-type']) {
      headers['Content-Type'] = req.headers['content-type']
    }
    if (req.headers['depth']) {
      headers['Depth'] = req.headers['depth']
    }

    // 处理请求体
    let body
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
      if (req.body) {
        body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
      }
    }

    // 转发请求到WebDAV服务器
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body
    })

    console.log('Response status:', response.status)

    // 设置响应状态
    res.status(response.status)

    // 转发响应头
    response.headers.forEach((value, key) => {
      // 跳过一些可能导致问题的头
      const skipHeaders = ['content-encoding', 'transfer-encoding', 'connection']
      if (!skipHeaders.includes(key.toLowerCase())) {
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