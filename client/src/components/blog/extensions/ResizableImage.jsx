import Image from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...Image.config.addAttributes(),
      width: {
        default: '100%',
        renderHTML: attributes => ({
          width: attributes.width,
        }),
      },
      height: {
        default: 'auto',
        renderHTML: attributes => ({
          height: attributes.height,
        }),
      },
      alignment: {
        default: 'left',
        renderHTML: attributes => ({
          'data-align': attributes.alignment,
        }),
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const { alignment } = node.attrs;
    
    return [
      'div',
      { 
        class: `image-container align-${alignment}`,
        style: `text-align: ${alignment}`,
      },
      ['img', mergeAttributes(HTMLAttributes)],
      ['div', { class: 'resize-handles' }, [
        ['div', { class: 'resize-handle top-left' }],
        ['div', { class: 'resize-handle top-right' }],
        ['div', { class: 'resize-handle bottom-left' }],
        ['div', { class: 'resize-handle bottom-right' }],
      ]],
    ];
  },
}); 