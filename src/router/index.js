import { createRouter, createWebHashHistory } from 'vue-router'; // 改为hash模式
import Index from '../views/Index.vue';
import BusinessList from '../views/BusinessList.vue';
import BusinessInfo from '../views/BusinessInfo.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Order from '../views/Order.vue';
import UserAddress from '../views/UserAddress.vue';
import EditUserAddress from '../views/EditUserAddress.vue';
import AddUserAddress from '../views/AddUserAddress.vue';
import Payment from '../views/Payment.vue';
import OrderList from '../views/OrderList.vue';
import CircuitBreakerFallback from '../components/CircuitBreakerFallback.vue';

// 路由配置数组
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Index,
  },
  {
    path: '/index',
    name: 'Index',
    component: Index,
  },
  {
    path: '/businessList',
    name: 'BusinessList',
    component: BusinessList,
  },
  {
    path: '/businessInfo',
    name: 'BusinessInfo',
    component: BusinessInfo,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
  },
  {
    path: '/order',
    name: 'Order',
    component: Order,
  },
  {
    path: '/edituseraddress',
    name: 'EditUserAddress',
    component: EditUserAddress,
  },
  {
    path: '/useraddress',
    name: 'UserAddress',
    component: UserAddress,
  },
  {
    path: '/adduseraddress',
    name: 'AddUserAddress',
    component: AddUserAddress,
  },
  {
    path: '/payment',
    name: 'Payment',
    component: Payment,
  },
  {
    path: '/orderlist',
    name: 'OrderList',
    component: OrderList,
  },
  {
    path: '/fallback',
    name: 'CircuitBreakerFallback',
    component: CircuitBreakerFallback,
  },
];

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(), // 使用hash模式
  routes,
});

// 修复 Vue Router 4 中重复路由报错问题
const originalPush = router.push;
router.push = function push(location) {
  return originalPush.call(this, location).catch((error) => error);
};

export default router;
