# Guide for Creating a New Menu Template

This guide outlines the steps and best practices for creating a new menu template for our application. Following these instructions will help ensure consistency, prevent common errors, and integrate the new template smoothly with the existing system.

## 1. File Structure

For a new template named `[TemplateName]`, you should create the following file structure:

*   `components/editor/templates/[template-name]/`: This directory will hold the components for the live preview in the editor.
    *   `[TemplateName]Preview.tsx`: The main component for rendering the template preview.
    *   `[TemplateName]MenuSection.tsx`: A component for rendering a single category/section.
    *   `[TemplateName]EditableMenuItem.tsx`: A component for rendering a single editable menu item.
*   `components/pdf/templates/[template-name]/`: This directory will hold the component for PDF generation.
    *   `[TemplateName]Pdf.tsx`: The component responsible for rendering the template into a PDF document using `@react-pdf/renderer`.

## 2. Core Functionality Checklist

Your new template must implement the following features to be consistent with the editor's functionality:

*   Display menu structure (categories and items).
*   Drag-and-drop reordering for both categories and items.
*   In-place editing of text (item name, description, price, category name).
*   Adding new categories and items.
*   Deleting categories and items (with confirmation).
*   Applying font and color styles from the editor context.
*   Correctly rendering for PDF export.

## 3. Step-by-Step Implementation Guide

### Step 3.1: Create the Basic Components

Start by creating the files listed in the "File Structure" section with basic scaffolding. The main preview component (`[TemplateName]Preview.tsx`) will receive the menu data and render `[TemplateName]MenuSection` components, which in turn will render `[TemplateName]EditableMenuItem` components.

### Step 3.2: Implement Drag-and-Drop with `react-dnd`

The project uses `react-dnd` for all drag-and-drop functionality. **Do not use `@dnd-kit` or any other library.**

*   **For Categories (`[TemplateName]MenuSection.tsx`):**
    *   Use the `useDrag` and `useDrop` hooks from `react-dnd`.
    *   Refer to `components/editor/professional-cafe-menu-preview-refactored.tsx` for a working example of category drag-and-drop. You will need to implement a similar hook combination to handle dragging and dropping sections.
*   **For Menu Items (`[TemplateName]EditableMenuItem.tsx`):**
    *   Implement `useDrag` and `useDrop` for items.
    *   The drop target should handle reordering items within the same category and moving items between different categories.
    *   Again, `professional-cafe-menu-preview-refactored.tsx` is your reference.

### Step 3.3: Handle Adding New Items and Categories

Adding items is managed through the `MenuEditorContext`.

1.  **Triggering Add:** The "Add Item" and "Add Category" buttons in `floating-controls.tsx` call functions from the context (`addNewItem`, `addNewCategory`).
2.  **Context Logic:** These context functions create a *temporary* client-side item/category with a placeholder ID (e.g., using `uuidv4()`). This temporary object is added to the local menu state.
3.  **Rendering the Form:** Your `[TemplateName]EditableMenuItem.tsx` and `[TemplateName]MenuSection.tsx` components must check if an item/category is new (e.g., by checking a flag like `isNew` or if it has a temporary ID). If it is new, render input fields instead of static text.
4.  **Saving:** When the user finishes editing the new item/category (e.g., on blur), you must call the appropriate server action (`quickAddItem`, `quickAddCategory`) to persist it to the database. The context provides functions to handle this (`handleUpdateItem`, `handleUpdateCategory`).

### Step 3.4: Implement Deletion with Confirmation

Deletion also uses the `MenuEditorContext`.

1.  **Triggering Delete:** A delete button in your component should call a context function, for example `requestDeleteCategory(categoryId)` or `requestDeleteItem(itemId)`.
2.  **Context Logic:** This function will set a `confirmAction` state in the context. The state should contain the action to be performed (`delete-category` or `delete-item`) and the ID of the target.
3.  **Displaying the Modal:** The `live-menu-editor.tsx` component centrally manages and renders a `ConfirmationModal` based on the `confirmAction` state. You don't need to render the modal in your template component.
4.  **Confirmation/Cancellation:** The modal's `onConfirm` and `onClose` handlers will call functions in the context (`confirmAction.execute()`, `hideConfirmation()`) to either proceed with the deletion (calling the server action) or close the modal.

### Step 3.5: Font and Style Integration

*   **Web Preview:**
    1.  **Font Configuration:** If you are introducing new fonts, add them to `lib/font-config.ts`. This file should export font details and be used to generate `@font-face` rules.
    2.  **CSS:** Ensure the `@font-face` rules are loaded globally, for example, in `app/globals.css`.
    3.  **Applying Fonts:** Your template components should get font settings (e.g., `fontFamily`, `fontSize`, `color`) from the `MenuEditorContext` and apply them using inline styles or CSS variables.
