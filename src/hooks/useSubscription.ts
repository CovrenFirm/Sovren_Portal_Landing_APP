import { useState } from 'react';

export type SubscriptionTier = 'SOLO' | 'PROFESSIONAL' | 'BUSINESS';

interface UseSubscriptionReturn {
    startTrial: (tier: SubscriptionTier, email?: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

export function useSubscription(): UseSubscriptionReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startTrial = async (tier: SubscriptionTier, email?: string) => {
        setIsLoading(true);
        setError(null);

        try {
            // If no email provided, use a placeholder or prompt user
            const subscriberEmail = email || 'trial@sovrenai.app';

            // API expects: POST /api/create-checkout?email={email}&tier={tier}
            const response = await fetch(`/api/subscribers/api/create-checkout?email=${encodeURIComponent(subscriberEmail)}&tier=${tier}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', response.status, errorText);
                throw new Error(`Failed to start trial: ${response.status} ${errorText}`);
            }

            const data = await response.json();

            if (data.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
                console.error('No checkout URL returned', data);
                setError('Configuration error: No checkout URL returned');
            }
        } catch (err) {
            console.error('Error starting trial:', err);
            setError('Failed to initialize checkout. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return { startTrial, isLoading, error };
}
