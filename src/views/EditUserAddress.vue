<template>
	<div class="wrapper">

		<!-- header部分 -->
		<header>
			<p>编辑送货地址</p>
		</header>

		<!-- 表单部分 -->
		<ul class="form-box">
			<li>
				<div class="title">
					联系人：
				</div>
				<div class="content">
					<input type="text" placeholder="联系人姓名" v-model="contactName">
				</div>
			</li>
			<li>
				<div class="title">
					性别：
				</div>
				<div class="content" style="font-size: 3vw;">
					<input type="radio"  name="contactSex" value="1" style="width:6vw;height:3.2vw;" v-model="contactSex">男
					<input type="radio"  name="contactSex" value="0" style="width:6vw;height:3.2vw;" v-model="contactSex">女
				</div>
			</li>
			<li>
				<div class="title">
					电话：
				</div>
				<div class="content">
					<input type="tel"  placeholder="电话" v-model="contactTel">
				</div>
			</li>
			<li>
				<div class="title">
					收货地址：
				</div>
				<div class="content">
					<input type="text"  placeholder="收货地址" v-model="address">
				</div>
			</li>
		</ul>

		<div class="button-add">
			<button @click="updateDeliveryAddress()">更新</button>
		</div>

		<!-- 底部菜单部分 -->
		<Footer></Footer>

	</div>
</template>

<script>
import Footer from '../components/Footer.vue'

export default{
	data() {
		return {
			daId:this.$route.query.daId,
			contactSex:this.$route.query.contactSex,
			contactName:this.$route.query.contactName,
			contactTel:this.$route.query.contactTel,
			address:this.$route.query.address,
			user:{}
		}
	},
	created() {
		this.user = this.$getSessionStorage('user');
		console.log(this.daId);
		if(this.contactSex=='女'){
			this.contactSex = 0;
		}else{
			this.contactSex = 1;
		}
	},
	methods: {
		
		updateDeliveryAddress() {
			this.$axios.put('/deliveryAddress/updateDeliveryAddress',this.$qs.stringify({
				daId:this.daId,
				contactName:this.contactName,
				contactSex:this.contactSex,
				contactTel:this.contactTel,
				address:this.address,
				userId:this.user.userId
			}),{
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}).then(response =>{
				console.log("修改地址响应:", response.data);
				if(response.data.code === 200){
					// 如果请求成功提醒用户修改成功
					alert("用户修改信息成功！");
					history.go(-1);
				}else{
					alert("修改失败：" + response.data.msg);
				}
			}).catch(error =>{
				console.error(error);
				alert("修改地址请求失败，请重试");
			});
		}
	},
	components: {
		Footer
	}
}
</script>

<style scoped>
	/*************** 总容器 ***************/
	.wrapper {
		width: 100%;
		height: 100%;
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

	/*************** （表单信息） ***************/
	.wrapper .form-box {
		width: 100%;
		margin-top: 12vw;
	}

	.wrapper .form-box li {
		box-sizing: border-box;
		padding: 4vw 3vw 0vw 3vw;
		display: flex;
	}

	.wrapper .form-box li .title {
		flex: 0 0 18vw;
		font-size: 3vw;
		font-weight: 700;
		color: #666;
	}

	.wrapper .form-box li .content {
		flex: 1;

		display: flex;
		align-items: center;
	}

	.wrapper .form-box li .content input {
		border: none;
		outline: none;
		width: 100%;
		height: 4vw;
		font-size: 3vw;
	}

	.wrapper .button-add {
		box-sizing: border-box;
		padding: 4vw 3vw 0vw 3vw;
	}

	.wrapper .button-add button {
		width: 100%;
		height: 10vw;
		font-size: 3.8vw;
		font-weight: 700;

		border: none;
		outline: none;
		border-radius: 4px;
		color: #fff;
		background-color: #38CA73;
	}
</style>
