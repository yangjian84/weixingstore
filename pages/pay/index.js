/*
1 页面加载的时候
  1 从缓存中获取购物车数据 渲染到页面中
    这些数据  checked=true
2 支付按钮
  1 先判断缓存中有没有token
  2 没有  跳转到授权页面  进行获取token
  3 有token
  4 已经完成微信支付
  5 手动删除缓存中  已经被选中了的商品
  6 删除后的购物车数据  填充缓存
  7 再跳转回页面
*/
import {getSetting,chooseAddress,openSetting,showModal,showToast,requestPayment} from "../../utils/asyncWx.js"
import regeneratorRuntime from '../../lib/runtime/runtime'
import { request } from '../../request/index.js'
Page({
  data:{
    address:{},
    cart:[],
    totalPric:0,
    totalNum:0
  },
  onShow(){
    // 1 获取缓存中的收货地址信息
    const address = wx.getStorageSync("address");
    // 1 获取缓存中的购物车数据
    let cart = wx.getStorageSync("cart")||{};
    // // 1 计算全选
    // // every 数组方法 会遍历 会接收一个回调函数 那么 每一个回调函数都返回true 那么 every的方法返回值为true
    // // 只要有一个回调函数返回了false 那么不再执行 直接返回false
    // // 空数组  调用every,返回值就是true
    // let allChecked = true;
    // // 1 总数量  总价格
    // let totalPric = 0;
    // let totalNum = 0;
    // cart.forEach(v=>{
    //   if(v.checked){
    //     totalPric += v.goods_price * v.num;
    //     totalNum += v.num;
    //   }
    //   else{
    //     allChecked = true
    //   }
    // })
    // // 判断数组是否为空
    // allChecked = cart.length!=0?allChecked:false;
    // // 2 给data数据赋值
    // this.setData({
    //   address,
    //   cart,
    //   allChecked,
    //   totalPric,
    //   totalNum
    // })
    // 过滤后的购物车数组
    cart = cart.filter(v=>v.checked);
    this.setData({address});
    // 1 总数量  总价格
    let totalPric = 0;
    let totalNum = 0;
    cart.forEach(v=>{
        totalPric += v.goods_price * v.num;
        totalNum += v.num;
    })
    this.setData({
      cart,
      totalPric,
      totalNum,
      address
    });
  },
  // 点击 支付
  async handleOrderPay(){
    try {
      // 1 判断缓存中有没有token
    const token = wx.getStorageSync("token");
    // 2 判断
    if(!token){
      wx.navigateTo({
        url: '/pages/auth/index',
      });
      return;
    }
    // 3 创建订单
    // 3.1 准备 请求头参数
    const header = {Authorization:token};
    // 3.2 准备 请求体参数
    const order_price = this.data.totalPric;
    const consignee_addr = thi.data.address.all;
    const cart = this.data.cart;
    let goods = [];
    cart.forEach(v=>goods.push({
      goods_id : v.goods_id,
      goods_number : v.num,
      goods_price : v.goods_price,
    }))
    const orderParams = {order_price,consignee_addr,goods};
    // 4 准备发送请求 创建订单 获取订单编号
    const {order_number} = await request({url:"/my/orders/create",method:"POST",data:orderParams,header});
    // 5 发起  预支付接口
    const {pay} = await request({url:"/my/orders/req_unifiedorder",method:"POST",data:order_number,header});
    // 6 发起  微信支付
    await requestPayment(pay);
    // 7 查询后台 订单状态
    const res = await request({url:"/my/orders/create",method:"POST",data:{order_number},header});
    // 8 手动删除缓存中  已经支付了的商品
    let newCart = wx.getStorageSync("cart");
    newCart = newCart.filter(v=>!v.checked);
    wx.setStorageSync("cart", newCart);
    await showToast("支付成功");
    wx.navigateTo({
      url: '/pages/order/index'
    });
    } catch (error) {
    await showToast("支付失败");
      console.log(erro);
    }
  }
})