import Sidebar from "@/components/SideBar"
import { Outlet } from "react-router-dom"

export const Dashboard = () => {
    return(
        <div className="flex">
            <Sidebar />
            <main className="flex w-full">
                <Outlet />
            </main>
        </div>
    )
}