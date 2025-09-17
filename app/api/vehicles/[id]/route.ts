import { type NextRequest, NextResponse } from "next/server"

// Mock database - same as in route.ts (in production, this would be shared)
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

// GET /api/vehicles/[id] - Get specific vehicle
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vehicle = vehicles.find((v) => v.id === params.id)

    if (!vehicle) {
      return NextResponse.json({ success: false, error: "Vehicle not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: vehicle,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch vehicle" }, { status: 500 })
  }
}

// PUT /api/vehicles/[id] - Update vehicle
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const vehicleIndex = vehicles.findIndex((v) => v.id === params.id)

    if (vehicleIndex === -1) {
      return NextResponse.json({ success: false, error: "Vehicle not found" }, { status: 404 })
    }

    vehicles[vehicleIndex] = {
      ...vehicles[vehicleIndex],
      ...body,
      lastUpdate: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: vehicles[vehicleIndex],
      message: "Vehicle updated successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update vehicle" }, { status: 500 })
  }
}

// DELETE /api/vehicles/[id] - Delete vehicle
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vehicleIndex = vehicles.findIndex((v) => v.id === params.id)

    if (vehicleIndex === -1) {
      return NextResponse.json({ success: false, error: "Vehicle not found" }, { status: 404 })
    }

    vehicles.splice(vehicleIndex, 1)

    return NextResponse.json({
      success: true,
      message: "Vehicle deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete vehicle" }, { status: 500 })
  }
}
