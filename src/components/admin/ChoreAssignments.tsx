import { useState } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { AvatarDisplay } from '../avatar/AvatarDisplay';
import { generateId } from '../../utils/id';
import type { ChoreAssignment, DayOfWeek, TimePeriodId } from '../../types';
import { DAY_NAMES, TIME_PERIOD_NAMES } from '../../types';

const DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];
const TIME_PERIODS: TimePeriodId[] = ['morning', 'daytime', 'afterSchool', 'evening'];

export function ChoreAssignments() {
  const { chores, children, assignments, addAssignment, removeAssignment, family } = useFamily();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChoreId, setSelectedChoreId] = useState('');
  const [selectedChildId, setSelectedChildId] = useState('');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([1, 2, 3, 4, 5]); // Weekdays
  const [selectedPeriods, setSelectedPeriods] = useState<TimePeriodId[]>(['morning']);

  const openModal = () => {
    setSelectedChoreId(chores[0]?.choreId || '');
    setSelectedChildId(children[0]?.childId || '');
    setSelectedDays([1, 2, 3, 4, 5]);
    setSelectedPeriods(['morning']);
    setIsModalOpen(true);
  };

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const togglePeriod = (period: TimePeriodId) => {
    setSelectedPeriods(prev =>
      prev.includes(period) ? prev.filter(p => p !== period) : [...prev, period]
    );
  };

  const handleSave = async () => {
    if (!selectedChoreId || !selectedChildId || selectedDays.length === 0 || selectedPeriods.length === 0) {
      return;
    }

    const newAssignment: ChoreAssignment = {
      assignmentId: generateId(),
      familyId: family?.familyId || 'default',
      choreId: selectedChoreId,
      childId: selectedChildId,
      daysOfWeek: selectedDays,
      timePeriods: selectedPeriods,
      createdAt: new Date().toISOString(),
    };

    await addAssignment(newAssignment);
    setIsModalOpen(false);
  };

  const handleDelete = async (assignmentId: string) => {
    if (confirm('Remove this assignment?')) {
      await removeAssignment(assignmentId);
    }
  };

  // Group assignments by child
  const assignmentsByChild = children.map(child => ({
    child,
    assignments: assignments.filter(a => a.childId === child.childId),
  }));

  const getChore = (choreId: string) => chores.find(c => c.choreId === choreId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Chore Assignments</h2>
          <p className="text-gray-500">Assign chores to children by day and time</p>
        </div>
        <Button onClick={openModal} disabled={chores.length === 0 || children.length === 0} className="gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Assign Chore
        </Button>
      </div>

      {chores.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800">
          Create some chores first before assigning them.
        </div>
      )}

      {/* Assignments by Child */}
      {assignmentsByChild.map(({ child, assignments: childAssignments }) => (
        <div key={child.childId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 p-4 bg-gray-50 border-b border-gray-100">
            <AvatarDisplay config={child.avatarConfig} size="sm" />
            <h3 className="font-semibold text-gray-800">{child.name}</h3>
            <span className="text-sm text-gray-500">({childAssignments.length} assignments)</span>
          </div>

          {childAssignments.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {childAssignments.map(assignment => {
                const chore = getChore(assignment.choreId);
                if (!chore) return null;

                return (
                  <div key={assignment.assignmentId} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{chore.emoji}</span>
                      <div>
                        <p className="font-medium text-gray-800">{chore.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {assignment.daysOfWeek.map(day => (
                            <span key={day} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              {DAY_NAMES[day].slice(0, 3)}
                            </span>
                          ))}
                          {assignment.timePeriods.map(period => (
                            <span key={period} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                              {TIME_PERIOD_NAMES[period]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(assignment.assignmentId)}>
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="p-4 text-gray-400 text-center">No chores assigned yet</p>
          )}
        </div>
      ))}

      {/* Assignment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Assign Chore"
      >
        <div className="space-y-4">
          {/* Select Chore */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chore</label>
            <select
              value={selectedChoreId}
              onChange={(e) => setSelectedChoreId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            >
              {chores.map(chore => (
                <option key={chore.choreId} value={chore.choreId}>
                  {chore.emoji} {chore.name} ({chore.pointValue} pts)
                </option>
              ))}
            </select>
          </div>

          {/* Select Child */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            >
              {children.map(child => (
                <option key={child.childId} value={child.childId}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Days of Week</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedDays.includes(day)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {DAY_NAMES[day].slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Select Time Periods */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Periods</label>
            <div className="flex flex-wrap gap-2">
              {TIME_PERIODS.map(period => (
                <button
                  key={period}
                  onClick={() => togglePeriod(period)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriods.includes(period)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {TIME_PERIOD_NAMES[period]}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={selectedDays.length === 0 || selectedPeriods.length === 0}
              className="flex-1"
            >
              Assign
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
