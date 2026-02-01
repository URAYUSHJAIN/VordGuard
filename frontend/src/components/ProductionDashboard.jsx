import React, { useState, useEffect } from 'react'
import Hero3D from './Hero3D'
import LocationMap from './LocationMap'

function ProductionCalendar({ selectedDate, onDateSelect }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()
  
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  const today = new Date()
  const isToday = (day) => 
    day === today.getDate() && 
    currentMonth.getMonth() === today.getMonth() &&
    currentMonth.getFullYear() === today.getFullYear()
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }
  
  const calendarDays = []
  
  const prevMonthDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate()
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({ day: prevMonthDays - i, isCurrentMonth: false })
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, isCurrentMonth: true })
  }
  
  const remainingDays = 42 - calendarDays.length
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({ day: i, isCurrentMonth: false })
  }
  
  return (
    <div className="prod-calendar">
      <div className="calendar-header">
        <h2>
          {monthNames[currentMonth.getMonth()].slice(0, 3)}, {today.getDate()} 
          <span className="today-label">Today</span>
        </h2>
        <div className="calendar-nav">
          <button onClick={prevMonth}>&lt;</button>
          <button onClick={nextMonth}>&gt;</button>
        </div>
      </div>
      
      <div className="calendar-grid">
        {dayNames.map(day => (
          <div key={day} className="calendar-day-name">{day}</div>
        ))}
        {calendarDays.map((item, idx) => (
          <div 
            key={idx}
            className={`calendar-day ${!item.isCurrentMonth ? 'other-month' : ''} ${isToday(item.day) && item.isCurrentMonth ? 'today' : ''}`}
            onClick={() => item.isCurrentMonth && onDateSelect?.(item.day)}
          >
            {item.day}
          </div>
        ))}
      </div>
    </div>
  )
}

