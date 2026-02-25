import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_design.dart';
import '../../../data/models/quiz_model.dart';
import '../../../providers/service_providers.dart';
import '../../../shared/widgets/shimmer_loading.dart';
import '../../../shared/widgets/staggered_fade_in.dart';

enum _HistoryFilter { all, passed, failed }

class HistoryScreen extends ConsumerStatefulWidget {
  const HistoryScreen({super.key});

  @override
  ConsumerState<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends ConsumerState<HistoryScreen> {
  List<QuizAttemptModel> _attempts = [];
  bool _isLoading = true;
  String? _error;
  _HistoryFilter _filter = _HistoryFilter.all;

  // Computed stats
  int _totalAttempts = 0;
  int _passedAttempts = 0;
  int _failedAttempts = 0;
  int _totalStars = 0;
  int _averageScore = 0;
  int _bestScore = 0;

  @override
  void initState() {
    super.initState();
    _fetchHistory();
  }

  Future<void> _fetchHistory() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final service = ref.read(quizzesServiceProvider);
      final attempts = await service.getUserAttempts();
      if (!mounted) return;

      // Compute stats
      final passed = attempts.where((a) => a.quiz != null && a.score >= a.quiz!.passingScore).length;
      final failed = attempts.length - passed;
      final totalStars = attempts.fold<int>(0, (sum, a) => sum + a.starsEarned);
      final totalScore = attempts.fold<int>(0, (sum, a) => sum + a.score);
      final bestScore = attempts.isEmpty ? 0 : attempts.map((a) => a.score).reduce(max);

      setState(() {
        _attempts = attempts;
        _totalAttempts = attempts.length;
        _passedAttempts = passed;
        _failedAttempts = failed;
        _totalStars = totalStars;
        _averageScore = attempts.isNotEmpty ? (totalScore / attempts.length).round() : 0;
        _bestScore = bestScore;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  List<QuizAttemptModel> get _filteredAttempts {
    switch (_filter) {
      case _HistoryFilter.all:
        return _attempts;
      case _HistoryFilter.passed:
        return _attempts.where((a) => a.quiz != null && a.score >= a.quiz!.passingScore).toList();
      case _HistoryFilter.failed:
        return _attempts.where((a) => a.quiz == null || a.score < a.quiz!.passingScore).toList();
    }
  }

  String _relativeTime(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      final now = DateTime.now();
      final diff = now.difference(date);

      if (diff.inMinutes < 60) return 'Il y a ${diff.inMinutes} min';
      if (diff.inHours < 24) return 'Il y a ${diff.inHours}h';
      if (diff.inDays == 1) return 'Hier';
      if (diff.inDays < 7) return 'Il y a ${diff.inDays} jours';
      return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
    } catch (_) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        body: SafeArea(child: _buildShimmer()),
      );
    }

    if (_error != null) {
      return Scaffold(
        body: Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.error_outline_rounded, size: 56, color: AppColors.error),
          const SizedBox(height: 16),
          const Text('Impossible de charger l\'historique'),
          const SizedBox(height: 16),
          ElevatedButton(onPressed: _fetchHistory, child: const Text('Réessayer')),
        ])),
      );
    }

    final filtered = _filteredAttempts;

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _fetchHistory,
          color: AppColors.primary,
          child: CustomScrollView(slivers: [
            // Header with gradient
            SliverToBoxAdapter(child: Container(
              decoration: const BoxDecoration(
                gradient: AppDesign.heroGradient,
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
              ),
              padding: EdgeInsets.only(
                top: MediaQuery.of(context).padding.top + 8,
                left: 8, right: 16, bottom: 20,
              ),
              child: Stack(
                children: [
                  Positioned.fill(
                    child: ClipRRect(
                      borderRadius: const BorderRadius.vertical(bottom: Radius.circular(28)),
                      child: FloatingParticles(count: 5, color: AppColors.accent, maxSize: 5),
                    ),
                  ),
                  Row(children: [
                    IconButton(icon: const Icon(Icons.menu_rounded, color: Colors.white), onPressed: () => Scaffold.of(context).openDrawer()),
                    const SizedBox(width: 4),
                    Container(
                      width: 42, height: 42,
                      decoration: BoxDecoration(
                        gradient: AppDesign.primaryGradient,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: AppDesign.glowShadow(AppColors.primary, blur: 10),
                      ),
                      child: const Icon(Icons.history_rounded, color: Colors.white, size: 22),
                    ),
                    const SizedBox(width: 10),
                    const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text('Historique des Quiz', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
                      Text('Consultez toutes vos tentatives',
                          style: TextStyle(fontSize: 12, color: Colors.white70)),
                    ])),
                  ]),
                ],
              ),
            )),

            // Stats grid
            SliverToBoxAdapter(child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 20, 12, 0),
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _buildStatCard(Icons.bar_chart_rounded, AppColors.primary, '$_totalAttempts', 'Tentatives'),
                  _buildStatCard(Icons.check_circle_rounded, AppColors.success, '$_passedAttempts', 'Réussites'),
                  _buildStatCard(Icons.cancel_rounded, const Color(0xFFE53E3E), '$_failedAttempts', 'Échecs'),
                  _buildStatCard(Icons.star_rounded, const Color(0xFFF5A623), '$_totalStars', 'Étoiles'),
                  _buildStatCard(Icons.gps_fixed_rounded, AppColors.primary, '$_averageScore%', 'Moyenne'),
                  _buildStatCard(Icons.trending_up_rounded, AppColors.primary, '$_bestScore%', 'Meilleur'),
                ],
              ),
            )),

            // Filter + title
            SliverToBoxAdapter(child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 24, 16, 10),
              child: Row(children: [
                const Expanded(child: Text('Toutes les tentatives',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
                _buildFilterChip(),
              ]),
            )),

            // Attempts list
            if (filtered.isEmpty)
              SliverToBoxAdapter(child: Padding(
                padding: const EdgeInsets.all(40),
                child: Column(children: [
                  Icon(Icons.history_rounded, size: 56, color: AppColors.textMutedLight.withValues(alpha: 0.4)),
                  const SizedBox(height: 12),
                  Text(
                    _filter == _HistoryFilter.all
                        ? 'Aucune tentative'
                        : _filter == _HistoryFilter.passed
                            ? 'Aucune réussite'
                            : 'Aucun échec — Bravo !',
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _filter == _HistoryFilter.all
                        ? 'Vous n\'avez pas encore tenté de quiz.'
                        : 'Aucun résultat pour ce filtre.',
                    style: const TextStyle(fontSize: 13, color: AppColors.textMutedLight),
                  ),
                ]),
              ))
            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(12, 0, 12, 24),
                sliver: SliverList.separated(
                  itemCount: filtered.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (context, index) => StaggeredFadeIn(
                    index: index,
                    child: _buildAttemptCard(filtered[index]),
                  ),
                ),
              ),
          ]),
        ),
      ),
    );
  }

  Widget _buildStatCard(IconData icon, Color color, String value, String label) {
    final width = (MediaQuery.of(context).size.width - 24 - 16) / 3;
    return SizedBox(
      width: width,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.06),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withValues(alpha: 0.15)),
        ),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(
            width: 38, height: 38,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 20, color: color),
          ),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMutedLight, fontWeight: FontWeight.w500)),
        ]),
      ),
    );
  }

  Widget _buildFilterChip() {
    return PopupMenuButton<_HistoryFilter>(
      onSelected: (f) => setState(() => _filter = f),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      offset: const Offset(0, 40),
      itemBuilder: (_) => [
        _filterMenuItem(_HistoryFilter.all, 'Toutes', Icons.list_rounded),
        _filterMenuItem(_HistoryFilter.passed, 'Réussites', Icons.check_circle_rounded),
        _filterMenuItem(_HistoryFilter.failed, 'Échecs', Icons.cancel_rounded),
      ],
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          color: AppColors.neutral50,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.borderLight),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.filter_list_rounded, size: 16, color: AppColors.textMutedLight),
          const SizedBox(width: 6),
          Text(
            _filter == _HistoryFilter.all ? 'Toutes' : _filter == _HistoryFilter.passed ? 'Réussites' : 'Échecs',
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
          ),
          const SizedBox(width: 4),
          const Icon(Icons.keyboard_arrow_down_rounded, size: 16, color: AppColors.textMutedLight),
        ]),
      ),
    );
  }

  PopupMenuEntry<_HistoryFilter> _filterMenuItem(_HistoryFilter value, String label, IconData icon) {
    return PopupMenuItem(
      value: value,
      child: Row(children: [
        Icon(icon, size: 18, color: _filter == value ? AppColors.primary : AppColors.textMutedLight),
        const SizedBox(width: 8),
        Text(label, style: TextStyle(
          fontWeight: _filter == value ? FontWeight.w600 : FontWeight.normal,
          color: _filter == value ? AppColors.primary : null,
        )),
      ]),
    );
  }

  Widget _buildShimmer() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(children: [
        const SizedBox(height: 16),
        // Stats shimmer
        Row(children: [
          Expanded(child: ShimmerLoading(height: 80, borderRadius: 12)),
          const SizedBox(width: 8),
          Expanded(child: ShimmerLoading(height: 80, borderRadius: 12)),
          const SizedBox(width: 8),
          Expanded(child: ShimmerLoading(height: 80, borderRadius: 12)),
        ]),
        const SizedBox(height: 20),
        ...List.generate(5, (i) => Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: ShimmerLoading(height: 80, borderRadius: 14),
        )),
      ]),
    );
  }

  Widget _buildAttemptCard(QuizAttemptModel attempt) {
    final quiz = attempt.quiz;
    final passed = quiz != null && attempt.score >= quiz.passingScore;
    final passColor = passed ? AppColors.success : AppColors.error;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: passColor.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: passColor.withValues(alpha: 0.2), width: 1.5),
      ),
      child: Row(children: [
        // Status icon
        Container(
          width: 42, height: 42,
          decoration: BoxDecoration(
            color: passColor.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            passed ? Icons.emoji_events_rounded : Icons.cancel_rounded,
            color: passColor, size: 22,
          ),
        ),
        const SizedBox(width: 12),

        // Quiz info
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Flexible(child: Text(
              quiz?.title ?? 'Quiz',
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
              maxLines: 1, overflow: TextOverflow.ellipsis,
            )),
            if (quiz != null) ...[
              const SizedBox(width: 6),
              _buildDifficultyBadge(quiz.difficulty),
            ],
          ]),
          const SizedBox(height: 3),
          Row(children: [
            if (quiz?.theme != null) ...[
              Flexible(child: Text(
                quiz!.theme!.title,
                style: const TextStyle(fontSize: 11, color: AppColors.textMutedLight),
                maxLines: 1, overflow: TextOverflow.ellipsis,
              )),
              const SizedBox(width: 8),
            ],
            Icon(Icons.calendar_today_rounded, size: 11, color: AppColors.textMutedLight.withValues(alpha: 0.7)),
            const SizedBox(width: 3),
            Text(_relativeTime(attempt.completedAt),
                style: const TextStyle(fontSize: 11, color: AppColors.textMutedLight)),
          ]),
        ])),
        const SizedBox(width: 8),

        // Score + stars
        Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
          Text('${attempt.score}%', style: TextStyle(
            fontSize: 20, fontWeight: FontWeight.bold, color: passColor,
          )),
          const SizedBox(height: 2),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF3C7),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFFCD34D).withValues(alpha: 0.5)),
            ),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              const Icon(Icons.star_rounded, size: 13, color: Color(0xFFF5A623)),
              const SizedBox(width: 2),
              Text('+${attempt.starsEarned}',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFB45309))),
            ]),
          ),
        ]),
      ]),
    );
  }

  Widget _buildDifficultyBadge(String difficulty) {
    final Color color;
    switch (difficulty.toUpperCase()) {
      case 'FACILE':
        color = AppColors.success;
      case 'MOYEN':
        color = const Color(0xFFF5A623);
      case 'DIFFICILE':
        color = const Color(0xFFE53E3E);
      default:
        color = AppColors.textMutedLight;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        difficulty,
        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color),
      ),
    );
  }
}
