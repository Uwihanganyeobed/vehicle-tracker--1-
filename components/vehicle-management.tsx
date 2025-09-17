"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Car, Plus, Search, Edit, Trash2, MapPin, Fuel, Gauge, Calendar, User, RefreshCw } from "lucide-react"
import { vehicleApi, type Vehicle } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function VehicleManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "maintenance">("all")
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Vehicle>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const fetchVehicles = async () => {
    try {
      setIsRefreshing(true)
      const response = await vehicleApi.getAll({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchTerm || undefined,
      })

      if (response.success && response.data) {
        setVehicles(response.data)
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to fetch vehicles",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch vehicles",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [statusFilter, searchTerm])

  useEffect(() => {
    const interval = setInterval(fetchVehicles, 120000) // Refresh every 2 minutes
    return () => clearInterval(interval)
  }, [statusFilter, searchTerm])

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleAddVehicle = async () => {
    if (formData.name && formData.driver && formData.licensePlate) {
      try {
        const response = await vehicleApi.create(formData)
        if (response.success && response.data) {
          setVehicles([...vehicles, response.data])
          setFormData({})
          setIsAddDialogOpen(false)
          toast({
            title: "Success",
            description: "Vehicle added successfully",
          })
        } else {
          toast({
            title: "Error",
            description: response.error || "Failed to add vehicle",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add vehicle",
          variant: "destructive",
        })
      }
    }
  }

  const handleEditVehicle = async () => {
    if (selectedVehicle && formData.name && formData.driver && formData.licensePlate) {
      try {
        const response = await vehicleApi.update(selectedVehicle.id, formData)
        if (response.success && response.data) {
          const updatedVehicles = vehicles.map((vehicle) =>
            vehicle.id === selectedVehicle.id ? response.data! : vehicle,
          )
          setVehicles(updatedVehicles)
          setFormData({})
          setSelectedVehicle(null)
          setIsEditDialogOpen(false)
          toast({
            title: "Success",
            description: "Vehicle updated successfully",
          })
        } else {
          toast({
            title: "Error",
            description: response.error || "Failed to update vehicle",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update vehicle",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      const response = await vehicleApi.delete(vehicleId)
      if (response.success) {
        setVehicles(vehicles.filter((vehicle) => vehicle.id !== vehicleId))
        toast({
          title: "Success",
          description: "Vehicle deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete vehicle",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete vehicle",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setFormData(vehicle)
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({})
    setSelectedVehicle(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Loading vehicles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vehicle Management</h1>
          <p className="text-muted-foreground">Manage your fleet vehicles and their information</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchVehicles} disabled={isRefreshing}>
            {isRefreshing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Vehicle</DialogTitle>
              </DialogHeader>
              <VehicleForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleAddVehicle}
                onCancel={() => setIsAddDialogOpen(false)}
                submitLabel="Add Vehicle"
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles, drivers, license plates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{vehicle.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.make} {vehicle.model} ({vehicle.year})
                  </p>
                  <p className="text-sm text-muted-foreground">{vehicle.licensePlate}</p>
                </div>
                <Badge
                  variant={vehicle.status === "active" ? "default" : "secondary"}
                  className={
                    vehicle.status === "active"
                      ? "bg-primary"
                      : vehicle.status === "maintenance"
                        ? "bg-destructive"
                        : ""
                  }
                >
                  {vehicle.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{vehicle.driver}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{vehicle.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-muted-foreground" />
                  <span>{Math.round(vehicle.speed)} mph</span>
                </div>
                <div className="flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-muted-foreground" />
                  <span>{Math.round(vehicle.fuel)}%</span>
                </div>
              </div>

              <div className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Next Maintenance:</span>
                </div>
                <span className="text-sm">{vehicle.nextMaintenance || "Not scheduled"}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => openEditDialog(vehicle)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive bg-transparent"
                  onClick={() => handleDeleteVehicle(vehicle.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Car className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Get started by adding your first vehicle"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Vehicle
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
          </DialogHeader>
          <VehicleForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleEditVehicle}
            onCancel={() => setIsEditDialogOpen(false)}
            submitLabel="Update Vehicle"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface VehicleFormProps {
  formData: Partial<Vehicle>
  setFormData: (data: Partial<Vehicle>) => void
  onSubmit: () => void
  onCancel: () => void
  submitLabel: string
}

function VehicleForm({ formData, setFormData, onSubmit, onCancel, submitLabel }: VehicleFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Vehicle Name *</Label>
          <Input
            id="name"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Delivery Truck 1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="driver">Driver *</Label>
          <Input
            id="driver"
            value={formData.driver || ""}
            onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
            placeholder="e.g., John Smith"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="make">Make</Label>
          <Input
            id="make"
            value={formData.make || ""}
            onChange={(e) => setFormData({ ...formData, make: e.target.value })}
            placeholder="e.g., Ford"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            value={formData.model || ""}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            placeholder="e.g., Transit"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            value={formData.year || ""}
            onChange={(e) => setFormData({ ...formData, year: Number.parseInt(e.target.value) || 0 })}
            placeholder="e.g., 2023"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="licensePlate">License Plate *</Label>
          <Input
            id="licensePlate"
            value={formData.licensePlate || ""}
            onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
            placeholder="e.g., ABC-123"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicleType">Vehicle Type</Label>
          <Select
            value={formData.vehicleType || ""}
            onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Van">Van</SelectItem>
              <SelectItem value="Truck">Truck</SelectItem>
              <SelectItem value="Car">Car</SelectItem>
              <SelectItem value="Motorcycle">Motorcycle</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status || ""}
            onValueChange={(value) => setFormData({ ...formData, status: value as Vehicle["status"] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fuel">Fuel Level (%)</Label>
          <Input
            id="fuel"
            type="number"
            min="0"
            max="100"
            value={formData.fuel || ""}
            onChange={(e) => setFormData({ ...formData, fuel: Number.parseInt(e.target.value) || 0 })}
            placeholder="e.g., 75"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mileage">Mileage</Label>
          <Input
            id="mileage"
            type="number"
            value={formData.mileage || ""}
            onChange={(e) => setFormData({ ...formData, mileage: Number.parseInt(e.target.value) || 0 })}
            placeholder="e.g., 25000"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="route">Route</Label>
          <Input
            id="route"
            value={formData.route || ""}
            onChange={(e) => setFormData({ ...formData, route: e.target.value })}
            placeholder="e.g., Route A"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nextMaintenance">Next Maintenance</Label>
          <Input
            id="nextMaintenance"
            type="date"
            value={formData.nextMaintenance || ""}
            onChange={(e) => setFormData({ ...formData, nextMaintenance: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Current Location</Label>
        <Input
          id="location"
          value={formData.location || ""}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="e.g., Manhattan, NY"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes || ""}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes about this vehicle..."
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={onSubmit} className="flex-1">
          {submitLabel}
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
          Cancel
        </Button>
      </div>
    </div>
  )
}
