// why-i-built-this.jsx — LocalDiabetic founder short ("Why I built this")
// Typographic motion piece. Reads the timeline engine globals from animations.jsx.
const { Stage, Sprite, useTime, useSprite, clamp } = window;

/* ---------- palette ---------- */
const CREAM = "#FBF7EF", INK = "#2B2118", HONEY = "#F2B441", DEEP = "#D99A2B",
      MUT = "#6b5e4f", DARK = "#1A140C", CTXT = "#F6EFDF", MUTD = "#CBB996";
const SANS = "'Inter',-apple-system,BlinkMacSystemFont,sans-serif";
const MONO = "'JetBrains Mono','SFMono-Regular',ui-monospace,monospace";

/* ---------- easing ---------- */
const ease = (t) => 1 - Math.pow(1 - t, 3);          // easeOutCubic
const eio  = (t) => (t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2); // easeInOutCubic

/* ---------- color lerp for backdrop ---------- */
const hx = (c) => { c = c.replace('#',''); return [parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)]; };
const lerpC = (a,b,t) => { const A=hx(a),B=hx(b); return `rgb(${Math.round(A[0]+(B[0]-A[0])*t)},${Math.round(A[1]+(B[1]-A[1])*t)},${Math.round(A[2]+(B[2]-A[2])*t)})`; };

const STOPS = [
  [0,DARK],[4.7,DARK],[5.4,CREAM],
  [15.0,CREAM],[15.7,DARK],
  [23.6,DARK],[24.4,CREAM],
  [44.0,CREAM],[44.8,DARK],
  [50.1,DARK],[50.9,CREAM],[56,CREAM]
];
function Backdrop(){
  const t = useTime();
  let c = CREAM;
  for (let i=0;i<STOPS.length-1;i++){
    const [t0,c0]=STOPS[i],[t1,c1]=STOPS[i+1];
    if (t>=t0 && t<=t1){ const k=t1===t0?0:(t-t0)/(t1-t0); c=lerpC(c0,c1,eio(clamp(k,0,1))); break; }
  }
  if (t > STOPS[STOPS.length-1][0]) c = CREAM;
  // soft vignette so text always reads
  return <div style={{position:'absolute',inset:0,background:c}}/>;
}

/* ---------- caption: fades + rises in, drifts, fades out ---------- */
function Cap({children, top, align='center', width=1380, lift=30}){
  const {localTime,duration}=useSprite();
  const inT=clamp(localTime/0.55,0,1);
  const oz=0.45;
  const out=localTime>duration-oz?clamp((localTime-(duration-oz))/oz,0,1):0;
  const op=Math.min(ease(inT),1-out);
  const ty=(1-ease(inT))*lift - out*18 + (localTime/duration)*-7;
  return (
    <div style={{position:'absolute',left:'50%',top,transform:`translate(-50%, ${ty}px)`,
      width,maxWidth:'92%',textAlign:align,opacity:op,
      fontFamily:SANS,textWrap:'pretty',lineHeight:1.14}}>
      {children}
    </div>
  );
}

/* ---------- mono kicker ---------- */
function Kicker({text,color=DEEP}){
  return <div style={{fontFamily:MONO,fontSize:28,letterSpacing:'.22em',textTransform:'uppercase',fontWeight:600,color}}>{text}</div>;
}

