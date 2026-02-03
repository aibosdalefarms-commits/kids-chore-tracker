import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';
import type { AvatarConfig, AvatarAccessory, AccessoryCategory } from '../../types';
import type { AvatarService } from './AvatarService';
import { generateId } from '../../utils/id';

// Available options for avataaars style
const ACCESSORY_OPTIONS = {
  eyewear: [
    { id: 'glasses-round', name: 'Round Glasses', value: 'round' },
    { id: 'glasses-square', name: 'Square Glasses', value: 'square' },
    { id: 'sunglasses', name: 'Sunglasses', value: 'sunglasses' },
  ],
  accessories: [
    { id: 'earring', name: 'Earring', value: 'earring' },
  ],
  clothing: [
    { id: 'blazer', name: 'Blazer', value: 'blazerAndShirt' },
    { id: 'sweater', name: 'Sweater', value: 'blazerAndSweater' },
    { id: 'hoodie', name: 'Hoodie', value: 'hoodie' },
    { id: 'overall', name: 'Overall', value: 'overall' },
    { id: 'collar', name: 'Collar Shirt', value: 'collarAndSweater' },
    { id: 'vneck', name: 'V-Neck', value: 'graphicShirt' },
  ],
  footwear: [], // avataaars doesn't have footwear options
  hair: [
    { id: 'short-dreads', name: 'Short Dreads', value: 'dreads01' },
    { id: 'long-dreads', name: 'Long Dreads', value: 'dreads02' },
    { id: 'frizzle', name: 'Frizzle', value: 'frizzle' },
    { id: 'shaggy', name: 'Shaggy', value: 'shaggy' },
    { id: 'curly', name: 'Curly', value: 'curly' },
    { id: 'bob', name: 'Bob', value: 'bob' },
    { id: 'bun', name: 'Bun', value: 'bun' },
    { id: 'straight-long', name: 'Long Straight', value: 'straight01' },
    { id: 'straight-strand', name: 'Strand', value: 'straight02' },
    { id: 'hat-beanie', name: 'Beanie', value: 'winterHat02' },
    { id: 'hat-winter', name: 'Winter Hat', value: 'winterHat03' },
    { id: 'turban', name: 'Turban', value: 'turban' },
    { id: 'hijab', name: 'Hijab', value: 'hijab' },
  ],
} as const;

const HAIR_COLORS = [
  { id: 'black', name: 'Black', value: '1c1c1c' },
  { id: 'brown', name: 'Brown', value: '4a312c' },
  { id: 'blonde', name: 'Blonde', value: 'c9b380' },
  { id: 'red', name: 'Red', value: 'b55239' },
  { id: 'gray', name: 'Gray', value: '9a9a9a' },
  { id: 'blue', name: 'Blue', value: '4a80b5' },
  { id: 'pink', name: 'Pink', value: 'e8adcc' },
  { id: 'purple', name: 'Purple', value: '9b59b6' },
];

const CLOTHING_COLORS = [
  { id: 'blue', name: 'Blue', value: '3c4f5c' },
  { id: 'red', name: 'Red', value: 'e74c3c' },
  { id: 'green', name: 'Green', value: '27ae60' },
  { id: 'purple', name: 'Purple', value: '8e44ad' },
  { id: 'orange', name: 'Orange', value: 'e67e22' },
  { id: 'pink', name: 'Pink', value: 'ff69b4' },
  { id: 'gray', name: 'Gray', value: '929598' },
  { id: 'black', name: 'Black', value: '262e33' },
];

/**
 * DiceBear implementation of AvatarService using avataaars style
 */
