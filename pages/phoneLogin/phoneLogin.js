// pages/bindtel/bindTel.js
const regTel = /^[1][3,4,5,7,8][0-9]{9}$/;//手机的正则
const regCode = /^\d{6}$/;  //验证码正则
const net = require("../../utils/http.js");
const account = require("../../utils/account.js");
const app = getApp(); 
let timer = null;
let count =  60;
let canGetCode = true;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canSubmit: false,//是否能够提交
    tel: '',//输入的手机号
    code: '',//用户输入的验证码
    codeText: "获取验证码" ,
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    clearInterval(timer);
    timer = null;
    count = 60;
    canGetCode = true;
  },
  /**
   * 验证手机号
   * */
  checkTel(showTip) {
    let tel = this.data.tel;
    if(tel.length<11){
      return false;
    }
    if (tel && regTel.test(tel)) {
      return true;
    }
    if (showTip) {
      wx.showToast({
        title: '请输入正确手机号',
        icon: "none"
      })
    }

    return false;
  },
  /**
   * 验证验证码
   * */
  checkCode(showTip) {
    let code = this.data.code;
    if (code && regCode.test(code)) {
      return true;
    }
    if(code && code.length<6){
      return false;
    }
    if (showTip) {
      wx.showToast({
        title: '请输入正确验证码',
        icon: "none"
      })
    }

    return false;
  },
  /**
   * 验证 是否能够提交
   * */
  checkSubmit(showTip) {
    if (this.checkTel(showTip) && this.checkCode(showTip)) {
      this.setData({ canSubmit: true });
      return true;
    } else {
      this.setData({ canSubmit: false });
      return false;
    }
  },
  /**
   * 输入手机号
   * */
  inputTel(e) {
    this.setData({ tel: e.detail.value });
    this.checkSubmit(false);
  },
  inputCode(e) {
    this.setData({ code: e.detail.value });
    this.checkSubmit(false);
  },
  /**
   * 获取用户的code
   * */
  getCode() {
    let tel = this.data.tel;
    let self = this;
    if (this.checkTel(true) && canGetCode) {
      if (count<60){
        return;
      }
      canGetCode = false;
      net.http({
        url: "sendCheckcode",
        parameter: { phone: tel, send_type: 0 },
        fuSuccess(res) {
          timer = setInterval(function () {
            if (count <= 1) {
              clearInterval(timer);
              timer = null;
              count = 60;
              self.setData({ codeText: "获取验证码" });
            } else {
              count = count - 1;
              self.setData({ codeText: count + "s后重发" });
            }
          }, 1000);
          wx.showToast({
            title: "已发送",
            icon: "none"
          })
        },
        fuFail(res) {
          wx.showToast({
            title: res.data.msg,
            icon: "none"
          })
        },
        complete() {
          canGetCode = true;
        }
      })
    } else {
    }
  },
  toLogin() {
    let tel = this.data.tel;
    let code = this.data.code;
    if(tel.length<11 || code.length<6){
      return;
    }
    if (this.checkSubmit(true)) {
      let self = this;
      let devid = app.globalData.isIos ? "ios" : "android";
      net.http({
        url: "fastLogin",
        parameter: { phone: this.data.tel, msg_code: this.data.code, devid: devid },
        fuSuccess(res) {
          let user = res.data.data;
          app.globalData.userInfo = user;
          app.globalData.phone = self.data.tel;
          app.globalData.token = res.data.access_token;
          wx.setStorageSync("userInfo", JSON.stringify(user));
          wx.setStorageSync("token", res.data.access_token);
          wx.setStorageSync("phone", self.data.tel);
          wx.navigateBack({})
        },
        fuFail(res) {
          wx.showToast({
            title: res.data.msg,
            icon: "none"
          })
        },
      })

    }
  },
  // 微信登录
  toLoginByChat(){
    let self = this;
    account.getUser(function (res) {

      let user = res.data;
      app.globalData.userInfo = user;
      app.globalData.token = res.access_token;
      app.globalData.phone = res.phone;
      wx.setStorageSync("userInfo", JSON.stringify(user));
      wx.setStorageSync("token", res.access_token);
      wx.setStorageSync("phone", res.phone);
      self.setData({ isLogin: true, phone: res.phone, userInfo: user });
      wx.navigateBack({});
    })
  },
  onHide(){
    clearInterval(timer);
    timer = null;
    count = 60;
    canGetCode = true;
  },
  clearTel() {
    this.setData({ tel: '' });
  },
  clearCode() {
    this.setData({ code: '' });
  }

})