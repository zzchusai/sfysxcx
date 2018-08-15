const app = getApp();
const net = require("../../../utils/http.js");
const likeRecord = require('../../../utils/likeRecords.js');
const account = require("../../../utils/account.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    noEditPlaceholder: {
      type: String,
      value: '我来说说...'
    },
    editPlaceholder: {
      type: String,
      value: '我来说说...'
    },
    //评论总数
    commentsNums: {
      type: Number,
      value: 0
    },
    //类型 1代表活动 2代表文章
    types: {
      type: Number,
      value: 0
    },
    //multi_id
    multi_id: {
      type: Number,
      value: 0
    },
    //是否收藏
    collect: {
      type: Number,
      value: -1,
    },
    islike: {
      type: Number,
      value: -1
    },
    isFocus: {
      type: Boolean,
      value:false
    },
    showRightView: {
      type: Boolean,
      value: true
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    comments: '', //发表评论的内容
    isIos: app.globalData.isIos, //是否是iOS设备
    replyObject: {}, // 回复的对象
    cursorSpacing: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 开始编辑
     * */
    toEdit() {
      if (!account.isLogin(false, true, "../../../../profile/profile")) { return };
      this.setData({
        isFocus: true,
        cursorSpacing: 50
      });
    },

    /**
     * 编辑中
     * */
    editIng(value) {
      this.setData({
        comments: value.detail.value,
      });
    },

    /**
     * 结束编辑
     * */
    endEdit() {
      let self = this;
      /**
       * 这里必须用一个定时器 否则iOS上会闪黑色的背景
       * */
      let timer = setTimeout(function() {
        self.setData({
          isFocus: false,
          comments: '',
          cursorSpacing: 0
        });
        clearTimeout(timer);
      }, 300);

    },

    /**
     * 主动开始编辑
     * replyobject 要回复的对象
     * */
    startEdit(replyobject) {
      this.setData({
        // isFocus: true,
        // comments: '',
        replyObject: replyobject,
        // cursorSpacing: 50
      });
    },

    /**
     * 点击发表 回复主题
     * */
    submit() {
      this.endEdit();
      let comments = this.data.comments.replace(/(^\s*)|(\s*$)/g, "");
      if (comments.length<=0){
        wx.showToast({
          icon: "none",
          title: '请输入内容',
        })
        return;
      }



      this.triggerEvent("comments", comments);
      this.reply(comments);
    },

    /**
     * 回复xxx
     * */
    reply(reply) {
      if (!account.isLogin(false, true, "../../../../profile/profile")) { return };
      let item = this.data.replyObject;
      item.reply = reply;
      this.triggerEvent("reply", item);
    },
    //收藏
    setCollect() {
      if (!account.isLogin(false, true, "../../../../profile/profile")) { return };
      wx.showLoading({
        title: 'xxxxx',
      })
      let self = this;
      let multi_id = self.properties.multi_id;
      let type = self.properties.types;
      if (multi_id && type) {
        self.triggerEvent('setCollect', {
          multi_id,
          type
        })
      } else {
        self.triggerEvent('setCollect', multi_id)
      }
    },
    //取消收藏
    cancelCollect() {
      if (!account.isLogin(false, true, "../../../../profile/profile")) { return };
      let self = this;
      let type = self.properties.types;
      let multi_id = self.properties.multi_id;
      if (multi_id && type) {
        self.triggerEvent('cancelCollect', {
          multi_id,
          type
        })
      } else {
        self.triggerEvent('cancelCollect', multi_id)
      }
    },
    //点赞
    setLike() {
      if (!account.isLogin(false, true, "../../../../profile/profile")) { return };
      let self = this;
      let islike = self.properties.islike;
      let id = self.properties.multi_id;
      if (islike == 0) {
        self.triggerEvent('setLike', self.properties.islike)
        likeRecord.addLikeRecords( id, self.properties.types);
      } else {
        wx.showToast({
          title: '您已经点赞过了!',
          icon: 'none'
        })
      }
    },
    //已经点过赞
    setedLike() {
      wx.showToast({
        title: '您已经点赞过了!',
        icon: 'none'
      })
    }
  },
  select(){

  },

})