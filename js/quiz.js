// "Who's who?": find the named face. Ten rounds, no repeats, then a score and the faces you missed.
import * as App from "./app.js";
import { reveal } from "./tours.js";

const ROUNDS = 10, main = document.querySelector("main");
let panel = null, order, n, score, missed, target, answered, timer;

const $ = sel => panel.querySelector(sel);
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);

// Quiz mode: clicks answer instead of opening profiles, and the name tooltip is hidden (see css/tours.css).
function arm(on) {
  document.body.classList.toggle("quiz-on", on);
  App.setClickHandler(on ? answer : null);
}

function begin() {
  order = shuffle(App.people.map(p => p.id)).slice(0, ROUNDS);
  n = score = 0;
  missed = [];
  panel.className = "mode-panel quiz";
  panel.innerHTML = `
    <div class="quiz-head"><span class="quiz-round"></span><span class="quiz-score"></span></div>
    <p class="quiz-prompt" aria-live="polite"></p>
    <p class="quiz-feedback" aria-live="polite"></p>
    <div class="quiz-bar"></div>`;
  arm(true);
  round();
}

function round() {
  clearTimeout(timer);
  target = order[n];
  answered = false;
  App.pin(null);
  $(".quiz-round").textContent = `Round ${n + 1} of ${order.length}`;
  $(".quiz-score").textContent = `Score ${score}`;
  $(".quiz-prompt").innerHTML = `Find <strong>${App.byId[target].name}</strong>`;
  $(".quiz-feedback").textContent = "";
  $(".quiz-bar").innerHTML = `<button data-a="hint">Hint</button><button data-a="skip">Skip</button>`;
}

// id is the clicked face, or null when the player skips.
function answer(id) {
  if (answered) return;
  answered = true;
  const want = App.byId[target], got = App.byId[id], ok = id === target;
  if (ok) score++; else missed.push(target);
  $(".quiz-feedback").innerHTML = ok
    ? `<span class="ok">Correct!</span> That is ${want.name}. <em>${want.tagline}</em>`
    : got
      ? `<span class="bad">Not quite.</span> You clicked ${got.name}. ${want.name} is the other highlighted face.`
      : `<span class="bad">Skipped.</span> ${want.name} is the highlighted face.`;
  $(".quiz-score").textContent = `Score ${score}`;
  const ids = got && !ok ? [id, target] : [target];
  App.pin(ids);
  reveal(ids, panel);
  $(".quiz-bar").innerHTML = `<button data-a="next" class="primary">${n === order.length - 1 ? "See results" : "Next round →"}</button>`;
  $('[data-a="next"]').focus({ preventScroll: true });
  if (ok) timer = setTimeout(next, 1800); // wrong answers wait for the player, who needs time to look
}

function next() {
  clearTimeout(timer);
  if (++n < order.length) round(); else results();
}

function results() {
  arm(false); // names on hover and profiles on click again, so the faces you missed can be explored
  App.pin(missed.length ? missed : null);
  panel.classList.add("done");
  $(".quiz-round").textContent = "Finished";
  $(".quiz-prompt").innerHTML = `You scored <strong>${score} out of ${order.length}</strong>. ${
    score === order.length ? "Flawless." : score >= 7 ? "Impressive." : score >= 4 ? "Not bad." : "Time for another look at the photograph."}`;
  $(".quiz-feedback").textContent = missed.length
    ? `Highlighted: ${missed.map(id => App.byId[id].name).join(", ")}. Hover or click a face to find out more.`
    : "You did not miss a single face.";
  $(".quiz-bar").innerHTML = `<button data-a="again" class="primary">Play again</button>`;
  $('[data-a="again"]').focus({ preventScroll: true });
}

function onClick(e) {
  const b = e.target.closest("button");
  switch (b?.dataset.a) {
    case "hint":
      $(".quiz-feedback").textContent = `Hint: ${App.byId[target].tagline}`;
      b.disabled = true;
      break;
    case "skip": return answer(null);
    case "next": return next();
    case "again": return begin();
  }
}

App.addTool("Who's who?", on => {
  if (on) {
    panel = document.createElement("section");
    panel.setAttribute("aria-label", "Who's who quiz");
    panel.onclick = onClick;
    main.append(panel);
    begin();
  } else {
    clearTimeout(timer);
    arm(false);
    App.pin(null);
    panel?.remove();
    panel = null;
  }
}, "mode");
