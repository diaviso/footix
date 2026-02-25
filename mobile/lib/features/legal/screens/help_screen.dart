import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

class HelpScreen extends StatelessWidget {
  const HelpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Aide'),
        backgroundColor: isDark ? AppColors.primaryDark : Colors.white,
        foregroundColor: isDark ? Colors.white : AppColors.textPrimaryLight,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.primary, AppColors.primaryLight],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.help_outline_rounded, color: Colors.white, size: 32),
                  ),
                  const SizedBox(width: 16),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Centre d\'aide',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Tout ce que vous devez savoir sur Footix',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            
            _buildHelpSection(
              icon: Icons.school_rounded,
              title: 'Qu\'est-ce que Footix ?',
              content: 'Footix est une application mobile dédiée au football. '
                  'Testez et améliorez vos connaissances sur le football grâce à des quiz interactifs, '
                  'des thèmes variés et un classement compétitif.',
              isDark: isDark,
            ),
            
            _buildHelpSection(
              icon: Icons.quiz_rounded,
              title: 'Les Quiz',
              content: 'Comment fonctionnent les quiz ?\n\n'
                  '• Chaque quiz contient plusieurs questions à choix multiples\n'
                  '• Vous avez un temps limité pour répondre à chaque question\n'
                  '• Un score minimum de 70% est requis pour réussir\n'
                  '• Vous gagnez des étoiles en réussissant les quiz\n\n'
                  'Tentatives :\n'
                  '• Vous disposez de 3 tentatives par quiz\n'
                  '• Les tentatives se rechargent automatiquement après 24h\n'
                  '• Les membres Premium ont des tentatives illimitées',
              isDark: isDark,
            ),
            
            _buildHelpSection(
              icon: Icons.category_rounded,
              title: 'Les Thèmes',
              content: 'Les quiz sont organisés par thèmes correspondant aux matières de la déontologie :\n\n'
                  '• Déontologie de l\'EC et du CAC\n'
                  '• Réglementation professionnelle\n'
                  '• Et bien d\'autres...\n\n'
                  'Chaque thème contient plusieurs quiz de difficulté progressive.',
              isDark: isDark,
            ),
            
            _buildHelpSection(
              icon: Icons.star_rounded,
              title: 'Les Étoiles et le Classement',
              content: 'Comment gagner des étoiles ?\n\n'
                  '• Réussissez un quiz pour la première fois : +3 étoiles\n'
                  '• Score parfait (100%) : bonus d\'étoiles\n\n'
                  'Le classement :\n'
                  '• Comparez-vous aux autres utilisateurs\n'
                  '• Le classement affiche les 100 meilleurs\n'
                  '• Votre position est mise à jour en temps réel',
              isDark: isDark,
            ),
            
            _buildHelpSection(
              icon: Icons.smart_toy_rounded,
              title: 'Le Chatbot IA',
              content: 'Notre assistant intelligent est là pour vous aider :\n\n'
                  '• Posez des questions sur la Déontologie\n'
                  '• Posez des questions sur le DEC\n'
                  '• Obtenez des explications détaillées\n'
                  '• Demandez des clarifications sur les quiz\n\n'
                  'Conseils d\'utilisation :\n'
                  '• Soyez précis dans vos questions\n'
                  '• Vous pouvez poser des questions en français\n'
                  '• L\'historique de conversation est sauvegardé',
              isDark: isDark,
            ),
            
            _buildHelpSection(
              icon: Icons.refresh_rounded,
              title: 'La Révision',
              content: 'Le mode Révision vous permet de :\n\n'
                  '• Réviser des questions aléatoires de tous les thèmes\n'
                  '• Renforcer vos connaissances globales\n'
                  '• Préparer l\'examen de manière transversale\n\n'
                  'Note : Cette fonctionnalité est réservée aux membres Premium.',
              isDark: isDark,
            ),
            
            _buildHelpSection(
              icon: Icons.workspace_premium_rounded,
              title: 'L\'abonnement Premium',
              content: 'Devenez Premium pour débloquer :\n\n'
                  '• ✓ Accès à tous les quiz (y compris premium)\n'
                  '• ✓ Tentatives illimitées\n'
                  '• ✓ Mode Révision\n'
                  '• ✓ Chatbot IA illimité\n'
                  '• ✓ Pas de publicités\n\n'
                  'Gestion de l\'abonnement :\n'
                  '• Abonnement mensuel à 9,99€/mois\n'
                  '• Annulation possible à tout moment\n'
                  '• Gérez votre abonnement dans les paramètres de votre store',
              isDark: isDark,
            ),
            
            _buildHelpSection(
              icon: Icons.forum_rounded,
              title: 'Le Forum',
              content: 'Échangez avec la communauté :\n\n'
                  '• Posez vos questions\n'
                  '• Partagez vos astuces\n'
                  '• Aidez les autres candidats\n\n'
                  'Règles du forum :\n'
                  '• Restez respectueux et bienveillant\n'
                  '• Évitez le hors-sujet\n'
                  '• Signalez les contenus inappropriés',
              isDark: isDark,
            ),
            
            _buildHelpSection(
              icon: Icons.article_rounded,
              title: 'Le Blog',
              content: 'Retrouvez des articles rédigés par des experts :\n\n'
                  '• Actualités du DEC\n'
                  '• Conseils de préparation\n'
                  '• Analyses de sujets d\'examen\n'
                  '• Témoignages de candidats',
              isDark: isDark,
            ),
            
            _buildHelpSection(
              icon: Icons.person_rounded,
              title: 'Votre Profil',
              content: 'Dans votre profil, vous pouvez :\n\n'
                  '• Modifier vos informations personnelles\n'
                  '• Changer votre photo de profil\n'
                  '• Consulter vos statistiques\n'
                  '• Gérer votre abonnement Premium',
              isDark: isDark,
            ),
            
            _buildHelpSection(
              icon: Icons.bug_report_rounded,
              title: 'Signaler un problème',
              content: 'Vous rencontrez un bug ou un problème ?\n\n'
                  '• Contactez-nous à : declearningcontact@gmail.com\n'
                  '• Décrivez le problème en détail\n'
                  '• Joignez une capture d\'écran si possible\n\n'
                  'Nous vous répondrons dans les plus brefs délais.',
              isDark: isDark,
            ),
            
            const SizedBox(height: 24),
            
            // Contact card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? Colors.white.withValues(alpha: 0.05) : AppColors.primarySurface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: AppColors.primary.withValues(alpha: 0.2),
                ),
              ),
              child: Column(
                children: [
                  const Icon(Icons.mail_rounded, color: AppColors.primary, size: 40),
                  const SizedBox(height: 12),
                  Text(
                    'Besoin d\'aide supplémentaire ?',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : AppColors.textPrimaryLight,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Contactez notre équipe support',
                    style: TextStyle(
                      fontSize: 14,
                      color: isDark ? Colors.white70 : AppColors.textSecondaryLight,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'declearningcontact@gmail.com',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
  
  Widget _buildHelpSection({
    required IconData icon,
    required String title,
    required String content,
    required bool isDark,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withValues(alpha: 0.05) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? Colors.white.withValues(alpha: 0.1) : AppColors.borderLight,
        ),
        boxShadow: isDark ? null : [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Theme(
        data: ThemeData(
          dividerColor: Colors.transparent,
          splashColor: AppColors.primary.withValues(alpha: 0.1),
        ),
        child: ExpansionTile(
          leading: Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: AppColors.primary, size: 24),
          ),
          title: Text(
            title,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: isDark ? Colors.white : AppColors.textPrimaryLight,
            ),
          ),
          iconColor: AppColors.primary,
          collapsedIconColor: AppColors.textMutedLight,
          childrenPadding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
          children: [
            Text(
              content,
              style: TextStyle(
                fontSize: 14,
                height: 1.6,
                color: isDark ? Colors.white70 : AppColors.textSecondaryLight,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
