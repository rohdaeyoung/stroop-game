// ⚠️ [공용] API 호출 공통 래퍼. BE(고은우) 응답 형식과 맞춰져 있습니다.
const BASE_URL = '/api'
export const REQUEST_TIMEOUT_MS = 65_000

const ERROR_MESSAGES = Object.freeze({
  INVALID_REQUEST: '요청 형식이 올바르지 않습니다. 잠시 후 다시 시도해 주세요.',
  INVALID_NICKNAME: '닉네임은 1~10자로 입력해 주세요.',
  INVALID_SCORE: '점수를 저장할 수 없습니다. 게임을 다시 시도해 주세요.',
  SCORE_NOT_FOUND: '해당 기록을 찾을 수 없습니다.',
  INTERNAL_ERROR: '서버에 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.',
})

export class ApiError extends Error {
  constructor({ code = 'INTERNAL_ERROR', message, kind = 'server', status = null }) {
    super(message || ERROR_MESSAGES[code] || ERROR_MESSAGES.INTERNAL_ERROR)
    this.name = 'ApiError'
    this.code = code
    this.kind = kind
    this.status = status
  }
}

export function getApiErrorMessage(error) {
  if (error?.kind === 'timeout') {
    return '서버를 깨우는 중이에요... 응답이 늦어지고 있습니다. 잠시 후 다시 시도해 주세요.'
  }
  if (error?.kind === 'connection') {
    return '서버에 연결할 수 없습니다. 네트워크를 확인하고 다시 시도해 주세요.'
  }
  return ERROR_MESSAGES[error?.code] || error?.message || ERROR_MESSAGES.INTERNAL_ERROR
}

async function request(path, options = {}) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new ApiError({
        code: error.code || (res.status === 400 ? 'INVALID_REQUEST' : 'INTERNAL_ERROR'),
        message: error.message,
        kind: 'server',
        status: res.status,
      })
    }
    return res.json()
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error?.name === 'AbortError') {
      throw new ApiError({
        code: 'REQUEST_TIMEOUT',
        kind: 'timeout',
        message: '서버 응답 시간이 초과되었습니다.',
      })
    }
    throw new ApiError({
      code: 'NETWORK_ERROR',
      kind: 'connection',
      message: '서버에 연결할 수 없습니다.',
    })
  } finally {
    clearTimeout(timeoutId)
  }
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
