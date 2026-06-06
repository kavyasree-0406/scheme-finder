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

      const res = await axios.post(
        "http://127.0.0.1:8000/find-schemes", 
        { ...profile, age: parsedAge },
        { headers }
      )
      
      setResult(res.data.schemes)
    } catch (err) {
      console.error("Error submitting profile to find schemes:", err);
      const backendError = err.response?.data?.detail;
      alert(backendError || "Something went wrong. Is your backend running?");
      setStep(1) // Return to input form on error
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