const delPopup=function(title,content,confirm,cancel){
     wx:wx.showModal({
       title: title,
       content: content,
       showCancel: true,
       success: function(res) {
         if(res.confirm){
           if(typeof confirm=='function'){
             confirm()
           }
         }else if(res.cancel){
           if (typeof cancel== 'function') {
             cancel()
           }
         }
       }
     })
}
module.exports={
  delPopup:delPopup
}