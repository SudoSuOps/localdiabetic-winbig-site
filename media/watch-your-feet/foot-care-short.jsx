// foot-care-short.jsx — LocalDiabetic "Watch your feet" Lifeboard short (16:9, ~60s).
// Daily photo inspection → on-device vision model reads & records → builds history →
// early-warning detection → share with care team → order inserts & offloaders → privacy → Win big.
const { Stage, Sprite, useTime, useSprite, clamp } = window;

/* ---------- palette ---------- */
const CREAM = "#FBF7EF", INK = "#2B2118", HONEY = "#F2B441", DEEP = "#D99A2B",
      MUT = "#6b5e4f", DARK = "#0B0F14", CTXT = "#F6EFDF", MUTD = "#9aa7b3",
      GREEN = "#2FB67A", AMBER = "#E8902A", TERRA = "#C56A3E", TAN = "#D9B47A",
      SKIN = "#EFE3CC";
const SANS = "'Inter',-apple-system,BlinkMacSystemFont,sans-serif";
const MONO = "'JetBrains Mono','SFMono-Regular',ui-monospace,monospace";

/* ---------- easing ---------- */
const ease = (t) => 1 - Math.pow(1 - t, 3);
const eio  = (t) => (t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2);

/* ---------- color lerp ---------- */
const hx = (c) => { c = c.replace('#',''); return [parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)]; };
const lerpC = (a,b,t) => { const A=hx(a),B=hx(b); return `rgb(${Math.round(A[0]+(B[0]-A[0])*t)},${Math.round(A[1]+(B[1]-A[1])*t)},${Math.round(A[2]+(B[2]-A[2])*t)})`; };

const STOPS = [
  [0,DARK],[4.3,DARK],[5.0,CREAM],
  [14.4,CREAM],[15.0,DARK],
  [27.0,DARK],[27.6,CREAM],
  [45.2,CREAM],[45.8,DARK],
  [52.2,DARK],[52.8,CREAM],[60.3,CREAM]
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
        <g clipPath="url(#ftbk)">
          <rect x="36" y="66" width="48" height="12" fill={bStroke}/>
          <rect x="36" y="90" width="48" height="12" fill={bStroke}/>
        </g>
        <clipPath id="ftbk"><rect x="40" y="44" width="40" height="72" rx="20"/></clipPath>
        <circle cx="60" cy="31" r="17" fill={hFill}/>
        <circle cx="53" cy="29" r="3.4" fill={eye}/>
        <circle cx="67" cy="29" r="3.4" fill={eye}/>
      </svg>
    </div>
  );
}

/* ---------- top-down foot shape ---------- */
function FootShape({fill=SKIN, stroke=INK, sw=3.4}){
  return (
    <g>
      <path d="M100,70 C70,68 62,96 66,140 C70,200 76,250 86,290 C92,314 108,314 114,290 C124,250 130,200 134,140 C138,96 130,68 100,70 Z" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round"/>
      <circle cx="78" cy="44" r="15" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <circle cx="103" cy="33" r="12" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <circle cx="123" cy="36" r="10" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <circle cx="139" cy="44" r="9" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <circle cx="152" cy="55" r="7.5" fill={fill} stroke={stroke} strokeWidth={sw}/>
    </g>
  );
}

