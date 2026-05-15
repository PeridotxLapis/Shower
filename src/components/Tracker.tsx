import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

type BathingSession = {
  id: string;
  mode: 'Bath' | 'Shower' | 'Both';
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
};

const STORAGE_KEY = 'bathing_sessions';

export function Tracker() {
  const [mode, setMode] = useState<'Bath' | 'Shower' | 'Both' | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [sessions, setSessions] = useState<BathingSession[]>([]);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        if (startTime) {
          setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isTracking, startTime]);

  const loadSessions = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSessions(JSON.parse(stored));
      } catch {
        setSessions([]);
      }
    }
  };

  const saveSessions = (updatedSessions: BathingSession[]) => {
    setSessions(updatedSessions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
  };

  const startSession = (selectedMode: 'Bath' | 'Shower' | 'Both') => {
    setMode(selectedMode);
    setStartTime(new Date());
    setElapsed(0);
    setIsTracking(true);
  };

  const finishSession = () => {
    if (!mode || !startTime) return;

    const endTime = new Date();
    const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    const newSession: BathingSession = {
      id: crypto.randomUUID(),
      mode,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_seconds: durationSeconds,
    };

    const updatedSessions = [newSession, ...sessions];
    saveSessions(updatedSessions);

    setIsTracking(false);
    setMode(null);
    setStartTime(null);
    setElapsed(0);
  };

  const deleteSession = (id: string) => {
    const updatedSessions = sessions.filter((session) => session.id !== id);
    saveSessions(updatedSessions);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTimeOnly = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', margin: 0, overflow: 'hidden', background: 'transparent', backgroundColor: 'transparent' }}>
      <div style={{ width: '100%', maxWidth: '600px', background: 'transparent', backgroundColor: 'transparent' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#333', textShadow: '0 2px 8px rgba(255, 255, 255, 0.9)' }}>
            Shower Tracker
          </h1>
        </div>

        {/* Mode Selection */}
        {!isTracking && (
          <div style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '1.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {(['Bath', 'Shower', 'Both'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => startSession(m)}
                  style={{ padding: '1rem 0.75rem', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.3)', color: '#333', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s', textShadow: '0 1px 3px rgba(255, 255, 255, 0.5)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Session */}
        {isTracking && (
          <div style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '1.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <p style={{ color: '#333', fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', textShadow: '0 1px 3px rgba(255, 255, 255, 0.5)' }}>
              Current Session
            </p>
            <p style={{ color: '#333', fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '0.5rem', textShadow: '0 1px 3px rgba(255, 255, 255, 0.5)' }}>
              {mode}
            </p>
            <p style={{ color: '#555', fontWeight: '500', marginBottom: '0.5rem', textShadow: '0 1px 2px rgba(255, 255, 255, 0.4)' }}>
              Start Time: {formatTimeOnly(startTime?.toISOString() || '')}
            </p>
            <p style={{ color: '#555', fontWeight: '500', marginBottom: '1.5rem', textShadow: '0 1px 2px rgba(255, 255, 255, 0.4)' }}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>

            <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#333', marginBottom: '2rem', fontFamily: 'monospace', textShadow: '0 2px 6px rgba(255, 255, 255, 0.7)' }}>
              {formatTime(elapsed)}
            </div>

            <button
              onClick={finishSession}
              style={{ width: '100%', padding: '1rem', background: 'rgba(34, 197, 94, 0.3)', color: '#333', fontWeight: 'bold', borderRadius: '0.5rem', border: '1px solid rgba(34, 197, 94, 0.5)', cursor: 'pointer', fontSize: '1rem', transition: 'all 0.3s', textShadow: '0 1px 3px rgba(255, 255, 255, 0.5)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.4)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.3)'}
            >
              Finish
            </button>
          </div>
        )}

        {/* History */}
        <div style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '1.5rem', padding: '1.5rem', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', marginBottom: '1.5rem', textAlign: 'center', textShadow: '0 1px 3px rgba(255, 255, 255, 0.5)' }}>History</h2>

          {sessions.length === 0 ? (
            <p style={{ color: '#555', textAlign: 'center', fontWeight: '500', textShadow: '0 1px 2px rgba(255, 255, 255, 0.4)' }}>No sessions yet. Start tracking!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
              {sessions.map((session) => (
                <div
                  key={session.id}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.5rem', padding: '1rem', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#333', fontWeight: 'bold', textShadow: '0 1px 2px rgba(255, 255, 255, 0.4)' }}>
                      {formatDate(session.start_time)}
                    </p>
                    <p style={{ color: '#333', fontSize: '0.875rem', fontWeight: '600', textShadow: '0 1px 2px rgba(255, 255, 255, 0.3)' }}>
                      {session.mode}
                    </p>
                    <p style={{ color: '#666', fontSize: '0.75rem', textShadow: '0 1px 2px rgba(255, 255, 255, 0.2)' }}>
                      {formatTimeOnly(session.start_time)} - {formatTimeOnly(session.end_time || '')}
                    </p>
                    <p style={{ color: '#333', fontWeight: '600', marginTop: '0.25rem', textShadow: '0 1px 2px rgba(255, 255, 255, 0.4)' }}>
                      Duration: {formatTime(session.duration_seconds || 0)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteSession(session.id)}
                    style={{ marginLeft: '1rem', padding: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#dc2626', transition: 'all 0.3s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#991b1b'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#dc2626'}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
