import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/models/quiz_model.dart';
import '../../../providers/service_providers.dart';

class QuizCorrectionScreen extends ConsumerStatefulWidget {
  final String quizId;
  const QuizCorrectionScreen({super.key, required this.quizId});

  @override
  ConsumerState<QuizCorrectionScreen> createState() => _QuizCorrectionScreenState();
}

class _QuizCorrectionScreenState extends ConsumerState<QuizCorrectionScreen> {
  QuizModel? _quiz;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadCorrection();
  }

  Future<void> _loadCorrection() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final service = ref.read(quizzesServiceProvider);
      final quiz = await service.getQuizCorrection(widget.quizId);
      if (!mounted) return;
      setState(() { _quiz = quiz; _isLoading = false; });
    } catch (e) {
      if (!mounted) return;
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator(color: AppColors.primary)));
    }
    if (_error != null || _quiz == null) {
      return Scaffold(
        appBar: AppBar(leading: const BackButton()),
        body: Center(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.error_outline_rounded, size: 56, color: AppColors.error),
            const SizedBox(height: 16),
            const Text('Impossible de charger la correction'),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: _loadCorrection, child: const Text('Réessayer')),
          ]),
        ),
      );
    }

    final quiz = _quiz!;
    final questions = quiz.questions ?? [];

    return Scaffold(
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // ── Header ──
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(8, 8, 16, 0),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back_rounded),
                      onPressed: () => context.pop(),
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Correction : ${quiz.title}',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                              maxLines: 1, overflow: TextOverflow.ellipsis),
                          if (quiz.theme != null)
                            Text(quiz.theme!.title,
                                style: const TextStyle(fontSize: 13, color: AppColors.textMutedLight)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // ── Info banner ──
            SliverToBoxAdapter(
              child: Container(
                margin: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline_rounded, color: AppColors.primary, size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Voici les réponses correctes pour chaque question. Étudiez-les attentivement.',
                        style: TextStyle(fontSize: 13, color: AppColors.primary.withValues(alpha: 0.9)),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // ── Questions ──
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              sliver: SliverList.separated(
                itemCount: questions.length,
                separatorBuilder: (_, __) => const SizedBox(height: 14),
                itemBuilder: (context, index) {
                  final question = questions[index];
                  return _CorrectionQuestionCard(question: question, index: index);
                },
              ),
            ),

            // ── Back button ──
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
                child: SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: () => context.go('/quizzes'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Text('Retour aux quiz'),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// CORRECTION QUESTION CARD
// ═══════════════════════════════════════════════════════════════
class _CorrectionQuestionCard extends StatelessWidget {
  final QuestionModel question;
  final int index;
  const _CorrectionQuestionCard({required this.question, required this.index});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final options = question.options ?? [];
    final letters = ['A', 'B', 'C', 'D', 'E', 'F'];

    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top accent
          Container(height: 3, color: AppColors.primary),

          // Question header
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 40, height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  alignment: Alignment.center,
                  child: Text('${index + 1}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          question.isQCU ? 'Choix unique' : 'Choix multiple',
                          style: const TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.w600),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(question.content,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Options
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
            child: Column(
              children: List.generate(options.length, (idx) {
                final option = options[idx];
                final isCorrect = option.isCorrect;

                return Container(
                  margin: EdgeInsets.only(top: idx > 0 ? 8 : 0),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isCorrect
                        ? const Color(0xFFD1FAE5).withValues(alpha: 0.6)
                        : const Color(0xFFFEE2E2).withValues(alpha: 0.4),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isCorrect ? const Color(0xFF34D399) : const Color(0xFFFCA5A5),
                      width: 1.5,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 28, height: 28,
                            decoration: BoxDecoration(
                              color: isCorrect ? AppColors.success : AppColors.error.withValues(alpha: 0.7),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              idx < letters.length ? letters[idx] : '${idx + 1}',
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(option.content,
                                style: TextStyle(fontWeight: FontWeight.w500, fontSize: 14,
                                    color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight)),
                          ),
                          Icon(
                            isCorrect ? Icons.check_circle_rounded : Icons.cancel_rounded,
                            size: 20,
                            color: isCorrect ? AppColors.success : AppColors.error.withValues(alpha: 0.6),
                          ),
                        ],
                      ),
                      // Explanation
                      if (option.explanation != null && option.explanation!.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.only(top: 8),
                          decoration: BoxDecoration(
                            border: Border(
                              top: BorderSide(
                                color: isCorrect
                                    ? const Color(0xFF34D399).withValues(alpha: 0.4)
                                    : const Color(0xFFFCA5A5).withValues(alpha: 0.4),
                              ),
                            ),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(Icons.lightbulb_outline_rounded, size: 16,
                                  color: isCorrect ? const Color(0xFF059669) : const Color(0xFFDC2626)),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  option.explanation!,
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: isCorrect ? const Color(0xFF065F46) : const Color(0xFF991B1B),
                                    height: 1.4,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                );
              }),
            ),
          ),
        ],
      ),
    );
  }
}
