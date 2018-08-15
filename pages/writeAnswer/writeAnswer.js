const app = getApp();
const net = require("../../utils/http.js");
const formatTime = require("../../utils/time.js");
const uploadImg = require("../../utils/uploadImg.js");
const account = require("../../utils/account.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '', //标题
    content: '', //描述的问题
    imgs: [], //用户选择的图片
    classify: [], //所有的分类
    selectClassifyIndex: 0, //用户选择的分类
    haveName: true, //是否是真实用户发布
    user_id: '', //用户id
    submitCanUse: true, //提交按钮是否能够使用
    classifyId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      classifyId: options.selectId
    })
    console.log(this.data.classifyId);
    this.getClassifyData(this.data.classifyId);
    let user = wx.getStorageSync("userInfo");
    if (user) {
      this.setData({
        user_id: JSON.parse(user).id
      });
    }
    account.bindTel("../bindtel/bindTel");
    this.getNetStatus();
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },
  getNetStatus() {
    let self = this;
    net.netStatus(function(res) {
      self.setData({
        netWork: res
      });
    });
  },
  reloadNet() {
    this.getNetStatus();
    console.log(this.data.classifyId)
    let options={
      selectId:this.data.classifyId
    }
    this.onLoad(options);
  },
  /**
   * 获取分类数据
   * */
  getClassifyData(classifyId) {
    let self = this;
    net.http({
      url: "indexGroup",
      fuSuccess(res) {
        let index = 0;
        for (let i = 0; i < res.data.data.length; i++) {
          if (res.data.data[i].id == classifyId) {
            index = i;
            break;
          }
        }
        self.setData({
          classify: res.data.data,
          selectClassifyIndex: index
        });
      },
      complete() {}
    })
  },

  /**
   * 输入标题
   * */
  inputTitle(e) {
    this.setData({
      title: e.detail.value
    });
  },

  /**
   * 输入问题
   * */
  inputIssue(e) {
    this.setData({
      content: e.detail.value
    });
  },
  /**
   * 预览图片
   * */
  previewImg(e) {
    let img = e.target.dataset.detail;
    wx.previewImage({
      urls: this.data.imgs,
      current: img
    })
  },
  /**
   * 选择图片
   * 
   * */
  selectImgs() {
    let imgs = this.data.imgs;
    let count = 9 - imgs.length;

    let self = this;
    wx.chooseImage({
      count: count,
      success: function(res) {
        let imgArray = res.tempFilePaths;
        if (imgArray.length > count) {
          imgArray.splice(0, count);
        }
        imgs = [...imgs, ...imgArray];
        self.setData({
          imgs: imgs
        });
      },
    })
  },
  /**
   * 删除图片
   * */
  delImg(e) {
    let imgs = this.data.imgs;
    imgs.splice(e.target.dataset.index, 1);
    this.setData({
      imgs: imgs
    });
  },


  /**
   * 选择分类
   * */
  bindPickerChange(e) {
    this.setData({
      selectClassifyIndex: e.detail.value
    });

  },

  /**
   * 更改匿名状态
   * */
  changeName() {
    this.setData({
      haveName: !this.data.haveName
    });
  },
  /**
   * 提交问答
   * */
  submit() {

    if (!this.data.submitCanUse) {
      return;
    }
    let title = this.data.title.replace(/(^\s*)|(\s*$)/g, ""),
      content = this.data.content.replace(/(^\s*)|(\s*$)/g, ""),
      imgs = this.data.imgs,
      selectClassify = this.data.classify[this.data.selectClassifyIndex],
      anonymous = this.data.haveName ? 1 : 2;
    if (title.length <= 0) {
      wx.showToast({
        title: '标题不能为空',
        icon: "none"
      })
      return;
    }
    if (content.length <= 0) {
      wx.showToast({
        title: '内容不能为空',
        icon: "none"
      })
      return;
    }
    let self = this;
    this.setData({
      submitCanUse: false
    });
    if (imgs.length > 0) {
      // 将图片上传到七牛
      uploadImg.uploadImg(imgs, (pic) => {
        self.submitData(anonymous, title, content, JSON.stringify(pic), selectClassify.id)

      }, (error) => {})
    } else {
      self.submitData(anonymous, title, content, "[]", selectClassify.id)
    }
  },

  /**
   * 将数据提交到服务器
   * */
  submitData(anonymous, title, content, pic, group_id) {
    let self = this;
    net.http({
      url: "interSave",
      parameter: {
        anonymous: anonymous,
        title: title,
        content: content,
        pic: pic,
        group_id: group_id,
        user_id: this.data.user_id
      },
      fuSuccess(res) {
        let pages = getCurrentPages(); //当前页面
        let prevPage = pages[pages.length - 2]; //上一页面
        if (prevPage.route.endWith("answer")) {
          // 如果是提问列表
          if (prevPage.data.selectCategory == group_id) {
            prevPage.setData({
              allowLoadMore: true,
              mutableData: [],
              isData: false,
              page: 1
            });
            prevPage.getListData();
          }
        }
        wx.navigateBack({})
      },
      fuFail(res) {
        wx.showToast({
          title: res.data.msg,
          icon: "none",
        })
      },
      complete() {
        self.setData({
          submitCanUse: true
        });
      }
    })


  }


})