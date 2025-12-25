import type { AIConfig, TripRecord } from '@/types'

// JSON Schema定义多张票据信息结构
// 时间自动填充函数：当只有出行时间或到达时间时，将另一个时间自动填充为相同的时间
function autoFillMissingTime(ticket: any): any {
  const departureTime = ticket.departure?.time
  const arrivalTime = ticket.arrival?.time
  
  // 如果出发时间存在但到达时间不存在，用出发时间填充到达时间
  if (departureTime && !arrivalTime) {
    console.log('🔄 自动填充到达时间:', departureTime)
    if (ticket.arrival) {
      ticket.arrival.time = departureTime
    }
  }
  
  // 如果到达时间存在但出发时间不存在，用到达时间填充出发时间
  if (arrivalTime && !departureTime) {
    console.log('🔄 自动填充出发时间:', arrivalTime)
    if (ticket.departure) {
      ticket.departure.time = arrivalTime
    }
  }
  
  return ticket
}

export const ticketsSchema = {
  type: "object",
  properties: {
    tickets: {
      type: "array",
      description: "识别到的票据列表，可能包含多张票",
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["flight", "train"],
            description: "交通工具类型：flight(飞机) 或 train(火车)"
          },
          departure: {
            type: "object",
            properties: {
              time: {
                type: "string",
                description: "出发时间，格式: YYYY-MM-DDTHH:mm，如果无法识别可为空字符串"
              },
              city: {
                type: "string", 
                description: "出发城市名称"
              },
              station: {
                type: "string",
                description: "出发站点（机场或火车站），如果无法识别可为空字符串"
              }
            },
            required: ["time", "city", "station"]
          },
          arrival: {
            type: "object",
            properties: {
              time: {
                type: "string",
                description: "到达时间，格式: YYYY-MM-DDTHH:mm，如果无法识别可为空字符串"
              },
              city: {
                type: "string",
                description: "到达城市名称"
              },
              station: {
                type: "string", 
                description: "到达站点（机场或火车站），如果无法识别可为空字符串"
              }
            },
            required: ["time", "city", "station"]
          },
          price: {
            type: "number",
            description: "票价（人民币，单位：元），如果无法识别可设为0"
          },
          airline: {
            type: "string",
            description: "航空公司或铁路公司名称，如果无法识别可为空字符串"
          },
          flightNumber: {
            type: "string", 
            description: "航班号或车次号，如果无法识别可为空字符串"
          }
        },
        required: ["type", "departure", "arrival"]
      },
      minItems: 1
    }
  },
  required: ["tickets"]
}

export class AIService {
  private config: AIConfig

  constructor(config: AIConfig) {
    this.config = config
  }