function ScheduleList() {
  const scheduleItems = [
    { id: 1, title: 'DAWN EXTERIOR', time: '6:00 - 8:30', location: 'LOC #1', status: 80, statusText: '80%' },
    { id: 2, title: 'WAREHOUSE SCENE', time: '9:00 - 12:00', location: 'LOC #2', status: 'sold', statusText: 'WRAPPED' },
    { id: 3, title: 'OFFICE INTERIOR', time: '13:00 - 15:30', location: 'LOC #3', status: 50, statusText: '50%' },
    { id: 4, title: 'NIGHT STREET', time: '18:00 - 22:00', location: 'LOC #4', status: 35, statusText: '35%' },
  ]
  
  return (
    <div className="schedule-list-card">
      <h3 className="card-header-title">Today's Schedule</h3>
      <div className="schedule-list">
        {scheduleItems.map(item => (
          <div key={item.id} className="schedule-item">
            <div className="schedule-time">
              <span className="time-marker"></span>
              <span className="time-text">{item.time.split(' - ')[0]}</span>
            </div>
            <div className="schedule-content">
              <div className="schedule-info">
                <h4>{item.title}</h4>
                <p>{item.time} • {item.location}</p>
              </div>
              <div className={`schedule-status ${item.status === 'sold' ? 'wrapped' : ''}`}>
                {item.status === 'sold' ? (
                  <span className="status-wrapped">WRAPPED</span>
                ) : (
                  <div className="status-progress">
                    <svg viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#eee"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#FF6B35"
                        strokeWidth="3"
                        strokeDasharray={`${item.status}, 100`}
                      />
                    </svg>
                    <span>{item.statusText}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// LocationMap moved to separate component

function BudgetStats() {
  const weeklyData = [
    { day: 'Sun', value: 65, secondary: 40 },
    { day: 'Mon', value: 85, secondary: 55 },
    { day: 'Tue', value: 95, secondary: 70 },
    { day: 'Wed', value: 75, secondary: 45 },
    { day: 'Thu', value: 60, secondary: 35 },
    { day: 'Fri', value: 50, secondary: 30 },
    { day: 'Sat', value: 55, secondary: 25 },
  ]
  
  const maxValue = 100
  
  return (
    <div className="budget-stats-card">
      <div className="stats-header">
        <h3>AI Cost Forecast</h3>
        <div className="stats-actions">
          <button className="action-btn">≡</button>
          <button className="action-btn">↗</button>
        </div>
      </div>
      
      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-value">$120.9k</span>
          <span className="stat-label">Total Budget</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">$71.3k</span>
          <span className="stat-label"><span className="dot production"></span> Production</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">$41.6k</span>
          <span className="stat-label"><span className="dot other"></span> Other</span>
        </div>
      </div>
      
      <div className="stats-chart">
        {weeklyData.map((item, idx) => (
          <div key={idx} className="chart-bar-group">
            <div className="bar-container">
              <div 
                className="bar primary"
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              />
              <div 
                className="bar secondary"
                style={{ height: `${(item.secondary / maxValue) * 100}%` }}
              />
            </div>
            <span className="bar-label">{item.day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CrewWidget() {
  return (
    <div className="crew-widget">
      <div className="widget-header">
        <h4>AI Crew Match</h4>
        <button className="widget-action">↗</button>
      </div>
      <div className="widget-value">
        <span className="big-number">47</span>
        <span className="label">today</span>
      </div>
    </div>
  )
}

function ActivityHeatmap() {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const timeSlots = 5
  
  const getActivityLevel = (day, slot) => {
    const rand = (day * timeSlots + slot) % 5
    return rand
  }
  
  const levels = ['level-0', 'level-1', 'level-2', 'level-3', 'level-4']
  
  return (
    <div className="activity-heatmap">
      <div className="widget-header">
        <h4>AI Production Velocity</h4>
        <button className="widget-action">•••</button>
      </div>
      
      <div className="heatmap-legend">
        <span><span className="legend-color l0"></span> 1000+</span>
        <span><span className="legend-color l1"></span> 1500+</span>
        <span><span className="legend-color l2"></span> 2000+</span>
        <span><span className="legend-color l3"></span> 2500+</span>
        <span><span className="legend-color l4"></span> 3000+</span>
      </div>
      
      <div className="heatmap-grid">
        {Array.from({ length: timeSlots }).map((_, slotIdx) => (
          <div key={slotIdx} className="heatmap-row">
            {days.map((day, dayIdx) => (
              <div 
                key={dayIdx}
                className={`heatmap-cell ${levels[getActivityLevel(dayIdx, slotIdx)]}`}
              />
            ))}
          </div>
        ))}
        <div className="heatmap-labels">
          {days.map(day => (
            <span key={day}>{day}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProjectHealth() {
  const healthScore = 86
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (healthScore / 100) * circumference
  
  return (
    <div className="project-health">
      <div className="widget-header">
        <h4>AI Risk Analysis</h4>
        <button className="widget-action">⚙</button>
      </div>
      
      <div className="health-circle">
        <svg viewBox="0 0 100 100">
          {Array.from({ length: 20 }).map((_, i) => {
            const angle = (i * 18) - 90
            const x1 = 50 + 35 * Math.cos(angle * Math.PI / 180)
            const y1 = 50 + 35 * Math.sin(angle * Math.PI / 180)
            const x2 = 50 + 45 * Math.cos(angle * Math.PI / 180)
            const y2 = 50 + 45 * Math.sin(angle * Math.PI / 180)
            const isActive = i < (healthScore / 100) * 20
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isActive ? '#FF6B35' : '#e5e5e5'}
                strokeWidth="4"
                strokeLinecap="round"
              />
            )
          })}
        </svg>
        <div className="health-value">
          <span className="percentage">{healthScore}%</span>
        </div>
      </div>
    </div>
  )
}

function QuickActions({ onNavigate }) {
  const actions = [
    { id: 'crisis', icon: '🚨', label: 'Report Crisis', color: '#EF4444' }, // Red for urgency
    { id: 'scene-risk', icon: '📊', label: 'Scene Risk', color: '#10B981' }, // Green for analysis
    { id: 'set-planner', icon: '🎬', label: 'Set Planner', color: '#3B82F6' }, // Blue for planning
    { id: 'shot-list', icon: '🤖', label: 'AI Shot List', color: '#8B5CF6' }, // Purple for AI
  ]
  
  return (
    <div className="quick-actions-grid">
      {actions.map(action => (
        <button 
          key={action.id}
          className="quick-action-card"
          onClick={() => onNavigate(action.id)}
          style={{ borderTop: `4px solid ${action.color}` }}
        >
          <span className="action-icon">{action.icon}</span>
          <span className="action-label">{action.label}</span>
        </button>
      ))}
    </div>
  )
}

function ProductionDashboard({ onNavigate }) {
  const [selectedDate, setSelectedDate] = useState(new Date().getDate())
  
  return (
    <div className="production-dashboard">
      <style>{`
        .production-dashboard {
          display: grid;
          grid-template-columns: 350px 1fr 300px;
          gap: 1.5rem;
          padding-bottom: 2rem;
          background-color: #f0f2f5;
        }

        .card {
          background-color: #ffffff;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
        }
        
        .card-header-title {
          font-size: 18px;
          font-weight: 600;
          color: #1a202c;
          margin-bottom: 16px;
        }

        /* Schedule List Card */
        .schedule-list-card {
          background-color: #fff;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .schedule-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .schedule-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .schedule-time {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        }

        .time-marker {
          width: 12px;
          height: 12px;
          background-color: #CBD5E0;
          border-radius: 50%;
          margin-bottom: 4px;
        }
        
        .schedule-item:first-child .time-marker {
            background-color: #FF6B35;
        }

        .time-text {
          font-size: 12px;
          color: #718096;
          font-weight: 500;
        }

        .schedule-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          background-color: #F7FAFC;
          border-radius: 8px;
          padding: 12px;
        }

        .schedule-info h4 {
          font-size: 14px;
          font-weight: 600;
          color: #2D3748;
          margin: 0 0 4px 0;
        }

        .schedule-info p {
          font-size: 12px;
          color: #A0AEC0;
          margin: 0;
        }

        .schedule-status.wrapped .status-wrapped {
          background-color: #E6FFFA;
          color: #38B2AC;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
        }

        .status-progress {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-progress svg {
          width: 36px;
          height: 36px;
        }
        
        .status-progress span {
            font-size: 12px;
            font-weight: 700;
            color: #FF6B35;
        }

        /* Budget Stats Card */
        .budget-stats-card {
          background-color: #fff;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
        }

        .stats-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .stats-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1a202c;
          margin: 0;
        }

        .stats-actions .action-btn {
          background: #F7FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 6px;
          color: #718096;
          width: 28px;
          height: 28px;
          margin-left: 8px;
          cursor: pointer;
        }

        .stats-summary {
          display: flex;
          gap: 24px;
          margin-bottom: 24px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #2D3748;
        }

        .stat-label {
          font-size: 12px;
          color: #A0AEC0;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .stat-label .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .stat-label .dot.production { background-color: #4299E1; }
        .stat-label .dot.other { background-color: #A0AEC0; }

        .stats-chart {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          height: 120px; /* Adjust as needed */
        }

        .chart-bar-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: calc(100% / 7 - 8px);
        }

        .bar-container {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 4px;
          width: 100%;
          height: 100%;
        }

        .bar {
          width: 40%;
          border-radius: 4px;
        }
        
        .bar.primary { background-color: #4299E1; }
        .bar.secondary { background-color: #A0AEC0; }

        .bar-label {
          font-size: 12px;
          color: #718096;
          font-weight: 500;
        }

        .quick-actions-section {
           grid-column: 1 / -1;
           margin-bottom: 1rem;
        }
        
        .quick-actions-grid {
           display: grid;
           grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
           gap: 1rem;
        }

        .quick-action-card {
           background: white;
           padding: 1.25rem;
           border-radius: var(--radius-md);
           border: 1px solid var(--border-color);
           display: flex;
           flex-direction: column;
           align-items: center;
           gap: 0.75rem;
           cursor: pointer;
           transition: transform 0.2s, box-shadow 0.2s;
           box-shadow: var(--shadow-sm);
        }
        
        .quick-action-card:hover {
           transform: translateY(-3px);
           box-shadow: var(--shadow-md);
        }

        .action-icon { font-size: 2rem; }
        .action-label { font-weight: 700; color: var(--text-primary); font-size: 0.95rem; }

        .dashboard-left, .dashboard-center, .dashboard-right {
           display: flex;
           flex-direction: column;
           gap: 1.5rem;
        }
        
        @media (max-width: 1200px) {
           .production-dashboard {
              grid-template-columns: 300px 1fr;
           }
           .dashboard-right {
              grid-column: 1 / -1;
              display: grid;
              grid-template-columns: repeat(3, 1fr);
           }
        }

        @media (max-width: 900px) {
           .production-dashboard {
              grid-template-columns: 1fr;
           }
           .dashboard-right {
              grid-template-columns: 1fr;
           }
           /* Mobile-First Stack */
           .quick-actions-grid {
              grid-template-columns: repeat(2, 1fr); /* 2x2 grid on mobile */
           }
        }
      `}</style>
      
      <div style={{ gridColumn: '1 / -1' }}>
        <Hero3D />
      </div>

      <div className="quick-actions-section">
         <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', background: '#FF6B35', borderRadius: '50%', display: 'inline-block' }}></span>
            Operational Command
         </h3>
         <QuickActions onNavigate={onNavigate} />
      </div>
      
      <div className="dashboard-left">
        <ProductionCalendar 
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
        <ScheduleList />
      </div>
      
      <div className="dashboard-center">
        <LocationMap />
        <BudgetStats />
      </div>
      
      <div className="dashboard-right">
        <ProjectHealth />
        <CrewWidget />
        <ActivityHeatmap />
      </div>
    </div>
  )
}

export default ProductionDashboard
