import { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent, BubbleMenu, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import FontFamily from '@tiptap/extension-font-family';
import TextStyle from '@tiptap/extension-text-style';
import { NodeSelection } from '@tiptap/pm/state';
import './BlogEditor.css';
import ReactDOM from 'react-dom';
import React from 'react';

// Custom FontSize extension — applies as a mark (inline style) so it only
// affects the current selection or future typing at the cursor, not all text.
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace(/[^\d.]/g, '') || null,
            renderHTML: attributes => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: (size) => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize: size }).run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
      },
    };
  },
});

// Floating toolbar button component
const FloatingButton = ({ icon, title, action, isActive = null }) => (
  <button
    onClick={action}
    className={`px-2 py-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-black hover:bg-gray-100 ${isActive && isActive() ? 'bg-gray-200 text-black' : 'text-gray-700'
      }`}
    title={title}
    type="button"
  >
    {icon}
  </button>
);

// Add this new component for image options menu
const ImageOptions = ({ editor, node, setImageWidth, setImageAlignment }) => (
  <div className="flex items-center bg-white shadow-lg rounded-md border p-1">
    <button
      onClick={() => setImageAlignment('left')}
      className="p-2 hover:bg-gray-100 rounded"
      title="Align Left"
      type="button"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    </button>
    <button
      onClick={() => setImageAlignment('center')}
      className="p-2 hover:bg-gray-100 rounded"
      title="Align Center"
      type="button"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm2 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    </button>
    <button
      onClick={() => setImageAlignment('right')}
      className="p-2 hover:bg-gray-100 rounded"
      title="Align Right"
      type="button"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm4 4a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    </button>
    <div className="h-6 border-r border-gray-300 mx-1"></div>
    <button
      onClick={() => setImageWidth('100%')}
      className="p-2 hover:bg-gray-100 rounded"
      title="Full Width"
      type="button"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    </button>
    <button
      onClick={() => setImageWidth('75%')}
      className="p-2 hover:bg-gray-100 rounded"
      title="Large (75%)"
      type="button"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="#1f2937">
        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
      </svg>
    </button>
    <button
      onClick={() => setImageWidth('50%')}
      className="p-2 hover:bg-gray-100 rounded"
      title="Medium (50%)"
      type="button"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    </button>
    <button
      onClick={() => setImageWidth('33%')}
      className="p-2 hover:bg-gray-100 rounded"
      title="Small (33%)"
      type="button"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </button>
  </div>
);

const DRAFT_STORAGE_KEY = 'blog_draft';

