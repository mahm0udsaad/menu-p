'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { EditModal } from '@/components/ui/edit-modal';
import { Button } from '@/components/ui/button';

const themes = {
  chalkboard: {
    bodyBg: '#3a2e25',
    chalkboardBg: '#2C3E50',
    borderColor: '#8B4513',
    textColor: '#ECF0F1',
    font: `'Kalam', cursive`
  },
  classic: {
    bodyBg: '#FDF6E3',
    chalkboardBg: '#FFFFFF',
    borderColor: '#D2B48C',
    textColor: '#333333',
    font: `'Times New Roman', serif`
  },
  modern: {
    bodyBg: '#F8F9FA',
    chalkboardBg: '#FFFFFF',
    borderColor: '#DEE2E6',
    textColor: '#212529',
    font: `'Helvetica', sans-serif`
  } 
};

const menuTemplate = `
<html>
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&display=swap" rel="stylesheet">
  <style>
    body {
      background-color: {{bodyBg}};
      padding: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      margin: 0;
      font-family: {{font}};
    }
    .chalkboard {
      background-color: {{chalkboardBg}};
      border: 15px solid {{borderColor}};
      border-radius: 10px;
      padding: 3rem;
      width: 80%;
      max-width: 800px;
      box-shadow: 0 10px 20px rgba(0,0,0,0.5), inset 0 0 15px rgba(0,0,0,0.7);
      color: {{textColor}};
    }
    [data-editable]:hover {
        background-color: rgba(255,255,255,0.1);
        cursor: pointer;
    }
    h1 {
      font-size: 3rem;
      text-align: center;
      border-bottom: 2px dashed {{textColor}};
      padding-bottom: 1rem;
      margin-bottom: 2rem;
      border-radius: 5px;
    }
    ul {
      list-style: none;
      padding: 0;
    }
    li {
      margin: 1rem 0;
      font-size: 1.5rem;
      display: flex;
      justify-content: space-between;
      padding: 0.5rem;
      border-radius: 5px;
    }
    .price {
      white-space: nowrap;
      padding-left: 2rem;
    }
  </style>
</head>
<body>
  <div class="chalkboard">
    <h1 data-editable="title">{{ title }}</h1>
    <ul>
      {{ items }}
    </ul>
  </div>
  <script>
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-editable]');
      if (!target) return;

      const type = target.dataset.editable;
      const id = target.dataset.id;
      
      const payload = { type, id };
      window.parent.postMessage({ type: 'edit', payload }, '*');
    });
  </script>
</body>
</html>
`;

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

interface MenuData {
  title: string;
  items: MenuItem[];
}

interface EditingState {
  isOpen: boolean;
  title: string;
  initialValue: string | number;
  onSubmit: (value: string) => void;
}

export default function IframeMenuTestPage() {
  const [menuData, setMenuData] = useState<MenuData>({
    title: 'My Awesome Menu',
    items: [
      { id: '1', name: 'Cheeseburger', price: 120 },
      { id: '2', name: 'Fries', price: 50 },
      { id: '3', name: 'Milkshake', price: 70 },
    ],
  });
  const [theme, setTheme] = useState<keyof typeof themes>('chalkboard');
  const [editingState, setEditingState] = useState<EditingState>({
    isOpen: false,
    title: '',
    initialValue: '',
    onSubmit: () => {},
  });

  const handleItemChange = useCallback((id: string, field: keyof MenuItem, value: string) => {
    setMenuData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: field === 'price' ? Number(value) : value } : item
      ),
    }));
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data;

      if (type === 'edit') {
        if (payload.type === 'title') {
          setEditingState({
            isOpen: true,
            title: 'Edit Menu Title',
            initialValue: menuData.title,
            onSubmit: (newTitle) => setMenuData(prev => ({ ...prev, title: newTitle }))
          });
        } else if (payload.type === 'item-name' || payload.type === 'item-price') {
          const item = menuData.items.find(i => i.id === payload.id);
          if (!item) return;

          const field = payload.type === 'item-name' ? 'name' : 'price';
          setEditingState({
            isOpen: true,
            title: `Edit ${field} for ${item.name}`,
            initialValue: item[field],
            onSubmit: (newValue) => {
              if (field === 'price' && isNaN(Number(newValue))) {
                  alert('Invalid price. Please enter a number.');
                  return;
              }
              handleItemChange(payload.id, field, newValue);
            }
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [menuData.title, menuData.items, handleItemChange]);

  const renderedItems = useMemo(() => {
    return menuData.items
      .map(
        (item) =>
          `<li>
            <span data-editable="item-name" data-id="${item.id}">${item.name}</span>
            <span class="price" data-editable="item-price" data-id="${item.id}">${item.price} EGP</span>
           </li>`
      )
      .join('');
  }, [menuData.items]);

  const iframeContent = useMemo(() => {
    const currentTheme = themes[theme];
    return menuTemplate
      .replace('{{ title }}', menuData.title)
      .replace('{{ items }}', renderedItems)
      .replace(/{{bodyBg}}/g, currentTheme.bodyBg)
      .replace(/{{chalkboardBg}}/g, currentTheme.chalkboardBg)
      .replace(/{{borderColor}}/g, currentTheme.borderColor)
      .replace(/{{textColor}}/g, currentTheme.textColor)
      .replace(/{{font}}/g, currentTheme.font);
  }, [menuData.title, renderedItems, theme]);

  const cycleTheme = () => {
    const themeKeys = Object.keys(themes) as (keyof typeof themes)[];
    const currentIndex = themeKeys.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setTheme(themeKeys[nextIndex]);
  }

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{padding: "1rem", display: 'flex', justifyContent: 'space-between', width: '100%'}}>
            <h1 >Live Preview (Click to Edit)</h1>
            <Button onClick={cycleTheme}>Change Theme</Button>
        </div>
        <iframe
          srcDoc={iframeContent}
          title="Menu Preview"
          style={{ width: '100%', height: '100%', border: '1px solid #ccc' }}
        />
        <EditModal 
            isOpen={editingState.isOpen} 
            onClose={() => setEditingState(prev => ({...prev, isOpen: false}))} 
            title={editingState.title} 
            initialValue={editingState.initialValue} 
            onSubmit={editingState.onSubmit} 
        />
    </div>
  );
}