import { type NextRequest, NextResponse } from "next/server"

// Mock database - in production, this would be a real database
const vehicles = [
  {
    id: "VH001",
    name: "Delivery Truck 1",
    driver: "John Smith",
    status: "active",
    location: "Manhattan, NY",
    lat: 40.7589,
    lng: -73.9851,
    speed: 45,
    fuel: 78,
    lastUpdate: new Date().toISOString(),
    route: "Route A",
    vehicleType: "Truck",
    licensePlate: "ABC-123",
    year: 2022,
    make: "Ford",
    model: "Transit",
    mileage: 25000,
    nextMaintenance: "2024-02-15",
    notes: "Regular delivery vehicle for downtown routes",
    heading: 90,
  },
  {
    id: "VH002",
    name: "Van 2",
    driver: "Sarah Johnson",
    status: "inactive",
    location: "Brooklyn, NY",
    lat: 40.7505,
    lng: -73.9934,
    speed: 0,
    fuel: 45,
    lastUpdate: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    route: "Route B",
    vehicleType: "Van",
    licensePlate: "XYZ-789",
    year: 2021,
    make: "Mercedes",
    model: "Sprinter",
    mileage: 32000,
    nextMaintenance: "2024-01-20",
    notes: "Backup vehicle for large deliveries",
    heading: 0,
  },
  {
    id: "VH003",
    name: "Truck 3",
    driver: "Mike Wilson",
    status: "active",
    location: "Queens, NY",
    lat: 40.7282,
    lng: -73.7949,
    speed: 32,
    fuel: 92,
    lastUpdate: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    route: "Route C",
    vehicleType: "Truck",
    licensePlate: "DEF-456",
    year: 2023,
    make: "Isuzu",
    model: "NPR",
    mileage: 15000,
    nextMaintenance: "2024-03-10",
    notes: "New vehicle with advanced GPS tracking",
    heading: 180,
  },
  {
    id: "VH004",
    name: "Delivery Van 4",
    driver: "Lisa Brown",
    status: "maintenance",
    location: "Bronx, NY",
    lat: 40.7128,
    lng: -74.006,
    speed: 0,
    fuel: 67,
    lastUpdate: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    route: "Route D",
    vehicleType: "Van",
    licensePlate: "GHI-321",
    year: 2020,
    make: "Ford",
    model: "Transit Connect",
    mileage: 45000,
    nextMaintenance: "2024-01-15",
    notes: "Currently undergoing scheduled maintenance",
    heading: 0,
  },
]

// GET /api/vehicles - Get all vehicles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    let filteredVehicles = vehicles

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

    return NextResponse.json({
      success: true,
      data: filteredVehicles,
      total: filteredVehicles.length,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch vehicles" }, { status: 500 })
  }
}

// POST /api/vehicles - Create new vehicle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Generate new ID
    const newId = `VH${String(vehicles.length + 1).padStart(3, "0")}`

    const newVehicle = {
      id: newId,
      ...body,
      lastUpdate: new Date().toISOString(),
      speed: 0,
      lat: 40.7128, // Default to NYC
      lng: -74.006,
      heading: 0,
    }

    vehicles.push(newVehicle)

    return NextResponse.json(
      {
        success: true,
        data: newVehicle,
        message: "Vehicle created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create vehicle" }, { status: 500 })
  }
}
