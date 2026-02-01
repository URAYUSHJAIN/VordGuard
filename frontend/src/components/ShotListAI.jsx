/**
 * ShotListAI Component - AI-Powered Shot List Collaborator
 * 
 * Integrated from FilmMakerAI project
 * 
 * Purpose:
 * - AI-assisted shot list generation and refinement
 * - Detailed shot metadata (camera angles, movements, equipment)
 * - Real-time collaboration support
 * - PDF export capability
 * 
 * For Producers:
 * - Describe your scene in plain language
 * - AI generates professional shot lists
 * - Export to PDF for crew distribution
 */

import React, { useState, useRef, useEffect } from 'react'

/**
 * Shot data structure
 * Matches professional film production standards
 */
const EMPTY_SHOT = {
  id: '',
  sceneName: '',
  sceneNumber: '',
  shotNumber: '',
  location: '',
  description: '',
  shotType: '',
  cameraAngle: '',
  movement: '',
  equipment: '',
  framing: '',
  setupTime: '',
  audioNotes: ''
}

/**
 * Predefined shot types for quick selection
 */
const SHOT_TYPES = [
  'Wide Shot (WS)',
  'Medium Shot (MS)', 
  'Close-Up (CU)',
  'Extreme Close-Up (ECU)',
  'Over the Shoulder (OTS)',
  'Point of View (POV)',
  'Two Shot',
  'Master Shot',
  'Insert Shot',
  'Cutaway'
]

const CAMERA_ANGLES = [
  'Eye Level',
  'High Angle',
  'Low Angle',
  'Dutch Angle',
  'Birds Eye',
  'Worms Eye'
]

const CAMERA_MOVEMENTS = [
  'Static',
  'Pan Left',
  'Pan Right',
  'Tilt Up',
  'Tilt Down',
  'Dolly In',
  'Dolly Out',
  'Tracking Shot',
  'Crane Shot',
  'Handheld',
  'Steadicam'
]

/**
 * AI Chat Interface for shot generation
 */
