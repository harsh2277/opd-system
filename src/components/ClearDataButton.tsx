import { Button } from './ui/Button';
import { toast } from 'sonner';

export function ClearDataButton() {
  const clearAllData = () => {
    if (confirm('Clear all tokens and reset the system?')) {
      localStorage.removeItem('opd-tokens');
      localStorage.removeItem('opd-doctors');
      localStorage.removeItem('opd-current-token');
      localStorage.removeItem('opd-session-start');
      localStorage.removeItem('opd-initialized');
      toast.success('All data cleared! Refresh page to reload.');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <Button onClick={clearAllData} variant="danger" size="sm">
      Clear All Data
    </Button>
  );
}
