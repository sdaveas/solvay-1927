// Owned by the lenses agent. Interpretation camps around the 1927 conference, deliberately simplified.
// Only people whose side is clearly documented are assigned; everyone else falls back to "none".
// camp: "copenhagen" | "skeptic". Each entry needs a one-line note and a source URL.
export const CAMPS = {
  copenhagen: { label: "Copenhagen", color: "#2f8fe0", blurb: "Backed the probabilistic, complementarity-based reading" },
  skeptic: { label: "Skeptic", color: "#e8622c", blurb: "Held that quantum mechanics was incomplete or needed a realist picture" },
  none: { label: "No clear side", color: null, blurb: "Not publicly involved, or no side clearly documented" },
};

const COP = "https://en.wikipedia.org/wiki/Copenhagen_interpretation";

export const STANCES = {
  bohr: { camp: "copenhagen", note: "Originator of complementarity and the interpretation's chief defender against Einstein.", url: COP },
  heisenberg: { camp: "copenhagen", note: "With Born, told the 1927 conference that quantum mechanics was 'a closed theory'.", url: COP },
  born: { camp: "copenhagen", note: "Proposed the probability reading of the wave function (1926); gave the 'closed theory' talk with Heisenberg.", url: COP },
  pauli: { camp: "copenhagen", note: "Among the physicists most associated with Copenhagen-type views; helped shape them in the late 1920s.", url: COP },
  einstein: { camp: "skeptic", note: "Held for life that quantum mechanics was incomplete: 'God does not play dice'.", url: "https://en.wikipedia.org/wiki/Albert_Einstein" },
  schrodinger: { camp: "skeptic", note: "Rejected Born's probability reading; later invented the cat to ridicule it.", url: "https://en.wikipedia.org/wiki/Erwin_Schr%C3%B6dinger" },
  debroglie: { camp: "skeptic", note: "Offered a realist 'pilot-wave' alternative at this conference, then set it aside.", url: "https://en.wikipedia.org/wiki/Louis_de_Broglie" },
  planck: { camp: "skeptic", note: "Rejected the Copenhagen interpretation, with Schrödinger, Laue and Einstein.", url: "https://en.wikipedia.org/wiki/Max_Planck" },
  // Looked at and left unassigned on purpose:
  dirac: { camp: "none", note: "Famously unbothered by questions of interpretation.", url: "https://en.wikipedia.org/wiki/Paul_Dirac" },
  ehrenfest: { camp: "none", note: "Close to both sides; at this conference he reluctantly found Bohr's argument the stronger.", url: "https://en.wikipedia.org/wiki/Paul_Ehrenfest" },
};
