// pages/profile/profile.js
const app = getApp();
const net = require("../../utils/http.js");
const readRecords = require("../../utils/readRecords.js");
const account = require("../../utils/account.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,//是否登录
    userInfo:{},//用户信息
    phone:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
  },
  onShow(){
    let user = wx.getStorageSync("userInfo");
    let userInfo = null;
    if (user) {
      userInfo = JSON.parse(user);
    }
    let token = wx.getStorageSync("token");
    let phone = wx.getStorageSync("phone");
    if (token && token.length > 0 && userInfo) {
      this.setData({ userInfo: userInfo, phone: phone, isLogin: true })
    } else {
      this.setData({ userInfo: null, isLogin: false })
    }
    if (this.data.isLogin){
      this.synUserInfo();
    }
  },

  /**
   * 同步用户信息
   * */ 
   synUserInfo(){
     let self = this;
     net.http({
       url: "baseInfo",
       fuSuccess(res) {
         let user = res.data.data;
         app.globalData.userInfo = user;
         app.globalData.phone = res.data.data.phone; 
         wx.setStorageSync("userInfo", JSON.stringify(user));
         wx.setStorageSync("phone", res.data.data.phone);
         self.setData({ isLogin: true, phone: res.data.data.phone, userInfo: user });
       },
     })
   },

  /**
   * 手机号登录
   * */ 
  loginTel(){
    wx.navigateTo({
      url: '../phoneLogin/phoneLogin',
    })
  },
  /**
   * 绑定手机号
   * */ 
  bindTel(){
    wx.navigateTo({
      url: '../bindtel/bindTel?info=' + JSON.stringify(this.data.userInfo)
    })
  },
  /**
   * 登录
   * */
  toLogin(){
    let self= this;
    if (this.data.isLogin) {
      return;
    }
    account.getUser(function(res){
     
      let user = res.data;
      app.globalData.userInfo = user;
      app.globalData.token = res.access_token;
      app.globalData.phone = res.phone; 
      wx.setStorageSync("userInfo", JSON.stringify(user));
      wx.setStorageSync("token", res.access_token);
      wx.setStorageSync("phone", res.phone);
      self.setData({ isLogin: true, phone: res.phone, userInfo: user});
      
    })
  },
  /**
   * 点击我的收藏
   * */  
  collectToLogin(){
    if (this.data.isLogin){
      // 去收藏界面
      wx.navigateTo({
        url: '../myCollection/myCollection',
      })
      return;
    }
    this.toLogin();
  },
  /**
   * 点击我的提问
   * */ 
  questionToLogin(){
    if (this.data.isLogin) {
      // 去我的提问界面
      wx.navigateTo({
        url: '../myQuestion/myQuestion',
      })
      return;
    }
    this.toLogin();
  },

  
  
})