/* ---------- bee mark (light / dark themes), scales in ---------- */
function BeeMark({size=140, theme='light'}){
  const {localTime}=useSprite ? safeSprite() : {localTime:1};
  const s = clamp(localTime/0.7,0,1);
  const sc = 0.7 + ease(s)*0.3;
  const op = ease(clamp(localTime/0.5,0,1));
  const L = theme==='dark';
  const aStroke=L?CTXT:INK, wFill=L?'#3a3526':'#FCE4B0', wStroke=L?HONEY:INK,
        bFill=HONEY, bStroke=L?DARK:INK, hFill=L?'#E8EEF5':INK, eye=L?DARK:CREAM;
  return (
    <div style={{display:'inline-block',transform:`scale(${sc})`,opacity:op,transformOrigin:'center'}}>
      <svg width={size} height={size*1.1} viewBox="0 0 120 132" fill="none" style={{display:'block',overflow:'visible'}}>
        <path d="M54 20 C48 6 41 3 34 5" stroke={aStroke} strokeWidth="4.2" strokeLinecap="round"/>
        <path d="M66 20 C72 6 79 3 86 5" stroke={aStroke} strokeWidth="4.2" strokeLinecap="round"/>
        <circle cx="33" cy="5" r="4.4" fill={HONEY} stroke={aStroke} strokeWidth="3"/>
        <circle cx="87" cy="5" r="4.4" fill={HONEY} stroke={aStroke} strokeWidth="3"/>
        <ellipse cx="36" cy="54" rx="19" ry="26" fill={wFill} stroke={wStroke} strokeWidth="4.2" transform="rotate(-24 36 54)"/>
        <ellipse cx="84" cy="54" rx="19" ry="26" fill={wFill} stroke={wStroke} strokeWidth="4.2" transform="rotate(24 84 54)"/>
        <rect x="40" y="44" width="40" height="72" rx="20" fill={bFill} stroke={bStroke} strokeWidth="4.2"/>
        <g clipPath="url(#wbk)">
          <rect x="36" y="66" width="48" height="12" fill={bStroke}/>
          <rect x="36" y="90" width="48" height="12" fill={bStroke}/>
        </g>
        <clipPath id="wbk"><rect x="40" y="44" width="40" height="72" rx="20"/></clipPath>
        <circle cx="60" cy="31" r="17" fill={hFill}/>
        <circle cx="53" cy="29" r="3.4" fill={eye}/>
        <circle cx="67" cy="29" r="3.4" fill={eye}/>
      </svg>
    </div>
  );
}
function safeSprite(){ try { return useSprite(); } catch(e){ return {localTime:1}; } }

/* ---------- chip (staggered pop) ---------- */
function Chips({items, top}){
  const {localTime}=useSprite();
  return (
    <div style={{position:'absolute',left:'50%',top,transform:'translateX(-50%)',width:1380,maxWidth:'92%',
      display:'flex',gap:18,justifyContent:'center',flexWrap:'wrap'}}>
      {items.map((it,i)=>{
        const t0=0.25+i*0.28;
        const p=ease(clamp((localTime-t0)/0.5,0,1));
        return (
          <span key={i} style={{fontFamily:SANS,fontSize:40,fontWeight:700,color:INK,
            background:'#fff',border:'1.5px solid #E6D9BF',borderRadius:999,padding:'14px 32px',
            boxShadow:'0 18px 36px -28px rgba(43,33,24,.5)',
            opacity:p,transform:`translateY(${(1-p)*22}px) scale(${0.92+p*0.08})`}}>{it}</span>
        );
      })}
    </div>
  );
}

