
var loadData = function(url, callback) {
 var x64 = {
    dimensions:{
      x: 64,
      y: 64,
      z: 43
    },
    url:"x64.png"
 };
 var x512 = {
    dimensions:{
      x: 32,
      y: 32,
      z: 22
    },
    url:"x512.png"

  }
  callback(x512);

};
