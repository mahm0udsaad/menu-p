"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Menu extraction carried through onboarding as a hidden JSON field (menus-sa
// preview import). Light mirror of the schema in lib/actions/menu-import.ts —
// that file is "use server" and can only export async functions.
// Lenient on purpose: a single odd field (e.g. an unusual image URL) must
// never throw away the whole imported menu — bad optional values fall back
// to null instead of failing validation.
const OnboardingImportItemSchema = z
  .object({
    name: z.string().min(1).max(300),
    description: z.string().max(2000).nullish().catch(null),
    price: z.number().min(0).max(10_000_000).nullish().catch(null),
    image_url: z.string().max(2000).nullish().catch(null),
    currency: z.string().max(10).nullish().catch(null),
  })
  .passthrough()

const OnboardingImportPayloadSchema = z
  .object({
    categories: z
      .array(
        z
          .object({
            name: z.string().min(1).max(300),
            description: z.string().max(2000).nullish().catch(null),
            items: z.array(OnboardingImportItemSchema),
          })
          .passthrough()
      )
      .min(1)
      .max(60),
  })
  .passthrough()

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
  const logoFile = formData.get("logo") as File | null
  const externalLogoUrl = formData.get("logo_url") as string | null
  const menusSaUrl = formData.get("menus_sa_url") as string | null
  const templateId = formData.get("template_id") as string | null
  const rawImportPayload = formData.get("import_payload") as string | null

  if (!name || !category) {
    return { error: "اسم المطعم ونوع النشاط مطلوبان" }
  }

  // Parse the menus-sa extraction carried from the onboarding cinematic step
  // (preview mode — nothing was written to the DB yet).
  let importPayload: z.infer<typeof OnboardingImportPayloadSchema> | null = null
  if (rawImportPayload) {
    try {
      const parsed = OnboardingImportPayloadSchema.safeParse(JSON.parse(rawImportPayload))
      if (parsed.success) {
        importPayload = parsed.data
      } else {
        console.error("Onboarding import payload validation failed:", JSON.stringify(parsed.error.issues, null, 2))
      }
    } catch (err) {
      console.error("Onboarding import payload parse error:", err)
    }
  }

  const supabase = createServerActionClient({ cookies })
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "يجب تسجيل الدخول أولاً" }
  }

  // Use external logo URL (from menus-sa import) or upload file
  let logoUrl: string | null = externalLogoUrl || null
  let logoFailed = false
  if (!logoUrl && logoFile && logoFile.size > 0) {
    const fileExt = logoFile.name.split(".").pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("restaurant-logos")
      .upload(fileName, logoFile, { cacheControl: "3600", upsert: false })
    if (!uploadError && uploadData) {
      const { data: { publicUrl } } = supabase.storage.from("restaurant-logos").getPublicUrl(uploadData.path)
      logoUrl = publicUrl
    } else {
      console.error("Onboarding logo upload error:", uploadError)
      logoFailed = true
    }
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
      logo_url: logoUrl,
      template_name: importPayload && templateId ? templateId : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Restaurant creation error:", error)
    return { error: "فشل في حفظ بيانات المطعم" }
  }

  if (importPayload) {
    // menus-sa import: write the extracted menu instead of starter categories.
    // Failures here must not block onboarding — the restaurant already exists
    // and the user can re-import from the dashboard.
    let order = 1
    for (const cat of importPayload.categories) {
      if (cat.items.length === 0) continue
      const { data: createdCategory, error: categoryError } = await supabase
        .from("menu_categories")
        .insert({
          restaurant_id: data.id,
          name: cat.name,
          description: cat.description || null,
          display_order: order,
          sort_order: order, // legacy column, kept in sync
          is_active: true,
        })
        .select("id")
        .single()
      order += 1

      if (categoryError || !createdCategory) {
        console.error("Onboarding import category insert error:", categoryError)
        continue
      }

      const { error: itemsError } = await supabase.from("menu_items").insert(
        cat.items.map((item, index) => ({
          restaurant_id: data.id,
          category_id: createdCategory.id,
          name: item.name,
          description: item.description || null,
          price: item.price ?? null,
          image_url: item.image_url || null,
          is_available: true,
          is_featured: false,
          display_order: index + 1,
        }))
      )
      if (itemsError) console.error("Onboarding import items insert error:", itemsError)
    }

    // Bookkeeping job row (best effort — requires the 'url' source_type migration)
    if (menusSaUrl) {
      const { error: jobError } = await supabase.from("menu_import_jobs").insert({
        restaurant_id: data.id,
        source_file_url: menusSaUrl,
        source_type: "url",
        status: "imported",
        verified_extraction: importPayload,
        imported_at: new Date().toISOString(),
      })
      if (jobError) console.error("Onboarding import job insert error:", jobError)
    }

    revalidatePath("/menu-editor")
    revalidatePath("/dashboard")
    redirect("/menu-editor")
  }

  // Manual path: create default menu categories
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

  redirect(logoFailed ? "/onboarding/menu-source?logo=error" : "/onboarding/menu-source")
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
