(function(){
  const KEYS={
    profile:"warm_cat_profile_v1",
    fortune:"warm_cat_fortune_v1",
    poem:"warm_cat_poem_v1",
    outfit:"warm_cat_outfit_v1",
    score:"warm_cat_score_v1",
    fortuneHistory:"warm_cat_fortune_history_v1"
  };
  const SESSION_KEYS={
    l1ToL2:"warm_cat_transition_l1_l2_v1",
    l2ToL3:"warm_cat_transition_l2_l3_v1"
  };

  function readJSON(key){
    try{return JSON.parse(localStorage.getItem(key)||"null");}
    catch{return null;}
  }

  function writeJSON(key,val){
    localStorage.setItem(key,JSON.stringify(val));
  }

  function readSessionJSON(key){
    try{return JSON.parse(sessionStorage.getItem(key)||"null");}
    catch{return null;}
  }

  function writeSessionJSON(key,val){
    sessionStorage.setItem(key,JSON.stringify(val));
  }

  function popSessionJSON(key){
    const val=readSessionJSON(key);
    sessionStorage.removeItem(key);
    return val;
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

  function timePeriod(){
    const h=new Date().getHours();
    if(h>=6&&h<12)return "morning";
    if(h>=12&&h<18)return "afternoon";
    if(h>=18&&h<24)return "evening";
    return "night";
  }

  function timeGreeting(){
    const p=timePeriod();
    if(p==="morning")return "早安，今天会是亮晶晶的一天。";
    if(p==="afternoon")return "午后好，慢慢来也能走很远。";
    if(p==="evening")return "晚上好，愿你被温柔晚风抱住。";
    return "夜深了，也别忘记给自己一点柔软。";
  }

  function wishBlessing(name,wish){
    const n=(name||"你").trim()||"你";
    const w=(wish||"").trim();
    if(!w)return `愿 ${n} 被温柔与好运包围。`;
    return `愿 ${n} 的「${w}」稳稳靠近你。`;
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
    SESSION_KEYS,
    readJSON,
    writeJSON,
    readSessionJSON,
    writeSessionJSON,
    popSessionJSON,
    day,
    hash,
    status,
    profileText,
    timePeriod,
    timeGreeting,
    wishBlessing,
    initCuteBg,
    initMusic
  };
})();
