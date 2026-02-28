import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Plus,
  LogIn,
  Copy,
  Check,
  ArrowLeft,
  Users,
  Star,
  Trophy,
  Clock,
  Play,
  Crown,
  Medal,
  Loader2,
  XCircle,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';
import { duelService } from '@/services/duel.service';
import type { Duel, DuelListItem, DuelQuestion } from '@/services/duel.service';

const DIFFICULTY_CONFIG = {
  FACILE: { label: 'Facile', cost: 5, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  MOYEN: { label: 'Moyen', cost: 10, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  DIFFICILE: { label: 'Difficile', cost: 20, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  ALEATOIRE: { label: 'Aléatoire', cost: 12, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
};

const STATUS_LABELS: Record<string, string> = {
  WAITING: 'En attente',
  READY: 'Prêt',
  PLAYING: 'En cours',
  FINISHED: 'Terminé',
  CANCELLED: 'Annulé',
};

type View = 'list' | 'create' | 'join' | 'lobby' | 'play' | 'results';

export function DuelsPage() {
  const { user } = useAuthStore();
  const [view, setView] = useState<View>('list');
  const [duels, setDuels] = useState<DuelListItem[]>([]);
  const [currentDuel, setCurrentDuel] = useState<Duel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDuels = useCallback(async () => {
    try {
      setLoading(true);
      const data = await duelService.getMyDuels();
      setDuels(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDuels();
  }, [loadDuels]);

  const handleBack = () => {
    setError('');
    setCurrentDuel(null);
    setView('list');
    loadDuels();
  };

  const handleDuelCreated = (duel: Duel) => {
    setCurrentDuel(duel);
    setView('lobby');
  };

  const handleJoined = (duel: Duel) => {
    setCurrentDuel(duel);
    if (duel.status === 'PLAYING') setView('play');
    else if (duel.status === 'FINISHED') setView('results');
    else setView('lobby');
  };

  const handleOpenDuel = async (duelId: string) => {
    try {
      setLoading(true);
      const duel = await duelService.getDuel(duelId);
      setCurrentDuel(duel);
      if (duel.status === 'PLAYING') setView('play');
      else if (duel.status === 'FINISHED') setView('results');
      else setView('lobby');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {view === 'list' && (
          <DuelListView
            key="list"
            duels={duels}
            loading={loading}
            onCreateClick={() => { setError(''); setView('create'); }}
            onJoinClick={() => { setError(''); setView('join'); }}
            onOpenDuel={handleOpenDuel}
          />
        )}
        {view === 'create' && (
          <CreateDuelView
            key="create"
            userStars={user?.stars || 0}
            onBack={handleBack}
            onCreated={handleDuelCreated}
          />
        )}
        {view === 'join' && (
          <JoinDuelView
            key="join"
            onBack={handleBack}
            onJoined={handleJoined}
          />
        )}
        {view === 'lobby' && currentDuel && (
          <LobbyView
            key="lobby"
            duel={currentDuel}
            userId={user?.id || ''}
            onBack={handleBack}
            onStarted={() => setView('play')}
            onDuelUpdate={setCurrentDuel}
          />
        )}
        {view === 'play' && currentDuel && (
          <PlayView
            key="play"
            duel={currentDuel}
            onFinished={() => setView('results')}
            onDuelUpdate={setCurrentDuel}
          />
        )}
        {view === 'results' && currentDuel && (
          <ResultsView
            key="results"
            duel={currentDuel}
            userId={user?.id || ''}
            onBack={handleBack}
            onDuelUpdate={setCurrentDuel}
          />
        )}
      </AnimatePresence>
      {error && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium">
          {error}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   LIST VIEW
   ================================================================ */

function DuelListView({
  duels,
  loading,
  onCreateClick,
  onJoinClick,
  onOpenDuel,
}: {
  duels: DuelListItem[];
  loading: boolean;
  onCreateClick: () => void;
  onJoinClick: () => void;
  onOpenDuel: (id: string) => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628] dark:text-[#E2E8F5] flex items-center gap-2">
            <Swords className="h-7 w-7 text-[#00924F] dark:text-[#00D97E]" />
            Salon de Duel
          </h1>
          <p className="text-sm text-[#5E7A9A] mt-1">Affrontez d'autres joueurs en temps réel</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onJoinClick} variant="outline" className="gap-2 border-[#DCE6F0] dark:border-[#1B2B40]">
            <LogIn className="h-4 w-4" />
            Rejoindre
          </Button>
          <Button onClick={onCreateClick} className="gap-2 bg-[#00924F] hover:bg-[#006B39] dark:bg-[#00D97E] dark:hover:bg-[#00B86B] dark:text-black">
            <Plus className="h-4 w-4" />
            Créer un salon
          </Button>
        </div>
      </div>

      {/* Duels list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#00924F] dark:text-[#00D97E]" />
        </div>
      ) : duels.length === 0 ? (
        <Card className="mt-6 border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525]">
          <CardContent className="py-16 text-center">
            <Swords className="h-16 w-16 mx-auto mb-4 text-[#5E7A9A]/30" />
            <p className="text-lg font-medium text-[#0A1628] dark:text-[#E2E8F5]">Aucun duel pour le moment</p>
            <p className="text-sm text-[#5E7A9A] mt-1">Créez un salon ou rejoignez-en un avec un code</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 mt-6">
          {duels.map((duel) => {
            const diff = DIFFICULTY_CONFIG[duel.difficulty as keyof typeof DIFFICULTY_CONFIG];
            return (
              <motion.div key={duel.id} whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }}>
                <Card
                  className="cursor-pointer border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525] hover:border-[#00924F]/30 dark:hover:border-[#00D97E]/30 transition-all"
                  onClick={() => onOpenDuel(duel.id)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl ${diff?.bg || 'bg-gray-500/10'} flex items-center justify-center flex-shrink-0`}>
                      <Swords className={`h-6 w-6 ${diff?.color || 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-[#0A1628] dark:text-[#E2E8F5]">{duel.code}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${diff?.bg} ${diff?.color} font-medium`}>{diff?.label}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#EFF3F7] dark:bg-[#111B2E] text-[#5E7A9A] font-medium">
                          {STATUS_LABELS[duel.status] || duel.status}
                        </span>
                        {duel.isCreator && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#00924F]/10 text-[#00924F] dark:bg-[#00D97E]/10 dark:text-[#00D97E] font-medium">Créateur</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#5E7A9A]">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {duel.participantCount}/{duel.maxParticipants}</span>
                        <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {duel.starsCost}</span>
                        {duel.status === 'FINISHED' && duel.myRank && (
                          <span className="flex items-center gap-1 font-medium text-[#00924F] dark:text-[#00D97E]">
                            {duel.myRank === 1 ? <Crown className="h-3 w-3" /> : <Medal className="h-3 w-3" />}
                            #{duel.myRank} · +{duel.myStarsWon}⭐
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

/* ================================================================
   CREATE VIEW
   ================================================================ */

function CreateDuelView({
  userStars,
  onBack,
  onCreated,
}: {
  userStars: number;
  onBack: () => void;
  onCreated: (duel: Duel) => void;
}) {
  const [participants, setParticipants] = useState<number>(2);
  const [difficulty, setDifficulty] = useState<string>('FACILE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cost = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG]?.cost || 5;
  const canAfford = userStars >= cost;

  const handleCreate = async () => {
    try {
      setLoading(true);
      setError('');
      const duel = await duelService.create({ maxParticipants: participants, difficulty });
      onCreated(duel);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-lg mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#5E7A9A] hover:text-[#00924F] dark:hover:text-[#00D97E] mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>

      <h2 className="text-xl font-bold text-[#0A1628] dark:text-[#E2E8F5] mb-6">Créer un salon de duel</h2>

      {/* Participants */}
      <div className="mb-6">
        <label className="text-sm font-medium text-[#0A1628] dark:text-[#E2E8F5] mb-3 block">Nombre de participants</label>
        <div className="grid grid-cols-3 gap-3">
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => setParticipants(n)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                participants === n
                  ? 'border-[#00924F] dark:border-[#00D97E] bg-[#00924F]/5 dark:bg-[#00D97E]/5'
                  : 'border-[#DCE6F0] dark:border-[#1B2B40] hover:border-[#00924F]/30'
              }`}
            >
              <Users className={`h-6 w-6 mx-auto mb-1 ${participants === n ? 'text-[#00924F] dark:text-[#00D97E]' : 'text-[#5E7A9A]'}`} />
              <span className={`text-lg font-bold ${participants === n ? 'text-[#00924F] dark:text-[#00D97E]' : 'text-[#0A1628] dark:text-[#E2E8F5]'}`}>{n}</span>
              <p className="text-xs text-[#5E7A9A]">joueurs</p>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="mb-6">
        <label className="text-sm font-medium text-[#0A1628] dark:text-[#E2E8F5] mb-3 block">Niveau de difficulté</label>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setDifficulty(key)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                difficulty === key
                  ? `${config.border} ${config.bg}`
                  : 'border-[#DCE6F0] dark:border-[#1B2B40] hover:border-[#00924F]/30'
              }`}
            >
              <span className={`font-bold ${config.color}`}>{config.label}</span>
              <p className="text-xs text-[#5E7A9A] mt-1 flex items-center gap-1">
                <Star className="h-3 w-3" /> {config.cost} étoiles
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <Card className="border-[#DCE6F0] dark:border-[#1B2B40] bg-[#EFF3F7] dark:bg-[#111B2E] mb-6">
        <CardContent className="p-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#5E7A9A]">Votre mise</span>
            <span className="font-bold text-[#0A1628] dark:text-[#E2E8F5] flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" /> {cost} étoiles
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-[#5E7A9A]">Pot total</span>
            <span className="font-bold text-[#00924F] dark:text-[#00D97E] flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" /> {cost * participants} étoiles
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-[#5E7A9A]">Vos étoiles</span>
            <span className={`font-bold ${canAfford ? 'text-[#0A1628] dark:text-[#E2E8F5]' : 'text-red-500'}`}>{userStars}⭐</span>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-red-500 text-sm mb-4 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {error}</p>}

      <Button
        onClick={handleCreate}
        disabled={loading || !canAfford}
        className="w-full gap-2 bg-[#00924F] hover:bg-[#006B39] dark:bg-[#00D97E] dark:hover:bg-[#00B86B] dark:text-black"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />}
        {canAfford ? 'Créer le salon' : 'Étoiles insuffisantes'}
      </Button>
    </motion.div>
  );
}

/* ================================================================
   JOIN VIEW
   ================================================================ */

function JoinDuelView({
  onBack,
  onJoined,
}: {
  onBack: () => void;
  onJoined: (duel: Duel) => void;
}) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (code.length !== 6) { setError('Le code doit contenir 6 caractères'); return; }
    try {
      setLoading(true);
      setError('');
      const duel = await duelService.join(code);
      onJoined(duel);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-lg mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#5E7A9A] hover:text-[#00924F] dark:hover:text-[#00D97E] mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>

      <h2 className="text-xl font-bold text-[#0A1628] dark:text-[#E2E8F5] mb-6">Rejoindre un salon</h2>

      <div className="mb-6">
        <label className="text-sm font-medium text-[#0A1628] dark:text-[#E2E8F5] mb-2 block">Code du salon</label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
          placeholder="Ex: ABC123"
          maxLength={6}
          className="w-full px-4 py-3 rounded-xl border-2 border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525] text-center text-2xl font-mono font-bold tracking-[0.3em] text-[#0A1628] dark:text-[#E2E8F5] focus:outline-none focus:border-[#00924F] dark:focus:border-[#00D97E] transition-colors"
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
        />
      </div>

      {error && <p className="text-red-500 text-sm mb-4 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {error}</p>}

      <Button
        onClick={handleJoin}
        disabled={loading || code.length !== 6}
        className="w-full gap-2 bg-[#00924F] hover:bg-[#006B39] dark:bg-[#00D97E] dark:hover:bg-[#00B86B] dark:text-black"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        Rejoindre le salon
      </Button>
    </motion.div>
  );
}

/* ================================================================
   LOBBY VIEW
   ================================================================ */

function LobbyView({
  duel,
  userId: _userId,
  onBack,
  onStarted,
  onDuelUpdate,
}: {
  duel: Duel;
  userId: string;
  onBack: () => void;
  onStarted: () => void;
  onDuelUpdate: (d: Duel) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Poll for updates every 3 seconds
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      try {
        const updated = await duelService.getDuel(duel.id);
        onDuelUpdate(updated);
        if (updated.status === 'PLAYING') {
          onStarted();
        }
      } catch {
        // silent
      }
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [duel.id, onDuelUpdate, onStarted]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(duel.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunch = async () => {
    try {
      setLoading(true);
      setError('');
      await duelService.launch(duel.id);
      onStarted();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    try {
      setLoading(true);
      await duelService.leave(duel.id);
      onBack();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const diff = DIFFICULTY_CONFIG[duel.difficulty as keyof typeof DIFFICULTY_CONFIG];
  const isFull = duel.participants.length >= duel.maxParticipants;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-lg mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#5E7A9A] hover:text-[#00924F] dark:hover:text-[#00D97E] mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>

      <div className="text-center mb-8">
        <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl ${diff?.bg} mb-4`}>
          <Swords className={`h-8 w-8 ${diff?.color}`} />
        </div>
        <h2 className="text-xl font-bold text-[#0A1628] dark:text-[#E2E8F5]">Salon de Duel</h2>
        <p className="text-sm text-[#5E7A9A] mt-1">{diff?.label} · {duel.starsCost}⭐ par joueur</p>
      </div>

      {/* Code display */}
      <Card className="border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525] mb-6">
        <CardContent className="p-6 text-center">
          <p className="text-xs font-medium text-[#5E7A9A] uppercase tracking-wider mb-2">Code du salon</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl font-mono font-black tracking-[0.3em] text-[#00924F] dark:text-[#00D97E]">
              {duel.code}
            </span>
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg hover:bg-[#EFF3F7] dark:hover:bg-[#111B2E] transition-colors"
            >
              {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-[#5E7A9A]" />}
            </button>
          </div>
          <p className="text-xs text-[#5E7A9A] mt-2">Partagez ce code avec les autres joueurs</p>
        </CardContent>
      </Card>

      {/* Participants */}
      <div className="mb-6">
        <p className="text-sm font-medium text-[#0A1628] dark:text-[#E2E8F5] mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-[#5E7A9A]" />
          Participants ({duel.participants.length}/{duel.maxParticipants})
        </p>
        <div className="space-y-2">
          {duel.participants.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#EFF3F7] dark:bg-[#111B2E]">
              <div className="h-10 w-10 rounded-full bg-[#00924F]/10 dark:bg-[#00D97E]/10 flex items-center justify-center text-sm font-bold text-[#00924F] dark:text-[#00D97E]">
                {p.firstName?.charAt(0)}{p.lastName?.charAt(0)}
              </div>
              <div className="flex-1">
                <span className="font-medium text-sm text-[#0A1628] dark:text-[#E2E8F5]">{p.firstName} {p.lastName}</span>
                {p.id === duel.creatorId && (
                  <span className="ml-2 text-xs text-[#00924F] dark:text-[#00D97E] font-medium">Créateur</span>
                )}
              </div>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          ))}
          {Array.from({ length: duel.maxParticipants - duel.participants.length }).map((_, i) => (
            <div key={`empty-${i}`} className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-[#DCE6F0] dark:border-[#1B2B40]">
              <div className="h-10 w-10 rounded-full bg-[#EFF3F7] dark:bg-[#111B2E] flex items-center justify-center">
                <Clock className="h-4 w-4 text-[#5E7A9A]" />
              </div>
              <span className="text-sm text-[#5E7A9A]">En attente d'un joueur...</span>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {error}</p>}

      <div className="space-y-3">
        {duel.isCreator && isFull && (
          <Button
            onClick={handleLaunch}
            disabled={loading}
            className="w-full gap-2 bg-[#00924F] hover:bg-[#006B39] dark:bg-[#00D97E] dark:hover:bg-[#00B86B] dark:text-black"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Lancer le duel
          </Button>
        )}
        {duel.isCreator && !isFull && (
          <div className="text-center p-4 rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-sm">
            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
            En attente des participants...
          </div>
        )}
        {!duel.isCreator && !isFull && (
          <div className="text-center p-4 rounded-xl bg-[#00924F]/5 dark:bg-[#00D97E]/5 text-[#00924F] dark:text-[#00D97E] text-sm">
            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
            En attente des autres joueurs...
          </div>
        )}
        {!duel.isCreator && isFull && (
          <div className="text-center p-4 rounded-xl bg-[#00924F]/5 dark:bg-[#00D97E]/5 text-[#00924F] dark:text-[#00D97E] text-sm">
            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
            En attente du lancement par le créateur...
          </div>
        )}
        <Button onClick={handleLeave} disabled={loading} variant="outline" className="w-full gap-2 text-red-500 border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10">
          <XCircle className="h-4 w-4" />
          Quitter le salon
        </Button>
      </div>
    </motion.div>
  );
}

/* ================================================================
   PLAY VIEW
   ================================================================ */

function PlayView({
  duel,
  onFinished,
  onDuelUpdate,
}: {
  duel: Duel;
  onFinished: () => void;
  onDuelUpdate: (d: Duel) => void;
}) {
  const [questions, setQuestions] = useState<DuelQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [timeLeft, setTimeLeft] = useState(300);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loadingQ, setLoadingQ] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const pollRef2 = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const submittedRef = useRef(false);
  const submittingRef = useRef(false);

  // Load questions
  useEffect(() => {
    const load = async () => {
      try {
        const data = await duelService.getQuestions(duel.id);
        setQuestions(data.questions);
        // Calculate remaining time
        if (data.startedAt) {
          const elapsed = Math.floor((Date.now() - new Date(data.startedAt).getTime()) / 1000);
          setTimeLeft(Math.max(0, data.timeLimit - elapsed));
        }
      } catch {
        // silent
      } finally {
        setLoadingQ(false);
      }
    };
    load();
  }, [duel.id]);

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current || submittedRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await duelService.submit(duel.id, answers);
      submittedRef.current = true;
      setSubmitted(true);
    } catch { /* silent */ }
    submittingRef.current = false;
    setSubmitting(false);
  }, [duel.id, answers]);

  // Timer
  useEffect(() => {
    if (loadingQ || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [loadingQ, submitted, handleSubmit]);

  // Poll for duel status (to detect finish)
  useEffect(() => {
    if (!submitted) return;
    pollRef2.current = setInterval(async () => {
      try {
        const updated = await duelService.getDuel(duel.id);
        onDuelUpdate(updated);
        if (updated.status === 'FINISHED') {
          clearInterval(pollRef2.current);
          onFinished();
        }
      } catch { /* silent */ }
    }, 3000);
    return () => clearInterval(pollRef2.current);
  }, [submitted, duel.id, onDuelUpdate, onFinished]);

  const handleSelectOption = (questionId: string, optionId: string, type: string) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (type === 'QCU') {
        return { ...prev, [questionId]: [optionId] };
      }
      // QCM: toggle
      if (current.includes(optionId)) {
        return { ...prev, [questionId]: current.filter((id) => id !== optionId) };
      }
      return { ...prev, [questionId]: [...current, optionId] };
    });
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const question = questions[currentIndex];

  if (loadingQ) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-[#00924F] dark:text-[#00D97E] mb-4" />
        <p className="text-[#5E7A9A]">Chargement des questions...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center py-20">
        <CheckCircle className="h-16 w-16 mx-auto mb-4 text-[#00924F] dark:text-[#00D97E]" />
        <h2 className="text-xl font-bold text-[#0A1628] dark:text-[#E2E8F5] mb-2">Réponses soumises !</h2>
        <p className="text-[#5E7A9A] mb-4">En attente des autres joueurs...</p>
        <Loader2 className="h-6 w-6 animate-spin text-[#00924F] dark:text-[#00D97E] mx-auto" />
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto">
      {/* Timer + Progress */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm font-medium text-[#5E7A9A]">
          <span className="text-[#0A1628] dark:text-[#E2E8F5]">Question {currentIndex + 1}/{questions.length}</span>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-sm ${timeLeft <= 30 ? 'bg-red-500/10 text-red-500' : 'bg-[#EFF3F7] dark:bg-[#111B2E] text-[#0A1628] dark:text-[#E2E8F5]'}`}>
          <Clock className="h-4 w-4" />
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-[#EFF3F7] dark:bg-[#111B2E] mb-6 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-[#00924F] dark:bg-[#00D97E]"
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {question && (
        <div>
          {/* Question */}
          <Card className="border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525] mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${question.type === 'QCU' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'} font-medium`}>
                  {question.type === 'QCU' ? 'Choix unique' : 'Choix multiple'}
                </span>
              </div>
              <p className="text-[#0A1628] dark:text-[#E2E8F5] font-medium leading-relaxed">{question.content}</p>
            </CardContent>
          </Card>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {question.options.map((opt) => {
              const isSelected = (answers[question.id] || []).includes(opt.id);
              return (
                <motion.button
                  key={opt.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectOption(question.id, opt.id, question.type)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-[#00924F] dark:border-[#00D97E] bg-[#00924F]/5 dark:bg-[#00D97E]/5'
                      : 'border-[#DCE6F0] dark:border-[#1B2B40] hover:border-[#00924F]/30 bg-white dark:bg-[#0D1525]'
                  }`}
                >
                  <span className={`text-sm font-medium ${isSelected ? 'text-[#00924F] dark:text-[#00D97E]' : 'text-[#0A1628] dark:text-[#E2E8F5]'}`}>
                    {opt.content}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {currentIndex > 0 && (
              <Button onClick={() => setCurrentIndex((i) => i - 1)} variant="outline" className="flex-1 border-[#DCE6F0] dark:border-[#1B2B40]">
                Précédent
              </Button>
            )}
            {currentIndex < questions.length - 1 ? (
              <Button onClick={() => setCurrentIndex((i) => i + 1)} className="flex-1 bg-[#00924F] hover:bg-[#006B39] dark:bg-[#00D97E] dark:hover:bg-[#00B86B] dark:text-black">
                Suivant
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-[#00924F] hover:bg-[#006B39] dark:bg-[#00D97E] dark:hover:bg-[#00B86B] dark:text-black gap-2"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Terminer le duel
              </Button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ================================================================
   RESULTS VIEW
   ================================================================ */

function ResultsView({
  duel,
  userId,
  onBack,
  onDuelUpdate,
}: {
  duel: Duel;
  userId: string;
  onBack: () => void;
  onDuelUpdate: (d: Duel) => void;
}) {
  const pollRef3 = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // If duel is still PLAYING, poll until finished
  useEffect(() => {
    if (duel.status === 'FINISHED') return;
    pollRef3.current = setInterval(async () => {
      try {
        const updated = await duelService.getDuel(duel.id);
        onDuelUpdate(updated);
        if (updated.status === 'FINISHED') clearInterval(pollRef3.current);
      } catch { /* silent */ }
    }, 3000);
    return () => clearInterval(pollRef3.current);
  }, [duel.id, duel.status, onDuelUpdate]);

  if (duel.status !== 'FINISHED') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto text-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-[#00924F] dark:text-[#00D97E] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#0A1628] dark:text-[#E2E8F5] mb-2">Calcul des résultats...</h2>
        <p className="text-[#5E7A9A]">Veuillez patienter</p>
      </motion.div>
    );
  }

  const diff = DIFFICULTY_CONFIG[duel.difficulty as keyof typeof DIFFICULTY_CONFIG];
  const sorted = [...duel.participants].sort((a, b) => (a.rank || 99) - (b.rank || 99));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-lg mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#5E7A9A] hover:text-[#00924F] dark:hover:text-[#00D97E] mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour aux duels
      </button>

      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/20 mb-4"
        >
          <Trophy className="h-10 w-10 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-[#0A1628] dark:text-[#E2E8F5]">Résultats du duel</h2>
        <p className="text-sm text-[#5E7A9A] mt-1">{diff?.label} · {duel.starsCost}⭐ par joueur · Pot total : {duel.starsCost * duel.participants.length}⭐</p>
      </div>

      {/* Ranking */}
      <div className="space-y-3 mb-8">
        {sorted.map((p, i) => {
          const isMe = p.id === userId;
          const isWinner = i === 0;
          const isSecond = i === 1;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
            >
              <Card className={`border-2 ${isMe ? 'border-[#00924F] dark:border-[#00D97E]' : 'border-[#DCE6F0] dark:border-[#1B2B40]'} ${isWinner ? 'bg-yellow-50 dark:bg-yellow-900/10' : 'bg-white dark:bg-[#0D1525]'}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                    isWinner ? 'bg-yellow-500 text-white' : isSecond ? 'bg-gray-300 dark:bg-gray-600 text-white' : 'bg-[#EFF3F7] dark:bg-[#111B2E] text-[#5E7A9A]'
                  }`}>
                    {isWinner ? <Crown className="h-6 w-6" /> : `#${i + 1}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${isMe ? 'text-[#00924F] dark:text-[#00D97E]' : 'text-[#0A1628] dark:text-[#E2E8F5]'}`}>
                        {p.firstName} {p.lastName}
                      </span>
                      {isMe && <span className="text-xs bg-[#00924F]/10 text-[#00924F] dark:bg-[#00D97E]/10 dark:text-[#00D97E] px-2 py-0.5 rounded-full font-medium">Vous</span>}
                    </div>
                    <p className="text-xs text-[#5E7A9A] mt-0.5">
                      {p.correctCount}/10 bonnes réponses · Score : {p.score}%
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {p.starsWon > 0 ? (
                      <span className="font-bold text-[#00924F] dark:text-[#00D97E] flex items-center gap-1">
                        +{p.starsWon} <Star className="h-4 w-4 text-yellow-500" />
                      </span>
                    ) : (
                      <span className="text-xs text-[#5E7A9A]">-{duel.starsCost}⭐</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Button onClick={onBack} className="w-full gap-2 bg-[#00924F] hover:bg-[#006B39] dark:bg-[#00D97E] dark:hover:bg-[#00B86B] dark:text-black">
        <Swords className="h-4 w-4" />
        Retour aux duels
      </Button>
    </motion.div>
  );
}
