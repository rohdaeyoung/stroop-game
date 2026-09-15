import assert from 'node:assert/strict'
import test from 'node:test'
import { END_REASON, detectEndReason, formatAccuracy, formatElapsedSeconds } from './resultFlow.js'

test('오답 3회면 WRONG_LIMIT으로 판단한다', () => {
  assert.equal(detectEndReason({ wrongCount: 3, playTimeMs: 5000 }), END_REASON.WRONG_LIMIT)
  assert.equal(detectEndReason({ wrongCount: 4, playTimeMs: 100 }), END_REASON.WRONG_LIMIT)
})

test('총 플레이시간에 가까우면 TOTAL_TIME_UP으로 판단한다', () => {
  assert.equal(detectEndReason({ wrongCount: 0, playTimeMs: 30_000 }), END_REASON.TOTAL_TIME_UP)
  assert.equal(detectEndReason({ wrongCount: 1, playTimeMs: 29_200 }), END_REASON.TOTAL_TIME_UP)
})

test('그 외에는 NO_ANSWER(개별 문제 시간 초과)로 판단한다', () => {
  assert.equal(detectEndReason({ wrongCount: 1, playTimeMs: 8_000 }), END_REASON.NO_ANSWER)
})

test('정확도는 정답/(정답+오답) 백분율을 반올림한다', () => {
  assert.equal(formatAccuracy(24, 2), 92)
  assert.equal(formatAccuracy(0, 0), 0)
  assert.equal(formatAccuracy(1, 0), 100)
})

test('경과 시간은 ms를 초로 반올림한다', () => {
  assert.equal(formatElapsedSeconds(29_600), 30)
  assert.equal(formatElapsedSeconds(500), 1)
})
