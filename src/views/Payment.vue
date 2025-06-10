<template>
    <div class="wrapper">
			
			<!-- header部分 -->
			<header>
				<p>在线支付</p>
			</header>
			
			<!-- 订单信息部分 -->
			<h3>订单信息：</h3>
			<div class="order-info" v-if="orderArray && orderArray.business">
				<p>
					{{orderArray.business.businessName}}
				</p>
				<p>&#165;{{orderArray.orderTotal}}</p>
			</div>
			<div class="order-info" v-else>
				<p>加载中...</p>
				<p>&#165;0</p>
			</div>
			
			<!-- 订单明细部分 - 重新实现以避免访问未定义的属性 -->
			<div class="order-details-container">
				<ul class="order-detailet" v-if="orderArray.list && orderArray.list.length > 0">
					<template v-for="(foodItem, index) in orderArray.list" :key="index">
						<li v-if="foodItem && foodItem.food">
							<p>{{foodItem.food.foodName}} x {{foodItem.quantity}}</p>
							<p>&#165;{{(foodItem.food.foodPrice * foodItem.quantity).toFixed(0)}}</p>
						</li>
					</template>
					
					<li v-if="orderArray.business && orderArray.business.deliveryPrice">
						<p>配送费</p>
						<p>&#165;{{Number(orderArray.business.deliveryPrice).toFixed(0)}}</p>
					</li>
				</ul>
				<ul class="order-detailet" v-else>
					<li><p>加载明细中...</p></li>
				</ul>
			</div>
			
			<!-- 支付方式部分 -->
			<ul class="payment-type">
				<li @click="selectPayment('wechat')">
					<img src="../assets/wechat.png">
					<i class="fa fa-check-circle" v-if="paymentMethod === 'wechat'"></i>
				</li>
				<li @click="selectPayment('alipay')">
					<img src="../assets/alipay.png">
					<i class="fa fa-check-circle" v-if="paymentMethod === 'alipay'"></i>
				</li>
			</ul>
			<div class="payment-button">
				<button @click="confirmPayment()">确认支付</button>
			</div>
			
			 <!-- 底部菜单部分 -->
	        <Footer></Footer>
		</div>	
</template>
<script>
import Footer from '../components/Footer.vue'
export default {
    data() {
        return {
            // 获取query参数
				orderId:this.$route.query.orderId,
				orderArray:{
					business:{},
					list:[],
					orderTotal: 0
				},
                user:{},
				loading: true,
				paymentMethod: 'wechat' // 默认选择微信支付
				
        }
    },
    created() {
        this.user = this.$getSessionStorage('user');
		// 确保orderId存在
        if (!this.orderId) {
            console.error("订单ID不存在");
            alert("订单ID不存在，无法加载订单信息");
            return;
        }
        
        console.log("获取订单信息，orderId:", this.orderId);
        
		this.$axios.post('/order/getOrdersById',this.$qs.stringify({
                orderId:this.orderId
            })).then(response =>{
				console.log("订单详情响应:", response.data);
				if(response.data.code === 200 && response.data.data){
					// 确保数据结构正确
					const responseData = response.data.data;
					
					// 初始化对象结构，防止属性未定义
					this.orderArray = {
						orderId: responseData.orderId || 0,
						orderDate: responseData.orderDate || '',
						orderTotal: responseData.orderTotal || 0,
						orderState: responseData.orderState || 0,
						business: responseData.business || { 
							businessId: 0,
							businessName: '未知商家',
							deliveryPrice: 0
						},
						list: Array.isArray(responseData.list) ? responseData.list : []
					};
					
					this.loading = false;
					
					// 打印订单明细信息以便调试
					if(this.orderArray.list && this.orderArray.list.length > 0) {
						console.log("订单包含食品项:", this.orderArray.list.length);
						this.orderArray.list.forEach((foodItem, index) => {
							console.log(`食品${index+1}:`, 
								foodItem && foodItem.food ? foodItem.food.foodName : '无食品信息', 
								"数量:", foodItem ? foodItem.quantity : 0);
						});
					} else {
						console.log("订单不包含食品项");
					}
				}else{
					console.error("查询订单信息失败！", response.data.msg);
					alert("获取订单信息失败");
				}
            }).catch(error =>{
                console.error("API请求错误:", error);
				this.loading = false;
                alert("获取订单信息失败，请重试");
            });
    },
    methods: {
		selectPayment(method) {
			this.paymentMethod = method;
			console.log("选择支付方式:", method);
		},
		confirmPayment() {
			// 显示支付方式信息
			let paymentMethodName = this.paymentMethod === 'wechat' ? '微信支付' : '支付宝';
			console.log(`使用${paymentMethodName}支付订单:`, this.orderId);
			
			this.$axios.put('/order/updateOrderState', this.$qs.stringify({
				orderId: this.orderId,
				orderState: 1  // 1表示已支付
			})).then(response => {
				console.log("支付响应:", response.data);
				if (response.data.code === 200) {
					// 支付成功
					alert(`${paymentMethodName}支付成功！`);
					// 跳转到订单列表
					this.$router.push({
						path: '/orderlist'
					});
				} else {
					alert("支付失败：" + response.data.msg);
				}
			}).catch(error => {
				console.error("支付请求错误:", error);
				alert("支付请求失败，请重试");
			});
		}
    },
	components:{
		Footer
	}
	
}
</script>
<style scoped>
/****************** 总容器 ******************/
.wrapper{
	width: 100%;
	height: 100%;
}

