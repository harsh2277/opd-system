import { Bell, Building2, Clock, CreditCard, Lock, Save, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';

export function AdminSettings() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--neutral-900)]">Settings</h1>
          <p className="text-sm text-[var(--neutral-500)] mt-1">Simple setup options for clinic, OPD, billing, access, and alerts.</p>
        </div>
        <Button size="sm"><Save size={14} />Save</Button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <SettingCard icon={Building2} title="Clinic" fields={[
          ['Clinic Name', 'City Care OPD'],
          ['Registration No.', 'MH-OPD-2026'],
          ['Phone', '+91 98765 43210'],
        ]} />
        <SettingCard icon={Clock} title="OPD" fields={[
          ['Open Time', '08:00 AM'],
          ['Close Time', '08:00 PM'],
          ['Token Limit', '250'],
        ]} />
        <SettingCard icon={CreditCard} title="Billing" fields={[
          ['New Visit Fee', '500'],
          ['Follow-up Fee', '300'],
          ['Payment Mode', 'Cash'],
        ]} />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <ToggleCard icon={ShieldCheck} title="Access" items={[
          ['Admin manage users', true],
          ['Reception edit patients', true],
          ['Doctor request lab', true],
          ['Staff delete records', false],
        ]} />
        <ToggleCard icon={Bell} title="Notifications" items={[
          ['Token alerts', true],
          ['Lab ready alerts', true],
          ['Daily summary email', false],
          ['Billing export alert', false],
        ]} />
        <ToggleCard icon={Lock} title="Security" items={[
          ['Audit log', true],
          ['Auto logout', true],
          ['Admin OTP login', false],
          ['Password reset required', true],
        ]} />
      </div>
    </div>
  );
}

function SettingCard({
  icon: Icon,
  title,
  fields,
}: {
  icon: typeof Building2;
  title: string;
  fields: string[][];
}) {
  return (
    <div className="bg-white border border-[var(--neutral-200)] rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} className="text-[var(--brand-500)]" />
        <h2 className="text-sm font-semibold text-[var(--neutral-900)]">{title}</h2>
      </div>
      <div className="space-y-3">
        {fields.map(([label, value]) => (
          <Input key={label} label={label} defaultValue={value} className="h-9 text-xs" />
        ))}
      </div>
    </div>
  );
}

function ToggleCard({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof Building2;
  title: string;
  items: Array<[string, boolean]>;
}) {
  return (
    <div className="bg-white border border-[var(--neutral-200)] rounded-lg">
      <div className="px-5 py-4 border-b border-[var(--neutral-100)] flex items-center gap-2">
        <Icon size={16} className="text-[var(--brand-500)]" />
        <h2 className="text-sm font-semibold text-[var(--neutral-900)]">{title}</h2>
      </div>
      <div className="divide-y divide-[var(--neutral-100)]">
        {items.map(([label, enabled]) => (
          <div key={label} className="px-5 py-4 flex items-center justify-between">
            <span className="text-sm text-[var(--neutral-800)]">{label}</span>
            <Switch defaultChecked={enabled} />
          </div>
        ))}
      </div>
    </div>
  );
}
