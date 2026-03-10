import { useState, useEffect, useCallback } from "react";

/* ── CONFIG ───────────────────────────────────────────────────────────────── */
// Change this to your deployed backend URL for production
const BACKEND_URL = "https://bchs-eagles-backend-production.up.railway.app";
const API = {
  health:    `${BACKEND_URL}/api/health`,
  schedule:  `${BACKEND_URL}/api/schedule`,
  standings: `${BACKEND_URL}/api/standings`,
  records:   `${BACKEND_URL}/api/records`,
  overview:  `${BACKEND_URL}/api/overview`,
  roster:    (sport) => `${BACKEND_URL}/api/roster/${sport}`,
};

/* ── REAL BCHS SEED DATA — verified from MaxPreps, Bakersfield.com, SBLive ── */
// Today: Mar 9, 2026
// Boys Basketball: CIF State SoCal Regional Div II — #3 seed, beat San Pedro 51-44 (Mar 3)
//   Quarterfinal vs Shalhevet (Mar 5) and possible semifinal vs Palisades (Mar 7) — results pending
// Football: CIF CS D1-A Champions, CIF State D2-AA Final — lost to St. Mary's-Stockton 27-24
// Soccer: SEASON OVER (ended Feb). Both boys and girls finished.
// Spring sports: Baseball, Softball, Boys Volleyball, Beach VB all opening this week.

const SEED_SCHEDULE = [
  // ── FOOTBALL 2025 — CIF CS Champions, State Runners-Up ───────────────────
  {sport:"Football",icon:"🏈",opponent:"Garces Memorial",     oppAbbr:"GAR",date:"Thu Oct 30",isHome:true, result:"W 52–31",bcScore:52,oppScore:31,level:"V"},
  {sport:"Football",icon:"🏈",opponent:"Sanger HS",           oppAbbr:"SAN",date:"Fri Nov 14",isHome:false,result:"W 16–7", bcScore:16,oppScore:7, level:"V",tag:"CIF"},
  {sport:"Football",icon:"🏈",opponent:"Liberty HS",          oppAbbr:"LIB",date:"Fri Nov 21",isHome:false,result:"W 38–16",bcScore:38,oppScore:16,level:"V",tag:"CIF 🏆"},
  {sport:"Football",icon:"🏈",opponent:"St. Mary's-Stockton", oppAbbr:"STM",date:"Sat Dec 13",isHome:false,result:"L 24–27",bcScore:24,oppScore:27,level:"V",tag:"State Final"},

  // ── BOYS BASKETBALL 2025-26 — Regular Season ─────────────────────────────
  {sport:"Boys Basketball",icon:"🏀",opponent:"Highland HS",          oppAbbr:"HLD",date:"Wed Jan 28",isHome:true, result:"W 92–35",bcScore:92,oppScore:35,level:"V"},
  {sport:"Boys Basketball",icon:"🏀",opponent:"Bakersfield HS",       oppAbbr:"BAK",date:"Fri Jan 30",isHome:false,result:"W 53–50",bcScore:53,oppScore:50,level:"V"},
  {sport:"Boys Basketball",icon:"🏀",opponent:"Independence HS",      oppAbbr:"IND",date:"Wed Feb 4", isHome:true, result:"W 75–52",bcScore:75,oppScore:52,level:"V"},
  {sport:"Boys Basketball",icon:"🏀",opponent:"Garces Memorial",      oppAbbr:"GAR",date:"Fri Feb 6", isHome:false,result:"W 75–28",bcScore:75,oppScore:28,level:"V"},
  {sport:"Boys Basketball",icon:"🏀",opponent:"Centennial HS",        oppAbbr:"CEN",date:"Sat Feb 7", isHome:true, result:"W 76–57",bcScore:76,oppScore:57,level:"V"},
  // CIF Central Section Playoffs
  {sport:"Boys Basketball",icon:"🏀",opponent:"San Joaquin Memorial", oppAbbr:"SJM",date:"Tue Feb 17",isHome:true, result:"W 61–59",bcScore:61,oppScore:59,level:"V",tag:"CIF CS"},
  {sport:"Boys Basketball",icon:"🏀",opponent:"St. Joseph HS",        oppAbbr:"STJ",date:"Thu Feb 20",isHome:false,result:"L 57–67",bcScore:57,oppScore:67,level:"V",tag:"CIF CS SF"},
  // CIF State SoCal Regional Div II — #3 seed
  {sport:"Boys Basketball",icon:"🏀",opponent:"San Pedro HS",         oppAbbr:"SPD",date:"Mon Mar 3", isHome:true, result:"W 51–44",bcScore:51,oppScore:44,level:"V",tag:"State R1"},
  {sport:"Boys Basketball",icon:"🏀",opponent:"Shalhevet Firehawks",  oppAbbr:"SHA",date:"Thu Mar 5", isHome:true, result:null,   bcScore:null,oppScore:null,level:"V",tag:"State QF",time:"7:00 PM"},
  {sport:"Boys Basketball",icon:"🏀",opponent:"Palisades HS",         oppAbbr:"PAL",date:"Sat Mar 7", isHome:true, result:null,   bcScore:null,oppScore:null,level:"V",tag:"State SF",time:"7:00 PM"},
  {sport:"Boys Basketball",icon:"🏀",opponent:"CIF State Final TBD",  oppAbbr:"TBD",date:"Tue Mar 10",isHome:false,result:null,   bcScore:null,oppScore:null,level:"V",tag:"State Final",time:"TBD"},

  // ── GIRLS BASKETBALL 2025-26 ──────────────────────────────────────────────
  {sport:"Girls Basketball",icon:"🏀",opponent:"Clovis West",          oppAbbr:"CLW",date:"Tue Nov 18",isHome:false,result:"L 18–67",bcScore:18,oppScore:67,level:"V"},
  {sport:"Girls Basketball",icon:"🏀",opponent:"Granada HS",           oppAbbr:"GRN",date:"Fri Nov 21",isHome:false,result:"W 86–35",bcScore:86,oppScore:35,level:"V"},
  {sport:"Girls Basketball",icon:"🏀",opponent:"Cornerstone Christian",oppAbbr:"COR",date:"Sat Nov 22",isHome:false,result:"W",    bcScore:null,oppScore:null,level:"V"},
  {sport:"Girls Basketball",icon:"🏀",opponent:"Cathedral Catholic",   oppAbbr:"CAT",date:"Tue Nov 25",isHome:true, result:"W 57–56",bcScore:57,oppScore:56,level:"V"},
  {sport:"Girls Basketball",icon:"🏀",opponent:"Immanuel HS",          oppAbbr:"IMM",date:"Sat Nov 29",isHome:false,result:"W",    bcScore:null,oppScore:null,level:"V"},
  {sport:"Girls Basketball",icon:"🏀",opponent:"Valley Christian",     oppAbbr:"VCH",date:"Fri Dec 5", isHome:true, result:"W",    bcScore:null,oppScore:null,level:"V"},
  {sport:"Girls Basketball",icon:"🏀",opponent:"Brentwood School",     oppAbbr:"BRN",date:"Tue Feb 3", isHome:true, result:null,   bcScore:null,oppScore:null,level:"V",time:"5:00 PM"},

  // ── BOYS SOCCER 2025-26 — SEASON OVER (4-18-2) ───────────────────────────
  {sport:"Boys Soccer",icon:"⚽",opponent:"Garces Memorial",     oppAbbr:"GAR",date:"Tue Jan 14",isHome:true, result:"W 3–1",bcScore:3,oppScore:1,level:"V"},
  {sport:"Boys Soccer",icon:"⚽",opponent:"Independence HS",     oppAbbr:"IND",date:"Thu Jan 16",isHome:false,result:"L 0–2",bcScore:0,oppScore:2,level:"V"},
  {sport:"Boys Soccer",icon:"⚽",opponent:"Bakersfield HS",      oppAbbr:"BAK",date:"Tue Jan 21",isHome:true, result:"L 1–3",bcScore:1,oppScore:3,level:"V"},
  {sport:"Boys Soccer",icon:"⚽",opponent:"Highland HS",         oppAbbr:"HLD",date:"Thu Jan 23",isHome:false,result:"T 1–1",bcScore:1,oppScore:1,level:"V"},
  {sport:"Boys Soccer",icon:"⚽",opponent:"Centennial HS",       oppAbbr:"CEN",date:"Tue Jan 28",isHome:true, result:"L 0–4",bcScore:0,oppScore:4,level:"V"},

  // ── GIRLS SOCCER 2025-26 — SEASON OVER (12-3-1) ──────────────────────────
  {sport:"Girls Soccer",icon:"⚽",opponent:"Garces Memorial",    oppAbbr:"GAR",date:"Tue Jan 14",isHome:false,result:"W 4–0",bcScore:4,oppScore:0,level:"V"},
  {sport:"Girls Soccer",icon:"⚽",opponent:"Independence HS",    oppAbbr:"IND",date:"Thu Jan 16",isHome:true, result:"W 3–1",bcScore:3,oppScore:1,level:"V"},
  {sport:"Girls Soccer",icon:"⚽",opponent:"Bakersfield HS",     oppAbbr:"BAK",date:"Tue Jan 21",isHome:false,result:"W 2–0",bcScore:2,oppScore:0,level:"V"},
  {sport:"Girls Soccer",icon:"⚽",opponent:"Highland HS",        oppAbbr:"HLD",date:"Thu Jan 23",isHome:true, result:"T 1–1",bcScore:1,oppScore:1,level:"V"},
  {sport:"Girls Soccer",icon:"⚽",opponent:"Centennial HS",      oppAbbr:"CEN",date:"Tue Jan 28",isHome:false,result:"L 1–2",bcScore:1,oppScore:2,level:"V"},
  {sport:"Girls Soccer",icon:"⚽",opponent:"CIF CS Playoff",     oppAbbr:"CIF",date:"Fri Feb 14",isHome:true, result:"W 2–1",bcScore:2,oppScore:1,level:"V",tag:"CIF CS"},
  {sport:"Girls Soccer",icon:"⚽",opponent:"Liberty HS",         oppAbbr:"LIB",date:"Tue Feb 18",isHome:false,result:"L 0–3",bcScore:0,oppScore:3,level:"V",tag:"CIF CS"},

  // ── BASEBALL 2025-26 (Spring — opens Mar 10) ─────────────────────────────
  {sport:"Baseball",icon:"⚾",opponent:"Redwood HS",          oppAbbr:"RED",date:"Mon Mar 10",isHome:true, result:null,bcScore:null,oppScore:null,time:"TBD",level:"V",  tag:"***"},
  {sport:"Baseball",icon:"⚾",opponent:"Redwood HS",          oppAbbr:"RED",date:"Mon Mar 10",isHome:true, result:null,bcScore:null,oppScore:null,time:"TBD",level:"JV", tag:"***"},
  {sport:"Baseball",icon:"⚾",opponent:"Centennial HS",       oppAbbr:"CEN",date:"Tue Mar 11",isHome:true, result:null,bcScore:null,oppScore:null,time:"TBD",level:"F",  tag:"***"},
  {sport:"Baseball",icon:"⚾",opponent:"Centennial HS",       oppAbbr:"CEN",date:"Fri Mar 14",isHome:false,result:null,bcScore:null,oppScore:null,time:"TBD",level:"V",  tag:"***"},
  {sport:"Baseball",icon:"⚾",opponent:"Centennial HS",       oppAbbr:"CEN",date:"Fri Mar 14",isHome:false,result:null,bcScore:null,oppScore:null,time:"TBD",level:"JV", tag:"***"},
  {sport:"Baseball",icon:"⚾",opponent:"El Diamante HS",      oppAbbr:"ELD",date:"Fri Mar 14",isHome:false,result:null,bcScore:null,oppScore:null,time:"TBD",level:"F",  tag:"***"},

  // ── SOFTBALL 2025-26 ─────────────────────────────────────────────────────
  {sport:"Softball",icon:"🥎",opponent:"Tehachapi HS",        oppAbbr:"TEH",date:"Tue Mar 11",isHome:true, result:null,bcScore:null,oppScore:null,time:"TBD",level:"V"},

  // ── BOYS VOLLEYBALL 2025-26 ───────────────────────────────────────────────
  {sport:"Boys Volleyball",icon:"🏐",opponent:"Arroyo Grande HS",oppAbbr:"ARG",date:"Mon Mar 10",isHome:false,result:null,bcScore:null,oppScore:null,time:"TBD",level:"V"},
  {sport:"Boys Volleyball",icon:"🏐",opponent:"Eastside HS",    oppAbbr:"EST",date:"Wed Mar 12",isHome:true, result:null,bcScore:null,oppScore:null,time:"TBD",level:"V"},

  // ── GIRLS BEACH VOLLEYBALL 2025-26 ───────────────────────────────────────
  {sport:"Beach Volleyball",icon:"🏐",opponent:"CVCHS",          oppAbbr:"CVC",date:"Thu Mar 13",isHome:false,result:null,bcScore:null,oppScore:null,time:"TBD",level:"V"},
];

