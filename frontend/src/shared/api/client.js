// ⚠️ [공용] API 호출 공통 래퍼. BE(고은우) 응답 형식과 맞춰져 있습니다.
const BASE_URL = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({
      code: 'INTERNAL_ERROR',
      message: '서버와 통신할 수 없습니다.',
    }))
    throw error
  }
  return res.json()
}

export const api = {
  /** 점수 제출 → { scoreId, rank, isNewRecord } */
  submitScore: (payload) =>
    request('/scores', { method: 'POST', body: JSON.stringify(payload) }),

  /** 랭킹 조회 → { rankings: [...] } */
  getRankings: (limit = 10) => request(`/rankings?limit=${limit}`),

  /** 내 순위 → { rank, total, percentile } */
  getMyRank: (scoreId) => request(`/rankings/me?scoreId=${scoreId}`),
}
