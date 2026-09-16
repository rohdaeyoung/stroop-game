import test from 'node:test'
import assert from 'node:assert/strict'
import { applyMiss, MAX_LIVES } from './lifeRule.js'

test('오답 1회로는 게임이 끝나지 않는다', () => {
  const r = applyMiss({ score: 1000, lives: 3, wrongCount: 0, isMiss: false })
  assert.equal(r.isGameOver, false)
  assert.equal(r.lives, 2)
  assert.equal(r.wrongCount, 1)
})

test('미응답 1회로도 게임이 끝나지 않는다', () => {
  const r = applyMiss({ score: 1000, lives: 3, wrongCount: 0, isMiss: true })
  assert.equal(r.isGameOver, false)
  assert.equal(r.lives, 2)
})

test('오답·미응답을 합쳐 3회가 되면 게임이 끝난다', () => {
  let s = { score: 1000, lives: MAX_LIVES, wrongCount: 0 }
  s = { ...s, ...applyMiss({ ...s, isMiss: true }) }   // 1회: 미응답
  assert.equal(s.isGameOver, false)
  s = { ...s, ...applyMiss({ ...s, isMiss: false }) }  // 2회: 오답
  assert.equal(s.isGameOver, false)
  s = { ...s, ...applyMiss({ ...s, isMiss: true }) }   // 3회: 미응답
  assert.equal(s.isGameOver, true)
  assert.equal(s.lives, 0)
  assert.equal(s.wrongCount, 3)
})

test('오답은 50점을 깎는다', () => {
  assert.equal(applyMiss({ score: 1000, lives: 3, wrongCount: 0, isMiss: false }).score, 950)
})

test('미응답은 점수를 깎지 않는다', () => {
  assert.equal(applyMiss({ score: 1000, lives: 3, wrongCount: 0, isMiss: true }).score, 1000)
})

test('점수는 0 아래로 내려가지 않는다', () => {
  assert.equal(applyMiss({ score: 20, lives: 3, wrongCount: 0, isMiss: false }).score, 0)
})
