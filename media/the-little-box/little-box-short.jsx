// little-box-short.jsx — LocalDiabetic "The little box" short (16:9, ~58s).
// Walks the /box page: little box → 6 boxes → Grace Blackwell power tier →
// edge devices (phone + watch) → privacy → stats → LocalDiabetic / Win big. lockup.
const { Stage, Sprite, useTime, useSprite, clamp } = window;

/* ---------- palette ---------- */
const CREAM = "#FBF7EF", INK = "#2B2118", HONEY = "#F2B441", DEEP = "#D99A2B",
      MUT = "#6b5e4f", DARK = "#0B0F14", CTXT = "#F6EFDF", MUTD = "#9aa7b3",
      GREEN = "#2FB67A";
const SANS = "'Inter',-apple-system,BlinkMacSystemFont,sans-serif";
const MONO = "'JetBrains Mono','SFMono-Regular',ui-monospace,monospace";

/* ---------- easing ---------- */
const ease = (t) => 1 - Math.pow(1 - t, 3);
const eio  = (t) => (t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2);

/* ---------- color lerp ---------- */
const hx = (c) => { c = c.replace('#',''); return [parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)]; };
const lerpC = (a,b,t) => { const A=hx(a),B=hx(b); return `rgb(${Math.round(A[0]+(B[0]-A[0])*t)},${Math.round(A[1]+(B[1]-A[1])*t)},${Math.round(A[2]+(B[2]-A[2])*t)})`; };

const STOPS = [
  [0,DARK],[4.4,DARK],[5.1,CREAM],
  [27.6,CREAM],[28.2,DARK],
  [33.6,DARK],[34.2,CREAM],
  [39.8,CREAM],[40.4,DARK],
  [50.4,DARK],[51.0,CREAM],[58,CREAM]
];
function Backdrop(){
  const t = useTime();
  let c = CREAM;
  for (let i=0;i<STOPS.length-1;i++){
    const [t0,c0]=STOPS[i],[t1,c1]=STOPS[i+1];
    if (t>=t0 && t<=t1){ const k=t1===t0?0:(t-t0)/(t1-t0); c=lerpC(c0,c1,eio(clamp(k,0,1))); break; }
  }
  if (t > STOPS[STOPS.length-1][0]) c = CREAM;
  return <div style={{position:'absolute',inset:0,background:c}}/>;
}

/* ---------- caption ---------- */
function Cap({children, top, width=1300, lift=34}){
  const {localTime,duration}=useSprite();
  const inT=clamp(localTime/0.55,0,1);
  const oz=0.45;
  const out=localTime>duration-oz?clamp((localTime-(duration-oz))/oz,0,1):0;
  const op=Math.min(ease(inT),1-out);
  const ty=(1-ease(inT))*lift - out*20 + (localTime/duration)*-8;
  return (
    <div style={{position:'absolute',left:'50%',top,transform:`translate(-50%, ${ty}px)`,
      width,maxWidth:'88%',textAlign:'center',opacity:op,
      fontFamily:SANS,textWrap:'pretty',lineHeight:1.1}}>
      {children}
    </div>
  );
}

function Kicker({text,color=DEEP}){
  return <div style={{fontFamily:MONO,fontSize:24,letterSpacing:'.24em',textTransform:'uppercase',fontWeight:600,color}}>{text}</div>;
}

