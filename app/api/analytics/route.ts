import { type NextRequest, NextResponse } from "next/server"
import { vehicleTable } from "@/lib/sqlite"

// GET /api/analytics - Get analytics data from live store
export async function GET(request: NextRequest) {
  try {
    const vehicles = vehicleTable.all()
    const totalVehicles = vehicles.length
    const activeVehicles = vehicles.filter((v) => v.status === "active").length
    const inactiveVehicles = vehicles.filter((v) => v.status === "inactive").length
    const maintenanceVehicles = vehicles.filter((v) => v.status === "maintenance").length
    const avgSpeed = totalVehicles ? vehicles.reduce((s, v) => s + (v.speed || 0), 0) / totalVehicles : 0
    const avgFuel = totalVehicles ? vehicles.reduce((s, v) => s + (v.fuel || 0), 0) / totalVehicles : 0

    const now = new Date()
    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000)
      return {
        hour: hour.getHours(),
        activeVehicles,
        avgSpeed: Math.round(avgSpeed),
        fuelConsumption: Math.max(0, Math.round(avgSpeed / 10 + i % 5)),
      }
    })

    const analytics = {
      summary: {
        totalVehicles,
        activeVehicles,
        inactiveVehicles,
        maintenanceVehicles,
        avgSpeed: Math.round(avgSpeed),
        avgFuel: Math.round(avgFuel),
        totalDistance: Math.round(avgSpeed * activeVehicles * 2),
        avgResponseTime: 5,
      },
      hourlyData,
      vehicleStatus: [
        { status: "Active", count: activeVehicles, color: "#059669" },
        { status: "Inactive", count: inactiveVehicles, color: "#6b7280" },
        { status: "Maintenance", count: maintenanceVehicles, color: "#ea580c" },
      ],
    }

    return NextResponse.json({ success: true, data: analytics, timestamp: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch analytics data" }, { status: 500 })
  }
}
