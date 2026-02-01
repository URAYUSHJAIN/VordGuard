import React, { useState } from 'react'

function PlanBComparison({ data, onBack }) {
  const [selectedPlan, setSelectedPlan] = useState(0)

  const getMetricClass = (level) => {
    const normalized = (level || '').toLowerCase()
    
    if (normalized.includes('low') || normalized.includes('minimal')) return 'low'
    if (normalized.includes('medium') || normalized.includes('moderate')) return 'medium'
    if (normalized.includes('high') || normalized.includes('critical')) return 'high'
    return 'medium'
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#f5f5f0' }}>
        <h2 className="card-title">What You Originally Planned</h2>
        <p className="card-subtitle" style={{ marginBottom: '1rem', color: '#666' }}>
          Your production before the crisis hit
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <p className="card-subtitle">Location</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>
              {data.originalPlanDetails?.location || 'Original Location'}
            </p>
          </div>
          <div>
            <p className="card-subtitle">Scheduled Date</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>
              {data.originalPlanDetails?.scheduledDate || 'TBD'}
            </p>
          </div>
          <div>
            <p className="card-subtitle">Scope</p>
            <p style={{ fontSize: '0.95rem' }}>
              {data.originalPlanDetails?.scope || 'Full production scope'}
            </p>
          </div>
        </div>
      </div>

      <h2 style={{ marginBottom: '1rem', fontSize: '1.3rem', fontWeight: 600 }}>
        💡 Your 3 Rescue Plans (Ranked by Feasibility)
      </h2>
      <p style={{ marginBottom: '1.5rem', color: '#666', fontSize: '0.95rem' }}>
        Plans ranked by likelihood of success. Choose based on your budget, timeline, and risk tolerance.
      </p>

      <div className="plan-options">
        {data.planBOptions && data.planBOptions.map((plan, idx) => (
          <div 
            key={idx}
            className={`plan-card ${selectedPlan === idx ? 'selected' : ''}`}
            onClick={() => setSelectedPlan(idx)}
            style={{ cursor: 'pointer' }}
          >
            <div className="plan-rank">
              Plan B{plan.rank}
            </div>
            
            <h3 className="plan-title">{plan.planTitle}</h3>
            <p className="plan-description">{plan.planDescription}</p>

            <div className="plan-metrics">
              <div className="metric">
                <span className="metric-label">Feasibility</span>
                <span className={`metric-badge ${getMetricClass(plan.viabilityAnalysis?.status)}`}>
                  {plan.confidenceScore || 0}% confident
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">Budget Impact</span>
                <span className="metric-value" style={{ fontSize: '0.9rem' }}>
                  {plan.impactMetrics?.budgetImpact || 'TBD'}
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">Disruption</span>
                <span className={`metric-badge ${getMetricClass(plan.impactMetrics?.disruptionLevel)}`}>
                  {plan.impactMetrics?.disruptionLevel || 'UNKNOWN'}
                </span>
              </div>
            </div>

            {plan.producerConsideration && (
              <p className="plan-guidance">
                <strong>Producer Tip:</strong> {plan.producerConsideration}
              </p>
            )}
          </div>
        ))}
      </div>

      {data.planBOptions && data.planBOptions[selectedPlan] && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3 className="card-title">
            📋 Detailed Look: Plan B{data.planBOptions[selectedPlan].rank}
          </h3>
          
          {data.planBOptions[selectedPlan].proposedDetails && (
            <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
              <p className="card-subtitle">What Changes</p>
              <div style={{ backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '0.5rem' }}>
                {Object.entries(data.planBOptions[selectedPlan].proposedDetails || {}).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ color: '#333' }}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/Id/, 'ID').trim()}:
                    </strong>{' '}
                    <span style={{ color: '#666' }}>
                      {typeof value === 'object' ? JSON.stringify(value) : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1rem' }}>
            {data.planBOptions[selectedPlan].impactMetrics && 
              Object.entries(data.planBOptions[selectedPlan].impactMetrics).map(([key, value]) => (
                <div key={key}>
                  <p className="card-subtitle">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </p>
                </div>
              ))
            }
          </div>

          {data.planBOptions[selectedPlan].riskFactors && data.planBOptions[selectedPlan].riskFactors.length > 0 && (
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '0.5rem' }}>
              <p className="card-subtitle">⚠️ Known Risks</p>
              <ul style={{ margin: '0.5rem 0 0 1.5rem', padding: 0 }}>
                {data.planBOptions[selectedPlan].riskFactors.map((risk, idx) => (
                  <li key={idx} style={{ marginBottom: '0.25rem', color: '#333' }}>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button 
          className="btn btn-primary"
          onClick={() => alert(`Approve Plan B${data.planBOptions[selectedPlan].rank}? (Demo mode - not saved)`)}
        >
          ✓ Proceed with Plan B{data.planBOptions[selectedPlan].rank}
        </button>
        <button className="btn btn-secondary" onClick={onBack}>
          ← Try Different Crisis
        </button>
      </div>

      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        backgroundColor: '#fff3e0', 
        borderRadius: '0.5rem',
        borderLeft: '4px solid #ff9800'
      }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#333' }}>
          <strong>⚠️ Important Disclaimer:</strong> {data.disclaimer}
        </p>
      </div>
    </div>
  )
}

export default PlanBComparison
