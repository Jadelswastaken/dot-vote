import { useState, useEffect, useMemo } from 'react';
import { fetchIdeas, castVote, removeVote, type IdeaData, type VoteResponse } from '../api';
import IdeaCard from './IdeaCard';
import NewIdeaForm from './NewIdeaForm';
import { Check, Moon } from 'lucide-react';

interface BoardProps {
  isAuthenticated: boolean;
  username: string | null;
}

function SkeletonCard() {
  return (
    <div className="w-full p-4 shadow-block-static bg-grey/30 animate-pulse">
      <div className="h-4 bg-grey/50 w-3/4 mb-3" />
      <div className="h-3 bg-grey/50 w-full mb-2" />
      <div className="h-3 bg-grey/50 w-2/3 mb-4" />
      <div className="border-t border-ink/20 pt-2 flex justify-between items-center">
        <div className="flex gap-2">
          <div className="w-6 h-6 rounded-full bg-grey/50" />
          <div className="w-6 h-6 rounded-full bg-grey/50" />
        </div>
        <div className="h-8 w-16 bg-grey/50" />
      </div>
    </div>
  );
}

export default function Board({ isAuthenticated, username }: BoardProps) {
  const [ideas, setIdeas] = useState<IdeaData[]>([]);
  const [sort, setSort] = useState('popular');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchIdeas(sort)
      .then(data => { if (!cancelled) setIdeas(data); })
      .catch(() => { if (!cancelled) setError('Failed to load ideas. Is the backend running?'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [sort]);

  function changeSort(newSort: string) {
    setSort(newSort);
    setLoading(true);
    setError('');
  }

  function updateIdeaVote(id: number, voteData: VoteResponse) {
    setIdeas(prev =>
      prev.map(idea =>
        idea.id === id
          ? { ...idea, vote_count: voteData.vote_count, user_has_voted: voteData.user_has_voted }
          : idea
      )
    );
  }

  async function handleVote(id: number) {
    const prev = ideas.find(i => i.id === id);
    if (!prev) return;
    updateIdeaVote(id, { vote_count: (prev.vote_count ?? 0) + 1, user_has_voted: true });
    try {
      const data = await castVote(id);
      updateIdeaVote(id, data);
    } catch (err) {
      updateIdeaVote(id, { vote_count: prev.vote_count, user_has_voted: prev.user_has_voted });
      throw err;
    }
  }

  async function handleUnvote(id: number) {
    const prev = ideas.find(i => i.id === id);
    if (!prev) return;
    updateIdeaVote(id, { vote_count: Math.max((prev.vote_count ?? 1) - 1, 0), user_has_voted: false });
    try {
      const data = await removeVote(id);
      updateIdeaVote(id, data);
    } catch (err) {
      updateIdeaVote(id, { vote_count: prev.vote_count, user_has_voted: prev.user_has_voted });
      throw err;
    }
  }

  function handleCreated(newIdea: IdeaData) {
    setIdeas(prev => [{ ...newIdea, vote_count: 0, user_has_voted: false, status: 'open' }, ...prev]);
  }

  const openIdeas = useMemo(() => ideas.filter(i => i.status !== 'shipped'), [ideas]);
  const shippedIdeas = useMemo(() => ideas.filter(i => i.status === 'shipped'), [ideas]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="flex items-center gap-2 text-md bg-plum px-3 py-1.5 shadow-block-static">
          <span>Sort:</span>
          <button
            className={`border-none  px-3 py-1 cursor-pointer  ${
              sort === 'popular' ? 'bg-dusty-blue shadow-block-static ' : 'hover:bg-hopbush hover:-translate-y-0.5 hover:shadow-lg'
            }`}
            onClick={() => changeSort('popular')}
          >
            Popular
          </button>
          <button
            className={`border-none  px-3 py-1 cursor-pointer  ${
              sort === 'newest' ? 'bg-dusty-blue shadow-block-static ' : 'hover:bg-hopbush hover:-translate-y-0.5 hover:shadow-lg'
            }`}
            onClick={() => changeSort('newest')}
          >
            Newest
          </button>
        </div>
        {isAuthenticated && <NewIdeaForm onCreated={handleCreated} />}
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}
      {error && <p className="text-center text-red-400 py-12 text-sm">{error}</p>}
      {!loading && !error && openIdeas.length === 0 && (
        <p className="text-center py-12 text-sm">No ideas yet — be the first to add one!</p>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {openIdeas.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onVote={handleVote}
              onUnvote={handleUnvote}
              isAuthenticated={isAuthenticated}
              username={username}
            />
          ))}
        </div>
      )}

      {!loading && !error && shippedIdeas.length > 0 && (
        <div className="flex flex-col gap-3 mt-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" /> Shipped
          </h3>
          <div className="flex flex-col gap-2">
            {shippedIdeas.map(idea => (
              <div key={idea.id} className="flex items-center gap-3 bg-viridian px-4 py-3 shadow-block-static">
                <Moon className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold">{idea.title}</span>
                  <span className="text-xs ml-2">{idea.description}</span>
                </div>
                <span className="text-xs flex-shrink-0">{idea.vote_count} {idea.vote_count === 1 ? 'vote' : 'votes'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
