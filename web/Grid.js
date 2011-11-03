var Grid = {
  x: {
    from: 1,
    to: 60,
    step: 2
  },
  y: {
    from: 1,
    to: 60,
    step: 2
  },
  z: {
    from: 1,
    to: 42,
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
    x: -30,
    y: -30,
    z: -21
    
}
