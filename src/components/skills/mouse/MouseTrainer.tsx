'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import { LEVEL_IDS, isLevelPassed } from './levelRules';
import { useMouseProgress } from './useMouseProgress';
import { usePracticeStore } from './usePracticeStore';
import { startSkill, type Stop } from './practiceSkills';
import {
  BREAK_SECONDS,
  DAILY_GOAL_MINUTES,
  DAILY_MIX_ROUNDS,
  MIXED_JOB,
  ROUND_SECONDS,
  SKILLS,
  SKILL_IDS,
  ZONE_NAMES,
  accuracyOf,
  addRound,
  adjustLevel,
  compareWithLast,
  dayKey,
  followSpeed,
  freshZones,
  isSlow,
  mainScore,
  MAX_LEVEL,
  minutesToday,
  mixAt,
  suggestedSkills,
  troubleRate,
  weakestZone,
  type PickId,
  type RoundRecord,
  type RoundResult,
  type SkillId,
  type ZoneCount,
  withLevel,
} from './practiceRules';

// Mouse practice (/mouse-practice): pick a skill and keep going. Rounds of 30 seconds follow one after
// another, the level adjusts to the person, and a 3 x 3 map shows where on the screen they have most trouble.
// The skills themselves are drawn by practiceSkills.ts; the numbers and saved data are in practiceRules.ts.

type Phase = 'idle' | 'running' | 'break' | 'finished';

type RunState = { sk: SkillId; level: number; startAt: number; hits: number; misses: number; times: number[]; onS: number; offS: number };

type Stats = { left: number; hits: number; acc: number | null; avg: number | null; onS: number; level: number };

type ResultView = {
  sk: SkillId;
  level: number;
  hits: number;
  acc: number | null;
  avg: number | null;
  onS: number;
  newLevel: number;
  change: -1 | 0 | 1;
  prev: { diff: number; unit: 'hits' | 'points' } | null;
};

const EMPTY_STATS: Stats = { left: ROUND_SECONDS, hits: 0, acc: null, avg: null, onS: 0, level: 0 };

const AIM_LABELS: Record<string, string> = {
  large: 'Classic, large',
  medium: 'Classic, medium',
  small: 'Classic, small',
  'moving-large': 'Moving, large',
  'moving-medium': 'Moving, medium',
  'moving-small': 'Moving, small',
  shrinking: 'Shrinking',
};

const mean = (a: number[]) => (a.length ? Math.round(a.reduce((s, v) => s + v, 0) / a.length) : null);

