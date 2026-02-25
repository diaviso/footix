import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_design.dart';
import '../../../data/models/theme_model.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/service_providers.dart';
import '../../../shared/widgets/shimmer_loading.dart';
import '../../../shared/widgets/staggered_fade_in.dart';

/// Provider that fetches all themes
final _themesProvider = FutureProvider.autoDispose<List<ThemeModel>>((ref) async {
  final isAuthenticated = ref.watch(isAuthenticatedProvider);
  if (!isAuthenticated) return [];
  final service = ref.watch(themesServiceProvider);
  return service.getThemes();
});

class ThemesScreen extends ConsumerStatefulWidget {
  const ThemesScreen({super.key});

  @override
  ConsumerState<ThemesScreen> createState() => _ThemesScreenState();
}

class _ThemesScreenState extends ConsumerState<ThemesScreen> {
  String _searchQuery = '';
  final Set<String> _expandedThemes = {};

  @override
  Widget build(BuildContext context) {
    final themesAsync = ref.watch(_themesProvider);

    return Scaffold(
      body: themesAsync.when(
        loading: () => SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(children: [
              ShimmerLoading(height: 170, borderRadius: 28),
              const SizedBox(height: 16),
              ...List.generate(4, (i) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: ShimmerLoading(height: 90, borderRadius: 18),
              )),
            ]),
          ),
        ),
        error: (error, _) => _ErrorView(
          onRetry: () => ref.invalidate(_themesProvider),
        ),
        data: (themes) => _buildContent(context, themes),
      ),
    );
  }

  Widget _buildContent(BuildContext context, List<ThemeModel> themes) {
    final filtered = themes.where((t) {
      if (_searchQuery.isEmpty) return true;
      final q = _searchQuery.toLowerCase();
      return t.title.toLowerCase().contains(q) ||
          t.description.toLowerCase().contains(q);
    }).toList();

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: () async => ref.invalidate(_themesProvider),
      child: CustomScrollView(
        slivers: [
          // ── Header ──
          SliverToBoxAdapter(
            child: Container(
              decoration: const BoxDecoration(
                gradient: AppDesign.heroGradient,
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
              ),
              padding: EdgeInsets.only(
                top: MediaQuery.of(context).padding.top + 16,
                left: 20,
                right: 20,
                bottom: 24,
              ),
              child: Stack(
                children: [
                  Positioned.fill(
                    child: ClipRRect(
                      borderRadius: const BorderRadius.vertical(bottom: Radius.circular(28)),
                      child: FloatingParticles(count: 5, color: AppColors.accent, maxSize: 5),
                    ),
                  ),
                  Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.menu_rounded, color: Colors.white),
                        onPressed: () => Scaffold.of(context).openDrawer(),
                      ),
                      const SizedBox(width: 8),
                      const Expanded(
                        child: Text(
                          'Thèmes',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Padding(
                    padding: const EdgeInsets.only(left: 8),
                    child: Text(
                      'Explorez les thèmes d\'apprentissage du DEC',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.8),
                        fontSize: 14,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Search bar
                  Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF14472A),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
                    ),
                    child: Theme(
                      data: ThemeData.dark().copyWith(
                        textSelectionTheme: const TextSelectionThemeData(
                          cursorColor: Colors.white,
                          selectionColor: Colors.white24,
                          selectionHandleColor: Colors.white70,
                        ),
                      ),
                      child: TextField(
                        onChanged: (v) => setState(() => _searchQuery = v),
                        style: const TextStyle(color: Colors.white, fontSize: 15),
                        cursorColor: Colors.white,
                        decoration: InputDecoration(
                          hintText: 'Rechercher un thème...',
                          hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.5)),
                          prefixIcon: Icon(Icons.search_rounded, color: Colors.white.withValues(alpha: 0.7)),
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
                ],
              ),
            ),
          ),

          // ── Stats bar ──
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Text(
                '${filtered.length} thème${filtered.length > 1 ? 's' : ''} disponible${filtered.length > 1 ? 's' : ''}',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.textMutedLight,
                    ),
              ),
            ),
          ),

          // ── Theme cards ──
          if (filtered.isEmpty)
            SliverFillRemaining(
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.category_rounded, size: 56, color: AppColors.textMutedLight),
                    const SizedBox(height: 12),
                    Text(
                      _searchQuery.isNotEmpty
                          ? 'Aucun thème trouvé'
                          : 'Aucun thème disponible',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            color: AppColors.textSecondaryLight,
                          ),
                    ),
                    if (_searchQuery.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(
                          'Essayez une autre recherche',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: AppColors.textMutedLight,
                              ),
                        ),
                      ),
                  ],
                ),
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
              sliver: SliverList.separated(
                itemCount: filtered.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final theme = filtered[index];
                  final isExpanded = _expandedThemes.contains(theme.id);
                  return StaggeredFadeIn(
                    index: index,
                    child: _ThemeCard(
                    theme: theme,
                    isExpanded: isExpanded,
                    onToggleExpand: () {
                      setState(() {
                        if (isExpanded) {
                          _expandedThemes.remove(theme.id);
                        } else {
                          _expandedThemes.add(theme.id);
                        }
                      });
                    },
                  ),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// THEME CARD
// ═══════════════════════════════════════════════════════════════
class _ThemeCard extends StatelessWidget {
  final ThemeModel theme;
  final bool isExpanded;
  final VoidCallback onToggleExpand;

  const _ThemeCard({
    required this.theme,
    required this.isExpanded,
    required this.onToggleExpand,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final quizCount = theme.quizzes?.length ?? 0;

    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? AppColors.borderDark : AppColors.primary.withValues(alpha: 0.1),
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.06),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Top accent bar with gradient
          Container(
            height: 4,
            decoration: BoxDecoration(
              gradient: theme.isActive
                  ? AppDesign.primaryGradient
                  : null,
              color: theme.isActive ? null : Colors.grey,
            ),
          ),

          // Header
          InkWell(
            onTap: onToggleExpand,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 12, 14),
              child: Row(
                children: [
                  // Position badge with gradient
                  Container(
                    width: 46,
                    height: 46,
                    decoration: BoxDecoration(
                      gradient: theme.isActive
                          ? AppDesign.primaryGradient
                          : null,
                      color: theme.isActive ? null : Colors.grey,
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: theme.isActive
                          ? AppDesign.glowShadow(AppColors.primary, blur: 10)
                          : [],
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      '${theme.position}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),

                  // Title + quiz count
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                theme.title,
                                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (!theme.isActive) ...[
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Colors.grey.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  'Désactivé',
                                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                        color: AppColors.textMutedLight,
                                      ),
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '$quizCount quiz disponible${quizCount > 1 ? 's' : ''}',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: AppColors.textSecondaryLight,
                              ),
                        ),
                      ],
                    ),
                  ),

                  // Expand icon
                  Icon(
                    isExpanded ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                    color: AppColors.textSecondaryLight,
                  ),
                ],
              ),
            ),
          ),

          // Description (always visible)
          if (theme.description.isNotEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
              child: Text(
                _stripHtml(theme.description),
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.textSecondaryLight,
                      height: 1.4,
                    ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),

          // Expanded quizzes section
          if (isExpanded) _QuizzesSection(quizzes: theme.quizzes ?? []),
        ],
      ),
    );
  }

  String _stripHtml(String html) {
    return html
        .replaceAll(RegExp(r'<[^>]*>'), '')
        .replaceAll('&nbsp;', ' ')
        .replaceAll('&amp;', '&')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .trim();
  }
}