/* ============================ THE SHORT ============================ */
function WhyIBuiltThis(){
  const big = {fontWeight:800,fontSize:88,letterSpacing:'-2px',color:INK};
  const bigD = {...big,color:CTXT};
  const body = {fontWeight:600,fontSize:62,letterSpacing:'-1px',color:INK};
  const bodyD = {...body,color:CTXT};
  return (
    <Stage width={1920} height={1080} duration={56} background={CREAM} fps={30}>
      <Backdrop/>

      {/* S1 — cold open */}
      <Sprite start={0} end={5.4}>
        <Cap top={300}><BeeMark size={150} theme="dark"/></Cap>
      </Sprite>
      <Sprite start={0.5} end={5.4}>
        <Cap top={560}>
          <Kicker text="Why I built this" color={HONEY}/>
          <div style={{fontFamily:SANS,fontSize:46,fontWeight:700,color:CTXT,marginTop:26,letterSpacing:'-.5px'}}>
            Sixty seconds, in my own words.
          </div>
        </Cap>
      </Sprite>

      {/* S2 */}
      <Sprite start={4.9} end={10.6}>
        <Cap top={420}>
          <div style={big}>I didn&rsquo;t build LocalDiabetic to start<br/>another tech company.</div>
        </Cap>
      </Sprite>

      {/* S3 */}
      <Sprite start={10.6} end={15.6}>
        <Cap top={440}>
          <div style={{...big,fontSize:104}}>I built it because<br/>I&rsquo;m <span style={{color:DEEP}}>living this.</span></div>
        </Cap>
      </Sprite>

      {/* S4 — the truths, on dark */}
      <Sprite start={15.7} end={18.7}>
        <Cap top={460}><div style={{...bigD,fontSize:104}}>I&rsquo;m a <span style={{color:HONEY}}>Type 1 diabetic.</span></div></Cap>
      </Sprite>
      <Sprite start={18.7} end={21.1}>
        <Cap top={470}><div style={{...bigD,fontSize:112}}>I&rsquo;ve lost toes.</div></Cap>
      </Sprite>
      <Sprite start={21.1} end={24.3}>
        <Cap top={470}><div style={{...bigD,fontSize:96}}>I&rsquo;ve dealt with infections.</div></Cap>
      </Sprite>

      {/* S5 — the insight, on cream */}
      <Sprite start={24.4} end={28.2}>
        <Cap top={430}><div style={body}>Diabetes isn&rsquo;t just about<br/>your <span style={{color:DEEP}}>blood sugar.</span></div></Cap>
      </Sprite>
      <Sprite start={28.2} end={34.6}>
        <Cap top={360}><div style={body}>It&rsquo;s about everything<br/><span style={{color:DEEP}}>between appointments.</span></div></Cap>
      </Sprite>
      <Sprite start={30.0} end={34.6}>
        <Chips items={['Meals','Walks','Medications','Foot checks']} top={640}/>
      </Sprite>

      {/* S6 */}
      <Sprite start={34.6} end={39.1}>
        <Cap top={400}><div style={body}>The little things become<br/><span style={{color:DEEP}}>big problems</span> if you miss them.</div></Cap>
      </Sprite>

      {/* S7 */}
      <Sprite start={39.1} end={44.0}>
        <Cap top={370}>
          <div style={{...body,fontSize:58}}>So I built a calm <span style={{color:DEEP}}>LifeBoard</span> &mdash;</div>
          <div style={{...body,fontSize:58,marginTop:14}}>and a <span style={{color:DEEP}}>Bee</span> that works for me.</div>
          <div style={{fontFamily:SANS,fontSize:38,fontWeight:600,color:MUT,marginTop:26}}>Not for an advertising company.</div>
        </Cap>
      </Sprite>

      {/* S8 — HERO line on dark */}
      <Sprite start={44.8} end={50.2}>
        <Cap top={400}>
          <div style={{...bigD,fontSize:96,lineHeight:1.16}}>Small daily wins can prevent<br/>tomorrow&rsquo;s <span style={{color:HONEY}}>emergencies.</span></div>
        </Cap>
      </Sprite>

      {/* S9 — resolution + sign-off on cream */}
      <Sprite start={50.9} end={55.0}>
        <Cap top={330}>
          <div style={{...body,fontSize:50,color:MUT,fontWeight:600}}>If it helps save one foot, one hospitalization &mdash;<br/>every late night has been <span style={{color:INK,fontWeight:800}}>worth it.</span></div>
        </Cap>
      </Sprite>
      <Sprite start={51.6} end={56}>
        <Cap top={620}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:18}}>
            <BeeMark size={64} theme="light"/>
            <div style={{textAlign:'left'}}>
              <div style={{fontFamily:SANS,fontWeight:800,fontSize:34,color:INK,letterSpacing:'-.5px'}}>Donovan</div>
              <div style={{fontFamily:SANS,fontSize:22,color:MUT}}>Type 1 diabetic &middot; building the tool I wish I had</div>
            </div>
          </div>
          <div style={{fontFamily:SANS,fontSize:30,fontWeight:800,color:DEEP,marginTop:34,letterSpacing:'-.3px'}}>
            <span style={{color:INK}}>Win</span> <span style={{color:DEEP}}>big.</span> &mdash; every day. Not someday. 🐝
          </div>
        </Cap>
      </Sprite>
    </Stage>
  );
}

window.WhyIBuiltThis = WhyIBuiltThis;
