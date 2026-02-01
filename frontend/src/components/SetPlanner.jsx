/**
 * SET PLANNER COMPONENT
 * 
 * Visual spatial planning tool for film production sets
 * Inspired by film-set-planner project
 * 
 * Purpose: Allow producers to visually plan set layouts
 * - Drag-drop equipment onto canvas
 * - Plan camera positions, lighting, crew positions
 * - Evaluate spatial feasibility before shoot day
 * 
 * Integration with VordGuard:
 * - Scene Intelligence uses set complexity for risk scoring
 * - Spatial Feasibility considers set requirements vs location constraints
 * - Plan-B can suggest simpler set configurations
 */

import React, { useState, useRef, useEffect } from 'react'
import { Stage, Layer, Rect, Circle, Text, Group, Line, Arrow } from 'react-konva'
import { v4 as uuidv4 } from 'uuid'

/**
 * Equipment catalog for film production
 * Each item has an icon representation and production metadata
 */
const EQUIPMENT_CATALOG = {
  cameras: [
    { id: 'camera-main', name: 'Main Camera', icon: '🎥', color: '#e74c3c', size: 40 },
    { id: 'camera-b', name: 'B Camera', icon: '📷', color: '#c0392b', size: 35 },
    { id: 'camera-drone', name: 'Drone Camera', icon: '🚁', color: '#9b59b6', size: 45 },
  ],
  lighting: [
    { id: 'light-key', name: 'Key Light', icon: '💡', color: '#f39c12', size: 35 },
    { id: 'light-fill', name: 'Fill Light', icon: '🔆', color: '#f1c40f', size: 30 },
    { id: 'light-back', name: 'Back Light', icon: '✨', color: '#e67e22', size: 30 },
    { id: 'reflector', name: 'Reflector', icon: '🪞', color: '#bdc3c7', size: 50 },
  ],
  crew: [
    { id: 'director', name: 'Director', icon: '🎬', color: '#3498db', size: 30 },
    { id: 'dp', name: 'DP/Cinematographer', icon: '👁️', color: '#2980b9', size: 30 },
    { id: 'actor', name: 'Actor Position', icon: '🧑', color: '#1abc9c', size: 35 },
    { id: 'crew-member', name: 'Crew Member', icon: '👷', color: '#95a5a6', size: 25 },
  ],
  props: [
    { id: 'table', name: 'Table', icon: '🪑', color: '#8e44ad', size: 60 },
    { id: 'vehicle', name: 'Vehicle', icon: '🚗', color: '#34495e', size: 80 },
    { id: 'prop-generic', name: 'Prop', icon: '📦', color: '#7f8c8d', size: 40 },
  ],
  markers: [
    { id: 'marker-a', name: 'Mark A', icon: 'A', color: '#e74c3c', size: 25 },
    { id: 'marker-b', name: 'Mark B', icon: 'B', color: '#3498db', size: 25 },
    { id: 'marker-c', name: 'Mark C', icon: 'C', color: '#2ecc71', size: 25 },
  ],
}

/**
 * Single draggable object on the set diagram
 */
function SetObject({ item, isSelected, onSelect, onChange, onDelete }) {
  const handleDragEnd = (e) => {
    onChange({
      ...item,
      x: e.target.x(),
      y: e.target.y(),
    })
  }

  return (
    <Group
      x={item.x}
      y={item.y}
      draggable
      onClick={() => onSelect(item.id)}
      onTap={() => onSelect(item.id)}
      onDragEnd={handleDragEnd}
    >
      {/* Object circle/shape */}
      <Circle
        radius={item.size / 2}
        fill={item.color}
        stroke={isSelected ? '#fff' : '#333'}
        strokeWidth={isSelected ? 3 : 1}
        shadowBlur={isSelected ? 10 : 0}
        shadowColor="#000"
      />
      {/* Object label */}
      <Text
        text={item.icon}
        fontSize={item.size * 0.6}
        offsetX={item.size * 0.3}
        offsetY={item.size * 0.3}
      />
      {/* Name label below */}
      <Text
        text={item.name}
        fontSize={10}
        fill="#fff"
        offsetX={item.name.length * 2.5}
        offsetY={-item.size / 2 - 5}
      />
    </Group>
  )
}

/**
 * Main Set Planner Component
 */
