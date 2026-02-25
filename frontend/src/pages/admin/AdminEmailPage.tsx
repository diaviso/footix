import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Send,
  Users,
  Search,
  CheckCircle,
  XCircle,
  Crown,
  Loader2,
  AlertCircle,
  CheckSquare,
  Square,
  UserCheck,
  ArrowLeft,
  History,
  Eye,
  ChevronDown,
  ChevronUp,
  Calendar,
  ImageIcon,
  Trash2,
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isPremium: boolean;
  role: string;
  createdAt: string;
}

interface EmailHistoryItem {
  id: string;
  subject: string;
  htmlContent: string;
  recipientCount: number;
  recipientEmails: string[];
  successCount: number;
  failedCount: number;
  errors: string[];
  sentAt: string;
  sentBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Toolbar button component
const ToolbarButton = ({
  onClick,
  isActive,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={cn(
      'p-2 rounded-lg transition-colors',
      isActive
        ? 'bg-[#D4AF37] text-white'
        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
    )}
  >
    {children}
  </button>
);

export default function AdminEmailPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();

  // Mode: 'category' = broadcast by category, 'manual' = search & select individual users
  const [mode, setMode] = useState<'category' | 'manual'>('category');

  // Category mode state
  const [recipientCounts, setRecipientCounts] = useState<{ all: number; premium: number; free: number }>({ all: 0, premium: 0, free: 0 });
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'premium' | 'free'>('all');
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);

