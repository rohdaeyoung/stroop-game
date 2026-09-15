import test from 'node:test'
import assert from 'node:assert/strict'
import { isSuccess, SUCCESS_SCORE } from './successRule.js'

test('성공 기준은 5,000점이다', () => {
  assert.equal(SUCCESS_SCORE, 5_000)
})

test('기준 점수와 같으면 성공이다 (경계값)', () => {
  assert.equal(isSuccess(5_000), true)
})

test('기준 점수보다 1점 낮으면 실패다', () => {
  assert.equal(isSuccess(4_999), false)
})

test('0점은 실패다', () => {
  assert.equal(isSuccess(0), false)
})
