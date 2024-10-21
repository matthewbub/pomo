'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PomodoroTimerComponent() {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isWork, setIsWork] = useState(true)
  const [showCompletion, setShowCompletion] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    let completionTimeout: NodeJS.Timeout | null = null

    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1)
        } else if (minutes > 0) {
          setMinutes(minutes - 1)
          setSeconds(59)
        } else {
          clearInterval(interval)
          setIsActive(false)
          setShowCompletion(true)
          completionTimeout = setTimeout(() => {
            setShowCompletion(false)
            setIsWork(!isWork)
            setMinutes(isWork ? 5 : 25)
            setSeconds(0)
          }, 3000)
        }
      }, 1000)
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
      if (completionTimeout) clearTimeout(completionTimeout)
    }
  }, [isActive, minutes, seconds, isWork])

  useEffect(() => {
    let title = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} - ${isWork ? 'Work' : 'Break'}`
    if (showCompletion) {
      title = isWork ? 'Break Time!' : 'Work Time!'
    }
    document.title = title
  }, [minutes, seconds, isWork, showCompletion])

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setMinutes(25)
    setSeconds(0)
    setIsWork(true)
    setShowCompletion(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {isWork ? 'Work Session' : 'Break Time'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="text-6xl font-bold">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="flex space-x-2">
          <Button onClick={toggleTimer}>
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={resetTimer} variant="outline">
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}