const BlogEditor = ({ initialContent = '', onSave, categories = [], errorMessage = '' }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [showToolbar, setShowToolbar] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [editorLoading, setEditorLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const saveTimerRef = useRef(null);
  const [currentFont, setCurrentFont] = useState('');
  const [lineSpacing, setLineSpacing] = useState(1.6);
  const [fontSize, setFontSize] = useState(16);
  const editorWrapperRef = useRef(null);

  // Initialize the editor with enhanced features
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      TextStyle,
      FontSize,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            alignment: {
              default: 'center',
              parseHTML: element => {
                // Check data attribute first, then parse from inline style
                if (element.getAttribute('data-alignment')) return element.getAttribute('data-alignment');
                // Check parent wrapper
                const wrapper = element.closest?.('.editor-image');
                if (wrapper?.getAttribute('data-alignment')) return wrapper.getAttribute('data-alignment');
                // Parse from inline margin styles
                const style = element.getAttribute('style') || '';
                if (style.includes('margin-right: 0px') || style.includes('margin-right: 0;') || style.includes('margin-right:0')) return 'right';
                if (style.includes('margin-left: 0px') || style.includes('margin-left: 0;') || style.includes('margin-left:0')) return 'left';
                return 'center';
              },
              renderHTML: attributes => ({
                'data-alignment': attributes.alignment,
              }),
            },
            width: {
              default: '100%',
              parseHTML: element => {
                if (element.getAttribute('data-width')) return element.getAttribute('data-width');
                const wrapper = element.closest?.('.editor-image');
                if (wrapper?.getAttribute('data-width')) return wrapper.getAttribute('data-width');
                // Parse from inline style
                const style = element.getAttribute('style') || '';
                const widthMatch = style.match(/width:\s*([\d]+%)/);
                if (widthMatch) return widthMatch[1];
                return '100%';
              },
              renderHTML: attributes => ({
                'data-width': attributes.width,
              }),
            },
          };
        },
        renderHTML({ HTMLAttributes, node }) {
          const alignment = node.attrs.alignment || 'center';
          const width = node.attrs.width || '100%';

          // Build inline style string with ALL positioning info
          let marginLeft, marginRight;
          if (alignment === 'center') { marginLeft = 'auto'; marginRight = 'auto'; }
          else if (alignment === 'right') { marginLeft = 'auto'; marginRight = '0'; }
          else { marginLeft = '0'; marginRight = 'auto'; }

          const inlineStyle = `display: block; width: ${width}; height: auto; margin-left: ${marginLeft}; margin-right: ${marginRight}; border-radius: 0.75rem;`;

          // Remove class from HTMLAttributes to avoid server-side interference
          const { class: _, ...restAttrs } = HTMLAttributes;

          return ['img', {
            ...restAttrs,
            'data-alignment': alignment,
            'data-width': width,
            style: inlineStyle,
          }];
        },
        addNodeView() {
          return ({ node, editor, getPos }) => {
            // Wrapper div (editor only — not used in published HTML)
            const wrapper = document.createElement('div');
            wrapper.classList.add('editor-image');
            wrapper.style.textAlign = node.attrs.alignment || 'center';
            wrapper.setAttribute('data-alignment', node.attrs.alignment || 'center');
            wrapper.setAttribute('data-width', node.attrs.width || '100%');

            // Image element
            const img = document.createElement('img');
            img.src = node.attrs.src;
            img.alt = node.attrs.alt || '';
            img.title = node.attrs.title || '';
            img.style.cursor = 'pointer';

            wrapper.appendChild(img);

            // Click handler — create a proper NodeSelection so BubbleMenu shows
            wrapper.addEventListener('click', (e) => {
              e.preventDefault();
              const pos = getPos();
              if (pos == null) return;
              const { state, dispatch } = editor.view;
              const nodeSelection = NodeSelection.create(state.doc, pos);
              dispatch(state.tr.setSelection(nodeSelection));
              editor.view.focus();
            });

            return {
              dom: wrapper,
              update: (updatedNode) => {
                if (updatedNode.type.name !== 'image') return false;
                img.src = updatedNode.attrs.src;
                img.alt = updatedNode.attrs.alt || '';
                wrapper.setAttribute('data-width', updatedNode.attrs.width || '100%');
                wrapper.style.textAlign = updatedNode.attrs.alignment || 'center';
                wrapper.setAttribute('data-alignment', updatedNode.attrs.alignment || 'center');
                return true;
              },
              selectNode: () => {
                wrapper.classList.add('selected');
              },
              deselectNode: () => {
                wrapper.classList.remove('selected');
              },
            };
          };
        },
      }).configure({
        inline: false,
        allowBase64: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
        alignments: ['left', 'center', 'right'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your story...',
      }),
    ],
    content: initialContent,
    autofocus: 'end',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[70vh] px-8 py-4 prose-p:my-4 prose-img:my-8 prose-hr:my-8 prose-blockquote:border-l-4 prose-blockquote:pl-6 prose-blockquote:italic prose-headings:font-serif prose-h2:mt-12 prose-h2:mb-6',
      },
      handleClick(view, pos, event) {
        // Check if clicked element is an image
        const { state } = view;
        const clickedNode = state.doc.nodeAt(pos);

        if (clickedNode && clickedNode.type.name === 'image') {
          // Store reference to the clicked image node
          setSelectedImage(clickedNode);
          setShowImageOptions(true);

          // Return true to indicate we've handled the click
          return true;
        }

        // Click was not on an image, hide the image options
        setShowImageOptions(false);
        setSelectedImage(null);

        // Return false to let other handlers process the event
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      // Preserve image selection UI
      if (selectedImage && !editor.isActive('image')) {
        setSelectedImage(null);
        setShowImageOptions(false);
      }

      // Update font state
      let font = editor.getAttributes('textStyle').fontFamily;
      if (font) {
        font = font.replace(/['"]+/g, '');
      }
      if (font !== currentFont) {
        setCurrentFont(font || '');
      }

      // Autosave draft on content change (debounced)
      queueDraftSave();
    },
    onSelectionUpdate: ({ editor }) => {
      let font = editor.getAttributes('textStyle').fontFamily;
      if (font) {
        font = font.replace(/['"]+/g, '');
      }
      if (font !== currentFont) {
        setCurrentFont(font || '');
      }
    },
    onCreate: () => {
      // When the editor is ready, set loading to false and attempt to load draft content
      setTimeout(() => setEditorLoading(false), 800);
      const draft = safeParse(localStorage.getItem(DRAFT_STORAGE_KEY));
      if (draft?.content) {
        try {
          // Prefer HTML to keep formatting identical
          editor.commands.setContent(draft.content, false);
        } catch (e) {
          // Ignore setContent error
        }
      }
    }
  });

  // Fallback categories if none are provided
  const defaultCategories = [
    { id: '1', name: 'Ancient India' },
    { id: '2', name: 'Medieval India' },
    { id: '3', name: 'Colonial Era' },
    { id: '4', name: 'Independence Movement' },
    { id: '5', name: 'Modern History' },
  ];

  // Use provided categories or fallback to defaults
  const availableCategories = categories.length > 0 ? categories : defaultCategories;

  // Helpers
  const safeParse = (json) => {
    try { return JSON.parse(json || ''); } catch { return null; }
  };

  const saveDraft = () => {
    if (!editor) return;
    const draft = {
      title,
      category,
      tags,
      featuredImage,
      excerpt,
      content: editor.getHTML(),
      updatedAt: Date.now(),
    };
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      setSaveStatus('saved');
      // Clear status after a short delay
      setTimeout(() => setSaveStatus(''), 1500);
    } catch (e) {
      // ignore storage quota errors
    }
  };

  const queueDraftSave = () => {
    setSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(saveDraft, 800);
  };

  // Load basic fields from draft on mount
  useEffect(() => {
    const draft = safeParse(localStorage.getItem(DRAFT_STORAGE_KEY));
    if (draft) {
      if (draft.title) setTitle(draft.title);
      if (draft.category) setCategory(draft.category);
      if (draft.tags) setTags(draft.tags);
      if (draft.featuredImage) setFeaturedImage(draft.featuredImage);
      if (draft.excerpt) setExcerpt(draft.excerpt);
    }
  }, []);

  // Save whenever metadata changes
  useEffect(() => {
    queueDraftSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, category, tags, featuredImage, excerpt]);

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async () => {
      if (input.files?.length) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
          if (editor && e.target?.result) {
            // Save the image with full base64 data to ensure accessibility from social platforms
            const imageUrl = e.target.result;

            editor
              .chain()
              .focus()
              .setImage({
                src: imageUrl,
                alt: file.name,
                alignment: 'center', // Default to center alignment for better sharing
                width: 'auto', // Default width
              })
              .run();

            console.log('Image added with URL format that should work for sharing:',
              imageUrl.substring(0, 30) + '...');
          }
        };

        reader.readAsDataURL(file);
      }
    };

    input.click();
  };

  const handleFeaturedImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async () => {
      if (input.files?.length) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
          if (e.target?.result) {
            setFeaturedImage(e.target.result);
          }
        };

        reader.readAsDataURL(file);
      }
    };

    input.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!editor) return;

    const blogData = {
      title,
      content: editor.getHTML(),
      category,
      tags: tags.split(',').map(tag => tag.trim()),
      featuredImage,
      excerpt,
    };

    if (onSave) {
      onSave(blogData);
    }
  };

  // Apply line spacing dynamically via DOM to bypass Tailwind prose specificity
  useEffect(() => {
    if (editorWrapperRef.current) {
      const pm = editorWrapperRef.current.querySelector('.ProseMirror');
      if (pm) {
        pm.style.lineHeight = String(lineSpacing);
      }
    }
  }, [lineSpacing]);

  // Add custom styling to match the published view
  const editorStyles = `
    /* Main editor container */
    .ProseMirror {
      font-family: ui-sans-serif, system-ui, sans-serif;
      color: #374151;
    }
    
    /* Images */
    .editor-image {
      margin: 2rem 0 !important;
      display: block !important;
      position: relative;
      transition: width 0.2s ease-in-out !important;
    }
    
    .editor-image img {
      max-width: 100%;
      height: auto;
      border-radius: 0.75rem !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
      width: 100% !important;
    }
    
    /* Selected image highlight */
    .editor-image.selected {
      position: relative;
    }
    
    .editor-image.selected::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 2px dashed #B45309;
      border-radius: 0.75rem;
      pointer-events: none;
    }
    
    /* Explicit width settings */
    .editor-image[data-width="100%"] {
      width: 100% !important;
    }
    
    .editor-image[data-width="75%"] {
      width: 75% !important;
      margin-left: auto !important;
      margin-right: auto !important;
    }
    
    .editor-image[data-width="50%"] {
      width: 50% !important;
      margin-left: auto !important;
      margin-right: auto !important;
    }
    
    .editor-image[data-width="33%"] {
      width: 33% !important;
      margin-left: auto !important;
      margin-right: auto !important;
    }
    
    /* Explicit alignment settings */
    .editor-image[data-alignment="center"] {
      text-align: center !important;
      margin-left: auto !important;
      margin-right: auto !important;
    }
    
    .editor-image[data-alignment="right"] {
      text-align: right !important;
      margin-left: auto !important;
      margin-right: 0 !important;
    }
    
    .editor-image[data-alignment="left"] {
      text-align: left !important;
      margin-left: 0 !important;
      margin-right: auto !important;
    }
    
    /* Image resize handles */
    .image-resize-handle {
      position: absolute;
      width: 10px;
      height: 10px;
      background: white;
      border: 2px solid #B45309;
      border-radius: 50%;
    }
    
    .image-resize-handle.top-left { top: -5px; left: -5px; cursor: nw-resize; }
    .image-resize-handle.top-right { top: -5px; right: -5px; cursor: ne-resize; }
    .image-resize-handle.bottom-left { bottom: -5px; left: -5px; cursor: sw-resize; }
    .image-resize-handle.bottom-right { bottom: -5px; right: -5px; cursor: se-resize; }
    
    /* Paragraphs */
    .ProseMirror p {
      margin: 1.25rem 0 !important;
      color: #4B5563 !important;
    }
    
    /* Horizontal rules */
    .ProseMirror hr {
      margin: 2rem 0 !important;
      border-color: #FEF3C7 !important;
      border-width: 1px !important;
    }
    
    /* Blockquotes */
    .ProseMirror blockquote {
      border-left-width: 4px !important;
      border-left-color: #B45309 !important;
      padding-left: 1.5rem !important;
      font-style: italic !important;
      margin: 1.5rem 0 !important;
    }
    
    /* Headings */
    .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
      font-family: serif !important;
      color: #78350F !important;
      letter-spacing: -0.025em !important;
      font-weight: bold !important;
    }
    
    .ProseMirror h1 {
      font-size: 2.25rem !important;
      margin: 2rem 0 1rem 0 !important;
    }
    
    .ProseMirror h2 {
      font-size: 1.5rem !important;
      margin: 3rem 0 1.5rem 0 !important;
    }
    
    .ProseMirror h3 {
      font-size: 1.25rem !important;
      margin: 2.5rem 0 1rem 0 !important;
    }
    
    /* Bold text */
    .ProseMirror strong {
      color: #78350F !important;
      font-weight: 600 !important;
    }
    
    /* Links */
    .ProseMirror a {
      color: #B45309 !important;
      text-decoration: none !important;
      font-weight: 500 !important;
    }
    
    /* Code */
    .ProseMirror code {
      background-color: #FEF3C7 !important;
      border-radius: 0.25rem !important;
      padding: 0.125rem 0.375rem !important;
      font-size: 0.875rem !important;
    }
    
    /* Code blocks */
    .ProseMirror pre {
      background-color: #1F2937 !important;
      color: #F3F4F6 !important;
      padding: 1rem !important;
      border-radius: 0.75rem !important;
      margin: 1.5rem 0 !important;
      overflow-x: auto !important;
    }
    
    /* Image options menu */
    .image-options {
      position: absolute;
      top: -3rem;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      z-index: 50;
      display: flex;
      align-items: center;
    }
  `;

  // Function to render resize options for selected image
  const renderImageOptions = () => {
    if (!selectedImage || !showImageOptions) return null;

    // Find the DOM node for the selected image to position the options correctly
    const imageElement = document.querySelector('.editor-image.selected');
    if (!imageElement) return null;

    return ReactDOM.createPortal(
      <ImageOptions
        editor={editor}
        node={selectedImage}
        setImageWidth={setImageWidth}
        setImageAlignment={setImageAlignment}
      />,
      imageElement
    );
  };

  // Utility function to find and update selected image DOM element
  const updateSelectedImageStyles = (attrs) => {
    const imageElement = document.querySelector('.editor-image.selected');
    if (!imageElement) return;

    if (attrs.width) {
      imageElement.style.width = attrs.width;
      imageElement.setAttribute('data-width', attrs.width);
    }

    if (attrs.alignment) {
      imageElement.style.textAlign = attrs.alignment;
      imageElement.setAttribute('data-alignment', attrs.alignment);
    }
  };

  const setImageWidth = (width) => {
    if (editor && editor.isActive('image')) {
      editor.chain()
        .focus()
        .updateAttributes('image', { width })
        .run();
    }
  };

  const setImageAlignment = (alignment) => {
    if (editor && editor.isActive('image')) {
      editor.chain()
        .focus()
        .updateAttributes('image', { alignment })
        .run();
    }
  };

  // Force update images when editor mounts or changes
  useEffect(() => {
    if (editor) {
      const updateAllImages = () => {
        // Find all image nodes
        document.querySelectorAll('.editor-image').forEach(imageEl => {
          const width = imageEl.getAttribute('data-width');
          const alignment = imageEl.getAttribute('data-alignment');

          // Apply styling directly
          if (width) {
            imageEl.style.width = width;
          }

          if (alignment) {
            imageEl.style.textAlign = alignment;
          }
        });
      };

      // Update on mount
      updateAllImages();

      // Also add an update listener
      editor.on('update', updateAllImages);

      return () => {
        editor.off('update', updateAllImages);
      };
    }
  }, [editor]);

  // Update the isImageSelected function to be more robust
  const isImageSelected = () => {
    return editor?.isActive('image') || false;
  };

  const getImageAttrs = () => {
    if (!isImageSelected()) return {};

    const node = editor.state.selection.node;
    return node?.attrs || {};
  };

  const isAlignmentActive = (alignment) => {
    const attrs = getImageAttrs();
    return attrs.alignment === alignment;
  };

  const isWidthActive = (width) => {
    const attrs = getImageAttrs();
    return attrs.width === width;
  };

  // If still loading, show the quill animation
  if (editorLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="quill-container">
          <div className="paper"></div>
          <div className="quill"></div>
          <div className="ink-drop"></div>
          <div className="ink-drop"></div>
          <div className="ink-drop"></div>
        </div>
        <p className="text-gray-600 mt-4" role="status" aria-live="polite">Preparing your canvas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto bg-white min-h-screen">
      <style>{editorStyles}</style>

      {/* Featured Image Upload */}
      <div className="relative h-[300px] bg-gray-100 mb-8">
        {featuredImage ? (
          <img
            src={featuredImage}
            alt="Featured"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handleFeaturedImageUpload}
              className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
              type="button"
            >
              Add Featured Image
            </button>
          </div>
        )}
      </div>

      {/* Title and Category Section */}
      <div className="px-8 pt-8 pb-4 space-y-4">
        <label htmlFor="blog-title" className="sr-only">Title</label>
        <input
          id="blog-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full text-4xl font-serif font-bold border-none outline-none placeholder-gray-300"
          required
          aria-required="true"
        />

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-auto">
            <label htmlFor="blog-category" className="sr-only">Category</label>
            <select
              id="blog-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            >
              <option value="">Select Category</option>
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Font Selection */}
          <div className="w-full sm:w-auto">
            <label htmlFor="blog-font" className="sr-only">Font</label>
            <select
              id="blog-font"
              value={currentFont}
              onChange={(e) => {
                const font = e.target.value;
                if (editor) {
                  if (font === '') {
                    editor.chain().focus().unsetFontFamily().run();
                  } else {
                    editor.chain().focus().setFontFamily(font).run();
                  }
                  setCurrentFont(font);
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            >
              <option value="">Default Font</option>
              <option value="Times New Roman, Times, serif">Times New Roman</option>
              <option value="Arial, Helvetica, sans-serif">Arial</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="Helvetica, Arial, sans-serif">Helvetica</option>
            </select>
          </div>

          {/* Line Spacing */}
          <div className="w-full sm:w-auto">
            <label htmlFor="blog-line-spacing" className="sr-only">Line Spacing</label>
            <select
              id="blog-line-spacing"
              value={lineSpacing}
              onChange={(e) => setLineSpacing(parseFloat(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            >
              <option value={1.0}>Spacing 1.0</option>
              <option value={1.2}>Spacing 1.2</option>
              <option value={1.5}>Spacing 1.5</option>
              <option value={1.6}>Spacing 1.6</option>
              <option value={1.8}>Spacing 1.8</option>
              <option value={2.0}>Spacing 2.0</option>
            </select>
          </div>

          {/* Text Size — only affects new/selected text */}
          <div className="w-full sm:w-auto">
            <label htmlFor="blog-font-size" className="sr-only">Text Size</label>
            <select
              id="blog-font-size"
              value={fontSize}
              onChange={(e) => {
                const size = e.target.value;
                setFontSize(parseInt(size, 10));
                if (editor) {
                  editor.chain().focus().setMark('textStyle', { fontSize: `${size}px` }).run();
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            >
              <option value={8}>8px</option>
              <option value={10}>10px</option>
              <option value={12}>12px</option>
              <option value={14}>14px</option>
              <option value={16}>16px</option>
              <option value={18}>18px</option>
              <option value={20}>20px</option>
            </select>
          </div>

          <div className="flex-1">
            <label htmlFor="blog-tags" className="sr-only">Tags</label>
            <input
              id="blog-tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tags (comma-separated)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>
        </div>

        <label htmlFor="blog-excerpt" className="sr-only">Excerpt</label>
        <textarea
          id="blog-excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Write a brief excerpt..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24 resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
        />
      </div>

      {/* Editor Action Bar — always visible above editor */}
      <div className="px-8 pb-2 flex flex-wrap items-center gap-2 border-b border-gray-100">
        <button
          onClick={handleImageUpload}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          Image
        </button>
        <button
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          Divider
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Code
        </button>
      </div>

      {/* Main Editor */}
      <div className="relative" ref={editorWrapperRef}>
        {/* Floating Format Menu */}
        {editor && (
          <BubbleMenu
            editor={editor}
            shouldShow={({ editor }) => !editor.isActive('image')}
            tippyOptions={{ duration: 100 }}
            className="flex items-center bg-white shadow-lg rounded-md border"
          >
            <div className="flex items-center divide-x divide-gray-200">
              <div className="flex items-center px-2">
                <FloatingButton
                  icon="H1"
                  title="Heading 1"
                  action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  isActive={() => editor.isActive('heading', { level: 1 })}
                />
                <FloatingButton
                  icon="H2"
                  title="Heading 2"
                  action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  isActive={() => editor.isActive('heading', { level: 2 })}
                />
                <FloatingButton
                  icon="B"
                  title="Bold"
                  action={() => editor.chain().focus().toggleBold().run()}
                  isActive={() => editor.isActive('bold')}
                />
                <FloatingButton
                  icon="I"
                  title="Italic"
                  action={() => editor.chain().focus().toggleItalic().run()}
                  isActive={() => editor.isActive('italic')}
                />
              </div>

              <div className="flex items-center px-2">
                <FloatingButton
                  icon="🔗"
                  title="Add link"
                  action={() => {
                    const url = window.prompt('Enter URL');
                    if (url) {
                      editor.chain().focus().setLink({ href: url }).run();
                    }
                  }}
                  isActive={() => editor.isActive('link')}
                />
                <FloatingButton
                  icon="❞"
                  title="Quote"
                  action={() => editor.chain().focus().toggleBlockquote().run()}
                  isActive={() => editor.isActive('blockquote')}
                />
              </div>
            </div>
          </BubbleMenu>
        )}

        {/* Image Toolbar (shown when image is selected) */}
        {editor && (
          <BubbleMenu
            editor={editor}
            shouldShow={({ editor }) => editor.isActive('image')}
            tippyOptions={{
              duration: 100,
              placement: 'top',
              offset: [0, 12],
              zIndex: 99,
            }}
            className="image-toolbar text-gray-700"
          >
            {/* Alignment controls */}
            <div className="flex items-center gap-0.5 pr-1 border-r border-gray-200 mr-1">
              <button
                onClick={() => setImageAlignment('left')}
                className={`p-1.5 rounded hover:bg-gray-100 ${isAlignmentActive('left') ? 'bg-gray-200' : ''}`}
                type="button" title="Align Left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setImageAlignment('center')}
                className={`p-1.5 rounded hover:bg-gray-100 ${isAlignmentActive('center') ? 'bg-gray-200' : ''}`}
                type="button" title="Align Center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setImageAlignment('right')}
                className={`p-1.5 rounded hover:bg-gray-100 ${isAlignmentActive('right') ? 'bg-gray-200' : ''}`}
                type="button" title="Align Right"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm4 4a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Size controls with labels */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setImageWidth('100%')}
                className={`px-2 py-1 text-xs font-medium rounded hover:bg-gray-100 ${isWidthActive('100%') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
                type="button" title="Full Width"
              >Full</button>
              <button
                onClick={() => setImageWidth('75%')}
                className={`px-2 py-1 text-xs font-medium rounded hover:bg-gray-100 ${isWidthActive('75%') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
                type="button" title="75% Width"
              >75%</button>
              <button
                onClick={() => setImageWidth('50%')}
                className={`px-2 py-1 text-xs font-medium rounded hover:bg-gray-100 ${isWidthActive('50%') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
                type="button" title="50% Width"
              >50%</button>
              <button
                onClick={() => setImageWidth('33%')}
                className={`px-2 py-1 text-xs font-medium rounded hover:bg-gray-100 ${isWidthActive('33%') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
                type="button" title="33% Width"
              >33%</button>
            </div>
          </BubbleMenu>
        )}

        {/* Editor Content */}
        <EditorContent editor={editor} />

        {/* Old floating toolbar removed — actions now in inline toolbar above editor */}
      </div>

      {/* Submit Bar */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <p className="hidden sm:block">Your changes are saved locally until you publish.</p>
          {saveStatus === 'saving' && (
            <span className="inline-flex items-center text-gray-500" aria-live="polite">
              <span className="mr-2 inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
              Saving…
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="inline-flex items-center text-gray-600" aria-live="polite">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0L3.293 9.207A1 1 0 114.707 7.793l3.043 3.043 6.543-6.543a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Saved
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={handleSubmit}
            className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
            type="button"
          >
            Publish Draft
          </button>
          {errorMessage && (
            <p className="text-sm text-red-600 max-w-xs text-right" role="alert" aria-live="assertive">
              {errorMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;