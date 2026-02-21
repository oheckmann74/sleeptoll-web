(function(){
  var el=document.getElementById('debt-number');
  if(!el)return;
  var target=52.3,dur=2400,start=-1;
  var thresholds=[[0.1,'--clear'],[8.1,'--low'],[15.1,'--elevated'],[30.1,'--high'],[52.3,'--critical']];
  var root=document.documentElement;

  function ease(t){return t===1?1:1-Math.pow(2,-10*t)}

  function tick(now){
    if(start<0)start=now;
    var p=Math.min((now-start)/dur,1);
    var v=ease(p)*target;
    el.textContent=v.toFixed(1);
    for(var i=thresholds.length-1;i>=0;i--){
      if(v>=thresholds[i][0]){
        root.style.setProperty('--hero-glow','var('+thresholds[i][1]+')');break;
      }
    }
    if(i<0)root.style.setProperty('--hero-glow','var(--clear)');
    if(p<1)requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
