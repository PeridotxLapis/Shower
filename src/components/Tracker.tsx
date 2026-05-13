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
    <div className="min-h-screen bg-transparent p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            Shower Tracker
          </h1>
        </div>

        {/* Mode Selection */}
        {!isTracking && (
          <div className="backdrop-blur-md bg-white/20 border border-white/40 rounded-2xl p-8 mb-8 shadow-xl">
            <div className="grid grid-cols-3 gap-4">
              {(['Bath', 'Shower', 'Both'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => startSession(m)}
                  className="py-5 px-4 bg-white/40 hover:bg-white/50 text-white font-bold rounded-xl backdrop-blur border border-white/50 transition drop-shadow-lg text-lg"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Session */}
        {isTracking && (
          <div className="backdrop-blur-md bg-white/20 border border-white/40 rounded-2xl p-8 mb-8 shadow-xl">
            <div className="text-center">
              <p className="text-white text-lg drop-shadow font-bold mb-4">
                Current Session
              </p>
              <p className="text-white drop-shadow mb-2 font-semibold text-xl">
                {mode}
              </p>
              <p className="text-white/90 drop-shadow mb-2 font-semibold">
                Start Time: {formatTimeOnly(startTime?.toISOString() || '')}
              </p>
              <p className="text-white/90 drop-shadow mb-6 font-semibold">
                {new Date().toLocaleDateString('en-US', {
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
                className="w-full py-4 bg-green-500/60 hover:bg-green-600/70 text-white font-bold rounded-lg transition drop-shadow-lg text-lg"
              >
                Finish
              </button>
            </div>
          </div>
        )}

        {/* History */}
        <div className="backdrop-blur-md bg-white/20 border border-white/40 rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white drop-shadow mb-6 text-center">History</h2>

          {sessions.length === 0 ? (
            <p className="text-white/90 text-center drop-shadow font-semibold">No sessions yet. Start tracking!</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between bg-white/30 hover:bg-white/40 border border-white/30 rounded-lg p-4 transition"
                >
                  <div className="flex-1">
                    <p className="text-white font-bold drop-shadow">
                      {formatDate(session.start_time)}
                    </p>
                    <p className="text-white/95 drop-shadow text-sm font-semibold">
                      {session.mode}
                    </p>
                    <p className="text-white/80 drop-shadow text-xs">
                      {formatTimeOnly(session.start_time)} - {formatTimeOnly(session.end_time || '')}
                    </p>
                    <p className="text-white font-semibold drop-shadow mt-1">
                      Duration: {formatTime(session.duration_seconds || 0)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteSession(session.id)}
                    className="ml-4 p-2 hover:bg-red-600/40 rounded-lg transition text-red-100 hover:text-white"
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
