// bee-short.jsx — LocalDiabetic "Meet Bee" short (16:9, ~57s).
// Bee is NOT a chatbot. A verified, vetted, defendable open-source diabetic model —
// cooked in-house, beat her base model big, built to do the work.
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
const eob  = (t) => { const c1=1.70158,c3=c1+1; return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2); };

/* ---------- color lerp ---------- */
const hx = (c) => { c = c.replace('#',''); return [parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)]; };
const lerpC = (a,b,t) => { const A=hx(a),B=hx(b); return `rgb(${Math.round(A[0]+(B[0]-A[0])*t)},${Math.round(A[1]+(B[1]-A[1])*t)},${Math.round(A[2]+(B[2]-A[2])*t)})`; };

const STOPS = [
  [0,DARK],[4.4,DARK],[5.0,CREAM],   // S1 dark → S2/S3 cream
  [17.6,CREAM],[18.2,DARK],          // S4 beat-base dark
  [24.0,DARK],[24.6,CREAM],          // S5 builder cream
  [31.0,CREAM],[31.6,DARK],          // S6 firewall dark
  [37.4,DARK],[38.0,CREAM],          // S7 verified + S8 resolution cream
  [50.2,CREAM],[50.8,DARK],          // S9 finale dark
  [57.0,DARK]
];
function Backdrop(){
  const t = useTime();
  let c = CREAM;
  for (let i=0;i<STOPS.length-1;i++){
    const [t0,c0]=STOPS[i],[t1,c1]=STOPS[i+1];
    if (t>=t0 && t<=t1){ const k=t1===t0?0:(t-t0)/(t1-t0); c=lerpC(c0,c1,eio(clamp(k,0,1))); break; }
  }
  if (t > STOPS[STOPS.length-1][0]) c = DARK;
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
        <g clipPath="url(#bsbk)">
          <rect x="36" y="66" width="48" height="12" fill={bStroke}/>
          <rect x="36" y="90" width="48" height="12" fill={bStroke}/>
        </g>
        <clipPath id="bsbk"><rect x="40" y="44" width="40" height="72" rx="20"/></clipPath>
        <circle cx="60" cy="31" r="17" fill={hFill}/>
        <circle cx="53" cy="29" r="3.4" fill={eye}/>
        <circle cx="67" cy="29" r="3.4" fill={eye}/>
      </svg>
    </div>
  );
}

/* ---------- count-up number ---------- */
function CountUp({to, dur=1.6, suffix='', prefix=''}){
  const {localTime}=useSprite();
  const p=eio(clamp(localTime/dur,0,1));
  const v=Math.round(to*p);
  return <span>{prefix}{v.toLocaleString()}{suffix}</span>;
}

