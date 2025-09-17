"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Navigation, Zap, RefreshCw } from "lucide-react"
import { vehicleApi, type TrackingData } from "@/lib/api"

export function VehicleMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())
  const [selectedVehicle, setSelectedVehicle] = useState<TrackingData | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [vehicles, setVehicles] = useState<TrackingData[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>("")

  const fetchVehicleData = async () => {
    try {
      setIsRefreshing(true)
      const response = await vehicleApi.getTracking()
      if (response.success && response.data) {
        setVehicles(response.data)
        setLastUpdate(new Date().toLocaleTimeString())

        // Update map markers if map is loaded
        if (mapInstanceRef.current) {
          updateVehicleMarkers(response.data)
        }
      }
    } catch (error) {
      console.error("Failed to fetch vehicle data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchVehicleData()
    const interval = setInterval(fetchVehicleData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Initialize map only once
  useEffect(() => {
    const initializeMap = async () => {
      if (typeof window !== "undefined" && mapRef.current && !mapInstanceRef.current) {
        const L = (await import("leaflet")).default

        // Fix for default markers in Leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        })

        const map = L.map(mapRef.current).setView([40.7128, -74.006], 12)

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(map)

        mapInstanceRef.current = map
        setMapLoaded(true)
      }
    }

    initializeMap()

    // Cleanup function to remove the map when component unmounts
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        setMapLoaded(false)
      }
    }
  }, []) // Empty dependency array - only run once

  // Update markers when vehicles data changes
  useEffect(() => {
    if (mapInstanceRef.current && vehicles.length > 0 && mapLoaded) {
      updateVehicleMarkers(vehicles)
    }
  }, [vehicles, mapLoaded])

  const createVehicleIcon = (vehicle: TrackingData) => {
    const getMarkerColor = (status: string) => {
      switch (status) {
        case "active":
          return "#059669"
        case "inactive":
          return "#6b7280"
        case "maintenance":
          return "#ea580c"
        default:
          return "#6b7280"
      }
    }

    const color = getMarkerColor(vehicle.status)

    const iconHtml = `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        border: 2px solid white;
        transform: rotate(-45deg);
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 12px;
          font-weight: bold;
        ">🚗</div>
      </div>
    `

    return {
      html: iconHtml,
      className: "custom-vehicle-marker",
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    }
  }

  const createVehicleMarker = async (vehicle: TrackingData) => {
    const L = (await import("leaflet")).default

    const iconConfig = createVehicleIcon(vehicle)
    const customIcon = L.divIcon(iconConfig)

    const marker = L.marker([vehicle.lat, vehicle.lng], { icon: customIcon }).addTo(mapInstanceRef.current)

    const popupContent = `
      <div class="p-3 min-w-[200px]">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold text-sm">${vehicle.name}</h3>
          <span class="px-2 py-1 text-xs rounded-full ${
            vehicle.status === "active"
              ? "bg-green-100 text-green-800"
              : vehicle.status === "maintenance"
                ? "bg-orange-100 text-orange-800"
                : "bg-gray-100 text-gray-800"
          }">${vehicle.status}</span>
        </div>
        <div class="space-y-1 text-xs text-gray-600">
          <div class="flex justify-between">
            <span>Driver:</span>
            <span class="font-medium">${vehicle.driver}</span>
          </div>
          <div class="flex justify-between">
            <span>Speed:</span>
            <span class="font-medium">${Math.round(vehicle.speed)} mph</span>
          </div>
          <div class="flex justify-between">
            <span>Fuel:</span>
            <span class="font-medium">${Math.round(vehicle.fuel)}%</span>
          </div>
          <div class="flex justify-between">
            <span>Last Update:</span>
            <span class="font-medium">${new Date(vehicle.lastUpdate).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    `

    marker.bindPopup(popupContent)

    marker.on("click", () => {
      setSelectedVehicle(vehicle)
    })

    return marker
  }

  const updateVehicleMarkers = async (vehicles: TrackingData[]) => {
    // Clear existing markers
    markersRef.current.forEach((marker) => {
      mapInstanceRef.current.removeLayer(marker)
    })
    markersRef.current.clear()

    // Add new markers
    for (const vehicle of vehicles) {
      const marker = await createVehicleMarker(vehicle)
      markersRef.current.set(vehicle.id, marker)
    }
  }

  const centerOnVehicle = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    if (vehicle && mapInstanceRef.current) {
      mapInstanceRef.current.setView([vehicle.lat, vehicle.lng], 15)

      // Open popup for the vehicle
      const marker = markersRef.current.get(vehicleId)
      if (marker) {
        marker.openPopup()
      }
    }
  }

  const handleFitAllVehicles = async () => {
    if (mapInstanceRef.current && vehicles.length > 0) {
      const L = (await import("leaflet")).default
      const group = new L.featureGroup(Array.from(markersRef.current.values()))
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
    }
  }

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* Map Controls */}
      {mapLoaded && (
        <div className="absolute top-4 right-4 space-y-2">
          <Button
            size="sm"
            onClick={handleFitAllVehicles}
            className="bg-background text-foreground border shadow-sm hover:bg-muted"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Fit All
          </Button>
          <Button
            size="sm"
            onClick={fetchVehicleData}
            disabled={isRefreshing}
            className="bg-background text-foreground border shadow-sm hover:bg-muted"
          >
            {isRefreshing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
            Refresh
          </Button>
        </div>
      )}

      {/* Live Update Status */}
      {lastUpdate && (
        <div className="absolute top-4 left-4">
          <Card className="px-3 py-2 bg-background/95 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-muted-foreground">Last update: {lastUpdate}</span>
            </div>
          </Card>
        </div>
      )}

      {/* Vehicle Info Panel */}
      {selectedVehicle && (
        <Card className="absolute bottom-4 left-4 p-4 min-w-[280px] bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">{selectedVehicle.name}</h3>
            <Button size="sm" variant="ghost" onClick={() => setSelectedVehicle(null)}>
              ×
            </Button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Driver:</span>
              <span>{selectedVehicle.driver}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Speed:</span>
              <span>{Math.round(selectedVehicle.speed)} mph</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fuel:</span>
              <span>{Math.round(selectedVehicle.fuel)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span
                className={`capitalize ${
                  selectedVehicle.status === "active"
                    ? "text-primary"
                    : selectedVehicle.status === "maintenance"
                      ? "text-destructive"
                      : "text-muted-foreground"
                }`}
              >
                {selectedVehicle.status}
              </span>
            </div>
            <Button size="sm" className="w-full mt-2" onClick={() => centerOnVehicle(selectedVehicle.id)}>
              <Navigation className="w-4 h-4 mr-2" />
              Center on Vehicle
            </Button>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground">Loading Map...</p>
            <p className="text-sm text-muted-foreground mt-1">Using OpenStreetMap - completely free!</p>
          </div>
        </div>
      )}
    </div>
  )
}