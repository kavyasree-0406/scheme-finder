import { useState } from "react"
import axios from "axios"
import "./App.css"

export default function App() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState({
    age: "",
    state: "",
    category: "",
    income: "",
    goal: ""
  })

  const states = ["Tamil Nadu", "Karnataka", "Maharashtra",
                  "Uttar Pradesh", "Kerala", "Other"]
  const categories = ["General", "OBC", "SC", "ST"]
  const incomes = ["Below ₹1L", "₹1L–₹3L", "₹3L–₹8L", "Above ₹8L"]
  const goals = ["Education / Scholarship", "Start a Business",
                 "Farming", "Get a Job", "Housing"]

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
    try {
      const res = await axios.post("http://127.0.0.1:8000/find-schemes", {
        ...profile,
        age: parsedAge
      })
      setResult(res.data.schemes)
      setStep(2)
    } catch (err) {
      console.error("Error submitting profile to find schemes:", err);
      const backendError = err.response?.data?.detail;
      alert(backendError || "Something went wrong. Is your backend running?");
    }
    setLoading(false)
  }

  return (
    <div className="app-container">
      <div className="header-container">
        <h1 className="main-title">🇮🇳 Government Scheme Finder</h1>
        <p className="subtitle">Find schemes you qualify for in 30 seconds</p>
      </div>

      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="age-input">Your Age</label>
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
            <label className="form-label" htmlFor="state-select">Your State</label>
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
            <label className="form-label" htmlFor="category-select">Category</label>
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
            <label className="form-label" htmlFor="income-select">Annual Family Income</label>
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

          <div className="form-group">
            <label className="form-label" htmlFor="goal-select">What do you need help with?</label>
            <select
              id="goal-select"
              value={profile.goal}
              onChange={e => setProfile({...profile, goal: e.target.value})}
              className="form-select"
            >
              <option value="">Select your goal</option>
              {goals.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>

          <button
            id="submit-btn"
            onClick={handleSubmit}
            disabled={loading}
            className="submit-btn"
          >
            {loading ? "Finding schemes..." : "Find My Schemes →"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="results-container">
          <h2 className="results-header">✅ Schemes matched for you</h2>
          <div className="results-content">
            {result}
          </div>
          <button
            id="back-btn"
            onClick={() => { setStep(1); setResult("") }}
            className="back-btn"
            style={{ marginTop: 20 }}
          >
            ← Search Again
          </button>
        </div>
      )}
    </div>
  )
}