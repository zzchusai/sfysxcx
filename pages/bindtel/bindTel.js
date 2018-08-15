// pages/bindtel/bindTel.js
const regTel = /^[1][3,4,5,7,8][0-9]{9}$/;//手机的正则
const regCode = /^\d{6}$/;  //验证码正则
const net = require("../../utils/http.js");
const app = getApp();
let timer = null;
let count = 60;
let canGetCode = true;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},//用户信息
    canSubmit: false,//是否能够提交
    tel:'',//输入的手机号
    code:'',//用户输入的验证码
    codeText: "获取验证码",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let info = wx.getStorageSync("userInfo");
    if (info && info.length>0){
      this.setData({ userInfo: JSON.parse(info)});
    }
    clearInterval(timer);
    timer = null;
    count = 60;
    canGetCode = true;
  },
  /**
   * 验证手机号
   * */ 
  checkTel(showTip){
    let tel = this.data.tel;
    if(tel.length<11){
      return false;
    }
    if (tel && regTel.test(tel)) {
      return true;
    }
    if (showTip){
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
    if (code && code.length < 6) {
      return false;
    }
    if (showTip){
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
  checkSubmit(showTip){
    if (this.checkTel(showTip) && this.checkCode(showTip)){
      this.setData({ canSubmit: true});
      return true;
    }else
    {
      this.setData({ canSubmit: false });
      return false;
    }
  },
  /**
   * 输入手机号
   * */ 
  inputTel(e){
    this.setData({ tel:e.detail.value});
    this.checkSubmit(false);
  },
  inputCode(e){
    this.setData({ code: e.detail.value });
    this.checkSubmit(false);
  },
  

  /**
   * 获取用户的code
   * */ 
  getCode(){
    let tel = this.data.tel;
    if (this.checkTel(true) && canGetCode){
      let self = this;
      if (count < 60) {
        return;
      }
      canGetCode = false;
      net.http({
        url: "sendCheckcode",
        parameter:{phone:tel,send_type:0},
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
        complete(){
          canGetCode = true; 
        }
      })
    }
  },
  bindTel(e){
    let self = this;
    let devid = app.globalData.isIos ? "ios" : "android";
    net.http({
      url: "bindphone",
      parameter: { user_id: this.data.userInfo.id, phone: this.data.tel, "type": e, devid: devid },
      fuSuccess(res) {
        let user = res.data.data;
        app.globalData.userInfo = user;
        app.globalData.phone = user.phone;
        app.globalData.token = res.data.access_token;
        wx.setStorageSync("userInfo", JSON.stringify(user));
        wx.setStorageSync("token", res.data.access_token);
        wx.setStorageSync("phone", user.phone);
        wx.navigateBack({})
      },
      fuFail(res) {
        wx.showToast({
          title: res.data.msg,
          icon: "none"
        })
      },
    })
  },  

  toLogin(){
    let tel = this.data.tel;
    let code = this.data.code;
    if (tel.length < 11 || code.length < 6) {
      return;
    }
    if (this.checkSubmit(true)){
        // 检验手机号 是否绑定
      let self = this;
      let devid = app.globalData.isIos ? "ios" : "android";
      net.http({
        url: "checkPhoneExists",
        parameter: { phone: this.data.tel, msg_code: this.data.code, devid: devid },
        fuSuccess(res) {
            if(res.data.data.type == 1){
              self.bindTel(1);
            }else{
              wx.showModal({
                title: '',
                content: res.data.data.msg,
                success: function (e) {
                  if (e.confirm) {
                    self.bindTel(res.data.data.type);
                  } else if (e.cancel) {
                   wx.navigateBack({});
                  }
                }
              })
            }
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
  onHide() {
    clearInterval(timer);
    timer = null;
    count = 60;
    canGetCode = true;
  },
  clearTel(){
    this.setData({ tel:''});
  },
  clearCode() {
    this.setData({ code: '' });
  }

})