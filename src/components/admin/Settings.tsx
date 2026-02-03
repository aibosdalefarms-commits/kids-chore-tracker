import { useState, useRef } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { dataService } from '../../services/data';
import { hashPin, verifyPin } from '../../utils/pin';

export function Settings() {
  const { family, updateFamily, refreshData } = useFamily();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isSavingPin, setIsSavingPin] = useState(false);

  const [importData, setImportData] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');

  const [isResetting, setIsResetting] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');

  const handleExport = async () => {
    try {
      const data = await dataService.exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chore-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportData(content);
      setShowImportModal(true);
    };
    reader.readAsText(file);

    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleImport = async () => {
    if (!importData) return;
    setIsImporting(true);
    setImportError('');

    try {
      // Validate JSON
      const parsed = JSON.parse(importData);
      if (!parsed.family || !parsed.appState) {
        throw new Error('Invalid backup file format');
      }

      await dataService.importAllData(importData);
      await refreshData();
      setShowImportModal(false);
      setImportData('');
      alert('Data imported successfully!');
    } catch (error) {
      console.error('Import failed:', error);
      setImportError(error instanceof Error ? error.message : 'Invalid backup file');
    } finally {
      setIsImporting(false);
    }
  };

  const handleChangePin = async () => {
    if (!family) return;
    setPinError('');

    // Validate current PIN
    if (!verifyPin(currentPin, family.adminPin)) {
      setPinError('Current PIN is incorrect');
      return;
    }

    // Validate new PIN
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinError('New PIN must be 4 digits');
      return;
    }

    if (newPin !== confirmNewPin) {
      setPinError('New PINs do not match');
      return;
    }

    setIsSavingPin(true);
    try {
      const hashedPin = await hashPin(newPin);
      await updateFamily({ adminPin: hashedPin });
      setShowChangePinModal(false);
      setCurrentPin('');
      setNewPin('');
      setConfirmNewPin('');
      alert('PIN changed successfully!');
    } catch (error) {
      console.error('Failed to change PIN:', error);
      setPinError('Failed to change PIN. Please try again.');
    } finally {
      setIsSavingPin(false);
    }
  };

  const handleReset = async () => {
    if (resetConfirmText !== 'DELETE') return;

    setIsResetting(true);
    try {
      await dataService.clearAllData();
      window.location.href = '/';
    } catch (error) {
      console.error('Reset failed:', error);
      alert('Failed to reset data. Please try again.');
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Data Management */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-800">Data Management</h3>
          <p className="text-sm text-gray-500">Export, import, or reset your data</p>
        </div>

        <div className="p-4 space-y-4">
          {/* Export */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Export Data</h4>
              <p className="text-sm text-gray-600">Download a backup of all your data</p>
            </div>
            <Button onClick={handleExport}>
              Download Backup
            </Button>
          </div>

          {/* Import */}
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Import Data</h4>
              <p className="text-sm text-gray-600">Restore from a backup file</p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File
              </Button>
            </div>
          </div>

          {/* Reset */}
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <h4 className="font-medium text-red-800">Reset All Data</h4>
              <p className="text-sm text-red-600">Permanently delete everything</p>
            </div>
            <Button
              variant="danger"
              onClick={() => setShowResetModal(true)}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-800">Security</h3>
          <p className="text-sm text-gray-500">Manage your admin PIN</p>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Admin PIN</h4>
              <p className="text-sm text-gray-600">Change your 4-digit admin PIN</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowChangePinModal(true)}
            >
              Change PIN
            </Button>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-800">About</h3>
        </div>

        <div className="p-4 space-y-2 text-sm text-gray-600">
          <p><span className="font-medium">App:</span> Household Chore Tracker</p>
          <p><span className="font-medium">Version:</span> 1.0.0</p>
          <p><span className="font-medium">Storage:</span> Local (browser)</p>
          <p className="text-xs text-gray-400 mt-4">
            Data is stored locally in your browser. Use the export feature to create backups.
          </p>
        </div>
      </div>

      {/* Change PIN Modal */}
      <Modal
        isOpen={showChangePinModal}
        onClose={() => {
          setShowChangePinModal(false);
          setCurrentPin('');
          setNewPin('');
          setConfirmNewPin('');
          setPinError('');
        }}
        title="Change Admin PIN"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current PIN
            </label>
            <input
              type="password"
              maxLength={4}
              pattern="\d{4}"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 border rounded-lg text-center text-2xl tracking-widest"
              placeholder="****"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New PIN
            </label>
            <input
              type="password"
              maxLength={4}
              pattern="\d{4}"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 border rounded-lg text-center text-2xl tracking-widest"
              placeholder="****"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New PIN
            </label>
            <input
              type="password"
              maxLength={4}
              pattern="\d{4}"
              value={confirmNewPin}
              onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 border rounded-lg text-center text-2xl tracking-widest"
              placeholder="****"
            />
          </div>

          {pinError && (
            <p className="text-red-600 text-sm text-center">{pinError}</p>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowChangePinModal(false);
                setCurrentPin('');
                setNewPin('');
                setConfirmNewPin('');
                setPinError('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePin}
              disabled={isSavingPin || currentPin.length !== 4 || newPin.length !== 4 || confirmNewPin.length !== 4}
              className="flex-1"
            >
              {isSavingPin ? 'Saving...' : 'Change PIN'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Confirmation Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportData('');
          setImportError('');
        }}
        title="Import Data"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 font-medium">Warning</p>
            <p className="text-yellow-700 text-sm">
              Importing will replace all current data with the backup. This cannot be undone.
            </p>
          </div>

          {importError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{importError}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowImportModal(false);
                setImportData('');
                setImportError('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={isImporting}
              className="flex-1"
            >
              {isImporting ? 'Importing...' : 'Import Data'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => {
          setShowResetModal(false);
          setResetConfirmText('');
        }}
        title="Reset All Data"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">Danger Zone</p>
            <p className="text-red-700 text-sm">
              This will permanently delete all data including children, chores, assignments,
              completions, rewards, and settings. This action cannot be undone.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type DELETE to confirm
            </label>
            <input
              type="text"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="DELETE"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowResetModal(false);
                setResetConfirmText('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReset}
              disabled={resetConfirmText !== 'DELETE' || isResetting}
              className="flex-1"
            >
              {isResetting ? 'Resetting...' : 'Reset Everything'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
