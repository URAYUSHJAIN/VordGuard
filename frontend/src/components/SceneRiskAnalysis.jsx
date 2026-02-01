import React, { useState, useEffect } from 'react'

function SceneRiskAnalysis() {
  const [sceneId, setSceneId] = useState('scene-001')
  const [sceneDescription, setSceneDescription] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAnalysis = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/analyze-scene-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneId: sceneDescription ? null : sceneId, // Only send ID if description is empty
          sceneDescription,
          projectId: 'proj-001'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setAnalysis(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to fetch analysis')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Don't auto-fetch on load if we want to encourage user input
    // fetchAnalysis() 
  }, [])

  return (
    <div className="scene-risk-analysis">
      <div className="scene-risk-form card">
        <div className="form-group">
          <label>Scene Description (AI Analysis)</label>
          <textarea
            className="form-control"
            value={sceneDescription}
            onChange={(e) => setSceneDescription(e.target.value)}
            rows="3"
            placeholder="e.g. Exterior night shot on a busy highway in Mumbai during heavy rain. High speed car chase involving 3 vehicles."
          />
        </div>
        <div className="form-group" style={{marginTop: '1rem'}}>
          <label>Or use Mock ID</label>
          <input
            type="text"
            value={sceneId}
            onChange={(e) => setSceneId(e.target.value)}
            placeholder="scene-001"
            disabled={!!sceneDescription}
          />
        </div>
        <button className="btn btn-primary" onClick={fetchAnalysis} disabled={loading}>
          {loading ? 'Analyzing with AI…' : 'Analyze Scene Risk'}
        </button>
        <p className="scene-risk-helper">
          Deterministic risk scores come from the Scene Intelligence engine. AI copy narrates the results for faster producer reviews.
        </p>
      </div>

      {error && (
        <div className="error-banner">
          <p>⚠️ {error}</p>
        </div>
      )}

      {analysis && (
        <>
          <div className="scene-risk-card card">
            <h2 className="card-title scene-risk-title">
              Scene Risk Profile
              <span className={`risk-badge ${analysis.riskLevel.toLowerCase()}`}>
                {analysis.riskLevel}
              </span>
            </h2>

            {analysis.projectContext && (
              <div className="scene-risk-context">
                <div>
                  <p className="card-subtitle">Project</p>
                  <p>{analysis.projectContext.name}</p>
                </div>
                <div>
                  <p className="card-subtitle">Budget</p>
                  <p>₹{analysis.projectContext.budget?.toLocaleString?.('en-IN') || analysis.projectContext.budget}</p>
                </div>
                <div>
                  <p className="card-subtitle">Shoot Window</p>
                  <p>{analysis.projectContext.shootWindow}</p>
                </div>
              </div>
            )}

            <div className="risk-overview-grid">
              <div>
                <p className="card-subtitle">Risk Score</p>
                <p className="risk-score">{analysis.riskScore}%</p>
              </div>
              <div>
                <p className="card-subtitle">Risk Level</p>
                <p className="risk-level-text">{analysis.riskLevel}</p>
              </div>
            </div>

            <div className="risk-summary">
              <h3>Summary</h3>
              <p>{analysis.summary}</p>
            </div>

            <div className="risk-factor-section">
              <h3>Risk Factors</h3>
              <div className="risk-factor-list">
                {analysis.factors.map((factor, idx) => (
                  <div key={idx} className="risk-factor-card">
                    <div className="risk-factor-header">
                      <h4>{factor.name}</h4>
                      <div className="risk-factor-metrics">
                        <span className="risk-factor-score">Score: {factor.score}</span>
                        <span className="risk-factor-weight">Weight: {factor.weight}</span>
                      </div>
                    </div>
                    <p>{factor.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="automated-checks">
              <h3>Automated Checks</h3>
              <div className="automated-check-tags">
                <span className="active-tag">✅ Weather Check</span>
                <span className="active-tag">✅ Permit Database</span>
                <span className="active-tag">✅ Crew Schedule</span>
                <span className="active-tag">✅ Equipment Availability</span>
              </div>
            </div>
          </div>

          {analysis.aiNarrative?.content && (
            <div className="ai-narrative-card card">
              <h3>AI Advisory Narrative</h3>
              <p className="ai-narrative-body">{analysis.aiNarrative.content}</p>
              <p className="ai-narrative-disclaimer">
                ⚠️ {analysis.aiNarrative.disclaimer || 'Generated using Azure OpenAI – Advisory Only'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SceneRiskAnalysis
