import { DodoPayments } from 'dodopayments';

let dodopaymentsInstance: DodoPayments | null = null;

export const getDodoPayments = () => {
    if (!dodopaymentsInstance) {
        const apiKey = 
            process.env.NODE_ENV === 'development'
                ? process.env.DODO_API_KEY_TEST
                : process.env.DODO_API_KEY_LIVE;

        if (!apiKey) {
            throw new Error('DodoPayments API key is not configured');
        }

        dodopaymentsInstance = new DodoPayments({
            bearerToken: apiKey,
            environment:
                process.env.NODE_ENV === 'development' ? 'test_mode' : 'live_mode'
        });
    }

    return dodopaymentsInstance;
};