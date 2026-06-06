import { useState } from "react"
import axios from "axios"
import "./App.css"

export default function App() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState([])
  const [step, setStep] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [customApiKey, setCustomApiKey] = useState(() => {
    return localStorage.getItem("user_gemini_key") || ""
  })
  
  const [profile, setProfile] = useState({
    age: "",
    state: "",
    category: "",
    income: "",
    goal: ""
  })

  // Save key to localStorage when it changes
  const handleApiKeyChange = (val) => {
    setCustomApiKey(val)
    localStorage.setItem("user_gemini_key", val)
  }

  const states = ["Tamil Nadu", "Karnataka", "Maharashtra",
                  "Uttar Pradesh", "Kerala", "Other"]
  const categories = ["General", "OBC", "SC", "ST"]
  const incomes = ["Below ₹1L", "₹1L–₹3L", "₹3L–₹8L", "Above ₹8L"]
  
  const goals = [
    { name: "Education / Scholarship", icon: "🎓" },
    { name: "Start a Business", icon: "💼" },
    { name: "Farming", icon: "🌾" },
    { name: "Get a Job", icon: "👔" },
    { name: "Housing", icon: "🏠" }
  ]

  const getLocalSchemes = (profile) => {
    const { age, state, category, income, goal } = profile;
    const schemes = [];

    if (goal === "Education / Scholarship") {
      if (["SC", "ST", "OBC"].includes(category) && ["Below ₹1L", "₹1L–₹3L"].includes(income)) {
        schemes.push({
          name: "Post-Matric Scholarship Scheme",
          benefit: "100% tuition fee waiver and monthly maintenance allowance up to ₹1,200.",
          eligibility: "SC/ST/OBC students studying in class 11 or above. Family income must be under ₹2.5 Lakhs.",
          apply_url: "https://scholarships.gov.in"
        });
      }
      schemes.push({
        name: "Central Sector Scheme of Scholarship (CSSS)",
        benefit: "₹12,000 per year for graduation, ₹20,000 per year for post-graduation.",
        eligibility: "Students above the 80th percentile in Class 12 board exams. Family income under ₹4.5 Lakhs.",
        apply_url: "https://scholarships.gov.in"
      });
      schemes.push({
        name: `State Merit Scholarship (${state || 'your state'})`,
        benefit: "Financial assistance of ₹5,000 to ₹10,000 per academic year for higher studies.",
        eligibility: `Permanent resident of ${state || 'your state'}, enrolled in a recognized college with good academic standing.`,
        apply_url: "https://scholarships.gov.in"
      });
    } else if (goal === "Start a Business") {
      schemes.push({
        name: "Pradhan Mantri Mudra Yojana (PMMY)",
        benefit: "Collateral-free business loans up to ₹10 Lakhs (Shishu: up to ₹50k, Kishor: up to ₹5L, Tarun: up to ₹10L).",
        eligibility: "Any Indian citizen starting a non-farm, income-generating small business.",
        apply_url: "https://www.udyamimitra.in"
      });
      if (["SC", "ST"].includes(category) || parseInt(age) >= 18) {
        schemes.push({
          name: "Stand-Up India Scheme",
          benefit: "Bank loans between ₹10 Lakhs and ₹1 Crore for setting up greenfield enterprises.",
          eligibility: "SC/ST or female entrepreneurs above 18 years of age. At least 51% stake must be held by SC/ST/Woman.",
          apply_url: "https://www.standupmitra.in"
        });
      }
      schemes.push({
        name: "PMEGP (Prime Minister's Employment Generation Programme)",
        benefit: "Subsidy up to 35% of the project cost for setting up new manufacturing or service units.",
        eligibility: "Individuals above 18 years of age. Minimum 8th standard pass for projects above ₹10 Lakhs.",
        apply_url: "https://www.kviconline.gov.in"
      });
    } else if (goal === "Farming") {
      schemes.push({
        name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
        benefit: "Direct benefit transfer of ₹6,000 per year paid in three equal installments of ₹2,000.",
        eligibility: "Small and marginal farmer families holding cultivable land in India.",
        apply_url: "https://pmkisan.gov.in"
      });
      schemes.push({
        name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        benefit: "Low-premium crop insurance covering crop damage due to natural disasters, pests, or diseases.",
        eligibility: "All farmers growing notified crops in notified areas, including tenant farmers.",
        apply_url: "https://pmfby.gov.in"
      });
      schemes.push({
        name: "PM Krishi Sinchayee Yojana (Per Drop More Crop)",
        benefit: "Up to 55% subsidy for drip and sprinkler irrigation equipment to optimize water usage.",
        eligibility: "Farmers owning agricultural land with access to water source.",
        apply_url: "https://pmksy.gov.in"
      });
    } else if (goal === "Get a Job") {
      schemes.push({
        name: "Pradhan Mantri Kaushal Vikas Yojana (PMKVY)",
        benefit: "Free skill training, assessment, and certification with job placement assistance.",
        eligibility: "Unemployed youth or school/college dropouts looking for industry-relevant skill training.",
        apply_url: "https://www.pmkvyofficial.org"
      });
      schemes.push({
        name: "MGNREGA (Rural Employment Guarantee)",
        benefit: "Guaranteed 100 days of manual wage employment per financial year.",
        eligibility: "Adult members of rural households willing to do unskilled manual work.",
        apply_url: "https://nrega.nic.in"
      });
      schemes.push({
        name: "Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)",
        benefit: "Free vocational training and assured placement in organized sector jobs.",
        eligibility: "Rural youth aged between 15 and 35 years from poor families.",
        apply_url: "http://ddugky.gov.in"
      });
    } else { // Housing
      schemes.push({
        name: "Pradhan Mantri Awas Yojana - Urban (PMAY-U)",
        benefit: "Interest subsidy up to 6.5% on home loans (CLSS) or direct grant up to ₹1.5 Lakhs.",
        eligibility: "Families belonging to EWS/LIG/MIG categories who do not own a pucca house in India.",
        apply_url: "https://pmaymis.gov.in"
      });
      schemes.push({
        name: "Pradhan Mantri Awas Yojana - Gramin (PMAY-G)",
        benefit: "Financial assistance of ₹1.2 Lakhs in plains and ₹1.3 Lakhs in hilly/difficult areas for house construction.",
        eligibility: "Socio-economically backward households in rural areas without a permanent dwelling.",
        apply_url: "https://pmayg.nic.in"
      });
    }

    return schemes;
  }

  const handleSubmit = async () => {
    // 1. Client-side Validation
    const parsedAge = parseInt(profile.age);
    if (!profile.age || isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 120) {
      alert("Please enter a valid age between 1 and 120.");
      return;
    }
    if (!profile.state) {
      alert("Please select your State.");
      return;
    }
    if (!profile.category) {
      alert("Please select your Category.");
      return;
    }
    if (!profile.income) {
      alert("Please select your Annual Family Income.");
      return;
    }
    if (!profile.goal) {
      alert("Please select what you need help with.");
      return;
    }

    setLoading(true)
    setStep(2) // Move to results step to show skeleton loader immediately

    try {
      const headers = {};
      if (customApiKey) {
        headers["X-Gemini-Key"] = customApiKey;
      }

      const apiBaseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const res = await axios.post(
        `${apiBaseUrl}/find-schemes`, 
        { ...profile, age: parsedAge },
        { headers }
      )
      
      setResult(res.data.schemes)
    } catch (err) {
      console.warn("Backend API offline or error. Running client-side fallback matching:", err);
      const localMatches = getLocalSchemes({ ...profile, age: parsedAge });
      setResult(localMatches);
    }
    setLoading(false)
  }

  return (
    <div className="app-container">
      {/* Settings Panel Toggle */}
      <button 
        className="settings-toggle" 
        onClick={() => setShowSettings(!showSettings)}
        title="Settings"
      >
        ⚙️
      </button>

      <div className="header-container">
        <h1 className="main-title">🇮🇳 Government Scheme Finder</h1>
        <p className="subtitle">Find schemes you qualify for in 30 seconds</p>
      </div>

      {/* API Key Configuration Panel */}
      {showSettings && (
        <div className="settings-panel">
          <h3 className="settings-title">🔑 Custom Gemini API Key (Optional)</h3>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0 0 10px 0" }}>
            Add your key to use your own quota. Otherwise, the app uses its fallback demo matching.
          </p>
          <input
            type="password"
            value={customApiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            placeholder="AIzaSy..."
            className="settings-input"
          />
        </div>
      )}

      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="age-input">👤 Your Age</label>
            <input
              id="age-input"
              type="number"
              value={profile.age}
              onChange={e => setProfile({...profile, age: e.target.value})}
              placeholder="e.g. 21"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="state-select">📍 Your State</label>
            <select
              id="state-select"
              value={profile.state}
              onChange={e => setProfile({...profile, state: e.target.value})}
              className="form-select"
            >
              <option value="">Select state</option>
              {states.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="category-select">🏷️ Category</label>
            <select
              id="category-select"
              value={profile.category}
              onChange={e => setProfile({...profile, category: e.target.value})}
              className="form-select"
            >
              <option value="">Select category</option>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="income-select">💰 Annual Family Income</label>
            <select
              id="income-select"
              value={profile.income}
              onChange={e => setProfile({...profile, income: e.target.value})}
              className="form-select"
            >
              <option value="">Select income range</option>
              {incomes.map(i => <option key={i}>{i}</option>)}
            </select>
          </div>

          {/* Goal selection card grid */}
          <div className="form-group">
            <label className="form-label">🎯 What do you need help with?</label>
            <div className="goals-grid">
              {goals.map(g => (
                <div
                  key={g.name}
                  className={`goal-card ${profile.goal === g.name ? "active" : ""}`}
                  onClick={() => setProfile({...profile, goal: g.name})}
                >
                  <span className="goal-icon">{g.icon}</span>
                  <span className="goal-name">{g.name}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            id="submit-btn"
            onClick={handleSubmit}
            disabled={loading}
            className="submit-btn"
          >
            Find My Schemes →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="results-container">
          <h2 className="results-header">
            {loading ? "🔍 Matching schemes..." : "✅ Schemes matched for you"}
          </h2>
          
          {loading ? (
            <div className="skeleton-container">
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
            </div>
          ) : Array.isArray(result) && result.length > 0 ? (
            <div className="scheme-list">
              {result.map((scheme, index) => (
                <div key={index} className="scheme-card" style={{ animationDelay: `${index * 0.1}s` }}>
                  <h3 className="scheme-title">
                    <span>{scheme.name}</span>
                    <span className="scheme-tag">Qualified</span>
                  </h3>
                  <div className="scheme-benefit">
                    <strong>Benefit:</strong> {scheme.benefit}
                  </div>
                  <p className="scheme-eligibility">
                    <strong>Eligibility criteria:</strong> {scheme.eligibility}
                  </p>
                  <div className="scheme-action">
                    <a 
                      href={scheme.apply_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="apply-link"
                    >
                      Apply Online ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : typeof result === "string" ? (
            <div className="results-content">{result}</div>
          ) : (
            <p style={{ textAlign: "center", color: "var(--text-secondary)" }}>
              No matching schemes found for this profile. Try adjusting your fields!
            </p>
          )}

          {!loading && (
            <button
              id="back-btn"
              onClick={() => { setStep(1); setResult([]) }}
              className="back-btn"
              style={{ marginTop: 10 }}
            >
              ← Search Again
            </button>
          )}
        </div>
      )}
    </div>
  )
}