import React, { useState, useEffect, useRef, useCallback } from 'react';
import { lintYaml, formatYaml, initialYamlContent, applyFix } from '../utils/yamlUtils';

const MonacoPage = () => {
  const [editor, setEditor] = useState(null);
  const [content, setContent] = useState(initialYamlContent);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  // Initialize Monaco editor
  useEffect(() => {
    if (!editor && editorRef.current) {
      console.log('MonacoPage: Initializing Monaco editor');
      
      // Dynamically import Monaco to ensure it's loaded
      import('monaco-editor').then((monaco) => {
        try {
          console.log('MonacoPage: Monaco loaded successfully');
          
          // Store Monaco instance
          monacoRef.current = monaco;
          
          // Create editor with explicit content
          const monacoEditor = monaco.editor.create(editorRef.current, {
            value: initialYamlContent,
            language: 'yaml',
            theme: 'vs-dark',
            automaticLayout: true,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible'
            },
            folding: true,
            bracketPairColorization: {
              enabled: true
            },
            wordWrap: 'on',
            readOnly: false
          });

          console.log('MonacoPage: Editor created successfully');

          // Set up custom linting
          const updateDiagnostics = () => {
            const currentContent = monacoEditor.getValue();
            const result = lintYaml(currentContent);
            
            const diagnostics = result.errors.map(error => ({
              startLineNumber: error.line,
              startColumn: error.column,
              endLineNumber: error.line,
              endColumn: error.column + 1,
              message: error.message,
              severity: error.severity === 'error' ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
              code: error.fix ? 'FIX_AVAILABLE' : undefined,
              tags: error.fix ? [monaco.MarkerTag.Unnecessary] : undefined
            }));

            // Set the diagnostics
            monaco.editor.setModelMarkers(monacoEditor.getModel(), 'yaml-custom', diagnostics);
          };

          // Update diagnostics when content changes
          monacoEditor.onDidChangeModelContent(() => {
            const newContent = monacoEditor.getValue();
            setContent(newContent);
            updateDiagnostics();
          });

          // Initial diagnostics
          updateDiagnostics();

          setEditor(monacoEditor);

        } catch (error) {
          console.error('Error creating Monaco editor:', error);
          setMessage(`Editor creation error: ${error.message}`);
          setMessageType('error');
        }
      }).catch((error) => {
        console.error('Error loading Monaco:', error);
        setMessage(`Monaco loading error: ${error.message}`);
        setMessageType('error');
      });
    }
  }, [editor]);

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getValue()) {
      editor.setValue(content);
    }
  }, [content, editor]);

  // Update linting when content changes
  const updateLinting = useCallback(() => {
    if (editor && window.monaco) {
      const currentContent = editor.getValue();
      const result = lintYaml(currentContent);
      
      const diagnostics = result.errors.map(error => ({
        startLineNumber: error.line,
        startColumn: error.column,
        endLineNumber: error.line,
        endColumn: error.column + 1,
        message: error.message,
        severity: error.severity === 'error' ? window.monaco.MarkerSeverity.Error : window.monaco.MarkerSeverity.Warning,
        code: error.fix ? 'FIX_AVAILABLE' : undefined,
        tags: error.fix ? [window.monaco.MarkerTag.Unnecessary] : undefined
      }));

      // Set the diagnostics
      window.monaco.editor.setModelMarkers(editor.getModel(), 'yaml-custom', diagnostics);
    }
  }, [editor]);

  useEffect(() => {
    if (editor && window.monaco) {
      updateLinting();
    }
  }, [content, editor, updateLinting]);

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
          <h2 className="editor-title">Monaco Editor</h2>
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
              width: '100%',
              border: '1px solid #ccc',
              backgroundColor: '#1e1e1e',
              minHeight: '400px'
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
          <li>✅ Dark theme (VS Dark)</li>
          <li>✅ Line numbers and bracket matching</li>
          <li>✅ Minimap</li>
          <li>✅ Folding</li>
        </ul>
      </div>
    </div>
  );
};

export default MonacoPage; 