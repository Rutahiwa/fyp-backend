'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Strikethrough, List, ListOrdered, Link as LinkIcon, Heading2 } from 'lucide-react';
import { useEffect } from 'react';

export function RichTextEditor({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      })
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content',
      },
    },
  });

  // Sync external changes (like resetting form)
  useEffect(() => {
    if (editor && value === '' && editor.getHTML() !== '<p></p>') {
      editor.commands.setContent('');
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    
    if (url === null) {
      return;
    }
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={{ ...styles.toolbarBtn, ...(editor.isActive('bold') ? styles.toolbarBtnActive : {}) }}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          style={{ ...styles.toolbarBtn, ...(editor.isActive('italic') ? styles.toolbarBtnActive : {}) }}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          style={{ ...styles.toolbarBtn, ...(editor.isActive('strike') ? styles.toolbarBtnActive : {}) }}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>
        
        <div style={styles.divider} />
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          style={{ ...styles.toolbarBtn, ...(editor.isActive('heading', { level: 2 }) ? styles.toolbarBtnActive : {}) }}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          style={{ ...styles.toolbarBtn, ...(editor.isActive('bulletList') ? styles.toolbarBtnActive : {}) }}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          style={{ ...styles.toolbarBtn, ...(editor.isActive('orderedList') ? styles.toolbarBtnActive : {}) }}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
        
        <div style={styles.divider} />
        
        <button
          type="button"
          onClick={setLink}
          style={{ ...styles.toolbarBtn, ...(editor.isActive('link') ? styles.toolbarBtnActive : {}) }}
          title="Add Link"
        >
          <LinkIcon size={16} />
        </button>
      </div>

      <EditorContent editor={editor} style={styles.content} className="tiptap-wrapper" />
      
      <style dangerouslySetInnerHTML={{__html: `
        .tiptap-editor-content {
          min-height: 200px;
          outline: none;
        }
        .tiptap-editor-content p {
          margin-top: 0;
          margin-bottom: 0.5em;
        }
        .tiptap-editor-content ul, .tiptap-editor-content ol {
          padding-left: 20px;
          margin: 0;
        }
        .tiptap-editor-content a {
          color: var(--info);
          text-decoration: underline;
        }
        .tiptap-editor-content h2 {
          font-size: 1.5em;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }
      `}} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--bg)',
    overflow: 'hidden',
  },
  toolbar: {
    display: 'flex',
    gap: '4px',
    padding: '8px',
    backgroundColor: 'var(--surface-2)',
    borderBottom: '1px solid var(--border)',
    flexWrap: 'wrap',
  },
  divider: {
    width: '1px',
    backgroundColor: 'var(--border)',
    margin: '0 4px',
  },
  toolbarBtn: {
    padding: '6px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarBtnActive: {
    backgroundColor: 'var(--surface-hover)',
    color: 'var(--text)',
  },
  content: {
    padding: '16px',
    color: 'var(--text)',
    fontSize: '14px',
    lineHeight: 1.6,
  }
};
