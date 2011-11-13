

MD.range = (function(){
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


MD.grid = {
  x: {
    from: 1,
    to: MD.range.XRange() - 2,
    step: 2
  },
  y: {
    from: 1,
    to: MD.range.YRange() -2 ,
    step: 2
  },
  z: {
    from: 1,
    to: MD.range.ZRange() -2,
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
MD.rotation = {
    x: 0,
    y: 0,
    z: 0
};

//Manual translation
MD.translation = {
    x: -(MD.range.XRange()/2),
    y: -(MD.range.YRange()/2),
    z: -(MD.range.ZRange()/2)  
};

