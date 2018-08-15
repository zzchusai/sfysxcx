const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    mutableData: {
      type: Array,
      value: []
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
    selectCell(res) {
      let index = res.target.dataset.index;
      let item = this.properties.mutableData[index];
      console.log(item)
      let url = '';
      console.log(item.type)
      if (item.type && item.type == '1') {
        url = '../activityDetail/activityDetail?id=' + item.multi_id;
      } else {
        url = '../articleDetail/articleDetail?id=' + item.multi_id
      }
      wx.navigateTo({
        url: url,
      })
    },
  }
})