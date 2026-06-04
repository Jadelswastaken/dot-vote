import { useState, useEffect, type FormEvent } from 'react';
import { createIdea, type IdeaData } from '../api';
import { Plus, X } from 'lucide-react';

interface NewIdeaFormProps {
  onCreated: (idea: IdeaData) => void;
}

export default function NewIdeaForm({ onCreated }: NewIdeaFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const idea = await createIdea(title, description);
      onCreated(idea);
      setTitle('');
      setDescription('');
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create idea');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setError('');
  }

  return (
    <>
      <button
        className="flex justify-end text-sm cursor-pointer "
        onClick={() => setOpen(true)}
      >
        <div className="flex relative top-4 left-4 w-9 h-9 bg-viridian rounded-full items-center shadow-block-dynamic justify-center ">
          <Plus className="w-4 h-4" />
        </div>
        <div className="bg-plum px-5 py-2 shadow-block-dynamic">New Idea</div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div className="bg-viridian w-[420px] max-w-[90vw] relative shadow-block-static">
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 bg-transparent border-none cursor-pointer p-1 hover:text-white "
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6">
              <h3 className="text-sm font-semibold">Submit a New Idea</h3>
              <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="block text-xs font-semibold">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Short, descriptive title"
                    required
                    maxLength={255}
                    className="w-full px-3 py-2 text-sm bg-dusty-lavender outline-none shadow-block-static"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="block text-xs font-semibold">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe the feature…"
                    required
                    rows={3}
              className="w-full px-3 py-2 text-sm bg-dusty-lavender outline-none shadow-block-static resize-y"
                  />
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="bg-transparent px-4 py-2 text-sm cursor-pointer hover:text-white hover:bg-ink  shadow-block-dynamic"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-accent px-4 py-2 text-sm cursor-pointer shadow-block-dynamic  hover:bg-hopbush disabled:opacity-50 disabled:cursor-not-allowed "
                  >
                    {loading ? 'Submitting…' : 'Submit'}
                  </button>
                </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