// ═══════════════════════════════════════════════════════════════
// QUIZZES SECTION (expanded)
// ═══════════════════════════════════════════════════════════════
class _QuizzesSection extends StatelessWidget {
  final List<dynamic> quizzes;
  const _QuizzesSection({required this.quizzes});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: (isDark ? AppColors.backgroundDark : const Color(0xFFF5F9F7))
            .withValues(alpha: 0.7),
        border: Border(
          top: BorderSide(
            color: isDark ? AppColors.borderDark : AppColors.borderLight,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
            child: Row(
              children: [
                Icon(Icons.quiz_rounded, size: 18, color: AppColors.primary),
                const SizedBox(width: 8),
                Text(
                  'Quiz du thème',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
          ),
          if (quizzes.isEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 20),
              child: Text(
                'Aucun quiz dans ce thème',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.textMutedLight,
                    ),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(12, 0, 12, 14),
              itemCount: quizzes.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final quiz = quizzes[index] as Map<String, dynamic>;
                return _QuizTile(quiz: quiz);
              },
            ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// QUIZ TILE
// ═══════════════════════════════════════════════════════════════
class _QuizTile extends StatelessWidget {
  final Map<String, dynamic> quiz;
  const _QuizTile({required this.quiz});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final title = quiz['title'] as String? ?? 'Quiz';
    final difficulty = quiz['difficulty'] as String? ?? 'MOYEN';
    final timeLimit = quiz['timeLimit'] as int? ?? 30;
    final passingScore = quiz['passingScore'] as int? ?? 70;
    final isFree = quiz['isFree'] as bool? ?? false;
    final isActive = quiz['isActive'] as bool? ?? true;
    final quizId = quiz['id'] as String? ?? '';

    final diffColor = _getDifficultyColor(difficulty);

    return Opacity(
      opacity: isActive ? 1.0 : 0.5,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isDark ? AppColors.cardDark : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isDark ? AppColors.borderDark : AppColors.borderLight,
          ),
        ),
        child: Row(
          children: [
            // Quiz info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      // Difficulty badge
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: diffColor.bg,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          difficulty,
                          style: TextStyle(
                            color: diffColor.text,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      // Time
                      _InfoChip(
                        icon: Icons.timer_outlined,
                        label: '$timeLimit min',
                      ),
                      // Passing score
                      _InfoChip(
                        icon: Icons.flag_outlined,
                        label: '$passingScore%',
                      ),
                      // Free badge
                      if (isFree)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                          ),
                          child: const Text(
                            'Gratuit',
                            style: TextStyle(
                              color: AppColors.primary,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),

            // Play button
            SizedBox(
              height: 36,
              child: ElevatedButton.icon(
                onPressed: isActive
                    ? () => context.push('/quizzes/$quizId/play')
                    : null,
                icon: const Icon(Icons.play_arrow_rounded, size: 18),
                label: const Text('Voir', style: TextStyle(fontSize: 13)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  _DiffColor _getDifficultyColor(String difficulty) {
    switch (difficulty) {
      case 'FACILE':
        return const _DiffColor(bg: Color(0xFFD1FAE5), text: Color(0xFF065F46));
      case 'DIFFICILE':
        return const _DiffColor(bg: Color(0xFFFEE2E2), text: Color(0xFF991B1B));
      default: // MOYEN
        return const _DiffColor(bg: Color(0xFFFEF3C7), text: Color(0xFF92400E));
    }
  }
}

class _DiffColor {
  final Color bg;
  final Color text;
  const _DiffColor({required this.bg, required this.text});
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const _InfoChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13, color: AppColors.textMutedLight),
        const SizedBox(width: 3),
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            color: AppColors.textMutedLight,
          ),
        ),
      ],
    );
  }
}

class _ErrorView extends StatelessWidget {
  final VoidCallback onRetry;
  const _ErrorView({required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.cloud_off_rounded, size: 56, color: AppColors.textMutedLight),
            const SizedBox(height: 16),
            Text(
              'Impossible de charger les thèmes',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('Réessayer'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
