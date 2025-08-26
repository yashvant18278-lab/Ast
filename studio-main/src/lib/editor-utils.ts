
export function getActiveTextarea(id?: string): HTMLTextAreaElement | null {
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLTextAreaElement) {
        if (!id || activeElement.id === id) {
            return activeElement;
        }
    }
    // Fallback if no textarea is focused
    return document.querySelector(id ? `textarea#${id}` : 'textarea');
}

export function insertTextInInput(currentInput: string, text: string, textarea: HTMLTextAreaElement): {newText: string, cursorPos: number} {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    let newText = '';
    let cursorPos = start;

    if (text === 'backspace') {
      if (start === end && start > 0) {
        // If no selection, delete one character before the cursor
        newText = currentInput.substring(0, start - 1) + currentInput.substring(end);
        cursorPos = start - 1;
      } else if (start !== end) {
        // If there is a selection, delete the selected text
        newText = currentInput.substring(0, start) + currentInput.substring(end);
        cursorPos = start;
      } else {
        // Nothing to delete
        newText = currentInput;
        cursorPos = start;
      }
    } else {
        const functionsWithParens = ['sin()', 'cos()', 'tan()', 'log()', 'ln()', 'exp()', 'sqrt()', '^()'];

        if (functionsWithParens.includes(text)) {
          newText = `${currentInput.substring(0, start)}${text}${currentInput.substring(end)}`;
          cursorPos = start + text.length - 1;
        } else if (text === '||') {
          const selection = currentInput.substring(start, end);
          newText = `${currentInput.substring(0, start)}abs(${selection})${currentInput.substring(end)}`;
          if (selection) {
            cursorPos = start + `abs(${selection})`.length;
          } else {
            cursorPos = start + 4;
          }
        } else {
          newText = currentInput.substring(0, start) + text + currentInput.substring(end);
          cursorPos = start + text.length;
        }
    }
    return { newText, cursorPos };
}
