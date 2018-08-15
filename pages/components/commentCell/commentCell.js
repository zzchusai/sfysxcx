// pages/components/commentCell/commentCell.js
const net = require('../../../utils/http.js');
const likeRecord = require('../../../utils/likeRecords.js');
const popup = require('../../../utils/popup.js');
const account = require("../../../utils/account.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      value: {}
    },
    isLast: {
      type: Boolean,
      value: false,
    },
    index: {
      type: Number,
      value: -1
    },
    //类型： 1代表活动 2代表文章 3代表问答
    types: {
      type: Number,
      value: -1
    },
    //是否显示回复按钮
    showReply: {
      type: Number,
      value: -1
    }

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 点击整个cell
     * */
    selectCell() {
      let item = this.properties.item;
      if (this.properties.index > -1) {
        item.cellIndex = this.properties.index;
      }
      this.triggerEvent("selectCell", item);
    },

    /**
     * 点赞
     * */
    setCommentLike(){
      if (!account.isLogin(false, true, "../../../../profile/profile")) { return };
      let self = this;
      let likes = self.properties.likes;
      let id = self.properties.item.id;
      let records = '';
      
      //types 3代表活动评论  4代表文章评论 5代表回答评论
      if (self.properties.types == 3) {
        records = 'activityCommentLikes';
      } else if (self.properties.types == 4) {
        records = 'acticleCommentLikes';
      } else if (self.properties.types == 5) {
        records = 'answerCommentLikes';
      }
      let commentLikeArray = wx.getStorageSync(records);
      if (commentLikeArray.indexOf(id) == -1) {
        if (self.properties.types == 3) {
          net.http({
            url: 'pAllLikes',
            parameter: {
              pmulti_id: id,
              type: 1
            },
            fuSuccess(res) {
              //点赞量加一
              if (res.data.status == 1) {
                let nums = res.data.nums
                self.triggerEvent('setCommentLike', {
                  id,
                  nums
                })
              }
              likeRecord.addLikeRecords(id, self.properties.types);
            },
            fuFail(res) {
              wx.showToast({
                title: res.data.msg,
                icon: 'none'
              })
            }
          })
        } else if (self.properties.types == 4) {
          net.http({
            url: 'pAllLikes',
            parameter: {
              pmulti_id: id,
              type: 2
            },
            fuSuccess(res) {
              //点赞量加一
              if (res.data.status == 1) {
                let nums = res.data.nums
                self.triggerEvent('setCommentLike', {
                  id,
                  nums
                })
              }
              likeRecord.addLikeRecords(id, self.properties.types);
            },
            fuFail(res) {
              wx.showToast({
                title: res.data.msg,
                icon: 'none'
              })
            }
          })
        } else if (self.properties.types == 5) {
          net.http({
            url: 'pAllLikes',
            parameter: {
              pmulti_id: id,
              type: 5
            },
            fuSuccess(res) {
              //点赞量加一
              if (res.data.status == 1) {
                let nums = res.data.nums
                self.triggerEvent('setCommentLike', {
                  id,
                  nums
                })
              }
              likeRecord.addLikeRecords(id, self.properties.types);
            },
            fuFail(res) {
              wx.showToast({
                title: res.data.msg,
                icon: 'none'
              })
            }
          })
        } else if (self.properties.types == 6) {
          net.http({
            url: 'pAllLikes',
            parameter: {
              pmulti_id: id,
              type: 5
            },
            fuSuccess(res) {
              //点赞量加一
              if (res.data.status == 1) {
                let nums = res.data.nums
                self.triggerEvent('setCommentLike', {
                  id,
                  nums
                })
              }
              likeRecord.addLikeRecords(id, self.properties.types);
            },
            fuFail(res) {
              wx.showToast({
                title: res.data.msg,
                icon: 'none'
              })
            }
          })
        }
        
      } else {
        wx.showToast({
          title: '您已经点赞过了!',
          icon: 'none'
        })
      }
    },
    setSecCommentLike() {
      if (!account.isLogin(false, true, "../../../../profile/profile")) { return };
      wx.showToast({
        title: '您已经点赞过了!',
        icon: 'none'
      })
    },
    //删除评论
    delComment() {
      if (!account.isLogin(false, true, "../../../../profile/profile")) { return };
      let self = this;
      popup.delPopup('温馨提示', '您确定要删除这个评论吗？', function() {
        let id = self.properties.item.id;
        if (self.properties.types == 3) {
          net.http({
            url: 'allCommentDelete',
            parameter: {
              type: 1,
              pmulti_id: id
            },
            fuSuccess(res) {
              if (res.data.status == 1) {
                self.triggerEvent('delComment', res.data.msg)
              }
            },
            fuFail(res) {
              wx.showToast({
                title: res.data.msg,
                icon: 'none'
              })
            },
          })
        } else if (self.properties.types == 4) {
          net.http({
            url: 'allCommentDelete',
            parameter: {
              type: 2,
              pmulti_id: id
            },
            fuSuccess(res) {
              if (res.data.status == 1) {
                self.triggerEvent('delComment', res.data.msg)
              }
            },
            fuFail(res) {
              wx.showToast({
                title: res.data.msg,
                icon: 'none'
              })
            },
          })
        } else if (self.properties.types == 5) {
          net.http({
            url: 'allCommentDelete',
            parameter: {
              type: 5,
              pmulti_id: id
            },
            fuSuccess(res) {
              if (res.data.status == 1) {
                self.triggerEvent('delComment', res.data.msg)
              }
            },
            fuFail(res) {
              wx.showToast({
                title: res.data.msg,
                icon: 'none'
              })
            },
          })
        }
      }, function() {
        return;
      })
    }
  },

})