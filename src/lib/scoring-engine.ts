/**
 * CustomerFirst Portfolio Scoring Engine
 * 
 * Data-driven scoring module. All scoring rules come from the database (tests, dimensions).
 * 
 * Flow:
 *   responses (1-5 per test) 
 *   -> per-test weighted score 
 *   -> per-dimension weighted subtotal 
 *   -> overall weighted score (0-100) 
 *   -> outcome (IN / CONDITIONAL / OUT)
 * 
 * Gates: Tests marked as gates can force CONDITIONAL or OUT regardless of score.
 */

export interface DimensionDef {
  id: string;
  key: string;
  name: string;
  description?: string;
  weight: number;
}

export interface TestDef {
  id: string;
  dimension_id: string;
  key: string;
  label: string;
  description?: string;
  guidance?: string;
  input_type: string; // 'scale_1_5' | 'boolean' | 'multi_select' | 'text'
  scale_min: number;
  scale_max: number;
  weight: number;
  is_gate: boolean;
  gate_rule_json: GateRule | null;
  scoring_rule_json: ScoringRule | null;
}

export interface GateRule {
  /** If score <= threshold, trigger the gate */
  threshold: number;
  /** 'hard' = OUT, 'conditional' = CONDITIONAL */
  severity: 'hard' | 'conditional';
  message: string;
}

export interface ScoringRule {
  /** For future extensibility — e.g. non-linear mappings */
  type?: string;
}

export interface TestResponse {
  test_id: string;
  /** Numeric value 1-5 for scale, 0/1 for boolean, etc. */
  value: number;
}

export interface DimensionScore {
  dimension_id: string;
  dimension_key: string;
  dimension_name: string;
  raw_score: number;
  weighted_score: number;
  max_possible: number;
  percentage: number;
  test_scores: Array<{
    test_id: string;
    test_key: string;
    test_label: string;
    value: number;
    normalised: number;
    weighted: number;
  }>;
}

export interface GateTriggered {
  test_id: string;
  test_key: string;
  test_label: string;
  value: number;
  threshold: number;
  severity: 'hard' | 'conditional';
  message: string;
}

export interface ScoringResult {
  overall_score: number;
  dimension_scores: DimensionScore[];
  outcome: 'IN' | 'CONDITIONAL' | 'OUT';
  gates_triggered: GateTriggered[];
  rationale: string;
  strengths: string[];
  concerns: string[];
  recommended_next_steps: string[];
}

/** Thresholds for outcome determination */
const THRESHOLDS = {
  IN: 65,
  CONDITIONAL: 45,
};

/**
 * Normalise a raw score to 0-1 range
 */
function normalise(value: number, min: number, max: number): number {
  if (max === min) return 1;
  return (value - min) / (max - min);
}

/**
 * Main scoring function.
 */
