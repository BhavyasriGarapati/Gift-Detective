import React, { useState, useEffect } from "react";
import { 
  Search, 
  Gift, 
  DollarSign, 
  Sparkles, 
  Clock, 
  Plus, 
  Trash2, 
  FileText, 
  ExternalLink, 
  Compass, 
  ChevronRight, 
  Bookmark, 
  BookmarkCheck,
  RotateCcw,
  MessageSquare,
  AlertCircle,
  Hash,
  ShoppingBag,
  CheckCircle2,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { RecipientProfile, GiftItem, SavedCase, APIPredictionResult } from "./types";

// Quick tag suggestions for hobbies
const HOBBIES_SUGGESTIONS = [
  "Gaming", "Espresso Brewing", "Baking", "Hiking", "Photography", 
  "Succulent Gardening", "Mechanical Keyboards", "Sci-Fi Books", 
  "Yoga & Mindfulness", "Cooking", "Stargazing", "Board Games"
];

// Quick suggestions for things liked before
const LIKES_SUGGESTIONS = [
  "Minimalist aesthetics", "Smart home gadgets", "High-grade leather goods",
  "Handmade ceramics", "Dark roast espresso", "Cozy wool blankets"
];

const BUDget_TIERS = [
  { label: "$15 – $30", value: "under $30, focus on great value" },
  { label: "$30 – $75", value: "mid-range, premium quality items between $30 and $75" },
  { label: "$75 – $150", value: "higher-end budget, quality craft items between $75 and $150" },
  { label: "$150+", value: "luxury budget, top-tier items above $150" }
];

export default function App() {
  // Input states
  const [age, setAge] = useState<string>("");
  const [hobbies, setHobbies] = useState<string>("");
  const [budget, setBudget] = useState<string>("");
  const [likes, setLikes] = useState<string>("");

  // Application flow states
  const [searching, setSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<APIPredictionResult | null>(null);
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);
  const [currentClueIdx, setCurrentClueIdx] = useState<number>(0);

  // Active dossier context (for saving)
  const [currentDossierName, setCurrentDossierName] = useState<string>("");
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Loading clue messages
  const clueloop = [
    "Deducing recipient characteristics from age metrics...",
    "Consulting psychological catalog for typical interest pairings...",
    "Launching Google Search Grounding engine to scout active digital stock...",
    "Filtering real products within active pricing corridors...",
    "Correlating past preferences with real-time web listings...",
    "Formulating Sherlockian deductions & verified listing sources..."
  ];

  // Rotate clues during searching
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (searching) {
      setCurrentClueIdx(0);
      interval = setInterval(() => {
        setCurrentClueIdx((prev) => (prev + 1) % clueloop.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [searching]);

  // Load saved cases from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("gift_detective_cases");
      if (stored) {
        setSavedCases(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load saved cases", e);
    }
  }, []);

  // Save/Delete handler
  const handleSaveResult = () => {
    if (!result || isSaved) return;
    const nameToUse = currentDossierName.trim() || `Subject: Age ${age}`;
    const newCase: SavedCase = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      profile: { age, hobbies, budget, likes },
      result: result
    };
    const updated = [newCase, ...savedCases];
    setSavedCases(updated);
    localStorage.setItem("gift_detective_cases", JSON.stringify(updated));
    setIsSaved(true);
  };

  const handleDeleteCase = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedCases.filter((c) => c.id !== id);
    setSavedCases(updated);
    localStorage.setItem("gift_detective_cases", JSON.stringify(updated));
  };

  const handleSelectSavedCase = (saved: SavedCase) => {
    setAge(saved.profile.age);
    setHobbies(saved.profile.hobbies);
    setBudget(saved.profile.budget);
    setLikes(saved.profile.likes);
    setResult(saved.result);
    setError(null);
    setIsSaved(true);
    setCurrentDossierName(`Subject: Age ${saved.profile.age}`);
  };

  // Reset core entries
  const handleReset = () => {
    setAge("");
    setHobbies("");
    setBudget("");
    setLikes("");
    setResult(null);
    setError(null);
    setIsSaved(false);
    setCurrentDossierName("");
  };

  // Run the detection query
  const handleDetectGifts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!age || !hobbies || !budget) {
      setError("Please fill in the Age, Hobbies, and Budget requirements.");
      return;
    }

    setSearching(true);
    setError(null);
    setResult(null);
    setIsSaved(false);

    try {
      const response = await fetch("/api/detect-gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ age, hobbies, budget, likes }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to scout gifts through search grounding.");
      }

      const payload: APIPredictionResult = await response.json();
      setResult(payload);
    } catch (err: any) {
      setError(err?.message || "An unexpected deduction error occurred.");
    } finally {
      setSearching(false);
    }
  };

  // Pre-fill helpers
  const appendHobby = (hobby: string) => {
    if (!hobbies) {
      setHobbies(hobby);
    } else if (!hobbies.toLowerCase().includes(hobby.toLowerCase())) {
      setHobbies((prev) => `${prev}, ${hobby}`);
    }
  };

  const appendLike = (like: string) => {
    if (!likes) {
      setLikes(like);
    } else if (!likes.toLowerCase().includes(like.toLowerCase())) {
      setLikes((prev) => `${prev}, ${like}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-[#F3E7C4] flex flex-col">
      {/* Newspaper Top Header Section */}
      <header className="border-b-2 border-[#1A1A1A] bg-[#FDFCFB] py-8 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-baseline justify-between gap-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold text-gray-500 block mb-2">
              REPUTABLE REAL-TIME DEDUCTION ENGINE
            </span>
            <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tight leading-none mb-2 text-[#1A1A1A]">
              GIFT DETECTIVE
            </h1>
            <p className="text-[10.5px] font-mono tracking-[0.2em] font-bold text-[#B14E24] uppercase">
              ● POWERED BY GEMINI SEARCH GROUNDING
            </p>
          </div>

          <div className="flex flex-col md:items-end gap-1.5 font-mono text-[10px] text-gray-500 tracking-wider">
            <span className="border border-[#1A1A1A] px-3 py-1 bg-[#F5F2EF] font-bold text-[#1A1A1A]">
              INTEL REQUISITION: GLOBAL
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse inline-block" />
              STATUS: REAL-TIME SEARCH ONLINE
            </span>
          </div>
        </div>
      </header>

      {/* Main Container / Two-column Grid */}
      <main className="max-w-7xl mx-auto w-full flex-grow grid grid-cols-1 lg:grid-cols-12 border-b border-[#1A1A1A]">
        
        {/* LEFT PANEL (4 columns): Inputs and Archives with Solid Black Divider */}
        <div className="lg:col-span-4 border-r-0 lg:border-r border-b lg:border-b-0 border-[#1A1A1A] p-6 lg:p-8 flex flex-col gap-10 bg-[#FCFBF9]">
          
          {/* Input Specification Section Styled like a Case Entry Dossier */}
          <section className="flex flex-col">
            <div className="border-b-2 border-[#1A1A1A] pb-3 mb-6">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] font-bold text-gray-400 block mb-1">
                DOSSIER SPECIFICATION
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#1A1A1A] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#B14E24]" />
                Target Subject
              </h2>
            </div>

            <form onSubmit={handleDetectGifts} className="space-y-6">
              {/* Age / Life stage */}
              <div className="border-b border-gray-200 pb-3">
                <label className="text-[10px] font-mono uppercase tracking-[0.2em] font-black text-[#1A1A1A] mb-1.5 block">
                  1. Age & Life Stage
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 32yo urban professional, 10yo gamer"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 placeholder:text-gray-400 leading-snug text-lg font-serif italic text-[#1A1A1A] focus:outline-none"
                />
              </div>

              {/* Hobbies inputs */}
              <div className="border-b border-gray-200 pb-4">
                <label className="text-[10px] font-mono uppercase tracking-[0.2em] font-black text-[#1A1A1A] mb-1.5 block">
                  2. Core Hobbies & Passions
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Specialty coffee, hiking, vinyl records"
                  value={hobbies}
                  onChange={(e) => setHobbies(e.target.value)}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 placeholder:text-gray-400 leading-snug text-base text-[#1A1A1A] focus:outline-none focus:ring-offset-0"
                />
                
                {/* Hobby helper chips */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {HOBBIES_SUGGESTIONS.map((hobby) => (
                    <button
                      key={hobby}
                      type="button"
                      onClick={() => appendHobby(hobby)}
                      className="text-[10px] font-mono uppercase tracking-wider bg-[#F5F2EF] hover:bg-[#E9E4D4] text-[#1A1A1A] border border-gray-300 hover:border-black px-2 py-0.5 rounded-none transition-all cursor-pointer"
                    >
                      + {hobby}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget constraints */}
              <div className="border-b border-gray-200 pb-4">
                <label className="text-[10px] font-mono uppercase tracking-[0.2em] font-black text-[#1A1A1A] mb-1.5 block">
                  3. Financial Scope
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Under $100, flexible around $200"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 placeholder:text-gray-400 leading-snug text-lg text-[#1A1A1A] focus:outline-none"
                />

                {/* Pre-set recommendations */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {BUDget_TIERS.map((tier) => (
                    <button
                      key={tier.label}
                      type="button"
                      onClick={() => setBudget(tier.value)}
                      className={`text-[10px] font-mono text-left p-2 border transition-all ${
                        budget === tier.value
                          ? "bg-[#1A1A1A] border-[#1A1A1A] text-white font-bold"
                          : "bg-white border-gray-300 hover:border-black text-gray-700"
                      }`}
                    >
                      <span className="block text-[8px] uppercase tracking-wider opacity-60">RECOMMENDED</span>
                      {tier.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verified Likes */}
              <div className="border-b border-gray-200 pb-4">
                <label className="text-[10px] font-mono uppercase tracking-[0.2em] font-black text-[#1A1A1A] mb-1.5 block">
                  4. Past Successes / Verifiable Likes
                </label>
                <input
                  type="text"
                  placeholder="e.g., Hario V60 copper, Leica camera accessories"
                  value={likes}
                  onChange={(e) => setLikes(e.target.value)}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 placeholder:text-gray-400 leading-snug text-base text-[#1A1A1A] focus:outline-none"
                />
                
                {/* Likes helper chips */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {LIKES_SUGGESTIONS.map((like) => (
                    <button
                      key={like}
                      type="button"
                      onClick={() => appendLike(like)}
                      className="text-[10px] font-mono uppercase tracking-wider bg-[#F5F2EF] hover:bg-[#E9E4D4] text-[#1A1A1A] border border-gray-300 hover:border-black px-2 py-0.5 rounded-none transition-all cursor-pointer"
                    >
                      + {like}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trigger & resets buttons */}
              <div className="pt-4 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={searching}
                  className="w-full bg-[#1A1A1A] hover:bg-[#333333] disabled:bg-gray-400 text-white font-mono py-4 px-6 text-xs uppercase tracking-[0.3em] font-bold transition-all shadow-none duration-200 cursor-pointer flex items-center justify-center gap-2 border-b-2 border-r-2 border-black active:translate-y-0.5 active:translate-x-0.5"
                >
                  <Search className="w-4 h-4 text-[#B14E24]" />
                  {searching ? "DEDUCING CASE..." : "ANALYZE DOSSIER"}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full bg-transparent border border-gray-300 text-gray-700 hover:text-black hover:border-black font-mono py-2 text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Clear Entry
                </button>
              </div>
            </form>
          </section>

          {/* Saved Cases archived archives section */}
          <section className="mt-auto border-t border-[#1A1A1A] pt-6">
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#1A1A1A] mb-4 flex items-center gap-2">
              <Bookmark className="w-3.5 h-3.5 text-[#B14E24]" />
              Archived Dossiers ({savedCases.length})
            </h3>

            {savedCases.length === 0 ? (
              <div className="border border-dashed border-gray-300 p-4 text-center">
                <p className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">No cases cataloged</p>
                <p className="text-[9px] text-gray-400 font-mono mt-1">
                  Complete searches then choose to record case profiles.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {savedCases.map((saved) => (
                  <div
                    key={saved.id}
                    onClick={() => handleSelectSavedCase(saved)}
                    className="border border-gray-200 hover:border-[#1A1A1A] bg-white hover:bg-[#F5F2EF] p-3 flex justify-between items-center transition-all cursor-pointer"
                  >
                    <div className="overflow-hidden pr-2">
                      <div className="font-serif font-black text-xs text-[#1A1A1A] truncate">
                        Age {saved.profile.age} Case Profile
                      </div>
                      <div className="text-[9px] text-gray-500 font-mono truncate max-w-[200px]">
                        {saved.profile.hobbies}
                      </div>
                      <div className="text-[8px] text-gray-400 font-mono mt-0.5">
                        {saved.timestamp}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteCase(saved.id, e)}
                      className="p-1 px-2 text-gray-400 hover:text-red-700 hover:bg-white rounded transition-colors"
                      title="Purge record"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* RIGHT PANEL (8 columns): Report views & findings */}
        <div className="lg:col-span-8 p-6 lg:p-10 flex flex-col bg-[#FDFCFB]">
          <AnimatePresence mode="wait">
            
            {/* SEARCHING STATE */}
            {searching && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-[#1A1A1A] text-white p-8 flex flex-col justify-between min-h-[500px] border border-black"
              >
                <div className="space-y-8">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-5">
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-[0.250em] text-yellow-500 block mb-1">
                        GROUNDING SCOUT OPERATION STATUS
                      </span>
                      <h3 className="font-mono text-xs uppercase tracking-widest font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                        Scanning Live Inventory Retailers
                      </h3>
                    </div>
                    <span className="font-mono text-[9px] text-gray-400">GD-REPORT-RUNNING</span>
                  </div>

                  <div className="space-y-5">
                    <p className="font-serif italic text-2xl text-gray-300 leading-normal max-w-2xl">
                      "Scouting authentic physical items listed online right now. This guarantees accurate matching, logical reasoning, and instant acquisition targets."
                    </p>

                    <div className="bg-[#141A17] border border-gray-800 p-6 font-mono text-[11px] text-emerald-400 space-y-2 min-h-[180px] flex flex-col justify-center">
                      <div className="text-gray-400 border-b border-gray-850 pb-1.5 mb-2 flex justify-between uppercase text-[9px]">
                        <span>Deduction Terminal Output</span>
                        <span>Grounding Active</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#F3E7C4]">
                        <span>SYSTEM PORTALS: ONLINE & LISTENING</span>
                      </div>
                      {clueloop.slice(0, currentClueIdx + 1).map((clue, idx) => (
                        <motion.div
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={idx}
                          className="flex items-start gap-2 text-yellow-500"
                        >
                          <span className="text-yellow-500/50">&gt;&gt;</span>
                          <span className="text-gray-200">{clue}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-5 flex items-center justify-between text-[10px] font-mono text-gray-500">
                  <span>INTERROGATING REAL WEB SOURCES</span>
                  <span>GEMINI COGNITIVE SCOUT</span>
                </div>
              </motion.div>
            )}

            {/* ERROR STATS */}
            {error && !searching && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-[#FFF5F2] border-2 border-[#1A1A1A] p-8 text-[#1A1A1A] space-y-4"
              >
                <div className="flex items-start gap-3 pb-2 border-b border-[#1A1A1A]">
                  <AlertCircle className="w-6 h-6 text-[#B14E24] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] font-mono tracking-widest uppercase block text-gray-500">DISCREPANCY DETECTED</span>
                    <h4 className="font-serif font-black text-2xl text-[#1A1A1A]">
                      Deduction Aborted
                    </h4>
                  </div>
                </div>
                
                <p className="text-sm font-serif italic text-gray-800 leading-relaxed">
                  "{error}"
                </p>

                <div className="bg-white border border-[#1A1A1A] p-4 font-mono text-xs space-y-2 text-[#1A1A1A]">
                  <p className="font-black uppercase tracking-wider text-[10px]">VERIFICATION STEPS REQUIRED:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Open **Settings &gt; Secrets** to verify your <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">GEMINI_API_KEY</code> is correctly recorded.</li>
                    <li>Verify inputs do not contain empty or problematic alphanumeric constructs.</li>
                  </ul>
                </div>
              </motion.div>
            )}

            {/* REPORT DETAIL RESULTS VIEW */}
            {result && !searching && !error && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                {/* Dossier Summary header banner */}
                <div className="border border-black bg-[#F5F2EF] p-6 lg:p-8 relative overflow-hidden">
                  
                  {result.fallback && (
                    <div className="mb-6 bg-amber-50 border border-amber-300 p-4 flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse mt-1 shrink-0" />
                      <div className="font-mono text-[10px] text-amber-900 uppercase tracking-wider leading-relaxed">
                        <span className="font-black">GROUNDING CONGESTION FALLBACK ACTIVE:</span> Real-time Google Search Grounding is experiencing high-traffic quota constraints. Gift Detective has solved the case using high-quality semantic memory matching for authentic real-world products.
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1A1A] pb-4 mb-6">
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-gray-500 block mb-0.5">
                        CASE FINDINGS & INTELLIGENCE
                      </span>
                      <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                        REPORT SUMMARY NO. {Math.floor(Math.random() * 8000 + 1000)}
                      </h4>
                    </div>

                    {/* Archive Dossier */}
                    <button
                      onClick={handleSaveResult}
                      disabled={isSaved}
                      className={`text-[10px] uppercase tracking-widest font-mono font-bold px-4 py-2 transition-all cursor-pointer ${
                        isSaved
                          ? "bg-transparent border border-[#1A1A1A] text-gray-500"
                          : "bg-[#1A1A1A] text-white hover:bg-gray-800 border border-black"
                      }`}
                    >
                      {isSaved ? "Dossier Filed ✓" : "Archive Case File"}
                    </button>
                  </div>

                  {isSaved && !currentDossierName && (
                    <div className="mb-4 bg-white border border-black p-2 flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Assign folder name (e.g. Secret Santa target)..."
                        value={currentDossierName}
                        onChange={(e) => setCurrentDossierName(e.target.value)}
                        className="flex-1 bg-transparent text-xs outline-none focus:ring-0 font-mono"
                      />
                      <button
                        onClick={handleSaveResult}
                        className="bg-[#1A1A1A] text-white text-[9px] font-mono px-3 py-1 uppercase"
                      >
                        Labels
                      </button>
                    </div>
                  )}

                  <div className="space-y-4">
                    <p className="font-serif italic text-2xl text-[#1A1A1A] leading-relaxed">
                      "{result.data.detectiveSummary}"
                    </p>
                    
                    <div className="flex flex-wrap gap-2 pt-2 text-[10px] font-mono uppercase tracking-wider">
                      <span className="bg-[#1A1A1A]/5 border border-gray-300 px-3 py-1">SUBJECT METRICS: Age {age}</span>
                      <span className="bg-[#1A1A1A]/5 border border-gray-300 px-3 py-1">BUDGET CAPS: {budget}</span>
                      {likes && <span className="bg-[#1A1A1A]/5 border border-gray-300 px-3 py-1 truncate max-w-[250px]">PREFERENTIAL FOCUS: {likes}</span>}
                    </div>
                  </div>
                </div>

                {/* Grid list of Grounded Products */}
                <div className="space-y-6">
                  <div className="border-b-2 border-[#1A1A1A] pb-2">
                    <span className="text-xs font-mono uppercase tracking-[0.2em] font-bold text-gray-500">SECURED REAL MATCHES</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.data.gifts.map((gift, idx) => (
                      <div
                        key={idx}
                        className="border border-[#1A1A1A] bg-white p-6 flex flex-col justify-between hover:shadow-sm transition-all"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <span className="bg-black text-[9px] text-white px-2 py-0.5 font-bold tracking-widest font-mono uppercase">
                              MATCH #{idx + 1}
                            </span>
                            <span className="text-base font-serif font-black underline text-[#1A1A1A]">
                              {gift.price}
                            </span>
                          </div>

                          <h4 className="text-2xl font-serif font-bold mb-1 text-[#1A1A1A] leading-tight">
                            {gift.name}
                          </h4>
                          
                          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-4">
                            ACQUISITION VIA: {gift.whereToBuy || "Online Catalogues"}
                          </p>

                          <div className="bg-[#F5F2EF] p-4 border-l-2 border-[#1A1A1A] mb-4">
                            <span className="text-[9px] font-mono uppercase tracking-widest font-extrabold block mb-1">
                              DETECTIVE INSIGHT
                            </span>
                            <p className="text-[12.5px] leading-relaxed font-serif text-gray-700 italic">
                              "{gift.explanation}"
                            </p>
                          </div>
                        </div>

                        {gift.url && (
                          <div className="pt-2">
                            <a
                              href={gift.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full inline-flex items-center justify-between border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white px-4 py-2 text-[10px] font-mono uppercase tracking-widest transition-all text-[#1A1A1A]"
                            >
                              <span>INSPECT WEBPAGE</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final verdict conclusion */}
                <div className="border-t-2 border-[#1A1A1A] pt-6 space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#1A1A1A] font-bold block">
                    CASE DEDUCTION VERDICT
                  </span>
                  <p className="text-lg text-gray-800 font-serif italic leading-relaxed">
                    "{result.data.caseDeductionDetail}"
                  </p>
                </div>

                {/* Google Search references footer mapping */}
                {result.grounding && (
                  <div className="border border-black bg-[#1A1A1A] text-white p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                      <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-yellow-500 font-bold">
                        GROUNDED SEARCH PATHWAYS LOGGED
                      </span>
                      <span className="text-[8px] font-mono text-gray-500">INDEX: CURRENT LIVE NET</span>
                    </div>

                    {result.grounding.webSearchQueries && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-gray-400 block">
                          AI SCOUT QUERIES:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {result.grounding.webSearchQueries.map((query, idx) => (
                            <span key={idx} className="bg-black text-[#F3E7C4] border border-gray-850 font-mono text-[10px] px-2.5 py-1 tracking-wider">
                              "{query}"
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.grounding.groundingChunks && result.grounding.groundingChunks.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-gray-400 block">
                          VERIFIED CITATIONS AND LANDING PAGES:
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {result.grounding.groundingChunks.map((chunk, idx) => {
                            if (!chunk.web) return null;
                            return (
                              <a
                                key={idx}
                                href={chunk.web.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-black hover:bg-gray-900 border border-gray-800 p-3 flex justify-between items-center transition-all group"
                              >
                                <div className="overflow-hidden mr-2">
                                  <span className="text-[8px] font-mono text-gray-500 block">
                                    SOURCE SOURCE #{idx + 1}
                                  </span>
                                  <p className="text-[11px] font-medium text-gray-200 truncate font-sans group-hover:text-yellow-400 transition-colors">
                                    {chunk.web.title || "Retail Page / Resource Index"}
                                  </p>
                                  <p className="text-[9px] font-mono text-gray-500 truncate">
                                    {chunk.web.uri}
                                  </p>
                                </div>
                                <ExternalLink className="w-3 h-3 text-gray-500 shrink-0 group-hover:text-yellow-400" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            )}

            {/* IDLE / EMPTY STATE */}
            {!searching && !result && !error && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-2 border-dashed border-[#1A1A1A] p-8 min-h-[500px] flex flex-col items-center justify-center text-center bg-white"
              >
                <div className="w-16 h-16 border-2 border-[#1A1A1A] bg-[#F5F2EF] flex items-center justify-center text-[#1A1A1A] mb-6">
                  <Search className="w-6 h-6 text-[#1A1A1A]" />
                </div>

                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-gray-500 mb-1 block">
                  PENDING SUBJECT CASE
                </span>
                <h3 className="font-serif font-black text-3xl text-[#1A1A1A] mb-3">
                  Unsolved Clues Await
                </h3>
                <p className="text-sm font-serif italic text-gray-600 max-w-md leading-relaxed">
                  "Construct the recipient profile on the left specifications panel. Our grounded intelligence scouts the worldwide web live, ensuring suggestions reflect authentic stock and current listings."
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12 max-w-2xl text-left">
                  <div className="border border-black p-4">
                    <span className="text-[9px] font-mono font-bold text-[#1A1A1A] uppercase tracking-widest block mb-1">
                      01. WEB GROUNDED
                    </span>
                    <p className="text-xs text-gray-600 leading-normal font-sans">
                      Scours real digital shops to ensure recommendations are purchasable item sizes.
                    </p>
                  </div>

                  <div className="border border-black p-4">
                    <span className="text-[9px] font-mono font-bold text-[#1A1A1A] uppercase tracking-widest block mb-1">
                      02. STRICT BUDgetS
                    </span>
                    <p className="text-xs text-gray-600 leading-normal font-sans">
                      Enforces budget limits strictly by scanning actual prices.
                    </p>
                  </div>

                  <div className="border border-black p-4">
                    <span className="text-[9px] font-mono font-bold text-[#1A1A1A] uppercase tracking-widest block mb-1">
                      03. SHERLOCKIAN DEDUCTION
                    </span>
                    <p className="text-xs text-gray-600 leading-normal font-sans">
                      Explains in detail how raw hobbies and historical likes translate to logical product choices.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>

      {/* Retro Newspaper Footer */}
      <footer className="border-t-2 border-[#1A1A1A] bg-[#FDFCFB] py-8 px-6 text-center font-mono text-[9px] uppercase tracking-widest text-gray-400 mt-auto">
        <p className="font-bold text-gray-500">© 2026 Gift Detective Agency Corporation. Secured under Gemini Grounding Rules.</p>
        <p className="mt-1 text-gray-400">Powered by Secure Server-Side Google GenAI Protocol Proxy.</p>
      </footer>
    </div>
  );
}
