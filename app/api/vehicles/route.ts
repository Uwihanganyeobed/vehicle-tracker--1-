import { type NextRequest, NextResponse } from "next/server"
import { vehicleTable } from "@/lib/sqlite"

// GET /api/vehicles - Get all vehicles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    let filteredVehicles = vehicleTable.all({ status: status || undefined, search: search || undefined })

    // Filter by status
    if (status && status !== "all") {
      filteredVehicles = filteredVehicles.filter((vehicle) => vehicle.status === status)
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase()
      filteredVehicles = filteredVehicles.filter(
        (vehicle) =>
          vehicle.name.toLowerCase().includes(searchLower) ||
          vehicle.driver.toLowerCase().includes(searchLower) ||
          vehicle.licensePlate.toLowerCase().includes(searchLower) ||
          vehicle.make.toLowerCase().includes(searchLower) ||
          vehicle.model.toLowerCase().includes(searchLower),
      )
    }

    return NextResponse.json({ success: true, data: filteredVehicles, total: filteredVehicles.length })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch vehicles" }, { status: 500 })
  }
}

// POST /api/vehicles - Create new vehicle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const created = vehicleTable.create(body)
    return NextResponse.json({ success: true, data: created, message: "Vehicle created successfully" }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create vehicle" }, { status: 500 })
  }
}
