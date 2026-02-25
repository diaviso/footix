import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/models/quiz_model.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/service_providers.dart';

class RevisionQuizScreen extends ConsumerStatefulWidget {
  const RevisionQuizScreen({super.key});

  @override
  ConsumerState<RevisionQuizScreen> createState() => _RevisionQuizScreenState();
}

class _RevisionQuizScreenState extends ConsumerState<RevisionQuizScreen> with TickerProviderStateMixin {
  QuizModel? _quiz;
  bool _isLoading = true;
  String? _error;

  bool _isPlaying = false;
  int _currentIndex = 0;
  final Map<String, List<String>> _answers = {};
  int _timeLeft = 0;
  Timer? _timer;
  bool _isSubmitting = false;
  Map<String, dynamic>? _result;
  bool _showCorrection = false;

  // Countdown
  bool _isCountdown = false;
  int _countdownValue = 5;
  Timer? _countdownTimer;
  late AnimationController _countdownAnimController;

  // Result animations
  late AnimationController _resultIconController;
  late AnimationController _resultFadeController;
  late AnimationController _resultScoreController;
  late AnimationController _resultShakeController;

  void _startResultAnimations() {
    _resultIconController.forward();
    Future.delayed(const Duration(milliseconds: 300), () {
      if (mounted) _resultFadeController.forward();
    });
    Future.delayed(const Duration(milliseconds: 600), () {
      if (mounted) _resultScoreController.forward();
    });
    if (_result != null && !(_result!['passed'] as bool? ?? false)) {
      Future.delayed(const Duration(milliseconds: 200), () {
        if (mounted) _resultShakeController.forward();
      });
    }
  }

  @override
  void initState() {
    super.initState();
    _resultIconController = AnimationController(vsync: this, duration: const Duration(milliseconds: 800));
    _resultFadeController = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
    _resultScoreController = AnimationController(vsync: this, duration: const Duration(milliseconds: 1000));
    _resultShakeController = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
    _countdownAnimController = AnimationController(vsync: this, duration: const Duration(milliseconds: 900));
    _checkPremiumAndLoad();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _countdownTimer?.cancel();
    _resultIconController.dispose();
    _resultFadeController.dispose();
    _resultScoreController.dispose();
    _resultShakeController.dispose();
    _countdownAnimController.dispose();
    super.dispose();
  }