/* ---------- "cooked model" — pot with rising model core ---------- */
function CookedModel(){
  const {localTime}=useSprite();
  const rise = ease(clamp(localTime/0.6,0,1));
  const lift = ease(clamp((localTime-0.7)/1.1,0,1));     // core rises out
  const glow = 0.5+0.5*Math.sin(localTime*2.4);
  const steam = clamp((localTime-0.4)/0.8,0,1);
  return (
    <svg width="380" height="380" viewBox="0 0 240 240" fill="none" style={{display:'block',overflow:'visible',opacity:rise,transform:`translateY(${(1-rise)*20}px)`}}>
      {/* steam */}
      {[0,1,2].map(i=>{
        const sx=92+i*28, base=72;
        const o=steam*(0.5-i*0.08)*(0.6+0.4*Math.sin(localTime*2+i));
        return <path key={i} d={`M${sx} ${base} q-10 -16 2 -30 q10 -12 0 -28`} stroke={HONEY} strokeWidth="4" strokeLinecap="round" fill="none" opacity={o}/>;
      })}
      {/* glowing model core rising from pot */}
      <g transform={`translate(120,${150-lift*54})`} opacity={0.35+lift*0.65}>
        <circle r={30+glow*4} fill="none" stroke={HONEY} strokeWidth="2" opacity={0.4*lift}/>
        <rect x="-26" y="-26" width="52" height="52" rx="14" fill={DEEP} stroke={INK} strokeWidth="3.4"/>
        {/* neural nodes */}
        {[[-12,-10],[12,-12],[0,2],[-10,12],[12,10]].map((n,i)=>(
          <circle key={i} cx={n[0]} cy={n[1]} r="3.6" fill={CREAM}/>
        ))}
        <path d="M-12 -10 L0 2 L12 -12 M0 2 L-10 12 M0 2 L12 10" stroke={CREAM} strokeWidth="1.6" opacity="0.7" fill="none"/>
      </g>
      {/* pot */}
      <path d="M58 150 L182 150 L172 210 Q170 222 158 222 L82 222 Q70 222 68 210 Z" fill={INK} stroke={INK} strokeWidth="3"/>
      <rect x="50" y="142" width="140" height="16" rx="8" fill="#1c150e"/>
      <ellipse cx="120" cy="150" rx="62" ry="10" fill={DEEP} opacity="0.5"/>
      {/* handles */}
      <path d="M50 150 q-16 0 -16 18" stroke={INK} strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M190 150 q16 0 16 18" stroke={INK} strokeWidth="6" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

/* ---------- beat-base bars ---------- */
function BeatBars(){
  const {localTime}=useSprite();
  const gB = ease(clamp((localTime-0.4)/0.9,0,1));
  const gA = ease(clamp((localTime-0.9)/1.2,0,1));
  const baseH = 150, beeH = 250;        // bee towers
  return (
    <div style={{position:'absolute',left:'50%',top:'56%',transform:'translate(-50%,-50%)',
      display:'flex',gap:120,alignItems:'flex-end',height:300}}>
      {/* base */}
      <div style={{textAlign:'center'}}>
        <div style={{height:baseH*gB,width:150,background:'#2A3543',borderRadius:'12px 12px 0 0',
          border:'1px solid #38465a',transition:'none'}}/>
        <div style={{fontFamily:SANS,fontSize:30,fontWeight:700,color:MUTD,marginTop:18}}>Base Qwen-27B</div>
      </div>
      {/* bee */}
      <div style={{textAlign:'center'}}>
        <div style={{position:'relative',height:beeH*gA,width:150,
          background:`linear-gradient(180deg,${HONEY},${DEEP})`,borderRadius:'12px 12px 0 0',
          boxShadow:'0 0 50px -8px rgba(242,180,65,.5)'}}/>
        <div style={{fontFamily:SANS,fontSize:30,fontWeight:800,color:HONEY,marginTop:18}}>Bee</div>
      </div>
    </div>
  );
}

/* ---------- builder cards ---------- */
function BuildIcon({type}){
  const c=INK;
  if(type==='meal') return <svg width="52" height="52" viewBox="0 0 52 52" fill="none"><circle cx="26" cy="26" r="18" stroke={c} strokeWidth="3"/><path d="M26 14 a12 12 0 0 1 0 24" fill={HONEY}/><circle cx="26" cy="26" r="6" fill={CREAM} stroke={c} strokeWidth="2.4"/></svg>;
  if(type==='cart') return <svg width="52" height="52" viewBox="0 0 52 52" fill="none"><path d="M10 12 h6 l5 24 h20 l4 -16 H19" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/><circle cx="24" cy="42" r="3.4" fill={c}/><circle cx="40" cy="42" r="3.4" fill={c}/></svg>;
  if(type==='foot') return <svg width="52" height="52" viewBox="0 0 52 52" fill="none"><path d="M30 10 C20 10 18 20 19 30 C20 38 22 44 26 46 C30 47 33 44 34 38 C36 28 40 10 30 10 Z" fill={HONEY} stroke={c} strokeWidth="2.6" strokeLinejoin="round"/><circle cx="18" cy="14" r="3.4" fill={HONEY} stroke={c} strokeWidth="2"/></svg>;
  if(type==='doc') return <svg width="52" height="52" viewBox="0 0 52 52" fill="none"><rect x="14" y="8" width="24" height="36" rx="3" stroke={c} strokeWidth="3" fill="none"/><path d="M20 18 h12 M20 26 h12 M20 34 h7" stroke={c} strokeWidth="2.6" strokeLinecap="round"/></svg>;
  return <svg width="52" height="52" viewBox="0 0 52 52" fill="none"><path d="M26 9 a17 17 0 1 0 .01 0" stroke={c} strokeWidth="3" fill="none"/><path d="M26 18 v9 l6 4" stroke={c} strokeWidth="3" strokeLinecap="round" fill="none"/></svg>;
}
function Builders({top}){
  const {localTime}=useSprite();
  const items=[
    {t:'meal',l:'Meal plans'},
    {t:'cart',l:'Shopping lists'},
    {t:'foot',l:'Foot-check plans'},
    {t:'doc',l:'Doctor-visit questions'},
    {t:'ans',l:'Plain-English answers'},
  ];
  return (
    <div style={{position:'absolute',left:'50%',top,transform:'translateX(-50%)',display:'flex',gap:24,justifyContent:'center'}}>
      {items.map((it,i)=>{
        const a=eob(clamp((localTime-(0.3+i*0.22))/0.55,0,1));
        return (
          <div key={i} style={{opacity:clamp(a,0,1),transform:`translateY(${(1-clamp(a,0,1))*26}px) scale(${0.9+0.1*clamp(a,0,1)})`,
            textAlign:'center',background:'#fff',border:'1.5px solid #E6D9BF',borderRadius:22,
            padding:'28px 24px 22px',width:200,boxShadow:'0 20px 38px -28px rgba(43,33,24,.5)'}}>
            <BuildIcon type={it.t}/>
            <div style={{fontFamily:SANS,fontSize:25,fontWeight:700,color:INK,marginTop:16,lineHeight:1.2}}>{it.l}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- guardrails / firewall shield ---------- */
function Shield(){
  const {localTime}=useSprite();
  const draw = ease(clamp((localTime-0.4)/1.0,0,1));
  const check = ease(clamp((localTime-1.2)/0.6,0,1));
  const glow = 0.5+0.5*Math.sin(localTime*2.2);
  return (
    <svg width="320" height="360" viewBox="0 0 200 230" fill="none" style={{display:'block',overflow:'visible'}}>
      <path d="M100 14 L172 42 V118 C172 168 140 198 100 214 C60 198 28 168 28 118 V42 Z"
        fill="rgba(47,182,122,0.08)" stroke={GREEN} strokeWidth="4"
        strokeDasharray="560" strokeDashoffset={560*(1-draw)} strokeLinejoin="round" strokeLinecap="round"
        style={{filter:`drop-shadow(0 0 ${10+glow*10}px rgba(47,182,122,0.35))`}}/>
      <g opacity={check} transform="translate(100,116)">
        <path d="M-30 4 l20 22 l40 -48" fill="none" stroke={GREEN} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
    </svg>
  );
}

/* ---------- guardrail rules ---------- */
function Rules({top}){
  const {localTime}=useSprite();
  const rules=[
    {k:'Organizes & educates',ok:true},
    {k:'Never diagnoses',ok:false},
    {k:'Never doses',ok:false},
    {k:'Always defers to your care team',ok:true},
  ];
  return (
    <div style={{position:'absolute',left:'50%',top,transform:'translateX(-50%)',display:'flex',flexDirection:'column',gap:16,width:720}}>
      {rules.map((r,i)=>{
        const a=ease(clamp((localTime-(0.4+i*0.28))/0.5,0,1));
        return (
          <div key={i} style={{opacity:a,transform:`translateX(${(1-a)*-26}px)`,display:'flex',alignItems:'center',gap:18,
            background:'rgba(255,255,255,0.04)',border:'1px solid #1F2A36',borderRadius:16,padding:'18px 26px'}}>
            <div style={{width:34,height:34,borderRadius:'50%',flex:'none',
              background:r.ok?GREEN:'#2A3543',display:'flex',alignItems:'center',justifyContent:'center'}}>
              {r.ok
                ? <svg width="18" height="18" viewBox="0 0 18 18"><path d="M4 9 l3 3 l7 -8" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                : <svg width="16" height="16" viewBox="0 0 16 16"><path d="M4 4 l8 8 M12 4 l-8 8" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"/></svg>}
            </div>
            <div style={{fontFamily:SANS,fontSize:32,fontWeight:700,color:CTXT,textAlign:'left'}}>{r.k}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- bee real-quote block ---------- */
function BeeQuote(){
  const {localTime}=useSprite();
  const a=ease(clamp((localTime-0.6)/0.7,0,1));
  return (
    <div style={{opacity:a,transform:`translateX(${(1-a)*30}px)`,flex:1,textAlign:'left',
      borderLeft:`4px solid ${GREEN}`,paddingLeft:36}}>
      <div style={{fontFamily:SANS,fontSize:46,fontWeight:600,color:CTXT,lineHeight:1.32,letterSpacing:'-0.5px'}}>
        &ldquo;I&rsquo;m not a doctor &mdash; that&rsquo;s something only <span style={{color:GREEN}}>your care team</span> can determine.&rdquo;
      </div>
      <div style={{fontFamily:MONO,fontSize:22,fontWeight:600,letterSpacing:'.16em',textTransform:'uppercase',color:MUTD,marginTop:24}}>
        &mdash; Bee &middot; real output
      </div>
    </div>
  );
}

/* ---------- verified chips ---------- */
function VChips({top}){
  const {localTime}=useSprite();
  const chips=['97% defendable · independent LocalStudy','100% emergency → 911','100% no-diagnosis gate','Every answer hash-chained'];
  return (
    <div style={{position:'absolute',left:'50%',top,transform:'translateX(-50%)',display:'flex',flexWrap:'wrap',gap:18,justifyContent:'center',width:1200}}>
      {chips.map((c,i)=>{
        const a=ease(clamp((localTime-(0.3+i*0.24))/0.5,0,1));
        return (
          <div key={i} style={{opacity:a,transform:`translateY(${(1-a)*18}px)`,display:'flex',alignItems:'center',gap:12,
            background:'#fff',border:'1.5px solid #E6D9BF',borderRadius:100,padding:'16px 28px',
            boxShadow:'0 16px 30px -24px rgba(43,33,24,.5)'}}>
            <span style={{width:12,height:12,borderRadius:'50%',background:GREEN,flex:'none'}}/>
            <span style={{fontFamily:SANS,fontSize:28,fontWeight:700,color:INK}}>{c}</span>
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
      <BeeMark size={150} theme="dark"/>
      <div style={{opacity:pW,transform:`translateY(${(1-pW)*16}px)`,fontSize:100,fontWeight:900,letterSpacing:'-3px',lineHeight:1,marginTop:8}}>
        <span style={{color:CTXT}}>Local</span><span style={{color:HONEY}}>Diabetic</span>
      </div>
      <div style={{opacity:pT,transform:`translateY(${(1-pT)*16}px)`,marginTop:14,fontSize:124,fontWeight:900,letterSpacing:'-3.5px',lineHeight:1}}>
        <span style={{color:CTXT}}>Win</span> <span style={{color:HONEY}}>big.</span>
      </div>
      <div style={{opacity:pS,fontFamily:MONO,fontSize:25,fontWeight:600,letterSpacing:'.2em',textTransform:'uppercase',color:MUTD,marginTop:28}}>
        Every day &middot; not someday &middot; 🐝
      </div>
    </div>
  );
}

/* ============================ THE SHORT ============================ */
function BeeShort(){
  const big  = {fontWeight:800,fontSize:84,letterSpacing:'-2.4px',color:INK,lineHeight:1.06};
  const bigD = {...big,color:CTXT};
  return (
    <Stage width={1920} height={1080} duration={57.0} background={DARK} fps={30} persistKey="ldbee">
      <Backdrop/>

      {/* S1 — cold open */}
      <Sprite start={0} end={5.0}>
        <Cap top={250}><BeeMark size={170} theme="dark"/></Cap>
      </Sprite>
      <Sprite start={0.5} end={5.0}>
        <Cap top={520}>
          <Kicker text="Meet Bee" color={HONEY}/>
          <div style={{fontFamily:SANS,fontSize:104,fontWeight:900,color:CTXT,marginTop:24,letterSpacing:'-3px',lineHeight:1}}>
            Not a chatbot.
          </div>
        </Cap>
      </Sprite>

      {/* S2 — a cooked model */}
      <Sprite start={5.0} end={11.6}>
        <Cap top={150}>
          <Kicker text="Built, not wrapped" color={DEEP}/>
          <div style={{...big,marginTop:20}}>She&rsquo;s a <span style={{color:DEEP}}>cooked</span> model.</div>
        </Cap>
        <div style={{position:'absolute',left:'50%',top:'56%',transform:'translate(-50%,-50%)'}}><CookedModel/></div>
        <Cap top={880}>
          <div style={{fontFamily:SANS,fontSize:36,fontWeight:600,color:MUT}}>
            A real diabetic AI, trained in-house &mdash; not a generic bot with a costume.
          </div>
        </Cap>
      </Sprite>

      {/* S3 — the data (count-up) */}
      <Sprite start={11.8} end={17.8}>
        <Cap top={300}>
          <Kicker text="Curated · in-house · diabetes-specific" color={DEEP}/>
          <div style={{...big,fontSize:112,marginTop:24,color:DEEP,letterSpacing:'-4px'}}>
            <CountUp to={416967} dur={1.8}/>
          </div>
          <div style={{...big,fontSize:54,marginTop:8,color:INK}}>curated diabetes &amp; medical examples.</div>
          <div style={{fontFamily:SANS,fontSize:34,fontWeight:600,color:MUT,marginTop:26}}>
            She&rsquo;s cooked on the real thing.
          </div>
        </Cap>
      </Sprite>

      {/* S4 — beat base (dark) */}
      <Sprite start={18.2} end={24.2}>
        <Cap top={120}>
          <Kicker text="Deterministic · beat-base-or-kill · no LLM judging an LLM" color={HONEY}/>
          <div style={{...bigD,fontSize:72,marginTop:20}}>She beat her base model.</div>
        </Cap>
        <BeatBars/>
        <Cap top={900}>
          <div style={{fontFamily:SANS,fontSize:34,fontWeight:600,color:MUTD}}>
            On a held-out medical eval &mdash; measured, not claimed.
          </div>
        </Cap>
      </Sprite>

      {/* S5 — she's a builder (cream) */}
      <Sprite start={24.6} end={31.0}>
        <Cap top={150}>
          <Kicker text="She does the work" color={DEEP}/>
          <div style={{...big,marginTop:20}}>She&rsquo;s a <span style={{color:DEEP}}>builder</span>.</div>
        </Cap>
        <Builders top={520}/>
        <Cap top={840}>
          <div style={{fontFamily:SANS,fontSize:36,fontWeight:600,color:MUT}}>
            She doesn&rsquo;t just chat &mdash; she builds what you need, then you act.
          </div>
        </Cap>
      </Sprite>

      {/* S6 — builder, not a doctor (the firewall) */}
      <Sprite start={31.6} end={37.6}>
        <Cap top={120}>
          <Kicker text="The firewall" color={GREEN}/>
          <div style={{...bigD,fontSize:72,marginTop:18}}>A builder &mdash; <span style={{color:GREEN}}>not a doctor.</span></div>
        </Cap>
        <div style={{position:'absolute',left:'50%',top:'57%',transform:'translate(-50%,-50%)',display:'flex',alignItems:'center',gap:40,width:1240}}>
          <div style={{flex:'none'}}><Shield/></div>
          <BeeQuote/>
        </div>
        <Cap top={912}>
          <div style={{fontFamily:SANS,fontSize:36,fontWeight:700,color:MUTD}}>
            Never diagnoses. Never doses. Always defers to your care team.
          </div>
        </Cap>
      </Sprite>

      {/* S7 — verified · vetted · defendable (cream) */}
      <Sprite start={38.0} end={43.8}>
        <Cap top={170}>
          <Kicker text="Open-source · DiabeticDaily-27B / 9B / 4B · localdiabetic.com/study" color={DEEP}/>
          <div style={{...big,fontSize:72,marginTop:20}}>Verified. Vetted. <span style={{color:DEEP}}>Defendable.</span></div>
        </Cap>
        <VChips top={560}/>
      </Sprite>

      {/* S8 — resolution (cream) */}
      <Sprite start={44.2} end={50.0}>
        <Cap top={400}>
          <div style={big}>A builder for your diabetic life &mdash;<br/><span style={{color:DEEP}}>one you can trust.</span></div>
        </Cap>
      </Sprite>

      {/* S9 — finale lockup (dark) */}
      <Sprite start={50.8} end={57.0}>
        <FinaleLogo/>
      </Sprite>
    </Stage>
  );
}

window.BeeShort = BeeShort;
