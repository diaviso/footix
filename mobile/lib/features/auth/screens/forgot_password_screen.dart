import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_design.dart';
import '../../../navigation/app_router.dart';
import '../../../providers/auth_provider.dart';
import '../widgets/auth_background.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _emailController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  bool _isEmailSent = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    try {
      await ref.read(authProvider.notifier).forgotPassword(
            email: _emailController.text.trim(),
          );
      if (mounted) {
        setState(() => _isEmailSent = true);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Vérifiez votre boîte de réception'),
            backgroundColor: AppColors.success,
          ),
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

  @override
  Widget build(BuildContext context) {
    if (_isEmailSent) {
      return AuthBackground(
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: AuthStaggeredItem(
                index: 0,
                child: AuthCard(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(children: [
                      Container(
                        width: 72, height: 72,
                        decoration: BoxDecoration(
                          gradient: AppDesign.primaryGradient,
                          shape: BoxShape.circle,
                          boxShadow: AppDesign.glowShadow(AppColors.primary, blur: 16),
                        ),
                        child: const Icon(Icons.check_circle_rounded, size: 36, color: Colors.white),
                      ),
                      const SizedBox(height: 24),
                      const Text('Email envoyé !', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
                      const SizedBox(height: 12),
                      RichText(
                        textAlign: TextAlign.center,
                        text: TextSpan(
                          style: TextStyle(fontSize: 14, color: Colors.white.withValues(alpha: 0.6)),
                          children: [
                            const TextSpan(text: "Si un compte existe avec l'adresse "),
                            TextSpan(text: _emailController.text.trim(), style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.accent)),
                            const TextSpan(text: ', vous recevrez un lien pour réinitialiser votre mot de passe.'),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text('Vérifiez votre boîte de réception et vos spams.', textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 12, color: Colors.white.withValues(alpha: 0.4))),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity, height: 48,
                        child: OutlinedButton.icon(
                          onPressed: () => context.go(AppRoutes.login),
                          icon: const Icon(Icons.arrow_back_rounded, size: 18),
                          label: const Text('Retour à la connexion'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.white,
                            side: BorderSide(color: Colors.white.withValues(alpha: 0.2)),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                        ),
                      ),
                    ]),
                  ),
                ),
              ),
            ),
          ),
        ),
      );
    }

    return AuthBackground(
      child: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: AuthStaggeredItem(
              index: 0,
              child: AuthCard(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(children: [
                    // Icon
                    Container(
                      width: 64, height: 64,
                      decoration: BoxDecoration(
                        gradient: AppDesign.goldGradient,
                        shape: BoxShape.circle,
                        boxShadow: AppDesign.glowShadow(AppColors.accent, blur: 14),
                      ),
                      child: const Icon(Icons.key_rounded, size: 30, color: Colors.white),
                    ),
                    const SizedBox(height: 20),
                    const Text('Mot de passe oublié ?', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
                    const SizedBox(height: 8),
                    Text(
                      'Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 13, color: Colors.white.withValues(alpha: 0.6)),
                    ),
                    const SizedBox(height: 24),

                    // Form
                    Form(
                      key: _formKey,
                      child: Column(children: [
                        _buildField(),
                        const SizedBox(height: 20),
                        _buildSubmitButton(),
                      ]),
                    ),
                    const SizedBox(height: 16),

                    // Back to login
                    TextButton.icon(
                      onPressed: () => context.go(AppRoutes.login),
                      icon: const Icon(Icons.arrow_back_rounded, size: 16),
                      label: const Text('Retour à la connexion'),
                      style: TextButton.styleFrom(foregroundColor: Colors.white.withValues(alpha: 0.5)),
                    ),
                  ]),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildField() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Email', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white.withValues(alpha: 0.7))),
      const SizedBox(height: 6),
      TextFormField(
        controller: _emailController,
        keyboardType: TextInputType.emailAddress,
        textInputAction: TextInputAction.done,
        onFieldSubmitted: (_) => _handleSubmit(),
        validator: (v) {
          if (v == null || v.isEmpty) return 'Veuillez entrer votre email';
          if (!v.contains('@')) return 'Email invalide';
          return null;
        },
        style: const TextStyle(color: Colors.white, fontSize: 15),
        decoration: InputDecoration(
          hintText: 'vous@exemple.com',
          hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.3)),
          prefixIcon: Icon(Icons.mail_outline_rounded, size: 20, color: Colors.white.withValues(alpha: 0.5)),
          filled: true,
          fillColor: Colors.white.withValues(alpha: 0.08),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.12))),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.12))),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.accent, width: 1.5)),
          errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.error)),
          errorStyle: const TextStyle(color: Color(0xFFFF8A80)),
        ),
      ),
    ]);
  }

  Widget _buildSubmitButton() {
    return SizedBox(
      width: double.infinity, height: 52,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: AppDesign.primaryGradient,
          borderRadius: BorderRadius.circular(14),
          boxShadow: AppDesign.glowShadow(AppColors.primary, blur: 12),
        ),
        child: ElevatedButton.icon(
          onPressed: _isLoading ? null : _handleSubmit,
          icon: _isLoading
              ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
              : const Icon(Icons.mail_rounded, size: 20),
          label: Text(_isLoading ? 'Envoi en cours...' : 'Envoyer le lien', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            shadowColor: Colors.transparent,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
        ),
      ),
    );
  }
}