function SetPlanner() {
  const stageRef = useRef(null)
  
  // Canvas state
  const [objects, setObjects] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState(null)
  
  // Canvas dimensions
  const canvasWidth = 800
  const canvasHeight = 500
  
  // Grid settings
  const gridSize = 50

  // NEW: Download Map
  const downloadMap = () => {
    if (stageRef.current) {
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `set-plan-${new Date().toISOString().slice(0,10)}.png`;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // NEW: AI Layout Generation
  const generateLayoutWithAI = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true)
    setGenerationError(null)

    try {
      const response = await fetch('/api/ai/set-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneDescription: aiPrompt })
      })
      
      const result = await response.json()
      
      if (result.success && result.data.layout) {
        // Map AI items to catalog templates
        const newObjects = result.data.layout.map(aiItem => {
          let template = null;
          // Search across all categories
          Object.values(EQUIPMENT_CATALOG).forEach(categoryItems => {
             const found = categoryItems.find(t => t.id === aiItem.type)
             if (found) template = found;
          });

          // Fallback
          if (!template) template = EQUIPMENT_CATALOG.props[2]; 

          return {
            ...template,
            id: uuidv4(),
            x: aiItem.x || 400,
            y: aiItem.y || 300,
            name: aiItem.label || template.name
          }
        });
        
        setObjects(newObjects);
      } else {
        setGenerationError("AI failed to generate a valid layout.")
      }
    } catch (err) {
      setGenerationError("Failed to connect to AI service.")
    } finally {
      setIsGenerating(false)
    }
  }

  /**
   * Add equipment to canvas
   */
  const addObject = (template) => {
    const newObject = {
      ...template,
      type: template.id, // Store original ID for complexity calculation
      id: uuidv4(),
      x: canvasWidth / 2 + Math.random() * 100 - 50,
      y: canvasHeight / 2 + Math.random() * 100 - 50,
    }
    setObjects([...objects, newObject])
    setSelectedId(newObject.id)
  }

  /**
   * Update object position/properties
   */
  const updateObject = (updatedItem) => {
    setObjects(objects.map(obj => 
      obj.id === updatedItem.id ? updatedItem : obj
    ))
  }

  /**
   * Delete selected object
   */
  const deleteSelected = () => {
    if (selectedId) {
      setObjects(objects.filter(obj => obj.id !== selectedId))
      setSelectedId(null)
    }
  }

  /**
   * Clear all objects
   */
  const clearAll = () => {
    if (confirm('Clear entire set diagram?')) {
      setObjects([])
      setSelectedId(null)
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected()
      }
      if (e.key === 'Escape') {
        setSelectedId(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, objects])

  /**
   * Generate grid lines for canvas
   */
  const renderGrid = () => {
    const lines = []
    // Vertical lines
    for (let i = 0; i <= canvasWidth; i += gridSize) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i, 0, i, canvasHeight]}
          stroke="#3a3a4a"
          strokeWidth={0.5}
        />
      )
    }
    // Horizontal lines
    for (let i = 0; i <= canvasHeight; i += gridSize) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i, canvasWidth, i]}
          stroke="#3a3a4a"
          strokeWidth={0.5}
        />
      )
    }
    return lines
  }

  /**
   * Calculate set complexity score based on objects
   * Used for Scene Intelligence integration
   */
  const calculateSetComplexity = () => {
    // Use type property for accurate counting (id is UUID)
    const getType = (o) => o.type || o.id

    const cameraCount = objects.filter(o => getType(o).includes('camera')).length
    const lightCount = objects.filter(o => getType(o).includes('light') || getType(o).includes('reflector')).length
    const crewCount = objects.filter(o => ['director', 'dp', 'actor', 'crew'].some(c => getType(o).includes(c))).length
    
    let complexity = 'LOW'
    let score = 20
    
    if (cameraCount >= 2 || lightCount >= 4 || crewCount >= 5) {
      complexity = 'MEDIUM'
      score = 50
    }
    if (cameraCount >= 3 || lightCount >= 6 || crewCount >= 8 || objects.length > 15) {
      complexity = 'HIGH'
      score = 80
    }
    
    return { complexity, score, cameraCount, lightCount, crewCount, totalObjects: objects.length }
  }

  const setComplexity = calculateSetComplexity()

  return (
    <div className="set-planner">
      {/* Header */}
      <div className="set-planner-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2>🎬 Set Layout Planner</h2>
          <p>Plan your set visually. Drag equipment onto canvas.</p>
        </div>
        <button className="btn btn-outline" onClick={downloadMap} style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
          📥 Download Map
        </button>
      </div>

      {/* AI Controls */}
      <div className="ai-controls-bar" style={{ 
          marginBottom: '1rem', 
          padding: '1rem', 
          background: 'var(--bg-card)', 
          borderRadius: 'var(--radius-md)', 
          display: 'flex', 
          gap: '1rem',
          alignItems: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder="Describe scene for AI Layout (e.g., 'Interrogation scene with single overhead light')"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          style={{ flex: 1 }}
          onKeyDown={(e) => e.key === 'Enter' && generateLayoutWithAI()}
        />
        <button 
          className="btn btn-primary" 
          onClick={generateLayoutWithAI} 
          disabled={isGenerating || !aiPrompt.trim()}
        >
          {isGenerating ? '✨ Generating...' : '✨ AI Suggest Layout'}
        </button>
      </div>
      {generationError && <p className="error-text" style={{ color: 'var(--accent-danger)', marginBottom: '1rem' }}>{generationError}</p>}

      <div className="set-planner-layout">
        {/* Equipment Toolbox */}
        <div className="set-toolbox">
          <h3>Equipment</h3>
          
          {Object.entries(EQUIPMENT_CATALOG).map(([category, items]) => (
            <div key={category} className="toolbox-category">
              <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
              <div className="toolbox-items">
                {items.map(item => (
                  <button
                    key={item.id}
                    className="toolbox-item"
                    onClick={() => addObject(item)}
                    title={item.name}
                  >
                    <span className="item-icon">{item.icon}</span>
                    <span className="item-name">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Actions */}
          <div className="toolbox-actions">
            <button onClick={deleteSelected} disabled={!selectedId} className="btn btn-danger">
              🗑️ Delete Selected
            </button>
            <button onClick={clearAll} className="btn btn-secondary">
              Clear All
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="set-canvas-container">
          <Stage
            ref={stageRef}
            width={canvasWidth}
            height={canvasHeight}
            style={{ backgroundColor: '#1a1a2e', borderRadius: '8px' }}
            onClick={(e) => {
              // Deselect when clicking empty space
              if (e.target === e.target.getStage()) {
                setSelectedId(null)
              }
            }}
          >
            {/* Grid Layer */}
            <Layer>
              {renderGrid()}
            </Layer>

            {/* Objects Layer */}
            <Layer>
              {objects.map(obj => (
                <SetObject
                  key={obj.id}
                  item={obj}
                  isSelected={obj.id === selectedId}
                  onSelect={setSelectedId}
                  onChange={updateObject}
                  onDelete={deleteSelected}
                />
              ))}
            </Layer>
          </Stage>

          {/* Canvas controls */}
          <div className="canvas-info">
            <span>Objects: {objects.length}</span>
            <span>•</span>
            <span>Click to select, drag to move, Delete key to remove</span>
          </div>
        </div>

        {/* Set Analysis Panel */}
        <div className="set-analysis">
          <h3>📊 Set Complexity</h3>
          
          <div className={`complexity-badge ${setComplexity.complexity.toLowerCase()}`}>
            {setComplexity.complexity} COMPLEXITY
          </div>
          
          <div className="complexity-score">
            <div className="score-bar">
              <div 
                className="score-fill" 
                style={{ width: `${setComplexity.score}%` }}
              />
            </div>
            <span>{setComplexity.score}/100</span>
          </div>

          <div className="complexity-breakdown">
            <div className="breakdown-item">
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span>🎥 Cameras</span>
                <button 
                  onClick={() => addObject(EQUIPMENT_CATALOG.cameras[0])}
                  style={{
                    background: 'rgba(255,255,255,0.1)', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    padding: '0 8px',
                    color: '#fff',
                    lineHeight: '1.5'
                  }}
                  title="Add Camera"
                >+</button>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span>{setComplexity.cameraCount}</span>
                {setComplexity.cameraCount > 0 && (
                  <button 
                    onClick={() => setObjects(objects.filter(o => !(o.type || o.id).includes('camera')))}
                    style={{background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: 0, fontSize: '10px'}}
                    title="Clear Cameras"
                  >❌</button>
                )}
              </div>
            </div>
            <div className="breakdown-item">
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span>💡 Lights</span>
                <button 
                  onClick={() => addObject(EQUIPMENT_CATALOG.lighting[0])}
                  style={{
                    background: 'rgba(255,255,255,0.1)', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    padding: '0 8px',
                    color: '#fff',
                    lineHeight: '1.5'
                  }}
                  title="Add Light"
                >+</button>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span>{setComplexity.lightCount}</span>
                {setComplexity.lightCount > 0 && (
                  <button 
                    onClick={() => setObjects(objects.filter(o => !((o.type || o.id).includes('light') || (o.type || o.id).includes('reflector'))))}
                    style={{background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: 0, fontSize: '10px'}}
                    title="Clear Lights"
                  >❌</button>
                )}
              </div>
            </div>
            <div className="breakdown-item">
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span>👥 Crew Positions</span>
                <button 
                  onClick={() => addObject(EQUIPMENT_CATALOG.crew[3])} 
                  style={{
                    background: 'rgba(255,255,255,0.1)', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    padding: '0 8px',
                    color: '#fff',
                    lineHeight: '1.5'
                  }}
                  title="Add Crew"
                >+</button>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span>{setComplexity.crewCount}</span>
                {setComplexity.crewCount > 0 && (
                  <button 
                    onClick={() => setObjects(objects.filter(o => !['director', 'dp', 'actor', 'crew'].some(c => (o.type || o.id).includes(c))))}
                    style={{background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: 0, fontSize: '10px'}}
                    title="Clear Crew"
                  >❌</button>
                )}
              </div>
            </div>
            <div className="breakdown-item">
              <span>📦 Total Objects</span>
              <span>{setComplexity.totalObjects}</span>
            </div>
          </div>

          <div className="complexity-advice">
            {setComplexity.complexity === 'LOW' && (
              <p>✓ Simple setup. Standard crew can handle.</p>
            )}
            {setComplexity.complexity === 'MEDIUM' && (
              <p>⚠ Moderate complexity. Plan extra setup time.</p>
            )}
            {setComplexity.complexity === 'HIGH' && (
              <p>⚠ Complex setup. Consider backup configurations.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SetPlanner
