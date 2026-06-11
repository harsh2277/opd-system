import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Settings as SettingsIcon, Bell, Printer, Clock, Users, Save } from 'lucide-react';
import { toast } from 'sonner';

export function Settings() {
  const [settings, setSettings] = useState({
    clinicName: 'OPD Management System',
    maxTokensPerDay: '200',
    avgConsultationTime: '15',
    autoSMSEnabled: true,
    autoPrintEnabled: false,
    urgentThreshold: '30',
    displayRefreshRate: '5',
    soundNotifications: true,
  });

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  const handleReset = () => {
    toast.info('Settings reset to defaults');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon size={32} className="text-[var(--brand-500)]" />
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--neutral-900)]">Settings</h1>
          <p className="text-[var(--neutral-600)]">Configure your OPD management system</p>
        </div>
      </div>

      {/* General Settings */}
      <Card className="p-6">
        <h2 className="font-heading text-xl font-bold text-[var(--neutral-900)] mb-4 flex items-center gap-2">
          <SettingsIcon size={20} />
          General Settings
        </h2>
        <div className="space-y-4">
          <Input
            label="Clinic Name"
            value={settings.clinicName}
            onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Max Tokens Per Day"
              type="number"
              value={settings.maxTokensPerDay}
              onChange={(e) => setSettings({ ...settings, maxTokensPerDay: e.target.value })}
            />
            <Input
              label="Avg Consultation Time (min)"
              type="number"
              value={settings.avgConsultationTime}
              onChange={(e) => setSettings({ ...settings, avgConsultationTime: e.target.value })}
            />
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-6">
        <h2 className="font-heading text-xl font-bold text-[var(--neutral-900)] mb-4 flex items-center gap-2">
          <Bell size={20} />
          Notification Settings
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[var(--neutral-50)] rounded-lg">
            <div>
              <p className="font-medium text-[var(--neutral-900)]">Auto SMS Notifications</p>
              <p className="text-sm text-[var(--neutral-600)]">Send SMS to patients when token is issued</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, autoSMSEnabled: !settings.autoSMSEnabled })}
              className={`w-14 h-8 rounded-full transition-colors relative ${
                settings.autoSMSEnabled ? 'bg-[var(--success-500)]' : 'bg-[var(--neutral-300)]'
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.autoSMSEnabled ? 'right-1' : 'left-1'
                }`}
              ></span>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[var(--neutral-50)] rounded-lg">
            <div>
              <p className="font-medium text-[var(--neutral-900)]">Sound Notifications</p>
              <p className="text-sm text-[var(--neutral-600)]">Play sound when calling next patient</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, soundNotifications: !settings.soundNotifications })}
              className={`w-14 h-8 rounded-full transition-colors relative ${
                settings.soundNotifications ? 'bg-[var(--success-500)]' : 'bg-[var(--neutral-300)]'
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.soundNotifications ? 'right-1' : 'left-1'
                }`}
              ></span>
            </button>
          </div>
        </div>
      </Card>

      {/* Print Settings */}
      <Card className="p-6">
        <h2 className="font-heading text-xl font-bold text-[var(--neutral-900)] mb-4 flex items-center gap-2">
          <Printer size={20} />
          Print Settings
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[var(--neutral-50)] rounded-lg">
            <div>
              <p className="font-medium text-[var(--neutral-900)]">Auto Print Tokens</p>
              <p className="text-sm text-[var(--neutral-600)]">Automatically print token after issuance</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, autoPrintEnabled: !settings.autoPrintEnabled })}
              className={`w-14 h-8 rounded-full transition-colors relative ${
                settings.autoPrintEnabled ? 'bg-[var(--success-500)]' : 'bg-[var(--neutral-300)]'
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.autoPrintEnabled ? 'right-1' : 'left-1'
                }`}
              ></span>
            </button>
          </div>
        </div>
      </Card>

      {/* Queue Settings */}
      <Card className="p-6">
        <h2 className="font-heading text-xl font-bold text-[var(--neutral-900)] mb-4 flex items-center gap-2">
          <Clock size={20} />
          Queue Settings
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Urgent Threshold (minutes)"
              type="number"
              value={settings.urgentThreshold}
              onChange={(e) => setSettings({ ...settings, urgentThreshold: e.target.value })}
              placeholder="Mark urgent after X minutes"
            />
            <Input
              label="Display Refresh Rate (seconds)"
              type="number"
              value={settings.displayRefreshRate}
              onChange={(e) => setSettings({ ...settings, displayRefreshRate: e.target.value })}
            />
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={handleSave} variant="primary" className="flex-1" size="lg">
          <Save size={18} className="mr-1.5" />
          Save Settings
        </Button>
        <Button onClick={handleReset} variant="line" size="lg">
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
