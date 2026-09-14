import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ApiError,
  REQUEST_TIMEOUT_MS,
  getApiErrorMessage,
} from './client.js'

test('API 요청 타임아웃은 콜드 스타트를 고려해 60초 이상이다', () => {
  assert.ok(REQUEST_TIMEOUT_MS >= 60_000)
})

test('API 에러 코드는 사용자용 문구로 변환된다', () => {
  assert.equal(
    getApiErrorMessage(new ApiError({ code: 'INVALID_REQUEST' })),
    '요청 형식이 올바르지 않습니다. 잠시 후 다시 시도해 주세요.',
  )
  assert.match(
    getApiErrorMessage(new ApiError({ kind: 'connection' })),
    /연결할 수 없습니다/,
  )
  assert.match(
    getApiErrorMessage(new ApiError({ kind: 'timeout' })),
    /서버를 깨우는 중이에요/,
  )
})
