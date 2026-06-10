/* ============================================================
   REAL ESTATE AUTOPILOT — DATA LAYER
   window.RAI = roster, routing engine, mission scripts, ops data
   ============================================================ */
(function () {
  "use strict";

  // ---------- SVG icon paths (24x24, stroke style — rendered inside .avatar) ----------
  var ICONS = {
    tower:     '<path d="M12 3v3M12 21v-4M8 21h8M12 6a4 4 0 0 1 4 4c0 3-1.5 5-4 7-2.5-2-4-4-4-7a4 4 0 0 1 4-4z"/><path d="M5.6 5.6a9 9 0 0 0-1.9 4.6M18.4 5.6a9 9 0 0 1 1.9 4.6"/>',
    bolt:      '<path d="M13 2 5 13h6l-1 9 9-12h-6l1-8z"/>',
    diamond:   '<path d="M7 3h10l4 6-9 12L3 9l4-6z"/><path d="M3 9h18M12 21 8.5 9l2-6M12 21 15.5 9l-2-6"/>',
    funnel:    '<path d="M3 4h18l-7 8.5V19l-4 2v-8.5L3 4z"/>',
    megaphone: '<path d="M3 11v3a1 1 0 0 0 1 1h2l3 5h2v-5"/><path d="M11 15c5 0 8 2 10 3V6c-2 1-5 3-10 3H6a3 3 0 0 0 0 6h5z"/>',
    sparkle:   '<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z"/><path d="M19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8L19 17z"/>',
    handshake: '<path d="M11 17l-1.5 1.5a2 2 0 0 1-3-3L11 11l2-1 3 1 4.5 4.5a2 2 0 0 1-3 3L16 17"/><path d="M2 9l4-4 5 2 5-2 4 4M8 14l-2 2M14 18l-1.5 1.5"/>',
    clock:     '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
    ledger:    '<path d="M5 3h13a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M8 3v18M12 8h4M12 12h4"/>',
    compass:   '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5 13 13l-4.5 2.5L11 11l4.5-2.5z"/>',
    chart:     '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
    keys:      '<circle cx="8" cy="15" r="4"/><path d="M11 12 20 3M16 7l3 3M13 10l2 2"/>'
  };

  // ---------- Agent roster ----------
  var AGENTS = [
    {
      id: "chief-of-staff", name: "Chief of Staff", codename: "TOWER",
      dept: "Command", hue: 42, icon: ICONS.tower, orchestrator: true,
      role: "Runs the room. Reads your ask, picks the crew, and reports back when it's done.",
      bio: "TOWER is the one you talk to. It breaks your request into missions, hands each piece to the right specialist, watches the clock, and flags anything that needs your judgment. Twice a day it sends a digest of what moved, what closed, and what's stuck.",
      skills: ["Task routing & sequencing", "Twice-daily digest", "Escalation triage", "Cross-agent state reconciliation", "Weekly scorecard"],
      integrations: ["Outlook", "Notion", "Follow Up Boss", "Google Calendar"],
      stats: { deploys: 61, success: 99.4, avgMin: 0.4, spark: [4,6,5,8,7,9,8,11,9,12,10,13,12,14] },
      keywords: ["plan","organize","everything","week","digest","brief","priorit","schedule","help","handle"]
    },
    {
      id: "lead-concierge", name: "Lead Concierge", codename: "FIRSTCALL",
      dept: "Growth", hue: 160, icon: ICONS.bolt,
      role: "Answers every new lead in under a minute and keeps the follow-up drumbeat going for months.",
      bio: "Speed wins leads. FIRSTCALL grabs every new inquiry the second it lands in Follow Up Boss, replies in Devan's voice, applies the right action plan, and never lets a contact go quiet. Cold leads get re-engaged on a 90-day cycle.",
      skills: ["Sub-60-second first response", "Drip & nurture sequences", "Cold-lead reactivation", "Stage progression", "48-hour no-contact flags"],
      integrations: ["Follow Up Boss", "Twilio", "Outlook", "Zapier"],
      stats: { deploys: 47, success: 98.2, avgMin: 0.6, spark: [6,8,7,10,9,8,12,11,13,10,14,12,15,16] },
      keywords: ["lead","zillow","inquiry","buyer","follow up","followup","nurture","cold","reactivate","respond","new contact","sign call"]
    },
    {
      id: "luxury-prospector", name: "Luxury Prospector", codename: "MERIDIAN",
      dept: "Growth", hue: 22, icon: ICONS.diamond,
      role: "Works the $750K+ corridor — expireds, FSBOs, and the sphere that knows where the money moves.",
      bio: "MERIDIAN hunts the high end of the Indy metro: expired listings nobody re-listed, FSBOs tired of doing it alone, and the dinner-party network that refers seven figures at a time. Every outreach is researched and personal — no spray-and-pray.",
      skills: ["Expired-listing mining", "FSBO outreach", "Luxury farm campaigns", "Sphere event planning", "Personalized first-touch drafts"],
      integrations: ["Follow Up Boss", "Outlook", "Notion", "Web research"],
      stats: { deploys: 23, success: 96.1, avgMin: 9.5, spark: [2,3,2,4,3,5,4,4,6,5,7,6,8,7] },
      keywords: ["luxury","expired","fsbo","high end","750","million","carmel","zionsville","meridian","prospect","farm"]
    },
    {
      id: "funnel-manager", name: "Funnel Manager", codename: "FLYWHEEL",
      dept: "Growth", hue: 198, icon: ICONS.funnel,
      role: "Sells your playbook while you sleep — three digital products, one funnel, zero hand-holding.",
      bio: "FLYWHEEL runs the digital side: the $47 PDF, the $97 deal analyzer, the $197 mini-course. Signups get the drip, buyers get the upsell, refunds get a save attempt. Every dollar of passive income gets tracked back to its source.",
      skills: ["Email drip sequences", "Upsell & cross-sell flows", "Refund recovery", "Funnel KPI tracking", "Launch sequences"],
      integrations: ["Stripe", "Mailchimp", "Follow Up Boss", "Zapier"],
      stats: { deploys: 38, success: 97.8, avgMin: 1.2, spark: [5,4,6,7,6,8,9,8,10,11,9,12,13,12] },
      keywords: ["funnel","course","product","pdf","analyzer","drip","signup","upsell","refund","passive","digital"]
    },
    {
      id: "listing-marketer", name: "Listing Marketer", codename: "SPOTLIGHT",
      dept: "Marketing & Clients", hue: 336, icon: ICONS.megaphone,
      role: "Turns a signed listing into a launch: MLS copy, flyers, a 5-post social pack, and the open-house push.",
      bio: "A listing isn't live until SPOTLIGHT says so. It writes the MLS description, builds the Canva flyer set, drafts five social posts, emails the sphere and the neighborhood farm, and scripts the walkthrough video — all in the listing's own voice, not template sludge.",
      skills: ["MLS write-ups", "Canva flyer & social design", "Sphere + farm email blasts", "Open-house promotion", "Video scripts"],
      integrations: ["Canva", "Outlook", "MIBOR", "Mailchimp"],
      stats: { deploys: 31, success: 99.1, avgMin: 6.8, spark: [3,5,4,6,5,7,8,6,9,8,10,9,11,12] },
      keywords: ["listing","launch","mls","flyer","social","post","open house","photos","market the","write up","description"]
    },
    {
      id: "client-experience", name: "Client Experience", codename: "ENCORE",
      dept: "Marketing & Clients", hue: 262, icon: ICONS.sparkle,
      role: "Keeps clients warm from contract to closing gift — then turns them into reviews and referrals.",
      bio: "Deals end. Relationships don't. ENCORE schedules check-ins while the deal runs, asks for the Google review at the exact right moment, remembers every home anniversary, and quietly cultivates the referrals that make year three easier than year one.",
      skills: ["In-deal check-in cadence", "Google review asks", "Home-anniversary touches", "Referral cultivation", "Sphere nurture"],
      integrations: ["Follow Up Boss", "Outlook", "Google Calendar"],
      stats: { deploys: 29, success: 99.6, avgMin: 1.8, spark: [4,4,5,6,5,7,6,8,7,9,8,9,10,11] },
      keywords: ["review","client","anniversary","gift","referral","past client","check in","google review","testimonial","thank"]
    },
    {
      id: "referral-partner", name: "Referral Partner", codename: "HANDSHAKE",
      dept: "Marketing & Clients", hue: 135, icon: ICONS.handshake,
      role: "Tracks every lender, title rep, and attorney who sends business — and makes sure favors flow both ways.",
      bio: "HANDSHAKE keeps the partner roster honest: who referred whom, who's gone quiet for 90 days, who deserves the next favor. Quarterly value-drops go out on schedule so the relationship is warm before you need it.",
      skills: ["Partner roster management", "Quarterly value-drops", "90-day quiet alerts", "Referral attribution", "Intro drafting"],
      integrations: ["Follow Up Boss", "Outlook", "Notion", "Calendly"],
      stats: { deploys: 18, success: 98.9, avgMin: 2.4, spark: [2,3,3,4,3,5,4,5,6,5,7,6,7,8] },
      keywords: ["lender","title","attorney","cpa","inspector","contractor","partner","refer","vendor","intro"]
    },
    {
      id: "transaction-coordinator", name: "Transaction Coordinator", codename: "CLOCKWORK",
      dept: "Operations", hue: 220, icon: ICONS.clock,
      role: "Builds the day-by-day path from contract to close and chases every deadline before it slips.",
      bio: "The moment a deal goes under contract, CLOCKWORK builds the full timeline — inspection, appraisal, financing, title, walkthrough, keys. Every party gets chased, every document gets tracked, and anything at risk gets flagged days before it becomes a problem.",
      skills: ["Contract-to-close timelines", "Deadline tracking & chasing", "Document collection", "Party coordination", "Calendar management"],
      integrations: ["Google Calendar", "Outlook", "Notion", "Follow Up Boss"],
      stats: { deploys: 26, success: 99.8, avgMin: 4.1, spark: [3,4,5,4,6,5,7,6,8,7,8,9,10,9] },
      keywords: ["contract","close","closing","inspection","appraisal","escrow","title","deadline","earnest","under contract","walkthrough"]
    },
    {
      id: "bookkeeper", name: "Bookkeeper", codename: "LEDGER",
      dept: "Operations", hue: 95, icon: ICONS.ledger,
      role: "Watches every commission dollar — GCI to net, expenses tagged, quarterly taxes accrued before they sting.",
      bio: "LEDGER reconciles every closing check against the bank deposit, tags expenses as they land from QuickBooks, accrues the S-Corp quarterly estimates, and keeps the P&L current enough to answer 'where's my money' in one screen. Read-only with the cash — it counts, it never moves.",
      skills: ["GCI-to-net reconciliation", "Expense tagging", "Quarterly tax accrual", "P&L snapshots", "S-Corp salary monitoring"],
      integrations: ["QuickBooks", "Zapier", "Notion", "Follow Up Boss"],
      stats: { deploys: 21, success: 99.7, avgMin: 3.2, spark: [3,3,4,5,4,6,5,6,7,6,8,7,8,9] },
      keywords: ["money","commission","gci","expense","tax","p&l","profit","bank","quickbooks","month end","reconcile","net"]
    },
    {
      id: "market-analyst", name: "Market Analyst", codename: "COMPASS",
      dept: "Intelligence", hue: 185, icon: ICONS.compass,
      role: "Prices with evidence. CMAs, absorption rates, and neighborhood math that holds up at the kitchen table.",
      bio: "COMPASS does the homework other agents skip: comp selection with documented adjustments, absorption and days-on-market by micro-area, and pricing recommendations you can defend to a skeptical seller. Every number cites its source.",
      skills: ["Full CMAs with adjustments", "Pricing strategy", "Neighborhood reports", "Absorption analysis", "Investment math"],
      integrations: ["MIBOR", "Notion", "Outlook", "Web research"],
      stats: { deploys: 33, success: 98.7, avgMin: 7.6, spark: [4,5,6,5,7,6,8,9,7,10,9,11,10,12] },
      keywords: ["cma","comp","price","pricing","value","worth","market report","neighborhood","absorption","appraise","analysis"]
    },
    {
      id: "pipeline-analyst", name: "Pipeline Analyst", codename: "SCOREBOARD",
      dept: "Intelligence", hue: 60, icon: ICONS.chart,
      role: "Counts what matters: speed-to-lead, conversion by stage, dollars at risk, and projected GCI.",
      bio: "SCOREBOARD keeps the dashboard honest. Speed-to-lead by source, conversion at every stage, days-to-close trends, pipeline dollars at risk, projected GCI for the quarter. When another agent needs a number to make a call, this is where it comes from.",
      skills: ["KPI dashboard", "Conversion analysis", "GCI projection", "Pipeline risk scoring", "Weekly scorecard"],
      integrations: ["Follow Up Boss", "Notion", "Google Sheets"],
      stats: { deploys: 24, success: 99.3, avgMin: 2.7, spark: [3,4,4,5,6,5,7,6,8,7,9,8,10,11] },
      keywords: ["kpi","pipeline","conversion","metric","number","dashboard","scorecard","projection","forecast","report","stats"]
    },
    {
      id: "investor-matcher", name: "Investor Matcher", codename: "CAPRATE",
      dept: "Intelligence", hue: 300, icon: ICONS.keys,
      role: "Reads every new MIBOR listing and pings the right investor before the rest of the market wakes up.",
      bio: "CAPRATE holds the tagged investor list — flip, BRRRR, buy-and-hold, rent-ready — with each buyer's box defined. New listings get scored against every box overnight; strong matches go out with the math already done: ARV, rehab range, rent comps, projected return.",
      skills: ["Buy-box matching", "Deal scoring (flip / BRRRR / hold)", "ARV & rent comps", "Investor roster upkeep", "Daily match passes"],
      integrations: ["MIBOR", "Follow Up Boss", "Outlook"],
      stats: { deploys: 42, success: 97.4, avgMin: 1.9, spark: [5,6,7,6,8,7,9,10,8,11,10,12,11,13] },
      keywords: ["investor","flip","brrrr","rental","cash flow","cap rate","arv","buy and hold","turnkey","deal analysis","investment"]
    }
  ];

  // ---------- Mission log scripts (per agent, {addr} token gets filled) ----------
  var SCRIPTS = {
    "chief-of-staff": {
      task: "Triage the request and brief the crew",
      logs: [
        "Parsing request · extracting intent + entities",
        "Checking calendar conflicts and open missions",
        "Crew selected · briefing packets written",
        "Mission timeline locked · watching the clock",
        "Escalation rules armed · anything stuck > 2h pings Devan"
      ],
      artifact: "Mission brief filed to Notion"
    },
    "lead-concierge": {
      task: "First touch + nurture setup",
      logs: [
        "Pulling contact record from Follow Up Boss…",
        "Lead matched · source verified · no prior touches",
        "Drafting first text in Devan's voice…",
        "SMS queued via Twilio · 41s after inquiry",
        "Action plan applied: Buyer Nurture / Week 1",
        "Call task set for 4:30 PM · calendar checked"
      ],
      artifact: "First touch sent · 90-day nurture armed"
    },
    "luxury-prospector": {
      task: "High-end prospect research + outreach draft",
      logs: [
        "Scanning expired + FSBO feeds · $750K floor",
        "3 candidates pulled · cross-checking ownership records",
        "Researching seller context · prior listing history",
        "Drafting personal first-touch letter · no templates",
        "Outreach queued for Devan's sign-off"
      ],
      artifact: "3 researched prospects + draft letters"
    },
    "funnel-manager": {
      task: "Funnel pass: signups, buyers, upsells",
      logs: [
        "Syncing overnight Stripe events…",
        "2 new buyers · $47 PDF · receipts confirmed",
        "Upsell email queued: Deal Analyzer at 20% off",
        "6 drip emails advanced to next step",
        "Funnel KPIs refreshed · conversion holding at 3.8%"
      ],
      artifact: "Funnel advanced · 2 upsells in flight"
    },
    "listing-marketer": {
      task: "Full marketing launch for {addr}",
      logs: [
        "Pulling property facts + photo set for {addr}",
        "MLS description drafted · 2 variants, no clichés",
        "Canva flyer set generated · print + story sizes",
        "5-post social pack written · scheduled across the week",
        "Sphere email blast drafted · 212 recipients",
        "Open-house promo queued for Thursday push"
      ],
      artifact: "Launch kit: MLS copy + flyers + 5 posts + email"
    },
    "client-experience": {
      task: "Client touch + review capture",
      logs: [
        "Scanning closed deals · 1 review window open",
        "Drafting review ask · timed 4 days post-close",
        "2 home anniversaries this week · notes drafted",
        "Check-in scheduled with active buyer · Friday 10 AM",
        "Referral moment flagged: clients mentioned a neighbor selling"
      ],
      artifact: "Review ask sent · 2 anniversary touches queued"
    },
    "referral-partner": {
      task: "Partner roster pass",
      logs: [
        "Auditing roster · last-touch dates checked",
        "2 partners quiet 90+ days · flagged for value-drop",
        "Lender referral logged · attribution updated",
        "Quarterly value-drop drafted: Q3 market one-pager",
        "Coffee slot proposed via Calendly · awaiting reply"
      ],
      artifact: "Roster updated · 2 value-drops queued"
    },
    "transaction-coordinator": {
      task: "Contract-to-close timeline for {addr}",
      logs: [
        "Parsing executed contract for {addr}…",
        "Key dates extracted · inspection in 6 days",
        "27-step timeline built · calendar events created",
        "Title + lender intro emails sent",
        "Earnest money receipt requested from listing side",
        "Risk scan clean · next checkpoint: inspection report"
      ],
      artifact: "Full close timeline · 11 calendar events"
    },
    "bookkeeper": {
      task: "Books pass: reconcile + accrue",
      logs: [
        "Syncing QuickBooks feed · 14 new transactions",
        "Expenses tagged · 2 flagged for review",
        "Commission deposit matched to closing statement",
        "GCI-to-net updated · quarterly tax accrual posted",
        "P&L snapshot refreshed in Notion"
      ],
      artifact: "Books current · P&L snapshot ready"
    },
    "market-analyst": {
      task: "CMA + pricing strategy for {addr}",
      logs: [
        "Pulling comps within 0.6 mi · 12-month window",
        "8 comps selected · 3 pending verified by status check",
        "Adjustments documented: lot, condition, finished basement",
        "Absorption rate: 1.8 months · seller's market holds",
        "Pricing band computed · narrative drafted for the table",
        "Report assembled with sources cited"
      ],
      artifact: "CMA report + defensible price band"
    },
    "pipeline-analyst": {
      task: "Pipeline + KPI refresh",
      logs: [
        "Pulling stage data from Follow Up Boss…",
        "Speed-to-lead this week: 38s median",
        "Conversion by stage recomputed · 2 stalls detected",
        "$184K GCI in flight · risk-weighted to $121K",
        "Scorecard refreshed · stalls flagged to TOWER"
      ],
      artifact: "Live scorecard + 2 stall alerts"
    },
    "investor-matcher": {
      task: "Match pass against investor buy-boxes",
      logs: [
        "Scoring overnight MIBOR adds · 47 new listings",
        "3 hit defined buy-boxes · running the math",
        "ARV + rehab range computed · rent comps pulled",
        "Best fit: 8.1% cap · matches 2 buy-and-hold buyers",
        "Match alerts drafted with full deal math attached"
      ],
      artifact: "3 scored deals · 2 investor alerts ready"
    }
  };

  // ---------- Canned demo missions (suggestion chips) ----------
  var CANNED = [
    {
      chip: "New Zillow lead just hit — handle it",
      title: "New lead response",
      agents: ["lead-concierge", "pipeline-analyst"],
      brief: "Copy. Speed wins this one — FIRSTCALL takes the lead now, SCOREBOARD logs the source and starts the clock. Telemetry's live below."
    },
    {
      chip: "Launch the new listing at 4521 Maple Ave",
      title: "Listing launch — 4521 Maple Ave",
      addr: "4521 Maple Ave",
      agents: ["market-analyst", "listing-marketer", "investor-matcher"],
      brief: "On it. COMPASS prices it first so the marketing leads with evidence, SPOTLIGHT builds the full launch kit, and CAPRATE checks it against the investor list before it goes wide."
    },
    {
      chip: "We're under contract on Fletcher Place — run the close",
      title: "Contract to close — Fletcher Place",
      addr: "the Fletcher Place property",
      agents: ["transaction-coordinator", "client-experience", "bookkeeper"],
      brief: "Locked in. CLOCKWORK owns the timeline from signature to keys, ENCORE keeps the clients calm and warm, LEDGER preps the commission math so closing day has zero surprises."
    },
    {
      chip: "Month-end: where's my money and my pipeline?",
      title: "Month-end review",
      agents: ["bookkeeper", "pipeline-analyst", "funnel-manager"],
      brief: "Pulling it together. LEDGER closes the books, SCOREBOARD reads the pipeline, FLYWHEEL reports the product income. One picture, three angles."
    }
  ];

  // ---------- Routing engine ----------
  function escapeReg(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  function extractAddr(text) {
    var m = text.match(/\d{2,5}\s+[A-Za-z][A-Za-z0-9 .'-]{2,28}?\s(?:St|Street|Ave|Avenue|Dr|Drive|Ln|Lane|Rd|Road|Blvd|Ct|Court|Way|Cir|Circle|Pl|Place|Trail|Pkwy)\b/i);
    return m ? m[0] : null;
  }

  function buildSteps(agentIds, addr) {
    return agentIds.map(function (id, i) {
      var s = SCRIPTS[id];
      var fill = function (str) { return str.replace(/\{addr\}/g, addr || "the property"); };
      return {
        agentId: id,
        task: fill(s.task),
        logs: s.logs.map(fill),
        artifact: fill(s.artifact),
        eta: 6 + Math.round(Math.random() * 5) + i * 2,   // seconds, staggered
        delay: i * 1400                                    // ms before start
      };
    });
  }

  function routeTask(text) {
    var lower = text.toLowerCase().trim();
    var addr = extractAddr(text);

    // canned chip match
    for (var c = 0; c < CANNED.length; c++) {
      if (lower === CANNED[c].chip.toLowerCase()) {
        return {
          title: CANNED[c].title,
          brief: CANNED[c].brief,
          steps: buildSteps(CANNED[c].agents, CANNED[c].addr || addr)
        };
      }
    }

    // keyword scoring
    var scored = AGENTS.filter(function (a) { return !a.orchestrator; }).map(function (a) {
      var score = 0;
      a.keywords.forEach(function (k) {
        if (lower.indexOf(k) !== -1) score += k.length > 4 ? 2 : 1;
      });
      return { a: a, score: score };
    }).filter(function (x) { return x.score > 0; })
      .sort(function (x, y) { return y.score - x.score; })
      .slice(0, 3);

    var picked, brief;
    if (scored.length === 0) {
      picked = ["chief-of-staff", "pipeline-analyst"];
      brief = "No clean match on a specialist, so I'm holding this one at the Tower. I'll break it down myself and pull SCOREBOARD for the numbers. If it needs a different crew, it'll get one.";
    } else {
      picked = scored.map(function (x) { return x.a.id; });
      var names = scored.map(function (x) { return x.a.codename; });
      var lines = [
        "Copy. This one's for " + names.join(" + ") + ". Splitting the work now — watch the board.",
        "Got it. Routing to " + names.join(" + ") + ". Each gets a piece, nobody waits on anybody.",
        "On it. " + names.join(" + ") + " are the right hands for this. Live telemetry below."
      ];
      brief = lines[Math.floor(Math.random() * lines.length)];
    }

    var title = text.length > 52 ? text.slice(0, 52).trim() + "…" : text;
    return { title: title, brief: brief, steps: buildSteps(picked, addr) };
  }

  // ---------- Live-ops data ----------
  var FEED = [
    { agentId: "lead-concierge", text: "First text out to a new Zillow buyer lead · 39s response" },
    { agentId: "lead-concierge", text: "Re-engaged a 4-month-old lead · reply received" },
    { agentId: "lead-concierge", text: "Applied action plan: Seller Nurture / Week 2" },
    { agentId: "listing-marketer", text: "Story-size flyer exported from Canva" },
    { agentId: "listing-marketer", text: "Thursday open-house post scheduled" },
    { agentId: "listing-marketer", text: "MLS copy revised — seller asked for the patio mentioned" },
    { agentId: "transaction-coordinator", text: "Appraisal ordered — lender confirmed" },
    { agentId: "transaction-coordinator", text: "Inspection response countered · deadline tomorrow 5 PM" },
    { agentId: "transaction-coordinator", text: "Clear-to-close received on Bates-Hendricks deal" },
    { agentId: "market-analyst", text: "CMA finished: Broad Ripple bungalow · band $312–328K" },
    { agentId: "market-analyst", text: "Absorption update: Fishers at 1.6 months" },
    { agentId: "investor-matcher", text: "New match: 8.4% cap duplex → 2 buy-and-hold buyers" },
    { agentId: "investor-matcher", text: "47 overnight listings scored against buy-boxes" },
    { agentId: "client-experience", text: "Google review landed: 5 stars from the Hendersons" },
    { agentId: "client-experience", text: "Home-anniversary note queued for the Walkers" },
    { agentId: "bookkeeper", text: "Commission deposit matched · GCI-to-net updated" },
    { agentId: "bookkeeper", text: "Q3 estimated tax accrual posted" },
    { agentId: "pipeline-analyst", text: "Speed-to-lead holding at 38s median this week" },
    { agentId: "pipeline-analyst", text: "Stall flagged: buyer lead silent 6 days at Showing stage" },
    { agentId: "funnel-manager", text: "Deal Analyzer purchase · upsell email queued" },
    { agentId: "funnel-manager", text: "14 new email signups from the IG funnel" },
    { agentId: "luxury-prospector", text: "Expired pull: 3 candidates over $900K researched" },
    { agentId: "referral-partner", text: "Lender value-drop sent · Q3 market one-pager" },
    { agentId: "chief-of-staff", text: "Evening digest compiled · 14 actions, 2 need Devan" }
  ];

  var DEALS = [
    { addr: "4521 Maple Ave", client: "The Romeros", stage: "Inspection", pct: 35, days: 24, price: "$415K", hue: 220 },
    { addr: "118 Fletcher Place", client: "K. Whitfield", stage: "Appraisal", pct: 55, days: 18, price: "$362K", hue: 185 },
    { addr: "7204 N Pennsylvania", client: "The Okafors", stage: "Clear to Close", pct: 88, days: 6, price: "$789K", hue: 42 },
    { addr: "933 Woodruff Pl", client: "D. & M. Chen", stage: "Financing", pct: 62, days: 15, price: "$528K", hue: 336 },
    { addr: "2410 Central Ave", client: "T. Vasquez", stage: "Just Signed", pct: 12, days: 31, price: "$295K", hue: 160 },
    { addr: "5587 Haverford Ave", client: "The Brandts", stage: "Final Walkthrough", pct: 94, days: 2, price: "$447K", hue: 95 }
  ];

  var KPIS = [
    { id: "gci", label: "Pipeline GCI", value: 184, prefix: "$", unit: "K", delta: "+12% vs last month", dir: "up", spark: [110,118,126,122,138,145,141,152,160,158,171,176,180,184] },
    { id: "deals", label: "Deals in flight", value: 6, delta: "+2 this month", dir: "up", spark: [3,3,4,4,3,4,5,4,5,5,6,5,6,6] },
    { id: "leads", label: "Leads this week", value: 23, delta: "+5 vs last week", dir: "up", spark: [12,14,11,16,15,18,14,19,17,21,18,22,20,23] },
    { id: "speed", label: "Median response", value: 38, unit: "s", delta: "-7s vs last week", dir: "up", spark: [62,58,55,57,51,49,52,46,44,45,41,40,39,38] }
  ];

  var LEADFLOW = [12, 14, 11, 16, 15, 18, 14, 19, 17, 21, 18, 22, 20, 23]; // 14 days

  // ---------- Playbooks (slash-command library, grouped by owning agent) ----------
  var PLAYBOOKS = [
    { cmd: "/cma", name: "CMA Builder", agentId: "market-analyst",
      desc: "Comps pulled, adjustments documented, a price band you can defend at the kitchen table.",
      trigger: "Say: price 4521 Maple Ave" },
    { cmd: "/market-read", name: "Indy Market Authority", agentId: "market-analyst",
      desc: "The one number worth talking about this week, framed for buyers, sellers, and investors.",
      trigger: "Runs Monday 7 AM" },
    { cmd: "/qualify", name: "Lead Qualifier", agentId: "lead-concierge",
      desc: "BANT+ scoring the moment a lead replies — segment, score, and the next action set in the CRM.",
      trigger: "Fires on first reply" },
    { cmd: "/nurture", name: "Nurture Assigner", agentId: "lead-concierge",
      desc: "Reads the lead's segment, applies the right action plan, queues the first touch.",
      trigger: "Fires on every new lead" },
    { cmd: "/cannonball", name: "Expired Pipeline", agentId: "luxury-prospector",
      desc: "Ingests the expired list, applies the buy-box, scores motivation, drafts the first touch. Out comes today's call list.",
      trigger: "Drop a MOJO / RedX CSV" },
    { cmd: "/fsbo-sweep", name: "Aged FSBO Finder", agentId: "luxury-prospector",
      desc: "Works 6-month-old expireds and FSBOs — after every other agent gave up calling.",
      trigger: "Say: old expireds" },
    { cmd: "/fix-flip", name: "Flip Underwriter", agentId: "investor-matcher",
      desc: "70% rule, full pro forma, sensitivity table, go / no-go — with every assumption stated.",
      trigger: "Say: underwrite this flip" },
    { cmd: "/rehab-scope", name: "Rehab From Photos", agentId: "investor-matcher",
      desc: "Room-by-room scope of work and an Indy-calibrated repair range, straight from a photo set.",
      trigger: "Drop the photos" },
    { cmd: "/wholesale", name: "Assignment Calculator", agentId: "investor-matcher",
      desc: "Contract price, assignment fee, double-close vs simple — plus the buyer-facing dispo email.",
      trigger: "Say: wholesale this deal" },
    { cmd: "/draw-status", name: "Rehab Draw Tracker", agentId: "bookkeeper",
      desc: "Budget vs actual on a live flip: spend, draws, contingency burn, and the mid-flip margin re-check.",
      trigger: "Say: how's the flip tracking" },
    { cmd: "/finance-review", name: "Weekly P&L", agentId: "bookkeeper",
      desc: "Commissions in, expenses tagged, GCI-to-net, tax accrual freshness — every Monday, one screen.",
      trigger: "Runs Monday 7 AM" },
    { cmd: "/seller-update", name: "Seller Status Email", agentId: "listing-marketer",
      desc: "Bi-weekly Green / Yellow / Red email for every active listing — the best defense against losing one to expiration.",
      trigger: "Runs every 14 days" },
    { cmd: "/open-house", name: "Open House Orchestrator", agentId: "listing-marketer",
      desc: "14-day promo plan, day-of run-of-show, and the 48-hour follow-up to every visitor.",
      trigger: "Say: open house Saturday" },
    { cmd: "/just-sold", name: "Neighbor Sweep", agentId: "listing-marketer",
      desc: "Just Sold postcard, neighbor email, and DM script for the 100 nearest doors.",
      trigger: "Fires on every closing" },
    { cmd: "/showings", name: "Showing Router", agentId: "transaction-coordinator",
      desc: "Eight houses, one buyer, the best driving route — appointments requested, intel packs prepped.",
      trigger: "Say: set up showings" },
    { cmd: "/closing-prep", name: "Closing Day Prep", agentId: "transaction-coordinator",
      desc: "T-48h walkthrough, T-24h confirmations, closing-morning brief. Zero surprises at the table.",
      trigger: "Fires at T-72h" },
    { cmd: "/review-file", name: "Broker File Audit", agentId: "chief-of-staff",
      desc: "Every document checked against the Indiana matrix — CLEAR, CONDITIONS, or NOT CLEAR before commission releases.",
      trigger: "Fires when a deal closes" },
    { cmd: "/sphere", name: "Sphere Maintenance", agentId: "client-experience",
      desc: "Birthdays, close anniversaries, life events — present in past clients' lives before they need a realtor.",
      trigger: "Runs daily 9 AM" },
    { cmd: "/testimonials", name: "Testimonial Collector", agentId: "client-experience",
      desc: "The ask lands 14 days post-close with three prompts. Yes, no, and pending all tracked.",
      trigger: "Fires post-close" },
    { cmd: "/content-batch", name: "Weekly Content Batch", agentId: "funnel-manager",
      desc: "Two YouTube scripts, five posts, and the monthly newsletter — drafted Sunday night, never auto-published.",
      trigger: "Runs Sunday 9 PM" },
    { cmd: "/vendors", name: "Vendor Bench", agentId: "referral-partner",
      desc: "The right lender, inspector, or title rep for the situation — response times and history attached.",
      trigger: "Say: lender for this scenario" },
    { cmd: "/fl-handoff", name: "Florida Handoff", agentId: "referral-partner",
      desc: "Indiana client heading south? Intro email, handoff packet, and the referral tracked end to end.",
      trigger: "Say: handoff to FL" },
    { cmd: "/scorecard", name: "Weekly Scorecard", agentId: "pipeline-analyst",
      desc: "Speed-to-lead, conversion by stage, dollars at risk, projected GCI — graded against last week.",
      trigger: "Runs Friday 4 PM" }
  ];

  // ---------- Public API ----------
  window.RAI = {
    brand: { name: "Real Estate Autopilot", owner: "Devan Lunceford", city: "Indianapolis" },
    agents: AGENTS,
    canned: CANNED,
    feed: FEED,
    deals: DEALS,
    kpis: KPIS,
    leadflow: LEADFLOW,
    playbooks: PLAYBOOKS,
    getAgent: function (id) {
      return AGENTS.find(function (a) { return a.id === id; }) || null;
    },
    color: function (a, l, alpha) {
      // a = agent object or hue; l = lightness override
      var hue = typeof a === "number" ? a : a.hue;
      return "hsl(" + hue + " 72% " + (l || 62) + "%" + (alpha != null ? " / " + alpha : "") + ")";
    },
    routeTask: routeTask,
    extractAddr: extractAddr
  };
})();
