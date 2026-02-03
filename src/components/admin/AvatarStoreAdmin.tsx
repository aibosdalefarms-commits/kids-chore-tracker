import { useState, useEffect } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { Button } from '../ui/Button';
import { avatarService } from '../../services/avatar';
import { dataService } from '../../services/data';
import type { AvatarAccessory, AccessoryCategory, StoreSchedule, DayOfWeek } from '../../types';
import { DAY_NAMES } from '../../types';

const CATEGORY_LABELS: Record<AccessoryCategory, string> = {
  hair: 'Hairstyles',
  eyewear: 'Eyewear',
  clothing: 'Clothing',
  accessories: 'Accessories',
  footwear: 'Footwear',
};

const CATEGORY_ICONS: Record<AccessoryCategory, string> = {
  hair: '💇',
  eyewear: '👓',
  clothing: '👕',
  accessories: '💎',
  footwear: '👟',
};

export function AvatarStoreAdmin() {
  const { family } = useFamily();
  const [selectedCategory, setSelectedCategory] = useState<AccessoryCategory>('hair');
  const [accessories, setAccessories] = useState<AvatarAccessory[]>([]);
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});
  const [disabledItems, setDisabledItems] = useState<Set<string>>(new Set());
  const [schedule, setSchedule] = useState<StoreSchedule | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const categories = avatarService.getCategories();

  useEffect(() => {
    const items = avatarService.getAccessories(selectedCategory);
    setAccessories(items);
  }, [selectedCategory]);

  useEffect(() => {
    loadStoreSchedule();
  }, []);

  const loadStoreSchedule = async () => {
    const existingSchedule = await dataService.getStoreSchedule();
    if (existingSchedule) {
      setSchedule(existingSchedule);
    } else if (family) {
      setSchedule({
        familyId: family.familyId,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        startTime: '00:00',
        endTime: '23:59',
      });
    }
  };

  const handlePriceChange = (accessoryId: string, price: number) => {
    setCustomPrices(prev => ({
      ...prev,
      [accessoryId]: price,
    }));
  };

  const toggleItemAvailability = (accessoryId: string) => {
    setDisabledItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accessoryId)) {
        newSet.delete(accessoryId);
      } else {
        newSet.add(accessoryId);
      }
      return newSet;
    });
  };

  const handleDayToggle = (day: DayOfWeek) => {
    if (!schedule) return;
    const newDays = schedule.daysOfWeek.includes(day)
      ? schedule.daysOfWeek.filter(d => d !== day)
      : [...schedule.daysOfWeek, day].sort();
    setSchedule({ ...schedule, daysOfWeek: newDays as DayOfWeek[] });
  };

  const saveSchedule = async () => {
    if (!schedule) return;
    setIsSaving(true);
    try {
      await dataService.saveStoreSchedule(schedule);
      setShowSchedule(false);
    } catch (error) {
      console.error('Failed to save schedule:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getEffectivePrice = (accessory: AvatarAccessory) => {
    return customPrices[accessory.accessoryId] ?? accessory.pointCost;
  };

  const isStoreOpenNow = () => {
    if (!schedule) return true;
    const now = new Date();
    const currentDay = now.getDay() as DayOfWeek;
    if (!schedule.daysOfWeek.includes(currentDay)) return false;

    const currentTime = now.toTimeString().slice(0, 5);
    return currentTime >= schedule.startTime && currentTime <= schedule.endTime;
  };

  return (
    <div className="space-y-6">
      {/* Store Status */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛍️</span>
            <div>
              <h3 className="font-semibold text-gray-800">Avatar Store</h3>
              <p className="text-sm text-gray-500">
                {isStoreOpenNow() ? (
                  <span className="text-green-600">Store is open</span>
                ) : (
                  <span className="text-red-600">Store is closed</span>
                )}
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowSchedule(!showSchedule)}
          >
            {showSchedule ? 'Hide Schedule' : 'Store Hours'}
          </Button>
        </div>

        {/* Schedule Editor */}
        {showSchedule && schedule && (
          <div className="mt-4 pt-4 border-t space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Open Days
              </label>
              <div className="flex flex-wrap gap-2">
                {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => (
                  <button
                    key={day}
                    onClick={() => handleDayToggle(day)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      schedule.daysOfWeek.includes(day)
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {DAY_NAMES[day].slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opens At
                </label>
                <input
                  type="time"
                  value={schedule.startTime}
                  onChange={(e) => setSchedule({ ...schedule, startTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Closes At
                </label>
                <input
                  type="time"
                  value={schedule.endTime}
                  onChange={(e) => setSchedule({ ...schedule, endTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <Button onClick={saveSchedule} disabled={isSaving} className="w-full">
              {isSaving ? 'Saving...' : 'Save Schedule'}
            </Button>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-purple-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border'
            }`}
          >
            <span>{CATEGORY_ICONS[category]}</span>
            <span>{CATEGORY_LABELS[category]}</span>
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-800">
            {CATEGORY_LABELS[selectedCategory]} ({accessories.length} items)
          </h3>
          <p className="text-sm text-gray-500">
            Set prices and availability for each item
          </p>
        </div>

        <div className="divide-y max-h-96 overflow-y-auto">
          {accessories.map((accessory) => {
            const isDisabled = disabledItems.has(accessory.accessoryId);
            const price = getEffectivePrice(accessory);

            return (
              <div
                key={accessory.accessoryId}
                className={`p-4 flex items-center justify-between ${
                  isDisabled ? 'bg-gray-50 opacity-60' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleItemAvailability(accessory.accessoryId)}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      !isDisabled
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {!isDisabled && '✓'}
                  </button>
                  <div>
                    <p className={`font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-800'}`}>
                      {accessory.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {accessory.avatarProperty}: {accessory.avatarValue}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">⭐</span>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={price}
                    onChange={(e) => handlePriceChange(accessory.accessoryId, parseInt(e.target.value) || 1)}
                    disabled={isDisabled}
                    className="w-20 px-2 py-1 border rounded text-center disabled:bg-gray-100"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
        <h4 className="font-medium text-purple-800 mb-1">How the Store Works</h4>
        <ul className="text-sm text-purple-700 space-y-1">
          <li>• Children spend their individual points to buy accessories</li>
          <li>• Purchased items are permanently added to their avatar options</li>
          <li>• Store hours control when children can make purchases</li>
          <li>• Disabled items won't appear in the store</li>
        </ul>
      </div>
    </div>
  );
}
