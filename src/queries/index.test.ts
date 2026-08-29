import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  deleteWish,
  getMembers,
  getWishes,
  postWish,
  putWish,
  reserveWish,
  resourceUrl,
} from './index.ts'
import type { CreateWishDTO } from '../dto'

function mockFetch(payload: unknown = {}) {
  const fetchMock = vi.fn().mockResolvedValue({
    json: () => Promise.resolve(payload),
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const validInput: CreateWishDTO = {
  memberId: 'a',
  title: 'Drill',
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('resourceUrl', () => {
  it('points at the json-server collection in read/write mode', () => {
    expect(resourceUrl('wishes')).toBe('http://localhost:3000/wishes')
    expect(resourceUrl('members')).toBe('http://localhost:3000/members')
  })

  it('points at a static file under BASE_URL in read-only mode', () => {
    vi.stubEnv('VITE_READONLY', 'true')
    expect(resourceUrl('wishes')).toBe('/wishes.json')
    expect(resourceUrl('members')).toBe('/members.json')
  })
})

describe('getMembers / getWishes', () => {
  it('fetch their collections', async () => {
    const fetchMock = mockFetch([{ id: 'a' }])

    await expect(getMembers()).resolves.toEqual([{ id: 'a' }])
    await expect(getWishes()).resolves.toEqual([{ id: 'a' }])
    const urls = fetchMock.mock.calls.map(([url]) => url)
    expect(urls).toContain('http://localhost:3000/members')
    expect(urls).toContain('http://localhost:3000/wishes')
  })
})

describe('postWish', () => {
  it('posts the parsed body with reservation defaults', async () => {
    const fetchMock = mockFetch({ id: 'w1' })

    await postWish({ ...validInput, title: '  Drill  ' as string })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('http://localhost:3000/wishes')
    expect(init.method).toBe('POST')
    const body = JSON.parse(init.body)
    expect(body).toMatchObject({
      memberId: 'a',
      reservedBy: null,
      reservedAt: null,
    })
    expect(body.createdAt).toEqual(expect.any(String))
  })

  it('rejects invalid input without calling fetch', async () => {
    const fetchMock = mockFetch()
    await expect(postWish({ memberId: 'a', title: '' })).rejects.toBeDefined()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects in read-only mode', async () => {
    vi.stubEnv('VITE_READONLY', 'true')
    const fetchMock = mockFetch()
    await expect(postWish(validInput)).rejects.toThrow('read-only')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('putWish', () => {
  it('patches the wish at its id', async () => {
    const fetchMock = mockFetch({ id: 'w1' })

    await putWish({ id: 'w1', title: 'New' })

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/wishes/w1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ id: 'w1', title: 'New' }),
      }),
    )
  })

  it('rejects in read-only mode', async () => {
    vi.stubEnv('VITE_READONLY', 'true')
    const fetchMock = mockFetch()
    await expect(putWish({ id: 'w1' })).rejects.toThrow('read-only')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('deleteWish', () => {
  it('issues a DELETE at the wish id', async () => {
    const fetchMock = mockFetch()
    await deleteWish('w1')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/wishes/w1',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('rejects in read-only mode', async () => {
    vi.stubEnv('VITE_READONLY', 'true')
    const fetchMock = mockFetch()
    await expect(deleteWish('w1')).rejects.toThrow('read-only')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('VITE_API_TOKEN', () => {
  it('adds a bearer header to every request when set', async () => {
    vi.stubEnv('VITE_API_TOKEN', 'sekret')
    const fetchMock = mockFetch([])

    await getMembers()
    await postWish(validInput)

    for (const [, init] of fetchMock.mock.calls) {
      expect(init.headers).toMatchObject({ Authorization: 'Bearer sekret' })
    }
  })

  it('sends no Authorization header when empty', async () => {
    const fetchMock = mockFetch([])
    await getWishes()
    const [, init] = fetchMock.mock.calls[0]
    expect(init?.headers ?? {}).not.toHaveProperty('Authorization')
  })
})

describe('reserveWish', () => {
  it('patches reservedBy and a timestamp when claiming', async () => {
    const fetchMock = mockFetch({ id: 'w1' })

    await reserveWish({ id: 'w1', reservedBy: 'a' })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('http://localhost:3000/wishes/w1')
    expect(init.method).toBe('PATCH')
    const body = JSON.parse(init.body)
    expect(body.reservedBy).toBe('a')
    expect(body.reservedAt).toEqual(expect.any(String))
  })

  it('clears the timestamp when releasing', async () => {
    const fetchMock = mockFetch({ id: 'w1' })

    await reserveWish({ id: 'w1', reservedBy: null })

    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body).toEqual({ reservedBy: null, reservedAt: null })
  })

  it('rejects in read-only mode', async () => {
    vi.stubEnv('VITE_READONLY', 'true')
    const fetchMock = mockFetch()
    await expect(reserveWish({ id: 'w1', reservedBy: 'a' })).rejects.toThrow(
      'read-only',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
