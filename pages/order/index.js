/*
  1 页面被打开的时候onShow
    1 获取url上的参数type
    1 判断缓存中有没有token
      1 没有 跳转到授权页面
      2 有 直接进行下去
    2 根据type 来决定页面标题的数组元素 哪个被激活选中
    2 根据type 去发送请求获取订单数据
    3 渲染页面
  2 点击不同的标题 重新发送请求来获取和渲染数据
 */
import{ request }from"../../request/index.js";
import regeneratorRuntime from '../../lib/runtime/runtime'
Page({
  data:{
    orders:[],
    tabs:[
      {
        id:0,
        value:"全部",
        isActive:true
      },
      {
        id:1,
        value:"代付款",
        isActive:false
      },
      {
        id:2,
        value:"代发货",
        isActive:false
      },
      {
        id:3,
        value:"退款/退货",
        isActive:false
      }
    ]
  },
  onShow(options){
    const token = wx.getStorageSync("token");
    if(!token){
      wx.navigateTo({
        url: '/pages/auth/index'
      });
      return;
    }
  // 1 获取当前小程序的页面栈-数组 长度最大是10页面
    let pages =  getCurrentPages();
    // console.log(pages);
    // 2 数组中最大的索引页面就是当前页面
    let currentPage = pages[pages.length-1];
    console.log(currentPage.options);
    // 3 获取url上的type参数
    const {type} = currentPage.options;
    this.getOrder(type);
    this.changTitleByIndex(type-1)
  },
  // 获取订单的方法
  async getOrder(type){
    let res = await request({url:"/my/orders/all",data:{type}});
    console.log(res);
    this.setData({
      orders:res.orders.mao(v=>({...v,create_time_cn:(new Date(v.create_time*1000).toLocaleString)}))
    })
  },
  // 根据标题索引来激活选中  标题数组
    changTitleByIndex(){
      // 2 修改源数组
      let {tabs} = this.data;
      tabs.forEach((v,i)=>i===index?v.isActive=true:v.isActive=false);
      // 3 赋值到data中
      this.setData({
        tabs
      })
    },
    // 标题点击事件  从子组件传递过来
    handleTabsItemChange(e){
      // 1 获取被点击的标题索引
      const {index} = e.detail;
      this.changTitleByIndex(index);
      this.getOrder(index+1);
    }
})