/* ---------- bee mark ---------- */
function safeSprite(){ try { return useSprite(); } catch(e){ return {localTime:1}; } }
function BeeMark({size=150, theme='light'}){
  const {localTime}=safeSprite();
  const s = clamp(localTime/0.7,0,1);
  const sc = 0.7 + ease(s)*0.3;
  const op = ease(clamp(localTime/0.5,0,1));
  const L = theme==='dark';
  const aStroke=L?CTXT:INK, wFill=L?'#3a3526':'#FCE4B0', wStroke=L?HONEY:INK,
        bStroke=L?DARK:INK, hFill=L?'#E8EEF5':INK, eye=L?DARK:CREAM;
  return (
    <div style={{display:'inline-block',transform:`scale(${sc})`,opacity:op,transformOrigin:'center'}}>
      <svg width={size} height={size*1.1} viewBox="0 0 120 132" fill="none" style={{display:'block',overflow:'visible'}}>
        <path d="M54 20 C48 6 41 3 34 5" stroke={aStroke} strokeWidth="4.2" strokeLinecap="round"/>
        <path d="M66 20 C72 6 79 3 86 5" stroke={aStroke} strokeWidth="4.2" strokeLinecap="round"/>
        <circle cx="33" cy="5" r="4.4" fill={HONEY} stroke={aStroke} strokeWidth="3"/>
        <circle cx="87" cy="5" r="4.4" fill={HONEY} stroke={aStroke} strokeWidth="3"/>
        <ellipse cx="36" cy="54" rx="19" ry="26" fill={wFill} stroke={wStroke} strokeWidth="4.2" transform="rotate(-24 36 54)"/>
        <ellipse cx="84" cy="54" rx="19" ry="26" fill={wFill} stroke={wStroke} strokeWidth="4.2" transform="rotate(24 84 54)"/>
        <rect x="40" y="44" width="40" height="72" rx="20" fill={HONEY} stroke={bStroke} strokeWidth="4.2"/>
        <g clipPath="url(#lbbk)">
          <rect x="36" y="66" width="48" height="12" fill={bStroke}/>
          <rect x="36" y="90" width="48" height="12" fill={bStroke}/>
        </g>
        <clipPath id="lbbk"><rect x="40" y="44" width="40" height="72" rx="20"/></clipPath>
        <circle cx="60" cy="31" r="17" fill={hFill}/>
        <circle cx="53" cy="29" r="3.4" fill={eye}/>
        <circle cx="67" cy="29" r="3.4" fill={eye}/>
      </svg>
    </div>
  );
}

/* ---------- the little box illustration ---------- */
function LittleBox({reveal=1}){
  const {localTime}=useSprite();
  const pulse = 0.5 + 0.5*Math.sin(localTime*3.2);
  const r = ease(clamp(reveal,0,1));
  return (
    <svg width="340" height="250" viewBox="0 0 340 250" fill="none" style={{display:'block',overflow:'visible',opacity:r,transform:`scale(${0.9+r*0.1})`,transformOrigin:'center'}}>
      <ellipse cx="170" cy="150" rx="150" ry="42" fill="rgba(242,180,65,0.16)"/>
      <path d="M70 96 L170 64 L290 96 L190 130 Z" fill="#FCE4B0" stroke={INK} strokeWidth="3.4" strokeLinejoin="round"/>
      <path d="M70 96 L190 130 L190 198 L70 168 Z" fill={HONEY} stroke={INK} strokeWidth="3.4" strokeLinejoin="round"/>
      <path d="M190 130 L290 96 L290 160 L190 198 Z" fill="#E0A93B" stroke={INK} strokeWidth="3.4" strokeLinejoin="round"/>
      <g stroke="rgba(43,33,24,0.5)" strokeWidth="2.4">
        <line x1="84" y1="120" x2="150" y2="137"/>
        <line x1="84" y1="132" x2="150" y2="149"/>
        <line x1="84" y1="144" x2="150" y2="161"/>
      </g>
      <circle cx="170" cy="176" r="6" fill="#FFF6E0" stroke={INK} strokeWidth="2.4"/>
      <circle cx="262" cy="120" r={7+pulse*3} fill={GREEN} opacity={0.25+pulse*0.25}/>
      <circle cx="262" cy="120" r="5" fill={GREEN} stroke={INK} strokeWidth="2"/>
    </svg>
  );
}