export class DiceBearProvider implements AvatarService {
  private createAvatarInstance(config: AvatarConfig) {
    const options: Record<string, unknown> = {
      seed: config.seed,
    };

    // Apply customizations if present
    if (config.top) options.top = config.top;
    if (config.hairColor) options.hairColor = config.hairColor;
    if (config.accessories) options.accessories = config.accessories;
    if (config.clothing) options.clothing = config.clothing;
    if (config.clothingColor) options.clothesColor = config.clothingColor;
    if (config.eyes) options.eyes = config.eyes;
    if (config.eyebrows) options.eyebrows = config.eyebrows;
    if (config.mouth) options.mouth = config.mouth;
    if (config.skinColor) options.skinColor = config.skinColor;
    if (config.facialHair) options.facialHair = config.facialHair;
    if (config.facialHairColor) options.facialHairColor = config.facialHairColor;

    return createAvatar(avataaars, options);
  }

  getAvatarUrl(config: AvatarConfig): string {
    const avatar = this.createAvatarInstance(config);
    return avatar.toDataUri();
  }

  async getAvatarDataUrl(config: AvatarConfig): Promise<string> {
    return this.getAvatarUrl(config);
  }

  getAvatarSvg(config: AvatarConfig): string {
    const avatar = this.createAvatarInstance(config);
    return avatar.toString();
  }

  getAccessories(category: AccessoryCategory): AvatarAccessory[] {
    const options = ACCESSORY_OPTIONS[category] || [];

    const accessories: AvatarAccessory[] = options.map(opt => ({
      accessoryId: opt.id,
      name: opt.name,
      category,
      avatarProperty: this.getCategoryProperty(category),
      avatarValue: opt.value,
      pointCost: this.getDefaultPrice(category),
      available: true,
    }));

    // Add color options for hair
    if (category === 'hair') {
      HAIR_COLORS.forEach(color => {
        accessories.push({
          accessoryId: `hair-color-${color.id}`,
          name: `${color.name} Hair Color`,
          category: 'hair',
          avatarProperty: 'hairColor',
          avatarValue: color.value,
          pointCost: 150,
          available: true,
        });
      });
    }

    // Add clothing colors
    if (category === 'clothing') {
      CLOTHING_COLORS.forEach(color => {
        accessories.push({
          accessoryId: `clothing-color-${color.id}`,
          name: `${color.name} Clothing`,
          category: 'clothing',
          avatarProperty: 'clothingColor',
          avatarValue: color.value,
          pointCost: 100,
          available: true,
        });
      });
    }

    return accessories;
  }

  private getCategoryProperty(category: AccessoryCategory): string {
    switch (category) {
      case 'eyewear': return 'accessories';
      case 'accessories': return 'accessories';
      case 'clothing': return 'clothing';
      case 'hair': return 'top';
      case 'footwear': return 'footwear';
      default: return '';
    }
  }

  private getDefaultPrice(category: AccessoryCategory): number {
    switch (category) {
      case 'eyewear': return 200;
      case 'accessories': return 150;
      case 'clothing': return 250;
      case 'hair': return 300;
      case 'footwear': return 200;
      default: return 100;
    }
  }

  getCategories(): AccessoryCategory[] {
    return ['hair', 'eyewear', 'clothing', 'accessories'];
  }

  generateRandomConfig(seed?: string): AvatarConfig {
    return {
      seed: seed || generateId(),
    };
  }

  applyAccessory(config: AvatarConfig, accessory: AvatarAccessory): AvatarConfig {
    const newConfig = { ...config };

    switch (accessory.avatarProperty) {
      case 'accessories':
        newConfig.accessories = [accessory.avatarValue];
        break;
      case 'top':
        newConfig.top = [accessory.avatarValue];
        break;
      case 'hairColor':
        newConfig.hairColor = [accessory.avatarValue];
        break;
      case 'clothing':
        newConfig.clothing = [accessory.avatarValue];
        break;
      case 'clothingColor':
        newConfig.clothingColor = [accessory.avatarValue];
        break;
      case 'eyes':
        newConfig.eyes = [accessory.avatarValue];
        break;
      case 'eyebrows':
        newConfig.eyebrows = [accessory.avatarValue];
        break;
      case 'mouth':
        newConfig.mouth = [accessory.avatarValue];
        break;
      case 'skinColor':
        newConfig.skinColor = [accessory.avatarValue];
        break;
    }

    return newConfig;
  }
}
