"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Coffee } from "lucide-react";

type Session = {
  duration: number;
  type: "work" | "break";
};

export function EnhancedPomodoroTimerComponent() {
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem("pomodoro-sessions");
    return saved
      ? JSON.parse(saved)
      : [
          { duration: 25, type: "work" },
          { duration: 5, type: "break" },
          { duration: 25, type: "work" },
          { duration: 5, type: "break" },
          { duration: 25, type: "work" },
          { duration: 30, type: "break" },
        ];
  });
  const [currentSessionIndex, setCurrentSessionIndex] = useState(() => {
    const saved = localStorage.getItem("pomodoro-current-index");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [minutes, setMinutes] = useState(() => {
    const saved = localStorage.getItem("pomodoro-minutes");
    return saved ? parseInt(saved, 10) : sessions[0].duration;
  });
  const [seconds, setSeconds] = useState(() => {
    const saved = localStorage.getItem("pomodoro-seconds");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isActive, setIsActive] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedScene, setSelectedScene] = useState(() => {
    const saved = localStorage.getItem("pomodoro-scene");
    return saved || "desert";
  });

  useEffect(() => {
    localStorage.setItem("pomodoro-sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(
      "pomodoro-current-index",
      currentSessionIndex.toString()
    );
  }, [currentSessionIndex]);

  useEffect(() => {
    localStorage.setItem("pomodoro-minutes", minutes.toString());
  }, [minutes]);

  useEffect(() => {
    localStorage.setItem("pomodoro-seconds", seconds.toString());
  }, [seconds]);

  useEffect(() => {
    localStorage.setItem("pomodoro-scene", selectedScene);
  }, [selectedScene]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          const nextIndex = (currentSessionIndex + 1) % sessions.length;
          setCurrentSessionIndex(nextIndex);
          setMinutes(sessions[nextIndex].duration);
          setSeconds(0);
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds, currentSessionIndex, sessions]);

  useEffect(() => {
    const currentSession = sessions[currentSessionIndex];
    const title = `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")} - ${currentSession.type === "work" ? "Work" : "Break"}`;
    document.title = title;
  }, [minutes, seconds, currentSessionIndex, sessions]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setCurrentSessionIndex(0);
    setMinutes(sessions[0].duration);
    setSeconds(0);
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomInput(e.target.value);
  };

  const applyCustomFlow = () => {
    const pattern = /^(\d+[wb]\s*)+$/;
    if (!pattern.test(customInput.trim())) {
      setErrorMessage(
        "Invalid input format. Please use the format '25w 5b 25w 5b 25w 30b'."
      );
      return;
    }

    setErrorMessage(""); // Clear any previous error message

    const newSessions = customInput
      .trim()
      .split(/\s+/)
      .map((item) => {
        const duration = parseInt(item.slice(0, -1), 10);
        const type = item.slice(-1) === "w" ? "work" : "break";
        return { duration, type } as Session;
      });

    if (newSessions.length > 0) {
      setSessions(newSessions);
      setCurrentSessionIndex(0);
      setMinutes(newSessions[0].duration);
      setSeconds(0);
      setIsActive(false);
    }
  };

  const renderFlowVisualization = () => {
    return (
      <div className="flex items-center space-x-1 overflow-x-auto pb-2">
        {sessions.map((session, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-full ${
                index === currentSessionIndex
                  ? "bg-primary text-primary-foreground"
                  : session.type === "work"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {session.type === "work" ? (
                <Clock className="w-6 h-6" />
              ) : (
                <Coffee className="w-6 h-6" />
              )}
            </div>
            <span className="text-xs mt-1">{session.duration}m</span>
            {index < sessions.length - 1 && (
              <div className="h-0.5 w-4 bg-muted mt-2"></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 my-10">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {sessions[currentSessionIndex].type === "work"
              ? "Work Session"
              : "Break Time"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="text-6xl font-bold">
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </div>
          <div className="flex space-x-2">
            <Button onClick={toggleTimer}>
              {isActive ? "Pause" : "Start"}
            </Button>
            <Button onClick={resetTimer} variant="outline">
              Reset
            </Button>
          </div>
          <div className="w-full space-y-2">
            <Label htmlFor="custom-flow">Custom Flow</Label>
            <div className="flex space-x-2">
              <Input
                id="custom-flow"
                value={customInput}
                onChange={handleCustomInputChange}
                placeholder="25w 5b 25w 5b 25w 30b"
              />
              <Button onClick={applyCustomFlow}>Apply</Button>
            </div>
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Format: [number]w for work, [number]b for break (e.g., 25w 5b 25w
              5b 25w 30b). Use spaces between each session.
            </p>
          </div>
          <div className="w-full">
            <h3 className="font-semibold mb-2">Current Flow:</h3>
            {renderFlowVisualization()}
          </div>
          <div className="w-full text-xs text-muted-foreground">
            <p>
              Key: Clock icon represents work sessions, coffee icon represents
              breaks. Numbers show duration in minutes.
            </p>
          </div>
        </CardContent>
      </Card>
      {/* <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Scene Picker</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedScene} onValueChange={setSelectedScene}>
            {scenes.map((scene) => (
              <div key={scene.id} className="flex items-center space-x-2">
                <RadioGroupItem value={scene.id} id={scene.id} />
                <Label htmlFor={scene.id}>{scene.name}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card> */}
    </div>
  );
}
