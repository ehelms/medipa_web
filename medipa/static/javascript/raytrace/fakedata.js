
var loadData = function(url, callback) {
 var x64 = {
    dimensions:{
      x: 64,
      y: 64,
      z: 43
    },
    url:"x64.png",
    rows: 7,
    cols: 7
 };
 var x512 = {
    dimensions:{
      x: 32,
      y: 32,
      z: 22
    },
    url:"x512.png",
    cols: 5,
    rows: 5
  }
  callback(x64);

};
