
'use client';

import { create } from 'zustand';
import { getActiveTextarea, insertTextInInput } from '@/lib/editor-utils';

interface EquationState {
  input: string;
  normalizedExpression: string;
  setInput: (input: string) => void;
  insertText: (text: string) => void;
}

export const useEquationStore = create<EquationState>((set, get) => ({
  input: 'y = x^2',
  normalizedExpression: 'x^2',
  setInput: (input: string) => {
    const expr = input.replace(/^\s*y\s*=\s*/i, "").trim();
    set({ input, normalizedExpression: expr });
  },
  insertText: (text) => {
    const textarea = getActiveTextarea();
    if (!textarea) return;

    const { newText, cursorPos } = insertTextInInput(get().input, text, textarea);
    
    get().setInput(newText);

    requestAnimationFrame(() => {
      textarea.selectionStart = textarea.selectionEnd = cursorPos;
      textarea.focus();
    });
  },
}));
