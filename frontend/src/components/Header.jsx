import React from 'react'

function Header({ currentView, onViewChange }) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleNavClick = (view) => {
    onViewChange(view);
    setIsMenuOpen(false);
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-logo">VORDGUARD</div>
        
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <nav className={`header-nav ${isMenuOpen ? 'open' : ''}`}>
          <button 
            className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavClick('dashboard')}
          >
            📊 Overview
          </button>
          <button 
            className={`nav-btn ${currentView === 'crisis' ? 'active' : ''}`}
            onClick={() => handleNavClick('crisis')}
          >
            Crisis
          </button>
          <button 
            className={`nav-btn ${currentView === 'scene-risk' ? 'active' : ''}`}
            onClick={() => handleNavClick('scene-risk')}
          >
            Scenes
          </button>
          <button 
            className={`nav-btn ${currentView === 'set-planner' ? 'active' : ''}`}
            onClick={() => handleNavClick('set-planner')}
          >
            Set Planner
          </button>
          <button 
            className={`nav-btn ${currentView === 'shot-list' ? 'active' : ''}`}
            onClick={() => handleNavClick('shot-list')}
          >
            Shot List
          </button>
        </nav>
      </div>
    </header>
  )
}

export default Header
