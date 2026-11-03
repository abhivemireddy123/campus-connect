import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import './style.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const seedEvents = [
  {id:'e1',title:'Line Follower Challenge',category:'TECHNOLOGY',date:'Nov 12, 2026',time:'10:00 AM',venue:'Innovation Lab',capacity:60,registered:34,color:'blue',description:'Build, test and race an autonomous robot through a challenging track. Open to all students.'},
  {id:'e2',title:'Design Sprint',category:'WORKSHOP',date:'Nov 14, 2026',time:'11:30 AM',venue:'Design Studio',capacity:40,registered:22,color:'green',description:'A collaborative workshop to turn ideas into thoughtful product experiences.'},
  {id:'e3',title:'Campus Sports Meet',category:'SPORTS',date:'Nov 16, 2026',time:'8:00 AM',venue:'Main Ground',capacity:120,registered:87,color:'amber',description:'Bring your team spirit and take part in a day of friendly campus competition.'},
  {id:'e4',title:'AI & Innovation Talk',category:'SEMINAR',date:'Nov 18, 2026',time:'2:00 PM',venue:'Auditorium',capacity:100,registered:61,color:'purple',description:'Explore practical applications of AI and meet people building the future.'}
];

function App(){
  const [session,setSession]=useState(null);
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [authMode,setAuthMode]=useState('login');
  const [events,setEvents]=useState(seedEvents);
  const [selected,setSelected]=useState(null);
  const [notice,setNotice]=useState('');
  const [loading,setLoading]=useState(false);
  const [filter,setFilter]=useState('ALL');
  const [registered,setRegistered]=useState([]);
  const configured=!!supabase;

  useEffect(()=>{
    if(!supabase) return;
    supabase.auth.getSession().then(({data})=>setSession(data.session));
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,s)=>setSession(s));
    return ()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!supabase) return;
    supabase.from('events').select('*').order('starts_at',{ascending:true}).then(({data,error})=>{
      if(!error && data?.length) setEvents(data.map(e=>({...e,id:e.id,date:e.starts_at?new Date(e.starts_at).toLocaleDateString('en-IN',{month:'short',day:'numeric',year:'numeric'}):'Date to be announced',time:e.starts_at?new Date(e.starts_at).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}):'Time to be announced',registered:e.registered_count||0,capacity:e.capacity||0,color:e.color||'blue'})));
    });
  },[session]);

  const visible=useMemo(()=>events.filter(e=>filter==='ALL'||e.category===filter),[events,filter]);
  const notify=(msg)=>{setNotice(msg);setTimeout(()=>setNotice(''),3500)};
  async function auth(e){
    e.preventDefault(); if(!configured){notify('Connect Supabase by adding the Vercel environment variables first.');return;}
    setLoading(true);
    const result=authMode==='signup'?await supabase.auth.signUp({email,password}):await supabase.auth.signInWithPassword({email,password});
    setLoading(false);
    if(result.error) notify(result.error.message); else notify(authMode==='signup'?'Check your email to confirm your account.':'Welcome to CampusConnect!');
  }
  async function logout(){if(supabase) await supabase.auth.signOut();setSession(null);}
  async function joinEvent(event){
    if(!session){notify('Please sign in to register for an event.');return;}
    const {error}=await supabase.from('registrations').insert({event_id:event.id,user_id:session.user.id});
    if(error){notify(error.code==='23505'?'You are already registered.':error.message);return;}
    setRegistered(old=>[...old,event.id]);setSelected(null);notify('Registration confirmed — see you there!');
  }
  const user=session?.user;
  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#"><span className="brand-mark">C</span>Campus<span>Connect</span></a><nav><a href="#events">Explore events</a><a href="#about">About</a></nav><div className="top-actions">{user?<><span className="user-label">{user.email}</span><button className="btn btn-outline" onClick={logout}>Sign out</button></>:<button className="btn btn-primary" onClick={()=>document.getElementById('login')?.scrollIntoView({behavior:'smooth'})}>Sign in</button>}</div></header>
    <main>
      <section className="hero"><div className="hero-copy"><div className="eyebrow"><span className="pulse"></span> YOUR CAMPUS, CONNECTED</div><h1>Make campus life<br/><span>more memorable.</span></h1><p>Discover events, meet your community, and never miss a moment happening around campus.</p><a className="btn btn-primary hero-btn" href="#events">Explore events <span>↗</span></a><div className="hero-meta"><div className="avatar-stack"><i>J</i><i>A</i><i>M</i><i>+</i></div><span>Find your people. Build your story.</span></div></div><div className="hero-art"><div className="art-glow"></div><div className="floating-card card-one"><span className="mini-icon blue">✦</span><div><b>Tech & Innovation</b><small>Build something amazing</small></div></div><div className="art-window"><div className="window-bar"><i></i><i></i><i></i><span>campusconnect.app</span></div><div className="window-content"><div className="window-kicker">UPCOMING HIGHLIGHT</div><div className="window-title">Line Follower<br/>Challenge</div><div className="window-row"><span>12 NOV · 10:00 AM</span><b>→</b></div><div className="window-progress"><span></span></div><small>34 of 60 spots filled</small></div></div><div className="floating-card card-two"><span className="mini-icon green">✓</span><div><b>You're on the list!</b><small>Registration confirmed</small></div></div><span className="sparkle sparkle-a">✳</span><span className="sparkle sparkle-b">✦</span></div></section>
      <section className="stats"><div><b>12+</b><span>Events this month</span></div><div><b>4</b><span>Popular categories</span></div><div><b>1 place</b><span>For your campus community</span></div></section>
      <section className="events-section" id="events"><div className="section-heading"><div><div className="eyebrow">FIND YOUR NEXT EXPERIENCE</div><h2>Explore campus events</h2><p>There's always something happening. Find what inspires you.</p></div><span className="event-count">{visible.length} EVENTS</span></div><div className="filters">{['ALL','TECHNOLOGY','WORKSHOP','SPORTS','SEMINAR'].map(f=><button key={f} className={filter===f?'filter active':'filter'} onClick={()=>setFilter(f)}>{f==='ALL'?'All events':f[0]+f.slice(1).toLowerCase()}</button>)}</div><div className="event-grid">{visible.map((e,i)=><article className="event-card" key={e.id}><div className={'event-visual '+(e.color||'blue')}><span className="event-category">{e.category}</span><span className="visual-symbol">{['✳','◈','↗','✦'][i%4]}</span><span className="visual-index">0{i+1}</span></div><div className="event-body"><div className="event-date">{e.date} <span>·</span> {e.time}</div><h3>{e.title}</h3><p>{e.description}</p><div className="event-foot"><span>⌖ {e.venue}</span><button onClick={()=>setSelected(e)} aria-label={'View '+e.title}>View details <b>↗</b></button></div><div className="capacity"><span><i style={{width:Math.min(100,(e.registered/e.capacity)*100)+'%'}}></i></span><small>{e.registered}/{e.capacity} registered</small></div></div></article>)}</div></section>
      <section className="join-banner" id="about"><div><div className="eyebrow">GOOD THINGS HAPPEN TOGETHER</div><h2>Your campus story starts here.</h2><p>Sign in to reserve your spot and stay in the loop.</p></div><div className="join-side"><a className="btn btn-white" href="#login">Join the community <span>↗</span></a></div></section>
      <section className="login-section" id="login"><div className="login-copy"><div className="eyebrow">WELCOME TO YOUR COMMUNITY</div><h2>One campus.<br/><span>Many possibilities.</span></h2><p>Sign in to register for events and keep your campus calendar full.</p></div><form className="login-card" onSubmit={auth}><div className="profile-icon">♙</div><h3>{authMode==='login'?'Welcome back':'Create your account'}</h3><p>{authMode==='login'?'Sign in to continue to CampusConnect':'Join your campus community today'}</p><label>Email address<input type="email" required placeholder="you@college.edu" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" required minLength="6" placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="btn btn-primary submit-btn" disabled={loading}>{loading?'Please wait…':authMode==='login'?'Sign in':'Create account'}</button><div className="form-switch">{authMode==='login'?'New to CampusConnect?':'Already have an account?'} <button type="button" onClick={()=>setAuthMode(authMode==='login'?'signup':'login')}>{authMode==='login'?'Create account':'Sign in'}</button></div>{!configured&&<div className="config-note">Preview mode: add Supabase URL and anon key in Vercel to enable authentication and live registrations.</div>}</form></section>
    </main><footer><a className="brand" href="#"><span className="brand-mark">C</span>Campus<span>Connect</span></a><span>Made for campus communities · © 2026</span><a href="#events">Back to events ↑</a></footer>
    {selected&&<div className="modal-backdrop" onClick={()=>setSelected(null)}><div className="modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setSelected(null)}>×</button><div className="eyebrow">{selected.category}</div><h2>{selected.title}</h2><p>{selected.description}</p><div className="modal-info"><span>▦ {selected.date} · {selected.time}</span><span>⌖ {selected.venue}</span><span>◉ {selected.capacity-selected.registered} spots remaining</span></div><button className="btn btn-primary submit-btn" onClick={()=>joinEvent(selected)} disabled={registered.includes(selected.id)}>{registered.includes(selected.id)?'Registered ✓':'Register for event →'}</button></div></div>}
    {notice&&<div className="toast" role="status">{notice}</div>}
  </div>
}
createRoot(document.getElementById('root')).render(<App/>);