  void _checkPremiumAndLoad() {
    final user = ref.read(currentUserProvider);
    if (user == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Veuillez vous connecter pour accéder à la révision'), backgroundColor: AppColors.accent),
          );
          context.go('/login');
        }
      });
      return;
    }
    _loadRevisionQuiz();
  }

  Future<void> _loadRevisionQuiz() async {
    setState(() { _isLoading = true; _error = null; _result = null; _isPlaying = false; _showCorrection = false; _answers.clear(); });
    try {
      final service = ref.read(quizzesServiceProvider);
      final quiz = await service.getRevisionQuiz();
      if (!mounted) return;
      setState(() { _quiz = quiz; _timeLeft = quiz.timeLimit * 60; _isLoading = false; });
    } catch (e) {
      if (!mounted) return;
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  void _beginCountdown() {
    setState(() {
      _isCountdown = true;
      _countdownValue = 5;
    });
    _countdownAnimController.reset();
    _countdownAnimController.forward();
    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_countdownValue <= 1) {
        t.cancel();
        _startQuiz();
      } else {
        setState(() => _countdownValue--);
        _countdownAnimController.reset();
        _countdownAnimController.forward();
      }
    });
  }

  void _startQuiz() {
    setState(() {
      _isCountdown = false;
      _isPlaying = true;
      _currentIndex = 0;
      _answers.clear();
      _result = null;
      _showCorrection = false;
      _timeLeft = _quiz!.timeLimit * 60;
    });
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_timeLeft <= 1) { t.cancel(); _submitQuiz(); }
      else { setState(() => _timeLeft--); }
    });
  }

  void _handleRetry() {
    setState(() { _result = null; _showCorrection = false; _answers.clear(); });
    _loadRevisionQuiz();
  }

  void _selectOption(String questionId, String optionId, String type) {
    setState(() {
      if (type == 'QCU') {
        _answers[questionId] = [optionId];
      } else {
        final current = _answers[questionId] ?? [];
        if (current.contains(optionId)) {
          _answers[questionId] = current.where((id) => id != optionId).toList();
        } else {
          _answers[questionId] = [...current, optionId];
        }
      }
    });
  }

  Future<void> _submitQuiz() async {
    if (_isSubmitting) return;
    _timer?.cancel();
    setState(() => _isSubmitting = true);
    try {
      final service = ref.read(quizzesServiceProvider);
      final result = await service.submitRevisionQuiz(_answers);
      if (!mounted) return;
      setState(() { _result = result; _isPlaying = false; _isSubmitting = false; });
      _resultIconController.reset();
      _resultFadeController.reset();
      _resultScoreController.reset();
      _resultShakeController.reset();
      _startResultAnimations();
    } catch (e) {
      if (!mounted) return;
      setState(() => _isSubmitting = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e'), backgroundColor: AppColors.error));
    }
  }

  String _formatTime(int s) => '${s ~/ 60}:${(s % 60).toString().padLeft(2, '0')}';

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator(color: AppColors.primary)));

    if (_error != null || _quiz == null) {
      return Scaffold(
        appBar: AppBar(leading: const BackButton()),
        body: Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.error_outline_rounded, size: 56, color: AppColors.error),
          const SizedBox(height: 16),
          const Text('Impossible de charger le quiz de révision'),
          const SizedBox(height: 16),
          ElevatedButton(onPressed: _loadRevisionQuiz, child: const Text('Réessayer')),
        ])),
      );
    }

    if (_showCorrection && _result != null) return _buildCorrectionView();
    if (_result != null) return _buildResultView();
    if (_isPlaying) return _buildPlayingView();
    if (_isCountdown) return _buildCountdownView();
    return _buildPreStartView();
  }

  // ═══════════════════════════════════════════════════════════════
  // COUNTDOWN VIEW
  // ═══════════════════════════════════════════════════════════════
  Widget _buildCountdownView() {
    final quiz = _quiz!;
    final questions = quiz.questions ?? [];

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Gradient top bar
                Container(
                  height: 4,
                  margin: const EdgeInsets.symmetric(horizontal: 40),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFFF59E0B), Color(0xFFEA580C), Color(0xFFEF4444)]),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 40),

                // Animated countdown circle
                AnimatedBuilder(
                  animation: _countdownAnimController,
                  builder: (context, child) {
                    return Transform.scale(
                      scale: 1.0 + (1.0 - _countdownAnimController.value) * 0.3,
                      child: Opacity(
                        opacity: 0.5 + _countdownAnimController.value * 0.5,
                        child: child,
                      ),
                    );
                  },
                  child: Container(
                    width: 140,
                    height: 140,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        colors: [
                          const Color(0xFFF59E0B).withValues(alpha: 0.15),
                          const Color(0xFFEA580C).withValues(alpha: 0.08),
                        ],
                      ),
                      border: Border.all(
                        color: const Color(0xFFF59E0B).withValues(alpha: 0.4),
                        width: 4,
                      ),
                    ),
                    child: Center(
                      child: Text(
                        '$_countdownValue',
                        style: const TextStyle(
                          fontSize: 56,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFFF59E0B),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                const Text(
                  'Préparez-vous !',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 24),

                // Info card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Theme.of(context).brightness == Brightness.dark
                        ? Colors.white.withValues(alpha: 0.05)
                        : Colors.grey.shade50,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Column(
                    children: [
                      const Text('Comment ça marche :', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                      const SizedBox(height: 14),
                      _buildCountdownInfoRow('1', '${questions.length} questions à répondre en ${quiz.timeLimit} minutes'),
                      const SizedBox(height: 8),
                      _buildCountdownInfoRow('2', 'Score minimum requis : 80% pour réussir'),
                      const SizedBox(height: 8),
                      _buildCountdownInfoRow('3', 'Gagnez des étoiles selon votre performance'),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Buttons
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    OutlinedButton(
                      onPressed: () {
                        _countdownTimer?.cancel();
                        setState(() => _isCountdown = false);
                      },
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Annuler'),
                    ),
                    const SizedBox(width: 12),
                    ElevatedButton(
                      onPressed: () {
                        _countdownTimer?.cancel();
                        _startQuiz();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFD4AF37),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Commencer maintenant', style: TextStyle(fontWeight: FontWeight.w600)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCountdownInfoRow(String number, String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 26, height: 26,
          decoration: BoxDecoration(
            color: const Color(0xFFD4AF37).withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Center(child: Text(number, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFD4AF37), fontSize: 13))),
        ),
        const SizedBox(width: 10),
        Expanded(child: Padding(
          padding: const EdgeInsets.only(top: 3),
          child: Text(text, style: const TextStyle(fontSize: 14)),
        )),
      ],
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // PRE-START VIEW
  // ═══════════════════════════════════════════════════════════════
  Widget _buildPreStartView() {
    final quiz = _quiz!;
    final questions = quiz.questions ?? [];

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  IconButton(icon: const Icon(Icons.arrow_back_rounded), onPressed: () => context.pop()),
                  const SizedBox(width: 8),
                  Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('Réviser la DEC', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    Text("Quiz d'entraînement aléatoire", style: TextStyle(fontSize: 13, color: AppColors.textMutedLight)),
                  ]),
                ],
              ),
              const SizedBox(height: 24),

              // Main card
              Container(
                width: double.infinity,
                clipBehavior: Clip.antiAlias,
                decoration: BoxDecoration(
                  color: Theme.of(context).brightness == Brightness.dark ? AppColors.cardDark : AppColors.cardLight,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
                  boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 16, offset: const Offset(0, 4))],
                ),
                child: Column(children: [
                  // Gradient top bar
                  Container(height: 4, decoration: const BoxDecoration(
                    gradient: LinearGradient(colors: [Color(0xFFF59E0B), Color(0xFFEA580C), Color(0xFFEF4444)]),
                  )),
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(children: [
                      // Icon
                      Container(
                        width: 80, height: 80,
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(colors: [Color(0xFFF59E0B), Color(0xFFEA580C)]),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.auto_awesome_rounded, size: 40, color: Colors.white),
                      ),
                      const SizedBox(height: 20),
                      const Text('Quiz de Révision', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 6),
                      Text('${questions.length} questions aléatoires piochées dans tous les thèmes',
                          style: const TextStyle(fontSize: 14, color: AppColors.textSecondaryLight), textAlign: TextAlign.center),
                      const SizedBox(height: 24),

                      // Stats grid
                      Row(children: [
                        Expanded(child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          decoration: BoxDecoration(color: AppColors.neutral50, borderRadius: BorderRadius.circular(14)),
                          child: Column(children: [
                            Text('${questions.length}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.primary)),
                            const Text('Questions', style: TextStyle(fontSize: 13, color: AppColors.textMutedLight)),
                          ]),
                        )),
                        const SizedBox(width: 12),
                        Expanded(child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          decoration: BoxDecoration(color: AppColors.neutral50, borderRadius: BorderRadius.circular(14)),
                          child: Column(children: [
                            Text('${quiz.timeLimit} min', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.primary)),
                            const Text('Temps limite', style: TextStyle(fontSize: 13, color: AppColors.textMutedLight)),
                          ]),
                        )),
                      ]),
                      const SizedBox(height: 20),

                      // Training mode info
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF3C7),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: const Color(0xFFFDE68A)),
                        ),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          const Row(children: [
                            Icon(Icons.workspace_premium_rounded, size: 18, color: Color(0xFFD97706)),
                            SizedBox(width: 8),
                            Text('Mode entraînement', style: TextStyle(fontWeight: FontWeight.w600, color: Color(0xFFD97706))),
                          ]),
                          const SizedBox(height: 8),
                          ...[
                            'Questions variées de tous les thèmes',
                            "Pas d'étoiles gagnées",
                            "Pas d'historique enregistré",
                            'Correction disponible à la fin',
                          ].map((t) => Padding(
                            padding: const EdgeInsets.only(left: 26, bottom: 3),
                            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              const Text('• ', style: TextStyle(color: Color(0xFFD97706), fontSize: 13)),
                              Expanded(child: Text(t, style: const TextStyle(color: Color(0xFFD97706), fontSize: 13))),
                            ]),
                          )),
                        ]),
                      ),
                      const SizedBox(height: 24),

                      // Start button
                      SizedBox(
                        width: double.infinity, height: 52,
                        child: Container(
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(colors: [Color(0xFFF59E0B), Color(0xFFEA580C)]),
                            borderRadius: BorderRadius.circular(14),
                            boxShadow: [BoxShadow(color: const Color(0xFFF59E0B).withValues(alpha: 0.35), blurRadius: 12, offset: const Offset(0, 4))],
                          ),
                          child: Material(
                            color: Colors.transparent,
                            child: InkWell(
                              onTap: _beginCountdown,
                              borderRadius: BorderRadius.circular(14),
                              child: const Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                                Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 20),
                                SizedBox(width: 8),
                                Text('Commencer la révision', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                              ]),
                            ),
                          ),
                        ),
                      ),
                    ]),
                  ),
                ]),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // PLAYING VIEW
  // ═══════════════════════════════════════════════════════════════
  Widget _buildPlayingView() {
    final quiz = _quiz!;
    final questions = quiz.questions ?? [];
    if (questions.isEmpty) return Scaffold(appBar: AppBar(), body: const Center(child: Text('Aucune question')));

    final question = questions[_currentIndex];
    final selectedIds = _answers[question.id] ?? [];
    final answeredCount = _answers.length;
    final progress = ((_currentIndex + 1) / questions.length);
    final isLast = _currentIndex == questions.length - 1;
    final isTimeLow = _timeLeft <= 60;

    return Scaffold(
      body: SafeArea(
        child: Column(children: [
          // Top bar
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 8, 16, 0),
            child: Row(children: [
              IconButton(icon: const Icon(Icons.close_rounded), onPressed: () {
                showDialog(context: context, builder: (ctx) => AlertDialog(
                  title: const Text('Quitter ?'),
                  content: const Text('Soumettre vos réponses ou quitter ?'),
                  actions: [
                    TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Annuler')),
                    TextButton(onPressed: () { Navigator.pop(ctx); _timer?.cancel(); context.pop(); },
                        child: const Text('Quitter', style: TextStyle(color: AppColors.error))),
                    ElevatedButton(onPressed: () { Navigator.pop(ctx); _submitQuiz(); },
                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                        child: const Text('Soumettre')),
                  ],
                ));
              }),
              const SizedBox(width: 4),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Color(0xFFF59E0B), Color(0xFFEA580C)]),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Row(mainAxisSize: MainAxisSize.min, children: [
                      Icon(Icons.workspace_premium_rounded, size: 12, color: Colors.white),
                      SizedBox(width: 3),
                      Text('Révision', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
                    ]),
                  ),
                  const SizedBox(width: 8),
                  Text('Question ${_currentIndex + 1}/${questions.length}',
                      style: const TextStyle(fontSize: 13, color: AppColors.textMutedLight)),
                ]),
                const SizedBox(height: 2),
                Text('$answeredCount/${questions.length} répondues',
                    style: const TextStyle(fontSize: 12, color: AppColors.textMutedLight)),
              ])),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: isTimeLow ? AppColors.error.withValues(alpha: 0.1) : AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(Icons.timer_rounded, size: 16, color: isTimeLow ? AppColors.error : AppColors.primary),
                  const SizedBox(width: 4),
                  Text(_formatTime(_timeLeft), style: TextStyle(fontWeight: FontWeight.bold, fontFamily: 'monospace',
                      color: isTimeLow ? AppColors.error : AppColors.primary)),
                ]),
              ),
            ]),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: ClipRRect(borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(value: progress, minHeight: 4,
                  backgroundColor: AppColors.borderLight, valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary))),
          ),
          // Question content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                // Source badges (theme + quiz)
                Wrap(spacing: 6, runSpacing: 4, children: [
                  if (question.themeTitle != null && question.themeTitle!.isNotEmpty)
                    _SourceBadge(label: question.themeTitle!, color: AppColors.primary),
                  if (question.quizTitle != null && question.quizTitle!.isNotEmpty)
                    _SourceBadge(label: question.quizTitle!, color: AppColors.textMutedLight),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
                    child: Text(question.isQCU ? 'Choix unique' : 'Choix multiple',
                        style: const TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.w600)),
                  ),
                ]),
                const SizedBox(height: 14),
                Text(question.content, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600, height: 1.4)),
                if (question.isQCM)
                  Padding(padding: const EdgeInsets.only(top: 6),
                    child: Text('Sélectionnez toutes les réponses correctes', style: TextStyle(fontSize: 13, color: AppColors.textMutedLight))),
                const SizedBox(height: 20),
                ...List.generate(question.options?.length ?? 0, (idx) {
                  final option = question.options![idx];
                  final isSelected = selectedIds.contains(option.id);
                  final letters = ['A', 'B', 'C', 'D', 'E', 'F'];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: GestureDetector(
                      onTap: () => _selectOption(question.id, option.id, question.type),
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.primary.withValues(alpha: 0.08) : null,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: isSelected ? AppColors.primary : AppColors.borderLight, width: isSelected ? 2 : 1),
                        ),
                        child: Row(children: [
                          Container(width: 36, height: 36,
                            decoration: BoxDecoration(color: isSelected ? AppColors.primary : AppColors.neutral100, borderRadius: BorderRadius.circular(10)),
                            alignment: Alignment.center,
                            child: Text(idx < letters.length ? letters[idx] : '${idx + 1}',
                                style: TextStyle(fontWeight: FontWeight.bold, color: isSelected ? Colors.white : AppColors.textSecondaryLight))),
                          const SizedBox(width: 12),
                          Expanded(child: Text(option.content, style: const TextStyle(fontSize: 15))),
                          if (isSelected) const Icon(Icons.check_circle_rounded, color: AppColors.primary, size: 22),
                        ]),
                      ),
                    ),
                  );
                }),
              ]),
            ),
          ),
          // Navigation
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
            decoration: BoxDecoration(border: Border(top: BorderSide(color: AppColors.borderLight.withValues(alpha: 0.5)))),
            child: Row(children: [
              if (_currentIndex > 0)
                Expanded(child: OutlinedButton.icon(
                  onPressed: () => setState(() => _currentIndex--),
                  icon: const Icon(Icons.chevron_left_rounded), label: const Text('Précédent'),
                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                ))
              else const Spacer(),
              const SizedBox(width: 12),
              Expanded(child: ElevatedButton.icon(
                onPressed: isLast ? (_isSubmitting ? null : _submitQuiz) : () => setState(() => _currentIndex++),
                icon: isLast
                    ? (_isSubmitting ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.check_rounded))
                    : const Icon(Icons.chevron_right_rounded),
                label: Text(isLast ? 'Terminer' : 'Suivant'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: isLast ? AppColors.success : AppColors.primary, foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              )),
            ]),
          ),
          // Dots
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(questions.length, (i) {
                final isAnswered = _answers.containsKey(questions[i].id);
                final isCurrent = i == _currentIndex;
                return GestureDetector(
                  onTap: () => setState(() => _currentIndex = i),
                  child: Container(width: isCurrent ? 20 : 8, height: 8, margin: const EdgeInsets.symmetric(horizontal: 2),
                    decoration: BoxDecoration(
                      color: isCurrent ? AppColors.primary : (isAnswered ? AppColors.success : AppColors.borderLight),
                      borderRadius: BorderRadius.circular(4))),
                );
              })),
          ),
        ]),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RESULT VIEW — richly animated
  // ═══════════════════════════════════════════════════════════════
  Widget _buildResultView() {
    final r = _result!;
    final score = r['score'] as int? ?? 0;
    final passed = r['passed'] as bool? ?? false;
    final correctCount = r['correctCount'] as int? ?? 0;
    final totalQuestions = r['totalQuestions'] as int? ?? 0;

    final iconScale = CurvedAnimation(parent: _resultIconController, curve: Curves.elasticOut);
    final fadeIn = CurvedAnimation(parent: _resultFadeController, curve: Curves.easeOut);
    final scoreAnim = CurvedAnimation(parent: _resultScoreController, curve: Curves.easeOutCubic);
    final shake = CurvedAnimation(parent: _resultShakeController, curve: Curves.elasticIn);

    return Scaffold(
      body: Stack(
        children: [
          // Animated background for failure
          if (!passed)
            AnimatedBuilder(
              animation: _resultIconController,
              builder: (context, child) {
                return Container(
                  decoration: BoxDecoration(
                    gradient: RadialGradient(
                      center: Alignment.topCenter,
                      radius: 1.5 + (_resultIconController.value * 0.5),
                      colors: [
                        AppColors.error.withValues(alpha: 0.06 * _resultIconController.value),
                        Colors.transparent,
                      ],
                    ),
                  ),
                );
              },
            ),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(children: [
                const SizedBox(height: 40),

                // Animated result visual
                if (passed) ...[
                  ScaleTransition(
                    scale: iconScale,
                    child: Container(
                      width: 120, height: 120,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [Color(0xFF34D399), Color(0xFF059669)]),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(color: AppColors.success.withValues(alpha: 0.3), blurRadius: 20, spreadRadius: 4),
                        ],
                      ),
                      child: const Icon(Icons.emoji_events_rounded, size: 56, color: Colors.white),
                    ),
                  ),
                ] else ...[
                  // Failure: large animated crying emoji with wobble
                  ScaleTransition(
                    scale: iconScale,
                    child: AnimatedBuilder(
                      animation: shake,
                      builder: (context, child) {
                        final wobble = math.sin(shake.value * math.pi * 6) * 10 * (1 - shake.value);
                        final tilt = math.sin(shake.value * math.pi * 4) * 0.1 * (1 - shake.value);
                        return Transform.translate(
                          offset: Offset(wobble, 0),
                          child: Transform.rotate(angle: tilt, child: child),
                        );
                      },
                      child: Column(
                        children: [
                          const Text('😭', style: TextStyle(fontSize: 80)),
                          const SizedBox(height: 4),
                          FadeTransition(
                            opacity: CurvedAnimation(parent: _resultFadeController, curve: const Interval(0.3, 1.0)),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text('💧', style: TextStyle(fontSize: 20)),
                                SizedBox(width: 24),
                                Text('💧', style: TextStyle(fontSize: 16)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
                const SizedBox(height: 20),

                // Animated title
                FadeTransition(
                  opacity: fadeIn,
                  child: SlideTransition(
                    position: Tween<Offset>(begin: const Offset(0, 0.3), end: Offset.zero).animate(fadeIn),
                    child: Text(passed ? 'Bravo !' : 'Oups, raté ! 😔',
                        style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: passed ? AppColors.success : AppColors.error)),
                  ),
                ),
                const SizedBox(height: 8),

                FadeTransition(
                  opacity: fadeIn,
                  child: SlideTransition(
                    position: Tween<Offset>(begin: const Offset(0, 0.5), end: Offset.zero).animate(fadeIn),
                    child: Text(passed ? 'Tu maîtrises bien ces notions' : 'Ne baisse pas les bras, tu peux y arriver ! 💪',
                        style: const TextStyle(fontSize: 15, color: AppColors.textSecondaryLight), textAlign: TextAlign.center),
                  ),
                ),
                const SizedBox(height: 32),

                // Animated score card
                FadeTransition(
                  opacity: scoreAnim,
                  child: SlideTransition(
                    position: Tween<Offset>(begin: const Offset(0, 0.3), end: Offset.zero).animate(scoreAnim),
                    child: Container(
                      width: double.infinity, padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Theme.of(context).brightness == Brightness.dark ? AppColors.cardDark : AppColors.cardLight,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.borderLight),
                        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 12, offset: const Offset(0, 4))],
                      ),
                      child: Column(children: [
                        AnimatedBuilder(
                          animation: scoreAnim,
                          builder: (context, child) {
                            final displayScore = (score * scoreAnim.value).round();
                            return ShaderMask(
                              shaderCallback: (bounds) => LinearGradient(
                                colors: passed ? [const Color(0xFF10B981), const Color(0xFF059669)] : [const Color(0xFFF59E0B), const Color(0xFFEF4444)],
                              ).createShader(bounds),
                              child: Text('$displayScore%', style: const TextStyle(fontSize: 52, fontWeight: FontWeight.bold, color: Colors.white)),
                            );
                          },
                        ),
                        const SizedBox(height: 4),
                        Text('$correctCount / $totalQuestions réponses correctes',
                            style: const TextStyle(fontSize: 14, color: AppColors.textSecondaryLight)),
                        const SizedBox(height: 12),
                        // Animated progress bar
                        AnimatedBuilder(
                          animation: scoreAnim,
                          builder: (context, child) {
                            return ClipRRect(
                              borderRadius: BorderRadius.circular(4),
                              child: LinearProgressIndicator(
                                value: (score / 100) * scoreAnim.value,
                                minHeight: 8,
                                backgroundColor: AppColors.neutral200,
                                valueColor: AlwaysStoppedAnimation<Color>(passed ? AppColors.success : AppColors.error),
                              ),
                            );
                          },
                        ),
                      ]),
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // Training mode info
                FadeTransition(
                  opacity: scoreAnim,
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF3C7),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFFDE68A)),
                    ),
                    child: const Row(children: [
                      Icon(Icons.auto_awesome_rounded, size: 18, color: Color(0xFFD97706)),
                      SizedBox(width: 8),
                      Expanded(child: Text(
                        "Quiz d'entraînement - Pas d'étoiles gagnées, pas d'historique enregistré",
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Color(0xFFD97706)),
                      )),
                    ]),
                  ),
                ),
                const SizedBox(height: 28),

                // Animated action buttons
                FadeTransition(
                  opacity: scoreAnim,
                  child: SlideTransition(
                    position: Tween<Offset>(begin: const Offset(0, 0.5), end: Offset.zero).animate(scoreAnim),
                    child: Column(children: [
                      Row(children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: _handleRetry,
                            icon: const Icon(Icons.replay_rounded, size: 18),
                            label: const Text('Nouveau quiz'),
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () => setState(() => _showCorrection = true),
                            icon: const Icon(Icons.menu_book_rounded, size: 18),
                            label: const Text('Voir la correction'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary, foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                          ),
                        ),
                      ]),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: TextButton.icon(
                          onPressed: () => context.go('/'),
                          icon: const Icon(Icons.home_rounded, size: 18),
                          label: const Text("Retour à l'accueil"),
                          style: TextButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                        ),
                      ),
                    ]),
                  ),
                ),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // CORRECTION VIEW
  // ═══════════════════════════════════════════════════════════════
  Widget _buildCorrectionView() {
    final r = _result!;
    final score = r['score'] as int? ?? 0;
    final correctCount = r['correctCount'] as int? ?? 0;
    final totalQuestions = r['totalQuestions'] as int? ?? 0;
    final results = (r['results'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    final letters = ['A', 'B', 'C', 'D', 'E', 'F'];

    return Scaffold(
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // Header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(8, 8, 16, 0),
                child: Row(children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back_rounded),
                    onPressed: () => setState(() => _showCorrection = false),
                  ),
                  const SizedBox(width: 4),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('Correction', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                    Text('Score : $score% ($correctCount/$totalQuestions)',
                        style: const TextStyle(fontSize: 13, color: AppColors.textMutedLight)),
                  ])),
                ]),
              ),
            ),

            // Questions list
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
              sliver: SliverList.separated(
                itemCount: results.length,
                separatorBuilder: (_, __) => const SizedBox(height: 14),
                itemBuilder: (context, index) {
                  final qr = results[index];
                  final isCorrect = qr['isCorrect'] as bool? ?? false;
                  final content = qr['content'] as String? ?? '';
                  final quizTitle = qr['quizTitle'] as String? ?? '';
                  final themeTitle = qr['themeTitle'] as String? ?? '';
                  final options = (qr['options'] as List?)?.cast<Map<String, dynamic>>() ?? [];

                  return Container(
                    clipBehavior: Clip.antiAlias,
                    decoration: BoxDecoration(
                      color: Theme.of(context).brightness == Brightness.dark ? AppColors.cardDark : AppColors.cardLight,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isCorrect ? const Color(0xFF34D399) : const Color(0xFFFCA5A5),
                        width: 2,
                      ),
                      boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 2))],
                    ),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      // Top accent
                      Container(height: 3, decoration: BoxDecoration(
                        gradient: isCorrect
                            ? const LinearGradient(colors: [Color(0xFF34D399), Color(0xFF059669)])
                            : const LinearGradient(colors: [Color(0xFFFCA5A5), Color(0xFFEF4444)]),
                      )),

                      // Question header
                      Padding(
                        padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
                        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Container(
                            width: 40, height: 40,
                            decoration: BoxDecoration(
                              color: isCorrect ? AppColors.success : AppColors.error,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            alignment: Alignment.center,
                            child: Icon(
                              isCorrect ? Icons.check_circle_rounded : Icons.cancel_rounded,
                              color: Colors.white, size: 22,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            // Source badges
                            Wrap(spacing: 6, runSpacing: 4, children: [
                              if (themeTitle.isNotEmpty)
                                _SourceBadge(label: themeTitle, color: AppColors.primary),
                              if (quizTitle.isNotEmpty)
                                _SourceBadge(label: quizTitle, color: AppColors.textMutedLight),
                            ]),
                            const SizedBox(height: 6),
                            Text('${index + 1}. $content',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                          ])),
                        ]),
                      ),

                      // Options
                      Padding(
                        padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
                        child: Column(
                          children: List.generate(options.length, (idx) {
                            final opt = options[idx];
                            final optCorrect = opt['isCorrect'] as bool? ?? false;
                            final wasSelected = opt['wasSelected'] as bool? ?? false;
                            final optContent = opt['content'] as String? ?? '';
                            final explanation = opt['explanation'] as String?;

                            Color bgColor;
                            Color borderColor;
                            Color letterBgColor;
                            Color letterTextColor;
                            if (optCorrect) {
                              bgColor = const Color(0xFFD1FAE5).withValues(alpha: 0.6);
                              borderColor = const Color(0xFF34D399);
                              letterBgColor = AppColors.success;
                              letterTextColor = Colors.white;
                            } else if (wasSelected) {
                              bgColor = const Color(0xFFFEE2E2).withValues(alpha: 0.6);
                              borderColor = const Color(0xFFFCA5A5);
                              letterBgColor = AppColors.error;
                              letterTextColor = Colors.white;
                            } else {
                              bgColor = AppColors.neutral50;
                              borderColor = AppColors.borderLight;
                              letterBgColor = AppColors.neutral100;
                              letterTextColor = AppColors.textSecondaryLight;
                            }

                            return Container(
                              margin: EdgeInsets.only(top: idx > 0 ? 8 : 0),
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: bgColor,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: borderColor, width: 1.5),
                              ),
                              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                Row(children: [
                                  Container(
                                    width: 28, height: 28,
                                    decoration: BoxDecoration(color: letterBgColor, borderRadius: BorderRadius.circular(8)),
                                    alignment: Alignment.center,
                                    child: Text(idx < letters.length ? letters[idx] : '${idx + 1}',
                                        style: TextStyle(color: letterTextColor, fontWeight: FontWeight.bold, fontSize: 12)),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(child: Text(optContent, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14))),
                                  if (optCorrect)
                                    const Icon(Icons.check_circle_rounded, size: 20, color: AppColors.success),
                                  if (wasSelected && !optCorrect)
                                    Icon(Icons.cancel_rounded, size: 20, color: AppColors.error.withValues(alpha: 0.7)),
                                ]),
                                // Explanation
                                if (explanation != null && explanation.isNotEmpty) ...[
                                  const SizedBox(height: 8),
                                  Container(
                                    padding: const EdgeInsets.only(top: 8),
                                    decoration: BoxDecoration(
                                      border: Border(top: BorderSide(
                                        color: optCorrect
                                            ? const Color(0xFF34D399).withValues(alpha: 0.4)
                                            : const Color(0xFFFCA5A5).withValues(alpha: 0.4),
                                      )),
                                    ),
                                    child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                      Icon(Icons.lightbulb_outline_rounded, size: 16,
                                          color: optCorrect ? const Color(0xFF059669) : const Color(0xFFDC2626)),
                                      const SizedBox(width: 6),
                                      Expanded(child: Text(explanation,
                                          style: TextStyle(fontSize: 13, height: 1.4,
                                              color: optCorrect ? const Color(0xFF065F46) : const Color(0xFF991B1B)))),
                                    ]),
                                  ),
                                ],
                              ]),
                            );
                          }),
                        ),
                      ),
                    ]),
                  );
                },
              ),
            ),

            // Bottom buttons
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
                child: Row(children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _handleRetry,
                      icon: const Icon(Icons.replay_rounded, size: 18),
                      label: const Text('Nouveau quiz'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => context.go('/quizzes'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary, foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: const Text('Retour aux quiz'),
                    ),
                  ),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPER WIDGETS
// ═══════════════════════════════════════════════════════════════
class _SourceBadge extends StatelessWidget {
  final String label;
  final Color color;
  const _SourceBadge({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Text(label, style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w500)),
    );
  }
}
