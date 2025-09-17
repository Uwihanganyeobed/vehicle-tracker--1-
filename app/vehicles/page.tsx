import { VehicleManagement } from "@/components/vehicle-management"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function VehiclesPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <VehicleManagement />
      </div>
    </DashboardLayout>
  )
}