/* ---------- phone doing daily inspection ---------- */
function PhoneFoot(){
  const {localTime}=useSprite();
  const flash = (localTime>1.2 && localTime<1.55) ? (1-(localTime-1.2)/0.35) : 0;
  const saved = ease(clamp((localTime-1.7)/0.5,0,1));
  const rise = ease(clamp(localTime/0.6,0,1));
  return (
    <div style={{position:'relative',opacity:rise,transform:`translateY(${(1-rise)*22}px)`}}>
      <svg width="250" height="430" viewBox="0 0 120 206" fill="none" style={{display:'block',filter:'drop-shadow(0 32px 44px rgba(43,33,24,.24))'}}>
        <rect x="6" y="4" width="108" height="198" rx="22" fill={INK}/>
        <rect x="11" y="11" width="98" height="184" rx="15" fill={CREAM}/>
        {/* viewfinder brackets */}
        <g stroke={HONEY} strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M28 36 L28 28 L36 28"/><path d="M92 36 L92 28 L84 28"/>
          <path d="M28 132 L28 140 L36 140"/><path d="M92 132 L92 140 L84 140"/>
        </g>
        {/* foot in frame */}
        <g transform="translate(35,38) scale(0.30)"><FootShape/></g>
        {/* shutter */}
        <circle cx="60" cy="172" r="14" fill="none" stroke={HONEY} strokeWidth="3"/>
        <circle cx="60" cy="172" r="9.5" fill={HONEY}/>
        {/* flash */}
        <rect x="11" y="11" width="98" height="184" rx="15" fill="#fff" opacity={flash}/>
        {/* saved badge */}
        <g opacity={saved} transform="translate(60,86)">
          <circle r="17" fill={GREEN}/>
          <path d="M-7 0 l5 5 l9 -10" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
      </svg>
    </div>
  );
}

