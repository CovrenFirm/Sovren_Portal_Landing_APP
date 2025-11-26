import { useState } from 'react';

export type SubscriptionTier = 'SOLO' | 'PROFESSIONAL' | 'BUSINESS';

interface UseSubscriptionReturn {
    startTrial: (tier: SubscriptionTier) => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

export function useSubscription(): UseSubscriptionReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startTrial = async (tier: SubscriptionTier) => {
        setIsLoading(true);
        setError(null);

        try {
            // In a real scenario, we might need to get the subscriber_id from auth context
            // For the landing page, we might be creating a new subscriber or redirecting to a checkout
            // that handles registration.
            // Based on the API contract: POST /api/create-checkout

            const response = await fetch('/api/subscribers/api/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tier,
                }),
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
