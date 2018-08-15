const app = getApp();
const net= require("./http.js");

const getCode = function(callBack){
  
  wx.login({
    success: res => {
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      if (typeof (callBack) == "function") {
        callBack(res.code);
      }
    },
    fail: error => {
    }
  })
}

const getUser = function(callBack){
  net.netStatus();
  getCode(function(code){
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              getLoginInfo(code,res, callBack);
            }
          })
        }
      }
    })
  })
  // 获取用户信息
  
}

function getLoginInfo(code,info,callBack){
  let devid = app.globalData.isIos ? "ios" :"android";
  net.http({
    url: "smallLogin",
    parameter: { encryptedData: info.encryptedData, iv: info.iv, code: code, img_url: info.userInfo.avatarUrl, username: info.userInfo.nickName, devid: devid},
    fuSuccess(res) {
      
      if (typeof (callBack) == "function") {
        callBack(res.data);
      }
    },
    fuFail(res){
      wx.showToast({
        title: res.data.msg,
        icon: "none"
      })
    },
    complete() {
    }
  })

}

/**
 * 退出登录
 * */ 
function loginout(){
  wx.removeStorageSync("userInfo");
  wx.removeStorageSync("token");
  wx.removeStorageSync("phone");
  app.globalData.userInfo = null;
  app.globalData.token = "";
  app.globalData.phone = "";
};

/**
 * 是否登录
 * */ 
const islogin = function(showTip,toNav,url){
  let token = wx.getStorageSync("token");
  let info = wx.getStorageSync("userInfo");
  if (token 
      && token.constructor == String 
      && token.length>0
      && info
      && info.constructor == String
      && info.length>0){
          return true;
      }
  if (showTip){
    wx.showToast({
      title: '请登录',
      icon: "none",
      mask: false
    })
  }
  if (toNav){
    let time = showTip?1500:0;
    let timer = setTimeout(function(){
      wx.switchTab({
        url: url,
      });
      clearTimeout(timer);
    }, time);

  }

  return false;

};

const bindTel = function(url){
  let bindTel = wx.getStorageSync("bindTel");
  let phone = wx.getStorageSync("phone");

  console.log(wx.getStorageSync("showBindTelTime"));
  if (!bindTel && (!phone || phone.length <= 0)) {
    wx.setStorageSync("bindTel", true);
    let date = new Date();
    wx.setStorageSync("showBindTelTime", date);
    wx.showModal({
      title: "是否绑定手机号",
      content: "当前账号未绑定手机号是否绑定？",
      success(res) {
        if (res.confirm) {
          wx.navigateTo({
            url: url,
          })
        }
      }
    })
  }
}

module.exports = {
  getUser: getUser, //发起请求
  loginOut: loginout,//退出登录
  isLogin: islogin,//是否登录
  bindTel: bindTel,//绑定手机号
}