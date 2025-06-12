# ELM Client - Vue Frontend

## 前后端整合说明

前端已经更新为通过 consumer-service 微服务与后端通信，主要变更如下：

### 1. 基础配置变更

- 修改了 API 基础路径: `axios.defaults.baseURL = 'http://localhost:9000/consumer/'`
- 所有 API 请求现在都通过统一的 consumer-service 层进行

### 2. 主要接口变更

| 功能 | 旧接口 | 新接口 |
|-----|--------|-------|
| 用户登录 | `/user/getUserById` + `/user/getUserByIdByPass` | `login` |
| 获取商家列表 | `/business/listBusinessByOrderTypeId` | `businesses` |
| 获取商家详情及食品 | `/business/getBusinessById` + `/food/listFoodByBusinessId` | `business/{businessId}` |
| 获取购物车 | `/cart/listCart` | `cart` |
| 添加商品到购物车 | `/cart/saveCart` | `cart/add` |
| 获取地址列表 | `/deliveryAddress/listDeliveryAddressByUserId` | `addresses` |
| 创建订单 | `/order/createOrders` | `order/create` |

### 3. 统一使用的返回格式

所有接口都使用标准的响应格式：
```
{
  "code": 200,  // 成功状态码
  "msg": "success",
  "data": {...}  // 具体数据
}
```

### 4. 其他优化

- 移除了多个独立的微服务调用
- 统一了参数传递格式
- 简化了错误处理逻辑

## 启动项目

```
npm install
npm run serve
```

访问: http://localhost:8081
