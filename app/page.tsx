import { DashboardLayout } from "@/components/dashboard-layout"
import { VehicleMap } from "@/components/vehicle-map"
import { VehicleList } from "@/components/vehicle-list"
import { DashboardStats } from "@/components/dashboard-stats"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-1 gap-6 p-6">
        {/* Main content area with map */}
        <div className="flex-1 space-y-6">
          <div className="bg-card rounded-lg border p-4 h-[500px]">
            <VehicleMap />
          </div>
          <DashboardStats />
        </div>

        {/* Right sidebar with vehicle list */}
        <div className="w-80">
          <VehicleList />
        </div>
      </div>
    </DashboardLayout>
  )
}
