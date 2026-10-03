import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runInNewContext } from 'node:vm'
import { describe, expect, it, vi } from 'vitest'

const source = readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8')
function harness({ precacheFailure = false, manifestAvailable = true } = {}) {
  const handlers = {}
  const addAll = vi.fn(async () => { if (precacheFailure) throw new Error('Offline') })
  const cachedAsset = { ok: true }
  const match = vi.fn(async (_request, options) => options?.ignoreVary ? cachedAsset : undefined)
  const caches = { open: vi.fn(async () => ({ addAll, match })), keys: async () => ['farmsim-sw-v0.3.0', 'farmsim-sw-v0.3.1', 'other-app-cache'], delete: vi.fn(async () => true) }
  const self = { location: { hostname: 'farm.example', href: 'https://farm.example/sw.js' }, addEventListener: (name, handler) => { handlers[name] = handler }, skipWaiting: vi.fn(async () => {}), clients: { claim: vi.fn(async () => {}) } }
  const fetch = vi.fn(async () => ({ ok: manifestAvailable, json: async () => ({ entry: { file: 'assets/game-123.js', css: ['assets/game-123.css'] }, lazy: { file: 'assets/lazy-456.js', assets: ['assets/item-456.webp'] } }) }))
  runInNewContext(source, { self, caches, fetch, URL })
  const run = async (name) => { let work; handlers[name]({ waitUntil: (promise) => { work = promise } }); await work }
  const request = async (url) => { let response; handlers.fetch({ request: { url, method: 'GET', mode: 'cors' }, respondWith: (promise) => { response = promise } }); return await response }
  return { run, request, self, fetch, addAll, caches, match, cachedAsset }
}

describe('First-install offline shell', () => {
  it('caches runtime JavaScript, CSS, lazy bundles, and art before activating', async () => {
    const worker = harness()
    await worker.run('install')
    expect(worker.addAll.mock.calls[0][0]).toEqual(expect.arrayContaining(['./index.html', './assets/game-123.js', './assets/game-123.css', './assets/lazy-456.js', './assets/item-456.webp']))
    expect(worker.self.skipWaiting).toHaveBeenCalledOnce()
  })
  it.each([{ precacheFailure: true }, { manifestAvailable: false }])('keeps the previous worker when required resources cannot be cached: %j', async (failure) => {
    const worker = harness(failure)
    await expect(worker.run('install')).rejects.toThrow()
    expect(worker.self.skipWaiting).not.toHaveBeenCalled()
  })
  it('prunes only FarmSim caches during an update', async () => {
    const worker = harness()
    await worker.run('activate')
    expect(worker.caches.delete.mock.calls).toEqual([['farmsim-sw-v0.3.0']])
  })
  it('serves prefetched same-origin bundles despite Origin header variation', async () => {
    const worker = harness()
    expect(await worker.request('https://farm.example/assets/game-123.js')).toBe(worker.cachedAsset)
    expect(worker.match).toHaveBeenCalledWith(expect.anything(), { ignoreVary: true })
  })
  it.each(['https://other.example/assets/game.js', 'https://farm.example/account'])('preserves Vary for unrelated requests: %s', async (url) => {
    const worker = harness()
    await worker.request(url)
    expect(worker.match).toHaveBeenCalledWith(expect.anything(), { ignoreVary: false })
  })
})
