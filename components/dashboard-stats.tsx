"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, MapPin, Fuel, Clock, RefreshCw } from "lucide-react"
import { analyticsApi } from "@/lib/api"

export function DashboardStats() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>("")

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsApi.get()
      if (response.success && response.data) {
        setStats(response.data.summary)
        setLastUpdate(new Date().toLocaleTimeString())
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()

    // Refresh analytics every 2 minutes
    const interval = setInterval(fetchAnalytics, 120000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center h-24">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statsData = [
    {
      title: "Total Vehicles",
      value: stats.totalVehicles.toString(),
      change: `${stats.activeVehicles} active`,
      icon: Car,
      color: "text-primary",
    },
    {
      title: "Active Routes",
      value: stats.activeVehicles.toString(),
      change: `${stats.inactiveVehicles} inactive`,
      icon: MapPin,
      color: "text-accent",
    },
    {
      title: "Avg Fuel Level",
      value: `${stats.avgFuel}%`,
      change: `${stats.maintenanceVehicles} in maintenance`,
      icon: Fuel,
      color: "text-chart-2",
    },
    {
      title: "Avg Speed",
      value: `${stats.avgSpeed} mph`,
      change: `${stats.totalDistance} km today`,
      icon: Clock,
      color: "text-chart-4",
    },
  ]

  return (
    <div className="space-y-4">
      {lastUpdate && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span>Analytics updated: {lastUpdate}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
