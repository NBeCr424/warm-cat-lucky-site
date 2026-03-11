(function(){
  const KEYS={
    profile:"warm_cat_profile_v1",
    fortune:"warm_cat_fortune_v1",
    poem:"warm_cat_poem_v1",
    outfit:"warm_cat_outfit_v1",
    score:"warm_cat_score_v1",
    fortuneHistory:"warm_cat_fortune_history_v1",
    music:"warm_cat_music_v1",
    catDaily:"warm_cat_daily_v1",
    catPreference:"warm_cat_preference_v1",
    catGreeting:"warm_cat_greeting_v1"
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

  function clamp(n,min,max,fallback){
    const x=Number(n);
    if(Number.isNaN(x))return fallback;
    return Math.max(min,Math.min(max,x));
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
    if(!container)return null;
    for(let i=0;i<12;i+=1){
      setTimeout(()=>spawnCuteChip(container),i*320);
    }
    return setInterval(()=>spawnCuteChip(container),1200);
  }

  function musicControllerFallback(){
    return {
      getVolume:()=>0.4,
      getVolumePercent:()=>40,
      isPlaying:()=>false,
      scaledSfx:(ratio=1)=>Math.max(0,Math.min(1,0.4*ratio)),
      duck:()=>{},
      play:async()=>false,
      pause:()=>{},
      onVolumeChange:()=>()=>{},
      onPlayChange:()=>()=>{}
    };
  }

  function initMusic(toggleBtn,rangeInput,audio,statusNode){
    if(!toggleBtn||!rangeInput||!audio)return musicControllerFallback();

    const saved=readJSON(KEYS.music)||{};
    const state={
      volume:clamp(saved.volume,0,100,40),
      playing:Boolean(saved.playing)
    };

    const volumeListeners=new Set();
    const playListeners=new Set();

    function persist(){
      writeJSON(KEYS.music,{volume:state.volume,playing:state.playing});
    }

    function emitVolume(){
      volumeListeners.forEach((fn)=>{
        try{fn(state.volume/100,state.volume);}catch{}
      });
    }

    function emitPlay(){
      playListeners.forEach((fn)=>{
        try{fn(state.playing);}catch{}
      });
    }

    function renderBtn(){
      toggleBtn.textContent=state.playing?"暂停舒缓音乐":"播放舒缓音乐";
      toggleBtn.setAttribute("aria-pressed",String(state.playing));
    }

    function setVolume(percent,save=true){
      state.volume=clamp(percent,0,100,40);
      rangeInput.value=String(state.volume);
      audio.volume=state.volume/100;
      if(save)persist();
      emitVolume();
    }

    function setPlaying(next,save=true){
      state.playing=Boolean(next);
      renderBtn();
      if(save)persist();
      emitPlay();
    }

    async function play(userTriggered=false){
      setVolume(state.volume,false);
      try{
        await audio.play();
        setPlaying(true,true);
        if(userTriggered)status(statusNode,"正在播放舒缓音乐🎵");
        return true;
      }catch{
        setPlaying(false,true);
        if(userTriggered)status(statusNode,"当前设备保持安静模式，已自动静音。",false);
        return false;
      }
    }

    function pause(userTriggered=false){
      audio.pause();
      setPlaying(false,true);
      if(userTriggered)status(statusNode,"舒缓音乐已暂停。");
    }

    async function toggle(){
      if(state.playing){
        pause(true);
        return;
      }
      await play(true);
    }

    function duck(factor=0.82,duration=260){
      if(!state.playing||audio.paused)return;
      const origin=state.volume/100;
      audio.volume=Math.max(0,Math.min(1,origin*factor));
      setTimeout(()=>{
        audio.volume=state.volume/100;
      },Math.max(80,Number(duration)||260));
    }

    function onVolumeChange(fn){
      if(typeof fn!=="function")return ()=>{};
      volumeListeners.add(fn);
      fn(state.volume/100,state.volume);
      return ()=>volumeListeners.delete(fn);
    }

    function onPlayChange(fn){
      if(typeof fn!=="function")return ()=>{};
      playListeners.add(fn);
      fn(state.playing);
      return ()=>playListeners.delete(fn);
    }

    toggleBtn.addEventListener("click",toggle);
    rangeInput.addEventListener("input",()=>setVolume(Number(rangeInput.value),true));

    audio.preload="auto";
    renderBtn();
    setVolume(state.volume,false);

    if(state.playing){
      play(false);
    }

    return {
      getVolume:()=>state.volume/100,
      getVolumePercent:()=>state.volume,
      isPlaying:()=>state.playing,
      scaledSfx:(ratio=1)=>Math.max(0,Math.min(1,(state.volume/100)*Math.max(0,Number(ratio)||0))),
      duck,
      play,
      pause,
      onVolumeChange,
      onPlayChange
    };
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
