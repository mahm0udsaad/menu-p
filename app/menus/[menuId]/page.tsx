import { Button } from "@/components/ui/button"
import Link from "next/link"
import MenuNotFound from "@/components/menu-not-found"

interface MenuPageProps {
  params: Promise<{ menuId: string }>
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { menuId } = await params

  // Use our API proxy to handle the PDF fetching and rendering
  return (
    <div className="w-full h-screen relative">
      <iframe 
        src={`/api/menu-pdf/${menuId}`}
        className="w-full h-full border-none" 
        title="Menu PDF" 
      />
      <MenuNotFound />
    </div>
  )
}