function AIChatPanel({ onGenerateShots, loading }) {
  const [prompt, setPrompt] = useState('')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (prompt.trim()) {
      onGenerateShots(prompt)
    }
  }
  
  const examplePrompts = [
    "Create a shot list for an intense interrogation scene",
    "Generate 5 shots for a romantic sunset beach scene",
    "Shot list for a car chase sequence with 3 vehicles",
    "Create establishing shots for a haunted mansion"
  ]
  
  return (
    <div className="ai-chat-panel">
      <h3>🤖 AI Shot Generator</h3>
      <p className="panel-hint">
        Describe your scene and the AI will generate a professional shot list.
      </p>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your scene... e.g., 'A tense confrontation between two characters in a dimly lit warehouse'"
          rows={4}
          disabled={loading}
        />
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading || !prompt.trim()}
        >
          {loading ? '🎬 Generating...' : '✨ Generate Shot List'}
        </button>
      </form>
      
      <div className="example-prompts">
        <span>Try:</span>
        {examplePrompts.map((ex, i) => (
          <button 
            key={i}
            className="example-btn"
            onClick={() => setPrompt(ex)}
            disabled={loading}
          >
            {ex.substring(0, 30)}...
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Individual shot card display
 */
function ShotCard({ shot, index, onUpdate, onDelete, onDuplicate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(shot)
  
  const handleSave = () => {
    onUpdate(index, editData)
    setIsEditing(false)
  }
  
  if (isEditing) {
    return (
      <div className="shot-card editing">
        <div className="shot-card-header">
          <span className="shot-number">Shot #{index + 1}</span>
          <div className="shot-actions">
            <button className="btn-icon" onClick={handleSave} title="Save">💾</button>
            <button className="btn-icon" onClick={() => setIsEditing(false)} title="Cancel">✖</button>
          </div>
        </div>
        
        <div className="shot-edit-grid">
          <div className="edit-field">
            <label>Scene Name</label>
            <input 
              value={editData.sceneName}
              onChange={(e) => setEditData({...editData, sceneName: e.target.value})}
            />
          </div>
          <div className="edit-field">
            <label>Scene #</label>
            <input 
              value={editData.sceneNumber}
              onChange={(e) => setEditData({...editData, sceneNumber: e.target.value})}
            />
          </div>
          <div className="edit-field">
            <label>Shot #</label>
            <input 
              value={editData.shotNumber}
              onChange={(e) => setEditData({...editData, shotNumber: e.target.value})}
            />
          </div>
          <div className="edit-field">
            <label>Location</label>
            <input 
              value={editData.location}
              onChange={(e) => setEditData({...editData, location: e.target.value})}
            />
          </div>
          <div className="edit-field full-width">
            <label>Description</label>
            <textarea 
              value={editData.description}
              onChange={(e) => setEditData({...editData, description: e.target.value})}
              rows={2}
            />
          </div>
          <div className="edit-field">
            <label>Shot Type</label>
            <select 
              value={editData.shotType}
              onChange={(e) => setEditData({...editData, shotType: e.target.value})}
            >
              <option value="">Select...</option>
              {SHOT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="edit-field">
            <label>Camera Angle</label>
            <select 
              value={editData.cameraAngle}
              onChange={(e) => setEditData({...editData, cameraAngle: e.target.value})}
            >
              <option value="">Select...</option>
              {CAMERA_ANGLES.map(angle => (
                <option key={angle} value={angle}>{angle}</option>
              ))}
            </select>
          </div>
          <div className="edit-field">
            <label>Movement</label>
            <select 
              value={editData.movement}
              onChange={(e) => setEditData({...editData, movement: e.target.value})}
            >
              <option value="">Select...</option>
              {CAMERA_MOVEMENTS.map(mov => (
                <option key={mov} value={mov}>{mov}</option>
              ))}
            </select>
          </div>
          <div className="edit-field">
            <label>Equipment</label>
            <input 
              value={editData.equipment}
              onChange={(e) => setEditData({...editData, equipment: e.target.value})}
              placeholder="e.g., 35mm lens, dolly"
            />
          </div>
          <div className="edit-field">
            <label>Setup Time</label>
            <input 
              value={editData.setupTime}
              onChange={(e) => setEditData({...editData, setupTime: e.target.value})}
              placeholder="e.g., 15 mins"
            />
          </div>
          <div className="edit-field full-width">
            <label>Audio Notes</label>
            <input 
              value={editData.audioNotes}
              onChange={(e) => setEditData({...editData, audioNotes: e.target.value})}
              placeholder="e.g., Boom mic, wireless lav"
            />
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="shot-card">
      <div className="shot-card-header">
        <div className="shot-info">
          <span className="shot-number">Shot #{shot.shotNumber || index + 1}</span>
          <span className="scene-badge">Scene {shot.sceneNumber}: {shot.sceneName}</span>
        </div>
        <div className="shot-actions">
          <button className="btn-icon" onClick={() => onDuplicate(index)} title="Duplicate">📑</button>
          <button className="btn-icon" onClick={() => setIsEditing(true)} title="Edit">✏️</button>
          <button className="btn-icon danger" onClick={() => onDelete(index)} title="Delete">🗑️</button>
        </div>
      </div>
      
      <p className="shot-description">{shot.description}</p>
      
      <div className="shot-meta-grid">
        <div className="meta-item">
          <span className="meta-label">Type</span>
          <span className="meta-value">{shot.shotType || '—'}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Angle</span>
          <span className="meta-value">{shot.cameraAngle || '—'}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Movement</span>
          <span className="meta-value">{shot.movement || '—'}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Equipment</span>
          <span className="meta-value">{shot.equipment || '—'}</span>
        </div>
        {shot.location && (
          <div className="meta-item">
            <span className="meta-label">Location</span>
            <span className="meta-value">{shot.location}</span>
          </div>
        )}
        {shot.setupTime && (
          <div className="meta-item">
            <span className="meta-label">Setup</span>
            <span className="meta-value">{shot.setupTime}</span>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Main ShotListAI Component
 */
function ShotListAI() {
  const [shots, setShots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [explanation, setExplanation] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newShot, setNewShot] = useState({...EMPTY_SHOT})
  
  /**
   * Generate shots using AI (simulated for demo)
   * In production, this would call the GPT-4 backend
   */
  const generateShotsWithAI = async (prompt) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/ai/shot-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneDescription: prompt, mood: 'Cinematic' })
      });

      const result = await response.json();

      if (!result.success) throw new Error(result.error || 'AI request failed');

      // Attempt to parse JSON from AI response
      let aiShots = [];
      
      // Check if backend already parsed it (new behavior)
      if (result.data.shots) {
         aiShots = result.data.shots;
      } else {
         try {
           // Find JSON array in text (model might include chatty text)
           const jsonMatch = result.data.content.match(/\[[\s\S]*\]/);
           const jsonString = jsonMatch ? jsonMatch[0] : result.data.content;
           aiShots = JSON.parse(jsonString);
         } catch (parseError) {
           console.warn("AI JSON parse failed, text fallback", parseError);
           // Fallback: create one shot with the full text
           aiShots = [{ 
             type: 'Master Shot', 
             description: result.data.content, 
             angle: 'Eye Level', 
             movement: 'Static' 
           }];
         }
      }

      // Map AI format to internal component format
      const formattedShots = Array.isArray(aiShots) ? aiShots.map((s, i) => ({
        ...EMPTY_SHOT,
        id: `ai-shot-${Date.now()}-${i}`,
        sceneName: 'AI Scene',
        sceneNumber: '1',
        shotNumber: String(i + 1),
        // Robust mapping for various key styles
        shotType: s.type || s.shotType || s['Shot Size'] || 'Medium Shot',
        cameraAngle: s.angle || s.cameraAngle || s['Angle'] || 'Eye Level',
        movement: s.movement || s.cameraMovement || s['Movement'] || 'Static',
        description: s.description || s.action || s['Description'] || 'No description',
        location: s.location || 'TBD',
        equipment: s.equipment || 'Standard Kit',
        setupTime: s.setup_time || s.setupTime || '15 mins'
      })) : [];
      
      setShots(prev => [...prev, ...formattedShots])
      setExplanation(`✨ ${result.data.disclaimer} - Generated ${formattedShots.length} shots.`)
      
    } catch (err) {
      setError('Failed to generate shots. ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  
  /**
   * Sample shot generator (demo purposes)
   * Replace with actual GPT-4 API call in production
   */
  const generateSampleShots = (prompt) => {
    const lowerPrompt = prompt.toLowerCase()
    const baseId = Date.now()
    
    // Detect scene type from prompt
    let sceneType = 'General'
    let shots = []
    
    if (lowerPrompt.includes('interrogation') || lowerPrompt.includes('tense')) {
      sceneType = 'Interrogation'
      shots = [
        { shotType: 'Wide Shot (WS)', cameraAngle: 'Eye Level', movement: 'Static', description: 'Establish the interrogation room - bare walls, single light source, two figures across table' },
        { shotType: 'Medium Shot (MS)', cameraAngle: 'Eye Level', movement: 'Slow Dolly In', description: 'Detective leans forward, shadow falling across their face' },
        { shotType: 'Close-Up (CU)', cameraAngle: 'Low Angle', movement: 'Static', description: 'Suspect\'s hands fidgeting under the table' },
        { shotType: 'Over the Shoulder (OTS)', cameraAngle: 'Eye Level', movement: 'Static', description: 'Detective\'s perspective - suspect sweating under harsh light' },
        { shotType: 'Extreme Close-Up (ECU)', cameraAngle: 'Eye Level', movement: 'Static', description: 'Suspect\'s eyes darting, looking for escape' }
      ]
    } else if (lowerPrompt.includes('romantic') || lowerPrompt.includes('sunset') || lowerPrompt.includes('beach')) {
      sceneType = 'Romance'
      shots = [
        { shotType: 'Wide Shot (WS)', cameraAngle: 'Eye Level', movement: 'Crane Shot', description: 'Aerial pullback revealing couple on empty beach, golden hour lighting' },
        { shotType: 'Two Shot', cameraAngle: 'Low Angle', movement: 'Tracking Shot', description: 'Walking shot - couple silhouetted against sunset, waves lapping' },
        { shotType: 'Close-Up (CU)', cameraAngle: 'Eye Level', movement: 'Handheld', description: 'Her smile as she looks at him, wind catching her hair' },
        { shotType: 'Insert Shot', cameraAngle: 'High Angle', movement: 'Static', description: 'Their hands intertwining in the sand' },
        { shotType: 'Medium Shot (MS)', cameraAngle: 'Eye Level', movement: 'Steadicam', description: 'Walking into the sunset, waves reflecting golden light' }
      ]
    } else if (lowerPrompt.includes('chase') || lowerPrompt.includes('car') || lowerPrompt.includes('action')) {
      sceneType = 'Car Chase'
      shots = [
        { shotType: 'Wide Shot (WS)', cameraAngle: 'Birds Eye', movement: 'Crane Shot', description: 'Helicopter view - three cars weaving through traffic' },
        { shotType: 'Point of View (POV)', cameraAngle: 'Eye Level', movement: 'Handheld', description: 'Driver\'s POV - speedometer climbing, hands gripping wheel' },
        { shotType: 'Medium Shot (MS)', cameraAngle: 'Dutch Angle', movement: 'Tracking Shot', description: 'Side shot of hero car - tires screeching on sharp turn' },
        { shotType: 'Close-Up (CU)', cameraAngle: 'Low Angle', movement: 'Static', description: 'Gear shift slam - RPM needle hitting red' },
        { shotType: 'Wide Shot (WS)', cameraAngle: 'Low Angle', movement: 'Static', description: 'Cars fly over camera position - dramatic underpass shot' }
      ]
    } else {
      // Generic scene
      shots = [
        { shotType: 'Master Shot', cameraAngle: 'Eye Level', movement: 'Static', description: 'Establishing shot of the scene location' },
        { shotType: 'Medium Shot (MS)', cameraAngle: 'Eye Level', movement: 'Static', description: 'Character introduction - full body visible' },
        { shotType: 'Close-Up (CU)', cameraAngle: 'Eye Level', movement: 'Slow Dolly In', description: 'Character reaction shot - emotional moment' },
        { shotType: 'Over the Shoulder (OTS)', cameraAngle: 'Eye Level', movement: 'Static', description: 'Dialogue coverage - speaker in focus' },
        { shotType: 'Insert Shot', cameraAngle: 'High Angle', movement: 'Static', description: 'Detail shot of important prop or action' }
      ]
    }
    
    return shots.map((shot, i) => ({
      ...EMPTY_SHOT,
      ...shot,
      id: `shot-${baseId}-${i}`,
      sceneName: sceneType + ' Scene',
      sceneNumber: '1',
      shotNumber: String(i + 1),
      location: 'TBD',
      equipment: shot.movement === 'Handheld' ? 'Shoulder rig, 50mm' : 
                 shot.movement === 'Steadicam' ? 'Steadicam, 35mm' :
                 shot.movement === 'Crane Shot' ? 'Crane, 24mm wide' : 'Tripod, 50mm',
      setupTime: shot.movement === 'Crane Shot' ? '30 mins' : 
                 shot.movement === 'Tracking Shot' ? '20 mins' : '10 mins'
    }))
  }
  
  const updateShot = (index, updatedShot) => {
    setShots(prev => prev.map((shot, i) => i === index ? updatedShot : shot))
  }
  
  const deleteShot = (index) => {
    setShots(prev => prev.filter((_, i) => i !== index))
  }
  
  const addManualShot = () => {
    if (newShot.description.trim()) {
      setShots(prev => [...prev, {
        ...newShot,
        id: `shot-manual-${Date.now()}`,
        shotNumber: String(prev.length + 1)
      }])
      setNewShot({...EMPTY_SHOT})
      setShowAddForm(false)
    }
  }
  
  const clearAllShots = () => {
    if (window.confirm('Clear all shots? This cannot be undone.')) {
      setShots([])
      setExplanation('')
    }
  }

  const duplicateShot = (index) => {
    const shotToDuplicate = shots[index]
    const newShot = {
      ...shotToDuplicate,
      id: `shot-copy-${Date.now()}`,
      shotNumber: `${shotToDuplicate.shotNumber || index + 1}A` // Append 'A' to indicate variation
    }
    
    // Insert after current shot
    const newShots = [...shots]
    newShots.splice(index + 1, 0, newShot)
    setShots(newShots)
  }

  const exportToCSV = () => {
    // Define headers
    const headers = ['Scene Name', 'Scene #', 'Shot #', 'Shot Type', 'Angle', 'Movement', 'Description', 'Equipment', 'Setup Time', 'Location', 'Audio Notes']
    
    // Format rows
    const rows = shots.map(s => [
      s.sceneName,
      s.sceneNumber,
      s.shotNumber,
      s.shotType,
      s.cameraAngle,
      s.movement, 
      `"${s.description.replace(/"/g, '""')}"`, // Escape quotes
      s.equipment,
      s.setupTime,
      s.location,
      s.audioNotes
    ].join(','))
    
    // Combine
    const csvContent = [headers.join(','), ...rows].join('\n')
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `shot-list-${new Date().toISOString().slice(0,10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }
  
  const exportToPDF = () => {
    // Simple text export (in production, use jsPDF)
    const content = shots.map((shot, i) => 
      `Shot #${i + 1} - ${shot.shotType}\n` +
      `Scene: ${shot.sceneNumber} - ${shot.sceneName}\n` +
      `Description: ${shot.description}\n` +
      `Camera: ${shot.cameraAngle}, ${shot.movement}\n` +
      `Equipment: ${shot.equipment}\n` +
      `Setup: ${shot.setupTime}\n` +
      `---`
    ).join('\n\n')
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'shot-list.txt'
    a.click()
    URL.revokeObjectURL(url)
  }
  
  /**
   * Calculate shot list complexity for Scene Intelligence integration
   */
  const getComplexityAnalysis = () => {
    const totalShots = shots.length
    const complexMovements = shots.filter(s => 
      ['Crane Shot', 'Steadicam', 'Tracking Shot', 'Dolly In', 'Dolly Out'].includes(s.movement)
    ).length
    const closeUps = shots.filter(s => 
      s.shotType?.includes('Close-Up')
    ).length
    
    // Estimate total setup time
    const totalMinutes = shots.reduce((acc, shot) => {
      const timeStr = shot.setupTime || '15';
      const minutes = parseInt(timeStr.replace(/[^0-9]/g, '')) || 15;
      return acc + minutes;
    }, 0);
    
    // Format hours and minutes
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const estimatedTime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    const complexityScore = Math.min(100, (totalShots * 5) + (complexMovements * 15) + (closeUps * 3))
    
    return {
      totalShots,
      complexMovements,
      closeUps,
      estimatedTime,
      score: complexityScore,
      level: complexityScore < 30 ? 'Simple' : complexityScore < 60 ? 'Moderate' : 'Complex'
    }
  }
  
  const complexity = getComplexityAnalysis()
  
  return (
    <div className="shot-list-ai">
      {/* Left Panel: AI Chat */}
      <div className="shot-list-sidebar">
        <AIChatPanel 
          onGenerateShots={generateShotsWithAI}
          loading={loading}
        />
        
        {/* Complexity Analysis */}
        <div className="complexity-panel">
          <h4>📊 Shot Complexity</h4>
          <div className={`complexity-badge ${complexity.level.toLowerCase()}`}>
            {complexity.level}
          </div>
          <div className="score-bar-container">
            <div className="score-bar">
              <div 
                className={`score-bar-fill ${complexity.score < 30 ? 'low' : complexity.score < 60 ? 'medium' : 'high'}`}
                style={{ width: `${complexity.score}%` }}
              />
            </div>
            <span className="score-label">{complexity.score}/100</span>
          </div>
          <div className="stats-mini">
            <span>📹 {complexity.totalShots} shots</span>
            <span>🎥 {complexity.complexMovements} complex moves</span>
            <span>🔍 {complexity.closeUps} close-ups</span>
            <span>⏱️ {complexity.estimatedTime} est. shoot</span>
          </div>
        </div>
      </div>
      
      {/* Main Content: Shot List */}
      <div className="shot-list-main">
        <div className="shot-list-header">
          <h3>🎬 Shot List ({shots.length} shots)</h3>
          <div className="header-actions">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              ➕ Add Manual
            </button>
            {shots.length > 0 && (
              <>
                <div className="btn-group">
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={exportToPDF}
                  >
                    📄 PDF
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={exportToCSV}
                  >
                    📊 CSV
                  </button>
                </div>
                <button 
                  className="btn btn-secondary btn-sm danger"
                  onClick={clearAllShots}
                >
                  🗑️ Clear All
                </button>
              </>
            )}
          </div>
        </div>
        
        {error && (
          <div className="error-banner">
            <p>⚠️ {error}</p>
          </div>
        )}
        
        {explanation && (
          <div className="explanation-banner">
            <p>✨ {explanation}</p>
          </div>
        )}
        
        {/* Add Shot Form */}
        {showAddForm && (
          <div className="shot-card editing add-form">
            <h4>Add New Shot</h4>
            <div className="shot-edit-grid">
              <div className="edit-field">
                <label>Scene Name</label>
                <input 
                  value={newShot.sceneName}
                  onChange={(e) => setNewShot({...newShot, sceneName: e.target.value})}
                />
              </div>
              <div className="edit-field">
                <label>Scene #</label>
                <input 
                  value={newShot.sceneNumber}
                  onChange={(e) => setNewShot({...newShot, sceneNumber: e.target.value})}
                />
              </div>
              <div className="edit-field full-width">
                <label>Description *</label>
                <textarea 
                  value={newShot.description}
                  onChange={(e) => setNewShot({...newShot, description: e.target.value})}
                  placeholder="Describe what happens in this shot..."
                  rows={2}
                />
              </div>
              <div className="edit-field">
                <label>Shot Type</label>
                <select 
                  value={newShot.shotType}
                  onChange={(e) => setNewShot({...newShot, shotType: e.target.value})}
                >
                  <option value="">Select...</option>
                  {SHOT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="edit-field">
                <label>Camera Angle</label>
                <select 
                  value={newShot.cameraAngle}
                  onChange={(e) => setNewShot({...newShot, cameraAngle: e.target.value})}
                >
                  <option value="">Select...</option>
                  {CAMERA_ANGLES.map(angle => (
                    <option key={angle} value={angle}>{angle}</option>
                  ))}
                </select>
              </div>
              <div className="edit-field">
                <label>Movement</label>
                <select 
                  value={newShot.movement}
                  onChange={(e) => setNewShot({...newShot, movement: e.target.value})}
                >
                  <option value="">Select...</option>
                  {CAMERA_MOVEMENTS.map(mov => (
                    <option key={mov} value={mov}>{mov}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary btn-sm" onClick={addManualShot}>
                Add Shot
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {/* Shot Cards */}
        <div className="shots-grid">
          {shots.length === 0 ? (
            <div className="empty-state">
              <p>🎬 No shots yet</p>
              <p className="hint">Use the AI generator or add shots manually</p>
            </div>
          ) : (
            shots.map((shot, index) => (
              <ShotCard
                key={shot.id || index}
                shot={shot}
                index={index}
                onUpdate={updateShot}
                onDelete={deleteShot}
                onDuplicate={duplicateShot}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ShotListAI
