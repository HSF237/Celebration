"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, RotateCcw, ArrowDownRight, Sparkles, Search, ArrowUpRight, Users } from "lucide-react";
import followerData from "../data/followers.json";

type Follower = { name: string; profileUrl?: string };
const followers = (followerData.followers || []) as Follower[];

function ParticleField({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = 0, height = 0, frame = 0, animationId = 0;
    let particles: {x:number;y:number;tx:number;ty:number;size:number;phase:number;speed:number}[] = [];
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = width * dpr; canvas.height = height * dpr;
      canvas.style.width = width + "px"; canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const sample = document.createElement("canvas");
      const sctx = sample.getContext("2d");
      if (!sctx) return;
      sample.width = Math.min(width, 1000); sample.height = Math.min(height, 600);
      const sw = sample.width, sh = sample.height;
      sctx.fillStyle = "#fff";
      sctx.font = "900 " + Math.floor(Math.min(sw / 4.2, sh / 2.1, 210)) + "px Arial";
      sctx.textAlign = "center"; sctx.textBaseline = "middle";
      sctx.fillText("1500+", sw / 2, sh / 2);
      const data = sctx.getImageData(0,0,sw,sh).data;
      const targets: {x:number;y:number}[] = [];
      for(let y=0;y<sh;y+=4) for(let x=0;x<sw;x+=4) if(data[(y*sw+x)*4+3]>100) targets.push({x:x/sw*width,y:y/sh*height});
      const count = Math.min(targets.length, 1500);
      particles = Array.from({length:Math.max(count,500)},(_,i)=>{
        const t = targets[(i*7)%targets.length] || {x:width/2,y:height/2};
        return {x:Math.random()*width,y:Math.random()*height,tx:t.x,ty:t.y,size:Math.random()*1.8+.4,phase:Math.random()*Math.PI*2,speed:.012+Math.random()*.035};
      });
    };
    resize(); window.addEventListener("resize",resize);
    const draw = () => {
      frame++;
      ctx.clearRect(0,0,width,height);
      for(const p of particles){
        const target = activeRef.current;
        if(target){ p.x += (p.tx-p.x)*p.speed; p.y += (p.ty-p.y)*p.speed; }
        else { p.x += Math.sin(frame*.006+p.phase)*.32; p.y += Math.cos(frame*.004+p.phase)*.26; }
        const glow = .45 + .45*Math.sin(frame*.025+p.phase);
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
        ctx.fillStyle = target ? `rgba(110,204,255,${glow})` : `rgba(93,166,255,${glow*.6})`;
        ctx.shadowBlur = target ? 10 : 4; ctx.shadowColor = "#3a9dff"; ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.save(); ctx.translate(width/2,height/2); ctx.rotate(frame*.0007);
      ctx.strokeStyle = "rgba(92,153,255,.11)"; ctx.lineWidth = 1;
      for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(0,0,Math.min(width*.42,650),Math.min(height*.25,230),i*.8,0,Math.PI*2);ctx.stroke();}
      ctx.restore();
      animationId = requestAnimationFrame(draw);
    };
    animationId = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animationId); window.removeEventListener("resize",resize); };
  }, []);
  return <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />;
}

function FollowersWall() {
  const [query, setQuery] = useState("");
  const filtered = followers.filter((f) => f.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return (
    <section className="followers-section" id="followers">
      <div className="followers-inner">
        <div className="followers-kicker"><span /> THE PEOPLE BEHIND THE MILESTONE <span /></div>
        <div className="followers-heading-row">
          <div>
            <p className="followers-overline">A COMMUNITY, NOT JUST A NUMBER</p>
            <h2>The people <em>who make it matter.</em></h2>
            <p className="followers-description">A little wall of appreciation for the people who follow along on this journey.</p>
          </div>
          <div className="followers-count"><Users size={17}/><strong>{followers.length.toLocaleString()}</strong><span>FOLLOWERS ADDED</span></div>
        </div>
        <label className="follower-search">
          <Search size={17} aria-hidden="true" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search names..." aria-label="Search follower names" />
          {query && <button type="button" onClick={() => setQuery("")}>CLEAR</button>}
        </label>
        {followers.length === 0 ? (
          <div className="followers-empty">
            <div className="empty-orbit"><Users size={25}/></div>
            <h3>Your followers wall is ready.</h3>
            <p>Import your available follower names to populate this space. No sample names are shown, so nobody is accidentally misrepresented.</p>
            <span>DATA NOT ADDED YET</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="followers-empty compact"><h3>No names found</h3><p>Try a different search.</p></div>
        ) : (
          <>
            <div className="followers-results">{query ? `SHOWING ${filtered.length} OF ${followers.length} NAMES` : `${followers.length.toLocaleString()} PEOPLE IN THIS WALL`}</div>
            <div className="follower-grid">
              {filtered.map((follower, index) => (
                <article className="follower-card" key={follower.name + index} style={{animationDelay: `${Math.min(index % 24, 23) * 28}ms`}}>
                  <div className="follower-avatar">{follower.name.trim().split(/\\s+/).slice(0,2).map(part => part[0] || "").join("").toUpperCase()}</div>
                  <span className="follower-name">{follower.name}</span>
                  {follower.profileUrl && /^https:\/\/([a-z0-9-]+\\.)?linkedin\\.com\//i.test(follower.profileUrl) ? (
                    <a href={follower.profileUrl} target="_blank" rel="noreferrer" className="follower-link" aria-label={`Open LinkedIn profile for ${follower.name}`}><ArrowUpRight size={15}/></a>
                  ) : <span className="follower-link muted-link" aria-hidden="true"><Sparkles size={14}/></span>}
                </article>
              ))}
            </div>
          </>
        )}
        <p className="followers-note">Names are shown as supplied in the imported data. Please only publish information you’re comfortable sharing publicly.</p>
      </div>
    </section>
  );
}

