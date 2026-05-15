import React, { useState, useEffect } from 'react';
import { ShowerHead, Bath, Clock, Trash2 } from 'lucide-react';

export default function Tracker() {
  const [currentMode, setCurrentMode] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('shower_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    let interval;
    if (currentMode) {
      interval = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [currentMode]);

  const startSession = (mode) => {
    setCurrentMode(mode);
    setStartTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const endSession = () => {
    if (!currentMode || !startTime) return;
    const endTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const duration = Math.floor(elapsedTime / 60);
    const date = new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    
    const newEntry = { id: Date.now(), mode: currentMode, start: startTime, end: endTime, duration, date };
    const updated = [newEntry, ...history];
    setHistory(updated);
    localStorage.setItem('shower_history', JSON.stringify(updated));
    setCurrentMode(null);
    setStartTime(null);
  };

  const deleteEntry = (id) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('shower_history', JSON.stringify(updated));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return ${mins}:${secs < 10 ? '0' : ''}${secs};
  };

  return (
    <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'start', padding: '2rem', margin: 0, background: 'transparent' }}>
      <div style={{ width: '100%', maxWidth: '500px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '1rem', padding: '2rem', textAlign: 'center', marginTop: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111' }}>Shower Tracker</h1>
        
        {!currentMode ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
            <button onClick={() => startSession('Bath')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.4)', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: '600' }}><Bath style={{ marginBottom: '0.25rem' }} />Bath</button>
            <button onClick={() => startSession('Shower')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.4)', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: '600' }}><ShowerHead style={{ marginBottom: '0.25rem' }} />Shower</button>
            <button onClick={() => startSession('Both')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.4)', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: '600' }}><Clock style={{ marginBottom: '0.25rem' }} />Both</button>
          </div>
        ) : (
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.3)', borderRadius: '0.75rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', color: '#444', marginBottom: '0.25rem' }}>Active {currentMode}</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', fontFamily: 'monospace', marginBottom: '0.5rem' }}>{formatTime(elapsedTime)}</p>
            <p style={{ fontSize: '0.75rem', color: '#444', marginBottom: '1rem' }}>Started at {startTime}</p>
            <button onClick={endSession} style={{ w: '100%', padding: '0.75rem', background: 'rgba(239,68,68,0.8), color: 'white', fontWeight: 'bold', borderRadius: '0.75rem', border: 'none', cursor: 'pointer' }}>Finish Session</button>
          </div>
        )}
      </div>

      <div style={{ width: '100%', maxWidth: '500px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '1rem', padding: '2rem', marginTop: '1.5rem', flex: 1, overflowY: 'auto', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '0.5rem', color: '#111' }}>History</h2>
        {history.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: '#444', textAlign: 'center', padding: '1rem 0' }}>No sessions yet. Start tracking!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {history.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', padding: '0.75rem', background: 'rgba(255,255,255,0.2)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{item.mode} ({item.duration} mins)</p>
                  <p style={{ fontSize: '0.75rem', color: '#444' }}>{item.date} | {item.start} - {item.end}</p>
                </div>
                <button onClick={() => deleteEntry(item.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#444', padding: '0.5rem' }}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
