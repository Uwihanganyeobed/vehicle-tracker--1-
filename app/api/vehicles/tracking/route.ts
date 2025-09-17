import { type NextRequest, NextResponse } from "next/server"
import { vehicleTable } from "@/lib/sqlite"

// GET /api/vehicles/tracking - Get real-time tracking data
export async function GET(request: NextRequest) {
  try {
    const vehicles = vehicleTable.all()
    const trackingData = vehicles.map((vehicle) => ({
      id: vehicle.id,
      name: vehicle.name,
      lat: vehicle.lat,
      lng: vehicle.lng,
      speed: vehicle.speed,
      heading: vehicle.heading,
      status: vehicle.status,
      fuel: vehicle.fuel,
      driver: vehicle.driver,
      lastUpdate: vehicle.lastUpdate,
    }))

    return NextResponse.json({ success: true, data: trackingData, timestamp: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch tracking data" }, { status: 500 })
  }
}
