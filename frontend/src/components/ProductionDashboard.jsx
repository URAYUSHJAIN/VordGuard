import React, { useState, useEffect } from 'react'
import Hero3D from './Hero3D'

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
  )
}

function LocationMap() {
  const rows = 8
  const cols = 12
  const locationGrid = []
  
  const getZoneStatus = (row, col) => {
    const centerCol = cols / 2
    const distFromCenter = Math.abs(col - centerCol)
    const maxInRow = Math.max(2, Math.floor((rows - row) * 1.2))
    
    if (distFromCenter > maxInRow + 2) return 'hidden'
    
    const rand = (row * cols + col) % 10
    if (rand < 4) return 'available'
    if (rand < 7) return 'pending'
    return 'booked'
  }
  
  for (let r = 0; r < rows; r++) {
    const rowCells = []
    for (let c = 0; c < cols; c++) {
      rowCells.push({
        row: r,
        col: c,
        status: getZoneStatus(r, c)
      })
    }
    locationGrid.push(rowCells)
  }
  
  return (
    <div className="location-map">
      <div className="map-header">
        <h3>AI Location Scout <span className="dropdown-arrow">▼</span></h3>
        <button className="map-menu">•••</button>
      </div>
      
      <div className="map-screen">
        <div className="screen-label">Main Stage</div>
        <div className="screen-curve"></div>
      </div>
      
      <div className="map-grid">
        {locationGrid.map((row, rIdx) => (
          <div key={rIdx} className="map-row">
            {row.map((cell, cIdx) => (
              <div 
                key={cIdx}
                className={`map-cell ${cell.status}`}
              />
            ))}
          </div>
        ))}
      </div>
      
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-dot available"></span>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot pending"></span>
          <span>Pending</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot booked"></span>
          <span>Booked</span>
        </div>
      </div>
    </div>
  )
}

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
    <div className="budget-stats">
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
    { id: 'crisis', icon: '🚨', label: 'Report Crisis', color: '#FF6B35' },
    { id: 'scene-risk', icon: '📊', label: 'Scene Risk', color: '#4ECDC4' },
    { id: 'set-planner', icon: '🎬', label: 'Set Planner', color: '#45B7D1' },
    { id: 'shot-list', icon: '🤖', label: 'Shot List AI', color: '#96CEB4' },
  ]
  
  return (
    <div className="quick-actions">
      {actions.map(action => (
        <button 
          key={action.id}
          className="quick-action-btn"
          onClick={() => onNavigate(action.id)}
          style={{ '--action-color': action.color }}
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
      <div style={{ gridColumn: '1 / -1' }}>
        <Hero3D />
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
        <CrewWidget />
        <ActivityHeatmap />
        <ProjectHealth />
      </div>
    </div>
  )
}

export default ProductionDashboard
