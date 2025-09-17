// API utility functions for vehicle tracking

export interface Vehicle {
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

export interface TrackingData {
  id: string
  name: string
  lat: number
  lng: number
  speed: number
  heading: number
  status: "active" | "inactive" | "maintenance"
  fuel: number
  driver: string
  lastUpdate: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  total?: number
  timestamp?: string
}

// Vehicle API functions
export const vehicleApi = {
  // Get all vehicles
  getAll: async (params?: { status?: string; search?: string }): Promise<ApiResponse<Vehicle[]>> => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set("status", params.status)
    if (params?.search) searchParams.set("search", params.search)

    const response = await fetch(`/api/vehicles?${searchParams}`)
    return response.json()
  },

  // Get single vehicle
  getById: async (id: string): Promise<ApiResponse<Vehicle>> => {
    const response = await fetch(`/api/vehicles/${id}`)
    return response.json()
  },

  // Create vehicle
  create: async (vehicle: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> => {
    const response = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vehicle),
    })
    return response.json()
  },

  // Update vehicle
  update: async (id: string, vehicle: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> => {
    const response = await fetch(`/api/vehicles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vehicle),
    })
    return response.json()
  },

  // Delete vehicle
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`/api/vehicles/${id}`, {
      method: "DELETE",
    })
    return response.json()
  },

  // Update vehicle location
  updateLocation: async (
    id: string,
    location: { lat?: number; lng?: number; speed?: number; heading?: number; location?: string },
  ): Promise<ApiResponse<Vehicle>> => {
    const response = await fetch(`/api/vehicles/${id}/location`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(location),
    })
    return response.json()
  },

  // Get real-time tracking data
  getTracking: async (): Promise<ApiResponse<TrackingData[]>> => {
    const response = await fetch("/api/vehicles/tracking")
    return response.json()
  },
}

// Analytics API functions
export const analyticsApi = {
  // Get analytics data
  get: async (): Promise<ApiResponse<any>> => {
    const response = await fetch("/api/analytics")
    return response.json()
  },
}

// Utility function for handling API errors
export const handleApiError = (error: any) => {
  console.error("API Error:", error)
  return {
    success: false,
    error: error.message || "An unexpected error occurred",
  }
}
