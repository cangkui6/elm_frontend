<template>
	<div class="wrapper">

		<!-- header部分 -->
		<header>
			<p>地址管理</p>
		</header>

		<!-- 地址列表部分 -->
		<ul class="addresslist">
			
			<li v-for="(item,index) in deliveryAddressArray" @click="toUserAddress(index)">
				<div class="addresslist-left">
					<h3>{{item.contactName}} {{item.contactSex}} {{item.contactTel}}</h3>
					<p>{{item.address}}</p>
				</div>
				<div class="addresslist-right">
					<i class="fa fa-edit" @click.stop="edit(index)"></i>
					<i class="fa fa-remove" @click.stop="remove(index)"></i>
				</div>
			</li>
		</ul>

		<!-- 新增地址部分 -->
		<div class="addbtn" @click="add()">
			<i class="fa fa-plus-circle"></i>
			<p>新增收货地址</p>
		</div>

	</div>
</template>

<script>
export default{
	data() {
		return {
			businessId:this.$route.query.businessId,
			user:{},
			deliveryAddressArray:[],
			
		}
	},
	created() {
		this.user = this.$getSessionStorage('user');
		// 使用consumer服务获取地址列表
		this.$axios.get('addresses', {
			params: {
				userId: this.user.userId
			}
		}).then(response => {
			console.log("地址列表响应:", response.data);
			if(response.data.code === 200){
				// 如果请求成功从后台获取到数据
				this.deliveryAddressArray = response.data.data;
				console.log("地址列表数据:", this.deliveryAddressArray);
				for(let item of this.deliveryAddressArray){
					if(item.contactSex == '0'){
						item.contactSex = '女士'
					}else{
						item.contactSex = '先生'
					}
				}
			}else{
				console.log("获取用户所属送货地址失败！")
			}
		}).catch(error => {
			console.error(error);
		});
	},
	methods: {
		edit(index){
			console.log("编辑按钮被点击, index:", index);
			try {
				this.$router.push({
					path:'/edituseraddress',
					query:{
						daId:this.deliveryAddressArray[index].daId,
						contactSex:this.deliveryAddressArray[index].contactSex,
						contactName:this.deliveryAddressArray[index].contactName,
						contactTel:this.deliveryAddressArray[index].contactTel,
						address:this.deliveryAddressArray[index].address,
					}
				});
			} catch (error) {
				console.error("路由跳转错误:", error);
			}
		},
		remove(index) {
			this.$axios.delete('/deliveryAddress/removeDeliveryAddress', {
				params: {
					daId: this.deliveryAddressArray[index].daId
				}
			}).then(response => {
				console.log("删除地址响应:", response.data);
				if (response.data.code === 200) {
					// 如果请求成功表明删除该条记录成功
					alert("删除地址成功！");
					// 从数组中删除对应的地址记录
					this.deliveryAddressArray.splice(index, 1);
				} else {
					alert("删除地址失败：" + response.data.msg);
				}
			}).catch(error => {
				console.error(error);
				alert("删除地址请求失败，请重试");
			});
		},
		add(){
			this.$router.push({
				path:'/adduseraddress'
			})
		},
		
		toUserAddress(index){
			console.log(this.businessId)
					// console.log(this.deliveryAddressArray[index].daId)
					// console.log(this.deliveryAddressArray[index].contactSex)
					// console.log(this.deliveryAddressArray[index].contactName)
					// console.log(this.deliveryAddressArray[index].contactTel)
					// console.log(this.deliveryAddressArray[index].address)
			this.$router.push({
				
				path:'/order',
				query:{
					
					daId:this.deliveryAddressArray[index].daId,
					contactSex:this.deliveryAddressArray[index].contactSex,
					contactName:this.deliveryAddressArray[index].contactName,
					contactTel:this.deliveryAddressArray[index].contactTel,
					address:this.deliveryAddressArray[index].address,
					businessId:this.businessId
				}
			})
		}
	}
}
 
</script>

<style scoped>
	/*************** 总容器 ***************/
	.wrapper {
		width: 100%;
		height: 100%;
		background-color: #F5F5F5;
	}

	/*************** header ***************/
	.wrapper header {
		width: 100%;
		height: 12vw;
		background-color: #0097FF;
		display: flex;
		justify-content: space-around;
		align-items: center;
		color: #fff;
		font-size: 4.8vw;
		position: fixed;
		left: 0;
		top: 0;
		/*保证在最上层*/
		z-index: 1000;
	}

	/*************** addresslist ***************/
	.wrapper .addresslist {
		width: 100%;
		margin-top: 12vw;
		background-color: #fff;
	}

	.wrapper .addresslist li {
		width: 100%;
		box-sizing: border-box;
		border-bottom: solid 1px #DDD;
		padding: 3vw;

		display: flex;
	}

	.wrapper .addresslist li .addresslist-left {
		flex: 5;
		/*左边这块区域是可以点击的*/
		user-select: none;
		cursor: pointer;
	}

	.wrapper .addresslist li .addresslist-left h3 {
		font-size: 4.6vw;
		font-weight: 300;
		color: #666;
	}

	.wrapper .addresslist li .addresslist-left p {
		font-size: 4vw;
		color: #666;
	}

	.wrapper .addresslist li .addresslist-right {
		flex: 1;
		font-size: 5.6vw;
		color: #999;
		cursor: pointer;

		display: flex;
		justify-content: space-around;
		align-items: center;
	}

	/*************** 新增地址部分 ***************/
	.wrapper .addbtn {
		width: 100%;
		height: 14vw;
		border-top: solid 1px #DDD;
		border-bottom: solid 1px #DDD;
		background-color: #fff;
		margin-top: 4vw;

		display: flex;
		justify-content: center;
		align-items: center;

		font-size: 4.5vw;
		color: #0097FF;
		user-select: none;
		cursor: pointer;
	}

	.wrapper .addbtn p {
		margin-left: 2vw;
	}
</style>
