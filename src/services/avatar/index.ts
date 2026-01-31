import { DiceBearProvider } from './DiceBearProvider';
import type { AvatarService } from './AvatarService';

export type { AvatarService };

// Export the active avatar service implementation
// Phase 1: DiceBear
// Future: Custom graphics provider
export const avatarService: AvatarService = new DiceBearProvider();
