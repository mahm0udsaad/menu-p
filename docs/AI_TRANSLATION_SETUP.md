# AI Menu Translation Feature

This document describes how to set up and use the AI-powered menu translation feature using Google's Gemini 2.0 Flash model.

## Setup

### 1. Install Dependencies

The required dependencies are already installed:
- `ai` - AI SDK for generating objects
- `@ai-sdk/google` - Google AI provider
- `zod` - Schema validation

### 2. Get Google AI API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Create a new API key
3. Add it to your environment variables:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

### 3. Supported Languages

The translation feature supports the following languages:

- English (en)
- Arabic (ar) - العربية
- Hindi (hi) - हिन्दी
- Urdu (ur) - اردو
- French (fr) - Français
- Spanish (es) - Español
- German (de) - Deutsch
- Italian (it) - Italiano
- Turkish (tr) - Türkçe
- Persian (fa) - فارسی
- Chinese (zh) - 中文
- Japanese (ja) - 日本語
- Korean (ko) - 한국어
- Portuguese (pt) - Português
- Russian (ru) - Русский

## How It Works

### Translation Process

1. **User Input**: User clicks the "ترجمة AI" (AI Translation) button in the menu editor
2. **Language Selection**: User selects source and target languages
3. **AI Processing**: The system uses Gemini 2.0 Flash to translate:
   - Category names and descriptions
   - Menu item names and descriptions
   - Preserves all other data (prices, availability, etc.)
4. **Structure Preservation**: The translation maintains the exact same data structure
5. **Real-time Update**: Translated content is immediately applied to the menu

### Technical Details

- **Model**: Google Gemini 2.0 Flash Experimental (`gemini-2.0-flash-exp`)
- **Method**: `generateObject` with Zod schema validation
- **Token Limit**: 4000 tokens max per translation request
- **Data Preservation**: IDs, prices, booleans, and arrays remain unchanged

## Usage

### From Menu Editor

1. Open the Menu Editor
2. Ensure you have menu items added
3. Click the "ترجمة AI" button (purple button with Languages icon)
4. Select source language (defaults to Arabic)
5. Select target language
6. Click "ترجمة بالذكاء الاصطناعي" to start translation
7. Wait for the AI to process and apply translations

### Features

- **Smart Translation**: Context-aware food and beverage translations
- **Cultural Adaptation**: Translations are culturally appropriate for the target language
- **Structure Preservation**: All menu structure, pricing, and metadata preserved
- **Real-time Preview**: Immediately see translated content in the menu preview
- **Error Handling**: Comprehensive error messages and fallback handling

## File Structure

```
lib/actions/menu-translation.ts        # Main translation logic
components/menu-translation-modal.tsx  # UI component for translation
components/editor/live-menu-editor.tsx # Integration point
```

## Error Handling

The system handles various error scenarios:
- Missing API key
- Network errors
- Invalid language codes
- Translation API failures
- Schema validation errors

## Cost Considerations

- Translation uses Google AI API which has usage costs
- Larger menus require more tokens
- Consider implementing usage limits for production

## Future Enhancements

- Batch translation for multiple languages
- Translation history/versioning
- Custom terminology/glossary support
- Translation quality feedback
- Auto-detection of source language 