/****************** header部分 ******************/
.wrapper header{
	width: 100%;
	height: 12vw;
	background-color: #0097FF;
	color: #fff;
	font-size: 4.8vw;
	
	position: fixed;
	left: 0;
	top: 0;
	z-index: 1000;
	
	display: flex;
	justify-content: center;
	align-items: center;
}

/****************** 订单信息部分 ******************/
.wrapper h3{
	margin-top: 12vw;
	box-sizing: border-box;
	padding: 4vw 4vw 0;
	
	font-size: 4vw;
	font-weight: 300;
	color: #999;
}
.wrapper .order-info{
	box-sizing: border-box;
	padding: 4vw;
	font-size: 4vw;
	color: #666;
	
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.wrapper .order-info p{
	margin: 0;
	padding: 0;
}
.wrapper .order-info p:last-child{
	color: orangered;
	text-align: right;
}

/****************** 订单明细部分 ******************/
.order-details-container {
	width: 100%;
	padding: 0 4vw;
	box-sizing: border-box;
}
.wrapper .order-detailet{
	width: 100%;
}
.wrapper .order-detailet li{
	width: 100%;
	box-sizing: border-box;
	padding: 1vw 0;
	
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.wrapper .order-detailet li p{
	font-size: 3vw;
	color: #666;
	margin: 0;
	padding: 0.5vw 0;
}
.wrapper .order-detailet li p:first-child {
	max-width: 70%;
	text-align: left;
}
.wrapper .order-detailet li p:last-child {
	min-width: 20%;
	text-align: right;
}

/****************** 支付方式部分 ******************/
.wrapper .payment-type{
	width: 100%;
	margin-top: 4vw;
}
.wrapper .payment-type li{
	width: 100%;
	box-sizing: border-box;
	padding: 4vw;
	
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.wrapper .payment-type li img{
	width: 33vw;
	height: 8.9vw;
}
.wrapper .payment-type li .fa-check-circle{
	font-size: 5vw;
	color: #38CA73;
}
.wrapper .payment-button{
	width: 100%;
	box-sizing: border-box;
	padding: 4vw;
}
.wrapper .payment-button button{
	width: 100%;
	height: 10vw;
	border: none;
	/*去掉外轮廓线*/
	outline: none;
	border-radius: 4px;
	background-color: #38CA73;
	color: #fff;
}
/****************** 底部菜单部分 ******************/
.wrapper .footer{
	width: 100%;
	height: 14vw;
	border-top: solid 1px #DDD;
	background-color: #fff;
	
	position: fixed;
	left: 0;
	bottom: 0;
	
	display: flex;
	justify-content: space-around;
	align-items: center;
}
.wrapper .footer li{
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	
	color: #999;
	user-select: none;
	cursor: pointer;
}
.wrapper .footer li p{
	font-size: 2.8vw;
}
.wrapper .footer li i{
	font-size: 5vw;
}
</style>