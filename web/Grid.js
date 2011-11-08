

var range = (function(){
    //var sample = sample;   
    return {
        XRange: function(){
            return sample.length
        },
        YRange: function(){
          return sample[0].length
        },
        ZRange: function(){
          return sample[0][0].length
        }
    }
})();


var Grid = {
  x: {
    from: 1,
    to: range.XRange() - 2,
    step: 2
  },
  y: {
    from: 1,
    to: range.YRange() -2 ,
    step: 2
  },
  z: {
    from: 1,
    to: range.ZRange() -2,
    step: 2
  },
  
  set_low : function(){
      x = {from:-1, to:1, step:.1};
      y =  {from:-1, to:1, step:.1};
      z = {from:-1, to:1, step:.1};
  }
  
};

//Grid.set_low();

//manual rotation
Rot = {
    x: 4.2,
    y: 6.1,
    z: 0
}

//Manual translation
Trans = {
    x: -(range.XRange()/2),
    y: -(range.YRange()/2),
    z: -(range.ZRange()/2)
    
}

