import{ request }from"../../request/index.js";
import regeneratorRuntime from '../../lib/runtime/runtime'
/* 
  1 输入框绑定 改变事件 input事件
    1 获取输入框的值
    2 合法性的判断
    3 检验通过  把输入框的值  发送至后台
    4 返回的数据打印到页面上
  2 防抖 (防止抖动) 定时器  节流
    1 定义全局的定时器  id
    2 防抖一般用在输入框中
    3 节流一般用在页面下拉和上拉中
*/
Page({
  data: {
    goods:[],
    isFocus:false,
    inpValue:""
  },
    TimeId:-1,
  //输入框的值改变  就会触发的事件
  handleInput(e){
    // console.log(e);
    // 1 获取输入框的值
    const {value} = e.detail;
    // 2 检测合法性
    if(!value.trim()){
      // 值不合法
      return;
    }
    this.setData({
      isFocus:true
    });
    clearTimeout(this.TimeId);
    this.TimeId = setTimeout(()=>{
      // 3 准备发送请求获取数据
      this.qsearch(value);  
    },1000)
    
  },
  // 发送请求获取搜索建议 数据
  async qsearch(query){
    const res = await request({url:"/goods/qsearch",data:{query}});
    console.log(res);
    this.setData({
      goods:res
    })
  },
  handleCancle(){
    this.setData({
      inpValue:"",
      isFocus:false,
      goods:[]
    })
  }
})