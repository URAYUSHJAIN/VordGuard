import React, { useState } from 'react'

function CrisisForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    crisisType: 'weather',
    severity: 'HIGH',
    description: 'Unexpected cyclone alert. Monsoon forecast shows 90% rainfall probability. Original location becomes unsafe for outdoor shoots.',
    projectId: 'proj-001',
    crisisId: 'crisis-001',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="crisisType">What crisis hit?</label>
          <p className="form-hint">Select the primary production blocker</p>
          <select 
            id="crisisType"
            name="crisisType" 
            value={formData.crisisType}
            onChange={handleChange}
          >
            <option value="weather">🌧️ Weather Crisis</option>
            <option value="permit">📋 Permit Denied</option>
            <option value="budget">💰 Budget Cut</option>
            <option value="crew">👥 Key Crew Unavailable</option>
            <option value="equipment">🎥 Equipment Failure</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="severity">How urgent?</label>
          <p className="form-hint">Impact level on production</p>
          <select 
            id="severity"
            name="severity" 
            value={formData.severity}
            onChange={handleChange}
          >
            <option value="LOW">Low - Can handle with minor adjustments</option>
            <option value="MEDIUM">Medium - Requires contingency planning</option>
            <option value="HIGH">High - Production at risk, need Plan-B immediately</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Tell us what happened</label>
        <p className="form-hint">Context helps us generate better rescue options. Timeline, locations affected, crew impact?</p>
        <textarea 
          id="description"
          name="description" 
          value={formData.description}
          onChange={handleChange}
          rows="4"
          placeholder="Describe the crisis, timeline, and what you're trying to save..."
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="projectId">Production ID</label>
          <p className="form-hint">Your project reference</p>
          <input 
            id="projectId"
            type="text" 
            name="projectId" 
            value={formData.projectId}
            onChange={handleChange}
            placeholder="proj-001"
          />
        </div>

        <div className="form-group">
          <label htmlFor="crisisId">Crisis ID</label>
          <p className="form-hint">For tracking multiple crises</p>
          <input 
            id="crisisId"
            type="text" 
            name="crisisId" 
            value={formData.crisisId}
            onChange={handleChange}
            placeholder="crisis-001"
          />
        </div>
      </div>

      <button 
        type="submit" 
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? 'Generating Rescue Plans...' : 'Generate Plan-B Options →'}
      </button>

      <p className="form-footer">
        ℹ️ We'll analyze your crisis and generate 3 ranked rescue options ranked by feasibility and speed.
      </p>
    </form>
  )
}

export default CrisisForm
