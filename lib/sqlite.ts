import Database from "better-sqlite3"
import fs from "fs"
import path from "path"

let db: any | null = null

export function getDb() {
  if (db) return db
  const filename = process.env.SQLITE_DB_PATH || ".data/vehicle-tracker.db"
  const dir = path.dirname(filename)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  db = new Database(filename)
  db.pragma("journal_mode = WAL")

  // Initialize schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      name TEXT,
      driver TEXT,
      status TEXT,
      location TEXT,
      lat REAL,
      lng REAL,
      speed REAL,
      fuel REAL,
      lastUpdate TEXT,
      route TEXT,
      vehicleType TEXT,
      licensePlate TEXT,
      year INTEGER,
      make TEXT,
      model TEXT,
      mileage INTEGER,
      nextMaintenance TEXT,
      notes TEXT,
      heading REAL
    );
  `)
  return db
}

export type VehicleRow = {
  id: string
  name: string
  driver: string
  status: string
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

export const vehicleTable = {
  all: (query?: { status?: string; search?: string }) => {
    const db = getDb()
    const clauses: string[] = []
    const params: any[] = []
    if (query?.status && query.status !== "all") {
      clauses.push("status = ?")
      params.push(query.status)
    }
    if (query?.search) {
      const s = `%${query.search}%`
      clauses.push("(name LIKE ? OR driver LIKE ? OR licensePlate LIKE ? OR make LIKE ? OR model LIKE ?)")
      params.push(s, s, s, s, s)
    }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""
    const stmt = db.prepare(`SELECT * FROM vehicles ${where} ORDER BY id ASC`)
    return stmt.all(...params) as VehicleRow[]
  },
  get: (id: string) => {
    const db = getDb()
    const stmt = db.prepare(`SELECT * FROM vehicles WHERE id = ?`)
    return stmt.get(id) as VehicleRow | undefined
  },
  create: (data: Partial<VehicleRow>) => {
    const db = getDb()
    const count = db.prepare(`SELECT COUNT(*) as c FROM vehicles`).get() as any
    const id = data.id || `VH${String((count?.c || 0) + 1).padStart(3, "0")}`
    const now = new Date().toISOString()
    const row: VehicleRow = {
      id,
      name: data.name || `Vehicle ${id}`,
      driver: data.driver || "",
      status: (data.status as string) || "inactive",
      location: data.location || "",
      lat: data.lat ?? 40.7128,
      lng: data.lng ?? -74.006,
      speed: data.speed ?? 0,
      fuel: data.fuel ?? 0,
      lastUpdate: now,
      route: data.route || "",
      vehicleType: data.vehicleType || "",
      licensePlate: data.licensePlate || "",
      year: data.year ?? 0,
      make: data.make || "",
      model: data.model || "",
      mileage: data.mileage ?? 0,
      nextMaintenance: data.nextMaintenance || "",
      notes: data.notes || "",
      heading: data.heading ?? 0,
    }
    const stmt = db.prepare(`INSERT INTO vehicles (
      id, name, driver, status, location, lat, lng, speed, fuel, lastUpdate, route, vehicleType, licensePlate, year, make, model, mileage, nextMaintenance, notes, heading
    ) VALUES (
      @id, @name, @driver, @status, @location, @lat, @lng, @speed, @fuel, @lastUpdate, @route, @vehicleType, @licensePlate, @year, @make, @model, @mileage, @nextMaintenance, @notes, @heading
    )`)
    stmt.run(row as any)
    return row
  },
  update: (id: string, updates: Partial<VehicleRow>) => {
    const db = getDb()
    const existing = vehicleTable.get(id)
    if (!existing) return undefined
    const merged: VehicleRow = { ...existing, ...updates, lastUpdate: new Date().toISOString() }
    const stmt = db.prepare(`UPDATE vehicles SET
      name=@name, driver=@driver, status=@status, location=@location,
      lat=@lat, lng=@lng, speed=@speed, fuel=@fuel, lastUpdate=@lastUpdate,
      route=@route, vehicleType=@vehicleType, licensePlate=@licensePlate,
      year=@year, make=@make, model=@model, mileage=@mileage,
      nextMaintenance=@nextMaintenance, notes=@notes, heading=@heading
      WHERE id=@id`)
    stmt.run(merged as any)
    return merged
  },
  delete: (id: string) => {
    const db = getDb()
    const stmt = db.prepare(`DELETE FROM vehicles WHERE id = ?`)
    const res = stmt.run(id)
    return res.changes > 0
  },
}
