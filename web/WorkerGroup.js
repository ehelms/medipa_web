function WorkerGroup(fileName, n) {
  var workers = this.workers = [];
  while (n--) {
    workers.push(new Worker(fileName));
  }
}

WorkerGroup.prototype = {
  map: function(callback) {
    var workers = this.workers;
    var configs = this.configs = [];

    for (var i = 0, l = workers.length; i < l; i++) {
      configs.push(callback(i));
    }
  },

  reduce: function(opt) {
    var fn = opt.reduceFn,
        workers = this.workers,
        configs = this.configs,
        l = workers.length,
        acum = opt.initialValue,
        message = function (e) {
         if (e.data.type === "data"){

           l--;
           if (acum === undefined) {
            acum = e.data.data;
           } else {
            acum = fn(acum, e.data.data);
           }
           if (l == 0) {
            opt.onComplete(acum);
           }
         }
         else if (e.data.type==="log") {
           msg_num +=1;
           if (msg_num % 1 === 0) {
             console.log(e.data.data);
	   }
         }
        };
    for (var i = 0, ln = l; i < ln; i++) {
      var w = workers[i];
      w.onmessage = message;
      w.postMessage(configs[i]);
    }
  }
};

var msg_num = 0;
