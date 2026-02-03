import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFamily } from '../context/FamilyContext';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { avatarService } from '../services/avatar';
import { dataService } from '../services/data';
import type { AvatarAccessory, AccessoryCategory, Child, PurchasedAccessory, StoreSchedule, DayOfWeek } from '../types';
import { generateId } from '../utils/id';
import confetti from 'canvas-confetti';

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

export function AvatarStore() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { children, updateChild } = useFamily();

  const [child, setChild] = useState<Child | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<AccessoryCategory>('hair');
  const [accessories, setAccessories] = useState<AvatarAccessory[]>([]);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [previewAccessory, setPreviewAccessory] = useState<AvatarAccessory | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [storeSchedule, setStoreSchedule] = useState<StoreSchedule | null>(null);
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  const categories = avatarService.getCategories();

  useEffect(() => {
    const foundChild = children.find((c) => c.childId === childId);
    setChild(foundChild || null);

    if (foundChild) {
      loadPurchasedAccessories(foundChild.childId);
    }
    loadStoreSchedule();
  }, [childId, children]);

  useEffect(() => {
    const items = avatarService.getAccessories(selectedCategory);
    setAccessories(items);
  }, [selectedCategory]);

  useEffect(() => {
    checkStoreOpen();
    const interval = setInterval(checkStoreOpen, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [storeSchedule]);

  const loadPurchasedAccessories = async (cId: string) => {
    const purchased = await dataService.getPurchasedAccessories(cId);
    setPurchasedIds(new Set(purchased.map((p) => p.accessoryId)));
  };

  const loadStoreSchedule = async () => {
    const schedule = await dataService.getStoreSchedule();
    setStoreSchedule(schedule);
  };

  const checkStoreOpen = () => {
    if (!storeSchedule) {
      setIsStoreOpen(true);
      return;
    }

    const now = new Date();
    const currentDay = now.getDay() as DayOfWeek;
    if (!storeSchedule.daysOfWeek.includes(currentDay)) {
      setIsStoreOpen(false);
      return;
    }

    const currentTime = now.toTimeString().slice(0, 5);
    setIsStoreOpen(
      currentTime >= storeSchedule.startTime && currentTime <= storeSchedule.endTime
    );
  };

  const handleSelectAccessory = (accessory: AvatarAccessory) => {
    if (purchasedIds.has(accessory.accessoryId)) {
      // Already owned - apply it directly
      applyAccessory(accessory);
    } else {
      // Show purchase modal
      setPreviewAccessory(accessory);
      setShowPurchaseModal(true);
    }
  };

  const applyAccessory = async (accessory: AvatarAccessory) => {
    if (!child) return;

    const newConfig = avatarService.applyAccessory(child.avatarConfig, accessory);
    await updateChild(child.childId, { avatarConfig: newConfig });
    setChild({ ...child, avatarConfig: newConfig });
  };

  const handlePurchase = async () => {
    if (!child || !previewAccessory || !isStoreOpen) return;

    if (child.individualPoints < previewAccessory.pointCost) {
      return; // Not enough points
    }

    setIsPurchasing(true);
    try {
      // Deduct points
      const newPoints = child.individualPoints - previewAccessory.pointCost;
      await updateChild(child.childId, { individualPoints: newPoints });

      // Record purchase
      const purchase: PurchasedAccessory = {
        purchaseId: generateId(),
        childId: child.childId,
        accessoryId: previewAccessory.accessoryId,
        purchasedAt: new Date().toISOString(),
      };
      await dataService.savePurchasedAccessory(purchase);

      // Apply accessory
      const newConfig = avatarService.applyAccessory(child.avatarConfig, previewAccessory);
      await updateChild(child.childId, {
        avatarConfig: newConfig,
        individualPoints: newPoints
      });

      // Update local state
      setChild({ ...child, avatarConfig: newConfig, individualPoints: newPoints });
      setPurchasedIds((prev) => new Set([...prev, previewAccessory.accessoryId]));

      // Celebrate!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#3b82f6'],
      });

      setShowPurchaseModal(false);
      setPreviewAccessory(null);
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setIsPurchasing(false);
    }
  };

  if (!child) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Child not found</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const previewConfig = previewAccessory
    ? avatarService.applyAccessory(child.avatarConfig, previewAccessory)
    : child.avatarConfig;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(`/child/${childId}`)}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-gray-800">Avatar Store</h1>
          <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full">
            <span className="text-yellow-500">⭐</span>
            <span className="font-bold text-yellow-700">{child.individualPoints}</span>
          </div>
        </div>
      </div>

      {/* Store Closed Banner */}
      {!isStoreOpen && (
        <div className="bg-red-500 text-white text-center py-2 px-4">
          <p className="font-medium">The store is currently closed</p>
          <p className="text-sm opacity-90">Come back during store hours!</p>
        </div>
      )}

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Current Avatar Preview */}
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <img
            src={avatarService.getAvatarUrl(child.avatarConfig)}
            alt={child.name}
            className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-purple-200 to-pink-200"
          />
          <h2 className="mt-3 text-xl font-bold text-gray-800">{child.name}</h2>
          <p className="text-gray-500 text-sm">Customize your look!</p>
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
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
              }`}
            >
              <span>{CATEGORY_ICONS[category]}</span>
              <span>{CATEGORY_LABELS[category]}</span>
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-3">
            {CATEGORY_LABELS[selectedCategory]}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {accessories.map((accessory) => {
              const isOwned = purchasedIds.has(accessory.accessoryId);
              const canAfford = child.individualPoints >= accessory.pointCost;

              return (
                <button
                  key={accessory.accessoryId}
                  onClick={() => handleSelectAccessory(accessory)}
                  disabled={!isStoreOpen && !isOwned}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    isOwned
                      ? 'border-green-300 bg-green-50'
                      : canAfford
                      ? 'border-purple-200 hover:border-purple-400 hover:shadow-md bg-white'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  } ${!isStoreOpen && !isOwned ? 'cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">
                      {CATEGORY_ICONS[accessory.category]}
                    </span>
                    {isOwned ? (
                      <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                        Owned
                      </span>
                    ) : (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          canAfford
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <span>⭐</span>
                        <span>{accessory.pointCost}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {accessory.name}
                  </p>
                </button>
              );
            })}
          </div>

          {accessories.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No items available in this category
            </p>
          )}
        </div>
      </div>

      {/* Purchase Modal */}
      <Modal
        isOpen={showPurchaseModal}
        onClose={() => {
          setShowPurchaseModal(false);
          setPreviewAccessory(null);
        }}
        title="Get This Look?"
      >
        {previewAccessory && (
          <div className="space-y-4">
            {/* Preview */}
            <div className="flex justify-center gap-4">
              <div className="text-center">
                <img
                  src={avatarService.getAvatarUrl(child.avatarConfig)}
                  alt="Before"
                  className="w-24 h-24 rounded-full bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Before</p>
              </div>
              <div className="flex items-center text-2xl text-gray-400">→</div>
              <div className="text-center">
                <img
                  src={avatarService.getAvatarUrl(previewConfig)}
                  alt="After"
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-200 to-pink-200"
                />
                <p className="text-xs text-gray-500 mt-1">After</p>
              </div>
            </div>

            {/* Item Info */}
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="font-semibold text-gray-800">{previewAccessory.name}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-yellow-500 text-xl">⭐</span>
                <span className="text-xl font-bold text-gray-800">
                  {previewAccessory.pointCost}
                </span>
              </div>
            </div>

            {/* Balance Check */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Your points: <span className="font-bold">{child.individualPoints}</span>
              </p>
              {child.individualPoints >= previewAccessory.pointCost ? (
                <p className="text-sm text-green-600">
                  After purchase: <span className="font-bold">{child.individualPoints - previewAccessory.pointCost}</span>
                </p>
              ) : (
                <p className="text-sm text-red-600">
                  You need <span className="font-bold">{previewAccessory.pointCost - child.individualPoints}</span> more points!
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowPurchaseModal(false);
                  setPreviewAccessory(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePurchase}
                disabled={child.individualPoints < previewAccessory.pointCost || isPurchasing || !isStoreOpen}
                className="flex-1"
              >
                {isPurchasing ? 'Buying...' : 'Buy Now'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
