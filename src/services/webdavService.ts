import { createClient, type WebDAVClient } from 'webdav'
import type { WebDAVConfig, SyncData, TripRecord, AIConfig } from '@/types'

export class WebDAVService {
  private client: WebDAVClient | null = null
  private config: WebDAVConfig

  constructor(config: WebDAVConfig) {
    this.config = config
    this.initClient()
  }

  private initClient() {
    if (!this.config.url || !this.config.username || !this.config.password) {
      console.warn('WebDAV配置不完整')
      return
    }

    try {
      let webdavUrl = this.config.url

      // 如果开启代理模式，替换为代理URL
      if (this.config.useProxy) {
        // 检测是否为Koofr服务
        if (this.config.url.includes('app.koofr.net')) {
          // 提取路径部分，例如从 https://app.koofr.net/dav/Koofr 提取 Koofr
          const pathMatch = this.config.url.match(/\/dav\/(.*)$/)
          const servicePath = pathMatch ? pathMatch[1] : ''
          webdavUrl = `/api/webdav-proxy?path=${encodeURIComponent(servicePath)}`
        } else {
          console.warn('代理模式当前仅支持Koofr WebDAV服务')
        }
      }

      this.client = createClient(webdavUrl, {
        username: this.config.username,
        password: this.config.password
      })

      console.log('WebDAV客户端初始化成功')
    } catch (error) {
      console.error('WebDAV客户端初始化失败:', error)
      throw new Error('WebDAV客户端初始化失败')
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.client) {
      throw new Error('WebDAV客户端未初始化')
    }

    try {
      await this.client.getDirectoryContents('/')
      return true
    } catch (error) {
      console.error('WebDAV连接测试失败:', error)
      return false
    }
  }

  async uploadData(trips: TripRecord[], aiConfig: AIConfig | null, travelerConfig: any = null): Promise<void> {
    if (!this.client) {
      throw new Error('WebDAV客户端未初始化')
    }

    const syncData: SyncData = {
      trips,
      aiConfig,
      travelerConfig,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }

    const fileName = 'simple-transport-sync.json'
    const content = JSON.stringify(syncData, null, 2)

    try {
      await this.client.putFileContents(fileName, content, {
        overwrite: true,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      })
    } catch (error) {
      console.error('数据上传失败:', error)
      throw new Error(`数据上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }


  async downloadData(): Promise<SyncData> {
    if (!this.client) {
      throw new Error('WebDAV客户端未初始化')
    }

    const fileName = 'simple-transport-sync.json'

    try {
      const content = await this.client.getFileContents(fileName, { format: 'text' })

      // 直接反序列化JSON
      const syncData: SyncData = JSON.parse(content as string)

      if (!syncData.trips || !Array.isArray(syncData.trips)) {
        throw new Error('同步数据格式不正确：缺少trips数组')
      }

      return syncData
    } catch (error) {
      console.error('数据下载失败:', error)
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error('远程同步文件不存在，请先上传数据')
      }
      throw new Error(`数据下载失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  async checkFileExists(): Promise<boolean> {
    if (!this.client) {
      throw new Error('WebDAV客户端未初始化')
    }

    const fileName = 'simple-transport-sync.json'

    try {
      await this.client.stat(fileName)
      return true
    } catch (error) {
      return false
    }
  }
}

export function getWebDAVConfig(): WebDAVConfig | null {
  try {
    const saved = localStorage.getItem('webdav_config')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.error('获取WebDAV配置失败:', error)
  }
  return null
}

export function saveWebDAVConfig(config: WebDAVConfig): void {
  try {
    localStorage.setItem('webdav_config', JSON.stringify(config))
  } catch (error) {
    console.error('保存WebDAV配置失败:', error)
    throw new Error('保存WebDAV配置失败')
  }
}

export function createWebDAVService(): WebDAVService | null {
  const config = getWebDAVConfig()
  if (!config || !config.enabled || !config.url || !config.username || !config.password) {
    return null
  }
  return new WebDAVService(config)
}