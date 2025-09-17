import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"

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

    const col = await getCollection("vehicles")
    const existing = await col.findOne({ id: params.id })
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
    const res = await col.findOneAndUpdate({ id: params.id }, { $set: updateDoc }, { returnDocument: "after" })
    return NextResponse.json({ success: true, data: res.value, message: "Vehicle location updated successfully" })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update vehicle location" }, { status: 500 })
  }
}
