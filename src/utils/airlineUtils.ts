// 航空公司图标工具函数

// 导入航空公司图标
import airChinaIcon from '@/assets/airlines/air_china.png'
import easternIcon from '@/assets/airlines/eastern.png'
import hainanIcon from '@/assets/airlines/hainan.png'
import hebeiIcon from '@/assets/airlines/hebei.png'
import southernIcon from '@/assets/airlines/southern.png'

// 航空公司图标映射
const AIRLINE_ICONS: Record<string, string> = {
  '中国国际航空': airChinaIcon,
  '国际航空': airChinaIcon,
  '中国东方航空': easternIcon,
  '东方航空': easternIcon,
  '海南航空': hainanIcon,
  '河北航空': hebeiIcon,
  '中国南方航空': southernIcon,
  '南方航空': southernIcon,
}

// 航空公司简称映射（作为fallback）
const AIRLINE_SHORTS: Record<string, string> = {
  '中国国际航空': '国',
  '国际航空': '国',
  '中国东方航空': '东',
  '东方航空': '东',
  '中国南方航空': '南',
  '南方航空': '南',
  '海南航空': '海',
  '深圳航空': '深',
  '四川航空': '川',
  '厦门航空': '厦',
  '春秋航空': '春',
  '吉祥航空': '吉',
  '山东航空': '鲁',
  '天津航空': '津',
  '首都航空': '首',
  '西部航空': '西',
  '祥鹏航空': '祥',
  '九元航空': '九',
  '联合航空': '联',
  '河北航空': '冀',
}

/**
 * 获取航空公司图标URL
 * @param airlineName 航空公司名称
 * @returns 图标URL或null（如果没有对应图标）
 */
export function getAirlineIcon(airlineName: string): string | null {
  if (!airlineName) return null
  
  // 直接匹配完整名称
  if (AIRLINE_ICONS[airlineName]) {
    return AIRLINE_ICONS[airlineName]
  }
  
  // 模糊匹配（包含关键字）- 优先匹配更具体的名称
  const sortedAirlines = Object.entries(AIRLINE_ICONS).sort((a, b) => b[0].length - a[0].length)
  for (const [airline, icon] of sortedAirlines) {
    if (airlineName.includes(airline)) {
      return icon
    }
  }
  
  return null
}

/**
 * 获取航空公司简称（用作fallback）
 * @param airlineName 航空公司名称
 * @returns 简称字符串
 */
export function getAirlineShort(airlineName: string): string {
  if (!airlineName) return '✈️'
  
  // 直接匹配完整名称
  if (AIRLINE_SHORTS[airlineName]) {
    return AIRLINE_SHORTS[airlineName]
  }
  
  // 模糊匹配 - 优先匹配更具体的名称
  const sortedShorts = Object.entries(AIRLINE_SHORTS).sort((a, b) => b[0].length - a[0].length)
  for (const [airline, shortName] of sortedShorts) {
    if (airlineName.includes(airline)) {
      return shortName
    }
  }
  
  // 如果没有匹配到，返回第一个汉字
  const firstChar = airlineName.charAt(0)
  if (/[\u4e00-\u9fff]/.test(firstChar)) {
    return firstChar
  }
  
  return '✈️'
}

/**
 * 获取航空公司颜色
 * @param airlineName 航空公司名称
 * @returns CSS颜色值
 */
export function getAirlineColor(airlineName?: string): string {
  if (!airlineName) return '#667eea'
  
  // 根据航空公司返回特定颜色
  const colorMap: Record<string, string> = {
    '中国国际航空': '#C8102E', // 国航红
    '国际航空': '#C8102E', // 国航红
    '中国东方航空': '#0066CC', // 东航蓝
    '东方航空': '#0066CC', // 东航蓝
    '中国南方航空': '#E60012', // 南航红
    '南方航空': '#E60012', // 南航红
    '海南航空': '#FFD700', // 海航金
    '河北航空': '#1E88E5', // 河北航空蓝
  }
  
  const sortedColors = Object.entries(colorMap).sort((a, b) => b[0].length - a[0].length)
  for (const [airline, color] of sortedColors) {
    if (airlineName.includes(airline)) {
      return color
    }
  }
  
  return '#667eea' // 默认颜色
}