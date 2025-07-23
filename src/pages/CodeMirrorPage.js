import React, { useState, useCallback, useEffect, useRef } from 'react';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { yaml } from '@codemirror/lang-yaml';
import { lintGutter, linter } from '@codemirror/lint';
import { oneDark } from '@codemirror/theme-one-dark';
import { lineNumbers } from '@codemirror/view';
import { bracketMatching } from '@codemirror/language';
import { keymap } from '@codemirror/view';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { lintYaml, formatYaml, initialYamlContent, applyFix } from '../utils/yamlUtils';

const CodeMirrorPage = () => {
  const [editor, setEditor] = useState(null);
  const [content, setContent] = useState(initialYamlContent);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const editorRef = useRef(null);

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('CodeMirrorPage: Component mounted');
  }, []);

  // Custom linting function for CodeMirror
  const yamlLint = useCallback((view) => {
    const content = view.state.doc.toString();
    const result = lintYaml(content);
    
    return result.errors.map(error => {
      // Validate line number
      if (!error.line || error.line <= 0 || error.line > view.state.doc.lines) {
        console.warn('Invalid line number:', error.line, 'for document with', view.state.doc.lines, 'lines');
        return null; // Skip this error
      }
      
      // Convert line-based positions to character positions for CodeMirror
      const lineStart = view.state.doc.line(error.line).from;
      const from = lineStart + (error.column - 1);
      const to = lineStart + (error.column - 1) + 1;
      
      return {
        from: from,
        to: to,
        severity: error.severity === 'error' ? 'error' : 'warning',
        message: error.message,
        actions: error.fix ? [{
          name: 'Fix',
          apply: (view, from, to) => {
            try {
              // Convert the fix to character-based positions
              const lineStart = view.state.doc.line(error.line).from;
              const fixFrom = lineStart + (error.fix.from || 0);
              const fixTo = lineStart + (error.fix.to || 0);
              
              const newContent = applyFix(content, {
                from: fixFrom,
                to: fixTo,
                insert: error.fix.insert
              });
              
              view.dispatch({
                changes: { from: 0, to: view.state.doc.length, insert: newContent }
              });
            } catch (fixError) {
              console.error('Error applying fix:', fixError);
            }
          }
        }] : undefined
      };
    }).filter(Boolean); // Remove null entries
  }, []);

  // Initialize editor
  useEffect(() => {
    console.log('CodeMirrorPage: Initializing editor, editor:', editor, 'editorRef.current:', editorRef.current);
    if (!editor && editorRef.current) {
      try {
        console.log('CodeMirrorPage: Creating editor state with content:', content);
        const state = EditorState.create({
          doc: content,
          extensions: [
            lineNumbers(),
            bracketMatching(),
            yaml(),
            oneDark,
            lintGutter(),
            linter(yamlLint),
            EditorView.updateListener.of((update) => {
              if (update.docChanged) {
                setContent(update.state.doc.toString());
              }
            }),
            keymap.of([
              indentWithTab,
              ...defaultKeymap
            ]),
            EditorView.theme({
              "&": {
                height: "100%"
              },
              ".cm-scroller": {
                overflow: "auto"
              },
              ".cm-content": {
                padding: "1rem"
              }
            })
          ]
        });

        console.log('CodeMirrorPage: Creating EditorView');
        const view = new EditorView({
          state,
          parent: editorRef.current
        });

        console.log('CodeMirrorPage: EditorView created, setting editor');
        setEditor(view);
      } catch (error) {
        console.error('Error initializing CodeMirror:', error);
        setMessage(`Editor initialization error: ${error.message}`);
        setMessageType('error');
      }
    }
  }, [editor, yamlLint, content]);

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.state.doc.toString()) {
      console.log('CodeMirrorPage: Updating editor content');
      editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: content }
      });
    }
  }, [content, editor]);

  const handleFormat = () => {
    try {
      const formatted = formatYaml(content);
      setContent(formatted);
      setMessage('YAML formatted successfully!');
      setMessageType('success');
    } catch (error) {
      setMessage(`Format error: ${error.message}`);
      setMessageType('error');
    }
  };

  const handleFixAll = () => {
    try {
      const result = lintYaml(content);
      let newContent = content;
      
      // Apply all fixes
      result.errors.forEach(error => {
        if (error.fix) {
          newContent = applyFix(newContent, error.fix);
        }
      });
      
      setContent(newContent);
      setMessage('All issues fixed!');
      setMessageType('success');
    } catch (error) {
      setMessage(`Fix error: ${error.message}`);
      setMessageType('error');
    }
  };

  const clearMessage = useCallback(() => {
    setMessage('');
    setMessageType('');
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(clearMessage, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, clearMessage]);

  return (
    <div>
      <div className="editor-container">
        <div className="editor-header">
          <h2 className="editor-title">CodeMirror 6 Editor</h2>
          <div className="button-group">
            <button className="btn btn-primary" onClick={handleFormat}>
              Format YAML
            </button>
            <button className="btn btn-success" onClick={handleFixAll}>
              Fix All Issues
            </button>
          </div>
        </div>
        
        {message && (
          <div className={`${messageType === 'error' ? 'error-message' : 'success-message'}`}>
            {message}
          </div>
        )}
        
        <div className="editor-wrapper">
          <div 
            ref={editorRef} 
            style={{ 
              height: '100%', 
              overflow: 'auto',
              border: '1px solid #ccc',
              backgroundColor: '#f5f5f5'
            }} 
          />
        </div>
      </div>
      
      <div style={{ marginTop: '1rem' }}>
        <h3>Features:</h3>
        <ul>
          <li>✅ YAML syntax highlighting</li>
          <li>✅ Auto-formatting with Format YAML button</li>
          <li>✅ Custom linting rules (camelCase detection, indentation, missing commas)</li>
          <li>✅ Inline error/warning display</li>
          <li>✅ Fix suggestions in context menu</li>
          <li>✅ Fix All Issues button</li>
          <li>✅ Dark theme (One Dark)</li>
          <li>✅ Line numbers and bracket matching</li>
        </ul>
      </div>
    </div>
  );
};

export default CodeMirrorPage; 