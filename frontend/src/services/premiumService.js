import api from './api';

export const premiumService = {
  createCheckoutSession: async (tier, billingCycle) => {
    const response = await api.post('/api/stripe/create-checkout-session', {
      tier,
      billingCycle
    });
    return response.data;
  }
};
