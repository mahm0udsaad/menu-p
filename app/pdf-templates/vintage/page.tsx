import { TemplateDataProvider } from '@/components/pdf-templates/TemplateDataProvider'
import VintageTemplate from '@/components/pdf-templates/VintageTemplate'

export default function VintageTemplatePage() {
  return (
    <TemplateDataProvider>
      <VintageTemplate />
    </TemplateDataProvider>
  )
} 