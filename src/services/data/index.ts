import { LocalStorageProvider } from './LocalStorageProvider';
import type { DataService } from './DataService';

export type { DataService };

// Export the active data service implementation
// Phase 1: localStorage
// Phase 2: Switch to CloudProvider
export const dataService: DataService = new LocalStorageProvider();
