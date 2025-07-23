# CodeMirror vs Monaco Editor Comparison

This React application provides a side-by-side comparison of two popular code editors: **CodeMirror 6** and **Monaco Editor** (the editor that powers VS Code). Both editors are configured to handle YAML files with advanced features including custom linting rules, auto-formatting, and error fixing capabilities.

## Features

### Core Features
- ✅ **YAML Syntax Highlighting** - Both editors provide proper YAML syntax highlighting
- ✅ **Auto-formatting** - Format YAML button to properly indent and structure the code
- ✅ **Custom Linting Rules** - Advanced linting with custom rules:
  - **CamelCase Detection**: Highlights keys that use camelCase and suggests snake_case alternatives
  - **Indentation Validation**: Checks for proper YAML indentation (2 spaces per level)
  - **Missing Comma Detection**: Identifies missing commas in YAML structures
- ✅ **Inline Error Display** - Real-time error and warning indicators
- ✅ **Fix Suggestions** - Context menu with "Fix" options for auto-correctable issues
- ✅ **Fix All Issues** - One-click button to apply all available fixes
- ✅ **Dark Theme** - Modern dark theme for better readability

### Editor-Specific Features

#### CodeMirror 6
- One Dark theme
- Line numbers and bracket matching
- Code folding
- Lint gutter with error indicators
- Lightweight and modular architecture

#### Monaco Editor
- VS Dark theme
- Minimap for navigation
- Advanced code folding
- Built-in IntelliSense
- More feature-rich but larger bundle size

## Initial YAML Content

The application starts with a complex YAML configuration that includes:
- Nested structures with multiple levels
- Multi-line strings with transformations
- Various data types and complex logic
- Examples of camelCase keys (for testing custom linting)

## Custom Linting Rules

### 1. CamelCase Detection
- **Problem**: YAML keys using camelCase format
- **Solution**: Suggests converting to snake_case
- **Example**: `styleTitle` → `style_title`

### 2. Indentation Validation
- **Problem**: Incorrect indentation (not multiples of 2 spaces)
- **Solution**: Auto-fix to proper 2-space indentation
- **Example**: 3 spaces → 2 spaces

### 3. Missing Comma Detection
- **Problem**: Missing commas in YAML structures
- **Solution**: Auto-add missing commas
- **Example**: `key: value` → `key: value,`

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd code_mirror_vs_monaco
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
src/
├── pages/
│   ├── CodeMirrorPage.js    # CodeMirror 6 implementation
│   └── MonacoPage.js        # Monaco Editor implementation
├── utils/
│   └── yamlUtils.js         # Shared YAML utilities and linting
├── App.js                   # Main app with routing
├── index.js                 # App entry point
└── index.css                # Global styles
```

## Technology Stack

- **React 18** - UI framework
- **React Router** - Navigation between editors
- **CodeMirror 6** - Modern, modular code editor
- **Monaco Editor** - VS Code's editor component
- **YAML Parser** - For formatting and validation
- **Custom Linting** - Advanced validation rules

## Comparison Highlights

| Feature | CodeMirror 6 | Monaco Editor |
|---------|---------------|---------------|
| Bundle Size | Smaller | Larger |
| Modularity | Highly modular | Less modular |
| Customization | Easy to customize | More complex |
| Performance | Lightweight | Feature-rich but heavier |
| Learning Curve | Steeper | Easier (VS Code-like) |
| Community | Growing | Well-established |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