/* ---------- foot scan: reads + records / early warning ---------- */
function FootScan({mode}){
  const {localTime}=useSprite();
  const rise = ease(clamp(localTime/0.6,0,1));
  const sweep = clamp(localTime/2.0,0,1);
  const y = 44 + sweep*250;
  const scanning = mode==='scan' && localTime<2.2;
  const recN = mode==='scan' ? clamp((localTime-1.3)/1.6,0,1) : 1;
  const zones=[{x:90,y:118},{x:128,y:188},{x:100,y:266}];
  const pulse=0.5+0.5*Math.sin(localTime*3);
  return (
    <svg width="300" height="430" viewBox="0 0 200 340" fill="none" style={{display:'block',overflow:'visible',opacity:rise,transform:`translateY(${(1-rise)*18}px)`}}>
      <ellipse cx="100" cy="300" rx="92" ry="24" fill={mode==='warn'?'rgba(232,144,42,0.16)':'rgba(47,182,122,0.14)'}/>
      <FootShape/>
      {/* recorded zone nodes */}
      {zones.map((z,i)=>{
        const p=clamp(recN*3 - i,0,1);
        const warnZone = mode==='warn' && i===0;
        return (
          <g key={i} opacity={p} transform={`translate(${z.x},${z.y})`}>
            <circle r="9" fill={warnZone?AMBER:GREEN} stroke={INK} strokeWidth="2.4"/>
            {!warnZone && <path d="M-4 0 l3 3 l5 -6" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>}
            {warnZone && <path d="M0 -4 L0 1 M0 4 L0 4.6" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"/>}
          </g>
        );
      })}
      {/* scan line */}
      {scanning && (
        <g>
          <rect x="56" y={y-14} width="88" height="28" fill="url(#scanglow)"/>
          <line x1="56" y1={y} x2="144" y2={y} stroke={HONEY} strokeWidth="3.4" strokeLinecap="round"/>
        </g>
      )}
      {/* warning pulse ring */}
      {mode==='warn' && (
        <g transform="translate(90,118)">
          <circle r={14+pulse*7} fill="none" stroke={AMBER} strokeWidth="2.4" opacity={0.5-pulse*0.35}/>
        </g>
      )}
      <defs>
        <linearGradient id="scanglow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(242,180,65,0)"/><stop offset="0.5" stopColor="rgba(242,180,65,0.32)"/><stop offset="1" stopColor="rgba(242,180,65,0)"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ---------- inserts / offloaders row ---------- */
function InsoleMini(){ return <svg width="76" height="76" viewBox="0 0 80 80"><g transform="translate(24,8) scale(0.165)"><FootShape fill={HONEY} sw={5}/></g></svg>; }
function PadMini(){ return <svg width="76" height="76" viewBox="0 0 80 80"><path d="M40 14 C58 14 64 38 56 54 C50 66 30 66 24 54 C16 38 22 14 40 14 Z" fill={TERRA} stroke={INK} strokeWidth="3"/><ellipse cx="34" cy="34" rx="7" ry="9" fill="rgba(255,255,255,0.35)"/></svg>; }
function WedgeMini(){ return <svg width="76" height="76" viewBox="0 0 80 80"><path d="M14 60 L66 60 L66 26 Z" fill={TAN} stroke={INK} strokeWidth="3" strokeLinejoin="round"/></svg>; }
function CupMini(){ return <svg width="76" height="76" viewBox="0 0 80 80"><path d="M16 26 C16 64 64 64 64 26 L54 26 C54 50 26 50 26 26 Z" fill={DEEP} stroke={INK} strokeWidth="3" strokeLinejoin="round"/></svg>; }

function Inserts({top}){
  const {localTime}=useSprite();
  const parts=[
    {label:'Insole base', C:InsoleMini},
    {label:'Relief pad', C:PadMini},
    {label:'Wedge', C:WedgeMini},
    {label:'Heel cup', C:CupMini},
  ];
  return (
    <div style={{position:'absolute',left:'50%',top,transform:'translateX(-50%)',display:'flex',gap:26,justifyContent:'center'}}>
      {parts.map((p,i)=>{
        const t0=0.3+i*0.28;
        const a=ease(clamp((localTime-t0)/0.5,0,1));
        const C=p.C;
        return (
          <div key={i} style={{opacity:a,transform:`translateY(${(1-a)*22}px)`,textAlign:'center',
            background:'#fff',border:'1.5px solid #E6D9BF',borderRadius:22,padding:'26px 30px 20px',
            boxShadow:'0 20px 38px -28px rgba(43,33,24,.5)'}}>
            <C/>
            <div style={{fontFamily:SANS,fontSize:26,fontWeight:700,color:INK,marginTop:14}}>{p.label}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- stat trio ---------- */
function Stats({items, top=440}){
  const {localTime}=useSprite();
  return (
    <div style={{position:'absolute',left:'50%',top,transform:'translateX(-50%)',width:1320,
      display:'flex',gap:30,justifyContent:'center'}}>
      {items.map((it,i)=>{
        const t0=0.3+i*0.4;
        const p=ease(clamp((localTime-t0)/0.6,0,1));
        return (
          <div key={i} style={{opacity:p,transform:`translateY(${(1-p)*20}px)`,textAlign:'center',
            background:'rgba(255,255,255,0.04)',border:'1px solid #1F2A36',borderRadius:24,padding:'34px 46px',minWidth:300}}>
            <div style={{fontFamily:SANS,fontSize:84,fontWeight:800,letterSpacing:'-3px',color:HONEY,lineHeight:1}}>{it[0]}</div>
            <div style={{fontFamily:SANS,fontSize:27,fontWeight:600,color:MUTD,marginTop:12}}>{it[1]}</div>
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

/* ---------- share with care team ---------- */
function CareShare(){
  const {localTime}=useSprite();
  const rise=ease(clamp(localTime/0.55,0,1));
  const fly=ease(clamp((localTime-1.0)/1.1,0,1));
  const delivered=ease(clamp((localTime-2.25)/0.5,0,1));
  const dotX = 322 + fly*300;
  return (
    <div style={{position:'absolute',left:'50%',top:'60%',transform:'translate(-50%,-50%)',width:980,height:240,opacity:rise}}>
      {/* foot-history card */}
      <div style={{position:'absolute',left:0,top:40,width:312,display:'flex',gap:18,alignItems:'center',
        background:'#fff',border:'1.5px solid #E6D9BF',borderRadius:22,padding:'22px 24px',
        boxShadow:'0 22px 42px -28px rgba(43,33,24,.5)'}}>
        <svg width="58" height="84" viewBox="0 0 200 340" fill="none"><FootShape sw={6}/><circle cx="90" cy="118" r="15" fill={AMBER} stroke={INK} strokeWidth="5"/></svg>
        <div style={{textAlign:'left'}}>
          <div style={{fontFamily:SANS,fontSize:28,fontWeight:800,color:INK,letterSpacing:'-0.4px'}}>Foot history</div>
          <div style={{fontFamily:SANS,fontSize:21,fontWeight:600,color:MUT,marginTop:4}}>14 days &middot; 1 watch zone</div>
        </div>
      </div>
      {/* dotted path + travelling note */}
      <svg width="980" height="240" viewBox="0 0 980 240" fill="none" style={{position:'absolute',inset:0,overflow:'visible'}}>
        <line x1="322" y1="120" x2="668" y2="120" stroke={DEEP} strokeWidth="3" strokeDasharray="3 10" strokeLinecap="round" opacity="0.6"/>
        <g transform={`translate(${dotX},120) rotate(0)`} opacity={1-delivered}>
          <path d="M-13 -9 L15 0 L-13 9 L-7 0 Z" fill={HONEY} stroke={INK} strokeWidth="2.4" strokeLinejoin="round"/>
        </g>
      </svg>
      {/* clinician avatar */}
      <div style={{position:'absolute',right:0,top:14,width:200,textAlign:'center'}}>
        <div style={{position:'relative',width:104,height:104,margin:'0 auto'}}>
          <div style={{width:104,height:104,borderRadius:'50%',background:'#FCE4B0',border:'2px solid '+INK,
            display:'flex',alignItems:'center',justifyContent:'center',
            fontFamily:SANS,fontSize:40,fontWeight:800,color:INK}}>RV</div>
          <div style={{position:'absolute',right:2,bottom:2,width:36,height:36,borderRadius:'50%',background:GREEN,
            border:'2px solid #fff',display:'flex',alignItems:'center',justifyContent:'center',
            opacity:delivered,transform:`scale(${0.6+delivered*0.4})`}}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M4 9 l3 3 l7 -8" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
        <div style={{fontFamily:SANS,fontSize:27,fontWeight:800,color:INK,marginTop:14}}>Dr. Rivera</div>
        <div style={{fontFamily:SANS,fontSize:21,fontWeight:600,color:MUT,marginTop:2}}>Podiatry</div>
      </div>
    </div>
  );
}

/* ============================ THE SHORT ============================ */
function FootCareShort(){
  const big  = {fontWeight:800,fontSize:84,letterSpacing:'-2.4px',color:INK,lineHeight:1.06};
  const bigD = {...big,color:CTXT};
  return (
    <Stage width={1920} height={1080} duration={60.3} background={CREAM} fps={30} persistKey="ldfeet">
      <Backdrop/>

      {/* S1 — cold open */}
      <Sprite start={0} end={5.0}>
        <Cap top={300}><BeeMark size={170} theme="dark"/></Cap>
      </Sprite>
      <Sprite start={0.5} end={5.0}>
        <Cap top={560}>
          <Kicker text="Watch your feet" color={HONEY}/>
          <div style={{fontFamily:SANS,fontSize:52,fontWeight:700,color:CTXT,marginTop:26,letterSpacing:'-0.6px'}}>
            Your early-warning system &mdash; at home.
          </div>
        </Cap>
      </Sprite>

      {/* S2 — the stakes */}
      <Sprite start={4.5} end={9.5}>
        <Cap top={390}>
          <div style={big}>Diabetes shows up in your <span style={{color:DEEP}}>feet</span> first.</div>
          <div style={{fontFamily:SANS,fontSize:40,fontWeight:600,color:MUT,marginTop:30,lineHeight:1.4}}>
            The nerves go quiet &mdash; so you can&rsquo;t feel the warning.
          </div>
        </Cap>
      </Sprite>

      {/* S3 — daily inspection */}
      <Sprite start={9.5} end={15.0}>
        <Cap top={130}>
          <Kicker text="The daily check" color={DEEP}/>
          <div style={{...big,fontSize:72,marginTop:22}}>Two photos. Every day.</div>
        </Cap>
        <div style={{position:'absolute',left:'50%',top:'58%',transform:'translate(-50%,-50%)'}}><PhoneFoot/></div>
      </Sprite>

      {/* S4 — on-device read */}
      <Sprite start={15.2} end={21.6}>
        <Cap top={120}>
          <Kicker text="On your device" color={GREEN}/>
          <div style={{...bigD,fontSize:62,marginTop:20}}>Your LocalDiabetic vision model <span style={{color:HONEY}}>reads</span> them.</div>
        </Cap>
        <div style={{position:'absolute',left:'50%',top:'60%',transform:'translate(-50%,-50%)'}}><FootScan mode="scan"/></div>
      </Sprite>
      <Sprite start={21.0} end={27.0}>
        <Cap top={840}>
          <div style={{fontFamily:SANS,fontSize:38,fontWeight:600,color:MUTD}}>
            It records every inch &mdash; and builds your history.
          </div>
        </Cap>
      </Sprite>

      {/* S5 — early warning */}
      <Sprite start={27.8} end={33.6}>
        <Cap top={120}>
          <Kicker text="Early warning" color={DEEP}/>
          <div style={{...big,fontSize:60,marginTop:20}}>It tells you what <span style={{color:DEEP}}>changed</span>.</div>
        </Cap>
        <div style={{position:'absolute',left:'50%',top:'60%',transform:'translate(-50%,-50%)'}}><FootScan mode="warn"/></div>
        <Cap top={870}>
          <div style={{fontFamily:SANS,fontSize:36,fontWeight:700,color:MUT}}>Catch it at a red mark &mdash; not an ulcer.</div>
        </Cap>
      </Sprite>

      {/* S5b — share with care team */}
      <Sprite start={33.6} end={39.4}>
        <Cap top={150}>
          <Kicker text="Your care team" color={DEEP}/>
          <div style={{...big,fontSize:62,marginTop:20}}>Share it &mdash; only what <span style={{color:DEEP}}>you choose</span>.</div>
        </Cap>
        <CareShare/>
        <Cap top={880}>
          <div style={{fontFamily:SANS,fontSize:36,fontWeight:700,color:MUT}}>Your podiatrist sees the trend &mdash; not your whole life.</div>
        </Cap>
      </Sprite>

      {/* S6 — order inserts / offloaders */}
      <Sprite start={39.4} end={45.8}>
        <Cap top={150}>
          <Kicker text="Be ready" color={DEEP}/>
          <div style={{...big,fontSize:62,marginTop:20}}>Order inserts &amp; ulcer offloaders &mdash; from <span style={{color:DEEP}}>home</span>.</div>
        </Cap>
        <Inserts top={560}/>
      </Sprite>

      {/* S7 — privacy stats */}
      <Sprite start={46.2} end={52.4}>
        <Cap top={250}>
          <Kicker text="Privacy first" color={GREEN}/>
          <div style={{...bigD,fontSize:64,marginTop:18}}>Your feet. Your data. <span style={{color:HONEY}}>Your house.</span></div>
        </Cap>
      </Sprite>
      <Sprite start={46.6} end={52.4}>
        <Stats items={[['100%','on your device'],['0','uploads, ever'],['24/7','feet on watch']]} top={500}/>
      </Sprite>

      {/* S8 — resolution */}
      <Sprite start={52.8} end={55.4}>
        <Cap top={430}>
          <div style={big}>Your feet, watched.<br/><span style={{color:DEEP}}>At home.</span></div>
        </Cap>
      </Sprite>

      {/* S9 — LocalDiabetic / Win big. lockup */}
      <Sprite start={55.4} end={60.3}>
        <FinaleLogo/>
      </Sprite>
    </Stage>
  );
}

window.FootCareShort = FootCareShort;
