export const fontOptions = [
  { id: "cairo", name: "Cairo", arabicName: "خط القاهرة", family: "Cairo, sans-serif", preview: "Cairo Font", arabicPreview: "خط القاهرة الجميل", category: "arabic" },
  { id: "noto-kufi", name: "Noto Kufi Arabic", arabicName: "نوتو كوفي", family: "Noto Kufi Arabic, sans-serif", preview: "Noto Kufi", arabicPreview: "نوتو كوفي العربي", category: "arabic" },
  { id: "amiri", name: "Amiri", arabicName: "الأميري", family: "Amiri, serif", preview: "Amiri", arabicPreview: "الخط الأميري", category: "arabic" },
  { id: "almarai", name: "Almarai", arabicName: "المراعي", family: "Almarai, sans-serif", preview: "Almarai", arabicPreview: "خط المراعي", category: "arabic" },
  { id: "tajawal", name: "Tajawal", arabicName: "تجول", family: "Tajawal, sans-serif", preview: "Tajawal", arabicPreview: "خط تجول", category: "arabic" },
  { id: "open-sans", name: "Open Sans", arabicName: "أوبن سانس", family: "Open Sans, sans-serif", preview: "Open Sans Font", arabicPreview: "أوبن سانس", category: "english" },
  { id: "roboto", name: "Roboto", arabicName: "روبوتو", family: "Roboto, sans-serif", preview: "Roboto Font", arabicPreview: "روبوتو", category: "english" },
  { id: "inter", name: "Inter", arabicName: "إنتر", family: "Inter, sans-serif", preview: "Inter Font", arabicPreview: "إنتر", category: "english" },
  { id: "poppins", name: "Poppins", arabicName: "بوبينز", family: "Poppins, sans-serif", preview: "Poppins Font", arabicPreview: "بوبينز", category: "english" },
];

export const fontWeights = [
    { value: "300", label: "Light", arabicLabel: "خفيف" },
    { value: "400", label: "Regular", arabicLabel: "عادي" },
    { value: "500", label: "Medium", arabicLabel: "متوسط" },
    { value: "600", label: "Semi Bold", arabicLabel: "نصف عريض" },
    { value: "700", label: "Bold", arabicLabel: "عريض" },
    { value: "800", label: "Extra Bold", arabicLabel: "عريض جداً" },
];

export const resolveFontFamily = (id: string): string => {
    return fontOptions.find(f => f.id === id)?.family || "inherit"
}; 