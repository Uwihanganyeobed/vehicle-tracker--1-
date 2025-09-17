"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Play, Square, Shield } from "lucide-react"

export default function TrackerPage() {
  const [vehicleId, setVehicleId] = useState("VH001")
  const [token, setToken] = useState("")
  const [tracking, setTracking] = useState(false)
  const [lastStatus, setLastStatus] = useState<string>("")
  const watchIdRef = useRef<number | null>(null)

  useEffect(() => {
    // Load cached settings
    const v = localStorage.getItem("tracker_vehicleId")
    const t = localStorage.getItem("tracker_token")
    if (v) setVehicleId(v)
    if (t) setToken(t)
  }, [])

  const sendUpdate = async (pos: GeolocationPosition) => {
    const { latitude, longitude, speed, heading } = pos.coords
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/location`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ lat: latitude, lng: longitude, speed: speed ?? 0, heading: heading ?? 0 }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || "Failed")
      setLastStatus(`Updated ${new Date().toLocaleTimeString()}`)
    } catch (e: any) {
      setLastStatus(`Error: ${e.message}`)
    }
  }

  const startTracking = () => {
    if (!navigator.geolocation) {
      setLastStatus("Geolocation not supported")
      return
    }
    localStorage.setItem("tracker_vehicleId", vehicleId)
    localStorage.setItem("tracker_token", token)
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        void sendUpdate(pos)
      },
      (err) => setLastStatus(`GPS error: ${err.message}`),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    )
    watchIdRef.current = id
    setTracking(true)
  }

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setTracking(false)
  }

  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <Card className="w-full max-w-md p-6 space-y-4">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5" /> Phone Tracker
        </h1>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="vehicleId">Vehicle ID</Label>
            <Input id="vehicleId" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="token" className="flex items-center gap-2">
              <Shield className="w-4 h-4" /> Token (optional if TRACK_TOKEN unset)
            </Label>
            <Input id="token" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Enter tracking token" />
          </div>
        </div>
        <div className="flex gap-2">
          {!tracking ? (
            <Button className="flex-1" onClick={startTracking}>
              <Play className="w-4 h-4 mr-2" /> Start
            </Button>
          ) : (
            <Button className="flex-1" variant="outline" onClick={stopTracking}>
              <Square className="w-4 h-4 mr-2" /> Stop
            </Button>
          )}
        </div>
        {lastStatus && <p className="text-sm text-muted-foreground">{lastStatus}</p>}
        <p className="text-xs text-muted-foreground">Open this page on your phone to stream GPS to the server.</p>
      </Card>
    </div>
  )
}


