export interface BackupEntry {
  filename: string;
  originalContent: string;
  timestamp: Date;
  changeId: string;
}

export interface FileUpdateResult {
  success: boolean;
  filename: string;
  error?: string;
  backup?: BackupEntry;
}

export class FileUpdateEngine {
  private backups: Map<string, BackupEntry[]> = new Map();

  async applyFileChange(
    filename: string,
    newContent: string,
    currentFiles: { [filename: string]: string },
    setFiles: (files: { [filename: string]: string }) => void
  ): Promise<FileUpdateResult> {
    try {
      const changeId = crypto.randomUUID();
      const originalContent = currentFiles[filename];

      // Create backup if file exists
      let backup: BackupEntry | undefined;
      if (originalContent !== undefined) {
        backup = {
          filename,
          originalContent,
          timestamp: new Date(),
          changeId
        };

        // Store backup
        if (!this.backups.has(filename)) {
          this.backups.set(filename, []);
        }
        this.backups.get(filename)!.push(backup);

        // Keep only last 10 backups per file
        const fileBackups = this.backups.get(filename)!;
        if (fileBackups.length > 10) {
          fileBackups.splice(0, fileBackups.length - 10);
        }
      }

      // Apply the change
      const updatedFiles = {
        ...currentFiles,
        [filename]: newContent
      };

      setFiles(updatedFiles);

      console.log(`Successfully applied changes to ${filename}`);
      return {
        success: true,
        filename,
        backup
      };

    } catch (error) {
      console.error(`Error applying changes to ${filename}:`, error);
      return {
        success: false,
        filename,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async rollbackFile(
    filename: string,
    changeId: string,
    currentFiles: { [filename: string]: string },
    setFiles: (files: { [filename: string]: string }) => void
  ): Promise<FileUpdateResult> {
    try {
      const fileBackups = this.backups.get(filename);
      if (!fileBackups) {
        throw new Error(`No backups found for ${filename}`);
      }

      const backup = fileBackups.find(b => b.changeId === changeId);
      if (!backup) {
        throw new Error(`Backup with ID ${changeId} not found for ${filename}`);
      }

      const updatedFiles = {
        ...currentFiles,
        [filename]: backup.originalContent
      };

      setFiles(updatedFiles);

      console.log(`Successfully rolled back ${filename} to backup ${changeId}`);
      return {
        success: true,
        filename
      };

    } catch (error) {
      console.error(`Error rolling back ${filename}:`, error);
      return {
        success: false,
        filename,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  getFileBackups(filename: string): BackupEntry[] {
    return this.backups.get(filename) || [];
  }

  getAllBackups(): Map<string, BackupEntry[]> {
    return new Map(this.backups);
  }

  clearBackups(filename?: string): void {
    if (filename) {
      this.backups.delete(filename);
    } else {
      this.backups.clear();
    }
  }

  validateCode(code: string, filename: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic syntax checks
    if (filename.endsWith('.tsx') || filename.endsWith('.jsx')) {
      // Check for unclosed JSX tags (basic check)
      const openTags = (code.match(/<[^/][^>]*[^/]>/g) || []).length;
      const closeTags = (code.match(/<\/[^>]+>/g) || []).length;
      const selfCloseTags = (code.match(/<[^>]*\/>/g) || []).length;
      
      if (openTags !== closeTags + selfCloseTags) {
        errors.push('Potential unclosed JSX tags detected');
      }

      // Check for React import if JSX is used
      if (code.includes('<') && code.includes('>') && !code.includes('import React')) {
        errors.push('JSX detected but React import missing');
      }
    }

    // Check for balanced braces
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push('Unbalanced braces detected');
    }

    // Check for balanced parentheses
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push('Unbalanced parentheses detected');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Singleton instance
export const fileUpdateEngine = new FileUpdateEngine();