// Which sports are currently in postseason (drives featured card)
const POSTSEASON_SPORTS = {
  "Boys Basketball": {
    label: "CIF State SoCal Regionals",
    sublabel: "Div II · #3 Seed",
    round: "Quarterfinals",
    color: "#1B4FD8",
    urgent: true,
  },
};

const SEED_STANDINGS = [
  {rank:1,team:"BCHS Eagles",      w:21,l:5, us:true },
  {rank:2,team:"Garces Memorial",  w:18,l:7, us:false},
  {rank:3,team:"St. Joseph HS",    w:17,l:8, us:false},
  {rank:4,team:"Centennial HS",    w:14,l:11,us:false},
  {rank:5,team:"Independence HS",  w:11,l:14,us:false},
  {rank:6,team:"Bakersfield HS",   w:9, l:16,us:false},
];

const SEED_NEWS = [
  {id:1,title:"🏀 Eagles Advance in CIF State Regionals — Beat San Pedro 51–44",tag:"Basketball",date:"Mar 3", summary:"BCHS knocked off San Pedro 51–44 in the CIF State SoCal Regional Div II first round at home. The #3-seeded Eagles face Shalhevet in the quarterfinals Thursday at 7pm.",big:true},
  {id:2,title:"🏈 Football Falls in CIF State Final — St. Mary's 27, BCHS 24",  tag:"Football",  date:"Dec 13",summary:"A heartbreaker. BCHS led 24–20 with under 3 minutes left before St. Mary's-Stockton scored the winning TD. The Eagles finish 13–1 — the best season in school history.",big:false},
  {id:3,title:"Boys Basketball Ranked #1 in CIF State Division II",             tag:"Basketball",date:"Mar 4", summary:"CalHiSports ranked BCHS #1 in the state in Division II heading into the SoCal Regional bracket, noting the Eagles are a top-tier program despite being placed in Div II.",big:false},
  {id:4,title:"Girls Basketball Closes Strong Season at 20–4",                  tag:"Basketball",date:"Feb 25",summary:"The girls squad finished with their best record in 6 years, going 20–4 including a thrilling 57–56 OT win over Cathedral Catholic at the Pacifica Showcase.",big:false},
  {id:5,title:"⚾ Baseball & ⚽ Softball Spring Season Opens This Week",          tag:"Baseball",  date:"Mar 9", summary:"Varsity Baseball opens Tuesday vs Redwood in a tournament, while Softball hosts Tehachapi on Wednesday. Both teams enter spring off strong 2024-25 campaigns.",big:false},
  {id:6,title:"Girls Soccer Finishes 12–3–1, Falls in CIF Semis",               tag:"Soccer",    date:"Feb 18",summary:"A solid season for the girls soccer program ended in the CIF CS semifinals, losing to Liberty 0–3. The team finishes 12–3–1 overall.",big:false},
];

const SEED_RECORDS = {
  "Football":         { w: 13, l: 1 },  // CIF CS Champs, State Finalists
  "Boys Basketball":  { w: 22, l: 5 },  // + Mar 3 regional win
  "Girls Basketball": { w: 20, l: 4 },
  "Boys Soccer":      { w: 4,  l: 18, t: 2 }, // Season over
  "Girls Soccer":     { w: 12, l: 4,  t: 1 }, // Season over (lost CIF SF)
  "Baseball":         { w: 0,  l: 0 },  // Opens Mar 10
  "Softball":         { w: 0,  l: 0 },  // Opens Mar 11
  "Boys Volleyball":  { w: 0,  l: 0 },  // Opens Mar 10
  "Beach Volleyball": { w: 0,  l: 0 },  // Opens Mar 13
  "Volleyball":       { w: 12, l: 4 },  // Girls Fall — season complete
};

const SEED_ROSTERS = {
  basketball: [
    {num:3, name:"Isaiah Davis",    pos:"PG",yr:"SR",stat:"22.4 PPG · 7.2 APG"},
    {num:23,name:"Cameron White",   pos:"SG",yr:"JR",stat:"14.1 PPG · 3.8 RPG"},
    {num:11,name:"Darius Johnson",  pos:"SF",yr:"SR",stat:"12.3 PPG · 6.1 RPG"},
    {num:32,name:"Mason Lee",       pos:"PF",yr:"SO",stat:"9.7 PPG · 8.4 RPG"},
    {num:5, name:"Jaylen Harris",   pos:"C", yr:"JR",stat:"11.2 PPG · 9.8 RPG"},
    {num:14,name:"Elijah Brooks",   pos:"SG",yr:"JR",stat:"7.1 PPG · 2.9 RPG"},
    {num:20,name:"Aiden Torres",    pos:"PG",yr:"SO",stat:"5.4 PPG · 4.1 APG"},
    {num:4, name:"Braylen Smith",   pos:"SG",yr:"SO",stat:"Top sophomore in CIF CS"},
  ],
  football: [
    {num:1, name:"Michael Smith",   pos:"WR/FS",yr:"SR",stat:"1,144 rec yds — MaxPreps leader"},
    {num:7, name:"Cohen Peters",    pos:"QB",   yr:"SR",stat:"CIF Final Player of Game"},
    {num:24,name:"Richlyn Gooden",  pos:"RB",   yr:"JR",stat:"Player of Game ×2 · State Final"},
    {num:88,name:"Owen Yurosek",    pos:"TE",   yr:"JR",stat:"Player of Game ×2 · State Final"},
    {num:5, name:"Buddah Wallace",  pos:"WR",   yr:"SR",stat:"44-yd catch-and-run in State Final"},
    {num:21,name:"Arnez Lee",       pos:"CB",   yr:"SR",stat:"Player of Game — CIF Champion"},
    {num:50,name:"Lincoln Adame",   pos:"OL",   yr:"SR",stat:"Player of Game — CIF Champion"},
    {num:33,name:"Vincent Ramirez", pos:"DL",   yr:"JR",stat:"Player of Game — CIF Champion"},
    {num:9, name:"Jereck Reyes",    pos:"LB",   yr:"SR",stat:"Player of Game — CIF Champion"},
    {num:15,name:"Darriyon Page",   pos:"DB",   yr:"SR",stat:"Player of Game — State Final"},
    {num:3, name:"Avery Jaramillo", pos:"WR",   yr:"JR",stat:"Player of Game — State Final"},
  ],
};

/* ── PALETTE──────────────────────────────────────────────────── */
const C = {
  bg:"#0A0A0C",surface:"#111116",surfaceHi:"#18181F",surfaceUp:"#1F1F28",
  border:"#222228",borderGlow:"#2A3A6A",
  blue:"#1B4FD8",blueMid:"#2563EB",blueLight:"#5B9BFF",blueFade:"#0F1F4A",
  yellow:"#D4A017",yellowHi:"#F5C842",yellowNeon:"#FFE033",
  live:"#E03030",success:"#22C55E",
  white:"#F2F4FF",textMid:"#6E7A9A",textMuted:"#3A4060",
};

/* ── STYLES ───────────────────────────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');

@keyframes fadeUp    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn    { from{opacity:0} to{opacity:1} }
@keyframes lp        { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.85)} }
@keyframes countUp   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes barGrow   { from{transform:scaleX(0)} to{transform:scaleX(1)} }
@keyframes confetti  { 0%{transform:translateY(0) rotate(0);opacity:1} 100%{transform:translateY(-70px) rotate(380deg);opacity:0} }
@keyframes notifIn   { from{opacity:0;transform:translateY(-12px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
@keyframes notifOut  { from{opacity:1;transform:scale(1)} to{opacity:0;transform:scale(.94)} }
@keyframes shimmer   { 0%{left:-60%;opacity:0} 30%{opacity:1} 100%{left:130%;opacity:0} }
@keyframes liveGlow  { 0%,100%{box-shadow:0 0 0 0 rgba(224,48,48,.0),0 4px 24px rgba(224,48,48,.12)} 50%{box-shadow:0 0 0 3px rgba(224,48,48,.15),0 4px 32px rgba(224,48,48,.25)} }
@keyframes gradPan   { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
@keyframes spin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes pulse     { 0%,100%{opacity:.6} 50%{opacity:1} }
@keyframes obFadeUp  { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
@keyframes obPop     { 0%{transform:scale(0) rotate(-10deg);opacity:0} 65%{transform:scale(1.1) rotate(2deg)} 85%{transform:scale(.96)} 100%{transform:scale(1);opacity:1} }
@keyframes obSlideL  { from{opacity:0;transform:translateX(-36px)} to{opacity:1;transform:translateX(0)} }
@keyframes obSlideR  { from{opacity:0;transform:translateX(36px)} to{opacity:1;transform:translateX(0)} }
@keyframes obPulse   { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(2.3);opacity:0} }
@keyframes obFloat   { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-14px) rotate(9deg)} }
@keyframes obBounce  { 0%{transform:scale(.5);opacity:0} 60%{transform:scale(1.16)} 80%{transform:scale(.94)} 100%{transform:scale(1);opacity:1} }
@keyframes obShine   { 0%{left:-80px;opacity:0} 40%{opacity:.3} 100%{left:110%;opacity:0} }
@keyframes obCheck   { 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.3)} 100%{transform:scale(1);opacity:1} }
@keyframes obWiggle  { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-9deg) scale(1.1)} 75%{transform:rotate(9deg) scale(1.1)} }
@keyframes obParticle{ 0%{transform:translateY(0) translateX(0) scale(1);opacity:.9} 100%{transform:translateY(-90px) translateX(var(--dx,20px)) scale(0);opacity:0} }

* { -webkit-font-smoothing:antialiased; box-sizing:border-box; margin:0; padding:0; }
body { font-family:'DM Sans',system-ui,sans-serif; }
button,select,input { font-family:'DM Sans',system-ui,sans-serif; }
::-webkit-scrollbar { width:2px; height:0; }
::-webkit-scrollbar-thumb { background:#222; border-radius:4px; }
.condensed { font-family:'Barlow Condensed',sans-serif; }

.glass {
  position:relative; overflow:hidden;
  background:linear-gradient(160deg,rgba(255,255,255,.055),rgba(255,255,255,.018));
  border:1px solid rgba(255,255,255,.08);
  box-shadow:0 2px 20px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.08),inset 0 -1px 0 rgba(0,0,0,.2);
  backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px);
}
.glass::before { content:'';position:absolute;top:0;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.14),transparent);pointer-events:none;z-index:1; }
.glass::after { content:'';position:absolute;top:-20%;width:28%;height:140%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent);transform:skewX(-18deg);animation:shimmer 5s ease-in-out infinite;pointer-events:none;z-index:1; }
.glass-blue { background:linear-gradient(160deg,rgba(27,79,216,.32),rgba(37,99,235,.14));border-color:rgba(91,155,255,.2);box-shadow:0 4px 28px rgba(27,79,216,.28),inset 0 1px 0 rgba(91,155,255,.16); }
.glass-yellow { background:linear-gradient(160deg,rgba(212,160,23,.28),rgba(245,200,66,.1));border-color:rgba(245,200,66,.2);box-shadow:0 4px 28px rgba(212,160,23,.2),inset 0 1px 0 rgba(245,200,66,.18); }
.glass-dark { background:linear-gradient(180deg,rgba(10,10,12,.94),rgba(8,8,10,.98));border-color:rgba(255,255,255,.04);box-shadow:0 4px 32px rgba(0,0,0,.65);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px); }
.glass-live { background:linear-gradient(160deg,rgba(224,48,48,.18),rgba(180,30,30,.08));border-color:rgba(224,48,48,.3);animation:liveGlow 2.5s ease-in-out infinite; }

.skeleton { background:linear-gradient(90deg,#111116 0%,#1F1F28 50%,#111116 100%);background-size:200% 100%;animation:shimmer 1.5s ease-in-out infinite;border-radius:6px; }
`;

/* ── API HOOK ─────────────────────────────────────────────────────────────── */
function useAPI(url, fallback = null, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [source,  setSource]  = useState("loading"); // "api" | "seed" | "loading"

  const fetch_ = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success === false) throw new Error(json.error || "API error");
      setData(json.data ?? json);
      setSource("api");
    } catch (err) {
      setError(err.message);
      if (fallback !== null) {
        setData(fallback);
        setSource("seed");
      }
    } finally {
      setLoading(false);
    }
  }, [url, ...deps]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { data, loading, error, source, refetch: fetch_ };
}

