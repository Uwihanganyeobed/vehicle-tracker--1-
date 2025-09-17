import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"

// GET /api/vehicles/[id] - Get specific vehicle
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const col = await getCollection("vehicles")
    const vehicle = await col.findOne({ id: params.id })

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
    const col = await getCollection("vehicles")
    const res = await col.findOneAndUpdate(
      { id: params.id },
      { $set: { ...body, lastUpdate: new Date().toISOString() } },
      { returnDocument: "after" },
    )
    if (!res.value) return NextResponse.json({ success: false, error: "Vehicle not found" }, { status: 404 })
    return NextResponse.json({ success: true, data: res.value, message: "Vehicle updated successfully" })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update vehicle" }, { status: 500 })
  }
}

// DELETE /api/vehicles/[id] - Delete vehicle
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const col = await getCollection("vehicles")
    const res = await col.deleteOne({ id: params.id })
    if (res.deletedCount === 0) return NextResponse.json({ success: false, error: "Vehicle not found" }, { status: 404 })
    return NextResponse.json({ success: true, message: "Vehicle deleted successfully" })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete vehicle" }, { status: 500 })
  }
}
