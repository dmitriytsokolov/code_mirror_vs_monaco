// Macro utilities for both CodeMirror and Monaco editors

export const MACROS = {
  foreach: {
    name: 'foreach',
    type: 'function',
    description: 'For each loop with null check',
    template: 'for (if(${1:var}) ${1:var} else [null])',
    placeholder: '${1:var}'
  },
  ifelse: {
    name: 'ifelse',
    type: 'function',
    description: 'If-else statement with null check',
    template: 'if (${1:condition}) {\n  ${2:action}\n} else {\n  ${3:fallback}\n}',
    placeholder: '${1:condition}'
  },
  function: {
    name: 'function',
    type: 'function',
    description: 'Function declaration',
    template: 'function ${1:name}(${2:params}) {\n  ${3:body}\n}',
    placeholder: '${1:name}'
  },
  arrow: {
    name: 'New column',
    type: 'text',
    description: 'Add new column',
    template: '"${1:columnName}": ${2:value}',
    placeholder: '${1:columnName}'
  },
  trycatch: {
    name: 'variable',
    type: 'variable',
    description: 'New variable declaration',
    template: 'let ${1:variableName} = (${2:value})',
    placeholder: '${1:variableName}'
  },
  // Add more YAML-specific macros
  yamlKey: {
    name: 'yaml-key',
    type: 'field',
    description: 'YAML key-value pair',
    template: '${1:key}: ${2:value}',
    placeholder: '${1:key}'
  },
  yamlArray: {
    name: 'yaml-array',
    type: 'field',
    description: 'YAML array item',
    template: '- ${1:item}',
    placeholder: '${1:item}'
  },
  yamlObject: {
    name: 'yaml-object',
    type: 'field',
    description: 'YAML object structure',
    template: '${1:objectName}:\n  ${2:key}: ${3:value}',
    placeholder: '${1:objectName}'
  },
  yamlMultiline: {
    name: 'yaml-multiline',
    type: 'field',
    description: 'YAML multiline string',
    template: '${1:key}: |\n  ${2:line1}\n  ${3:line2}',
    placeholder: '${1:key}'
  },
  yamlAnchor: {
    name: 'yaml-anchor',
    type: 'field',
    description: 'YAML anchor',
    template: '&${1:anchorName} ${2:value}',
    placeholder: '${1:anchorName}'
  },
  yamlAlias: {
    name: 'yaml-alias',
    type: 'field',
    description: 'YAML alias',
    template: '*${1:aliasName}',
    placeholder: '${1:aliasName}'
  }
};

// Get all available macros
export const getAvailableMacros = () => {
  return Object.values(MACROS);
};

// Find macro by name
export const findMacro = (name) => {
  return MACROS[name.toLowerCase()];
};

// Apply macro at cursor position
export const applyMacro = (macro, editor, position) => {
  if (!macro || !editor) return false;
  
  const template = macro.template;
  const placeholder = macro.placeholder;
  
  // Find placeholder position in template
  const placeholderIndex = template.indexOf(placeholder);
  if (placeholderIndex === -1) return false;
  
  // Split template into before and after placeholder
  const beforePlaceholder = template.substring(0, placeholderIndex);
  const afterPlaceholder = template.substring(placeholderIndex + placeholder.length);
  
  // Insert the template parts
  const beforeText = beforePlaceholder;
  const afterText = afterPlaceholder;
  
  return {
    beforeText,
    afterText,
    placeholder: placeholder,
    placeholderStart: position + beforeText.length,
    placeholderEnd: position + beforeText.length + placeholder.length
  };
};

// Check if platform is macOS
export const isMacOS = () => {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
};

// Get the appropriate key combination for the platform
export const getMacroKey = () => {
  return isMacOS() ? 'Ctrl-Space' : 'Ctrl-Space';
}; 