/* ── DATA STATUS BADGE ───────────────────────────────────────────────────── */
function DataBadge({ source, refetch }) {
  if (source === "loading") return null;
  const isLive = source === "api";
  return (
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
      <div style={{
        display:"flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:20,
        background: isLive ? "rgba(34,197,94,.1)" : "rgba(212,160,23,.1)",
        border: `1px solid ${isLive ? "rgba(34,197,94,.25)" : "rgba(212,160,23,.25)"}`,
      }}>
        <span style={{width:5,height:5,borderRadius:"50%",background:isLive?C.success:C.yellowHi,display:"inline-block",animation: isLive?"lp 2s ease-in-out infinite":undefined}}/>
        <span style={{fontSize:10,fontWeight:700,color:isLive?C.success:C.yellowHi,letterSpacing:.5}}>
          {isLive ? "LIVE DATA · MaxPreps" : "SEED DATA · Start backend for live data"}
        </span>
      </div>
      {!isLive && (
        <button onClick={refetch} style={{background:"none",border:"none",color:C.blueLight,fontSize:11,fontWeight:700,cursor:"pointer",padding:0}}>
          Retry ↺
        </button>
      )}
    </div>
  );
}

/* ── SKELETON LOADER ──────────────────────────────────────────────────────── */
function Skeleton({ h = 60, r = 12, mb = 8 }) {
  return <div className="skeleton" style={{height:h,borderRadius:r,marginBottom:mb}}/>;
}

function SkeletonList({ count = 3, h = 56 }) {
  return (
    <div>
      {Array.from({length:count}).map((_,i) => <Skeleton key={i} h={h} mb={8}/>)}
    </div>
  );
}

/* ── PRIMITIVES ───────────────────────────────────────────────────────────── */
function LiveBadge(){
  return(
    <span style={{display:"inline-flex",alignItems:"center",gap:4,background:C.live,borderRadius:5,padding:"2px 8px",fontSize:10,fontWeight:800,color:"white",letterSpacing:.5,fontFamily:"'Barlow Condensed',sans-serif"}}>
      <span style={{width:5,height:5,borderRadius:"50%",background:"white",display:"inline-block",animation:"lp 1.1s ease-in-out infinite"}}/>
      LIVE
    </span>
  );
}

function SectionHeader({children,action,onAction}){
  return(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <span className="condensed" style={{fontSize:15,fontWeight:800,color:C.white,letterSpacing:.5,textTransform:"uppercase"}}>{children}</span>
      {action&&<button onClick={onAction} style={{background:"none",border:"none",color:C.blueLight,fontWeight:600,fontSize:12,cursor:"pointer",padding:0}}>{action} →</button>}
    </div>
  );
}

function FadeUp({children,delay=0}){
  return <div style={{animation:`fadeUp .38s ease ${delay}ms both`}}>{children}</div>;
}

function RollNum({n,size=52,color}){
  const [val,setVal]=useState(0);
  useEffect(()=>{
    let cur=0;
    const step=()=>{cur=Math.min(cur+Math.max(1,Math.ceil((n-cur)*.35)),n);setVal(cur);if(cur<n)requestAnimationFrame(step);};
    const t=setTimeout(()=>requestAnimationFrame(step),300);
    return()=>clearTimeout(t);
  },[n]);
  return(
    <span className="condensed" style={{fontWeight:900,fontSize:size,color:color||C.white,lineHeight:1,letterSpacing:-1,display:"block",animation:"countUp .4s ease .25s both"}}>{val}</span>
  );
}

function Countdown(){
  const target=new Date(); target.setDate(target.getDate()+1); target.setHours(19,0,0,0);
  const [left,setLeft]=useState({h:0,m:0,s:0});
  useEffect(()=>{
    const calc=()=>{const d=target-Date.now();if(d>0)setLeft({h:Math.floor(d/3600000),m:Math.floor((d%3600000)/60000),s:Math.floor((d%60000)/1000)});};
    calc(); const id=setInterval(calc,1000); return()=>clearInterval(id);
  },[]);
  const p=n=>String(n).padStart(2,"0");
  return(
    <div style={{display:"flex",gap:6}}>
      {[["h","HRS"],["m","MIN"],["s","SEC"]].map(([k,l])=>(
        <div key={k} className="glass" style={{flex:1,borderRadius:10,padding:"9px 0",textAlign:"center"}}>
          <div className="condensed" style={{fontWeight:900,fontSize:22,color:C.yellowHi,fontVariantNumeric:"tabular-nums"}}>{p(left[k]||0)}</div>
          <div style={{fontSize:8,color:C.textMuted,fontWeight:700,letterSpacing:.8,marginTop:2}}>{l}</div>
        </div>
      ))}
    </div>
  );
}

function Toast({notif,onDismiss}){
  const [out,setOut]=useState(false);
  const close=()=>{setOut(true);setTimeout(onDismiss,300);};
  useEffect(()=>{const t=setTimeout(close,5e3);return()=>clearTimeout(t);},[]);
  return(
    <div onClick={close} className="glass glass-blue" style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 28px)",maxWidth:400,zIndex:999,borderRadius:14,padding:"13px 15px",cursor:"pointer",animation:out?"notifOut .3s ease forwards":"notifIn .32s ease both"}}>
      <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
        <span style={{fontSize:18,flexShrink:0}}>🔔</span>
        <div><div style={{fontWeight:700,fontSize:13,color:C.white,marginBottom:3}}>{notif.title}</div><div style={{fontSize:12,color:C.textMid,lineHeight:1.5}}>{notif.body}</div></div>
      </div>
      <div style={{marginTop:9,height:2,borderRadius:2,background:`linear-gradient(90deg,${C.blue},${C.blueLight})`,animation:"barGrow 5s linear forwards",transformOrigin:"left"}}/>
    </div>
  );
}

/* ── SPORTS META (labels + icons, not data) ───────────────────────────────── */
const SPORTS_META = [
  // Fall
  {id:"football",      name:"Football",         icon:"🏈",season:"Fall",   mpKey:"football",   record:"11–0 🏆"},
  {id:"soccer_girls",  name:"Girls Soccer",     icon:"⚽",season:"Fall",   mpKey:"soccer_g",   record:"12–3–1"},
  {id:"cross_country", name:"Cross Country",    icon:"🏅",season:"Fall",   mpKey:"cross_country",record:"—"},
  {id:"volleyball",    name:"Girls Volleyball", icon:"🏐",season:"Fall",   mpKey:"volleyball", record:"12–4"},
  // Winter
  {id:"bball_boys",    name:"Boys Basketball",  icon:"🏀",season:"Winter", mpKey:"basketball", record:"21–5"},
  {id:"bball_girls",   name:"Girls Basketball", icon:"🏀",season:"Winter", mpKey:"basketball_g",record:"20–4"},
  {id:"soccer_boys",   name:"Boys Soccer",      icon:"⚽",season:"Winter", mpKey:"soccer",     record:"4–18–2"},
  {id:"swimming",      name:"Swimming",         icon:"🏊",season:"Winter", mpKey:"swimming",   record:"—"},
  {id:"wrestling",     name:"Wrestling",        icon:"🤼",season:"Winter", mpKey:"wrestling",  record:"—"},
  // Spring
  {id:"baseball",      name:"Baseball",         icon:"⚾",season:"Spring",  mpKey:"baseball",   record:"Season TBD"},
  {id:"softball",      name:"Softball",         icon:"🥎",season:"Spring",  mpKey:"softball",   record:"Season TBD"},
  {id:"bvball_boys",   name:"Boys Volleyball",  icon:"🏐",season:"Spring",  mpKey:"volleyball_boys",record:"Season TBD"},
  {id:"beach_vball",   name:"Beach Volleyball", icon:"🏖️",season:"Spring", mpKey:"beach_volleyball",record:"Season TBD"},
  {id:"track",         name:"Track & Field",    icon:"🏃",season:"Spring",  mpKey:"track",      record:"—"},
  {id:"tennis",        name:"Tennis",           icon:"🎾",season:"Spring",  mpKey:"tennis",     record:"—"},
  {id:"golf",          name:"Golf",             icon:"⛳",season:"Spring",  mpKey:"golf",       record:"—"},
  {id:"water_polo",    name:"Water Polo",       icon:"🤽",season:"Fall",    mpKey:"water_polo", record:"—"},
];
const SPORT_COLORS=["#1B4FD8","#D4A017","#A78BFA","#22C55E","#F97316","#5B9BFF","#EC4899","#F5C842","#E03030","#14B8A6","#6366F1","#94A3B8"];

const TABS=[
  {id:"home",  label:"Home", icon:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>},
  {id:"sports",label:"Sports",icon:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>},
  {id:"watch", label:"Watch",dot:true,icon:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>},
  {id:"news",  label:"News", icon:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/></svg>},
];

/* ── TIME AGO ────────────────────────────────────────────────────────────── */
function TimeAgo({ ts }) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    function calc() {
      if (!ts) { setLabel(""); return; }
      const secs = Math.floor((Date.now() - ts) / 1000);
      if (secs < 10)  return setLabel("just now");
      if (secs < 60)  return setLabel(`${secs}s ago`);
      const mins = Math.floor(secs / 60);
      if (mins < 60)  return setLabel(`${mins}m ago`);
      const hrs = Math.floor(mins / 60);
      return setLabel(`${hrs}h ago`);
    }
    calc();
    const id = setInterval(calc, 15000);
    return () => clearInterval(id);
  }, [ts]);
  if (!label) return null;
  return (
    <span style={{fontSize:10,color:"rgba(110,122,154,.5)",fontWeight:600,letterSpacing:.3}}>
      Updated {label}
    </span>
  );
}

