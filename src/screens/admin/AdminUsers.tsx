import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Plus, Search, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export const adminUsers = [
  { id: 'ADM001', name: 'Prem Admin', email: 'admin@gmail.com', role: 'Administrator', department: 'Operations', status: 'Active', lastLogin: 'Today, 09:12 AM' },
  { id: 'RC001', name: 'Harsh Reception', email: 'harsh@gmail.com', role: 'Receptionist', department: 'Front Desk', status: 'Active', lastLogin: 'Today, 08:50 AM' },
  { id: 'D001', name: 'Dr. Sharma', email: 'doctor@gmail.com', role: 'Doctor', department: 'General Medicine', status: 'Active', lastLogin: 'Today, 10:05 AM' },
  { id: 'PH003', name: 'Pharmacy Staff', email: 'pharmacy@gmail.com', role: 'Pharmacy Staff', department: 'Pharmacy', status: 'Active', lastLogin: 'Yesterday, 06:40 PM' },
  { id: 'LB001', name: 'Lab Staff', email: 'lab@gmail.com', role: 'Lab Staff', department: 'Pathology', status: 'Inactive', lastLogin: '05 Jun 2026' },
  { id: 'BL002', name: 'Billing Manager', email: 'billing@opd.com', role: 'Billing Staff', department: 'Finance', status: 'Active', lastLogin: 'Today, 11:20 AM' },
];

export function AdminUsers() {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('All');
  const roles = ['All', 'Administrator', 'Receptionist', 'Doctor', 'Pharmacy Staff', 'Lab Staff', 'Billing Staff'];
  const filtered = adminUsers.filter((user) => {
    const text = `${user.name} ${user.email} ${user.role} ${user.department}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (role === 'All' || user.role === role);
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--neutral-900)]">User Management</h1>
          <p className="text-sm text-[var(--neutral-500)] mt-1">Simple staff list with role and department access.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="line" size="sm"><Download size={14} />Export</Button>
          <Button size="sm" asChild>
            <Link to="/admin/users/add"><Plus size={14} />Add User</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          ['Total Users', adminUsers.length],
          ['Active', adminUsers.filter((user) => user.status === 'Active').length],
          ['Inactive', adminUsers.filter((user) => user.status === 'Inactive').length],
          ['Roles', roles.length - 1],
        ].map(([label, value]) => (
          <div key={label} className="bg-white border border-[var(--neutral-200)] rounded-lg p-4">
            <p className="text-xs text-[var(--neutral-500)]">{label}</p>
            <p className="text-2xl font-semibold text-[var(--neutral-900)] mt-2">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[var(--neutral-200)] rounded-lg">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-[var(--neutral-100)]">
          <div className="relative flex-1 min-w-72 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--neutral-400)]" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users..." className="pl-9 h-9 text-xs" />
          </div>
          <div className="flex items-center gap-1">
            {roles.map((item) => (
              <button
                key={item}
                onClick={() => setRole(item)}
                className={`px-3 py-1.5 rounded-md text-xs ${role === item ? 'bg-[var(--neutral-900)] text-white' : 'text-[var(--neutral-600)] hover:bg-[var(--neutral-100)]'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--neutral-50)] border-b border-[var(--neutral-100)]">
                {['User', 'Role', 'Department', 'Status', 'Last Login', 'Action'].map((heading) => (
                  <th key={heading} className="text-left px-4 py-2.5 text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wide">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-[var(--neutral-100)] last:border-0 hover:bg-[var(--neutral-50)]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--brand-50)] flex items-center justify-center">
                        <ShieldCheck size={14} className="text-[var(--brand-500)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--neutral-900)]">{user.name}</p>
                        <p className="text-xs text-[var(--neutral-500)]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--neutral-700)]">{user.role}</td>
                  <td className="px-4 py-3 text-[var(--neutral-700)]">{user.department}</td>
                  <td className="px-4 py-3"><StatusPill status={user.status} /></td>
                  <td className="px-4 py-3 text-[var(--neutral-600)]">{user.lastLogin}</td>
                  <td className="px-4 py-3"><button className="text-xs font-medium text-[var(--brand-700)] hover:underline">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const active = status === 'Active';
  return (
    <span className={`text-xs px-2.5 py-1 rounded border ${active ? 'bg-[var(--success-50)] text-[var(--success-700)] border-[var(--success-100)]' : 'bg-[var(--neutral-100)] text-[var(--neutral-500)] border-[var(--neutral-200)]'}`}>
      {status}
    </span>
  );
}
