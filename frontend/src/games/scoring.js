/** Map raw metrics to 0–100 score and performance band (aligned with CHILD_TEST_FEATURE.md). */

export function performanceLevel(score) {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'average';
  return 'needs_improvement';
}

export function scoreFromTime(seconds, excellent = 30, good = 45, average = 60) {
  if (seconds <= excellent) return 95;
  if (seconds <= good) return 75;
  if (seconds <= average) return 55;
  return Math.max(20, 55 - Math.floor((seconds - average) / 5) * 5);
}

export function scoreFromAccuracy(correct, total) {
  if (!total) return 50;
  return Math.round((correct / total) * 100);
}

export function buildResult(testType, testData, score) {
  return {
    test_type: testType,
    score,
    performance_level: performanceLevel(score),
    test_data: testData,
  };
}
