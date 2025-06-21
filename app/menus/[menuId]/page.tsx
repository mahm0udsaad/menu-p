import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface MenuPageProps {
  params: Promise<{ menuId: string }>
}

export default async function MenuPage({ params  }: MenuPageProps) {
  const { menuId } = await params
  const supabase = createClient()

  const { data: publishedMenu, error } = await supabase
    .from("published_menus")
    .select("pdf_url, restaurant_id")
    .eq("id", menuId)
    .single()

  if (error || !publishedMenu) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
        <h1 className="text-3xl font-bold mb-4">Menu Not Found</h1>
        <p className="text-slate-300 mb-6">The menu you are looking for does not exist or may have been removed.</p>
        <Button asChild>
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    )
  }

  // Option 1: Redirect directly to the PDF URL
  redirect(publishedMenu.pdf_url)

  // Option 2: Embed in an iframe (less ideal for mobile, but an option)
  // return (
  //   <div className="w-full h-screen">
  //     <iframe src={publishedMenu.pdf_url} className="w-full h-full border-none" title="Menu PDF" />
  //   </div>
  // );
}
