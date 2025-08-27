# CIMut

**Cloud Injection Mutator** - Advanced Code Mutation Testing Platform

CIMut is a web-based tool for performing code mutation testing in cloud environments. It provides a user-friendly interface for fault injection, allowing developers and testers to systematically modify code lines and analyze system behavior under failure conditions.

## Overview

CIMut enables controlled fault injection by allowing users to:
- Connect to remote cloud instances via secure API communication
- Verify current code content at specific line numbers
- Apply targeted mutations to introduce controlled faults
- Monitor the mutation process with real-time feedback

## Features

- **Remote Code Access**: Connect to cloud instances using unique agent identifiers
- **Line Verification**: Preview current code content before applying mutations
- **Targeted Mutations**: Apply specific changes to individual lines of code
- **Real-time Feedback**: Track operation status with visual indicators
- **Modern UI**: Clean, responsive interface built with React and shadcn/ui
- **Error Handling**: Comprehensive error reporting and validation

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **HTTP Client**: Fetch API
- **Routing**: React Router DOM
- **Icons**: Lucide React

## Prerequisites

Before using CIMut, ensure you have:

1. **Node.js** (version 16 or higher)
2. **npm** or **yarn** package manager
3. **CIMut Agent** running on your target cloud environment
4. **API endpoint** configured and accessible

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cimut-web
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory:
```env
VITE_API_URL=https://your-cimut-api-endpoint.com
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080`.

## Usage

### 1. Agent Setup

Before using the web interface, deploy the CIMut agent on your target cloud environment:

- Download the [cimut-agent script](https://github.com/AgiuG/cimut-agent)
- Execute the script in your cloud environment
- Note the unique Agent ID provided after successful deployment

### 2. Configuration

1. **Agent ID**: Enter the unique identifier provided by your deployed agent
2. **File Path**: Specify the absolute path to the target file (e.g., `/opt/stack/nova/nova/objects/block_device.py`)
3. **Line Number**: Indicate the specific line number to target for mutation

### 3. Verification

Click **"Verify Line"** to retrieve and display the current content of the specified line. This step ensures you're targeting the correct code location before applying mutations.

### 4. Mutation Application

1. Enter the new content in the **"New Content"** field
2. Click **"Apply Mutation"** to inject the fault into the target system
3. Monitor the operation status through the visual feedback indicators

## API Integration

CIMut communicates with a backend API through two main endpoints:

- **POST** `/api/agents/{agentId}/verify` - Retrieve current line content
- **POST** `/api/agents/{agentId}/fault` - Apply code mutation

Ensure your API endpoint is properly configured and accessible from the web application.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development environment
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   └── CIMutInterface.tsx # Main application interface
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── pages/               # Page components
└── main.tsx             # Application entry point
```

### Code Quality

This project uses:
- **ESLint** for code linting
- **TypeScript** for type safety
- **Prettier** (recommended) for code formatting

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the `dist` folder to your web server or hosting platform

3. Ensure environment variables are properly configured for production

## Security Considerations

- Ensure API endpoints use HTTPS in production
- Implement proper authentication and authorization
- Validate and sanitize all input data
- Monitor agent communications for suspicious activity
- Regularly update dependencies to address security vulnerabilities

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For issues, questions, or contributions, please refer to the project's issue tracker or contact the development team.

---

**Note**: CIMut is designed for controlled testing environments. Always ensure proper backup and recovery procedures are in place before applying mutations to production systems.
