import { SuccessDialog } from '@/components/molecules/SuccessDialog';
import type { WelcomeCreditsPromptProps } from '@/components/molecules/WelcomeCreditsPrompt/WelcomeCreditsPrompt.types';
import { useTranslation } from '@/hooks/useTranslation';
import { useCredits } from '@/providers/CreditsProvider';

/**
 * One-shot post-install dialog when the free credits pool granted a welcome pack.
 */
export function WelcomeCreditsPrompt({
  className: _className,
}: WelcomeCreditsPromptProps = {}) {
  const { t } = useTranslation();
  const { welcomeCreditsGrant, dismissWelcomeCreditsGrant } = useCredits();

  const amount = welcomeCreditsGrant;
  const visible = amount != null && amount > 0;

  return (
    <SuccessDialog
      visible={visible}
      title={t('credits.welcomeGrantTitle')}
      message={t('credits.welcomeGrantMessage', {
        count: amount ?? 0,
      })}
      confirmLabel={t('credits.welcomeGrantAction')}
      onClose={() => {
        dismissWelcomeCreditsGrant().catch(() => undefined);
      }}
    />
  );
}
