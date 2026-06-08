'use client';

import { useState, useRef, useCallback } from 'react';
import { PAGE_TEMPLATES, type SitePage, type PageTemplate } from '@/lib/page-templates';

interface PageManagerProps {
  siteId: string;
  pages: SitePage[];
  currentPageId: string | null;
  onPagesChange: (pages: SitePage[]) => void;
  onPageSelect: (pageId: string) => void;
}

export default function PageManager({
  siteId,
  pages,
  currentPageId,
  onPagesChange,
  onPageSelect,
}: PageManagerProps) {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const availableTemplates = PAGE_TEMPLATES.filter(
    t => !pages.some(p => p.templateId === t.id)
  );

  const handleCreatePages = async (templateIds: string[]) => {
    setCreating(true);
    try {
      const res = await fetch(`/api/sites/${siteId}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateIds }),
      });

      if (res.ok) {
        const data = await res.json();
        onPagesChange(data.pages);
        if (data.newPages?.length > 0) {
          onPageSelect(data.newPages[0].id);
        }
        setShowTemplateSelector(false);
      }
    } catch {} finally {
      setCreating(false);
    }
  };

  const handleCreateDefault = () => {
    const defaults = ['home', 'about', 'services'].filter(
      id => !pages.some(p => p.templateId === id)
    );
    if (defaults.length > 0) {
      handleCreatePages(defaults);
    }
  };

  const handleStartRename = (page: SitePage) => {
    setEditingPageId(page.id);
    setEditingName(page.name);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleFinishRename = async () => {
    if (!editingPageId || !editingName.trim()) {
      setEditingPageId(null);
      return;
    }

    const page = pages.find(p => p.id === editingPageId);
    if (!page || page.name === editingName.trim()) {
      setEditingPageId(null);
      return;
    }

    try {
      const res = await fetch(`/api/sites/${siteId}/pages/${editingPageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName.trim() }),
      });

      if (res.ok) {
        onPagesChange(
          pages.map(p =>
            p.id === editingPageId ? { ...p, name: editingName.trim() } : p
          )
        );
      }
    } catch {} finally {
      setEditingPageId(null);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    try {
      const res = await fetch(`/api/sites/${siteId}/pages/${pageId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const filtered = pages.filter(p => p.id !== pageId);
        onPagesChange(filtered);
        if (currentPageId === pageId) {
          onPageSelect(filtered[0]?.id || '');
        }
      }
    } catch {} finally {
      setDeleteConfirmId(null);
    }
  };

  const handleToggleEnabled = async (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return;

    const updatedPages = pages.map(p =>
      p.id === pageId ? { ...p, enabled: !p.enabled } : p
    );
    onPagesChange(updatedPages);

    try {
      await fetch(`/api/sites/${siteId}/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !page.enabled }),
      });
    } catch {}
  };

  const handleReorder = useCallback(
    (from: number, to: number) => {
      const reordered = [...pages];
      const [moved] = reordered.splice(from, 1);
      reordered.splice(to, 0, moved);
      onPagesChange(reordered);

      fetch(`/api/sites/${siteId}/pages/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageIds: reordered.map(p => p.id) }),
      }).catch(() => {});
    },
    [pages, siteId, onPagesChange]
  );

  const getTemplate = (templateId: string): PageTemplate | undefined => {
    return PAGE_TEMPLATES.find(t => t.id === templateId);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Pages ({pages.length})
        </span>
        <button
          onClick={() => setShowTemplateSelector(!showTemplateSelector)}
          className="p-1.5 rounded-lg hover:bg-surface-dim transition-colors text-text-secondary hover:text-text-primary"
          title="Add page"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {showTemplateSelector && (
        <div className="border-b border-border bg-surface-dim p-3 space-y-2">
          <p className="text-xs font-medium text-text-secondary mb-2">
            {availableTemplates.length > 0
              ? 'Select a template to add:'
              : 'All templates used. Use templates below or create custom.'}
          </p>
          {availableTemplates.length > 0 ? (
            <div className="space-y-1.5">
              {availableTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleCreatePages([template.id])}
                  disabled={creating}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-border bg-surface hover:border-blue hover:bg-blue/5 transition-all text-left disabled:opacity-50"
                >
                  <span className="text-lg">{template.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {template.name}
                    </p>
                    <p className="text-xs text-text-secondary truncate">
                      {template.description}
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 text-text-secondary shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={handleCreateDefault}
              disabled={creating}
              className="w-full px-3 py-2 rounded-xl gradient-blue text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create 3 Default Pages'}
            </button>
          )}
          <button
            onClick={() => setShowTemplateSelector(false)}
            className="w-full px-3 py-1.5 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {pages.length === 0 ? (
          <div className="p-4 text-center space-y-3">
            <p className="text-sm text-text-secondary">No pages yet.</p>
            <button
              onClick={handleCreateDefault}
              disabled={creating}
              className="px-4 py-2 rounded-xl gradient-blue text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create 3 Pages'}
            </button>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {pages.map((page, idx) => {
              const template = getTemplate(page.templateId);
              const isActive = currentPageId === page.id;

              return (
                <div
                  key={page.id}
                  draggable
                  onDragStart={() => setDragIdx(idx)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => {
                    if (dragIdx !== null && dragIdx !== idx) {
                      handleReorder(dragIdx, idx);
                    }
                    setDragIdx(null);
                  }}
                  onDragEnd={() => setDragIdx(null)}
                  className={`group flex items-center gap-2 p-2.5 rounded-xl border cursor-move transition-all ${
                    dragIdx === idx
                      ? 'opacity-50 border-blue bg-blue/5'
                      : isActive
                      ? 'border-blue bg-blue/10 shadow-sm'
                      : 'border-transparent hover:border-border hover:bg-surface-dim'
                  }`}
                  onClick={() => onPageSelect(page.id)}
                >
                  <span className="text-sm shrink-0 opacity-40 group-hover:opacity-70">
                    ⠿
                  </span>

                  <span className="text-base shrink-0">
                    {template?.icon || '📄'}
                  </span>

                  <div className="flex-1 min-w-0">
                    {editingPageId === page.id ? (
                      <input
                        ref={inputRef}
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        onBlur={handleFinishRename}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleFinishRename();
                          if (e.key === 'Escape') setEditingPageId(null);
                        }}
                        onClick={e => e.stopPropagation()}
                        className="w-full px-1.5 py-0.5 rounded bg-surface border border-blue text-sm text-text-primary outline-none"
                      />
                    ) : (
                      <>
                        <p className={`text-sm font-medium truncate ${!page.enabled ? 'opacity-50' : ''}`}>
                          {page.name}
                        </p>
                        <p className="text-xs text-text-secondary truncate">
                          {page.slug}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleToggleEnabled(page.id);
                      }}
                      className={`p-1 rounded-md transition-colors ${
                        page.enabled
                          ? 'text-green hover:bg-green/10'
                          : 'text-text-secondary hover:bg-surface-dim'
                      }`}
                      title={page.enabled ? 'Disable page' : 'Enable page'}
                    >
                      {page.enabled ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleStartRename(page);
                      }}
                      className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-dim transition-colors"
                      title="Rename"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setDeleteConfirmId(deleteConfirmId === page.id ? null : page.id);
                      }}
                      className="p-1 rounded-md text-text-secondary hover:text-red hover:bg-red/10 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {deleteConfirmId === page.id && (
                    <div
                      className="absolute right-2 top-full z-10 mt-1 p-2 rounded-xl bg-surface border border-border shadow-lg"
                      onClick={e => e.stopPropagation()}
                    >
                      <p className="text-xs text-text-secondary mb-2">Delete this page?</p>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleDeletePage(page.id)}
                          className="px-2.5 py-1 rounded-lg bg-red text-white text-xs font-medium hover:opacity-90"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2.5 py-1 rounded-lg border border-border text-xs font-medium hover:bg-surface-dim"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {pages.length > 0 && availableTemplates.length > 0 && (
        <div className="border-t border-border p-2">
          <button
            onClick={() => setShowTemplateSelector(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-border hover:border-blue text-text-secondary hover:text-blue text-xs font-medium transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Page
          </button>
        </div>
      )}
    </div>
  );
}