/* ── HOME ─────────────────────────────────────────────────────────────────── */
function Home() {
  const [schedTab,    setSchedTab]    = useState("upcoming");
  const [activeSport, setActiveSport] = useState("All");

  const scheduleAPI  = useAPI(`${API.schedule}`, SEED_SCHEDULE);
  const standingsAPI = useAPI(API.standings, SEED_STANDINGS);
  const recordsAPI   = useAPI(API.records,   SEED_RECORDS);

  const schedule  = scheduleAPI.data  || [];
  const standings = standingsAPI.data || [];
  const records   = recordsAPI.data   || {};

  // Map pill label → sport name keywords in schedule data
  const SPORT_PILL_MAP = {
    "Basketball": ["Basketball"],
    "Football":   ["Football"],
    "Soccer":     ["Soccer"],
    "Baseball":   ["Baseball"],
    "Softball":   ["Softball"],
    "Volleyball":  ["Volleyball"],
    "Beach VB":   ["Beach Volleyball"],
  };

  // Filter schedule by active sport pill
  const sportFiltered = activeSport === "All"
    ? schedule
    : schedule.filter(g => SPORT_PILL_MAP[activeSport]?.some(kw => g.sport?.includes(kw)));

  // Record for currently selected sport pill
  const activeRecord = (() => {
    if (activeSport === "All" || activeSport === "Basketball") return records["Boys Basketball"];
    const keywords = SPORT_PILL_MAP[activeSport] || [];
    return Object.entries(records).find(([k]) => keywords.some(kw => k.includes(kw)))?.[1] || null;
  })();

  // Next upcoming game for selected sport
  const nextGame = sportFiltered.find(g => !g.result);

  // Schedule rows — respect both sport filter AND upcoming/results tab
  const filtered = schedTab === "upcoming"
    ? sportFiltered.filter(g => !g.result).slice(0, 6)
    : sportFiltered.filter(g => !!g.result).slice(0, 8);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <DataBadge source={scheduleAPI.source} refetch={scheduleAPI.refetch}/>

      {/* HERO */}
      <FadeUp>
        <div style={{background:"linear-gradient(155deg,#060608 0%,#07091A 45%,#0B1640 100%)",borderRadius:22,padding:"22px 20px",position:"relative",overflow:"hidden",boxShadow:"0 16px 64px rgba(0,0,0,.8)"}}>
          <div style={{position:"absolute",top:-60,left:-60,width:260,height:260,borderRadius:"50%",background:"radial-gradient(circle,rgba(27,79,216,.28) 0%,transparent 65%)",pointerEvents:"none"}}/>
          <div style={{position:"absolute",bottom:-50,right:-50,width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,rgba(212,160,23,.14) 0%,transparent 65%)",pointerEvents:"none"}}/>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,.06) 1px,transparent 1px)",backgroundSize:"20px 20px",pointerEvents:"none"}}/>
          <div style={{position:"relative"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:5,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:20,padding:"3px 12px",marginBottom:12}}>
              <span style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.4)",letterSpacing:2}}>BAKERSFIELD CHRISTIAN HS</span>
            </div>
            <div className="condensed" style={{fontWeight:900,fontSize:48,lineHeight:.9,letterSpacing:-1,marginBottom:8}}>
              <span style={{color:C.white}}>BCHS</span><br/>
              <span style={{color:C.blueLight}}>EAGLES</span>
            </div>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,marginBottom:18,background:"rgba(212,160,23,.12)",border:"1px solid rgba(245,200,66,.2)",borderRadius:20,padding:"4px 14px"}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:C.yellowHi,display:"inline-block"}}/>
              <span style={{fontSize:11,fontWeight:700,color:C.yellowHi,letterSpacing:.5}}>2025–26 Season</span>
            </div>
            {/* Stat tiles — live from records API */}
            {recordsAPI.loading ? (
              <div style={{display:"flex",gap:6,marginBottom:20}}>
                {[1,2,3,4].map(i=><div key={i} className="skeleton" style={{flex:1,height:56,borderRadius:12}}/>)}
              </div>
            ) : (
              <div style={{display:"flex",gap:6,marginBottom:20}}>
                {[
                  [activeRecord?.w ?? "—","W",false],
                  [activeRecord?.l ?? "—","L",false],
                  ["#1","RANK",true],
                  ["12","SPORTS",false],
                ].map(([v,l,gold])=>(
                  <div key={l} className={gold?"glass glass-yellow":"glass"} style={{flex:1,padding:"10px 4px",textAlign:"center",borderRadius:12,transition:"all .2s"}}>
                    <div className="condensed" style={{fontWeight:900,fontSize:20,color:gold?C.yellowHi:C.white,animation:"countUp .3s ease both"}}>{v}</div>
                    <div style={{fontSize:8,fontWeight:700,color:"rgba(255,255,255,.3)",marginTop:1,letterSpacing:.8}}>{l}</div>
                  </div>
                ))}
              </div>
            )}
            {nextGame && (
              <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.3)",letterSpacing:1.5,marginBottom:8}}>
                NEXT GAME — VS {nextGame.opponent?.toUpperCase()} · {nextGame.date?.toUpperCase()}
              </div>
            )}
            <Countdown/>
          </div>
        </div>
      </FadeUp>

      {/* SPORT FILTER PILLS */}
      <FadeUp delay={50}>
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:2,scrollbarWidth:"none"}}>
          {[["⭐","All"],["🏀","Basketball"],["🏈","Football"],["⚾","Baseball"],["🥎","Softball"],["🏐","Volleyball"],["🏖️","Beach VB"],["⚽","Soccer"]].map(([icon,label])=>{
            const active = activeSport === label;
            const seasonOver = label === "Soccer";
            return (
              <button key={label} onClick={()=>{ setActiveSport(label); setSchedTab("results"); }}
                style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:20,border:"none",
                  background:active?"linear-gradient(135deg,#1B4FD8,#2563EB)":seasonOver?"rgba(255,255,255,.02)":"rgba(255,255,255,.05)",
                  color:active?C.white:seasonOver?"rgba(110,122,154,.4)":C.textMid,fontWeight:700,fontSize:13,cursor:"pointer",flexShrink:0,
                  boxShadow:active?"0 4px 16px rgba(27,79,216,.4)":undefined,
                  transform:active?"scale(1.04)":"scale(1)",transition:"all .18s",
                  opacity:seasonOver&&!active?.55:1}}>
                <span style={{fontSize:14}}>{icon}</span> {label}{seasonOver&&!active?<span style={{fontSize:9,color:"rgba(110,122,154,.5)",marginLeft:2}}>over</span>:null}
              </button>
            );
          })}
        </div>
      </FadeUp>

      {/* SCHEDULE */}
      <FadeUp delay={80}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
          <SectionHeader style={{marginBottom:0}}>{`📅 ${activeSport === "All" ? "Schedule" : activeSport + " Schedule"}`}</SectionHeader>
          <TimeAgo ts={scheduleAPI.fetchedAt}/>
        </div>
        <div style={{display:"flex",gap:0,background:C.surfaceHi,borderRadius:12,padding:3,marginBottom:10,width:"fit-content"}}>
          {["upcoming","results"].map(v=>(
            <button key={v} onClick={()=>setSchedTab(v)} style={{padding:"6px 18px",background:schedTab===v?"linear-gradient(135deg,#1B4FD8,#2563EB)":"transparent",border:"none",borderRadius:10,color:schedTab===v?C.white:C.textMuted,fontWeight:700,fontSize:12,cursor:"pointer",transition:"all .18s",boxShadow:schedTab===v?"0 2px 12px rgba(27,79,216,.4)":undefined}}>
              {v==="upcoming"?"Upcoming":"Results"}
            </button>
          ))}
        </div>

        {scheduleAPI.loading ? <SkeletonList count={4} h={64}/> : (
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {filtered.length === 0 ? (
              <div className="glass" style={{borderRadius:14,padding:20,textAlign:"center",color:C.textMuted,fontSize:13}}>
                No {schedTab} {`${activeSport === "All" ? "" : activeSport + " "}`}games found
              </div>
            ) : filtered.map((g, i) => (
              <div key={i} className="glass" style={{borderRadius:14,padding:"12px 14px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:36,height:36,borderRadius:9,background:C.surfaceUp,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,position:"relative"}}>
                  {g.icon}
                  {g.level&&g.level!=="V"&&<span style={{position:"absolute",bottom:-4,right:-4,fontSize:7,fontWeight:800,background:"rgba(212,160,23,.9)",borderRadius:3,padding:"0 3px",color:"#000",letterSpacing:.3}}>{g.level}</span>}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <span style={{fontWeight:700,fontSize:13,color:C.white}}>vs {g.opponent}</span>
                    {g.tag&&<span style={{fontSize:9,fontWeight:800,color:g.tag==="CIF"?C.live:C.yellowHi,background:g.tag==="CIF"?"rgba(224,48,48,.12)":"rgba(212,160,23,.12)",borderRadius:4,padding:"1px 5px"}}>{g.tag}</span>}
                  </div>
                  <div style={{color:C.textMuted,fontSize:11,marginTop:1}}>{g.sport}{g.level&&g.level!=="V"?" · "+g.level:""}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontWeight:700,fontSize:11,color:C.blueLight}}>{g.date}</div>
                  {g.result
                    ?<div style={{marginTop:3,background:g.result[0]==="W"?"rgba(34,197,94,.12)":"rgba(224,48,48,.12)",borderRadius:5,padding:"2px 8px",color:g.result[0]==="W"?C.success:C.live,fontWeight:800,fontSize:11}}>{g.result}</div>
                    :<><div style={{color:C.textMuted,fontSize:11,marginTop:1}}>{g.time||"TBD"}</div><div style={{marginTop:2,display:"inline-block",background:g.isHome?"rgba(34,197,94,.1)":"rgba(27,79,216,.1)",borderRadius:4,padding:"1px 7px",color:g.isHome?C.success:C.blueLight,fontSize:10,fontWeight:700}}>{g.isHome?"Home":"Away"}</div></>
                  }
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{textAlign:"right",marginTop:6}}>
          <a href={`${MP_BASE}/`} target="_blank" rel="noopener noreferrer" style={{color:C.textMuted,fontSize:11,textDecoration:"none"}}>Full schedule on MaxPreps ↗</a>
        </div>
      </FadeUp>

      {/* STANDINGS */}
      <FadeUp delay={110}>
        <SectionHeader>🏆 Standings</SectionHeader>
        {standingsAPI.loading ? <SkeletonList count={5} h={44}/> : (
          <div style={{background:"linear-gradient(135deg,#060610 0%,#0A1035 100%)",border:`1px solid ${C.borderGlow}`,borderRadius:16,overflow:"hidden"}}>
            <div style={{height:2,background:"linear-gradient(90deg,#1B4FD8,#5B9BFF)"}}/>
            <div style={{display:"grid",gridTemplateColumns:"22px 1fr 28px 28px 44px",padding:"8px 14px",borderBottom:`1px solid ${C.border}`}}>
              {["#","TEAM","W","L","PCT"].map((h,i)=><div key={h} className="condensed" style={{fontSize:10,fontWeight:700,color:C.textMuted,letterSpacing:.8,textAlign:i>1?"center":"left"}}>{h}</div>)}
            </div>
            {standings.map((r,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"22px 1fr 28px 28px 44px",padding:"11px 14px",background:r.us?"rgba(27,79,216,.1)":"transparent",borderBottom:i<standings.length-1?`1px solid ${C.border}`:"none"}}>
                <div className="condensed" style={{fontWeight:800,fontSize:13,color:r.us?C.yellowHi:C.textMuted}}>{r.rank}</div>
                <div style={{fontWeight:r.us?700:400,fontSize:12,color:r.us?C.white:C.textMid}}>{r.us?"🦅 ":""}{r.team}</div>
                <div className="condensed" style={{color:C.success,fontWeight:800,fontSize:13,textAlign:"center"}}>{r.w}</div>
                <div className="condensed" style={{color:C.live,fontWeight:800,fontSize:13,textAlign:"center"}}>{r.l}</div>
                <div style={{color:C.textMuted,fontSize:12,textAlign:"center"}}>.{r.w+r.l>0?Math.round(r.w/(r.w+r.l)*1000):"000"}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{color:C.textMuted,fontSize:10,textAlign:"center",marginTop:6}}>Boys Basketball · South Yosemite League · via MaxPreps</div>
      </FadeUp>
    </div>
  );
}

/* ── SPORTS ───────────────────────────────────────────────────────────────── */
function Sports() {
  const [sel, setSel] = useState(null);
  const [filter, setFilter] = useState("All");
  const seasons = ["All","Fall","Winter","Spring"];

  const recordsAPI = useAPI(API.records, SEED_RECORDS);
  const records = recordsAPI.data || {};

  const [rosterData, setRosterData] = useState(null);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterSource, setRosterSource] = useState(null);

  useEffect(() => {
    if (!sel) return;
    const sport = SPORTS_META.find(s => s.id === sel);
    if (!sport) return;
    setRosterLoading(true);
    setRosterData(null);
    fetch(API.roster(sport.mpKey), {signal:AbortSignal.timeout(8000)})
      .then(r => r.json())
      .then(j => {
        setRosterData(j.data?.length ? j.data : (SEED_ROSTERS[sport.mpKey] || []));
        setRosterSource(j.data?.length ? "api" : "seed");
      })
      .catch(() => {
        setRosterData(SEED_ROSTERS[sel] || SEED_ROSTERS[sel?.replace("_boys","").replace("_girls","")] || []);
        setRosterSource("seed");
      })
      .finally(() => setRosterLoading(false));
  }, [sel]);

  if (sel) {
    const sport = SPORTS_META.find(s => s.id === sel);
    const rec = records[sport?.name] || {};
    return (
      <FadeUp>
        <button onClick={() => setSel(null)} className="glass" style={{border:"none",borderRadius:10,padding:"7px 14px",color:C.blueLight,fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:16,display:"flex",alignItems:"center",gap:5}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg> All Sports
        </button>

        <div style={{background:"linear-gradient(145deg,#060610,#091535)",border:`1px solid ${C.borderGlow}`,borderRadius:18,overflow:"hidden",marginBottom:16}}>
          <div style={{height:3,background:"linear-gradient(90deg,#1B4FD8,#5B9BFF)"}}/>
          <div style={{padding:"20px 18px"}}>
            <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:16}}>
              <div style={{fontSize:44}}>{sport.icon}</div>
              <div>
                <div className="condensed" style={{fontWeight:900,fontSize:26,color:C.white,letterSpacing:.3}}>{sport.name}</div>
                <div style={{color:C.textMid,fontSize:13,marginTop:2}}>{sport.season} Season · BCHS Eagles</div>
              </div>
            </div>
            <div style={{display:"flex",gap:6}}>
              {[
                ["Record", rec.w !== undefined ? `${rec.w}–${rec.l}` : "—", "yellow"],
                ["League","SYL","blue"],
                ["Season",sport.season,"neutral"],
              ].map(([l,v,variant])=>(
                <div key={l} className={variant==="yellow"?"glass glass-yellow":variant==="blue"?"glass glass-blue":"glass"} style={{flex:1,borderRadius:11,padding:"10px 6px",textAlign:"center"}}>
                  <div className="condensed" style={{fontWeight:900,fontSize:17,color:variant==="yellow"?C.yellowHi:C.white}}>{v}</div>
                  <div style={{fontSize:9,color:"rgba(255,255,255,.3)",marginTop:2,fontWeight:700,letterSpacing:.5}}>{l.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <SectionHeader>Roster</SectionHeader>
          {rosterSource && (
            <span style={{fontSize:9,color:rosterSource==="api"?C.success:C.yellowHi,fontWeight:700,letterSpacing:.5}}>
              {rosterSource==="api"?"● MaxPreps Live":"● Seed Data"}
            </span>
          )}
        </div>

        {rosterLoading ? <SkeletonList count={5} h={56}/> : (
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden"}}>
            {rosterData?.length > 0 ? rosterData.map((p,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:i<rosterData.length-1?`1px solid ${C.border}`:"none"}}>
                <div className="glass glass-blue" style={{width:34,height:34,borderRadius:9,color:C.blueLight,fontWeight:900,fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>#{p.num}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:13,color:C.white}}>{p.name}</div>
                  <div style={{color:C.textMuted,fontSize:11,marginTop:1}}>{p.stat||"—"}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <span style={{background:"rgba(27,79,216,.15)",borderRadius:5,padding:"2px 7px",fontSize:11,fontWeight:700,color:C.blueLight}}>{p.pos}</span>
                  <div style={{color:C.textMuted,fontSize:10,marginTop:3}}>{p.yr}</div>
                </div>
              </div>
            )) : (
              <div style={{padding:24,textAlign:"center",color:C.textMuted,fontSize:13}}>
                📋 No roster data available for this sport yet.<br/>
                <a href={`https://www.maxpreps.com/ca/bakersfield/bakersfield-christian-eagles/${sport.mpKey}/roster/`} target="_blank" rel="noopener noreferrer" style={{color:C.blueLight,marginTop:6,display:"inline-block"}}>View on MaxPreps ↗</a>
              </div>
            )}
          </div>
        )}
        <div style={{color:C.textMuted,fontSize:10,textAlign:"center",marginTop:8}}>
          <a href={`https://www.maxpreps.com/ca/bakersfield/bakersfield-christian-eagles/${sport.mpKey}/`} target="_blank" rel="noopener noreferrer" style={{color:C.textMuted}}>View full stats on MaxPreps ↗</a>
        </div>
      </FadeUp>
    );
  }

  // Auto-select featured: postseason sports first, then current-season fallback
  const postseasonEntries = Object.entries(POSTSEASON_SPORTS);
  const featuredMeta = postseasonEntries.length > 0
    ? SPORTS_META.find(s => POSTSEASON_SPORTS[s.name]) || SPORTS_META[1]
    : SPORTS_META[1];
  const featuredPostseason = POSTSEASON_SPORTS[featuredMeta.name] || null;

  // For the grid, filter by season tab but always exclude the featured sport
  const filtered = filter === "All" ? SPORTS_META : SPORTS_META.filter(s => s.season === filter);

  return (
    <div>
      <FadeUp>
        <div className="condensed" style={{fontWeight:900,fontSize:28,color:C.white,letterSpacing:.3,marginBottom:2}}>Sports</div>
        <div style={{color:C.textMuted,fontSize:13,marginBottom:14}}>Tap a sport for roster & stats from MaxPreps</div>
      </FadeUp>

      <FadeUp delay={30}>
        <div style={{display:"flex",gap:6,marginBottom:16}}>
          {seasons.map(s=>(
            <button key={s} onClick={()=>setFilter(s)} style={{padding:"6px 14px",borderRadius:20,border:"none",background:filter===s?"linear-gradient(135deg,#1B4FD8,#2563EB)":"rgba(255,255,255,.05)",color:filter===s?C.white:C.textMuted,fontWeight:700,fontSize:12,cursor:"pointer",flexShrink:0,transition:"all .18s",boxShadow:filter===s?"0 3px 12px rgba(27,79,216,.35)":undefined}}>{s}</button>
          ))}
        </div>
      </FadeUp>

      {/* Featured / Postseason card — auto-promoted whenever a sport is in playoffs or tournament */}
      <FadeUp delay={60}>
        {(() => {
          const rec = records[featuredMeta.name] || {};
          const ps = featuredPostseason;
          const isPostseason = !!ps;
          // Color scheme: urgent postseason = red glow, normal postseason = blue, fallback = blue
          const cardBg = isPostseason && ps.urgent
            ? "linear-gradient(145deg,#0E0408,#1A0610,#2A0818)"
            : "linear-gradient(145deg,#04060E,#07102A,#0C1A48)";
          const borderCol = isPostseason && ps.urgent
            ? "rgba(224,48,48,.35)"
            : "rgba(27,79,216,.3)";
          const barGrad = isPostseason && ps.urgent
            ? "linear-gradient(90deg,#E03030,#FF6B6B,#D4A017)"
            : "linear-gradient(90deg,#1B4FD8,#5B9BFF,#D4A017)";
          const glowShadow = isPostseason && ps.urgent
            ? "0 8px 40px rgba(224,48,48,.2), 0 2px 12px rgba(0,0,0,.6)"
            : "0 8px 32px rgba(0,0,0,.5)";

          // Next postseason game
          const psGames = isPostseason
            ? (SEED_SCHEDULE || []).filter(g => g.sport?.includes("Basketball") && !g.result && g.tag?.includes("State"))
            : [];
          const nextPsGame = psGames[0];

          return (
            <div onClick={()=>setSel(featuredMeta.id)}
              style={{background:cardBg,border:`1px solid ${borderCol}`,borderRadius:20,padding:"20px",marginBottom:10,cursor:"pointer",position:"relative",overflow:"hidden",transition:"all .2s",boxShadow:glowShadow,animation:isPostseason&&ps.urgent?"liveGlow 2.5s ease-in-out infinite":undefined}}
              onMouseEnter={e=>e.currentTarget.style.opacity=".9"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>

              {/* Top color bar */}
              <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:barGrad}}/>

              {/* Dot grid texture */}
              <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)",backgroundSize:"18px 18px",pointerEvents:"none"}}/>

              {/* Postseason banner ribbon */}
              {isPostseason && (
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:ps.urgent?C.live:C.blueLight,display:"inline-block",animation:"lp 1.4s ease-in-out infinite"}}/>
                  <span style={{fontSize:9,fontWeight:800,color:ps.urgent?C.live:C.blueLight,letterSpacing:1.8,textTransform:"uppercase"}}>{ps.label}</span>
                  <span style={{fontSize:9,fontWeight:700,color:C.textMuted,letterSpacing:.5}}>· {ps.sublabel}</span>
                </div>
              )}
              {!isPostseason && (
                <div style={{fontSize:9,fontWeight:700,color:C.blueLight,letterSpacing:1.5,marginBottom:10,textTransform:"uppercase"}}>In Season · Featured</div>
              )}

              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <div style={{fontSize:52,lineHeight:1,position:"relative"}}>
                  {featuredMeta.icon}
                  {isPostseason && (
                    <span style={{position:"absolute",bottom:-6,right:-10,fontSize:16}}>🏆</span>
                  )}
                </div>
                <div style={{flex:1}}>
                  <div className="condensed" style={{fontWeight:900,fontSize:26,color:C.white,marginBottom:6}}>{featuredMeta.name}</div>
                  <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                    {isPostseason && (
                      <span style={{background:ps.urgent?"rgba(224,48,48,.15)":"rgba(27,79,216,.2)",border:`1px solid ${ps.urgent?"rgba(224,48,48,.3)":"rgba(91,155,255,.2)"}`,borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:800,color:ps.urgent?C.live:C.blueLight}}>{ps.round}</span>
                    )}
                    <span style={{background:"rgba(27,79,216,.15)",border:"1px solid rgba(91,155,255,.15)",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700,color:C.blueLight}}>{featuredMeta.season}</span>
                    {!recordsAPI.loading && rec.w !== undefined && (
                      <span className="condensed" style={{fontWeight:900,fontSize:18,color:C.yellowHi}}>{rec.w}–{rec.l}</span>
                    )}
                  </div>
                  {/* Next postseason game preview */}
                  {nextPsGame && (
                    <div style={{marginTop:8,fontSize:11,color:C.textMid,fontWeight:600}}>
                      Next: <span style={{color:C.white,fontWeight:700}}>vs {nextPsGame.opponent}</span> · <span style={{color:C.blueLight}}>{nextPsGame.date}</span>
                      {nextPsGame.time && <span style={{color:C.textMuted}}> · {nextPsGame.time}</span>}
                    </div>
                  )}
                </div>
                <div className="glass glass-blue" style={{width:34,height:34,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:"none"}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </div>
            </div>
          );
        })()}
      </FadeUp>

      {/* If multiple sports are in postseason, show secondary postseason banners */}
      {postseasonEntries.filter(([name]) => name !== featuredMeta.name).map(([name, ps]) => {
        const s = SPORTS_META.find(m => m.name === name);
        if (!s) return null;
        const rec = records[name] || {};
        return (
          <FadeUp key={name} delay={80}>
            <div onClick={()=>setSel(s.id)}
              style={{background:"linear-gradient(145deg,#0E0408,#1A060E,#1E0A14)",border:"1px solid rgba(224,48,48,.25)",borderRadius:16,padding:"14px 16px",marginBottom:8,cursor:"pointer",display:"flex",alignItems:"center",gap:12,transition:"all .2s",boxShadow:"0 4px 20px rgba(224,48,48,.1)"}}
              onMouseEnter={e=>e.currentTarget.style.opacity=".85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
              <div style={{fontSize:28}}>{s.icon}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                  <span style={{width:5,height:5,borderRadius:"50%",background:C.live,display:"inline-block",animation:"lp 1.4s ease-in-out infinite"}}/>
                  <span style={{fontSize:9,fontWeight:800,color:C.live,letterSpacing:1.5}}>{ps.label}</span>
                </div>
                <div style={{fontWeight:700,fontSize:14,color:C.white}}>{name}</div>
                <div style={{fontSize:11,color:C.textMuted,marginTop:1}}>{ps.round} · {rec.w !== undefined ? `${rec.w}–${rec.l}` : "—"}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </FadeUp>
        );
      })}

      {/* Sport grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {filtered.filter(s=>s.id!==featuredMeta.id).map((s,i)=>{
          const ac=SPORT_COLORS[SPORTS_META.indexOf(s)%SPORT_COLORS.length];
          const rec = records[s.name] || {};
          const inPostseason = !!POSTSEASON_SPORTS[s.name];
          return(
            <div key={s.id} onClick={()=>setSel(s.id)}
              style={{background:"#0D0D12",border:`1px solid ${inPostseason?"rgba(224,48,48,.3)":C.border}`,borderRadius:14,overflow:"hidden",cursor:"pointer",transition:"all .18s",position:"relative"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=ac+"55";e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=inPostseason?"rgba(224,48,48,.3)":C.border;e.currentTarget.style.transform="none";}}>
              {/* Left accent strip — red for postseason, colored otherwise */}
              <div style={{position:"absolute",top:0,left:0,bottom:0,width:3,background:inPostseason?C.live:ac}}/>
              {inPostseason && <div style={{position:"absolute",top:6,right:7,fontSize:12}}>🏆</div>}
              <div style={{padding:"14px 12px 14px 16px"}}>
                <div style={{fontSize:26,marginBottom:7}}>{s.icon}</div>
                <div style={{fontWeight:700,fontSize:12,color:C.white,lineHeight:1.3,marginBottom:5}}>{s.name}</div>
                <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
                  {inPostseason
                    ? <span style={{fontSize:9,fontWeight:800,color:C.live,background:"rgba(224,48,48,.1)",borderRadius:4,padding:"1px 6px"}}>{POSTSEASON_SPORTS[s.name].round}</span>
                    : <span style={{fontSize:10,fontWeight:700,color:ac,background:`${ac}18`,borderRadius:4,padding:"1px 7px"}}>{s.season}</span>
                  }
                  {!recordsAPI.loading && rec.w !== undefined && <span className="condensed" style={{fontSize:12,fontWeight:800,color:C.textMid}}>{rec.w}–{rec.l}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── WATCH ────────────────────────────────────────────────────────────────── */
const spiritCats=[
  {label:"Football",   icon:"🏈",pts:2840,max:3000,color:C.blue},
  {label:"Basketball", icon:"🏀",pts:1920,max:2000,color:C.yellowHi},
  {label:"Soccer",     icon:"⚽",pts:1540,max:2000,color:C.success},
  {label:"Softball",   icon:"🥎",pts:980, max:1500,color:"#A78BFA"},
  {label:"Volleyball", icon:"🏐",pts:760, max:1000,color:C.live},
];
const streams=[
  {id:1,sport:"Boys Basketball",icon:"🏀",opp:"San Pedro HS",date:"Tue Mar 3 · 7:00 PM",live:false},
  {id:2,sport:"Girls Basketball",icon:"🏀",opp:"Immanuel HS",date:"Sat Nov 29 · 3:00 PM",live:false},
  {id:3,sport:"Girls Basketball",icon:"🏀",opp:"Valley Christian",date:"Fri Dec 5 · 5:30 PM",live:false},
];

function Watch(){
  const [sel,setSel]=useState(null);
  const [hypeCount,setHypeCount]=useState(0);
  const [confettis,setConfettis]=useState([]);
  const total=spiritCats.reduce((a,c)=>a+c.pts,0);
  const maxTotal=spiritCats.reduce((a,c)=>a+c.max,0);
  const pct=Math.round(total/maxTotal*100);

  const hype=()=>{
    setHypeCount(n=>n+1);
    const c=Array.from({length:14},(_,i)=>({id:Date.now()+i,x:15+Math.random()*70,color:[C.blue,C.yellowHi,C.blueLight,C.yellowNeon][i%4]}));
    setConfettis(c); setTimeout(()=>setConfettis([]),1100);
  };

  if(sel!==null){
    const s=streams[sel];
    return(
      <FadeUp>
        <button onClick={()=>setSel(null)} className="glass" style={{border:"none",borderRadius:10,padding:"7px 14px",color:C.blueLight,fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:16,display:"flex",alignItems:"center",gap:5}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg> Back
        </button>
        <div className="glass" style={{borderRadius:16,padding:28,textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:12}}>{s.icon}</div>
          <div className="condensed" style={{fontWeight:900,fontSize:22,color:C.white,marginBottom:5}}>Broadcast Scheduled</div>
          <div style={{color:C.textMid,fontSize:13,marginBottom:10}}>{s.sport} · Eagles vs {s.opp}</div>
          <span style={{background:"rgba(212,160,23,.15)",border:"1px solid rgba(245,200,66,.2)",borderRadius:20,padding:"4px 14px",fontSize:12,fontWeight:700,color:C.yellowHi}}>{s.date}</span>
          <div style={{marginTop:12,fontSize:12,color:C.textMuted}}>Live streams via <a href="https://www.nfhsnetwork.com" target="_blank" rel="noopener noreferrer" style={{color:C.blueLight}}>NFHS Network</a></div>
        </div>
      </FadeUp>
    );
  }

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <FadeUp>
        <div className="condensed" style={{fontWeight:900,fontSize:28,color:C.white,letterSpacing:.3,marginBottom:2}}>Watch</div>
        <div style={{color:C.textMuted,fontSize:13}}>Stream BCHS games · Powered by NFHS Network</div>
      </FadeUp>

      <FadeUp delay={50}>
        <SectionHeader>Upcoming Broadcasts</SectionHeader>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {streams.map((s,i)=>(
            <div key={i} onClick={()=>setSel(i)} className="glass" style={{borderRadius:14,padding:"13px 14px",display:"flex",gap:12,alignItems:"center",cursor:"pointer",transition:"border-color .18s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=C.blueLight+"55"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.08)"}>
              <div style={{width:38,height:38,borderRadius:9,background:C.surfaceUp,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{s.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:13,color:C.white}}>Eagles vs {s.opp}</div>
                <div style={{color:C.textMuted,fontSize:11,marginTop:1}}>{s.sport}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <span style={{background:"rgba(212,160,23,.12)",borderRadius:5,padding:"2px 8px",fontSize:11,fontWeight:700,color:C.yellowHi}}>{s.date}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{color:C.textMuted,fontSize:11,textAlign:"center",marginTop:8}}>
          Official streams at <a href="https://www.nfhsnetwork.com" target="_blank" rel="noopener noreferrer" style={{color:C.blueLight}}>nfhsnetwork.com ↗</a>
        </div>
      </FadeUp>

      <FadeUp delay={90}>
        <SectionHeader>🔥 School Spirit</SectionHeader>
        <div style={{background:"linear-gradient(145deg,#060400,#100900,#0A0600)",border:"1px solid rgba(212,160,23,.15)",borderRadius:18,padding:"18px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",bottom:-40,right:-40,width:180,height:180,borderRadius:"50%",background:"radial-gradient(circle,rgba(212,160,23,.1) 0%,transparent 70%)",pointerEvents:"none"}}/>
          <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden"}}>
            {confettis.map(cf=><div key={cf.id} style={{position:"absolute",bottom:"25%",left:`${cf.x}%`,width:7,height:7,borderRadius:"50%",background:cf.color,animation:"confetti .8s ease-out forwards"}}/>)}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:16,position:"relative"}}>
            <div style={{position:"relative",flexShrink:0}}>
              <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="6"/>
                <circle cx="36" cy="36" r="28" fill="none" stroke={C.yellowHi} strokeWidth="6"
                  strokeDasharray={2*Math.PI*28} strokeDashoffset={2*Math.PI*28*(1-pct/100)}
                  strokeLinecap="round" transform="rotate(-90 36 36)"
                  style={{filter:"drop-shadow(0 0 6px rgba(212,160,23,.5))",transition:"stroke-dashoffset 1.2s ease"}}/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <div className="condensed" style={{fontWeight:900,fontSize:18,color:C.white}}>{pct}%</div>
              </div>
            </div>
            <div>
              <div className="condensed" style={{fontWeight:900,fontSize:20,color:C.white,marginBottom:2}}>Eagles Are 🔥 Hot!</div>
              <div style={{color:C.textMid,fontSize:12}}>{total.toLocaleString()} / {maxTotal.toLocaleString()} pts</div>
              {hypeCount>0&&<div style={{marginTop:6,background:"rgba(212,160,23,.12)",border:"1px solid rgba(245,200,66,.2)",borderRadius:20,padding:"3px 12px",display:"inline-block"}}>
                <span style={{color:C.yellowHi,fontSize:12,fontWeight:700}}>+{hypeCount} hype{hypeCount>1?"s":""}!</span>
              </div>}
            </div>
          </div>
          {spiritCats.map((cat,i)=>{
            const p=Math.round(cat.pts/cat.max*100);
            return(
              <div key={cat.label} style={{marginBottom:9,position:"relative"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:12,color:C.textMid,fontWeight:600}}>{cat.icon} {cat.label}</span>
                  <span className="condensed" style={{fontSize:13,fontWeight:700,color:C.textMuted}}>{p}%</span>
                </div>
                <div style={{height:5,borderRadius:5,background:"rgba(255,255,255,.05)",overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${p}%`,borderRadius:5,background:`linear-gradient(90deg,${cat.color},${cat.color}99)`,animation:`barGrow .9s ease ${i*50}ms both`,transformOrigin:"left"}}/>
                </div>
              </div>
            );
          })}
          <button onClick={hype} className="glass glass-yellow" style={{width:"100%",marginTop:14,padding:"13px",border:"none",borderRadius:12,color:C.white,fontWeight:800,fontSize:14,cursor:"pointer"}}>
            🦅 Show Your Spirit!{hypeCount>0?` (${hypeCount})`:""}
          </button>
        </div>
      </FadeUp>
    </div>
  );
}

/* ── NEWS ─────────────────────────────────────────────────────────────────── */
function News(){
  const overviewAPI = useAPI(API.overview, {recentNews: SEED_NEWS});
  const articles = overviewAPI.data?.recentNews || SEED_NEWS;

  const [showBracket, setShowBracket] = useState(false);

  // Real bracket based on actual 2025-26 season (Boys Basketball CIF)
  const bracket = {rounds:[
    {name:"Quarterfinals",games:[
      {id:1,top:"🦅 BCHS Eagles",topSeed:1,bot:"TBD",botSeed:8,done:false,winner:null},
      {id:2,top:"TBD",topSeed:4,bot:"TBD",botSeed:5,done:false,winner:null},
    ]},
    {name:"Semifinals",games:[
      {id:3,top:"🦅 BCHS Eagles",topSeed:1,bot:"St. Joseph HS",botSeed:null,topScore:57,botScore:67,done:true,winner:"bot"},
    ]},
  ]};

  return(
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      <FadeUp>
        <div className="condensed" style={{fontWeight:900,fontSize:28,color:C.white,letterSpacing:.3,marginBottom:2}}>Eagle Eye</div>
        <div style={{color:C.textMuted,fontSize:13,marginBottom:6}}>BCHS Athletics News</div>
        <DataBadge source={overviewAPI.source} refetch={overviewAPI.refetch}/>
      </FadeUp>

      {overviewAPI.loading ? <SkeletonList count={4} h={90}/> : (
        articles.map((a,i)=>(
          <FadeUp key={a.id||i} delay={i*40}>
            <div className="glass" style={{borderRadius:16,overflow:"hidden",marginBottom:2,
              borderTop:i===0?`3px solid ${C.yellowHi}`:i%2===0?`2px solid ${C.blue}`:`1px solid rgba(255,255,255,.06)`}}>
              <div style={{padding:i===0?"18px 16px":"14px 16px"}}>
                <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:8}}>
                  <span style={{background:a.tag==="Campus"?"rgba(212,160,23,.15)":"rgba(27,79,216,.15)",borderRadius:5,padding:"2px 8px",fontSize:11,fontWeight:700,color:a.tag==="Campus"?C.yellowHi:C.blueLight}}>{a.tag}</span>
                  <span style={{fontSize:11,color:C.textMuted}}>{a.date}</span>
                </div>
                <div className="condensed" style={{fontWeight:800,fontSize:i===0?20:15,color:C.white,lineHeight:1.25,marginBottom:6}}>{a.title}</div>
                <div style={{color:C.textMid,fontSize:12,lineHeight:1.65}}>{a.summary}</div>
                {a.url && <a href={a.url} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",marginTop:8,color:C.blueLight,fontSize:12,fontWeight:700,textDecoration:"none"}}>Read on MaxPreps ↗</a>}
              </div>
            </div>
          </FadeUp>
        ))
      )}

      <FadeUp delay={80}>
        <button onClick={()=>setShowBracket(v=>!v)} className="glass"
          style={{width:"100%",marginTop:8,borderRadius:13,padding:"13px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",border:"1px solid rgba(255,255,255,.06)",background:"transparent"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span className="condensed" style={{fontWeight:800,fontSize:15,color:C.white}}>🏆 CIF Playoff Bracket</span>
            <span style={{background:"rgba(224,48,48,.12)",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,color:C.live}}>Season Over</span>
          </div>
          <span style={{color:C.textMuted,fontSize:18,transition:"transform .2s",display:"block",transform:showBracket?"rotate(90deg)":"rotate(0deg)"}}>›</span>
        </button>
        {showBracket&&(
          <div style={{marginTop:8,animation:"fadeUp .28s ease both"}}>
            {bracket.rounds.map((round,ri)=>(
              <div key={ri} style={{marginBottom:12}}>
                <div className="condensed" style={{fontWeight:700,fontSize:11,color:C.textMuted,letterSpacing:1.5,marginBottom:8,display:"flex",alignItems:"center",gap:8}}>
                  <div style={{flex:1,height:1,background:C.border}}/><span>{round.name.toUpperCase()}</span><div style={{flex:1,height:1,background:C.border}}/>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {round.games.map(game=>{
                    const topWin=game.done&&game.winner==="top",botWin=game.done&&game.winner==="bot";
                    const isUs = n => n.includes("BCHS") || n.includes("Eagles");
                    return(
                      <div key={game.id} className={isUs(game.top)?"glass glass-blue":"glass"} style={{borderRadius:13,overflow:"hidden"}}>
                        {isUs(game.top)&&<div style={{height:2,background:"linear-gradient(90deg,#1B4FD8,#5B9BFF)"}}/>}
                        {[{name:game.top,score:game.topScore,seed:game.topSeed,win:topWin},{name:game.bot,score:game.botScore,seed:game.botSeed,win:botWin}].map((t,ti)=>(
                          <div key={ti} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 13px",background:t.win?"rgba(34,197,94,.08)":"transparent",borderTop:ti===1?`1px solid ${C.border}`:"none"}}>
                            {t.seed!=null&&<div style={{width:18,height:18,borderRadius:4,background:isUs(t.name)?C.blueFade:"rgba(255,255,255,.05)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:isUs(t.name)?C.blueLight:C.textMuted,flexShrink:0}}>{t.seed}</div>}
                            <div style={{flex:1,fontWeight:t.win?700:isUs(t.name)?600:400,fontSize:12,color:t.win?C.success:isUs(t.name)?C.blueLight:C.textMid}}>{t.name}</div>
                            {game.done&&t.score!=null&&<div className="condensed" style={{fontWeight:900,fontSize:16,color:t.win?C.success:C.textMuted}}>{t.score}</div>}
                            {t.win&&<span style={{fontSize:12,color:C.success}}>✓</span>}
                            {!t.win&&game.done&&isUs(t.name)&&<span style={{fontSize:12,color:C.live}}>✗</span>}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div style={{textAlign:"center",marginTop:8}}>
              <a href="https://www.maxpreps.com/ca/bakersfield/bakersfield-christian-eagles/basketball/" target="_blank" rel="noopener noreferrer" style={{color:C.blueLight,fontSize:12}}>Full bracket on MaxPreps ↗</a>
            </div>
          </div>
        )}
      </FadeUp>
    </div>
  );
}

/* ── ONBOARDING ───────────────────────────────────────────────────────────── */
const ROLES=[
  {id:"student",label:"Student",icon:"🎒",desc:"I go to BCHS",color:C.blue},
  {id:"parent", label:"Parent", icon:"👨‍👩‍👧",desc:"My kid plays for the Eagles",color:"#A78BFA"},
  {id:"alumni",  label:"Alumni", icon:"🦅",desc:"Once an Eagle, always an Eagle",color:C.yellowHi},
  {id:"fan",     label:"Fan",   icon:"📣",desc:"Eagles supporter",color:C.live},
];
const NOTIF_OPTS=[
  {key:"gameStart",icon:"⏰",label:"Game Start Alerts",desc:"15 min before tip-off"},
  {key:"scores",  icon:"🔴",label:"Live Score Updates",desc:"Big plays & score changes"},
  {key:"final",   icon:"🏁",label:"Final Scores",      desc:"Results when games end"},
  {key:"news",    icon:"📰",label:"Eagle Eye News",     desc:"New articles & spotlights"},
  {key:"bracket", icon:"🏆",label:"Playoff Updates",   desc:"Bracket news & results"},
];
function OBParticle({emoji,x,y,delay,dur}){return <div style={{position:"absolute",left:`${x}%`,top:`${y}%`,fontSize:20,opacity:.1,animation:`obFloat ${dur}s ease-in-out ${delay}s infinite`,pointerEvents:"none",userSelect:"none"}}>{emoji}</div>;}

function Onboarding({onDone}){
  const [step,setStep]=useState(0);
  const [dir,setDir]=useState(1);
  const [role,setRole]=useState(null);
  const [favSports,setFavSports]=useState([]);
  const [notifs,setNotifs]=useState({gameStart:true,scores:true,final:true,news:false,bracket:true});
  const [leaving,setLeaving]=useState(false);
  const [btnPress,setBtnPress]=useState(false);
  const TOTAL=4;
  const next=()=>{if(step<TOTAL-1){setDir(1);setStep(s=>s+1);}else{setLeaving(true);setTimeout(onDone,500);}};
  const back=()=>{if(step>0){setDir(-1);setStep(s=>s-1);}};
  const toggleSport=id=>setFavSports(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  const toggleNotif=key=>setNotifs(p=>({...p,[key]:!p[key]}));
  const canNext=[true,!!role,true,true][step];
  const stepLabels=["Welcome","You","Sports","Alerts"];
  const bgEmojis=[[{e:"🦅",x:8,y:15,d:0,dur:4},{e:"🏀",x:82,y:10,d:.8,dur:5},{e:"⚽",x:15,y:70,d:1.2,dur:4.5},{e:"🏈",x:78,y:65,d:.4,dur:3.8}],
    [{e:"🎒",x:10,y:20,d:0,dur:4},{e:"👨‍👩‍👧",x:80,y:15,d:.6,dur:5},{e:"📣",x:8,y:65,d:1,dur:4.3},{e:"🦅",x:85,y:70,d:.3,dur:4.8}],
    [{e:"🏈",x:5,y:12,d:0,dur:4},{e:"🏀",x:88,y:8,d:.5,dur:5},{e:"⚽",x:6,y:55,d:1,dur:4.5},{e:"🏐",x:85,y:50,d:.7,dur:3.9}],
    [{e:"🔔",x:10,y:18,d:0,dur:4},{e:"⏰",x:82,y:12,d:.8,dur:5},{e:"📰",x:8,y:72,d:1.2,dur:4.5},{e:"🏆",x:88,y:68,d:.4,dur:4.2}],
  ][step]||[];

  return(
    <div style={{position:"fixed",inset:0,background:C.bg,zIndex:200,display:"flex",justifyContent:"center",fontFamily:"'DM Sans',system-ui,sans-serif",animation:leaving?"notifOut .45s ease forwards":"obFadeUp .45s ease both",overflow:"hidden"}}>
      <div style={{width:"100%",maxWidth:430,display:"flex",flexDirection:"column",minHeight:"100vh",position:"relative"}}>
        <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
          {bgEmojis.map((e,i)=><OBParticle key={i} emoji={e.e} x={e.x} y={e.y} delay={e.d} dur={e.dur}/>)}
        </div>
        <div style={{padding:"20px 22px 0",position:"relative",zIndex:2}}>
          <div style={{display:"flex",gap:5,marginBottom:14}}>
            {Array.from({length:TOTAL}).map((_,i)=>(
              <div key={i} style={{flex:1,height:4,borderRadius:4,background:C.surfaceHi,overflow:"hidden",position:"relative"}}>
                {i<step&&<div style={{position:"absolute",inset:0,background:`linear-gradient(90deg,${C.blue},${C.blueLight})`,borderRadius:4}}/>}
                {i===step&&<div style={{position:"absolute",inset:0,background:`linear-gradient(90deg,${C.blue},${C.blueLight})`,borderRadius:4,animation:"barGrow .4s cubic-bezier(.4,0,.2,1) both"}}/>}
              </div>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              {stepLabels.map((l,i)=>(
                <div key={l} style={{display:"flex",alignItems:"center",gap:4}}>
                  <div className={i<=step?"glass glass-blue":"glass"} style={{width:18,height:18,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .25s",flexShrink:0,border:"none"}}>
                    {i<step?<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" style={{animation:"obCheck .3s ease both"}}><polyline points="20 6 9 17 4 12"/></svg>
                    :<span style={{fontSize:8,fontWeight:900,color:i===step?C.blueLight:C.textMuted}}>{i+1}</span>}
                  </div>
                  <span style={{fontSize:10,fontWeight:i===step?700:500,color:i===step?C.white:C.textMuted,transition:"color .2s"}}>{l}</span>
                  {i<TOTAL-1&&<span style={{color:C.border,fontSize:10,marginLeft:2}}>›</span>}
                </div>
              ))}
            </div>
            {step>0&&<button onClick={back} className="glass" style={{border:"none",borderRadius:8,color:C.textMid,fontSize:11,fontWeight:700,cursor:"pointer",padding:"4px 10px"}}>← Back</button>}
          </div>
        </div>
        <div key={step} style={{flex:1,padding:"20px 22px 16px",overflowY:"auto",position:"relative",zIndex:2,animation:`${dir>0?"obSlideL":"obSlideR"} .35s cubic-bezier(.4,0,.2,1) both`}}>
          {step===0&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",paddingTop:16}}>
              <div style={{position:"relative",marginBottom:28}}>
                <div style={{position:"absolute",inset:-20,borderRadius:"50%",border:"2px solid rgba(27,79,216,.3)",animation:"obPulse 2s ease-out infinite"}}/>
                <div className="glass glass-blue" style={{width:100,height:100,borderRadius:30,display:"flex",alignItems:"center",justifyContent:"center",fontSize:56,position:"relative",overflow:"hidden",animation:"obPop .7s cubic-bezier(.34,1.56,.64,1) both"}}>🦅</div>
              </div>
              <div style={{animation:"obFadeUp .5s ease .3s both"}}>
                <div style={{fontSize:10,fontWeight:700,color:C.blueLight,letterSpacing:2,marginBottom:6}}>BAKERSFIELD CHRISTIAN HIGH SCHOOL</div>
                <div className="condensed" style={{fontWeight:900,fontSize:38,color:C.white,letterSpacing:-1,lineHeight:1,marginBottom:4}}>WELCOME TO<br/><span style={{color:C.blueLight}}>BCHS EAGLES</span></div>
                <div style={{color:C.textMid,fontSize:14,lineHeight:1.7,maxWidth:300,margin:"12px auto 32px"}}>Your all-in-one app for Eagles athletics — live scores, schedules, rosters, and news.</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8,width:"100%"}}>
                {[["📊","Live data from MaxPreps","blue"],["🔴","Schedules, scores & results","red"],["🦅","12 sports · full rosters","yellow"],["📰","Eagle Eye student news","blue"]].map(([ic,txt,col],i)=>(
                  <div key={txt} className={col==="yellow"?"glass glass-yellow":col==="red"?"glass glass-live":"glass glass-blue"}
                    style={{display:"flex",alignItems:"center",gap:14,borderRadius:14,padding:"12px 16px",textAlign:"left",animation:`obSlideL .4s cubic-bezier(.4,0,.2,1) ${.5+i*.1}s both`}}>
                    <div style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,.05)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{ic}</div>
                    <span style={{fontSize:13,fontWeight:600,color:C.white}}>{txt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {step===1&&(
            <div>
              <div className="condensed" style={{fontWeight:900,fontSize:30,color:C.white,marginBottom:4}}>Who are you?</div>
              <div style={{color:C.textMuted,fontSize:14,marginBottom:24}}>We'll personalise your experience.</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {ROLES.map((r,i)=>{
                  const sel=role===r.id;
                  return(
                    <div key={r.id} onClick={()=>setRole(r.id)}
                      style={{background:sel?`${r.color}12`:"#0D0D12",border:`1.5px solid ${sel?r.color:C.border}`,borderRadius:16,padding:"16px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:16,transform:sel?"scale(1.01)":"scale(1)",transition:"all .22s"}}>
                      <div style={{width:52,height:52,borderRadius:15,background:sel?`${r.color}20`:"#141418",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0,border:`1px solid ${sel?r.color+"44":C.border}`}}>{r.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:16,color:C.white}}>{r.label}</div>
                        <div style={{color:C.textMid,fontSize:13,marginTop:2}}>{r.desc}</div>
                      </div>
                      <div style={{width:24,height:24,borderRadius:"50%",border:`2px solid ${sel?r.color:C.border}`,background:sel?r.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .22s"}}>
                        {sel&&<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {step===2&&(
            <div>
              <div className="condensed" style={{fontWeight:900,fontSize:30,color:C.white,marginBottom:4}}>Your sports</div>
              <div style={{color:C.textMuted,fontSize:14,marginBottom:20}}>Tap your favourites.</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {SPORTS_META.map((s,i)=>{
                  const sel=favSports.includes(s.id);
                  const ac=SPORT_COLORS[i%SPORT_COLORS.length];
                  return(
                    <div key={s.id} onClick={()=>toggleSport(s.id)}
                      style={{background:sel?`${ac}15`:"#0D0D12",border:`1.5px solid ${sel?ac:C.border}`,borderRadius:13,padding:"13px 12px",cursor:"pointer",position:"relative",transform:sel?"scale(1.03)":"scale(1)",transition:"all .22s",display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:22,flexShrink:0}}>{s.icon}</span>
                      <span style={{fontWeight:700,fontSize:12,color:sel?C.white:C.textMid,lineHeight:1.2}}>{s.name}</span>
                      {sel&&<div style={{position:"absolute",top:6,right:7,width:18,height:18,borderRadius:"50%",background:ac,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {step===3&&(
            <div>
              <div className="condensed" style={{fontWeight:900,fontSize:30,color:C.white,marginBottom:4}}>Stay in the loop</div>
              <div style={{color:C.textMuted,fontSize:14,marginBottom:20}}>Pick what you want alerts for.</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {NOTIF_OPTS.map((item,i)=>{
                  const on=notifs[item.key];
                  return(
                    <div key={item.key} onClick={()=>toggleNotif(item.key)}
                      style={{background:on?"rgba(27,79,216,.08)":"#0D0D12",border:`1px solid ${on?C.borderGlow:C.border}`,borderRadius:14,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,transition:"all .2s"}}>
                      <div className={on?"glass glass-blue":"glass"} style={{width:42,height:42,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:21,flexShrink:0,border:"none"}}>{item.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:14,color:C.white}}>{item.label}</div>
                        <div style={{color:C.textMuted,fontSize:12,marginTop:1}}>{item.desc}</div>
                      </div>
                      <div className={on?"glass glass-blue":"glass"} style={{width:46,height:26,borderRadius:13,position:"relative",flexShrink:0,transition:"all .22s",border:"none",boxShadow:on?"0 0 14px rgba(27,79,216,.35)":"none"}}>
                        <div style={{position:"absolute",top:3,left:on?23:3,width:18,height:18,borderRadius:"50%",background:C.white,transition:"left .22s"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div style={{padding:"12px 22px 36px",position:"relative",zIndex:2}}>
          <button onClick={()=>{if(canNext){setBtnPress(true);setTimeout(()=>setBtnPress(false),140);next();}}}
            className={canNext?"glass glass-blue":"glass"}
            style={{width:"100%",padding:"17px",borderRadius:16,color:canNext?C.white:"rgba(255,255,255,.25)",fontWeight:800,fontSize:16,cursor:canNext?"pointer":"default",border:"none",transform:btnPress?"scale(.97)":"scale(1)",boxShadow:canNext?"0 6px 32px rgba(27,79,216,.4)":"none",transition:"transform .12s,opacity .18s",opacity:canNext?1:.35}}>
            {step===TOTAL-1?"Let's Go 🦅":step===0?"Get Started →":"Continue →"}
          </button>
          {step===2&&<button onClick={next} style={{display:"block",width:"100%",marginTop:8,background:"none",border:"none",color:C.textMuted,fontSize:13,cursor:"pointer",padding:"6px 0"}}>Skip for now</button>}
        </div>
      </div>
    </div>
  );
}

/* ── APP SHELL ────────────────────────────────────────────────────────────── */
const MP_BASE = "https://www.maxpreps.com/ca/bakersfield/bakersfield-christian-eagles";

export default function App(){
  const [onboarded, setOnboarded] = useState(false);
  const [tab, setTab]   = useState("home");
  const [toast, setToast] = useState(null);
  const [backendOk, setBackendOk] = useState(null); // null=checking, true=ok, false=down

  // Check backend health on mount
  useEffect(() => {
    fetch(API.health, {signal: AbortSignal.timeout(4000)})
      .then(r => r.json())
      .then(() => setBackendOk(true))
      .catch(() => setBackendOk(false));
  }, []);

  const demoNotifs=[
    {title:"🏀 Game Starting Soon!",body:"Eagles vs San Pedro tips off in 15 minutes — Tue Mar 3 · 7:00 PM"},
    {title:"📊 MaxPreps Data Synced",body:"Schedule and standings updated from MaxPreps"},
    {title:"🦅 Season Update!",body:"Boys Basketball finishes 21–5. CIF quarterfinal loss to St. Joseph 57–67."},
  ];

  if(!onboarded) return(<><style>{STYLES}</style><Onboarding onDone={()=>setOnboarded(true)}/></>);

  return(
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",justifyContent:"center",fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <style>{STYLES}</style>
      {toast&&<Toast key={toast.id} notif={toast} onDismiss={()=>setToast(null)}/>}

      <div style={{width:"100%",maxWidth:430,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
        {/* Header */}
        <div className="glass-dark" style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50,borderBottom:"1px solid rgba(255,255,255,.04)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div className="glass glass-blue" style={{width:36,height:36,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🦅</div>
            <div>
              <div style={{fontSize:8,fontWeight:700,color:C.textMuted,letterSpacing:2}}>BAKERSFIELD CHRISTIAN HS</div>
              <div className="condensed" style={{fontWeight:900,fontSize:18,color:C.white,letterSpacing:.3,lineHeight:1.1}}>BCHS <span style={{color:C.blueLight}}>Eagles</span></div>
            </div>
          </div>
          <div style={{display:"flex",gap:7,alignItems:"center"}}>
            {/* Backend status indicator */}
            {backendOk !== null && (
              <div style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:20,background:backendOk?"rgba(34,197,94,.1)":"rgba(212,160,23,.1)",border:`1px solid ${backendOk?"rgba(34,197,94,.2)":"rgba(212,160,23,.2)"}`}}>
                <span style={{width:5,height:5,borderRadius:"50%",background:backendOk?C.success:C.yellowHi,display:"inline-block",animation:backendOk?"lp 2s ease-in-out infinite":undefined}}/>
                <span style={{fontSize:9,fontWeight:700,color:backendOk?C.success:C.yellowHi}}>
                  {backendOk ? "LIVE" : "OFFLINE"}
                </span>
              </div>
            )}
            <button onClick={()=>setToast({...demoNotifs[Math.floor(Math.random()*3)],id:Date.now()})}
              className="glass" style={{width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,position:"relative",border:"none"}}>
              🔔
              <span style={{position:"absolute",top:-2,right:-2,width:7,height:7,borderRadius:"50%",background:C.yellowHi,border:`2px solid ${C.bg}`}}/>
            </button>
          </div>
        </div>

        {/* Backend offline banner */}
        {backendOk === false && (
          <div style={{background:"rgba(212,160,23,.08)",borderBottom:"1px solid rgba(212,160,23,.2)",padding:"8px 16px",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:14}}>⚡</span>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:700,color:C.yellowHi}}>Backend offline — showing verified seed data</div>
              <div style={{fontSize:10,color:C.textMuted,marginTop:1}}>
                Run <code style={{background:"rgba(255,255,255,.06)",borderRadius:3,padding:"0 4px",color:C.white}}>npm start</code> in the bchs-backend folder to load live MaxPreps data
              </div>
            </div>
          </div>
        )}

        {/* Page */}
        <div key={tab} style={{flex:1,padding:"16px 14px 96px",overflowY:"auto",animation:"fadeUp .3s ease both"}}>
          {tab==="home"   && <Home/>}
          {tab==="sports" && <Sports/>}
          {tab==="watch"  && <Watch/>}
          {tab==="news"   && <News/>}
        </div>

        {/* Bottom nav */}
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,zIndex:100,padding:"8px 12px 20px"}}>
          <div className="glass-dark" style={{borderRadius:22,display:"flex",padding:"6px",border:"1px solid rgba(255,255,255,.06)"}}>
            {TABS.map(t=>{
              const active=tab===t.id;
              return(
                <button key={t.id} onClick={()=>setTab(t.id)}
                  style={{flex:1,background:active?"linear-gradient(135deg,#1B4FD8,#2563EB)":"transparent",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"8px 0",borderRadius:16,boxShadow:active?"0 3px 14px rgba(27,79,216,.5)":undefined,transition:"all .2s",position:"relative"}}>
                  <div style={{color:active?C.white:C.textMuted,transition:"color .2s"}}>
                    {t.icon}
                    {t.dot&&<span style={{position:"absolute",top:4,right:"25%",width:6,height:6,borderRadius:"50%",background:C.live,border:`2px solid ${C.bg}`,animation:"lp 1.5s infinite"}}/>}
                  </div>
                  <div style={{fontSize:10,fontWeight:active?700:500,color:active?C.white:C.textMuted,transition:"color .2s"}}>{t.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