/* ---------- labels orbiting the box ---------- */
function BoxLabels(){
  const {localTime}=useSprite();
  const items = [
    {t:'Your records', d:0.4, x:-360, y:-40},
    {t:'The LifeBoard', d:0.95, x:330, y:-40},
    {t:'Your Bee', d:1.5, x:-360, y:90},
    {t:'Stays home', d:2.05, x:330, y:90},
  ];
  return (
    <div style={{position:'absolute',left:'50%',top:'50%',width:0,height:0}}>
      {items.map((it,i)=>{
        const p=ease(clamp((localTime-it.d)/0.6,0,1));
        return (
          <div key={i} style={{position:'absolute',left:it.x,top:it.y,transform:`translate(-50%,-50%) translateY(${(1-p)*14}px)`,
            opacity:p,whiteSpace:'nowrap'}}>
            <span style={{fontFamily:SANS,fontSize:34,fontWeight:800,color:INK,letterSpacing:'-0.5px',
              background:'#fff',border:'1.5px solid #E6D9BF',borderRadius:999,padding:'12px 26px',
              boxShadow:'0 18px 36px -26px rgba(43,33,24,.5)'}}>{it.t}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- device chips ---------- */
function Devices({top}){
  const {localTime}=useSprite();
  const items=['Jetson Orin Nano','Jetson AGX Orin','Mac mini','ZimaBoard 2','Synology NAS','ZimaCube 2'];
  return (
    <div style={{position:'absolute',left:'50%',top,transform:'translateX(-50%)',width:1340,maxWidth:'92%',
      display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}>
      {items.map((it,i)=>{
        const t0=0.3+i*0.22;
        const p=ease(clamp((localTime-t0)/0.5,0,1));
        return (
          <span key={i} style={{fontFamily:SANS,fontSize:34,fontWeight:700,color:INK,
            background:'#fff',border:'1.5px solid #E6D9BF',borderRadius:999,padding:'15px 30px',
            boxShadow:'0 16px 32px -26px rgba(43,33,24,.5)',
            opacity:p,transform:`translateY(${(1-p)*20}px) scale(${0.93+p*0.07})`}}>{it}</span>
        );
      })}
    </div>
  );
}

/* ---------- Grace Blackwell power box (gold mesh) ---------- */
function PowerBox(){
  const {localTime}=useSprite();
  const r=ease(clamp(localTime/0.7,0,1));
  const pulse=0.5+0.5*Math.sin(localTime*2.6);
  return (
    <svg width="440" height="240" viewBox="0 0 440 240" fill="none" style={{display:'block',overflow:'visible',opacity:r,transform:`scale(${0.92+r*0.08})`,transformOrigin:'center'}}>
      <defs>
        <linearGradient id="pbgold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F6E0A0"/><stop offset="0.5" stopColor="#E2B85E"/><stop offset="1" stopColor="#C2963C"/>
        </linearGradient>
        <pattern id="pbmesh" width="11" height="11" patternUnits="userSpaceOnUse">
          <circle cx="5.5" cy="5.5" r="1.8" fill="#9c7426" opacity="0.5"/>
        </pattern>
      </defs>
      <ellipse cx="220" cy="180" rx="185" ry="40" fill="rgba(242,180,65,0.20)"/>
      <path d="M96 96 L220 70 L344 96 L220 122 Z" fill="#F2D58A" stroke="#8a6a28" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M96 96 L220 122 L220 188 L96 162 Z" fill="url(#pbgold)" stroke="#8a6a28" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M96 96 L220 122 L220 188 L96 162 Z" fill="url(#pbmesh)"/>
      <path d="M220 122 L344 96 L344 150 L220 188 Z" fill="#C99A3E" stroke="#8a6a28" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M220 122 L344 96 L344 150 L220 188 Z" fill="url(#pbmesh)"/>
      <circle cx="312" cy="120" r={9+pulse*4} fill={GREEN} opacity={0.25+pulse*0.25}/>
      <circle cx="312" cy="120" r="6" fill={GREEN} stroke="#8a6a28" strokeWidth="2"/>
    </svg>
  );
}
function PowerChips({top}){
  const {localTime}=useSprite();
  const items=[['NVIDIA DGX Spark','1 PFLOP · 128GB'],['ASUS Ascent GX10','1000 TOPS · 1TB']];
  return (
    <div style={{position:'absolute',left:'50%',top,transform:'translateX(-50%)',display:'flex',gap:28}}>
      {items.map((it,i)=>{
        const p=ease(clamp((localTime-(0.9+i*0.35))/0.5,0,1));
        return <div key={i} style={{opacity:p,transform:`translateY(${(1-p)*18}px)`,textAlign:'center',
          background:'rgba(242,180,65,0.08)',border:'1px solid rgba(242,180,65,0.3)',borderRadius:18,padding:'18px 36px'}}>
          <div style={{fontFamily:SANS,fontSize:34,fontWeight:800,color:CTXT}}>{it[0]}</div>
          <div style={{fontFamily:MONO,fontSize:22,color:HONEY,marginTop:6,letterSpacing:'.04em'}}>{it[1]}</div>
        </div>;
      })}
    </div>
  );
}

/* ---------- edge devices (phone + watch) ---------- */
function PhoneSVG({w=210}){
  return (
    <svg width={w} height={w*150/86} viewBox="0 0 86 150" fill="none" style={{display:'block',filter:'drop-shadow(0 30px 40px rgba(43,33,24,.22))'}}>
      <defs><linearGradient id="shiporange" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#E07B38"/><stop offset="1" stopColor="#BD5F26"/></linearGradient></defs>
      <rect x="6" y="4" width="74" height="142" rx="17" fill="url(#shiporange)"/>
      <rect x="10" y="8" width="66" height="134" rx="13" fill="#0B0F14"/>
      <rect x="13" y="11" width="60" height="128" rx="10" fill="#FBF7EF"/>
      <rect x="31" y="15" width="24" height="7" rx="3.5" fill="#0B0F14"/>
      <rect x="18" y="30" width="50" height="28" rx="7" fill="#FBF0D8" stroke="#F0DCA8" strokeWidth="1.4"/>
      <circle cx="28" cy="41" r="4.6" fill="#F2B441"/>
      <rect x="37" y="37" width="25" height="4" rx="2" fill="#caa86a"/>
      <rect x="37" y="45" width="18" height="3.2" rx="1.6" fill="#ddc79a"/>
      <rect x="18" y="64" width="50" height="20" rx="6" fill="#f1f6f2" stroke="#cfe6d8" strokeWidth="1.2"/>
      <circle cx="28" cy="74" r="4" fill="#2FB67A"/>
      <rect x="37" y="71" width="24" height="3.4" rx="1.7" fill="#9ec9b1"/>
      <rect x="37" y="78" width="15" height="3" rx="1.5" fill="#bcdac9"/>
      <rect x="18" y="90" width="50" height="20" rx="6" fill="#f7f1e6" stroke="#ece0c8" strokeWidth="1.2"/>
      <circle cx="28" cy="100" r="4" fill="#D99A2B"/>
      <rect x="37" y="97" width="22" height="3.4" rx="1.7" fill="#cdb78e"/>
      <rect x="37" y="104" width="14" height="3" rx="1.5" fill="#ddcaa0"/>
    </svg>
  );
}
function WatchSVG({w=250}){
  return (
    <svg width={w} height={w*150/100} viewBox="0 0 100 150" fill="none" style={{display:'block',filter:'drop-shadow(0 30px 40px rgba(43,33,24,.22))'}}>
      <defs><linearGradient id="shrosecase" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#EAC4B2"/><stop offset="1" stopColor="#D4A48E"/></linearGradient></defs>
      <path d="M35 8 L65 8 L62 36 L38 36 Z" fill="#EFEAE4" stroke="#d8cfc4" strokeWidth="1.2"/>
      <path d="M38 114 L62 114 L65 142 L35 142 Z" fill="#EFEAE4" stroke="#d8cfc4" strokeWidth="1.2"/>
      <rect x="22" y="30" width="56" height="90" rx="21" fill="url(#shrosecase)" stroke="#b98e78" strokeWidth="2"/>
      <rect x="28" y="36" width="44" height="78" rx="16" fill="#0B0F14"/>
      <rect x="34" y="46" width="32" height="19" rx="6" fill="#16140f"/>
      <circle cx="43" cy="55.5" r="4.6" fill="#F2B441"/>
      <rect x="51" y="51" width="12" height="3.4" rx="1.7" fill="#caa86a"/>
      <rect x="51" y="58" width="9" height="3" rx="1.5" fill="#7a6a48"/>
      <rect x="34" y="70" width="32" height="30" rx="7" fill="#16140f"/>
      <circle cx="50" cy="82" r="8.5" fill="none" stroke="#2FB67A" strokeWidth="2.3"/>
      <path d="M46 82 l3 3 l5 -6" fill="none" stroke="#2FB67A" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="40" y="93" width="20" height="3.2" rx="1.6" fill="#5b6b78"/>
      <rect x="78" y="56" width="6" height="14" rx="3" fill="#D4A48E" stroke="#b98e78" strokeWidth="1.2"/>
      <rect x="79" y="74" width="4" height="16" rx="2" fill="#cf9f89"/>
    </svg>
  );
}
function EdgeDevices(){
  const {localTime}=useSprite();
  const pP=ease(clamp((localTime-0.2)/0.6,0,1));
  const pW=ease(clamp((localTime-0.55)/0.6,0,1));
  return (
    <div style={{position:'absolute',left:'50%',top:'56%',transform:'translate(-50%,-50%)',display:'flex',gap:110,alignItems:'center'}}>
      <div style={{textAlign:'center',opacity:pP,transform:`translateY(${(1-pP)*26}px)`}}>
        <PhoneSVG/>
        <div style={{fontFamily:SANS,fontSize:30,fontWeight:700,color:INK,marginTop:22}}>iPhone</div>
      </div>
      <div style={{textAlign:'center',opacity:pW,transform:`translateY(${(1-pW)*26}px)`}}>
        <WatchSVG/>
        <div style={{fontFamily:SANS,fontSize:30,fontWeight:700,color:INK,marginTop:22}}>Apple Watch</div>
      </div>
    </div>
  );
}

/* ---------- stat trio ---------- */
function Stats(){
  const {localTime}=useSprite();
  const items=[['$0','per month, forever'],['100%','stays in your home'],['24/7','awake, even offline']];
  return (
    <div style={{position:'absolute',left:'50%',top:440,transform:'translateX(-50%)',width:1300,
      display:'flex',gap:30,justifyContent:'center'}}>
      {items.map((it,i)=>{
        const t0=0.3+i*0.4;
        const p=ease(clamp((localTime-t0)/0.6,0,1));
        return (
          <div key={i} style={{opacity:p,transform:`translateY(${(1-p)*20}px)`,textAlign:'center',
            background:'rgba(255,255,255,0.04)',border:'1px solid #1F2A36',borderRadius:24,padding:'34px 48px',minWidth:300}}>
            <div style={{fontFamily:SANS,fontSize:88,fontWeight:800,letterSpacing:'-3px',color:HONEY,lineHeight:1}}>{it[0]}</div>
            <div style={{fontFamily:SANS,fontSize:28,fontWeight:600,color:MUTD,marginTop:12}}>{it[1]}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- finale logo lockup ---------- */
function FinaleLogo(){
  const {localTime}=useSprite();
  const pW=ease(clamp((localTime-0.55)/0.6,0,1));
  const pT=ease(clamp((localTime-1.0)/0.6,0,1));
  const pS=ease(clamp((localTime-1.5)/0.6,0,1));
  return (
    <div style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',textAlign:'center',fontFamily:SANS,width:1400}}>
      <BeeMark size={150}/>
      <div style={{opacity:pW,transform:`translateY(${(1-pW)*16}px)`,fontSize:100,fontWeight:900,letterSpacing:'-3px',lineHeight:1,marginTop:8}}>
        <span style={{color:INK}}>Local</span><span style={{color:DEEP}}>Diabetic</span>
      </div>
      <div style={{opacity:pT,transform:`translateY(${(1-pT)*16}px)`,marginTop:14,fontSize:124,fontWeight:900,letterSpacing:'-3.5px',lineHeight:1}}>
        <span style={{color:INK}}>Win</span> <span style={{color:HONEY}}>big.</span>
      </div>
      <div style={{opacity:pS,fontFamily:MONO,fontSize:25,fontWeight:600,letterSpacing:'.2em',textTransform:'uppercase',color:MUT,marginTop:28}}>
        Every day &middot; not someday &middot; 🐝
      </div>
    </div>
  );
}

/* ============================ THE SHORT ============================ */
function LittleBoxShort(){
  const big  = {fontWeight:800,fontSize:84,letterSpacing:'-2.4px',color:INK,lineHeight:1.06};
  const bigD = {...big,color:CTXT};
  return (
    <Stage width={1920} height={1080} duration={58} background={CREAM} fps={30} persistKey="ldbox">
      <Backdrop/>

      {/* S1 — cold open */}
      <Sprite start={0} end={5.1}>
        <Cap top={300}><BeeMark size={170} theme="dark"/></Cap>
      </Sprite>
      <Sprite start={0.5} end={5.1}>
        <Cap top={560}>
          <Kicker text="The little box" color={HONEY}/>
          <div style={{fontFamily:SANS,fontSize:52,fontWeight:700,color:CTXT,marginTop:26,letterSpacing:'-0.6px'}}>
            Your whole diabetic life &mdash; at home.
          </div>
        </Cap>
      </Sprite>

      {/* S2 — the problem */}
      <Sprite start={4.6} end={9.6}>
        <Cap top={400}>
          <div style={big}>Your diabetic life is <span style={{color:DEEP}}>scattered</span>.</div>
          <div style={{fontFamily:SANS,fontSize:40,fontWeight:600,color:MUT,marginTop:30,lineHeight:1.4}}>
            Ten apps, a drawer of paper, and a cloud you don&rsquo;t control.
          </div>
        </Cap>
      </Sprite>

      {/* S3 — the shift */}
      <Sprite start={9.6} end={14.2}>
        <Cap top={420}>
          <div style={big}>What if it all lived on<br/><span style={{color:DEEP}}>one small box?</span></div>
        </Cap>
      </Sprite>

      {/* S4 — the box centerpiece + labels */}
      <Sprite start={14.2} end={21.6}>
        <div style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)'}}>
          <LittleBox reveal={1}/>
        </div>
      </Sprite>
      <Sprite start={14.8} end={21.6}>
        <div style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)'}}>
          <BoxLabels/>
        </div>
      </Sprite>
      <Sprite start={14.9} end={21.6}>
        <Cap top={150}><Kicker text="One box · four jobs" color={DEEP}/></Cap>
      </Sprite>

      {/* S5 — devices */}
      <Sprite start={21.6} end={27.6}>
        <Cap top={280}>
          <Kicker text="Pick your box" color={DEEP}/>
          <div style={{...big,fontSize:72,marginTop:24}}>Start anywhere.</div>
        </Cap>
        <Devices top={520}/>
      </Sprite>

      {/* S5b — Grace Blackwell power tier, on dark */}
      <Sprite start={28.2} end={34.0}>
        <Cap top={120}><Kicker text="Powered by NVIDIA Grace Blackwell" color={HONEY}/></Cap>
        <Cap top={188}><div style={{...bigD,fontSize:66}}>Or the whole hive, <span style={{color:HONEY}}>on your desk.</span></div></Cap>
        <div style={{position:'absolute',left:'50%',top:'56%',transform:'translate(-50%,-50%)'}}><PowerBox/></div>
        <PowerChips top={830}/>
      </Sprite>

      {/* S5c — edge devices, on cream */}
      <Sprite start={34.2} end={40.2}>
        <Cap top={110}><Kicker text="What you carry" color={DEEP}/></Cap>
        <Cap top={176}><div style={{...big,fontSize:62}}>The box stays home. The nudges find <span style={{color:DEEP}}>you</span>.</div></Cap>
        <EdgeDevices/>
      </Sprite>

      {/* S6 — privacy, on dark */}
      <Sprite start={40.4} end={46.4}>
        <Cap top={340}>
          <Kicker text="Privacy first" color={GREEN}/>
          <div style={{...bigD,fontSize:92,marginTop:30,lineHeight:1.1}}>No cloud.<br/>No subscription.<br/><span style={{color:HONEY}}>No data-mining.</span></div>
        </Cap>
      </Sprite>

      {/* S7 — stats, on dark */}
      <Sprite start={46.4} end={50.8}>
        <Cap top={260}><Kicker text="What the box represents" color={GREEN}/></Cap>
      </Sprite>
      <Sprite start={46.7} end={50.8}>
        <Stats/>
      </Sprite>

      {/* S8 — resolution */}
      <Sprite start={51.0} end={53.4}>
        <Cap top={430}>
          <div style={big}>Your whole diabetic life,<br/>on a box <span style={{color:DEEP}}>you own.</span></div>
        </Cap>
      </Sprite>

      {/* S9 — LocalDiabetic / Win big. lockup */}
      <Sprite start={53.4} end={58}>
        <FinaleLogo/>
      </Sprite>
    </Stage>
  );
}

window.LittleBoxShort = LittleBoxShort;
