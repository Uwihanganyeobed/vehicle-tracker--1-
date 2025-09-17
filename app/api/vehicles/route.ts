import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"

// GET /api/vehicles - Get all vehicles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const col = await getCollection("vehicles")
    const query: any = {}
    if (status && status !== "all") query.status = status
    if (search) {
      const rx = new RegExp(search, "i")
      query.$or = [{ name: rx }, { driver: rx }, { licensePlate: rx }, { make: rx }, { model: rx }]
    }
    let filteredVehicles = await col.find(query).toArray()

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

    const col = await getCollection("vehicles")
    const now = new Date().toISOString()
    const count = await col.countDocuments()
    const id = body.id || `VH${String(count + 1).padStart(3, "0")}`
    const doc = {
      id,
      name: body.name || `Vehicle ${id}`,
      driver: body.driver || "",
      status: body.status || "inactive",
      location: body.location || "",
      lat: body.lat ?? 40.7128,
      lng: body.lng ?? -74.006,
      speed: body.speed ?? 0,
      fuel: body.fuel ?? 0,
      lastUpdate: now,
      route: body.route || "",
      vehicleType: body.vehicleType || "",
      licensePlate: body.licensePlate || "",
      year: body.year ?? 0,
      make: body.make || "",
      model: body.model || "",
      mileage: body.mileage ?? 0,
      nextMaintenance: body.nextMaintenance || "",
      notes: body.notes || "",
      heading: body.heading ?? 0,
    }
    await col.insertOne(doc)
    return NextResponse.json({ success: true, data: doc, message: "Vehicle created successfully" }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create vehicle" }, { status: 500 })
  }
}
