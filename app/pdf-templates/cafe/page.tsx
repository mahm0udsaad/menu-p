import { TemplateDataProvider } from '@/components/pdf-templates/TemplateDataProvider'
import CafeTemplate from '@/components/pdf-templates/CafeTemplate'

export default function CafeTemplatePage() {
  return (
    <TemplateDataProvider>
      <CafeTemplate />
    </TemplateDataProvider>
  )
} 