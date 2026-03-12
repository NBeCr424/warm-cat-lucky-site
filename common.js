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

  const GUIDE_KEYS={
    session:"warm_cat_guide_session_v1",
    skipPrefix:"warm_cat_guide_skip_v1"
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

  // -------- 软萌引导弹窗：统一注入样式 + 复用渲染 --------
  function getGuideSessionId(){
    try{
      let id=sessionStorage.getItem(GUIDE_KEYS.session);
      if(!id){
        id=`${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
        sessionStorage.setItem(GUIDE_KEYS.session,id);
      }
      return id;
    }catch{
      return `session_${Date.now()}`;
    }
  }

  function guideStorageKey(pageId){
    return `${GUIDE_KEYS.skipPrefix}_${pageId}`;
  }

  function shouldSkipGuide(pageId){
    try{
      return localStorage.getItem(guideStorageKey(pageId))===getGuideSessionId();
    }catch{
      return false;
    }
  }

  function markSkipGuide(pageId){
    try{
      localStorage.setItem(guideStorageKey(pageId),getGuideSessionId());
    }catch{}
  }

  function ensureGuideStyles(){
    if(document.getElementById("warmGuideStyle"))return;
    const style=document.createElement("style");
    style.id="warmGuideStyle";
    style.textContent=`
.guide-mask{
  position:fixed;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:16px;
  background:rgba(139,115,85,.26);
  opacity:0;
  pointer-events:none;
  transition:opacity .2s ease-in-out;
  z-index:80;
}
.guide-mask.show{
  opacity:1;
  pointer-events:auto;
}
.guide-panel{
  position:relative;
  width:80%;
  max-width:600px;
  border-radius:16px;
  background:#FFFBF5;
  border:1px solid rgba(217,197,176,.9);
  box-shadow:inset 0 2px 4px rgba(217,197,176,0.3),0 4px 8px rgba(240,240,240,0.5);
  padding:18px 18px 16px;
  transform:scale(.8);
  opacity:0;
  transition:transform .3s ease,opacity .3s ease;
}
.guide-panel.show{
  transform:scale(1);
  opacity:1;
}
.guide-panel.hide{
  transform:scale(.9);
  opacity:0;
  transition:transform .2s ease,opacity .2s ease;
}
.guide-close{
  position:absolute;
  right:12px;
  top:10px;
  width:28px;
  height:28px;
  border:0;
  border-radius:50%;
  background:transparent;
  color:#c1a890;
  font-size:18px;
  cursor:pointer;
}
.guide-close:hover{color:#a78e79}
.guide-title{
  margin:0 32px 8px 0;
  font-family:"YouYuan","STKaiti","KaiTi","Comic Sans MS",cursive;
  color:#F4A868;
  font-size:20px;
  font-weight:700;
}
.guide-body{
  font-family:"PingFang SC","Microsoft YaHei","Segoe UI",sans-serif;
  color:#A6937C;
  font-size:14px;
  line-height:1.6;
}
.guide-line{margin:0 0 6px}
.guide-skip{
  display:flex;
  align-items:center;
  gap:8px;
  margin-top:10px;
  font-size:13px;
  color:#A6937C;
}
.guide-actions{
  display:flex;
  justify-content:center;
  gap:10px;
  margin-top:14px;
  flex-wrap:wrap;
}
.guide-primary,.guide-secondary{
  border-radius:16px;
  padding:10px 16px;
  font-size:14px;
  font-weight:700;
  cursor:pointer;
  min-height:40px;
}
.guide-primary{
  border:0;
  color:#fff;
  background:linear-gradient(180deg,#F4A868,#F2995E);
  box-shadow:0 8px 16px rgba(242,153,94,.28);
}
.guide-secondary{
  border:1px solid #D9C5B0;
  background:transparent;
  color:#8B7355;
}
.guide-secondary:hover{
  background:#F9EED8;
}
@media (max-width:680px){
  .guide-panel{width:90%}
  .guide-title{font-size:22px}
  .guide-body{font-size:16px}
  .guide-primary,.guide-secondary{
    font-size:16px;
    padding:12px 18px;
    min-height:44px;
  }
  .guide-skip{font-size:15px}
}
@media (prefers-reduced-motion:reduce){
  .guide-mask,.guide-panel{transition:none !important}
}
`;
    document.head.appendChild(style);
  }

  function normalizeGuideLines(body){
    if(Array.isArray(body)){
      return body.flatMap((line)=>String(line||"").split(/\n+/)).filter(Boolean);
    }
    return String(body||"").split(/\n+/).filter(Boolean);
  }

  function showGuideModal(options){
    if(!options||!options.pageId)return;
    if(shouldSkipGuide(options.pageId))return;

    ensureGuideStyles();

    // 1) 构建弹窗 DOM 结构（完全独立，不污染原页面布局）
    const mask=document.createElement("div");
    mask.className="guide-mask";
    mask.setAttribute("role","dialog");
    mask.setAttribute("aria-modal","true");
    mask.setAttribute("aria-label","页面引导");

    const panel=document.createElement("div");
    panel.className="guide-panel";

    const closeBtn=document.createElement("button");
    closeBtn.className="guide-close";
    closeBtn.type="button";
    closeBtn.setAttribute("aria-label","关闭引导弹窗");
    closeBtn.textContent="×";

    const title=document.createElement("h3");
    title.className="guide-title";
    title.textContent=String(options.title||"");

    const body=document.createElement("div");
    body.className="guide-body";
    normalizeGuideLines(options.body).forEach((line)=>{
      const p=document.createElement("p");
      p.className="guide-line";
      p.textContent=line;
      body.appendChild(p);
    });

    const skipLabel=document.createElement("label");
    skipLabel.className="guide-skip";
    const skipBox=document.createElement("input");
    skipBox.type="checkbox";
    skipBox.setAttribute("aria-label","本次不再提醒");
    const skipText=document.createElement("span");
    skipText.textContent="🐾 本次不再提醒";
    skipLabel.appendChild(skipBox);
    skipLabel.appendChild(skipText);

    const actions=document.createElement("div");
    actions.className="guide-actions";
    const primary=document.createElement("button");
    primary.className="guide-primary";
    primary.type="button";
    primary.textContent=String(options.primaryText||"🐾 我知道啦");
    const secondary=document.createElement("button");
    secondary.className="guide-secondary";
    secondary.type="button";
    secondary.textContent=String(options.secondaryText||"💭 稍后再看");

    actions.appendChild(primary);
    if(options.secondaryText!==null&&options.secondaryText!==undefined&&options.secondaryText!==""){
      actions.appendChild(secondary);
    }

    panel.appendChild(closeBtn);
    panel.appendChild(title);
    panel.appendChild(body);
    panel.appendChild(skipLabel);
    panel.appendChild(actions);
    mask.appendChild(panel);
    document.body.appendChild(mask);

    let closed=false;
    // 2) 延迟弹出，营造轻微放大动效
    const delay=Number.isFinite(Number(options.delay))?Number(options.delay):300;
    const openTimer=setTimeout(()=>{
      mask.classList.add("show");
      panel.classList.add("show");
    },Math.max(0,delay));

    function cleanup(){
      if(closed)return;
      closed=true;
      clearTimeout(openTimer);
      // 3) 若勾选“本次不再提醒”，仅本次会话内不再弹出
      if(skipBox.checked)markSkipGuide(options.pageId);
      panel.classList.add("hide");
      mask.classList.remove("show");
      setTimeout(()=>mask.remove(),220);
      document.removeEventListener("keydown",onKeydown);
    }

    function onKeydown(ev){
      if(ev.key==="Escape")cleanup();
    }

    closeBtn.addEventListener("click",cleanup);
    primary.addEventListener("click",cleanup);
    secondary.addEventListener("click",cleanup);
    mask.addEventListener("click",(ev)=>{if(ev.target===mask)cleanup();});
    document.addEventListener("keydown",onKeydown);
  }

  window.WarmCat={
    KEYS,
    SESSION_KEYS,
    GUIDE_KEYS,
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
    initMusic,
    showGuideModal
  };
})();
