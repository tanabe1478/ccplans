import type { ExternalApp } from '@ccplans/shared';
import { Code, Edit3, ExternalLink, MoreVertical, Terminal, Trash2 } from 'lucide-react';
import { useId, useState } from 'react';
import { useDeletePlan, useOpenPlan, useRenamePlan } from '../../lib/hooks';
import { useUiStore } from '../../stores/uiStore';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

interface PlanActionsProps {
  filename: string;
  title?: string;
  onDeleted?: () => void;
}

export function PlanActions({ filename, title, onDeleted }: PlanActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [newFilename, setNewFilename] = useState(filename);
  const renameInputId = useId();

  const deletePlan = useDeletePlan();
  const renamePlan = useRenamePlan();
  const openPlan = useOpenPlan();
  const { addToast } = useUiStore();

  const handleOpen = async (app: ExternalApp) => {
    try {
      await openPlan.mutateAsync({ filename, app });
      addToast(`${app}で開きました`, 'success');
    } catch (err) {
      addToast(`開けませんでした: ${err}`, 'error');
    }
    setShowMenu(false);
  };

  const handleDelete = async () => {
    try {
      await deletePlan.mutateAsync({ filename });
      addToast('Plan deleted', 'success');
      setShowDeleteDialog(false);
      onDeleted?.();
    } catch (err) {
      addToast(`Delete failed: ${err}`, 'error');
    }
  };

  const handleRename = async () => {
    if (!newFilename || newFilename === filename) {
      setShowRenameDialog(false);
      return;
    }

    const finalName = newFilename.endsWith('.md') ? newFilename : `${newFilename}.md`;

    try {
      await renamePlan.mutateAsync({ filename, newFilename: finalName });
      addToast('Renamed successfully', 'success');
      setShowRenameDialog(false);
    } catch (err) {
      addToast(`Rename failed: ${err}`, 'error');
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Quick actions */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpen('vscode')}
          title="Open in VSCode"
        >
          <Code className="h-4 w-4 mr-1" />
          VSCode
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpen('terminal')}
          title="Open in Terminal"
        >
          <Terminal className="h-4 w-4 mr-1" />
          Terminal
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpen('default')}
          title="Open in default app"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>

        {/* More actions menu */}
        <div className="relative">
          <Button variant="ghost" size="icon" onClick={() => setShowMenu(!showMenu)}>
            <MoreVertical className="h-4 w-4" />
          </Button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-md border bg-card shadow-lg z-10">
              <div className="py-1">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
                  onClick={() => {
                    setShowRenameDialog(true);
                    setShowMenu(false);
                  }}
                >
                  <Edit3 className="h-4 w-4" />
                  Rename
                </button>

                <hr className="my-1" />

                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setShowDeleteDialog(true);
                    setShowMenu(false);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showMenu && (
        <button
          type="button"
          aria-label="Close actions menu"
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowMenu(false);
          }}
        />
      )}

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        filename={filename}
        title={title ?? filename}
        onDelete={handleDelete}
        isDeleting={deletePlan.isPending}
      />

      {/* Rename dialog */}
      <Dialog open={showRenameDialog} onClose={() => setShowRenameDialog(false)} title="Rename">
        <div className="mb-4">
          <label htmlFor={renameInputId} className="block text-sm font-medium mb-1">
            New filename
          </label>
          <input
            id={renameInputId}
            type="text"
            value={newFilename}
            onChange={(e) => setNewFilename(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            placeholder="new-filename.md"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleRename} disabled={renamePlan.isPending}>
            {renamePlan.isPending ? 'Renaming...' : 'Rename'}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
