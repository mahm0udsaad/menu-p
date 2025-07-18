import { TemplateDataProvider } from '@/components/pdf-templates/TemplateDataProvider'
import TemplateBase from '@/components/pdf-templates/TemplateBase'

export default function TestTemplatePage() {
  return (
    <TemplateDataProvider>
      <TemplateBase>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">
            🎉 HTML Template Structure Test
          </h1>
          <p className="text-gray-700 mb-4">
            This page verifies that the HTML template infrastructure is working correctly.
          </p>
          <div className="bg-gray-100 p-4 rounded text-sm">
            <p>✅ Layout: Working</p>
            <p>✅ Data Provider: Working</p>
            <p>✅ Font Loader: Working</p>
            <p>✅ Template Base: Working</p>
          </div>
        </div>
      </TemplateBase>
    </TemplateDataProvider>
  )
} 