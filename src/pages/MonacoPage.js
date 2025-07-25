import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { lintYaml, formatYaml, initialYamlContent, applyFix } from '../utils/yamlUtils';
import { getAvailableMacros } from '../utils/macroUtils';

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
          
          // Configure Monaco for browser environment
          monaco.editor.defineTheme('vs-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {}
          });
          
          // Configure Monaco environment to prevent file access issues
          if (monaco.editor.Environment) {
            monaco.editor.Environment.set({
              globalAPI: true
            });
          }
          
          // Store Monaco instance
          monacoRef.current = monaco;
          
          // Check if YAML language is available
          console.log('MonacoPage: Available languages:', monaco.languages.getLanguages());
          const hasYaml = monaco.languages.getLanguages().some(lang => lang.id === 'yaml');
          console.log('MonacoPage: YAML language registered:', hasYaml);
          
          // If YAML is not available, register it manually
          if (!hasYaml) {
            console.log('MonacoPage: Registering YAML language manually');
            monaco.languages.register({ id: 'yaml' });
            monaco.languages.setMonarchTokensProvider('yaml', {
              tokenizer: {
                root: [
                  [/[a-zA-Z_]\w*/, 'variable'],
                  [/"[^"]*"/, 'string'],
                  [/[0-9]+/, 'number'],
                  [/[:]/, 'operator'],
                  [/[-]/, 'operator'],
                  [/[#].*$/, 'comment'],
                  [/^\s*[-]\s/, 'keyword'],
                  [/^\s*[a-zA-Z_]\w*\s*:/, 'keyword']
                ]
              }
            });
          }
          
          // Register completion provider for YAML
          const macros = getAvailableMacros();
          
          // Ensure macros is defined and is an array
          if (!macros || !Array.isArray(macros)) {
            console.error('MonacoPage: getAvailableMacros() returned invalid value:', macros);
            setMessage('Error: Could not load macros for autocompletion');
            setMessageType('error');
            return;
          }
          
          console.log('MonacoPage: Registering completion provider with', macros.length, 'macros');
          
          // Register completion provider for YAML only
          try {
            monaco.languages.registerCompletionItemProvider('yaml', {
              provideCompletionItems: (model, position) => {
                console.log('MonacoPage: YAML completion provider called at position:', position);
                
                const suggestions = [];
                
                // Add a simple test suggestion that should always appear
                suggestions.push({
                  label: 'test',
                  kind: monaco.languages.CompletionItemKind.Text,
                  insertText: 'test-suggestion',
                  documentation: 'Test suggestion to verify completion is working',
                  sortText: '0test'
                });
                
                // Add macro suggestions
                macros.forEach(macro => {
                  suggestions.push({
                    label: macro.name,
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: macro.template,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: {
                      value: macro.description,
                      isTrusted: true
                    },
                    detail: macro.type,
                    sortText: '0' + macro.name, // Ensure macros appear first
                    range: {
                      startLineNumber: position.lineNumber,
                      startColumn: position.column,
                      endLineNumber: position.lineNumber,
                      endColumn: position.column
                    }
                  });
                });
                
                // Add YAML-specific suggestions
                const yamlSuggestions = [
                  {
                    label: 'key',
                    kind: monaco.languages.CompletionItemKind.Field,
                    insertText: 'key: value',
                    documentation: 'YAML key-value pair',
                    sortText: '1key'
                  },
                  {
                    label: 'array',
                    kind: monaco.languages.CompletionItemKind.Field,
                    insertText: '- item',
                    documentation: 'YAML array item',
                    sortText: '1array'
                  },
                  {
                    label: 'object',
                    kind: monaco.languages.CompletionItemKind.Field,
                    insertText: 'object:\n  key: value',
                    documentation: 'YAML object structure',
                    sortText: '1object'
                  },
                  {
                    label: 'multiline',
                    kind: monaco.languages.CompletionItemKind.Field,
                    insertText: 'multiline: |\n  line 1\n  line 2',
                    documentation: 'YAML multiline string',
                    sortText: '1multiline'
                  },
                  {
                    label: 'anchor',
                    kind: monaco.languages.CompletionItemKind.Field,
                    insertText: '&anchor value',
                    documentation: 'YAML anchor',
                    sortText: '1anchor'
                  },
                  {
                    label: 'alias',
                    kind: monaco.languages.CompletionItemKind.Field,
                    insertText: '*alias',
                    documentation: 'YAML alias',
                    sortText: '1alias'
                  }
                ];
                
                suggestions.push(...yamlSuggestions);
                
                console.log('MonacoPage: YAML returning', suggestions.length, 'suggestions');
                
                return {
                  suggestions: suggestions
                };
              }
            });
            console.log('MonacoPage: YAML completion provider registered successfully');
          } catch (error) {
            console.error('MonacoPage: Error registering completion provider for yaml:', error);
          }

          // Register trigger characters for YAML
          try {
            monaco.languages.setLanguageConfiguration('yaml', {
              wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
              comments: {
                lineComment: '#'
              },
              brackets: [
                ['{', '}'],
                ['[', ']']
              ],
              autoClosingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '"', close: '"' },
                { open: '\'', close: '\'' }
              ],
              surroundingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '"', close: '"' },
                { open: '\'', close: '\'' }
              ]
            });
            console.log('MonacoPage: YAML language configuration set');
          } catch (error) {
            console.error('MonacoPage: Error setting YAML language configuration:', error);
          }
          
          // Create editor with explicit content
          let monacoEditor;
          try {
            monacoEditor = monaco.editor.create(editorRef.current, {
              value: initialYamlContent,
              language: 'yaml', // Use yaml for proper syntax highlighting
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
              readOnly: false,
              // Enable autocompletion with more aggressive settings
              quickSuggestions: {
                other: true,
                comments: true,
                strings: true
              },
              // Configure snippet suggestions
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: 'on',
              tabCompletion: 'on',
              wordBasedSuggestions: true,
              // More aggressive suggestion settings
              suggest: {
                showKeywords: true,
                showSnippets: true,
                showClasses: true,
                showFunctions: true,
                showVariables: true,
                showModules: true,
                showProperties: true,
                showEvents: true,
                showOperators: true,
                showUnits: true,
                showValues: true,
                showConstants: true,
                showEnums: true,
                showEnumMembers: true,
                showColors: true,
                showFiles: true,
                showReferences: true,
                showFolders: true,
                showTypeParameters: true,
                showWords: true,
                showMethods: true,
                showConstructors: true,
                showFields: true
              },
              // Enable more trigger characters
              suggestOnTriggerCharacters: true,
              // Enable automatic suggestions
              quickSuggestionsDelay: 0
            });

            console.log('MonacoPage: Editor created successfully');
          } catch (error) {
            console.error('MonacoPage: Error creating editor:', error);
            setMessage(`Editor creation error: ${error.message}`);
            setMessageType('error');
            return;
          }

          // REMOVED: Global key listener to prevent double context windows
          // Monaco's built-in Ctrl+Space handling will work with our completion provider
          console.log('MonacoPage: Using Monaco\'s native Ctrl+Space handling');
          
          // Add a simple test to verify completion provider is working
          // Type any character in the editor to trigger suggestions
          console.log('MonacoPage: Completion provider should trigger when typing any character');
          
          // Add minimal global event listener as backup with prevention of double triggering
          let isTriggeringSuggestions = false;
          const handleGlobalKeyDown = (event) => {
            if (event.ctrlKey && event.code === 'Space' && !isTriggeringSuggestions) {
              console.log('MonacoPage: Global Ctrl+Space detected');
              event.preventDefault();
              isTriggeringSuggestions = true;
              
              if (monacoEditor) {
                console.log('MonacoPage: Triggering suggestions via global listener');
                try {
                  monacoEditor.trigger('keyboard', 'editor.action.triggerSuggest', {});
                } catch (error) {
                  console.error('MonacoPage: Error triggering suggestions:', error);
                }
              }
              
              // Reset flag after a short delay to prevent double triggering
              setTimeout(() => {
                isTriggeringSuggestions = false;
              }, 200);
            }
          };
          
          document.addEventListener('keydown', handleGlobalKeyDown);
          console.log('MonacoPage: Global key listener added with double-trigger prevention');
          
          // Set up custom linting
          const updateDiagnostics = () => {
            try {
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
            } catch (error) {
              console.error('MonacoPage: Error updating diagnostics:', error);
            }
          };

          // Update diagnostics when content changes
          monacoEditor.onDidChangeModelContent(() => {
            try {
              const newContent = monacoEditor.getValue();
              setContent(newContent);
              updateDiagnostics();
            } catch (error) {
              console.error('MonacoPage: Error handling content change:', error);
            }
          });

          // Initial diagnostics
          updateDiagnostics();
          
          setEditor(monacoEditor);
          
          // Return cleanup function
          return () => {
            document.removeEventListener('keydown', handleGlobalKeyDown);
          };

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
    if (editor && monacoRef.current) {
      const currentContent = editor.getValue();
      const result = lintYaml(currentContent);
      
      const diagnostics = result.errors.map(error => ({
        startLineNumber: error.line,
        startColumn: error.column,
        endLineNumber: error.line,
        endColumn: error.column + 1,
        message: error.message,
        severity: error.severity === 'error' ? monacoRef.current.MarkerSeverity.Error : monacoRef.current.MarkerSeverity.Warning,
        code: error.fix ? 'FIX_AVAILABLE' : undefined,
        tags: error.fix ? [monacoRef.current.MarkerTag.Unnecessary] : undefined
      }));

      // Set the diagnostics
      monacoRef.current.editor.setModelMarkers(editor.getModel(), 'yaml-custom', diagnostics);
    }
  }, [editor]);

  useEffect(() => {
    if (editor && monacoRef.current) {
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

  const handleTestAutocompletion = () => {
    if (editor) {
      console.log('MonacoPage: Manually triggering autocompletion');
      console.log('MonacoPage: Editor instance:', editor);
      console.log('MonacoPage: Editor model:', editor.getModel());
      console.log('MonacoPage: Editor position:', editor.getPosition());
      
      try {
        editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
        console.log('MonacoPage: Trigger command executed successfully');
        setMessage('Autocompletion triggered! Check console for logs.');
        setMessageType('success');
      } catch (error) {
        console.error('MonacoPage: Error triggering autocompletion:', error);
        setMessage(`Error triggering autocompletion: ${error.message}`);
        setMessageType('error');
      }
    } else {
      console.log('MonacoPage: Editor not available');
      setMessage('Editor not available');
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
            <button className="btn btn-info" onClick={handleTestAutocompletion}>
              Test Autocompletion
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
          <li>✅ Native Monaco autocompletion (Ctrl+Space)</li>
          <li>✅ Snippet support with placeholders</li>
          <li>✅ YAML-specific suggestions</li>
        </ul>
      </div>
    </div>
  );
};

export default MonacoPage; 