import { useState } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { Button } from '../ui/Button';
import type { TimePeriod, TimePeriodId } from '../../types';
import { TIME_PERIOD_NAMES, DEFAULT_TIME_PERIODS } from '../../types';
import { formatTime } from '../../utils/time';

const PERIOD_ORDER: TimePeriodId[] = ['morning', 'daytime', 'afterSchool', 'evening'];

export function TimePeriodSettings() {
  const { timePeriods, saveTimePeriods, family } = useFamily();
  const [editedPeriods, setEditedPeriods] = useState<TimePeriod[]>(
    timePeriods.length > 0 ? timePeriods : DEFAULT_TIME_PERIODS.map(p => ({ ...p, familyId: family?.familyId || 'default' }))
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleTimeChange = (periodId: TimePeriodId, field: 'startTime' | 'endTime', value: string) => {
    setEditedPeriods(prev =>
      prev.map(p => p.periodId === periodId ? { ...p, [field]: value } : p)
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await saveTimePeriods(editedPeriods);
    setHasChanges(false);
    setIsSaving(false);
  };

  const handleReset = () => {
    const defaults = DEFAULT_TIME_PERIODS.map(p => ({ ...p, familyId: family?.familyId || 'default' }));
    setEditedPeriods(defaults);
    setHasChanges(true);
  };

  // Sort periods by the defined order
  const sortedPeriods = [...editedPeriods].sort(
    (a, b) => PERIOD_ORDER.indexOf(a.periodId as TimePeriodId) - PERIOD_ORDER.indexOf(b.periodId as TimePeriodId)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Time Periods</h2>
          <p className="text-gray-500">Configure when each time period starts and ends</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-800">
        <p className="text-sm">
          <strong>Note:</strong> Chores are shown to children based on these time periods.
          Make sure periods don't overlap and cover the times when chores should be visible.
        </p>
      </div>

      {/* Time Period Cards */}
      <div className="grid gap-4">
        {sortedPeriods.map((period, index) => {
          const periodId = period.periodId as TimePeriodId;
          const colors = {
            morning: 'from-yellow-400 to-orange-400',
            daytime: 'from-blue-400 to-cyan-400',
            afterSchool: 'from-green-400 to-teal-400',
            evening: 'from-purple-400 to-pink-400',
          };
          const icons = {
            morning: '🌅',
            daytime: '☀️',
            afterSchool: '🎒',
            evening: '🌙',
          };

          return (
            <div
              key={period.periodId}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${colors[periodId]} p-4 text-white`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{icons[periodId]}</span>
                  <div>
                    <h3 className="font-bold text-lg">{TIME_PERIOD_NAMES[periodId]}</h3>
                    <p className="text-white/80 text-sm">
                      Currently: {formatTime(period.startTime)} - {formatTime(period.endTime)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={period.startTime}
                      onChange={(e) => handleTimeChange(periodId, 'startTime', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={period.endTime}
                      onChange={(e) => handleTimeChange(periodId, 'endTime', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Visual Timeline Indicator */}
              {index < sortedPeriods.length - 1 && (
                <div className="flex items-center justify-center py-2 bg-gray-50 text-gray-400 text-sm">
                  ↓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Timeline Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Daily Timeline Preview</h3>
        <div className="relative h-12 bg-gray-100 rounded-full overflow-hidden">
          {sortedPeriods.map(period => {
            const periodId = period.periodId as TimePeriodId;
            const [startH, startM] = period.startTime.split(':').map(Number);
            const [endH, endM] = period.endTime.split(':').map(Number);
            const startMinutes = startH * 60 + startM;
            const endMinutes = endH * 60 + endM;
            const totalMinutes = 24 * 60;

            const left = (startMinutes / totalMinutes) * 100;
            const width = ((endMinutes - startMinutes) / totalMinutes) * 100;

            const colors = {
              morning: 'bg-yellow-400',
              daytime: 'bg-blue-400',
              afterSchool: 'bg-green-400',
              evening: 'bg-purple-400',
            };

            return (
              <div
                key={period.periodId}
                className={`absolute top-0 bottom-0 ${colors[periodId]} flex items-center justify-center text-white text-xs font-medium`}
                style={{ left: `${left}%`, width: `${width}%` }}
                title={`${TIME_PERIOD_NAMES[periodId]}: ${formatTime(period.startTime)} - ${formatTime(period.endTime)}`}
              >
                {width > 8 && TIME_PERIOD_NAMES[periodId].slice(0, 3)}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>12 AM</span>
          <span>6 AM</span>
          <span>12 PM</span>
          <span>6 PM</span>
          <span>12 AM</span>
        </div>
      </div>
    </div>
  );
}
