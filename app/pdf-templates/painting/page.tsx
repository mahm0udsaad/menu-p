import { TemplateDataProvider } from '@/components/pdf-templates/TemplateDataProvider'
import PaintingTemplate from '@/components/pdf-templates/PaintingTemplate'

export default function PaintingTemplatePage() {
  return (
    <TemplateDataProvider>
      <PaintingTemplate />
    </TemplateDataProvider>
  )
} 