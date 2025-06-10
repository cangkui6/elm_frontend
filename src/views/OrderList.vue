<template>
    <div class="wrapper">
			
			<!-- header部分 -->
			<header>
				<p>我的订单</p>
			</header>
			
			<!-- 订单列表部分 -->
			<h3>未支付订单信息：</h3>
			<ul class="order" v-if="unpaidOrders.length > 0">
				<li v-for="(order, index) in unpaidOrders" :key="'unpaid-'+order.orderId">
					<div class="order-info">
						<p>
							{{order.business?.businessName}}
							<i class="fa fa-caret-down" @click="viewif(order)"></i>
						</p>
						<div class="order-info-right">
							<p>&#165;{{calculateTotal(order)}}</p>
							<div class="order-info-right-icon" @click="topayment(order.orderId)">去支付</div>
						</div>
					</div>
					<ul class="order-detailet" v-show="order.view">
						<li v-for="(detail, idx) in getOrderDetails(order)" :key="idx">
							<p>{{detail.food?.foodName}} x {{detail.quantity}}</p>
							<p>&#165;{{detail.food?.foodPrice}}</p>
						</li>
						
						<li>
							<p>配送费</p>
							<p>&#165;{{order.business?.deliveryPrice || 0}}</p>
						</li>
					</ul>
				</li>
			</ul>
			<div v-else class="empty-message">暂无未支付订单</div>
			
			<h3>已支付订单信息：</h3>
			<ul class="order" v-if="paidOrders.length > 0">
				<li v-for="(order, index) in paidOrders" :key="'paid-'+order.orderId">
					<div class="order-info">
						<p>
							{{order.business?.businessName}}
							<i class="fa fa-caret-down" @click="viewif(order)"></i>
						</p>
						<div class="order-info-right">
							<p>&#165;{{calculateTotal(order)}}</p>
						</div>
					</div>
					<ul class="order-detailet" v-show="order.view">
						<li v-for="(detail, idx) in getOrderDetails(order)" :key="idx">
							<p>{{detail.food?.foodName}} x {{detail.quantity}}</p>
							<p>&#165;{{detail.food?.foodPrice}}</p>
						</li>
						<li>
							<p>配送费</p>
							<p>&#165;{{order.business?.deliveryPrice || 0}}</p>
						</li>
					</ul>
				</li>
			</ul>
			<div v-else class="empty-message">暂无已支付订单</div>
			
			<!-- 底部菜单部分 -->
	        <Footer></Footer>
			
		</div>	
</template>
<script>

import Footer from '../components/Footer.vue'

export default {
    data() {
        return {
            OrdersArray:[],
            user:{},
        }
    },
    computed: {
        // 获取未支付订单列表
        unpaidOrders() {
            return this.OrdersArray.filter(order => order && order.orderState === 0);
        },
        // 获取已支付订单列表
        paidOrders() {
            return this.OrdersArray.filter(order => order && order.orderState === 1);
        }
    },
    created() {
        this.user = this.$getSessionStorage('user');
		console.log("当前用户信息:", this.user);

        if (this.user && this.user.userId) {
            this.$axios.post('/order/listOrdersByUserId',this.$qs.stringify({
                userId:this.user.userId
            })).then(response=>{
                console.log("订单列表API返回原始数据:", response);
                if(response.data != null){
                    // 检查response.data是否有code和data字段（ResponseResult格式）
                    if(response.data.code === 200 && response.data.data) {
                        this.OrdersArray = response.data.data;
                    } else {
                        // 兼容直接返回数组的情况
                        this.OrdersArray = Array.isArray(response.data) ? response.data : [];
                    }
                    
                    console.log("处理后的订单数组:", this.OrdersArray);
                    
                    // 初始化每个订单的view属性和确保list属性存在
                    this.OrdersArray.forEach((order, index) => {
                        if (order) {
                            console.log(`订单[${index}]信息:`, {
                                orderId: order.orderId,
                                orderState: order.orderState,
                                hasBusiness: !!order.business,
                                businessName: order.business?.businessName,
                                hasDetailList: !!order.orderDetailList,
                                hasList: !!order.list,
                                detailCount: this.getOrderDetails(order).length
                            });
                            
                            // 确保每个订单都有view属性
                            order.view = false;
                        }
                    });
                }
            }).catch(error=>{
                console.log("获取订单列表出错:", error);
            });
        } else {
            console.error('User or userId is undefined');
        }
    },
    methods: {
        // 获取订单明细，优先使用list，其次使用orderDetailList
        getOrderDetails(order) {
            if (!order) return [];
            return order.list || order.orderDetailList || [];
        },
        // 计算订单总价（含配送费）
        calculateTotal(order) {
            if (!order) return 0;
            return order.orderTotal;
        },
		viewif(order) {
            if (order) {
                console.log("切换订单详情显示状态:", {
                    orderId: order.orderId,
                    currentViewState: order.view,
                    detailsLength: this.getOrderDetails(order).length
                });
			    order.view = !order.view;
            }
		},
        topayment(orderId){
            if (orderId) {
                this.$router.push({
                    path:'/payment',
                    query:{
                        orderId: orderId
                    }
                });
            }
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
	overflow-y: auto;
	padding-bottom: 15vw; /* 增加底部间距，避免被底部菜单遮挡 */
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

/****************** 历史订单列表部分 ******************/
.wrapper h3{
	margin-top: 12vw;
	box-sizing: border-box;
	padding: 4vw;
	font-size: 4vw;
	font-weight: 300;
	color: #999;
}
.wrapper .order{
	width: 100%;
	margin-bottom: 10vw; /* 添加底部间距 */
}
.wrapper .order li{
	width: 100%;
	margin-bottom: 2vw; /* 每个订单之间添加间距 */
}
.wrapper .order li .order-info{
	box-sizing: border-box;
	padding: 2vw 4vw;
	font-size: 4vw;
	color: #666;
	
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.wrapper .order li .order-info .order-info-right{
	display: flex;
}
.wrapper .order li .order-info .order-info-right .order-info-right-icon{
	background-color: #f90;
	color: #fff;
	border-radius: 3px;
	margin-left: 2vw;
	user-select: none;
	cursor: pointer;
	padding: 0.5vw 1vw; /* 增加按钮内边距 */
}

.wrapper .order li .order-detailet{
	width: 100%;
}
.wrapper .order li .order-detailet li{
	width: 100%;
	box-sizing: border-box;
	padding: 1vw 4vw;
	color: #666;
	font-size: 3vw;
	margin-bottom: 0; /* 重置详情项间距 */
	
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.empty-message {
    text-align: center;
    padding: 20px;
    color: #999;
    font-size: 14px;
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
	z-index: 1000; /* 确保底部菜单在上层 */
	
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