  // Manual mode state
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Email form state
  const [isSending, setIsSending] = useState(false);
  const [subject, setSubject] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success: number;
    failed: number;
    message: string;
  } | null>(null);

  // Signature image
  const [signatureImageUrl, setSignatureImageUrl] = useState<string>(
    () => localStorage.getItem('emailSignatureImageUrl') || ''
  );
  const [isUploadingSignature, setIsUploadingSignature] = useState(false);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  // History
  const [emailHistory, setEmailHistory] = useState<EmailHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [_historyPage, setHistoryPage] = useState(1);
  const [_historyTotalPages, setHistoryTotalPages] = useState(1);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  // Check admin access
  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch recipient counts
  const fetchRecipientCounts = useCallback(async () => {
    setIsLoadingCounts(true);
    try {
      const response = await api.get('/mail/admin/recipient-counts');
      setRecipientCounts(response.data);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de charger les compteurs', variant: 'destructive' });
    } finally {
      setIsLoadingCounts(false);
    }
  }, [toast]);

  // Search users for manual selection
  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchTotal(0);
      return;
    }
    setIsSearching(true);
    try {
      const response = await api.get(`/mail/admin/users?search=${encodeURIComponent(query)}&limit=20`);
      setSearchResults(response.data.data);
      setSearchTotal(response.data.total);
    } catch {
      toast({ title: 'Erreur', description: 'Erreur de recherche', variant: 'destructive' });
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  // Fetch email history with pagination
  const fetchEmailHistory = useCallback(async (page = 1) => {
    setIsLoadingHistory(true);
    try {
      const response = await api.get(`/mail/admin/history?page=${page}&limit=20`);
      setEmailHistory(response.data.data);
      setHistoryPage(response.data.page);
      setHistoryTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to load email history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipientCounts();
    fetchEmailHistory();
  }, [fetchRecipientCounts, fetchEmailHistory]);

  // Debounced search for manual mode
  useEffect(() => {
    if (mode !== 'manual') return;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      searchUsers(searchQuery);
    }, 400);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery, mode, searchUsers]);

  const handleSelectUser = (u: User) => {
    if (selectedUserIds.includes(u.id)) {
      setSelectedUserIds((prev) => prev.filter((id) => id !== u.id));
      setSelectedUsers((prev) => prev.filter((su) => su.id !== u.id));
    } else {
      setSelectedUserIds((prev) => [...prev, u.id]);
      setSelectedUsers((prev) => [...prev, u]);
    }
  };

  const handleRemoveSelectedUser = (userId: string) => {
    setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const validateForm = () => {
    if (!subject.trim()) {
      toast({ title: 'Erreur', description: 'Veuillez saisir un objet pour l\'email', variant: 'destructive' });
      return false;
    }
    if (!editor?.getHTML() || editor.getHTML() === '<p></p>') {
      toast({ title: 'Erreur', description: 'Veuillez saisir le contenu de l\'email', variant: 'destructive' });
      return false;
    }
    if (mode === 'manual' && selectedUserIds.length === 0) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner au moins un destinataire', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handlePreviewSend = () => {
    if (validateForm()) {
      setShowConfirmDialog(true);
    }
  };

  const handleUploadSignature = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner une image', variant: 'destructive' });
      return;
    }
    setIsUploadingSignature(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = response.data.url;
      setSignatureImageUrl(url);
      localStorage.setItem('emailSignatureImageUrl', url);
      toast({ title: 'Signature ajoutée', description: 'L\'image de signature a été téléchargée' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de télécharger l\'image', variant: 'destructive' });
    } finally {
      setIsUploadingSignature(false);
      if (signatureInputRef.current) signatureInputRef.current.value = '';
    }
  };

  const handleRemoveSignature = () => {
    setSignatureImageUrl('');
    localStorage.removeItem('emailSignatureImageUrl');
  };

  const handleSendEmail = async () => {
    setShowConfirmDialog(false);
    setIsSending(true);

    try {
      const payload: any = {
        subject,
        htmlContent: editor?.getHTML(),
        signatureImageUrl: signatureImageUrl || undefined,
      };

      if (mode === 'category') {
        payload.recipientCategory = selectedCategory;
      } else {
        payload.userIds = selectedUserIds;
      }

      const response = await api.post('/mail/admin/send', payload);

      setSendResult({
        success: response.data.success,
        failed: response.data.failed,
        message: response.data.message,
      });

      if (response.data.failed === 0) {
        toast({ title: 'Succès', description: response.data.message });
        setSubject('');
        editor?.commands.setContent('');
        setSelectedUserIds([]);
        setSelectedUsers([]);
        fetchEmailHistory();
        fetchRecipientCounts();
      } else {
        toast({ title: 'Envoi partiel', description: response.data.message, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Erreur', description: 'Une erreur est survenue lors de l\'envoi', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  const recipientCount = mode === 'category' ? recipientCounts[selectedCategory] : selectedUserIds.length;
  const recipientLabel = mode === 'category'
    ? selectedCategory === 'all' ? 'Tous les utilisateurs vérifiés'
      : selectedCategory === 'premium' ? 'Utilisateurs Premium'
      : 'Utilisateurs non-abonnés'
    : `${selectedUserIds.length} utilisateur(s) sélectionné(s)`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Envoyer un email
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Envoyez des emails aux utilisateurs vérifiés
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recipient Selection */}
        <Card className="lg:col-span-1 border-2 border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-[#D4AF37]" />
              Destinataires
            </CardTitle>
            <CardDescription>
              Choisissez le mode d'envoi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mode toggle */}
            <div className="flex gap-2">
              <Button
                variant={mode === 'category' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('category')}
                className={mode === 'category' ? 'bg-[#D4AF37] hover:bg-[#A89030] flex-1' : 'flex-1'}
              >
                <Users className="h-3 w-3 mr-1" />
                Diffusion
              </Button>
              <Button
                variant={mode === 'manual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('manual')}
                className={mode === 'manual' ? 'bg-[#D4AF37] hover:bg-[#A89030] flex-1' : 'flex-1'}
              >
                <Search className="h-3 w-3 mr-1" />
                Manuel
              </Button>
            </div>

            {mode === 'category' ? (
              <>
                {/* Category radio options */}
                {isLoadingCounts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-[#D4AF37]" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* All users */}
                    <div
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                        selectedCategory === 'all'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                          : 'border-slate-200 dark:border-slate-700 hover:border-[#D4AF37]/40'
                      )}
                      onClick={() => setSelectedCategory('all')}
                    >
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                        selectedCategory === 'all' ? 'border-[#D4AF37]' : 'border-slate-300'
                      )}>
                        {selectedCategory === 'all' && <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-[#D4AF37]" />
                          <span className="text-sm font-medium">Tous les utilisateurs</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Emails vérifiés avec notifications activées</p>
                      </div>
                      <Badge variant="secondary" className="text-xs font-bold">{recipientCounts.all}</Badge>
                    </div>

                    {/* Premium users */}
                    <div
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                        selectedCategory === 'premium'
                          ? 'border-amber-500 bg-amber-500/5'
                          : 'border-slate-200 dark:border-slate-700 hover:border-amber-500/40'
                      )}
                      onClick={() => setSelectedCategory('premium')}
                    >
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                        selectedCategory === 'premium' ? 'border-amber-500' : 'border-slate-300'
                      )}>
                        {selectedCategory === 'premium' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-amber-500" />
                          <span className="text-sm font-medium">Abonnés Premium</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Utilisateurs avec abonnement actif</p>
                      </div>
                      <Badge className="text-xs font-bold bg-amber-500">{recipientCounts.premium}</Badge>
                    </div>

                    {/* Free users */}
                    <div
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                        selectedCategory === 'free'
                          ? 'border-slate-500 bg-slate-500/5'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-500/40'
                      )}
                      onClick={() => setSelectedCategory('free')}
                    >
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                        selectedCategory === 'free' ? 'border-slate-500' : 'border-slate-300'
                      )}>
                        {selectedCategory === 'free' && <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-slate-500" />
                          <span className="text-sm font-medium">Non-abonnés</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Utilisateurs sans abonnement</p>
                      </div>
                      <Badge variant="outline" className="text-xs font-bold">{recipientCounts.free}</Badge>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Manual search mode */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom ou email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Selected users chips */}
                {selectedUsers.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {selectedUsers.length} sélectionné(s)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedUsers.map((u) => (
                        <Badge
                          key={u.id}
                          variant="secondary"
                          className="text-xs flex items-center gap-1 pr-1"
                        >
                          {u.firstName} {u.lastName}
                          <button
                            onClick={() => handleRemoveSelectedUser(u.id)}
                            className="ml-1 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-full p-0.5"
                          >
                            <XCircle className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search results */}
                <ScrollArea className="rounded-lg border">
                  <div className="max-h-[350px] p-2 space-y-1">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-[#D4AF37]" />
                      </div>
                    ) : searchQuery.trim() === '' ? (
                      <p className="text-center text-sm text-muted-foreground py-8">
                        Tapez pour rechercher un utilisateur
                      </p>
                    ) : searchResults.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-4">
                        Aucun utilisateur trouvé
                      </p>
                    ) : (
                      <>
                        {searchTotal > 20 && (
                          <p className="text-xs text-muted-foreground px-2 pb-1">
                            {searchTotal} résultats — affichage des 20 premiers
                          </p>
                        )}
                        {searchResults.map((u) => (
                          <motion.div
                            key={u.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={cn(
                              'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                              selectedUserIds.includes(u.id)
                                ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                            )}
                            onClick={() => handleSelectUser(u)}
                          >
                            {selectedUserIds.includes(u.id) ? (
                              <CheckSquare className="h-4 w-4 text-[#D4AF37] flex-shrink-0" />
                            ) : (
                              <Square className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {u.firstName} {u.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                            </div>
                            {u.isPremium && (
                              <Crown className="h-4 w-4 text-amber-500 flex-shrink-0" />
                            )}
                          </motion.div>
                        ))}
                      </>
                    )}
                  </div>
                </ScrollArea>
              </>
            )}

            {/* Selection summary */}
            <div className="text-center pt-2 border-t">
              <Badge variant="secondary" className="text-sm">
                {recipientCount} destinataire(s)
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Right: Email Composer */}
        <Card className="lg:col-span-2 border-2 border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-[#D4AF37]" />
              Composer l'email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Objet</Label>
              <Input
                id="subject"
                placeholder="Objet de l'email..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="text-base"
              />
            </div>

            {/* Editor Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border">
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleBold().run()}
                isActive={editor?.isActive('bold')}
                title="Gras"
              >
                <span className="font-bold text-sm">B</span>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                isActive={editor?.isActive('italic')}
                title="Italique"
              >
                <span className="italic text-sm">I</span>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                isActive={editor?.isActive('underline')}
                title="Souligné"
              >
                <span className="underline text-sm">U</span>
              </ToolbarButton>
              <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor?.isActive('heading', { level: 2 })}
                title="Titre"
              >
                <span className="font-bold text-sm">H2</span>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor?.isActive('heading', { level: 3 })}
                title="Sous-titre"
              >
                <span className="font-bold text-sm">H3</span>
              </ToolbarButton>
              <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                isActive={editor?.isActive('bulletList')}
                title="Liste à puces"
              >
                <span className="text-sm">• —</span>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                isActive={editor?.isActive('orderedList')}
                title="Liste numérotée"
              >
                <span className="text-sm">1.</span>
              </ToolbarButton>
              <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
              <ToolbarButton
                onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                isActive={editor?.isActive({ textAlign: 'left' })}
                title="Aligner à gauche"
              >
                <span className="text-sm">⫷</span>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                isActive={editor?.isActive({ textAlign: 'center' })}
                title="Centrer"
              >
                <span className="text-sm">⫶</span>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                isActive={editor?.isActive({ textAlign: 'right' })}
                title="Aligner à droite"
              >
                <span className="text-sm">⫸</span>
              </ToolbarButton>
              <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
              <ToolbarButton
                onClick={() => {
                  const url = window.prompt('URL du lien:');
                  if (url) {
                    editor?.chain().focus().setLink({ href: url }).run();
                  }
                }}
                isActive={editor?.isActive('link')}
                title="Ajouter un lien"
              >
                <span className="text-sm">🔗</span>
              </ToolbarButton>
              {editor?.isActive('link') && (
                <ToolbarButton
                  onClick={() => editor?.chain().focus().unsetLink().run()}
                  title="Supprimer le lien"
                >
                  <span className="text-sm">✕</span>
                </ToolbarButton>
              )}
            </div>

            {/* Editor */}
            <div className="border rounded-lg bg-white dark:bg-slate-900 min-h-[300px]">
              <EditorContent editor={editor} />
            </div>

            {/* Signature Image */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-[#D4AF37]" />
                Signature (image en bas de l'email)
              </Label>
              {signatureImageUrl ? (
                <div className="relative border rounded-lg p-3 bg-slate-50 dark:bg-slate-800">
                  <img
                    src={signatureImageUrl}
                    alt="Signature"
                    className="max-h-32 rounded"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => signatureInputRef.current?.click()}
                      disabled={isUploadingSignature}
                    >
                      <ImageIcon className="h-3 w-3 mr-1" />
                      Changer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveSignature}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => signatureInputRef.current?.click()}
                >
                  {isUploadingSignature ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Téléchargement...
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Cliquez pour ajouter une image de signature</p>
                      <p className="text-xs mt-1">PNG, JPG (recommandé : largeur max 600px)</p>
                    </div>
                  )}
                </div>
              )}
              <input
                ref={signatureInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUploadSignature}
              />
            </div>

            {/* Send button */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>L'email sera envoyé avec l'en-tête Footix</span>
              </div>
              <Button
                onClick={handlePreviewSend}
                disabled={isSending || recipientCount === 0}
                className="bg-gradient-to-r from-[#D4AF37] to-[#B8960F] hover:from-[#A89030] hover:to-[#D4AF37] text-white px-8"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer ({recipientCount})
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Send Result */}
      {sendResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={cn(
            'border-2',
            sendResult.failed === 0
              ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20'
              : 'border-amber-300 bg-amber-50 dark:bg-amber-900/20'
          )}>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                {sendResult.failed === 0 ? (
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-amber-500" />
                )}
                <div>
                  <p className="font-medium">{sendResult.message}</p>
                  <p className="text-sm text-muted-foreground">
                    {sendResult.success} envoyé(s), {sendResult.failed} échec(s)
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => setSendResult(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Email History Section */}
      <Card className="border-2 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-[#D4AF37]" />
              <CardTitle className="text-lg">Historique des emails</CardTitle>
            </div>
            <Badge variant="secondary">{emailHistory.length} envoi(s)</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" />
            </div>
          ) : emailHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun email envoyé pour le moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {emailHistory.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedHistoryId(expandedHistoryId === item.id ? null : item.id)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                      item.failedCount === 0
                        ? 'bg-emerald-100 dark:bg-emerald-900/30'
                        : 'bg-amber-100 dark:bg-amber-900/30'
                    )}>
                      {item.failedCount === 0 ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.subject}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.sentAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {item.recipientCount}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.failedCount === 0 ? 'default' : 'destructive'} className={item.failedCount === 0 ? 'bg-emerald-500' : ''}>
                        {item.successCount}/{item.recipientCount}
                      </Badge>
                      {expandedHistoryId === item.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedHistoryId === item.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t bg-slate-50 dark:bg-slate-800/50"
                      >
                        <div className="p-4 space-y-4">
                          {/* Sender info */}
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Envoyé par :</span>
                            <span className="font-medium">
                              {item.sentBy.firstName} {item.sentBy.lastName}
                            </span>
                            <span className="text-muted-foreground">({item.sentBy.email})</span>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center border">
                              <p className="text-2xl font-bold text-[#D4AF37]">{item.recipientCount}</p>
                              <p className="text-xs text-muted-foreground">Destinataires</p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center border">
                              <p className="text-2xl font-bold text-emerald-500">{item.successCount}</p>
                              <p className="text-xs text-muted-foreground">Succès</p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center border">
                              <p className="text-2xl font-bold text-rose-500">{item.failedCount}</p>
                              <p className="text-xs text-muted-foreground">Échecs</p>
                            </div>
                          </div>

                          {/* Recipients list */}
                          <div>
                            <p className="text-sm font-medium mb-2 flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Destinataires ({item.recipientEmails.length})
                            </p>
                            <div className="max-h-32 overflow-y-auto bg-white dark:bg-slate-800 rounded-lg p-2 border">
                              <div className="flex flex-wrap gap-1">
                                {item.recipientEmails.map((email, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {email}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Errors if any */}
                          {item.errors && item.errors.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2 flex items-center gap-2 text-rose-600">
                                <XCircle className="h-4 w-4" />
                                Erreurs ({item.errors.length})
                              </p>
                              <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-2 border border-rose-200 dark:border-rose-800">
                                {item.errors.map((error, idx) => (
                                  <p key={idx} className="text-xs text-rose-600 dark:text-rose-400">
                                    {error}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Email content preview */}
                          <div>
                            <p className="text-sm font-medium mb-2 flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Contenu de l'email
                            </p>
                            <div
                              className="bg-white dark:bg-slate-800 rounded-lg p-4 border prose prose-sm dark:prose-invert max-w-none max-h-64 overflow-y-auto"
                              dangerouslySetInnerHTML={{ __html: item.htmlContent }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'envoi</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point d'envoyer un email à {recipientCount} destinataire(s).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
              <p className="text-sm">
                <span className="font-medium">Objet :</span> {subject}
              </p>
              <p className="text-sm">
                <span className="font-medium">Destinataires :</span>{' '}
                {recipientLabel}
              </p>
            </div>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Cette action est irréversible</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSendEmail}
              className="bg-[#D4AF37] hover:bg-[#A89030] text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Confirmer l'envoi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
