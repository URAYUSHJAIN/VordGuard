import React, { useState } from 'react'
import CrisisForm from './components/CrisisForm'
import PlanBComparison from './components/PlanBComparison'
import SceneRiskAnalysis from './components/SceneRiskAnalysis'
import SetPlanner from './components/SetPlanner'
import ShotListAI from './components/ShotListAI'
import ProductionDashboard from './components/ProductionDashboard'
import Header from './components/Header'
import './LightTheme.css'

function App() {
  const [view, setView] = useState('dashboard')
  const [planBResults, setPlanBResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGeneratePlanB = async (crisisData) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/generate-plan-b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crisisId: crisisData.crisisId || 'crisis-001',
          projectId: crisisData.projectId || 'proj-001'
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setPlanBResults(result.data)
        setView('results')
      } else {
        setError(result.error || 'Failed to generate rescue plans')
      }
    } catch (err) {
      setError('Cannot reach backend. Is server running on :5000?')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <Header currentView={view} onViewChange={setView} />
      
      <main className="app-main">
        {error && (
          <div className="error-banner">
            <p>⚠️ {error}</p>
          </div>
        )}

        {view === 'dashboard' && (
          <ProductionDashboard onNavigate={setView} />
        )}

        {view === 'crisis' && (
          <div className="crisis-view">
            <h1>Report Production Crisis</h1>
            <p className="view-subtitle">
              Tell us what crisis hit. We'll generate ranked rescue plans.
            </p>
            <CrisisForm 
              onSubmit={handleGeneratePlanB}
              loading={loading}
            />
          </div>
        )}

        {view === 'results' && planBResults && (
          <div className="results-view">
            <h1>Your Rescue Plans</h1>
            <p className="view-subtitle">
              3 ranked options. Choose based on budget, timeline, risk tolerance.
            </p>
            <PlanBComparison 
              data={planBResults}
              onBack={() => setView('crisis')}
            />
          </div>
        )}

        {view === 'scene-risk' && (
          <div className="scene-risk-view">
            <h1>Scene Intelligence</h1>
            <p className="view-subtitle">
              Profile individual scenes for risk factors and production difficulty.
            </p>
            <SceneRiskAnalysis />
          </div>
        )}

        {view === 'set-planner' && (
          <div className="set-planner-view">
            <h1>Film Set Planner</h1>
            <p className="view-subtitle">
              Drag and drop cameras, lights, and crew to plan your set layout. Complexity feeds into Scene Intelligence.
            </p>
            <SetPlanner />
          </div>
        )}

        {view === 'shot-list' && (
          <div className="shot-list-view">
            <h1>AI Shot List Collaborator</h1>
            <p className="view-subtitle">
              Describe your scene and let AI generate professional shot lists. Edit, refine, and export for your crew.
            </p>
            <ShotListAI />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>⚠️ <strong>Important:</strong> VordGuard is a decision-support tool, not professional advice. Producer must validate all recommendations with crew and budget.</p>
        <p className="tagline">• StoryVord plans productions • VordGuard rescues them •</p>
      </footer>
    </div>
  )
}

export default App
