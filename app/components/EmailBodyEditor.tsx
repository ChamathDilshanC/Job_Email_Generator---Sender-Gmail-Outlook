'use client';

import 'react-quill-new/dist/quill.snow.css';
import ReactQuill from 'react-quill-new';

interface EmailBodyEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const TOOLBAR_MODULES = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

export default function EmailBodyEditor({ value, onChange }: EmailBodyEditorProps) {
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      modules={TOOLBAR_MODULES}
      className="[&_.ql-toolbar]:rounded-t-lg [&_.ql-toolbar]:border-border [&_.ql-container]:rounded-b-lg [&_.ql-container]:border-border [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:text-sm"
    />
  );
}
