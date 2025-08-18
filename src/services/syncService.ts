import { useTripsStore } from '@/stores/trips'
import { createWebDAVService } from './webdavService'
import { getAIConfig } from './aiService'
import type { SyncData } from '@/types'

export class SyncService {
  private getWebdavService() {
    return createWebDAVService()
  }

  async uploadToWebDAV(): Promise<void> {
    const webdavService = this.getWebdavService()
    if (!webdavService) {
      throw new Error('WebDAV服务未配置或未启用')
    }

    const tripsStore = useTripsStore()
    const aiConfig = getAIConfig()

    console.log('开始上传数据到WebDAV...')
    
    try {
      await webdavService.uploadData(tripsStore.trips, aiConfig)
      console.log('数据上传成功')
    } catch (error) {
      console.error('上传失败:', error)
      throw error
    }
  }

  async downloadFromWebDAV(): Promise<void> {
    const webdavService = this.getWebdavService()
    if (!webdavService) {
      throw new Error('WebDAV服务未配置或未启用')
    }

    console.log('开始从WebDAV下载数据...')

    try {
      const syncData: SyncData = await webdavService.downloadData()
      
      this.applySyncData(syncData)
      console.log('数据下载并应用成功')
    } catch (error) {
      console.error('下载失败:', error)
      throw error
    }
  }

  private applySyncData(syncData: SyncData): void {
    const tripsStore = useTripsStore()

    if (syncData.trips && Array.isArray(syncData.trips)) {
      tripsStore.trips = syncData.trips
      tripsStore.saveToStorage()
      console.log(`已恢复 ${syncData.trips.length} 条出行记录`)
    }

    if (syncData.aiConfig) {
      localStorage.setItem('ai_config', JSON.stringify(syncData.aiConfig))
      console.log('已恢复AI配置')
    }
  }

  async testWebDAVConnection(): Promise<boolean> {
    const webdavService = this.getWebdavService()
    if (!webdavService) {
      throw new Error('WebDAV服务未配置或未启用')
    }

    return await webdavService.testConnection()
  }

  async checkRemoteFile(): Promise<boolean> {
    const webdavService = this.getWebdavService()
    if (!webdavService) {
      return false
    }

    return await webdavService.checkFileExists()
  }

  isWebDAVConfigured(): boolean {
    return this.getWebdavService() !== null
  }
}

export function createSyncService(): SyncService {
  return new SyncService()
}