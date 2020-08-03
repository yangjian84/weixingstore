import{ request }from"../../request/index.js";
import regeneratorRuntime from '../../lib/runtime/runtime'
import { login } from '../../utils/asyncWx.js'
Page({
  // 获取用户信息
  async handleGetUserInfo(e){
    try {
      // console.log(e)
    // 1 获取用户信息
    const {encryptedData,iv,rawData,signature} = e.detail;
    // 2 获取小程序登录成功后code值
    // wx.login({
    //   timeout:10000,
    //   success: (result)=>{
    //     // console.log(result);
    //     const {code} = result;
    //   }
    // });封装
    const {code} =await login();
    const loginParams = {encryptedData,iv,rawData,signature,code}
    // console.log(code);
    // 3 发送请求  获取用户的token
    const res = await request({url:"/users/wxlogin",data:loginParams,method:"post"});
    wx.setStorageSync("token", token);
    wx.navigateBack({
      delta: 1
    });
    } catch (error) {
      console.log(error);
    }
  }

})