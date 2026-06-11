import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';

const rolePermissions = {
  Administrator: ['Dashboard', 'Users', 'Reports', 'Billing', 'Settings'],
  Receptionist: ['Patients', 'Queue', 'Tokens'],
  Doctor: ['Consultation', 'Patient Details', 'Prescription'],
  'Pharmacy Staff': ['Pharmacy Billing', 'Dispense Medicine'],
  'Lab Staff': ['Lab Requests', 'Lab Billing'],
  'Billing Staff': ['Billing', 'Receipts', 'Reports'],
};

export function AdminAddUser() {
  const navigate = useNavigate();
  const [role, setRole] = useState<keyof typeof rolePermissions>('Receptionist');
  const [sendInvite, setSendInvite] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', phone: '', employeeId: '', department: '', password: '' });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    toast.success(`${form.name || 'User'} added`);
    navigate('/admin/users');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button type="button" variant="line" size="icon" asChild>
            <Link to="/admin/users"><ArrowLeft size={15} /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-[var(--neutral-900)]">Add User</h1>
            <p className="text-sm text-[var(--neutral-500)] mt-1">Create a staff account and assign one role.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="line" size="sm" asChild><Link to="/admin/users">Cancel</Link></Button>
          <Button type="submit" size="sm"><Save size={14} />Save</Button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-5 items-start">
        <div className="bg-white border border-[var(--neutral-200)] rounded-lg p-5">
          <h2 className="text-sm font-semibold text-[var(--neutral-900)] mb-4">Staff Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            <Input label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            <Input label="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            <Input label="Employee ID" value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: event.target.value })} />
            <Input label="Department" value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} />
            <Input label="Temporary Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          </div>

          <div className="mt-6 pt-5 border-t border-[var(--neutral-100)]">
            <h2 className="text-sm font-semibold text-[var(--neutral-900)] mb-3">Select Role</h2>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(rolePermissions) as Array<keyof typeof rolePermissions>).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRole(item)}
                  className={`text-left border rounded-lg p-3 transition-colors ${role === item ? 'border-[var(--brand-300)] bg-[var(--brand-50)]' : 'border-[var(--neutral-200)] hover:bg-[var(--neutral-50)]'}`}
                >
                  <p className="text-sm font-medium text-[var(--neutral-900)]">{item}</p>
                  <p className="text-xs text-[var(--neutral-500)] mt-1">{rolePermissions[item].length} permissions</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white border border-[var(--neutral-200)] rounded-lg p-5">
            <h2 className="text-sm font-semibold text-[var(--neutral-900)] mb-4">Access Preview</h2>
            <p className="text-sm font-medium text-[var(--brand-700)]">{role}</p>
            <div className="mt-4 space-y-2">
              {rolePermissions[role].map((permission) => (
                <div key={permission} className="text-sm text-[var(--neutral-700)] flex items-center justify-between">
                  <span>{permission}</span>
                  <span className="text-xs text-[var(--success-700)]">On</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[var(--neutral-200)] rounded-lg p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--neutral-900)]">Send invite</p>
                <p className="text-xs text-[var(--neutral-500)] mt-1">Email login details to the user.</p>
              </div>
              <Switch checked={sendInvite} onCheckedChange={setSendInvite} />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
