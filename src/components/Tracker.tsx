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
    <div
      className="min-h-screen p-4 md:p-8"
      style={{
        backgroundImage: 'url(/f3a79899-1828-4224-9a11-880d2baf304e.png)',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            Bathing Tracker
          </h1>
        </div>

        {/* Mode Selection */}
        {!isTracking && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {(['Bath', 'Shower', 'Both'] as const).map((m) => (
              <button
                key={m}
                onClick={() => startSession(m)}
                className="py-4 px-3 bg-gradient-to-br from-teal-400/60 to-blue-500/60 hover:from-teal-500/70 hover:to-blue-600/70 text-white font-bold rounded-xl backdrop-blur border border-white/30 transition drop-shadow-lg text-lg"
              >
                {m}
              </button>
            ))}
          </div>
        )}

        {/* Active Session */}
        {isTracking && (
          <div className="backdrop-blur-md bg-white/15 border border-white/40 rounded-2xl p-8 mb-8 shadow-xl">
            <div className="text-center">
              <p className="text-white/90 text-lg drop-shadow font-semibold mb-2">
                Current Session
              </p>
              <p className="text-white drop-shadow mb-1 font-semibold">
                Mode: <span className="font-bold text-xl">{mode}</span>
              </p>
              <p className="text-white/90 drop-shadow mb-4 font-semibold">
                Start Time: {formatTimeOnly(startTime?.toISOString() || '')}
              </p>
              <p className="text-white/90 drop-shadow mb-6 font-semibold">
                Today: {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>

              <div className="text-6xl font-bold text-white drop-shadow mb-8 font-mono">
                {formatTime(elapsed)}
              </div>

              <button
                onClick={finishSession}
                className="w-full py-4 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold rounded-lg transition drop-shadow-lg text-lg"
              >
                Finish
              </button>
            </div>
          </div>
        )}

        {/* History */}
        <div className="backdrop-blur-md bg-white/15 border border-white/40 rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white drop-shadow mb-6">History</h2>

          {sessions.length === 0 ? (
            <p className="text-white/80 text-center drop-shadow">No sessions yet. Start tracking!</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg p-4 transition"
                >
                  <div className="flex-1">
                    <p className="text-white font-bold drop-shadow">
                      {formatDate(session.start_time)}
                    </p>
                    <p className="text-white/90 drop-shadow text-sm">
                      {session.mode}
                    </p>
                    <p className="text-white/80 drop-shadow text-xs">
                      {formatTimeOnly(session.start_time)} - {formatTimeOnly(session.end_time || '')}
                    </p>
                    <p className="text-teal-300 drop-shadow font-semibold">
                      Duration: {formatTime(session.duration_seconds || 0)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteSession(session.id)}
                    className="ml-4 p-2 hover:bg-red-500/40 rounded-lg transition text-red-300 hover:text-red-100"
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
