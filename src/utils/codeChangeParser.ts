
export interface CodeBlock {
  id: string;
  language: string;
  code: string;
  filename?: string;
  startLine?: number;
  endLine?: number;
}

export interface FileChange {
  filename: string;
  action: 'create' | 'update' | 'delete';
  originalCode?: string;
  newCode: string;
  codeBlocks: CodeBlock[];
}

export interface ParsedChanges {
  hasChanges: boolean;
  fileChanges: FileChange[];
  description?: string;
}

export const parseAIResponse = (aiResponse: string): ParsedChanges => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const filePathRegex = /(?:file|filename|path):\s*([^\n]+)/i;
  const createFileRegex = /create\s+(?:file|component):\s*([^\n]+)/i;
  const updateFileRegex = /update\s+(?:file|component):\s*([^\n]+)/i;
  
  const codeBlocks: CodeBlock[] = [];
  const fileChanges: FileChange[] = [];
  let match;

  // Extract all code blocks
  while ((match = codeBlockRegex.exec(aiResponse)) !== null) {
    const language = match[1] || 'javascript';
    const code = match[2].trim();
    
    if (code.length === 0) continue;

    const codeBlock: CodeBlock = {
      id: crypto.randomUUID(),
      language,
      code,
    };

    // Try to determine filename from context
    const beforeBlock = aiResponse.substring(0, match.index);
    const lines = beforeBlock.split('\n').slice(-5); // Look at 5 lines before code block
    
    for (const line of lines.reverse()) {
      const fileMatch = line.match(filePathRegex) || 
                       line.match(createFileRegex) || 
                       line.match(updateFileRegex);
      if (fileMatch) {
        codeBlock.filename = fileMatch[1].trim();
        break;
      }
    }

    codeBlocks.push(codeBlock);
  }

  // Group code blocks by filename
  const fileGroups = new Map<string, CodeBlock[]>();
  const unknownBlocks: CodeBlock[] = [];

  codeBlocks.forEach(block => {
    if (block.filename) {
      if (!fileGroups.has(block.filename)) {
        fileGroups.set(block.filename, []);
      }
      fileGroups.get(block.filename)!.push(block);
    } else {
      unknownBlocks.push(block);
    }
  });

  // Create file changes
  fileGroups.forEach((blocks, filename) => {
    const combinedCode = blocks.map(b => b.code).join('\n\n');
    
    const action = aiResponse.toLowerCase().includes(`create ${filename}`) || 
                   aiResponse.toLowerCase().includes(`new file`) ? 'create' : 'update';

    fileChanges.push({
      filename,
      action,
      newCode: combinedCode,
      codeBlocks: blocks
    });
  });

  // Handle unknown blocks - try to infer from content
  unknownBlocks.forEach(block => {
    let inferredFilename = 'unknown.js';
    
    if (block.language === 'tsx' || block.code.includes('React')) {
      inferredFilename = 'component.tsx';
    } else if (block.language === 'css') {
      inferredFilename = 'styles.css';
    } else if (block.code.includes('export') || block.code.includes('function')) {
      inferredFilename = 'utility.ts';
    }

    fileChanges.push({
      filename: inferredFilename,
      action: 'create',
      newCode: block.code,
      codeBlocks: [block]
    });
  });

  return {
    hasChanges: fileChanges.length > 0,
    fileChanges,
    description: extractDescription(aiResponse)
  };
};

const extractDescription = (response: string): string => {
  const lines = response.split('\n');
  for (const line of lines) {
    if (line.trim() && !line.startsWith('```') && !line.startsWith('#')) {
      return line.trim().substring(0, 100) + (line.length > 100 ? '...' : '');
    }
  }
  return 'AI suggested code changes';
};
