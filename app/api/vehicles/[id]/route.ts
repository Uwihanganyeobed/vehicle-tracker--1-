import { type NextRequest, NextResponse } from "next/server"
import { vehicleTable } from "@/lib/sqlite"

// GET /api/vehicles/[id] - Get specific vehicle
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vehicle = vehicleTable.get(params.id)

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
    const updated = vehicleTable.update(params.id, body)
    if (!updated) return NextResponse.json({ success: false, error: "Vehicle not found" }, { status: 404 })
    return NextResponse.json({ success: true, data: updated, message: "Vehicle updated successfully" })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update vehicle" }, { status: 500 })
  }
}

// DELETE /api/vehicles/[id] - Delete vehicle
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ok = vehicleTable.delete(params.id)
    if (!ok) return NextResponse.json({ success: false, error: "Vehicle not found" }, { status: 404 })
    return NextResponse.json({ success: true, message: "Vehicle deleted successfully" })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete vehicle" }, { status: 500 })
  }
}
