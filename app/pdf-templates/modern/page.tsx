import { TemplateDataProvider } from '@/components/pdf-templates/TemplateDataProvider'
import ModernTemplate from '@/components/pdf-templates/ModernTemplate'

export default function ModernTemplatePage() {
  return (
    <TemplateDataProvider>
      <ModernTemplate />
    </TemplateDataProvider>
  )
} 