export default function MouseTrainer() {
  const { progress, ready } = useMouseProgress();
  const { store, current, save } = usePracticeStore();
  const done = progress.done[progress.device];
  const levelsPassed = useMemo(() => LEVEL_IDS.filter((l) => isLevelPassed(l, done)).length, [done]);
  const suggested = useMemo(() => suggestedSkills(levelsPassed), [levelsPassed]);

  const [pick, setPick] = useState<PickId>('click');
  const [phase, setPhase] = useState<Phase>('idle');
  const [dailyN, setDailyN] = useState<number | null>(null);
  const [skill, setSkill] = useState<SkillId>('click');
  const [upcoming, setUpcoming] = useState<SkillId>('click');
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [count, setCount] = useState(BREAK_SECONDS);
  const [result, setResult] = useState<ResultView | null>(null);
  const [zones, setZones] = useState<ZoneCount[]>(() => freshZones());
  const [notice, setNotice] = useState<string | null>(null);

  const arenaRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const run = useRef<RunState | null>(null);
  const stopSkill = useRef<Stop | null>(null);
  const tick = useRef(0);
  const zonesRef = useRef<ZoneCount[]>(freshZones());
  const mixIdx = useRef(0);
  const pickRef = useRef<PickId>('click');
  const dailyRef = useRef<number | null>(null);
  const suggestedRef = useRef<SkillId[]>(suggested);

  useEffect(() => {
    suggestedRef.current = suggested;
  }, [suggested]);

  // Leaving the page stops the round.
  useEffect(
    () => () => {
      window.clearInterval(tick.current);
      stopSkill.current?.();
    },
    [],
  );

  const planNext = useCallback((): SkillId => {
    const mixing = pickRef.current === 'mixed' || dailyRef.current !== null;
    return mixing ? mixAt(suggestedRef.current, mixIdx.current) : (pickRef.current as SkillId);
  }, []);

  const endRound = useCallback(() => {
    const r = run.current;
    if (!r) return;
    window.clearInterval(tick.current);
    stopSkill.current?.();
    stopSkill.current = null;
    if (layerRef.current) layerRef.current.innerHTML = '';
    run.current = null;

    // A round where nothing was tried means the person has probably left. Stop here instead of looping forever:
    // nothing is saved, the level stays, and no finish event is sent.
    if (r.hits + r.misses === 0 && r.onS === 0) {
      dailyRef.current = null;
      setDailyN(null);
      setStats((s) => ({ ...s, left: ROUND_SECONDS }));
      setNotice('Paused: nothing was tried in that round, so the rounds stopped. Press Start when you are ready.');
      setPhase('idle');
      return;
    }

    const res: RoundResult = { hits: r.hits, misses: r.misses, onSeconds: r.onS, offSeconds: r.offS };
    const move = adjustLevel(r.sk, r.level, res);
    const acc = accuracyOf(r.sk, res);
    const main = mainScore(r.sk, res);
    const saved = current();
    const prev = compareWithLast(saved.rounds, r.sk, main);
    const rec: RoundRecord = { skill: r.sk, level: r.level, main, acc, at: Date.now() };
    save(addRound(saved, rec, move.level, ROUND_SECONDS, dayKey()));
    trackEvent('mouse_round_complete', { skill: r.sk, level: r.level, hits: r.hits, accuracy: acc ?? 0 });

    setZones(zonesRef.current.map((z) => ({ ...z })));
    setResult({ sk: r.sk, level: r.level, hits: r.hits, acc, avg: mean(r.times), onS: r.onS, newLevel: move.level, change: move.change, prev });
    setStats((s) => ({ ...s, left: ROUND_SECONDS }));

    if (dailyRef.current !== null) {
      dailyRef.current += 1;
      setDailyN(dailyRef.current);
      if (dailyRef.current >= DAILY_MIX_ROUNDS) {
        dailyRef.current = null;
        setPhase('finished');
        return;
      }
    }
    setUpcoming(planNext());
    setCount(BREAK_SECONDS);
    setPhase('break');
  }, [current, save, planNext]);

  const startRound = useCallback(
    (sk: SkillId) => {
      const arena = arenaRef.current;
      const layer = layerRef.current;
      if (!arena || !layer) return;
      layer.innerHTML = '';
      const level = current().levels[sk];
      const r: RunState = { sk, level, startAt: performance.now(), hits: 0, misses: 0, times: [], onS: 0, offS: 0 };
      run.current = r;
      setSkill(sk);
      setPhase('running');
      setStats({ ...EMPTY_STATS, level });
      trackEvent('mouse_round_start', { skill: sk, level });
      const rec = (zone: number, fail: boolean) => {
        zonesRef.current[zone].n++;
        if (fail) zonesRef.current[zone].f++;
      };
      stopSkill.current = startSkill(sk, {
        arena,
        layer,
        level,
        elapsed: () => (performance.now() - r.startAt) / 1000,
        hit: (ms, zone) => {
          rec(zone, isSlow(ms, r.times));
          r.times.push(ms);
          r.hits++;
        },
        miss: (zone) => {
          r.misses++;
          rec(zone, true);
        },
        follow: (dt, on) => {
          if (on) r.onS += dt;
          else r.offS += dt;
        },
        sample: (on, zone) => rec(zone, !on),
      });
      window.clearInterval(tick.current);
      tick.current = window.setInterval(() => {
        const el = (performance.now() - r.startAt) / 1000;
        const res: RoundResult = { hits: r.hits, misses: r.misses, onSeconds: r.onS, offSeconds: r.offS };
        setStats({ left: Math.max(0, Math.ceil(ROUND_SECONDS - el)), hits: r.hits, acc: accuracyOf(sk, res), avg: mean(r.times), onS: r.onS, level });
        if (el >= ROUND_SECONDS) endRound();
      }, 100);
    },
    [current, endRound],
  );

  const begin = useCallback(() => {
    setNotice(null);
    const sk = planNext();
    if (pickRef.current === 'mixed' || dailyRef.current !== null) mixIdx.current++;
    startRound(sk);
  }, [planNext, startRound]);

  // The short break between rounds counts down, then the next round starts by itself.
  useEffect(() => {
    if (phase !== 'break') return;
    const id = window.setTimeout(() => {
      if (count <= 1) begin();
      else setCount((c) => c - 1);
    }, 1000);
    return () => window.clearTimeout(id);
  }, [phase, count, begin]);

  const choose = (k: PickId) => {
    if (phase === 'running') return;
    pickRef.current = k;
    dailyRef.current = null;
    setDailyN(null);
    setNotice(null);
    setPick(k);
    setPhase('idle');
  };

  // The person can pick any level before a round; the game then keeps adjusting from there.
  const canPickLevel = phase === 'idle' && pick !== 'mixed';
  const pickLevel = (n: number) => {
    if (!canPickLevel) return;
    save(withLevel(current(), pick, n));
  };

  const stop = () => {
    dailyRef.current = null;
    setDailyN(null);
    setPhase('idle');
  };

  const startDaily = () => {
    dailyRef.current = 0;
    setDailyN(0);
    pickRef.current = 'mixed';
    setPick('mixed');
    mixIdx.current = 0;
    begin();
  };

  const running = phase === 'running';
  const showSkill: SkillId | null = running || phase === 'break' ? skill : pick === 'mixed' ? null : pick;
  const follows = running && skill === 'follow';
  const levelShown = running ? stats.level : pick === 'mixed' ? null : store.levels[pick];
  const today = dayKey();
  const minutes = ready ? minutesToday(store, today) + (running ? (ROUND_SECONDS - stats.left) / 60 : 0) : 0;
  // One list: the skills that match the lessons passed come first, the harder ones after.
  const ordered = [...suggested, ...SKILL_IDS.filter((k) => !suggested.includes(k))];
  const weak = weakestZone(zones);
  const bests = Object.entries(progress.best).filter(([k, v]) => k in AIM_LABELS && v > 0);

  const name = dailyN !== null ? "Today's 5-minute mix" : showSkill ? SKILLS[showSkill].name : 'Mixed';
  const job = showSkill ? SKILLS[showSkill].job : MIXED_JOB;

  const skillButton = (k: SkillId) => (
    <button
      key={k}
      type="button"
      className={`mt-sk${suggested.includes(k) ? '' : ' mt-hard'}`}
      aria-pressed={k === pick && dailyN === null}
      disabled={running}
      title={suggested.includes(k) ? SKILLS[k].blurb : `${SKILLS[k].blurb}. A harder skill: you can still try it.`}
      onClick={() => choose(k)}
    >
      {SKILLS[k].name}
    </button>
  );

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mt-grid mt-pickers" role="group" aria-label="Skill">
        <button
          type="button"
          className="mt-sk mt-mix"
          aria-pressed={pick === 'mixed' && dailyN === null}
          disabled={running}
          title="One round of each suggested skill, in turn"
          onClick={() => choose('mixed')}
        >
          <span>Mixed</span>
        </button>
        {ordered.map((k) => skillButton(k))}
      </div>

      <section className="mt-panel" aria-label="Practice area">
        <div className="mt-head">
          <div>
            <p className="mt-name">{name}</p>
            <p className="mt-job">{job}</p>
          </div>
          {levelShown !== null && (
            <div className="mt-lvl">
              <span>Level, easy to hard</span>
              <div className="mt-lvbar" role="group" aria-label="Level">
                {Array.from({ length: MAX_LEVEL }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="mt-lvb"
                    aria-pressed={n === levelShown}
                    disabled={!canPickLevel}
                    title={n === 1 ? 'Level 1: the easiest' : n === MAX_LEVEL ? `Level ${MAX_LEVEL}: the hardest` : `Level ${n}`}
                    onClick={() => pickLevel(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-stats">
          <div className="mt-st">
            <span>Time</span>
            <b>{stats.left}</b>
          </div>
          <div className="mt-st">
            <span>{follows ? 'Seconds on' : 'Hits'}</span>
            <b>{follows ? stats.onS.toFixed(1) : stats.hits}</b>
          </div>
          <div className="mt-st">
            <span>{follows ? 'On target' : 'Accuracy'}</span>
            <b>{stats.acc === null ? '–' : `${stats.acc}%`}</b>
          </div>
          <div className="mt-st">
            <span>{follows ? 'Speed' : 'Avg speed'}</span>
            <b>{follows ? `${followSpeed(stats.level)} px/s` : stats.avg === null ? '–' : `${stats.avg} ms`}</b>
          </div>
        </div>

        <div className="mt-arena" ref={arenaRef}>
          <div className="mt-layer" ref={layerRef} />
          {!running && (
            <div className="mt-overlay">
              {phase === 'idle' && (
                <>
                  <p className="mt-big">Ready?</p>
                  {notice && <p className="mt-warn">{notice}</p>}
                  <p>Press Start. Rounds keep coming until you press Stop.</p>
                  <div className="mt-btns">
                    <button type="button" className="mt-btn" onClick={begin}>
                      Start
                    </button>
                    <button type="button" className="mt-btn mt-ghost" onClick={startDaily}>
                      Today&apos;s 5-minute mix
                    </button>
                  </div>
                </>
              )}
              {phase === 'break' && (
                <>
                  <p className="mt-big">
                    Next: {SKILLS[upcoming].name} in {count}
                  </p>
                  <p>Level {store.levels[upcoming]}. Rounds keep coming until you stop.</p>
                  <div className="mt-btns">
                    <button type="button" className="mt-btn" onClick={begin}>
                      Start now
                    </button>
                    <button type="button" className="mt-btn mt-ghost" onClick={stop}>
                      Stop
                    </button>
                  </div>
                </>
              )}
              {phase === 'finished' && (
                <>
                  <p className="mt-big">Daily mix done</p>
                  <p>You finished {DAILY_MIX_ROUNDS} rounds. They count toward today&apos;s minutes.</p>
                  <div className="mt-btns">
                    <button type="button" className="mt-btn" onClick={stop}>
                      Practise more
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="mt-foot">
          <span>
            Today: {minutes.toFixed(1)} of {DAILY_GOAL_MINUTES} min
          </span>
          <span className="mt-bar" aria-hidden="true">
            <i style={{ width: `${Math.min(100, (minutes / DAILY_GOAL_MINUTES) * 100)}%` }} />
          </span>
          {dailyN !== null && <span>Daily mix: round {Math.min(dailyN + 1, DAILY_MIX_ROUNDS)} of {DAILY_MIX_ROUNDS}</span>}
        </div>
      </section>

      {result && (
        <div className="mt-res">
          <div className="mt-card" role="status" aria-live="polite">
            <h2>
              Round done: {SKILLS[result.sk].name} (level {result.level})
            </h2>
            <p>
              {result.sk === 'follow' ? (
                <>
                  <b>{result.acc ?? 0}%</b> of the time on target, {result.onS.toFixed(1)} seconds.
                </>
              ) : (
                <>
                  <b>{result.hits}</b> hits, {result.acc ?? 0}% accuracy{result.avg ? `, ${result.avg} ms per target` : ''}.
                </>
              )}
            </p>
            <p className={result.prev && result.prev.diff !== 0 ? (result.prev.diff > 0 ? 'mt-up' : 'mt-down') : 'text-text-dim'}>
              {result.prev
                ? result.prev.diff === 0
                  ? `Same as your last ${SKILLS[result.sk].name} round.`
                  : `${result.prev.diff > 0 ? '+' : ''}${result.prev.diff} ${result.prev.unit} compared with your last ${SKILLS[result.sk].name} round.`
                : `First ${SKILLS[result.sk].name} round saved. The next one will be compared with it.`}
            </p>
            <p className="text-text-dim">
              {result.change === 1
                ? `Level up to ${result.newLevel}. Harder targets next time.`
                : result.change === -1
                  ? `Level down to ${result.newLevel}. A little easier, so you can build up again.`
                  : `Level stays at ${result.level}.`}
            </p>
          </div>

          <div className="mt-cols">
            <div className="mt-card">
              <h2>Where you have trouble</h2>
              <div className="mt-heat" role="img" aria-label="Nine squares showing the share of tries missed or slow in each part of the play area">
                {zones.map((z, i) => {
                  const rate = troubleRate(z);
                  return (
                    <div
                      key={ZONE_NAMES[i]}
                      title={ZONE_NAMES[i]}
                      style={rate === null ? undefined : { background: `color-mix(in srgb, var(--color-error) ${Math.round(Math.min(1, rate * 1.6) * 70)}%, var(--color-surface-raised))` }}
                    >
                      {rate === null ? '–' : `${Math.round(rate * 100)}%`}
                    </div>
                  );
                })}
              </div>
              <p className="mt-note">
                {weak
                  ? `Most trouble: the ${ZONE_NAMES[weak.index]} of the screen (${Math.round(weak.rate * 100)}% missed or slow). Each square needs 8 tries to show a number.`
                  : 'Not enough tries yet to show a weak spot. Keep going.'}
              </p>
            </div>
            <div className="mt-card">
              <h2>Your latest rounds</h2>
              <div className="overflow-x-auto">
                <table className="mt-table">
                  <thead>
                    <tr>
                      <th>Skill</th>
                      <th>Lv</th>
                      <th>Result</th>
                      <th>Acc</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...store.rounds]
                      .reverse()
                      .slice(0, 6)
                      .map((x) => (
                        <tr key={x.at}>
                          <td>{SKILLS[x.skill].name}</td>
                          <td>{x.level}</td>
                          <td>{x.skill === 'follow' ? `${x.main}% on` : `${x.main} hits`}</td>
                          <td>{x.acc === null ? '–' : `${x.acc}%`}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {bests.length > 0 && (
        <div className="mt-card mt-bests">
          <h2>Your best Aim scores</h2>
          <p className="text-text-dim">Kept from the old Aim tab. Score is hits minus misses in 30 seconds.</p>
          <ul>
            {bests.map(([k, v]) => (
              <li key={k}>
                <span>{AIM_LABELS[k]}</span>
                <b>{v}</b>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
