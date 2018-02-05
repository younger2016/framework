export default uuid = () => {
  var timeSpan = function() {
      var date=new Date();
      var y = date.getFullYear();
      var M = date.getMonth() + 1;
      var d = date.getDate();
      var H = date.getHours();
      var m = date.getMinutes();
      var s = date.getSeconds();
      var S = parseInt(date.getMilliseconds()/10);//2 bytes

      var spaceTag = function(v) {
          if(v<10) {
              return "0";
          }
          return "";
      };
      // yyyyMMdd-HHmm-ssSS
      return y+spaceTag(M)+M+spaceTag(d)+d + "-" + spaceTag(H)+H + spaceTag(m)+m + "-"+ spaceTag(s)+s + spaceTag(S)+S;

  };
  return timeSpan() + ('-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  }));
}
