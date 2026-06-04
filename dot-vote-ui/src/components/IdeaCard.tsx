import { useState } from 'react';
import type { IdeaData } from '../api';
import { X } from 'lucide-react';

const DOT_COLORS = ['#d2a7dc', '#5681af', '#6b8775', '#aa8cb1'];
const CARD_COLORS = ['bg-terracotta', 'bg-clay', 'bg-mustard', 'bg-mint', 'bg-dusty-blue'];

interface IdeaCardProps {
  idea: IdeaData;
  onVote: (id: number) => Promise<void>;
  onUnvote: (id: number) => Promise<void>;
  isAuthenticated: boolean;
  username?: string | null;
}

export default function IdeaCard({ idea, onVote, onUnvote, isAuthenticated, username }: IdeaCardProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const otherVotes = Math.max(0, (idea.vote_count ?? 0) - (idea.user_has_voted ? 1 : 0));

  async function handleToggle() {
    if (!isAuthenticated || pending) return;
    setPending(true);
    setError('');
    try {
      if (idea.user_has_voted) {
        await onUnvote(idea.id);
      } else {
        await onVote(idea.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Vote failed');
    } finally {
      setPending(false);
    }
  }

  const cardColor = CARD_COLORS[idea.id % CARD_COLORS.length];

  return (
    <div className={`break-inside-avoid inline-block w-full p-4 shadow-block-static transition-all ${cardColor}`}>
      <h3 className="text-sm font-bold leading-snug">{idea.title}</h3>
      <p className="text-xs leading-relaxed">{idea.description}</p>
      <span className="text-[0.7rem]">
        by {idea.created_by === username ? 'you' : idea.created_by} · {new Date(idea.created_at).toLocaleDateString()}
      </span>

      <div className="flex flex-wrap items-center justify-between gap-10 border-t border-ink min-h-[34px] pt-2">
        <div className="flex flex-row gap-2">
          {Array.from({ length: otherVotes }).map((_, i) => (
            <span key={i} className="w-6 h-6 rounded-full inline-block flex-shrink-0 shadow-block-static" style={{ background: DOT_COLORS[i % DOT_COLORS.length] }} />
          ))}

          {idea.user_has_voted && (
            <button
              className="w-6 h-6 rounded-full border-none p-0 cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-block-dynamic"
              style={{ background: '#c972a0' }}
              onClick={handleToggle}
              disabled={pending}
              title="Remove your vote"
            >
              <X className="w-4 h-4 opacity-10 hover:opacity-100" />
            </button>
          )}

          {isAuthenticated && !idea.user_has_voted && (
            <button
              className="bg-hopbush/80 w-6 h-6 rounded-full border-2 border-dashed border-ink text-ink p-0 cursor-pointer text-sm inline-flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleToggle}
              disabled={pending}
              title="Place your dot"
            >
              +
            </button>
          )}
        </div>
        <span className="text-sm flex items-center justify-center p-1 shadow-block-static bg-plum">
          {idea.vote_count} {idea.vote_count === 1 ? 'vote' : 'votes'}
        </span>
        {error && <span className="text-red-400 text-[0.7rem]">{error}</span>}
      </div>
    </div>
  );
}
