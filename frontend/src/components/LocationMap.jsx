import React, { useState } from 'react'

function LocationMap() {
  const rows = 8
  const cols = 12
  const [selectedZone, setSelectedZone] = useState(null)
  const [locationGrid, setLocationGrid] = useState(() => {
    // Generate initial grid state
    const grid = []
    const getZoneStatus = (row, col) => {
        const centerCol = 12 / 2
        const distFromCenter = Math.abs(col - centerCol)
        const maxInRow = Math.max(2, Math.floor((8 - row) * 1.2))
        
        if (distFromCenter > maxInRow + 2) return 'hidden'
        
        const rand = (row * 12 + col) % 10
        if (rand < 4) return 'available'
        if (rand < 7) return 'pending'
        return 'booked'
    }

    for (let r = 0; r < 8; r++) {
        const rowCells = []
        for (let c = 0; c < 12; c++) {
        rowCells.push({
            row: r,
            col: c,
            status: getZoneStatus(r, c),
            id: `r${r}-c${c}`
        })
        }
        grid.push(rowCells)
    }
    return grid
  })
  
  const handleZoneClick = (rowIndex, colIndex, status) => {
      if (status === 'hidden' || status === 'booked') return;
      
      const newGrid = [...locationGrid];
      const cell = newGrid[rowIndex][colIndex];
      
      // Toggle selection for demo
      if (selectedZone && selectedZone.id === cell.id) {
          setSelectedZone(null);
      } else {
          setSelectedZone(cell);
      }
  }

  return (
    <div className="location-map-card">
      <style>{`
        .location-map-card {
           background: #FF6B35; /* Orange Background */
           border-radius: 16px;
           padding: 1.5rem;
           color: white;
           position: relative;
           min-height: 380px;
           display: flex;
           flex-direction: column;
           box-shadow: 0 10px 25px rgba(255, 107, 53, 0.3);
           transition: transform 0.2s;
        }
        .location-map-card:hover {
            transform: translateY(-2px);
        }

        .map-header {
           display: flex;
           justify-content: space-between;
           align-items: center;
           margin-bottom: 2rem;
        }

        .map-btn-menu {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            cursor: pointer;
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            line-height: 0;
            padding-bottom: 6px;
        }

        .stage-area {
            text-align: center;
            margin-bottom: 1.5rem;
        }
        
        .stage-label {
            font-size: 0.9rem;
            opacity: 0.9;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }
        
        .stage-line {
            height: 2px;
            width: 80%;
            margin: 0 auto;
            background: rgba(255,255,255,0.3);
            border-radius: 2px;
        }

        .seating-grid {
            display: flex;
            flex-direction: column;
            gap: 6px;
            align-items: center;
            flex: 1;
            justify-content: center;
        }

        .grid-row {
            display: flex;
            gap: 6px;
            justify-content: center;
        }

        .grid-cell {
            width: 24px;
            height: 24px;
            border-radius: 6px;
            cursor: pointer;
            transition: transform 0.1s, opacity 0.2s;
        }
        
        .grid-cell.hidden { visibility: hidden; pointer-events: none; }
        
        .grid-cell.available { background: white; }
        .grid-cell.available:hover { transform: scale(1.2); }
        
        .grid-cell.pending { background: #FFB08E; } /* Light Orange matched to image */
        
        .grid-cell.booked { background: #A03E18; } /* Dark tone for booked */
        
        .grid-cell.selected { 
            box-shadow: 0 0 0 2px white, 0 0 10px rgba(0,0,0,0.2);
            transform: scale(1.1);
            z-index: 10;
        }

        .map-legend {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            margin-top: 2rem;
            font-size: 0.85rem;
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .legend-box {
            width: 14px;
            height: 14px;
            border-radius: 3px;
        }
      `}</style>
      
      <div className="map-header">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          AI Location Scout <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>▼</span>
        </h3>
        <button className="map-btn-menu">...</button>
      </div>
      
      <div className="stage-area">
        <div className="stage-label">{selectedZone ? `Zone ${selectedZone.row}-${selectedZone.col} Selected` : 'Main Stage'}</div>
        <div className="stage-line"></div>
      </div>
      
      <div className="seating-grid">
        {locationGrid.map((row, rIdx) => (
          <div key={rIdx} className="grid-row">
            {row.map((cell, cIdx) => (
              <div 
                key={cIdx}
                className={`grid-cell ${cell.status} ${selectedZone && selectedZone.id === cell.id ? 'selected' : ''}`}
                onClick={() => handleZoneClick(rIdx, cIdx, cell.status)}
                title={cell.status !== 'hidden' ? `${cell.status} - Row ${rIdx+1}` : ''}
              />
            ))}
          </div>
        ))}
      </div>
      
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-box" style={{ background: 'white' }}></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-box" style={{ background: '#FFB08E' }}></div>
          <span>Pending</span>
        </div>
        <div className="legend-item">
          <div className="legend-box" style={{ background: '#A03E18' }}></div>
          <span>Booked</span>
        </div>
      </div>
    </div>
  )
}

export default LocationMap