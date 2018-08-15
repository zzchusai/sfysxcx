//app.js

require("/utils/Str.js");
const time = require("/utils/time.js");

App({
  onLaunch: function () {
    if (wx.getStorageSync("userInfo")){
      this.globalData.userInfo = JSON.parse(wx.getStorageSync("userInfo"));
    }
    
    this.globalData.token = wx.getStorageSync("token");
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        this.globalData.loginCode = res.code;
      },
      fail: error=>{
        console.log("失败");
      }
    });
    // 判断是否需要弹出绑定手机号
    let showBindTelTime = wx.getStorageSync("showBindTelTime");
    if (showBindTelTime){
      let differ = time.differTime(showBindTelTime,new Date());
      if (differ<24){
        wx.setStorageSync("bindTel", true);
      }
    }

  },
  globalData: {
    userInfo: null,
    DWidth:0,//设备的宽度
    DHeight:0,//设备的高度
    DPR:1,
    isIos: false,//是否是iOS设备
    loginCode:"",
    token:'',
    phone:'',//用户手机号
  }
})