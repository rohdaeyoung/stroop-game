import assert from 'node:assert/strict'
import test from 'node:test'
import { getDifficulty } from './difficulty.js'

test('모든 난이도에서 네 색상 선택지를 보여준다', () => {
  for (const correctCount of [0, 9, 10, 19, 20, 29, 30, 39, 40, 100]) {
    assert.equal(getDifficulty(correctCount).choiceCount, 4)
  }
})
