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
  createdAt: string
}
```

## 部署

### Vercel 部署

项目已配置好Vercel部署，支持以下方式：

#### 方法一：通过Vercel CLI部署

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel账户
vercel login

# 在项目根目录执行部署
vercel

# 生产环境部署
vercel --prod
```

#### 方法二：通过GitHub集成

1. 将项目推送到GitHub仓库
2. 在 [Vercel Dashboard](https://vercel.com/dashboard) 点击 "New Project"
3. 选择你的GitHub仓库
4. Vercel会自动检测项目配置并部署

#### 配置说明

项目包含 `vercel.json` 配置文件，包含以下设置：
- **构建命令**: `npm run build`
- **输出目录**: `dist`
- **框架检测**: Vite
- **路由重写**: SPA路由支持

#### 环境变量

如果需要配置环境变量，可在Vercel Dashboard的项目设置中添加。

#### 自定义域名

部署成功后可在Vercel Dashboard中配置自定义域名。

## 开发计划

- [x] AI智能识别票据功能
- [x] WebDAV云同步
- [ ] PWA支持
- [ ] 主题切换
- [ ] 数据导入导出