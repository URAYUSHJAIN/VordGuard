import React, { useState } from 'react'
import '../LightTheme.css'

function PlanBComparison({ data, onBack }) {
  const [selectedPlan, setSelectedPlan] = useState(0)

  // Helper to determine traffic light status
  const getTrafficStatus = (value, type = 'score') => {
    // For Readiness/Confidence (Higher is better)
    if (type === 'score') {
      if (value >= 80) return { color: 'green', label: 'OPTIMAL' }
      if (value >= 60) return { color: 'yellow', label: 'VIABLE' }
      return { color: 'red', label: 'RISKY' }
    }
    // For Disruption (Lower is better)
    if (type === 'disruption') {
      const val = (value || '').toLowerCase()
      if (val.includes('low') || val.includes('minimal')) return { color: 'green', label: 'LOW FRICTION' }
      if (val.includes('medium') || val.includes('moderate')) return { color: 'yellow', label: 'MANAGEABLE' }
      return { color: 'red', label: 'HIGH DRIFT' }
    }
    return { color: 'gray', label: 'UNKNOWN' }
  }

  return (
    <div className="plan-comparison-view">
      {/* Embedded Styles for this specific layout */}
      <style>{`
        .plan-comparison-view {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding-bottom: 4rem;
        }

        .comparison-layout {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 2rem;
          align-items: start;
        }

        @media (max-width: 768px) {
          .comparison-layout {
            grid-template-columns: 1fr; /* Stack vertically on mobile */
          }
          .original-plan-column {
            position: relative;
            top: 0;
            z-index: 10;
          }
        }

        /* Original Plan Styling */
        .original-plan-card {
           background: #fff0f0;
           border: 2px solid #ffcccc;
           border-radius: var(--radius-lg);
           padding: 1.5rem;
           position: sticky;
           top: 2rem;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }
        .status-badge.failed { background: #ffebee; color: #c62828; border: 1px solid #ef9a9a; }
        .status-badge.success { background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7; }
        .status-badge.eco { background: #f1f8e9; color: #33691e; border: 1px solid #c5e1a5; display: flex; align-items: center; gap: 0.3rem;}

        /* Plan B Card Styling */
        .plan-b-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
          margin-bottom: 2rem;
          box-shadow: var(--shadow-md);
          cursor: pointer;
        }
        
        .plan-b-card.selected {
          border-color: var(--accent-primary);
          box-shadow: var(--shadow-lg);
          transform: translateY(-2px);
        }

        .card-header-section {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-light);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .rank-number {
          font-size: 4rem;
          font-weight: 900;
          color: var(--bg-tertiary); /* Subtle background number */
          line-height: 0.8;
          position: absolute;
          right: 1.5rem;
          top: 1.5rem;
          z-index: 0;
        }

        .concept-frame-container {
          width: 100%;
          height: 250px;
          background: #333;
          position: relative;
          overflow: hidden;
        }
        .concept-frame-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }
        .plan-b-card:hover .concept-frame-img {
          transform: scale(1.05);
        }
        .viz-label {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.75rem;
          backdrop-filter: blur(4px);
        }

        /* KPI Dashboard Grid */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          padding: 1.5rem;
          background: var(--bg-secondary);
        }
        
        .kpi-gauge {
          text-align: center;
        }
        
        .traffic-light {
          height: 8px;
          width: 100%;
          background: #e0e0e0;
          border-radius: 4px;
          margin: 0.5rem 0;
          position: relative;
          overflow: hidden;
        }
        .light-indicator {
          height: 100%;
          border-radius: 4px;
        }
        .light-indicator.green { background: var(--accent-success); }
        .light-indicator.yellow { background: var(--accent-warning); }
        .light-indicator.red { background: var(--accent-danger); }
        
        .kpi-value { font-weight: 700; font-size: 1.1rem; }
        .kpi-label { font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px;}

        /* Content Body */
        .plan-body {
          padding: 1.5rem;
        }

        .producer-tip {
            background: #e3f2fd;
            padding: 1rem;
            border-radius: var(--radius-md);
            margin-top: 1rem;
            border-left: 4px solid #2196f3;
            font-size: 0.9rem;
        }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
          .kpi-grid { grid-template-columns: 1fr; }
          .rank-number { font-size: 3rem; opacity: 0.5; }
        }
      `}</style>

      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="secondary-btn" onClick={onBack}>← Back to Incident Report</button>
        <h2>Rescue Scenarios Generated</h2>
      </div>

      <div className="comparison-layout">
        
        {/* --- LEFT: ORIGINAL CONTEXT (FAILED) --- */}
        <div className="original-plan-column">
          <div className="original-plan-card">
             <span className="status-badge failed">⚠️ PLAN CRITICAL FAILURE</span>
             <h3 style={{ marginBottom: '1rem' }}>Original Scenario</h3>
             
             <div className="detail-row" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#666' }}>LOCATION</label>
                <div style={{ fontWeight: 600 }}>{data.originalPlanDetails?.location || 'Unknown'}</div>
             </div>
             
             <div className="detail-row" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#666' }}>SCHEDULED</label>
                <div style={{ fontWeight: 600 }}>{data.originalPlanDetails?.scheduledDate || 'TBD'}</div>
             </div>

             <div className="detail-row" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#666' }}>ORIGINAL SCOPE</label>
                <div style={{ fontSize: '0.9rem' }}>{data.originalPlanDetails?.scope}</div>
             </div>

             <hr style={{ margin: '1.5rem 0', borderColor: '#ffcccc' }} />
             
             <div className="risk-readout">
                <h4 style={{ color: '#d32f2f', fontSize: '0.9rem' }}>IMPACT ANALYSIS</h4>
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', fontSize: '0.9rem', color: '#b71c1c' }}>
                    <li>Production halted immediately</li>
                    <li>Sunk costs unrecoverable</li>
                    <li>Insurance trigger likely</li>
                </ul>
             </div>
          </div>
        </div>

        {/* --- RIGHT: PLAN B FEED --- */}
        <div className="scenario-feed-column">
          {(!data.planBOptions || data.planBOptions.length === 0) && (
              <p>No rescue plans generated.</p>
          )}

          {data.planBOptions && data.planBOptions.map((plan, idx) => {
             const readiness = getTrafficStatus(plan.confidenceScore, 'score');
             const disruption = getTrafficStatus(plan.impactMetrics?.disruptionLevel, 'disruption');
             const isSustainable = plan.planType === 'SCOPE_REDUCTION';

             return (
              <div 
                key={idx} 
                className={`plan-b-card ${selectedPlan === idx ? 'selected' : ''}`}
                onClick={() => setSelectedPlan(idx)}
              >
                  {/* Visual Pre-Viz Header */}
                  {plan.visualConceptUrl ? (
                    <div className="concept-frame-container">
                        <img 
                           src={plan.visualConceptUrl} 
                           alt={`Concept for ${plan.planTitle}`} 
                           className="concept-frame-img"
                           onError={(e) => {
                               e.target.onerror = null; 
                               e.target.style.display='none';
                               e.target.parentElement.style.backgroundColor = '#2c3e50';
                               // Add a text fallback if image fails
                           }}
                        />
                        <span className="viz-label">✨ AI VISUAL CONCEPT FRAME</span>
                    </div>
                  ) : (
                    <div className="concept-frame-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <span style={{ color: 'rgba(255,255,255,0.5)' }}>Visualizing...</span>
                    </div>
                  )}

                  <div className="card-header-section" style={{ position: 'relative' }}>
                      <div style={{ zIndex: 1, paddingRight: '4rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                            <span className="status-badge success">OPTION B{plan.rank}</span>
                            {isSustainable && (
                                <span className="status-badge eco">🌿 Green Production</span>
                            )}
                          </div>
                          <h3 style={{ fontSize: '1.25rem' }}>{plan.planTitle}</h3>
                      </div>
                      <span className="rank-number">{plan.rank}</span>
                  </div>

                  <div className="kpi-grid">
                      {/* KPI 1: READINESS */}
                      <div className="kpi-gauge">
                          <div className="traffic-light">
                              <div className={`light-indicator ${readiness.color}`} style={{ width: `${plan.confidenceScore}%` }}></div>
                          </div>
                          <div className={`kpi-value`} style={{ color: readiness.color === 'green' ? 'var(--accent-success)' : readiness.color === 'red' ? 'var(--accent-danger)' : 'var(--accent-warning)' }}>
                             {plan.confidenceScore}%
                          </div>
                          <div className="kpi-label">Readiness</div>
                      </div>

                      {/* KPI 2: DISRUPTION (Logistics Drift) */}
                      <div className="kpi-gauge">
                          <div className="traffic-light">
                             <div className={`light-indicator ${disruption.color}`} style={{ width: '100%' }}></div>
                          </div>
                          <div className="kpi-value">{plan.impactMetrics?.disruptionLevel || 'N/A'}</div>
                          <div className="kpi-label">Logistics Drift</div>
                      </div>

                      {/* KPI 3: BUDGET (Trade-off) */}
                      <div className="kpi-gauge">
                          <div style={{ padding: '0.5rem 0', fontWeight: 'bold' }}>
                            {plan.impactMetrics?.budgetImpact || 'TBD'}
                          </div>
                          <div className="kpi-label">Cost Impact</div>
                      </div>
                  </div>

                  <div className="plan-body">
                      {plan.proposedDetails && (
                        <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#f8f9fa', borderRadius: '4px', fontSize: '0.85rem' }}>
                            <strong>Config: </strong> 
                            {Object.entries(plan.proposedDetails)
                                .map(([k,v]) => `${k}: ${v}`)
                                .join(' • ')
                            }
                        </div>
                      )}
                  
                      <p style={{ marginBottom: '1rem', color: '#444' }}>
                        {plan.planDescription}
                      </p>

                      <div className="producer-tip">
                         <strong>🎬 Artistic Trade-off:</strong> {plan.producerConsideration || "Standard production adjustment required."}
                      </div>

                      <button className="primary-btn" style={{ width: '100%', marginTop: '1.5rem' }}>
                         ACTIVATE PLAN B{plan.rank}
                      </button>
                  </div>
              </div>
             )
          })}
        </div>
      </div>
      
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        backgroundColor: '#fff3e0', 
        borderRadius: '0.5rem',
        borderLeft: '4px solid #ff9800'
      }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#333' }}>
          <strong>⚠️ Disclaimer:</strong> {data.disclaimer}
        </p>
      </div>
    </div>
  )
}

export default PlanBComparison
