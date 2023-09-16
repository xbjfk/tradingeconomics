import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import symbols from '$lib/symbols';

export const load: PageServerLoad = async ({ params }) => {
    console.log(symbols)
    throw redirect(307, '/' + Object.keys(symbols)[0])
};
