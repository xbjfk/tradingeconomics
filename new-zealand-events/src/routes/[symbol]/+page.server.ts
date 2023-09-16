import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import 'dotenv/config';
import symbols from '$lib/symbols';

export const load: PageServerLoad = async ({ params }) => {
    if (Object.keys(symbols).indexOf(params.symbol) == -1) {
        throw error(404, "Not found")
    }
    let now = new Date();
    let oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    const api_key = process.env.TRADINGECONOMICS_API_KEY

    const d1 = oneMonthAgo.toISOString().split('T')[0]
    const d2 = now.toISOString().split('T')[0]
    const nzdusdURL = `https://api.tradingeconomics.com/markets/historical/${params.symbol}?c=${api_key}&d1=${d1}`
    // This endpoint needs d2 for some reason
    const nzNewsURL = `https://api.tradingeconomics.com/news/country/New%20Zealand/${encodeURIComponent(symbols[params.symbol])}?c=${api_key}&d1=${d1}&d2=${d2}`

    const nzdusd = await fetch(
        nzdusdURL
    )

    const nzNews = await fetch(
        nzNewsURL
    )

    if (!nzdusd.ok) {
        throw error(nzdusd.status, {message: "Call to tradingeconomics.com failed: " + nzdusd.statusText})
    }
    if (!nzNews.ok) {
        throw error(nzNews.status, {message: "Call to tradingeconomics.com failed: " + nzNews.statusText})
    }

    return {
        nzdusd: (await nzdusd.json()).slice(0,-1),
        nzNews: (await nzNews.json()).slice(0,-1),
        oneMonthAgo,
        now
    };
};
