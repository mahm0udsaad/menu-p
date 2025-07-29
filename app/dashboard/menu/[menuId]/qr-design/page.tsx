import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { getSiteUrl } from '@/lib/config/env'
import QrCardGenerator from '@/components/qr-card-generator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'

interface PageProps {
  params: { menuId: string }
}

export default async function QrDesignPage({ params }: PageProps) {
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: menu, error: menuError } = await supabase
    .from('published_menus')
    .select('id, restaurant_id')
    .eq('id', params.menuId)
    .single()

  if (menuError || !menu) {
    notFound()
  }

  const { data: restaurant, error: restError } = await supabase
    .from('restaurants')
    .select('id, name, logo_url, user_id')
    .eq('id', menu.restaurant_id)
    .single()

  if (restError || !restaurant) {
    notFound()
  }

  if (restaurant.user_id !== user.id) {
    redirect('/dashboard')
  }

  const menuUrl = `${getSiteUrl()}/menus/${menu.id}`

  return (
    <div className="p-4 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-red-600" />
            إنشاء بطاقة QR جديدة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QrCardGenerator
            restaurant={{ id: restaurant.id, name: restaurant.name, logo_url: restaurant.logo_url }}
            menuPublicUrl={menuUrl}
          />
        </CardContent>
      </Card>
    </div>
  )
}
