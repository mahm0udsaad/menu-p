"use client"

import React from 'react'
import { useMenuEditor } from '@/contexts/menu-editor-context'
import { FontSettingsModal } from './font-settings-modal'
import RowStylingModal from '@/components/row-styling-modal'
import PageBackgroundModal from './page-background-modal'
import { TemplateSwitcherModal } from './template-switcher-modal'
import { ColorPaletteModal } from './color-palette-modal'
import ConfirmationModal from '@/components/ui/confirmation-modal'

/**
 * Centralized modal manager that handles all modals in the menu editor
 * This ensures all modals are properly rendered and connected to the context
 */
export const ModalManager: React.FC = () => {
  const {
    // Modal states
    showDesignModal,
    setShowDesignModal,
    showRowStylingModal,
    setShowRowStylingModal,
    showPageBackgroundModal,
    setShowPageBackgroundModal,
    showTemplateSwitcherModal,
    setShowTemplateSwitcherModal,
    showColorModal,
    setShowColorModal,
    confirmAction,
    hideConfirmation,
    
    // Settings
    rowStyleSettings,
    handleSaveRowStyles,
  } = useMenuEditor()

  return (
    <>
      {/* Font Settings Modal */}
      {showDesignModal && <FontSettingsModal />}
      
      {/* Row Styling Modal */}
      <RowStylingModal
        isOpen={showRowStylingModal}
        onClose={() => setShowRowStylingModal(false)}
        onSave={handleSaveRowStyles}
        currentSettings={rowStyleSettings}
      />
      
      {/* Page Background Modal */}
      <PageBackgroundModal
        isOpen={showPageBackgroundModal}
        onClose={() => setShowPageBackgroundModal(false)}
      />
      
      {/* Template Switcher Modal */}
      <TemplateSwitcherModal />
      
      {/* Color Palette Modal */}
      <ColorPaletteModal />
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmAction.show}
        onClose={hideConfirmation}
        onConfirm={() => {
          confirmAction.action()
          hideConfirmation()
        }}
        title={confirmAction.title}
        description={confirmAction.description}
        type={confirmAction.type}
      />
    </>
  )
}

export default ModalManager 