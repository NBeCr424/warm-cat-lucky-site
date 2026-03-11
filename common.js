(function(){
  const KEYS={
    profile:"warm_cat_profile_v1",
    fortune:"warm_cat_fortune_v1",
    poem:"warm_cat_poem_v1",
    outfit:"warm_cat_outfit_v1",
    score:"warm_cat_score_v1"
  };

  function readJSON(key){
    try{return JSON.parse(localStorage.getItem(key)||"null");}
    catch{return null;}
  }

  function writeJSON(key,val){
    localStorage.setItem(key,JSON.stringify(val));
  }

  function day(){
    const d=new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  function hash(str){
    let h=0;
    for(let i=0;i<str.length;i+=1){
      h=(h<<5)-h+str.charCodeAt(i);
      h|=0;
    }
    return Math.abs(h);
  }

  function status(node,msg,bad=false){
    if(!node)return;
    node.textContent=msg;
    node.style.color=bad?"#b14a23":"var(--ok)";
  }

  function profileText(profile){
    if(!profile)return "";
    const parts=[`年龄 ${profile.age}`];
    if(profile.city)parts.push(`城市 ${profile.city}`);
    if(profile.hobby)parts.push(`喜欢 ${profile.hobby}`);
    if(profile.wish)parts.push(`愿望 ${profile.wish}`);
    return parts.join(" | ");
  }

  function spawnCuteChip(container){
    if(!container)return;
    const el=document.createElement("span");
    el.className="bg-chip";
    const pool=["💗","💖","🐾","⭐","🧡","🌼","🌙","✨"];
    el.textContent=pool[Math.floor(Math.random()*pool.length)];
    el.style.left=`${Math.random()*100}vw`;
    el.style.bottom="-30px";
    el.style.fontSize=`${16+Math.random()*24}px`;
    el.style.animationDuration=`${8+Math.random()*7}s`;
    container.appendChild(el);
    setTimeout(()=>el.remove(),16000);
  }

  function initCuteBg(container){
    if(!container)return;
    for(let i=0;i<12;i+=1){
      setTimeout(()=>spawnCuteChip(container),i*320);
    }
    return setInterval(()=>spawnCuteChip(container),1200);
  }

  function initMusic(toggleBtn,rangeInput,audio,statusNode){
    if(!toggleBtn||!rangeInput||!audio)return;

    function setVolume(){
      audio.volume=Math.max(0,Math.min(1,Number(rangeInput.value)/100));
    }

    async function toggle(){
      setVolume();
      if(audio.paused){
        try{
          await audio.play();
          toggleBtn.textContent="暂停舒缓音乐";
        }catch{
          status(statusNode,"音乐播放被浏览器拦截，请再点一次“播放舒缓音乐”。",true);
        }
        return;
      }
      audio.pause();
      toggleBtn.textContent="播放舒缓音乐";
    }

    toggleBtn.addEventListener("click",toggle);
    rangeInput.addEventListener("input",setVolume);
    setVolume();
  }

  window.WarmCat={
    KEYS,
    readJSON,
    writeJSON,
    day,
    hash,
    status,
    profileText,
    initCuteBg,
    initMusic
  };
})();
