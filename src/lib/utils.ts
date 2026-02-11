export const getURL = () => {
    let url =
        process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production
        process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel for preview deployments
        'http://localhost:3000/';

    // Make sure to include `https://` when not localhost
    url = url.includes('http') ? url : `https://${url}`;

    // Make sure to include a trailing slash
    url = url.endsWith('/') ? url : `${url}/`;

    return url;
};
