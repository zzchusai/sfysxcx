//  分享次数+1
// 增加 问答详情的分享
const net = require("./http.js");


const increaseShare = function (type,id){
  net.http({
    url: "increaseShareNum",
    parameter: { type: type, program_id:id},
  })

}

// 问答详情的分享+1
const increaseDetailAnswer = function(id){
  increaseShare(5,id);
}

module.exports = {
  increaseDetailAnswer: increaseDetailAnswer
}