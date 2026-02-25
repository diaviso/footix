import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_design.dart';
import '../../../navigation/app_router.dart';
import '../../../providers/auth_provider.dart';
import '../widgets/auth_background.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _showPassword = false;
  bool _isLoading = false;

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    try {
      await ref.read(authProvider.notifier).register(
            email: _emailController.text.trim(),
            password: _passwordController.text,
            firstName: _firstNameController.text.trim(),
            lastName: _lastNameController.text.trim(),
          );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Un code de vérification a été envoyé à votre email'),
            backgroundColor: AppColors.success,
          ),
        );
        context.go(
          '${AppRoutes.verifyEmail}?email=${Uri.encodeComponent(_emailController.text.trim())}',
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              ref.read(authProvider).error ?? 'Une erreur est survenue',
            ),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleGoogleLogin() async {
    setState(() => _isLoading = true);
    try {
      await ref.read(authProvider.notifier).googleLogin();
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Erreur lors de la connexion Google'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AuthBackground(
      child: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo
                AuthStaggeredItem(
                  index: 0,
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: AppDesign.glowShadow(AppColors.accent, blur: 28),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(24),
                      child: Image.asset('assets/images/logo.jpg', width: 72, height: 72, fit: BoxFit.cover),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                AuthStaggeredItem(
                  index: 1,
                  child: const Text('Créer un compte', style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Colors.white)),
                ),
                const SizedBox(height: 4),
                AuthStaggeredItem(
                  index: 2,
                  child: Text('Rejoignez Footix', style: TextStyle(fontSize: 14, color: Colors.white.withValues(alpha: 0.6))),
                ),
                const SizedBox(height: 28),

                // Card
                AuthStaggeredItem(
                  index: 3,
                  child: AuthCard(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Google button
                          SizedBox(
                            width: double.infinity,
                            height: 50,
                            child: OutlinedButton(
                              onPressed: _isLoading ? null : _handleGoogleLogin,
                              style: OutlinedButton.styleFrom(
                                side: BorderSide(color: Colors.white.withValues(alpha: 0.2), width: 1.5),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                backgroundColor: Colors.white.withValues(alpha: 0.06),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.g_mobiledata_rounded, size: 24, color: Colors.white),
                                  const SizedBox(width: 8),
                                  const Text('Continuer avec Google', style: TextStyle(fontWeight: FontWeight.w500, fontSize: 14, color: Colors.white)),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 18),

                          // Divider
                          Row(children: [
                            Expanded(child: Divider(color: Colors.white.withValues(alpha: 0.15))),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              child: Text('OU', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.white.withValues(alpha: 0.4))),
                            ),
                            Expanded(child: Divider(color: Colors.white.withValues(alpha: 0.15))),
                          ]),
                          const SizedBox(height: 18),

                          // Form
                          Form(
                            key: _formKey,
                            child: Column(children: [
                              Row(children: [
                                Expanded(child: _buildField(_firstNameController, 'Prénom', 'Jean', Icons.person_outline_rounded,
                                    validator: (v) => v == null || v.isEmpty ? 'Requis' : null)),
                                const SizedBox(width: 12),
                                Expanded(child: _buildField(_lastNameController, 'Nom', 'Dupont', Icons.person_outline_rounded,
                                    validator: (v) => v == null || v.isEmpty ? 'Requis' : null)),
                              ]),
                              const SizedBox(height: 14),
                              _buildField(_emailController, 'Email', 'vous@exemple.com', Icons.mail_outline_rounded,
                                  keyboardType: TextInputType.emailAddress,
                                  validator: (v) {
                                    if (v == null || v.isEmpty) return 'Veuillez entrer votre email';
                                    if (!v.contains('@')) return 'Email invalide';
                                    return null;
                                  }),
                              const SizedBox(height: 14),
                              _buildField(_passwordController, 'Mot de passe', '••••••••', Icons.lock_outline_rounded,
                                  obscureText: !_showPassword,
                                  textInputAction: TextInputAction.done,
                                  onSubmitted: (_) => _handleRegister(),
                                  suffixIcon: IconButton(
                                    icon: Icon(_showPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                                        size: 20, color: Colors.white.withValues(alpha: 0.5)),
                                    onPressed: () => setState(() => _showPassword = !_showPassword),
                                  ),
                                  validator: (v) {
                                    if (v == null || v.isEmpty) return 'Veuillez entrer un mot de passe';
                                    if (v.length < 6) return 'Minimum 6 caractères';
                                    return null;
                                  }),
                              Align(
                                alignment: Alignment.centerLeft,
                                child: Padding(
                                  padding: const EdgeInsets.only(top: 4),
                                  child: Text('Minimum 6 caractères', style: TextStyle(fontSize: 11, color: Colors.white.withValues(alpha: 0.4))),
                                ),
                              ),
                              const SizedBox(height: 20),

                              // Register button
                              SizedBox(
                                width: double.infinity,
                                height: 52,
                                child: DecoratedBox(
                                  decoration: BoxDecoration(
                                    gradient: AppDesign.primaryGradient,
                                    borderRadius: BorderRadius.circular(14),
                                    boxShadow: AppDesign.glowShadow(AppColors.primary, blur: 12),
                                  ),
                                  child: ElevatedButton.icon(
                                    onPressed: _isLoading ? null : _handleRegister,
                                    icon: _isLoading
                                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                        : const Icon(Icons.person_add_rounded, size: 20),
                                    label: Text(_isLoading ? 'Inscription...' : "S'inscrire",
                                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.transparent,
                                      shadowColor: Colors.transparent,
                                      foregroundColor: Colors.white,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                    ),
                                  ),
                                ),
                              ),
                            ]),
                          ),
                          const SizedBox(height: 20),

                          // Login link
                          Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                            Text('Déjà un compte ? ', style: TextStyle(fontSize: 13, color: Colors.white.withValues(alpha: 0.5))),
                            GestureDetector(
                              onTap: () => context.go(AppRoutes.login),
                              child: const Text('Se connecter', style: TextStyle(fontSize: 13, color: AppColors.accent, fontWeight: FontWeight.w700)),
                            ),
                          ]),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildField(TextEditingController controller, String label, String hint, IconData icon, {
    bool obscureText = false,
    TextInputType? keyboardType,
    TextInputAction? textInputAction,
    Widget? suffixIcon,
    String? Function(String?)? validator,
    void Function(String)? onSubmitted,
  }) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white.withValues(alpha: 0.7))),
      const SizedBox(height: 6),
      TextFormField(
        controller: controller,
        obscureText: obscureText,
        keyboardType: keyboardType,
        textInputAction: textInputAction ?? TextInputAction.next,
        onFieldSubmitted: onSubmitted,
        validator: validator,
        style: const TextStyle(color: Colors.white, fontSize: 15),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.3)),
          prefixIcon: Icon(icon, size: 20, color: Colors.white.withValues(alpha: 0.5)),
          suffixIcon: suffixIcon,
          filled: true,
          fillColor: Colors.white.withValues(alpha: 0.08),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.12))),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.12))),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.accent, width: 1.5)),
          errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.error)),
          focusedErrorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.error, width: 1.5)),
          errorStyle: const TextStyle(color: Color(0xFFFF8A80)),
        ),
      ),
    ]);
  }
}
