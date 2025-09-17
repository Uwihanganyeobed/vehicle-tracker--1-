import { type NextRequest, NextResponse } from "next/server"

// Mock analytics data
const generateAnalytics = () => {
  const now = new Date()
  const vehicles = [
    { id: "VH001", status: "active", speed: 45, fuel: 78 },
    { id: "VH002", status: "inactive", speed: 0, fuel: 45 },
    { id: "VH003", status: "active", speed: 32, fuel: 92 },
    { id: "VH004", status: "maintenance", speed: 0, fuel: 67 },
  ]

  const totalVehicles = vehicles.length
  const activeVehicles = vehicles.filter((v) => v.status === "active").length
  const inactiveVehicles = vehicles.filter((v) => v.status === "inactive").length
  const maintenanceVehicles = vehicles.filter((v) => v.status === "maintenance").length

  const avgSpeed = vehicles.reduce((sum, v) => sum + v.speed, 0) / totalVehicles
  const avgFuel = vehicles.reduce((sum, v) => sum + v.fuel, 0) / totalVehicles

  // Generate hourly data for the last 24 hours
  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000)
    return {
      hour: hour.getHours(),
      activeVehicles: Math.floor(Math.random() * totalVehicles) + 1,
      avgSpeed: Math.floor(Math.random() * 50) + 20,
      fuelConsumption: Math.floor(Math.random() * 10) + 5,
    }
  })

  return {
    summary: {
      totalVehicles,
      activeVehicles,
      inactiveVehicles,
      maintenanceVehicles,
      avgSpeed: Math.round(avgSpeed),
      avgFuel: Math.round(avgFuel),
      totalDistance: Math.floor(Math.random() * 1000) + 500,
      avgResponseTime: Math.floor(Math.random() * 15) + 5,
    },
    hourlyData,
    vehicleStatus: [
      { status: "Active", count: activeVehicles, color: "#059669" },
      { status: "Inactive", count: inactiveVehicles, color: "#6b7280" },
      { status: "Maintenance", count: maintenanceVehicles, color: "#ea580c" },
    ],
  }
}

// GET /api/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const analytics = generateAnalytics()

    return NextResponse.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch analytics data" }, { status: 500 })
  }
}
