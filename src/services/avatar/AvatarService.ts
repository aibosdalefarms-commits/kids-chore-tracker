import type { AvatarConfig, AvatarAccessory, AccessoryCategory } from '../../types';

/**
 * Abstract interface for avatar operations.
 * Phase 1: DiceBearProvider
 * Future: Custom graphics provider
 */
export interface AvatarService {
  /**
   * Generate an avatar image URL or SVG string from config
   */
  getAvatarUrl(config: AvatarConfig): string;

  /**
   * Generate a data URL (for inline rendering)
   */
  getAvatarDataUrl(config: AvatarConfig): Promise<string>;

  /**
   * Get all available accessories for a category
   */
  getAccessories(category: AccessoryCategory): AvatarAccessory[];

  /**
   * Get all accessory categories
   */
  getCategories(): AccessoryCategory[];

  /**
   * Generate a random avatar config for a new child
   */
  generateRandomConfig(seed?: string): AvatarConfig;

  /**
   * Apply an accessory to an avatar config
   */
  applyAccessory(config: AvatarConfig, accessory: AvatarAccessory): AvatarConfig;

  /**
   * Get the avatar SVG as a string (for direct rendering)
   */
  getAvatarSvg(config: AvatarConfig): string;
}
