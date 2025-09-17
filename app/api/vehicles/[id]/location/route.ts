import { type NextRequest, NextResponse } from "next/server"
import { vehicleTable } from "@/lib/sqlite"

// PUT /api/vehicles/[id]/location - Update vehicle location
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Simple bearer token check. Set TRACK_TOKEN in env and include Authorization: Bearer <token>
    const auth = request.headers.get("authorization") || ""
    const token = process.env.TRACK_TOKEN
    if (token) {
      const ok = auth.toLowerCase().startsWith("bearer ") && auth.slice(7).trim() === token
      if (!ok) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { lat, lng, speed, heading, location } = body

    const existing = vehicleTable.get(params.id)
    if (!existing) return NextResponse.json({ success: false, error: "Vehicle not found" }, { status: 404 })

    const updateDoc = {
      lat: lat ?? existing.lat,
      lng: lng ?? existing.lng,
      speed: speed ?? existing.speed,
      heading: heading ?? existing.heading,
      location: location ?? existing.location,
      status: speed && speed > 0 ? "active" : existing.status,
      lastUpdate: new Date().toISOString(),
    }
    const updated = vehicleTable.update(params.id, updateDoc)
    return NextResponse.json({ success: true, data: updated, message: "Vehicle location updated successfully" })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update vehicle location" }, { status: 500 })
  }
}
