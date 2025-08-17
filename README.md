# 出行记录工具

一个记录火车和飞机出行信息的现代化Web应用。

## 功能特性

- 🚄 **多交通工具支持**: 火车票、飞机票信息记录
- 📱 **移动端优先**: 响应式设计，主要面向手机用户
- 💾 **本地存储**: 基于浏览器本地存储，支持离线使用
- 📊 **数据统计**: 出行费用、频次等统计分析

## 技术栈

- **前端框架**: Vue.js 3 + TypeScript
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **样式**: TailwindCSS
- **构建工具**: Vite
- **代码规范**: ESLint + Prettier

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 代码检查
npm run lint

# 格式化代码
npm run format
```

## 项目结构

```
src/
├── components/         # UI组件
│   ├── TripCard.vue   # 出行卡片组件
│   └── BottomNavigation.vue # 底部导航
├── views/             # 页面组件
│   ├── HomeView.vue   # 首页
│   ├── AddView.vue    # 添加页面
│   └── StatisticsView.vue # 统计页面
├── stores/            # Pinia状态管理
│   └── trips.ts       # 出行数据管理
├── types/             # TypeScript类型定义
│   └── index.ts
├── router/            # 路由配置
│   └── index.ts
└── main.ts           # 应用入口
```

## 数据结构

```typescript
interface TripRecord {
  id: string
  type: 'flight' | 'train'
  date: string
  departure: {
    time: string
    city: string
    station: string
  }
  arrival: {
    time: string
    city: string
    station: string
  }
  price: number
  status: 'used' | 'unused'
  createdAt: string
}
```

## 部署

项目支持部署到Vercel等静态托管平台。

## 开发计划

- [ ] AI智能识别票据功能
- [ ] WebDAV云同步
- [ ] PWA支持
- [ ] 主题切换
- [ ] 数据导入导出