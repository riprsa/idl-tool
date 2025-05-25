# Solana IDL Viewer

A simple web-based viewer for Solana IDL (Interface Definition Language) files. This tool helps you visualize and understand the structure of your Solana program's IDL.

## Features

- Upload and view IDL files in a clean, organized interface
- Collapsible sections for accounts, instructions, types, errors, and events
- Responsive grid layout that adapts to different screen sizes
- Support for both standard and custom IDL formats
- Detailed display of account properties, instruction arguments, and type definitions

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (package manager and runtime)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd solana-idl-viewer
```

2. Install dependencies:
```bash
bun install
```

### Development

To run the development server:
```bash
bun run dev
```

The development server will start at http://localhost:3000

### Building

To build the project:
```bash
bun run build
```

The built files will be in the `dist` directory.

### Preview Production Build

To preview the production build:
```bash
bun run preview
```

## Usage

1. Open the application in your web browser
2. Click the "Choose IDL file" button
3. Select your IDL JSON file
4. The viewer will display the contents in an organized, collapsible format

## Supported IDL Formats

The viewer supports both standard and custom IDL formats:

- Standard format with program data nested under a `program` key
- Custom format with program data at the root level

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
