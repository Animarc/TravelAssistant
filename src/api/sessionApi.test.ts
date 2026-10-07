import { afterEach, expect, it, vi } from 'vitest';
import { sessionApi } from './sessionApi';
afterEach(()=>vi.unstubAllGlobals());
it.each(['es','en','fr','de','zh','ru','ja'] as const)('sends the selected %s registration language', async language=>{
 const fetch=vi.fn().mockResolvedValue(new Response(JSON.stringify({userId:'test'}))); vi.stubGlobal('fetch',fetch);
 await sessionApi.register('test@example.invalid','Example123!','test_user',language);
 expect(JSON.parse(fetch.mock.calls[0][1].body).preferredLanguage).toBe(language);
});
