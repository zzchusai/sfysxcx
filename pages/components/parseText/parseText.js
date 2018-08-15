const parsingText = require("../../../utils/parsingText.js");

const WxParse = require('../../../wxParse/wxParse.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    content:{
      type:String,
      value:''
    },
    imgsJson:{
      type:Array,
      value:[]
    }  
  },

  /**
   * 组件的初始数据
   */
  data: {
    showWeb:'',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    parseData(){
      let self = this;
      parsingText.parsingRichText(this.properties.content, this.properties.imgsJson, function (res) {
        self.setData({ showWeb: res });
        WxParse.wxParse('showWeb', 'html', res, self, 0);

      });
    }


  }
})
