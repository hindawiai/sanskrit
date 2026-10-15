/**
 * Two-way grammar. The same operation definition is the production.
 * Forward applies it. Inverse recovers the inputs it could have consumed.
 * A candidate is kept only when the forward rule regenerates the surface.
 */
import { applyRule, applySandhiRule } from "./execute.js";

const UPASARGA_A = Object.freeze(["pra", "parā", "upa", "apa", "ava"]);

export function forward(left, right, context, rule) {
  const sandhi = applySandhiRule(left, right, context, rule);
  if (sandhi) return sandhi;
  if (!rule?.operation?.map) return null;
  return applyRule(left, right, rule);
}

function inversePararupa(surface, context, rule) {
  if (context?.upasarga !== true || context?.dhatu !== true) return [];
  const out = [];
  for (const upa of UPASARGA_A) {
    const stem = upa.slice(0, -1);
    if (!surface.startsWith(stem) || surface.length <= stem.length) continue;
    const initial = surface[stem.length];
    if (initial !== "e" && initial !== "o") continue;
    const right = surface.slice(stem.length);
    const regenerated = forward(upa, right, context, rule);
    if (regenerated?.output === surface) {
      out.push({
        rule: rule.id,
        direction: "inverse",
        left: upa,
        right,
        surface,
        trace: regenerated.trace,
      });
    }
  }
  return out;
}

export function inverse(surface, context, rule) {
  const op = rule?.operation;
  if (!op || op.status !== "executable_tested") return [];
  if (op.mode === "upasarga_final_a_before_dhatu_initial_en_pararupa") {
    return inversePararupa(surface, context, rule);
  }
  return [];
}

export function roundTrip(left, right, context, rule) {
  const generated = forward(left, right, context, rule);
  if (!generated) return { status: "NO_FORWARD", left, right };
  const recovered = inverse(generated.output, context, rule);
  const hit = recovered.find((c) => c.left === left && c.right === right);
  return {
    status: hit ? "ROUND_TRIP" : "FORWARD_ONLY",
    output: generated.output,
    rule: rule.id,
    recovered,
  };
}
