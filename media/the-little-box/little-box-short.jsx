// little-box-short.jsx — LocalDiabetic "The little box" short (16:9, ~44s).
// Same motion system + palette as the founder short.
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
  [27.4,CREAM],[28.2,DARK],
  [38.8,DARK],[39.6,CREAM],[44,CREAM]
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
      {/* glow */}
      <ellipse cx="170" cy="150" rx="150" ry="42" fill="rgba(242,180,65,0.16)"/>
      {/* top face */}
      <path d="M70 96 L170 64 L290 96 L190 130 Z" fill="#FCE4B0" stroke={INK} strokeWidth="3.4" strokeLinejoin="round"/>
      {/* front face */}
      <path d="M70 96 L190 130 L190 198 L70 168 Z" fill={HONEY} stroke={INK} strokeWidth="3.4" strokeLinejoin="round"/>
      {/* side face */}
      <path d="M190 130 L290 96 L290 160 L190 198 Z" fill="#E0A93B" stroke={INK} strokeWidth="3.4" strokeLinejoin="round"/>
      {/* front detail: vent lines */}
      <g stroke="rgba(43,33,24,0.5)" strokeWidth="2.4">
        <line x1="84" y1="120" x2="150" y2="137"/>
        <line x1="84" y1="132" x2="150" y2="149"/>
        <line x1="84" y1="144" x2="150" y2="161"/>
      </g>
      {/* power LED (honey-white) */}
      <circle cx="170" cy="176" r="6" fill="#FFF6E0" stroke={INK} strokeWidth="2.4"/>
      {/* local-node activity dot (green pulse) */}
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
  const items=['Jetson Orin Nano','Mac mini','ZimaBoard 2','Synology NAS','ZimaCube 2'];
  return (
    <div style={{position:'absolute',left:'50%',top,transform:'translateX(-50%)',width:1300,maxWidth:'90%',
      display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}>
      {items.map((it,i)=>{
        const t0=0.3+i*0.26;
        const p=ease(clamp((localTime-t0)/0.5,0,1));
        return (
          <span key={i} style={{fontFamily:SANS,fontSize:36,fontWeight:700,color:INK,
            background:'#fff',border:'1.5px solid #E6D9BF',borderRadius:999,padding:'15px 32px',
            boxShadow:'0 16px 32px -26px rgba(43,33,24,.5)',
            opacity:p,transform:`translateY(${(1-p)*20}px) scale(${0.93+p*0.07})`}}>{it}</span>
        );
      })}
    </div>
  );
}

/* ---------- stat trio ---------- */
function Stats(){
  const {localTime}=useSprite();
  const items=[['$0','per month, forever'],['100%','stays in your home'],['24/7','awake, even offline']];
  return (
    <div style={{position:'absolute',left:'50%',top:430,transform:'translateX(-50%)',width:1300,
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

/* ============================ THE SHORT ============================ */
function LittleBoxShort(){
  const big  = {fontWeight:800,fontSize:84,letterSpacing:'-2.4px',color:INK,lineHeight:1.06};
  const bigD = {...big,color:CTXT};
  return (
    <Stage width={1920} height={1080} duration={44} background={CREAM} fps={30} persistKey="ldbox">
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
        <Cap top={300}>
          <Kicker text="Pick your box" color={DEEP}/>
          <div style={{...big,fontSize:72,marginTop:24}}>Start anywhere.</div>
        </Cap>
        <Devices top={560}/>
      </Sprite>

      {/* S6 — privacy, on dark */}
      <Sprite start={28.2} end={34.6}>
        <Cap top={360}>
          <Kicker text="Privacy first" color={GREEN}/>
          <div style={{...bigD,fontSize:96,marginTop:30,lineHeight:1.1}}>No cloud.<br/>No subscription.<br/><span style={{color:HONEY}}>No data-mining.</span></div>
        </Cap>
      </Sprite>

      {/* S7 — stats, on dark */}
      <Sprite start={34.6} end={39.0}>
        <Cap top={250}><Kicker text="What the box represents" color={GREEN}/></Cap>
      </Sprite>
      <Sprite start={34.9} end={39.0}>
        <Stats/>
      </Sprite>

      {/* S8 — resolution + sign-off */}
      <Sprite start={39.6} end={44}>
        <Cap top={360}>
          <div style={big}>Your whole diabetic life,<br/>on a box <span style={{color:DEEP}}>you own.</span></div>
        </Cap>
      </Sprite>
      <Sprite start={40.3} end={44}>
        <Cap top={720}>
          <div style={{fontFamily:SANS,fontSize:60,fontWeight:900,letterSpacing:'-1.5px'}}>
            <span style={{color:INK}}>Win</span> <span style={{color:DEEP}}>big.</span>
          </div>
          <div style={{fontFamily:MONO,fontSize:24,fontWeight:600,letterSpacing:'.18em',textTransform:'uppercase',color:MUT,marginTop:16}}>
            Every day &middot; not someday &middot; 🐝
          </div>
        </Cap>
      </Sprite>
    </Stage>
  );
}

window.LittleBoxShort = LittleBoxShort;
