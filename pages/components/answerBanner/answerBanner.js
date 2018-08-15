// pages/components/answerBanner/answerBanner.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    mutableData:{
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    selectIndex:0,//选取的下标
  },

  /**
   * 组件的方法列表
   */
  methods: {
    selectCell(res){
      let index = res.target.dataset.index;
      this.setData({ selectIndex: index});
      this.triggerEvent("selectbanner", this.properties.mutableData[index].id);
    }
  }
})
