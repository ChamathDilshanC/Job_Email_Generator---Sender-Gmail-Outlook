'use client';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ResumeProfileSummary } from '@/lib/resumeDataService';
import { Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ResumeProfileSwitcherProps {
  profiles: ResumeProfileSummary[];
  activeProfileId: string;
  hasUnsavedChanges: boolean;
  onSwitch: (profileId: string) => void;
  onCreate: (name: string) => void;
  onRename: (profileId: string, name: string) => void;
  onDelete: (profileId: string) => void;
  onSetDefault: (profileId: string) => void;
}

export default function ResumeProfileSwitcher({
  profiles,
  activeProfileId,
  hasUnsavedChanges,
  onSwitch,
  onCreate,
  onRename,
  onDelete,
  onSetDefault,
}: ResumeProfileSwitcherProps) {
  const [pendingSwitchId, setPendingSwitchId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');

  const activeProfile = profiles.find(p => p.profileId === activeProfileId);

  const handleSelect = (profileId: string) => {
    if (profileId === activeProfileId) return;
    if (hasUnsavedChanges) {
      setPendingSwitchId(profileId);
    } else {
      onSwitch(profileId);
    }
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
      <span className="px-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Resume Profile
      </span>
      <Select value={activeProfileId} onValueChange={handleSelect}>
        <SelectTrigger className="h-9 w-56">
          <SelectValue placeholder="Select a profile" />
        </SelectTrigger>
        <SelectContent>
          {profiles.map(profile => (
            <SelectItem key={profile.profileId} value={profile.profileId}>
              {profile.profileName}
              {profile.isDefault ? ' (Default)' : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setNameInput('');
          setCreateOpen(true);
        }}
        title="Create a new resume profile"
      >
        <Plus className="h-3.5 w-3.5" /> New
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setNameInput(activeProfile?.profileName || '');
          setRenameOpen(true);
        }}
        title="Rename current profile"
      >
        <Pencil className="h-3.5 w-3.5" /> Rename
      </Button>

      {!activeProfile?.isDefault && activeProfile && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onSetDefault(activeProfile.profileId)}
          title="Make this the default profile"
        >
          <Star className="h-3.5 w-3.5" /> Set Default
        </Button>
      )}

      {profiles.length > 1 && activeProfile && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-red-600 hover:text-red-700 dark:text-red-400"
          onClick={() => setDeleteTarget(activeProfile.profileId)}
          title="Delete current profile"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Resume Profile</DialogTitle>
          </DialogHeader>
          <input
            autoFocus
            className="form-input"
            placeholder="e.g., Frontend Developer, UI/UX Designer"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
          />
          <DialogFooter>
            <Button
              disabled={!nameInput.trim()}
              onClick={() => {
                onCreate(nameInput.trim());
                setCreateOpen(false);
              }}
            >
              Create Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Profile</DialogTitle>
          </DialogHeader>
          <input
            autoFocus
            className="form-input"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
          />
          <DialogFooter>
            <Button
              disabled={!nameInput.trim()}
              onClick={() => {
                onRename(activeProfileId, nameInput.trim());
                setRenameOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Switch-with-unsaved-changes confirmation */}
      <ConfirmDialog
        open={pendingSwitchId !== null}
        onOpenChange={open => !open && setPendingSwitchId(null)}
        title="Switch Resume Profile?"
        description="You have unsaved changes on this step. Switching profiles now will discard them. Continue?"
        confirmText="Switch Profile"
        type="warning"
        onConfirm={() => {
          if (pendingSwitchId) onSwitch(pendingSwitchId);
          setPendingSwitchId(null);
        }}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={open => !open && setDeleteTarget(null)}
        title="Delete Resume Profile?"
        description="This permanently deletes this resume profile and its data. This cannot be undone."
        confirmText="Delete"
        type="danger"
        onConfirm={() => {
          if (deleteTarget) onDelete(deleteTarget);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
