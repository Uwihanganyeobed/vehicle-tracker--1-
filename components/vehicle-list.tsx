"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Car, MapPin, Fuel, Gauge, Search, RefreshCw } from "lucide-react"
import { vehicleApi, type Vehicle } from "@/lib/api"

export function VehicleList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "maintenance">("all")
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>("")

  const fetchVehicles = async () => {
    try {
      setIsRefreshing(true)
      const response = await vehicleApi.getAll({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchTerm || undefined,
      })

      if (response.success && response.data) {
        setVehicles(response.data)
        setLastUpdate(new Date().toLocaleTimeString())
      }
    } catch (error) {
      console.error("Failed to fetch vehicles:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [statusFilter, searchTerm])

  useEffect(() => {
    const interval = setInterval(fetchVehicles, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [statusFilter, searchTerm])

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleTrackVehicle = (vehicleId: string) => {
    // Call the global function exposed by the map component
    if ((window as any).selectVehicle) {
      ;(window as any).selectVehicle(vehicleId)
    }
  }

  const getTimeAgo = (lastUpdate: string) => {
    const now = new Date()
    const updateTime = new Date(lastUpdate)
    const diffMs = now.getTime() - updateTime.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} min ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return updateTime.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Loading vehicles...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Fleet Vehicles ({filteredVehicles.length})
          </CardTitle>
          <Button size="sm" variant="outline" onClick={fetchVehicles} disabled={isRefreshing}>
            {isRefreshing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>

        {lastUpdate && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span>Last updated: {lastUpdate}</span>
          </div>
        )}

        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All
            </Button>
            <Button
              variant={statusFilter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("active")}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === "inactive" ? "outline" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("inactive")}
            >
              Inactive
            </Button>
            <Button
              variant={statusFilter === "maintenance" ? "outline" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("maintenance")}
            >
              Maintenance
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle.id} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-medium text-sm">{vehicle.name}</h3>
                <p className="text-xs text-muted-foreground">{vehicle.driver}</p>
                <p className="text-xs text-muted-foreground">{vehicle.route}</p>
              </div>
              <Badge
                variant={vehicle.status === "active" ? "default" : "secondary"}
                className={
                  vehicle.status === "active" ? "bg-primary" : vehicle.status === "maintenance" ? "bg-destructive" : ""
                }
              >
                {vehicle.status}
              </Badge>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{vehicle.location}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Gauge className="w-3 h-3" />
                  <span>{Math.round(vehicle.speed)} mph</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Fuel className="w-3 h-3" />
                  <span>{Math.round(vehicle.fuel)}%</span>
                </div>
              </div>

              <p className="text-muted-foreground">{getTimeAgo(vehicle.lastUpdate)}</p>

              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2 bg-transparent"
                onClick={() => handleTrackVehicle(vehicle.id)}
              >
                <MapPin className="w-3 h-3 mr-2" />
                Track on Map
              </Button>
            </div>
          </div>
        ))}

        {filteredVehicles.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No vehicles found</p>
            <p className="text-sm">Try adjusting your search or filter</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
