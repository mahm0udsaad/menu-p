"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export type MenuItemFormState = {
  error?: string
  success?: boolean
} | null

export async function signUp(state: { error?: string; success?: string } | null, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!email || !password || !confirmPassword) {
    return { error: "جميع الحقول مطلوبة" }
  }

  if (password !== confirmPassword) {
    return { error: "كلمات المرور غير متطابقة" }
  }

  if (password.length < 6) {
    return { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }
  }

  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || ('http://localhost:' + (process.env.PORT || process.env.NEXT_PUBLIC_PORT || '3001'))}/`,
    },
  })

  if (error) {
    return { error: "فشل في إنشاء الحساب. تحقق من البريد الإلكتروني." }
  }

  return { success: "تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني." }
}

export async function signIn(state: { error?: string } | null, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "البريد الإلكتروني وكلمة المرور مطلوبان" }
  }

  try {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
      // Handle rate limiting specifically
      if (error.message.includes('rate limit') || error.status === 429) {
        return { error: "تم تجاوز حد المحاولات. يرجى المحاولة مرة أخرى بعد دقيقة." }
      }
      
      // Handle other auth errors
      if (error.message.includes('Invalid login credentials')) {
    return { error: "بيانات تسجيل الدخول غير صحيحة" }
      }
      
      return { error: "خطأ في تسجيل الدخول. يرجى المحاولة مرة أخرى." }
  }

  // Check if user has completed onboarding
  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id")
    .eq("user_id", data.user.id)
    .single()

  if (restaurantError || !restaurant) {
    redirect("/onboarding")
  }

  redirect("/dashboard")
  } catch (error) {
    console.error("Sign in error:", error)
    return { error: "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى." }
  }
}

export async function forgotPassword(state: { error?: string; success?: string } | null, formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    return { error: "البريد الإلكتروني مطلوب" }
  }

  try {
    const supabase = createServerActionClient({ cookies })

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || ('http://localhost:' + (process.env.PORT || process.env.NEXT_PUBLIC_PORT || '3001'))}/auth/reset-password`,
    })

    if (error) {
      if (error.message.includes('rate limit') || error.status === 429) {
        return { error: "تم تجاوز حد المحاولات. يرجى المحاولة مرة أخرى بعد دقيقة." }
      }
      return { error: "حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور" }
    }

    return { success: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني" }
  } catch (error) {
    console.error("Forgot password error:", error)
    return { error: "حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور" }
  }
}

export async function resetPassword(state: { error?: string } | null, formData: FormData) {
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!password || !confirmPassword) {
    return { error: "جميع الحقول مطلوبة" }
  }

  if (password !== confirmPassword) {
    return { error: "كلمات المرور غير متطابقة" }
  }

  if (password.length < 6) {
    return { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }
  }

  try {
    const supabase = createServerActionClient({ cookies })

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      return { error: "فشل في إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى." }
    }

    redirect("/dashboard")
  } catch (error) {
    console.error("Reset password error:", error)
    return { error: "فشل في إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى." }
  }
}

export async function signOut() {
  const supabase = createServerActionClient({ cookies })
  await supabase.auth.signOut()
  redirect("/auth/login")
}

export async function onboardRestaurant(state: { error?: string; success?: boolean } | null, formData: FormData) {
  const name = formData.get("name") as string
  const category = formData.get("category") as string
  const colorPalette = formData.get("color_palette") as string
  const address = formData.get("address") as string
  const phone = formData.get("phone") as string
  const currency = formData.get("currency") as string

  if (!name || !category) {
    return { error: "اسم المطعم ونوع النشاط مطلوبان" }
  }

  const supabase = createServerActionClient({ cookies })
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "يجب تسجيل الدخول أولاً" }
  }

  // Store color palette (it comes as a string ID, no need to parse)
  const { data, error } = await supabase
    .from("restaurants")
    .insert({
      user_id: user.id,
      name,
      category,
      currency: currency || 'EGP',
      color_palette: colorPalette ? { id: colorPalette } : null,
      address: address || null,
      phone: phone || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Restaurant creation error:", error)
    return { error: "فشل في حفظ بيانات المطعم" }
  }

  // Create default menu categories
  const defaultCategories = [
    { name: "مقبلات", name_en: "Appetizers", sort_order: 1 },
    { name: "الأطباق الرئيسية", name_en: "Main Courses", sort_order: 2 },
    { name: "المشروبات", name_en: "Beverages", sort_order: 3 },
    { name: "الحلويات", name_en: "Desserts", sort_order: 4 },
  ]

      const { error: categoriesError } = await supabase
      .from("menu_categories")
      .insert(
        defaultCategories.map((cat) => ({
          restaurant_id: data.id,
          name: cat.name,
          description: cat.name_en,
          sort_order: cat.sort_order,
          is_active: true,
        }))
      )

  if (categoriesError) {
    console.error("Categories creation error:", categoriesError)
  }

  redirect("/menu-editor")
}

export async function signInWithGoogle() {
  const supabase = createServerActionClient({ cookies })
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
              redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || ('http://localhost:' + (process.env.PORT || process.env.NEXT_PUBLIC_PORT || '3001'))}/`,
    },
  })

  if (error) {
    console.error('Google OAuth error:', error)
    throw new Error("فشل في تسجيل الدخول بجوجل")
  }

  if (data.url) {
    redirect(data.url)
  }
}
