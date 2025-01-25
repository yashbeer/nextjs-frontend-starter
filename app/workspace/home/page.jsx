import {
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default function Home() {
    return (
        <SidebarInset>
            <header className="flex h-16 shrink-0 justify-between items-center gap-2">
                <div className="flex items-center px-4">
                    <SidebarTrigger className="ml-1 h-8" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <h1 className="text-xl font-semibold text-gray-900 px-2">Home</h1>
                </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
                    {/* Content will go here */}
                </div>
            </div>
        </SidebarInset>
    )
}