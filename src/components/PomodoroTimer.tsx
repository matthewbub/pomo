"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";

export default function PomodoroTimer() {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(5);
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState(50);
  const [cyclesCompleted, setCyclesCompleted] = useState(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem("pomodoroCycles") || "0", 10);
    }
    return 0;
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.play();
    }
  };
  useEffect(() => {
    audioRef.current = new Audio("/success-1-6297.mp3");
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          if (interval) clearInterval(interval);
          setIsPaused(true);
          if (!isMuted && audioRef.current) {
            playAudio();
          }
          const newCyclesCompleted = cyclesCompleted + 1;
          setCyclesCompleted(newCyclesCompleted);
          localStorage.setItem("pomodoroCycles", newCyclesCompleted.toString());
        }
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isPaused, minutes, seconds, isMuted, cyclesCompleted]);

  useEffect(() => {
    const title = isPaused
      ? "Time's up!"
      : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
          2,
          "0"
        )} - Pomodoro`;
    document.title = title;
  }, [minutes, seconds, isPaused]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setMinutes(25);
    setSeconds(0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleKeepGoing = () => {
    resetTimer();
    setIsActive(true);
  };

  const handleTakeBreak = () => {
    setIsPaused(false);
    setMinutes(5);
    setSeconds(0);
    setIsActive(true);
  };

  const handleDone = () => {
    resetTimer();
  };

  const resetCyclesCompleted = () => {
    setCyclesCompleted(0);
    localStorage.setItem("pomodoroCycles", "0");
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
    setIsMuted(newVolume[0] === 0);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {isPaused ? "Time's up!" : "Pomodoro Timer"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {!isPaused ? (
          <>
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
              <Button
                onClick={toggleMute}
                variant="outline"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </div>
            {!isMuted && (
              <div className="w-full flex items-center justify-center space-x-2 px-2 mx-auto">
                <VolumeX className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-[200px]"
                  aria-label="Volume"
                />
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-lg">What would you like to do next?</p>
            <div className="flex space-x-2">
              <Button onClick={handleKeepGoing}>Keep Going</Button>
              <Button onClick={handleTakeBreak} variant="secondary">
                Take a Break
              </Button>
              <Button onClick={handleDone} variant="outline">
                I'm Done
              </Button>
            </div>
          </div>
        )}
        <div className="text-sm text-muted-foreground flex items-center space-x-2">
          <span>Completed Pomodoros: {cyclesCompleted}</span>
          <button
            onClick={resetCyclesCompleted}
            className="text-muted-foreground hover:text-primary"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