  // 从图片识别票据信息（支持多张票）
  async recognizeTickets(imageBase64: string): Promise<Partial<TripRecord>[]> {
    console.log('🤖 AI识别开始:', {
      configUrl: this.config.baseUrl,
      model: this.config.model,
      imageSize: imageBase64.length
    })

    try {
      const currentYear = new Date().getFullYear()
      const messages = [
        {
          role: "system",
          content: `你是一个专业的票据识别助手。请分析用户上传的火车票或飞机票图片，提取关键信息。图片中可能包含一张或多张票据。

请严格按照以下JSON Schema格式返回：
${JSON.stringify(ticketsSchema, null, 2)}

注意事项：
1. 时间格式必须是 YYYY-MM-DDTHH:mm，如果无法识别时间则填空字符串""
2. 城市名称要标准化（如"北京"而不是"北京市"）
3. 价格转换为数字，单位为人民币元，无法识别时填0
4. 如果是火车票，type为"train"；飞机票为"flight"
5. 航站楼、机场、价格等信息如果图片中没有或无法识别，可以填空字符串或0
6. 如果图片中有多张票，请都识别出来放在tickets数组中
7. 只返回JSON数据，不要其他解释文字
8. 当前年份为 ${currentYear}，如果原始信息中没有年份，请使用这个年份`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "请识别这张图片中所有票据的信息，可能有多张票："
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: "high"
              }
            }
          ]
        }
      ]

      console.log('🚀 发送API请求:', {
        url: `${this.config.baseUrl}/chat/completions`,
        model: this.config.model
      })

      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          max_tokens: 2000,
          temperature: 0.1,
          response_format: {
            type: "json_object"
          }
        })
      })

      console.log('📡 API响应状态:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API请求失败:', errorText)
        throw new Error(`API请求失败: ${response.status} ${response.statusText}\n${errorText}`)
      }

      const result = await response.json()
      console.log('📄 API原始响应:', JSON.stringify(result, null, 2))

      if (!result.choices || !result.choices[0]?.message?.content) {
        throw new Error('API响应格式错误：缺少content内容')
      }

      const content = result.choices[0].message.content
      console.log('🎯 AI识别内容:', content)

      try {
        const ticketsData = JSON.parse(content)
        console.log('✅ JSON解析成功:', JSON.stringify(ticketsData, null, 2))

        if (!ticketsData.tickets || !Array.isArray(ticketsData.tickets)) {
          throw new Error('返回数据格式错误：缺少tickets数组')
        }

        // 转换为TripRecord格式数组
        const tripRecords: Partial<TripRecord>[] = ticketsData.tickets.map((ticket: any, index: number) => {
          console.log(`🎫 处理第${index + 1}张票据:`, ticket)

          // 应用时间自动填充逻辑  
          const processedTicket = autoFillMissingTime(ticket)

          const tripRecord: Partial<TripRecord> = {
            type: processedTicket.type || 'train',
            date: processedTicket.departure?.time ? processedTicket.departure.time.split('T')[0] : new Date().toISOString().split('T')[0],
            departure: {
              time: processedTicket.departure?.time || '',
              city: processedTicket.departure?.city || '',
              station: processedTicket.departure?.station || ''
            },
            arrival: {
              time: processedTicket.arrival?.time || '',
              city: processedTicket.arrival?.city || '',
              station: processedTicket.arrival?.station || ''
            },
            price: processedTicket.price || 0,
            airline: processedTicket.airline || '',
            flightNumber: processedTicket.flightNumber || '',
            travelers: ['我'] // AI录入默认出行人为"我"
          }

          return tripRecord
        })

        console.log(`🎉 最终识别结果 (${tripRecords.length}张票):`, JSON.stringify(tripRecords, null, 2))
        return tripRecords

      } catch (parseError) {
        console.error('❌ JSON解析失败:', parseError)
        console.log('📝 原始内容:', content)
        throw new Error(`AI返回的JSON格式无效: ${parseError instanceof Error ? parseError.message : '未知错误'}`)
      }

    } catch (error) {
      console.error('💥 AI识别服务错误:', error)
      throw error
    }
  }

  // 保持向后兼容的单张票识别方法
  async recognizeTicket(imageBase64: string): Promise<Partial<TripRecord>> {
    const tickets = await this.recognizeTickets(imageBase64)
    return tickets[0] || {}
  }

  // 从文字内容识别票据信息（支持多张票）
  async recognizeTicketsFromText(textContent: string): Promise<Partial<TripRecord>[]> {
    console.log('🤖 AI文字识别开始:', {
      configUrl: this.config.baseUrl,
      model: this.config.model,
      textLength: textContent.length
    })

    try {
      const currentYear = new Date().getFullYear()
      const messages = [
        {
          role: "system",
          content: `你是一个专业的票据信息识别助手。请分析用户提供的文字内容，提取火车票或飞机票的关键信息。文字中可能包含一张或多张票据的信息。

请严格按照以下JSON Schema格式返回：
${JSON.stringify(ticketsSchema, null, 2)}

注意事项：
1. 时间格式必须是 YYYY-MM-DDTHH:mm，如果无法识别时间则填空字符串""
2. 城市名称要标准化（如"北京"而不是"北京市"）
3. 价格转换为数字，单位为人民币元，无法识别时填0
4. 如果是火车票，type为"train"；飞机票为"flight"
5. 航站楼、机场、价格等信息如果文字中没有或无法识别，可以填空字符串或0
6. 如果文字中有多张票的信息，请都识别出来放在tickets数组中
7. 只返回JSON数据，不要其他解释文字
8. 请仔细分析文字中的时间、地点、价格等信息，尽可能准确提取
9. 当前年份为 ${currentYear}，如果原始信息中没有年份，请使用这个年份`
        },
        {
          role: "user",
          content: `请识别以下文字中的票据信息，可能有多张票：

${textContent}`
        }
      ]

      console.log('🚀 发送API请求:', {
        url: `${this.config.baseUrl}/chat/completions`,
        model: this.config.model
      })

      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          max_tokens: 2000,
          temperature: 0.1,
          response_format: {
            type: "json_object"
          }
        })
      })

      console.log('📡 API响应状态:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API请求失败:', errorText)
        throw new Error(`API请求失败: ${response.status} ${response.statusText}\n${errorText}`)
      }

      const result = await response.json()
      console.log('📄 API原始响应:', JSON.stringify(result, null, 2))

      if (!result.choices || !result.choices[0]?.message?.content) {
        throw new Error('API响应格式错误：缺少content内容')
      }

      const content = result.choices[0].message.content
      console.log('🎯 AI识别内容:', content)

      try {
        const ticketsData = JSON.parse(content)
        console.log('✅ JSON解析成功:', JSON.stringify(ticketsData, null, 2))

        if (!ticketsData.tickets || !Array.isArray(ticketsData.tickets)) {
          throw new Error('返回数据格式错误：缺少tickets数组')
        }

        // 转换为TripRecord格式数组
        const tripRecords: Partial<TripRecord>[] = ticketsData.tickets.map((ticket: any, index: number) => {
          console.log(`🎫 处理第${index + 1}张票据:`, ticket)

          // 应用时间自动填充逻辑  
          const processedTicket = autoFillMissingTime(ticket)

          const tripRecord: Partial<TripRecord> = {
            type: processedTicket.type || 'train',
            date: processedTicket.departure?.time ? processedTicket.departure.time.split('T')[0] : new Date().toISOString().split('T')[0],
            departure: {
              time: processedTicket.departure?.time || '',
              city: processedTicket.departure?.city || '',
              station: processedTicket.departure?.station || ''
            },
            arrival: {
              time: processedTicket.arrival?.time || '',
              city: processedTicket.arrival?.city || '',
              station: processedTicket.arrival?.station || ''
            },
            price: processedTicket.price || 0,
            airline: processedTicket.airline || '',
            flightNumber: processedTicket.flightNumber || '',
            travelers: ['我'] // AI录入默认出行人为"我"
          }

          return tripRecord
        })

        console.log(`🎉 最终识别结果 (${tripRecords.length}张票):`, JSON.stringify(tripRecords, null, 2))
        return tripRecords

      } catch (parseError) {
        console.error('❌ JSON解析失败:', parseError)
        console.log('📝 原始内容:', content)
        throw new Error(`AI返回的JSON格式无效: ${parseError instanceof Error ? parseError.message : '未知错误'}`)
      }

    } catch (error) {
      console.error('💥 AI文字识别服务错误:', error)
      throw error
    }
  }

  // 测试API连接
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 测试AI服务连接:', this.config.baseUrl)
      
      const response = await fetch(`${this.config.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('🔗 连接测试响应:', response.status)
      return response.ok
    } catch (error) {
      console.error('❌ 连接测试失败:', error)
      return false
    }
  }
}

// 获取AI配置
export function getAIConfig(): AIConfig | null {
  try {
    const saved = localStorage.getItem('ai_config')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.error('获取AI配置失败:', error)
  }
  return null
}

// 创建AI服务实例
export function createAIService(): AIService | null {
  const config = getAIConfig()
  if (!config || !config.baseUrl || !config.model || !config.token) {
    return null
  }
  return new AIService(config)
}