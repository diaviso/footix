import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_design.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/theme_provider.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  // Notification prefs (local state synced from user)
  late bool _emailNotifications;
  late bool _pushNotifications;
  late bool _marketingEmails;
  late bool _showInLeaderboard;
  bool _isSavingNotifications = false;

  // Password change
  final _currentPasswordCtrl = TextEditingController();
  final _newPasswordCtrl = TextEditingController();
  final _confirmPasswordCtrl = TextEditingController();
  bool _showPassword = false;
  bool _isChangingPassword = false;

  // Account deletion
  int _deleteStep = 0; // 0=hidden, 1=warning, 2=confirm
  final _deleteConfirmCtrl = TextEditingController();
  bool _isDeleting = false;

  @override
  void initState() {
    super.initState();
    final user = ref.read(currentUserProvider);
    _emailNotifications = user?.emailNotifications ?? true;
    _pushNotifications = user?.pushNotifications ?? true;
    _marketingEmails = user?.marketingEmails ?? false;
    _showInLeaderboard = user?.showInLeaderboard ?? true;
  }

  @override
  void dispose() {
    _currentPasswordCtrl.dispose();
    _newPasswordCtrl.dispose();
    _confirmPasswordCtrl.dispose();
    _deleteConfirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _updateNotification(String key, bool value) async {
    // Optimistic update
    final prev = {
      'emailNotifications': _emailNotifications,
      'pushNotifications': _pushNotifications,
      'marketingEmails': _marketingEmails,
    };
    setState(() {
      if (key == 'emailNotifications') _emailNotifications = value;
      if (key == 'pushNotifications') _pushNotifications = value;
      if (key == 'marketingEmails') _marketingEmails = value;
      _isSavingNotifications = true;
    });

    try {
      await ref.read(authProvider.notifier).updateProfile({
        'emailNotifications': _emailNotifications,
        'pushNotifications': _pushNotifications,
        'marketingEmails': _marketingEmails,
      });
      if (!mounted) return;
      _showSnack('Préférences mises à jour', isError: false);
    } catch (e) {
      if (!mounted) return;
      // Revert
      setState(() {
        _emailNotifications = prev['emailNotifications']!;
        _pushNotifications = prev['pushNotifications']!;
        _marketingEmails = prev['marketingEmails']!;
      });
      _showSnack('Erreur: $e');
    } finally {
      if (mounted) setState(() => _isSavingNotifications = false);
    }
  }

  Future<void> _toggleLeaderboardVisibility(bool value) async {
    final prev = _showInLeaderboard;
    setState(() => _showInLeaderboard = value);

    try {
      await ref.read(authProvider.notifier).updateLeaderboardVisibility(value);
      if (!mounted) return;
      _showSnack(
        value ? 'Vous apparaissez dans le classement' : 'Vous êtes masqué du classement',
        isError: false,
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _showInLeaderboard = prev);
      _showSnack('Erreur: $e');
    }
  }

  Future<void> _changePassword() async {
    final current = _currentPasswordCtrl.text.trim();
    final newPwd = _newPasswordCtrl.text.trim();
    final confirm = _confirmPasswordCtrl.text.trim();

    if (current.isEmpty || newPwd.isEmpty || confirm.isEmpty) {
      _showSnack('Veuillez remplir tous les champs');
      return;
    }
    if (newPwd != confirm) {
      _showSnack('Les mots de passe ne correspondent pas');
      return;
    }
    if (newPwd.length < 6) {
      _showSnack('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setState(() => _isChangingPassword = true);
    try {
      await ref.read(authProvider.notifier).changePassword(
        currentPassword: current,
        newPassword: newPwd,
      );
      if (!mounted) return;
      _currentPasswordCtrl.clear();
      _newPasswordCtrl.clear();
      _confirmPasswordCtrl.clear();
      _showSnack('Mot de passe mis à jour', isError: false);
    } catch (e) {
      if (!mounted) return;
      _showSnack('$e');
    } finally {
      if (mounted) setState(() => _isChangingPassword = false);
    }
  }

  void _showSnack(String msg, {bool isError = true}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: isError ? AppColors.error : AppColors.primary,
    ));
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    if (user == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator(color: AppColors.primary)));
    }

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 40),
          children: [
            // Header with gradient
            Container(
              margin: const EdgeInsets.only(bottom: 16),
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
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        gradient: AppDesign.primaryGradient,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: AppDesign.glowShadow(AppColors.primary, blur: 10),
                      ),
                      child: const Icon(Icons.settings_rounded, size: 22, color: Colors.white),
                    ),
                    const SizedBox(width: 10),
                    const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text('Paramètres', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
                      Text('Personnalisez votre expérience',
                          style: TextStyle(fontSize: 13, color: Colors.white70)),
                    ])),
                  ]),
                ],
              ),
            ),

            // Notifications
            _buildSectionCard(
              icon: Icons.notifications_rounded,
              title: 'Notifications',
              subtitle: 'Gérez vos préférences de notification',
              children: [
                _buildSwitchRow(
                  'Notifications par email',
                  'Recevez des mises à jour par email',
                  _emailNotifications,
                  (v) => _updateNotification('emailNotifications', v),
                ),
                const Divider(height: 24),
                _buildSwitchRow(
                  'Notifications push',
                  'Recevez des notifications sur votre appareil',
                  _pushNotifications,
                  (v) => _updateNotification('pushNotifications', v),
                ),
                const Divider(height: 24),
                _buildSwitchRow(
                  'Communications marketing',
                  'Recevez des offres et nouveautés',
                  _marketingEmails,
                  (v) => _updateNotification('marketingEmails', v),
                ),
                if (_isSavingNotifications)
                  const Padding(
                    padding: EdgeInsets.only(top: 8),
                    child: LinearProgressIndicator(color: AppColors.primary, minHeight: 2),
                  ),
              ],
            ),
            const SizedBox(height: 16),

            // Security
            _buildSectionCard(
              icon: Icons.lock_rounded,
              title: 'Sécurité',
              subtitle: 'Mettez à jour votre mot de passe',
              children: [
                _buildPasswordField('Mot de passe actuel', _currentPasswordCtrl),
                const SizedBox(height: 12),
                _buildPasswordField('Nouveau mot de passe', _newPasswordCtrl),
                const SizedBox(height: 12),
                _buildPasswordField('Confirmer le mot de passe', _confirmPasswordCtrl),
                const SizedBox(height: 8),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton.icon(
                    onPressed: () => setState(() => _showPassword = !_showPassword),
                    icon: Icon(_showPassword ? Icons.visibility_off_rounded : Icons.visibility_rounded, size: 16),
                    label: Text(_showPassword ? 'Masquer' : 'Afficher'),
                    style: TextButton.styleFrom(foregroundColor: AppColors.textMutedLight),
                  ),
                ),
                const SizedBox(height: 4),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _isChangingPassword ? null : _changePassword,
                    icon: _isChangingPassword
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.save_rounded, size: 18),
                    label: Text(_isChangingPassword ? 'Mise à jour...' : 'Mettre à jour le mot de passe'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Privacy
            _buildSectionCard(
              icon: Icons.shield_rounded,
              title: 'Confidentialité',
              subtitle: 'Contrôlez la visibilité de votre profil',
              children: [
                _buildSwitchRow(
                  'Apparaître dans le classement',
                  'Permettre aux autres de voir votre rang',
                  _showInLeaderboard,
                  _toggleLeaderboardVisibility,
                  icon: Icons.emoji_events_rounded,
                ),
                const Divider(height: 24),
                Row(children: [
                  const Icon(Icons.language_rounded, size: 18, color: AppColors.textMutedLight),
                  const SizedBox(width: 10),
                  const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Langue', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    Text("Langue de l'interface", style: TextStyle(fontSize: 12, color: AppColors.textMutedLight)),
                  ])),
                  const Text('Français', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                ]),
              ],
            ),
            const SizedBox(height: 16),

            // Appearance
            _buildSectionCard(
              icon: Icons.palette_rounded,
              title: 'Apparence',
              subtitle: 'Choisissez le thème de l\'application',
              children: [
                _buildThemeSelector(),
              ],
            ),
            const SizedBox(height: 16),

            // Logout
            _buildSectionCard(
              icon: Icons.logout_rounded,
              iconColor: AppColors.error,
              title: 'Déconnexion',
              subtitle: 'Se déconnecter de votre compte',
              borderColor: AppColors.error.withValues(alpha: 0.2),
              children: [
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () => _confirmLogout(context),
                    icon: const Icon(Icons.logout_rounded, size: 18),
                    label: const Text('Se déconnecter'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.error,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Account Deletion — Zone dangereuse
            _buildSectionCard(
              icon: Icons.warning_amber_rounded,
              iconColor: AppColors.error,
              title: 'Zone dangereuse',
              subtitle: 'Actions irréversibles sur votre compte',
              borderColor: AppColors.error.withValues(alpha: 0.2),
              children: [
                if (_deleteStep == 0) ...[
                  const Text(
                    'Supprimer définitivement votre compte et toutes vos données.',
                    style: TextStyle(fontSize: 13, color: AppColors.textMutedLight),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () => setState(() => _deleteStep = 1),
                      icon: const Icon(Icons.delete_forever_rounded, size: 18),
                      label: const Text('Supprimer mon compte'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.error,
                        side: const BorderSide(color: AppColors.error),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
                if (_deleteStep == 1) ...[
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.error.withValues(alpha: 0.3)),
                      color: AppColors.error.withValues(alpha: 0.04),
                    ),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Row(children: [
                        Icon(Icons.warning_amber_rounded, color: AppColors.error, size: 20),
                        SizedBox(width: 8),
                        Expanded(child: Text('Attention — Suppression définitive',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14))),
                      ]),
                      const SizedBox(height: 12),
                      const Text('La suppression de votre compte entraînera :',
                          style: TextStyle(fontSize: 13, color: AppColors.textMutedLight)),
                      const SizedBox(height: 8),
                      ...[
                        'La suppression totale et irréversible de toutes vos données personnelles',
                        'La suppression de votre historique de quiz, étoiles et progression',
                        'La suppression de vos conversations, commentaires et publications',
                        'L\'annulation automatique de votre abonnement Premium en cours (le cas échéant)',
                        'Aucune information ne sera conservée par l\'application',
                      ].map((text) => Padding(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          const Text('• ', style: TextStyle(fontSize: 13, color: AppColors.error)),
                          Expanded(child: Text(text, style: const TextStyle(fontSize: 12, color: AppColors.textMutedLight))),
                        ]),
                      )),
                      const SizedBox(height: 14),
                      Row(children: [
                        Expanded(child: OutlinedButton(
                          onPressed: () => setState(() => _deleteStep = 0),
                          style: OutlinedButton.styleFrom(
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: const Text('Annuler'),
                        )),
                        const SizedBox(width: 10),
                        Expanded(child: ElevatedButton(
                          onPressed: () => setState(() => _deleteStep = 2),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.error,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: const Text('Je comprends'),
                        )),
                      ]),
                    ]),
                  ),
                ],
                if (_deleteStep == 2) ...[
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.error),
                      color: AppColors.error.withValues(alpha: 0.04),
                    ),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Row(children: [
                        Icon(Icons.delete_forever_rounded, color: AppColors.error, size: 20),
                        SizedBox(width: 8),
                        Expanded(child: Text('Confirmation finale',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14))),
                      ]),
                      const SizedBox(height: 12),
                      const Text('Pour confirmer la suppression, tapez SUPPRIMER ci-dessous :',
                          style: TextStyle(fontSize: 13, color: AppColors.textMutedLight)),
                      const SizedBox(height: 10),
                      TextField(
                        controller: _deleteConfirmCtrl,
                        enabled: !_isDeleting,
                        onChanged: (_) => setState(() {}),
                        style: const TextStyle(fontSize: 14),
                        decoration: InputDecoration(
                          hintText: 'Tapez SUPPRIMER',
                          filled: true,
                          fillColor: AppColors.error.withValues(alpha: 0.05),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: BorderSide(color: AppColors.error.withValues(alpha: 0.3)),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: BorderSide(color: AppColors.error.withValues(alpha: 0.3)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: const BorderSide(color: AppColors.error),
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),
                      Row(children: [
                        Expanded(child: OutlinedButton(
                          onPressed: _isDeleting ? null : () => setState(() {
                            _deleteStep = 0;
                            _deleteConfirmCtrl.clear();
                          }),
                          style: OutlinedButton.styleFrom(
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: const Text('Annuler'),
                        )),
                        const SizedBox(width: 10),
                        Expanded(child: ElevatedButton.icon(
                          onPressed: _deleteConfirmCtrl.text != 'SUPPRIMER' || _isDeleting
                              ? null
                              : () async {
                                  setState(() => _isDeleting = true);
                                  try {
                                    await ref.read(authProvider.notifier).deleteAccount();
                                    if (!mounted) return;
                                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                                      content: Text('Votre compte a été supprimé.'),
                                      backgroundColor: AppColors.primary,
                                    ));
                                  } catch (e) {
                                    if (!mounted) return;
                                    setState(() => _isDeleting = false);
                                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                      content: Text('Erreur: $e'),
                                      backgroundColor: AppColors.error,
                                    ));
                                  }
                                },
                          icon: _isDeleting
                              ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                              : const Icon(Icons.delete_forever_rounded, size: 18),
                          label: Text(_isDeleting ? 'Suppression...' : 'Supprimer'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.error,
                            foregroundColor: Colors.white,
                            disabledBackgroundColor: AppColors.error.withValues(alpha: 0.3),
                            disabledForegroundColor: Colors.white54,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        )),
                      ]),
                    ]),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _confirmLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Déconnexion'),
        content: const Text('Êtes-vous sûr de vouloir vous déconnecter ?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Annuler')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ref.read(authProvider.notifier).logout();
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error, foregroundColor: Colors.white),
            child: const Text('Déconnexion'),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required List<Widget> children,
    Color? iconColor,
    Color? borderColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor ?? AppColors.borderLight),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Icon(icon, size: 20, color: iconColor ?? AppColors.primary),
          const SizedBox(width: 8),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            Text(subtitle, style: const TextStyle(fontSize: 12, color: AppColors.textMutedLight)),
          ])),
        ]),
        const SizedBox(height: 16),
        ...children,
      ]),
    );
  }

  Widget _buildThemeSelector() {
    final themeMode = ref.watch(themeModeProvider);
    final options = [
      (mode: ThemeMode.system, label: 'Système', icon: Icons.settings_suggest_rounded),
      (mode: ThemeMode.light, label: 'Clair', icon: Icons.light_mode_rounded),
      (mode: ThemeMode.dark, label: 'Sombre', icon: Icons.dark_mode_rounded),
    ];
    return Row(
      children: options.map((opt) {
        final isSelected = themeMode == opt.mode;
        return Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: GestureDetector(
              onTap: () => ref.read(themeModeProvider.notifier).setThemeMode(opt.mode),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                curve: Curves.easeInOut,
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primary.withValues(alpha: 0.1) : Colors.transparent,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected ? AppColors.primary : AppColors.borderLight,
                    width: isSelected ? 2 : 1,
                  ),
                ),
                child: Column(mainAxisSize: MainAxisSize.min, children: [
                  Icon(opt.icon, size: 22, color: isSelected ? AppColors.primary : AppColors.textMutedLight),
                  const SizedBox(height: 6),
                  Text(opt.label, style: TextStyle(
                    fontSize: 12,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    color: isSelected ? AppColors.primary : AppColors.textSecondaryLight,
                  )),
                ]),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildSwitchRow(String title, String subtitle, bool value, ValueChanged<bool> onChanged, {IconData? icon}) {
    return Row(children: [
      if (icon != null) ...[
        Icon(icon, size: 18, color: AppColors.textMutedLight),
        const SizedBox(width: 10),
      ],
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
        const SizedBox(height: 2),
        Text(subtitle, style: const TextStyle(fontSize: 12, color: AppColors.textMutedLight)),
      ])),
      const SizedBox(width: 12),
      Switch.adaptive(
        value: value,
        onChanged: onChanged,
        activeTrackColor: AppColors.primary,
      ),
    ]);
  }

  Widget _buildPasswordField(String label, TextEditingController controller) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: TextStyle(fontSize: 12, color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight, fontWeight: FontWeight.w500)),
      const SizedBox(height: 4),
      TextField(
        controller: controller,
        obscureText: !_showPassword,
        style: const TextStyle(fontSize: 14),
        decoration: InputDecoration(
          filled: true,
          fillColor: isDark ? AppColors.neutral800 : AppColors.neutral50,
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: (isDark ? AppColors.borderDark : AppColors.borderLight).withValues(alpha: 0.5)),
          ),
        ),
      ),
    ]);
  }
}
