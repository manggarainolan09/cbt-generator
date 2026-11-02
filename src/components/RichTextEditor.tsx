import React, { useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, List, ListOrdered, Image as ImageIcon, 
  Sigma, Eraser, Sparkles 
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
  onOpenLatex?: () => void;
  compact?: boolean;
}

export function resizeImage(file: File, maxDim: number, cb: (dataUrl: string) => void): void {
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const format = file.type.includes('png') ? 'image/png' : 'image/jpeg';
        cb(canvas.toDataURL(format, 0.85));
      }
    };
    img.src = ev.target?.result as string;
  };
  reader.readAsDataURL(file);
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Tulis soal... gunakan $rumus$ untuk LaTeX atau copas gambar (Ctrl+V)',
  minHeight = '100px',
  onOpenLatex,
  compact = false
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInternalChangeRef = useRef(false);

  // Sync initial or external value
  useEffect(() => {
    if (editorRef.current && !isInternalChangeRef.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
    isInternalChangeRef.current = false;
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isInternalChangeRef.current = true;
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCmd = (cmd: string, val: string | null = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(cmd, false, val ?? undefined);
      handleInput();
    }
  };

  // Paste handler: intercept copied images (Ctrl+V from screenshots / web / clipboard)
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          resizeImage(file, 650, (dataUrl) => {
            if (editorRef.current) {
              editorRef.current.focus();
              try {
                if (!document.execCommand('insertImage', false, dataUrl)) {
                  editorRef.current.innerHTML += `<img src="${dataUrl}" class="max-w-full my-2 rounded-lg border border-slate-200">`;
                }
              } catch (x) {
                editorRef.current.innerHTML += `<img src="${dataUrl}" class="max-w-full my-2 rounded-lg border border-slate-200">`;
              }
              handleInput();
            }
          });
          return;
        }
      }
    }
  };

  // Drag and drop image files directly into editor
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      e.preventDefault();
      resizeImage(file, 650, (dataUrl) => {
        if (editorRef.current) {
          editorRef.current.focus();
          document.execCommand('insertImage', false, dataUrl);
          handleInput();
        }
      });
    }
  };

  const handleInsertImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    resizeImage(file, 650, (dataUrl) => {
      if (editorRef.current) {
        editorRef.current.focus();
        document.execCommand('insertImage', false, dataUrl);
        handleInput();
      }
    });
    e.target.value = '';
  };

  const handleClearFormat = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText;
      editorRef.current.innerHTML = '';
      if (text) {
        editorRef.current.textContent = text;
      }
      handleInput();
    }
  };

  return (
    <div className="border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-2xs focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition">
      {/* Toolbar */}
      <div className={`flex flex-wrap items-center gap-1 bg-slate-100 border-b border-slate-200 ${
        compact ? 'p-1 text-[11px]' : 'p-1.5 text-xs'
      }`}>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); executeCmd('bold'); }}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition"
          title="Tebal (Ctrl+B)"
        >
          <Bold className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        </button>

        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); executeCmd('italic'); }}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition"
          title="Miring (Ctrl+I)"
        >
          <Italic className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        </button>

        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); executeCmd('underline'); }}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition"
          title="Garis Bawah (Ctrl+U)"
        >
          <Underline className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        </button>

        <div className="w-px h-4 bg-slate-300 mx-0.5" />

        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); executeCmd('insertUnorderedList'); }}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition"
          title="Daftar Butir (Bullet)"
        >
          <List className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        </button>

        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); executeCmd('insertOrderedList'); }}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition"
          title="Daftar Bernomor (Numbered)"
        >
          <ListOrdered className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        </button>

        <div className="w-px h-4 bg-slate-300 mx-0.5" />

        {/* Sisipkan Gambar File */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
          className="px-2 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold flex items-center gap-1 transition"
          title="Sisipkan gambar dari file (atau copas gambar langsung lewat Ctrl+V)"
        >
          <ImageIcon className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5 text-indigo-600'} />
          <span className="text-[11px]">Gambar</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleInsertImageFile}
          className="hidden"
        />

        {/* LaTeX Math Formula Assistant */}
        {onOpenLatex && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onOpenLatex(); }}
            className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-bold flex items-center gap-1 transition"
            title="Sisipkan rumus LaTeX ($)"
          >
            <Sigma className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
            <span className="text-[11px]">LaTeX</span>
          </button>
        )}

        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); handleClearFormat(); }}
          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 ml-auto transition"
          title="Bersihkan format teks"
        >
          <Eraser className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        </button>
      </div>

      {/* Contenteditable Canvas */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        onPaste={handlePaste}
        onDrop={handleDrop}
        style={{ minHeight }}
        data-placeholder={placeholder}
        className="p-3 text-xs sm:text-sm text-slate-800 leading-relaxed outline-none overflow-y-auto max-h-96 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 [&_img]:max-w-full [&_img]:max-h-64 [&_img]:rounded-xl [&_img]:my-2 [&_img]:border [&_img]:border-slate-200 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
      />
    </div>
  );
};