export default function Home() {
  const [revealed, setRevealed] = useState(false);
  const [sound, setSound] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const audioRef = useRef<AudioContext | null>(null);

  const playSound = () => {
    try {
      const AudioCtor = window.AudioContext || (window as typeof window & {webkitAudioContext?: typeof AudioContext}).webkitAudioContext;
      if (!AudioCtor) return;
      if (!audioRef.current) audioRef.current = new AudioCtor();
      const ac = audioRef.current;
      if (ac.state === "suspended") void ac.resume();
      const now = ac.currentTime;
      [220,330,440,660,880].forEach((freq,i)=>{
        const osc = ac.createOscillator(), gain = ac.createGain();
        osc.type = i < 2 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq,now);
        osc.frequency.exponentialRampToValueAtTime(freq*1.012,now+.65);
        gain.gain.setValueAtTime(.0001,now);
        gain.gain.exponentialRampToValueAtTime(.035/(i+1),now+.08);
        gain.gain.exponentialRampToValueAtTime(.0001,now+1.25);
        osc.connect(gain); gain.connect(ac.destination);
        osc.start(now+i*.035); osc.stop(now+1.3);
      });
    } catch { /* Sound is optional. */ }
  };

  const reveal = () => { setRevealed(true); if(sound) playSound(); };
  const replay = () => { setRevealed(false); setReplayKey(v=>v+1); };

  useEffect(() => {
    if (!revealed) return;
    const timer = window.setTimeout(() => { document.querySelector(".thank-you")?.classList.add("arrived"); }, 850);
    return () => window.clearTimeout(timer);
  }, [revealed, replayKey]);

  return (
    <main className={revealed ? "experience revealed" : "experience"} key={replayKey}>
      <ParticleField active={revealed} />
      <div className="noise" aria-hidden="true" />
      <header className="topbar">
        <a className="wordmark" href="#" aria-label="Muhammad Hasan home"><span className="wordmark-icon">H</span> HASAN<span className="wordmark-dot">.</span></a>
        <div className="top-right"><span className="live-dot" /> A SMALL MILESTONE <span className="top-divider">/</span> A BIG THANK YOU</div>
      </header>
      <section className="hero">
        <div className="eyebrow"><span className="eyebrow-line" /> THE NETWORK EFFECT <span className="eyebrow-line" /></div>
        <div className="number-stage">
          <div className="number-halo" />
          <div className="number-ghost">1500+</div>
          <div className="number-main" aria-label="1500 plus connections">1,500<span>+</span></div>
          <div className="number-floor" />
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
        </div>
        <div className="headline-wrap">
          <p className="overline">{revealed ? "THIS MOMENT BELONGS TO ALL OF US" : "A MOMENT WORTH PAUSING FOR"}</p>
          <h1>{revealed ? <>1,500+ connections.<br/><em>One incredible journey.</em></> : <>Every connection<br/>starts <em>something.</em></>}</h1>
          <p className="subhead">{revealed ? "Thank you for being part of mine." : "And today, this little milestone belongs to everyone who made it meaningful."}</p>
        </div>
        {!revealed ? (
          <button className="reveal-button" onClick={reveal}><span>REVEAL THE MOMENT</span><ArrowDownRight size={17} strokeWidth={1.5}/></button>
        ) : (
          <div className="thank-you"><Sparkles size={15}/><span>THANK YOU FOR BEING HERE</span><Sparkles size={15}/></div>
        )}
        <div className="signature"><span className="signature-rule" /> MUHAMMAD HASAN <span className="signature-rule" /></div>
        <a className="wall-jump" href="#followers">MEET THE COMMUNITY <ArrowDownRight size={15}/></a>
      </section>
      <footer className="footer">
        <span>BUILT WITH GRATITUDE <span className="footer-star">✳</span></span>
        <span className="footer-center">CONNECTION IS THE BEGINNING OF EVERYTHING.</span>
        <div className="footer-actions">
          <button className="icon-button" onClick={()=>{setSound(v=>!v); if(!sound) playSound();}} aria-label={sound ? "Mute sound" : "Enable sound"} title={sound ? "Mute sound" : "Enable sound"}>{sound ? <Volume2 size={16}/> : <VolumeX size={16}/>}</button>
          <button className="icon-button" onClick={replay} aria-label="Replay animation" title="Replay"><RotateCcw size={15}/></button>
          <a className="linkedin-link" href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LET’S CONNECT ↗</a>
        </div>
      </footer>
      <div className="corner-mark corner-left">01 <span>/</span> 01</div>
      <div className="corner-mark corner-right">EST. WITH INTENTION</div>
      <FollowersWall />
    </main>
  );
}