*   **PDF Generation (`[TemplateName]Pdf.tsx`):**
    1.  **Font Registration:** You **must** register all fonts used in the PDF at the top of your `[TemplateName]Pdf.tsx` file using `Font.register()`. This includes different weights and styles. You can use the configuration from `lib/font-config.ts` to get font URLs.
    2.  **Styling:** Use the `StyleSheet.create()` method from `@react-pdf/renderer` to define styles. Apply font families using the `fontFamily` property, matching the name you used in `Font.register()`.

## 4. Common Pitfalls to Avoid

*   **Inconsistent D&D Library:** Do not introduce new drag-and-drop libraries. Stick to `react-dnd`.
*   **Missing PDF Font Registration:** Forgetting `Font.register()` in the PDF component is a common error that leads to fonts not rendering correctly in the exported file.
*   **Direct Server Actions:** Do not call server actions directly from your template components. Always go through the `MenuEditorContext` to ensure consistent state management.
*   **State Management:** Do not implement your own state management for the menu data within the template. Rely on the state and updaters provided by `MenuEditorContext`.
*   **Hardcoded Values:** Avoid hardcoding data. New items should be created via the context, which calls the correct server actions with dynamic data. The issue with "New Item" being saved was due to a hardcoded server action. Ensure your calls pass the real data.

By following this guide, you should be able to create a robust and fully functional new menu template that integrates seamlessly with the existing editor.


EXAMPLE NEW TEMPLATE : 


Font.register({
  family: 'Oswald',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
});

const styles = StyleSheet.create({
  body: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Times-Roman',
    backgroundColor: '#fff9f0', // warm beige
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    fontFamily: 'Oswald',
    color: '#822000',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#555',
    marginBottom: 10,
  },
  divider: {
    borderBottom: '2pt solid #822000',
    marginVertical: 10,
  },
  section: {
    fontSize: 14,
    fontFamily: 'Oswald',
    color: '#822000',
    marginTop: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
  },
  menuItem: {
    width: '48%',
    marginBottom: 10,
  },
  menuItemHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuItemDesc: {
    fontSize: 10,
    color: '#333',
  },
});

const MyMenu = () => (
  <Document>
    <Page style={styles.body}>
      <Text style={styles.title}>RESTAURANT</Text>
      <Text style={styles.subtitle}>Authentic Middle Eastern Cuisine</Text>
      <View style={styles.divider} />

      <Text style={styles.section}>Appetizers</Text>
      <View style={styles.menuRow}>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemHeader}>Hummus .......... $5</Text>
          <Text style={styles.menuItemDesc}>Creamy chickpeas with tahini and lemon.</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemHeader}>Falafel .......... $6</Text>
          <Text style={styles.menuItemDesc}>Crispy herb-spiced chickpea balls.</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemHeader}>Stuffed Grape Leaves .......... $7</Text>
          <Text style={styles.menuItemDesc}>Rice and herbs wrapped in grape leaves.</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemHeader}>Labneh Dip .......... $5</Text>
          <Text style={styles.menuItemDesc}>Strained yogurt topped with olive oil & mint.</Text>
        </View>
      </View>

      <Text style={styles.section}>Main Courses</Text>
      <View style={styles.menuRow}>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemHeader}>Mixed Grill .......... $18</Text>
          <Text style={styles.menuItemDesc}>Kebab, kofta, and shish tawook with rice.</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemHeader}>Mansaf .......... $16</Text>
          <Text style={styles.menuItemDesc}>Lamb in yogurt sauce with flatbread & rice.</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemHeader}>Makloubeh .......... $15</Text>
          <Text style={styles.menuItemDesc}>Upside-down rice dish with meat and veggies.</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemHeader}>Grilled Sea Bass .......... $20</Text>
          <Text style={styles.menuItemDesc}>Whole grilled fish with lemon-herb butter.</Text>
        </View>
      </View>

      <Text style={styles.section}>Desserts</Text>
      <View style={styles.menuRow}>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemHeader}>Kunafa .......... $7</Text>
          <Text style={styles.menuItemDesc}>Sweet cheese pastry soaked in syrup.</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemHeader}>Baklava .......... $6</Text>
          <Text style={styles.menuItemDesc}>Filo pastry with pistachios and honey.</Text>
        </View>
      </View>
    </Page>
  </Document>
);

ReactPDF.render(<MyMenu />);