export function computeScores(
  dimensions: DimensionDef[],
  tests: TestDef[],
  responses: TestResponse[]
): ScoringResult {
  const responseMap = new Map(responses.map(r => [r.test_id, r.value]));
  const gatesTriggered: GateTriggered[] = [];

  // Group tests by dimension
  const testsByDimension = new Map<string, TestDef[]>();
  for (const t of tests) {
    const list = testsByDimension.get(t.dimension_id) || [];
    list.push(t);
    testsByDimension.set(t.dimension_id, list);
  }

  // Calculate per-dimension scores
  const dimensionScores: DimensionScore[] = [];
  let totalDimensionWeight = 0;
  let weightedOverall = 0;

  for (const dim of dimensions) {
    const dimTests = testsByDimension.get(dim.id) || [];
    let dimWeightedSum = 0;
    let dimMaxWeighted = 0;
    const testScores: DimensionScore['test_scores'] = [];

    for (const test of dimTests) {
      const rawValue = responseMap.get(test.id) ?? 0;
      const norm = normalise(rawValue, test.scale_min, test.scale_max);
      const weighted = norm * test.weight;
      const maxWeighted = 1 * test.weight;

      dimWeightedSum += weighted;
      dimMaxWeighted += maxWeighted;

      testScores.push({
        test_id: test.id,
        test_key: test.key,
        test_label: test.label,
        value: rawValue,
        normalised: norm,
        weighted,
      });

      // Check gates
      if (test.is_gate && test.gate_rule_json) {
        const gate = test.gate_rule_json;
        if (rawValue <= gate.threshold) {
          gatesTriggered.push({
            test_id: test.id,
            test_key: test.key,
            test_label: test.label,
            value: rawValue,
            threshold: gate.threshold,
            severity: gate.severity,
            message: gate.message,
          });
        }
      }
    }

    const percentage = dimMaxWeighted > 0 ? (dimWeightedSum / dimMaxWeighted) * 100 : 0;

    dimensionScores.push({
      dimension_id: dim.id,
      dimension_key: dim.key,
      dimension_name: dim.name,
      raw_score: dimWeightedSum,
      weighted_score: dimWeightedSum * dim.weight,
      max_possible: dimMaxWeighted,
      percentage,
      test_scores: testScores,
    });

    weightedOverall += percentage * dim.weight;
    totalDimensionWeight += dim.weight;
  }

  // Overall score (0-100)
  const overall_score = totalDimensionWeight > 0
    ? Math.round((weightedOverall / totalDimensionWeight) * 10) / 10
    : 0;

  // Determine outcome based on gates first, then thresholds
  let outcome: 'IN' | 'CONDITIONAL' | 'OUT';
  const hasHardGate = gatesTriggered.some(g => g.severity === 'hard');
  const hasConditionalGate = gatesTriggered.some(g => g.severity === 'conditional');

  if (hasHardGate) {
    outcome = 'OUT';
  } else if (hasConditionalGate || overall_score < THRESHOLDS.IN) {
    outcome = overall_score >= THRESHOLDS.CONDITIONAL ? 'CONDITIONAL' : 'OUT';
  } else {
    outcome = 'IN';
  }

  // Flatten all test scores for ranking
  const allTestScores = dimensionScores.flatMap(d =>
    d.test_scores.map(t => ({ ...t, dimension_name: d.dimension_name }))
  );
  const sorted = [...allTestScores].sort((a, b) => b.normalised - a.normalised);

  const strengths = sorted.slice(0, 3).map(
    t => `${t.test_label}: scored ${t.value} (${t.dimension_name})`
  );
  const concerns = [...allTestScores]
    .sort((a, b) => a.normalised - b.normalised)
    .slice(0, 3)
    .map(t => `${t.test_label}: scored ${t.value} (${t.dimension_name})`);

  // Build rationale
  const rationaleLines: string[] = [];
  if (gatesTriggered.length > 0) {
    rationaleLines.push(`${gatesTriggered.length} gate(s) triggered:`);
    for (const g of gatesTriggered) {
      rationaleLines.push(`  - ${g.test_label}: ${g.message} (scored ${g.value}, threshold ${g.threshold})`);
    }
  }
  rationaleLines.push(`Overall score: ${overall_score}/100 (threshold for IN: ${THRESHOLDS.IN}, CONDITIONAL: ${THRESHOLDS.CONDITIONAL})`);

  // Recommended next steps
  const recommended_next_steps: string[] = [];
  if (outcome === 'OUT') {
    recommended_next_steps.push('Review gate failures and assess whether constraints can be addressed.');
    recommended_next_steps.push('Consider re-scoping the project to address lowest-scoring areas.');
  } else if (outcome === 'CONDITIONAL') {
    recommended_next_steps.push('Develop mitigation plans for conditional gates.');
    recommended_next_steps.push('Schedule follow-up assessment at next checkpoint.');
    recommended_next_steps.push('Engage sponsors to address weakest dimensions.');
  } else {
    recommended_next_steps.push('Proceed to next delivery phase.');
    recommended_next_steps.push('Monitor lowest-scoring areas during delivery.');
    recommended_next_steps.push('Schedule assessment at next checkpoint.');
  }

  return {
    overall_score,
    dimension_scores: dimensionScores,
    outcome,
    gates_triggered: gatesTriggered,
    rationale: rationaleLines.join('\n'),
    strengths,
    concerns,
    recommended_next_steps,
  };
}
