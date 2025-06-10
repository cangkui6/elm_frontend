import { createApp } from 'vue'; // Vue 3 的入口方法
import App from './App.vue';
// 路由
import router from './router';
// 字体库
import 'font-awesome/css/font-awesome.min.css';
// ajax封装好的库，专门用来发送异步请求
import axios from 'axios';
// qs 是一个用于序列化和反序列化查询字符串的库
import qs from 'qs';
// 通用的工具类，'./common.js'，多个方法，导入了对象
import {
	getCurDate,
	setSessionStorage,
	getSessionStorage,
	removeSessionStorage,
	setLocalStorage,
	getLocalStorage,
	removeLocalStorage,
} from './common.js';

// 创建 Vue 3 应用实例
const app = createApp(App);

// 配置 axios 的基础 URL
axios.defaults.baseURL = 'http://localhost:9000/';

// 将 axios 和 qs 挂载到全局实例上
app.config.globalProperties.$axios = axios;
app.config.globalProperties.$qs = qs;

// 将常用的工具方法挂载到全局实例上
app.config.globalProperties.$getCurDate = getCurDate;
app.config.globalProperties.$setSessionStorage = setSessionStorage;
app.config.globalProperties.$getSessionStorage = getSessionStorage;
app.config.globalProperties.$removeSessionStorage = removeSessionStorage;
app.config.globalProperties.$setLocalStorage = setLocalStorage;
app.config.globalProperties.$getLocalStorage = getLocalStorage;
app.config.globalProperties.$removeLocalStorage = removeLocalStorage;

// 配置全局路由守卫
router.beforeEach((to, from, next) => {
	const user = sessionStorage.getItem('user');
	// 除了登录、注册、首页、商家列表、商家信息之外，都需要判断是否登录
	if (
		!(
			to.path === '/' ||
			to.path === '/index' ||
			to.path === '/businessList' ||
			to.path === '/businessInfo' ||
			to.path === '/login' ||
			to.path === '/register'
		)
	) {
		if (user == null) {
			// 保存原始要去的路径，以便登录后跳回
			next({
				path: '/login',
				query: { redirect: to.fullPath }
			});
			return;
		}
	}
	next();
});

// 挂载路由和应用实例
app.use(router).mount('#app');
