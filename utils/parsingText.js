let _context = "";//要解析的正文
let _imgsJson = []; //要替换的图片

const parsingRichText = function(context,imgsJson,callBack){
  _context = "";
  _imgsJson = [];
  if (context.constructor == String){
    _context = context;
  }
  if (imgsJson.constructor == Array){
    _imgsJson = imgsJson;
  }
  if (_context.length<=0){
    if(typeof(callBack) == "function"){
      callBack(_context)
    }
    return;
  }
  if (_imgsJson.length<=0){
    if (typeof (callBack) == "function") {
      callBack(_context)
    }
    return;
  }
  for (let i = 0; i < _imgsJson.length;i++){
    let item = _imgsJson[i];
    let src = item.src;
    let position = item.ref;
    let pix = item.pixel.split("*");
    let img = "";
    img = "<img src=" + src + ">";
    _context =  _context.replace(position, img);
  }
  if (typeof (callBack) == "function") {
    callBack(_context);
  }
}

module.exports = {
  parsingRichText: parsingRichText
}


