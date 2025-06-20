"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { AuthError } from "@supabase/supabase-js"

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  // Validation
  if (!email || !password || !confirmPassword) {
    return { error: "جميع الحقول مطلوبة" }
  }

  if (password !== confirmPassword) {
    return { error: "كلمات المرور غير متطابقة" }
  }

  if (password.length < 6) {
    return { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }
  }

  try {
    const supabase = createClient()
    const origin = headers().get("origin")

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      if (error instanceof AuthError) {
        return { error: "فشل في إنشاء الحساب. تحقق من البريد الإلكتروني." }
      }
      return { error: error.message }
    }

    // If signup successful and user is immediately confirmed, redirect to onboarding
    if (data.user && !data.user.email_confirmed_at) {
      return { success: "تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني." }
    }

    // If user is immediately confirmed (for development), redirect to onboarding
    if (data.user && data.user.email_confirmed_at) {
      redirect("/onboarding")
    }

    return { success: "تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني." }
  } catch (error) {
    console.error("Signup error:", error)
    return { error: "حدث خطأ أثناء إنشاء الحساب" }
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "البريد الإلكتروني وكلمة المرور مطلوبان" }
  }

  try {
    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: "بيانات تسجيل الدخول غير صحيحة" }
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
    console.error("Signin error:", error)
    return { error: "حدث خطأ أثناء تسجيل الدخول" }
  }
}

export async function signOut() {
  try {
    const supabase = createClient()
    await supabase.auth.signOut()
    redirect("/auth/login")
  } catch (error) {
    console.error("Signout error:", error)
    return { error: "حدث خطأ أثناء تسجيل الخروج" }
  }
}

export async function onboardRestaurant(formData: FormData) {
  const name = formData.get("name") as string
  const category = formData.get("category") as string
  const colorPalette = formData.get("colorPalette") as string
  const address = formData.get("address") as string
  const phone = formData.get("phone") as string

  if (!name || !category) {
    return { error: "اسم المطعم ونوع النشاط مطلوبان" }
  }

  try {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "يجب تسجيل الدخول أولاً" }
    }

    // Parse color palette
    let parsedColorPalette = null
    if (colorPalette) {
      try {
        parsedColorPalette = JSON.parse(colorPalette)
      } catch (e) {
        console.error("Invalid color palette JSON:", e)
      }
    }

    const { data, error } = await supabase
      .from("restaurants")
      .insert({
        user_id: user.id,
        name,
        category,
        color_palette: parsedColorPalette,
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
          name_en: cat.name_en,
          sort_order: cat.sort_order,
          is_active: true,
        }))
      )

    if (categoriesError) {
      console.error("Categories creation error:", categoriesError)
      // Don't return error, just log it
    }

    redirect("/menu-editor")
  } catch (error) {
    console.error("Onboarding error:", error)
    return { error: "حدث خطأ أثناء إعداد المطعم" }
  }
}
