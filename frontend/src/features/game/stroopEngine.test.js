import assert from 'node:assert/strict'
import test from 'node:test'
import { MODE } from '../../shared/constants/colors.js'
import { createQuiz, MODE_PROBABILITY } from './stroopEngine.js'

test('모드 출제 비율은 70:30으로 설정되어 있다', () => {
  assert.equal(MODE_PROBABILITY[MODE.COLOR], 0.7)
  assert.equal(MODE_PROBABILITY[MODE.WORD], 0.3)
  assert.equal(
    MODE_PROBABILITY[MODE.COLOR] + MODE_PROBABILITY[MODE.WORD],
    1,
  )
})

test('여러 문제를 생성하면 색 모드가 대략 70%로 나온다', () => {
  const sampleSize = 10_000
  let colorModeCount = 0

  for (let i = 0; i < sampleSize; i += 1) {
    if (createQuiz(3).mode === MODE.COLOR) colorModeCount += 1
  }

  const colorModeRatio = colorModeCount / sampleSize
  assert.ok(
    colorModeRatio >= 0.67 && colorModeRatio <= 0.73,
    `관측된 색 모드 비율: ${(colorModeRatio * 100).toFixed(2)}%`,
  )
})
