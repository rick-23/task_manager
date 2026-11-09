import { urlBase64ToUint8Array } from '../pushUtils';

jest.mock('../apiUtils', () => ({ post: jest.fn() }));

describe('urlBase64ToUint8Array', () => {
    it('decodes base64url without padding', () => {
        // "hello?>" -> base64 "aGVsbG8/Pg==" -> base64url "aGVsbG8_Pg"
        expect(Array.from(urlBase64ToUint8Array('aGVsbG8_Pg'))).toEqual([...'hello?>'].map(c => c.charCodeAt(0)));
    });
});
