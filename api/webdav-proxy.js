module.exports = async function handler(req, res) {
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
    const { path } = req.query

    // 构建目标URL - 处理路径拼接
    const targetPath = Array.isArray(path) ? path.join('/') : (path || '')
    const cleanPath = targetPath.replace(/\/$/, '') // 移除末尾斜杠
    // TODO 这里写死了url
    const targetUrl = `https://app.koofr.net/dav/${cleanPath}/`

    console.log('Proxying request:', {
      method: req.method,
      path: cleanPath,
      targetUrl,
      hasAuth: !!req.headers.authorization
    })

    // 获取Authorization头
    const authorization = req.headers.authorization
    if (!authorization) {
      return res.status(401).json({ error: 'Authorization header required' })
    }

    // 设置请求头
    const headers: Record<string, string> = {
      'Authorization': authorization,
      'User-Agent': 'WebDAV-Client/1.0'
    }

    // 处理Content-Type和Depth头
    if (req.headers['content-type']) {
      headers['Content-Type'] = req.headers['content-type'] as string
    }
    if (req.headers['depth']) {
      headers['Depth'] = req.headers['depth'] as string
    }

    // 处理请求体
    let body: string | undefined
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
      if (req.body) {
        body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
      }
    }

    // 转发请求到Koofr
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