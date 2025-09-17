// Simple in-memory store shared across API routes (per server instance)
// Note: In production, replace with a persistent database or Redis.

export type VehicleRecord = {
  id: string
  name: string
  driver: string
  status: "active" | "inactive" | "maintenance"
  location: string
  lat: number
  lng: number
  speed: number
  fuel: number
  lastUpdate: string
  route: string
  vehicleType: string
  licensePlate: string
  year: number
  make: string
  model: string
  mileage: number
  nextMaintenance: string
  notes: string
  heading: number
}

// Initialize with a minimal default fleet if empty
const defaultVehicles: VehicleRecord[] = [
  {
    id: "VH001",
    name: "Delivery Truck 1",
    driver: "John Smith",
    status: "active",
    location: "Manhattan, NY",
    lat: 40.7589,
    lng: -73.9851,
    speed: 0,
    fuel: 78,
    lastUpdate: new Date().toISOString(),
    route: "Route A",
    vehicleType: "Truck",
    licensePlate: "ABC-123",
    year: 2022,
    make: "Ford",
    model: "Transit",
    mileage: 25000,
    nextMaintenance: "",
    notes: "",
    heading: 0,
  },
]

class FleetStore {
  private vehicles: Map<string, VehicleRecord>

  constructor() {
    this.vehicles = new Map<string, VehicleRecord>()
    defaultVehicles.forEach((v) => this.vehicles.set(v.id, v))
  }

  getAll(): VehicleRecord[] {
    return Array.from(this.vehicles.values())
  }

  getById(id: string): VehicleRecord | undefined {
    return this.vehicles.get(id)
  }

  create(vehicle: Partial<VehicleRecord>): VehicleRecord {
    const id = vehicle.id || `VH${String(this.vehicles.size + 1).padStart(3, "0")}`
    const now = new Date().toISOString()
    const record: VehicleRecord = {
      id,
      name: vehicle.name || `Vehicle ${id}`,
      driver: vehicle.driver || "",
      status: (vehicle.status as VehicleRecord["status"]) || "inactive",
      location: vehicle.location || "",
      lat: vehicle.lat ?? 40.7128,
      lng: vehicle.lng ?? -74.006,
      speed: vehicle.speed ?? 0,
      fuel: vehicle.fuel ?? 0,
      lastUpdate: now,
      route: vehicle.route || "",
      vehicleType: vehicle.vehicleType || "",
      licensePlate: vehicle.licensePlate || "",
      year: vehicle.year ?? 0,
      make: vehicle.make || "",
      model: vehicle.model || "",
      mileage: vehicle.mileage ?? 0,
      nextMaintenance: vehicle.nextMaintenance || "",
      notes: vehicle.notes || "",
      heading: vehicle.heading ?? 0,
    }
    this.vehicles.set(id, record)
    return record
  }

  update(id: string, updates: Partial<VehicleRecord>): VehicleRecord | undefined {
    const existing = this.vehicles.get(id)
    if (!existing) return undefined
    const updated: VehicleRecord = {
      ...existing,
      ...updates,
      lastUpdate: new Date().toISOString(),
    }
    this.vehicles.set(id, updated)
    return updated
  }

  delete(id: string): boolean {
    return this.vehicles.delete(id)
  }
}

// Singleton instance
export const fleetStore = new FleetStore()


