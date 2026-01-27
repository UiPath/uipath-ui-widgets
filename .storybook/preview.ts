import type { Preview } from '@storybook/react-vite';

// Mock fetch for UiPath SDK API calls in Storybook
const originalFetch = window.fetch;

window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

  let folderId: number | null = null;
  let agentId: number | null = null;
  
  // Try pattern: /agent/{folderId}/{agentId}
  const folderAgentMatch = url.match(/\/agent\/(\d+)\/(\d+)/);
  if (folderAgentMatch) {
    folderId = parseInt(folderAgentMatch[1]);
    agentId = parseInt(folderAgentMatch[2]);

    const mockAgent = {
      id: agentId || 1,
      name: 'Demo Assistant',
      folderId: folderId || 100,
      appearance: {
        welcomeTitle: `Welcome to 'Demo Assistant'`,
        welcomeDescription: 'I can help you with various tasks.',
        startingPrompts: [
          { displayPrompt: 'Get started', actualPrompt: 'How do I get started?' }
        ]
      }
    };
    return new Response(JSON.stringify(mockAgent), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Mock conversation creation endpoint
  if (url.includes('/conversations') && (init?.method === 'POST' || url.includes('create'))) {
    return new Response(JSON.stringify({
      conversationId: `conv-${Date.now()}`,
      createdAt: new Date().toISOString()
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Mock attachment upload endpoint
  if (url.includes('/attachments') && (init?.method === 'POST' || init?.method === 'PUT')) {
    return new Response(JSON.stringify({
      uri: `file://uploaded-${Date.now()}.txt`,
      name: 'uploaded-file.txt',
      mimeType: 'text/plain'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Mock all other UiPath API calls to prevent errors
  if (url.includes('mock.uipath.com') || url.includes('uipath.com')) {
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // For all other requests, use the original fetch
  return originalFetch(input, init);
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => {
      if (typeof document !== 'undefined') {
        document.body.classList.add('light');
      }
      return Story();
    },
  ],
};

export default preview;
