import React, { useState, useEffect, useRef } from 'react';

const SKILL_GROUPS = [
	{
		label: 'generiche',
		skills: [
			{ key: 'Illustrazione',           level: 5 },
			{ key: 'Modellazione 3D',          level: 4 },
			{ key: 'Sculpting',               level: 3 },
			{ key: 'Texturing (PBR)',          level: 3 },
			{ key: 'Rigging & Animazione',     level: 3 },
			{ key: 'Lighting & Rendering',     level: 4 },
			{ key: 'Archviz',                 level: 4 },
			{ key: 'Disegno tecnico CAD 2D',  level: 5 },
		],
	},
	{
		label: 'linguaggi',
		skills: [
			{ key: 'Python',      level: 3 },
			{ key: 'JavaScript',  level: 4 },
			{ key: 'HTML / CSS',  level: 5 },
		],
	},
	{
		label: 'programmi',
		skills: [
			{ key: 'Blender / Cinema 4D',              level: 5 },
			{ key: 'AutoCAD',                          level: 5 },
			{ key: 'Adobe Suite (2D + Substance 3D)',  level: 5 },
			{ key: 'Unreal / Unity',                   level: 3 },
		],
	},
];

const LEGEND = [
	{ level: 5, desc: 'uso professionale quotidiano' },
	{ level: 4, desc: 'solido, autonomo' },
	{ level: 3, desc: 'buona padronanza' },
	{ level: 2, desc: 'funzionale' },
	{ level: 1, desc: 'basi' },
];

function makeBar(level) {
	return '▰'.repeat(level) + '▱'.repeat(5 - level);
}

// Colonna dove inizia [ nelle righe delle skill
// prefix = 6 (indent) + " + key + " + : = key.length + 9
const MAX_KEY_LEN = Math.max(
	...SKILL_GROUPS.flatMap(g => g.skills.map(s => s.key.length))
);
const BRACKET_COL = MAX_KEY_LEN + 9 + 2; // 2 spazi minimi dopo la chiave più lunga

function buildLines() {
	const lines = [];

	lines.push({ type: 'const' });

	SKILL_GROUPS.forEach(({ label, skills }) => {
		lines.push({ type: 'section', label });
		skills.forEach(({ key, level }) => {
			lines.push({ type: 'skill', key, level });
		});
	});

	lines.push({ type: 'close' });
	lines.push({ type: 'blank' });

	LEGEND.forEach(({ level, desc }) => {
		lines.push({ type: 'legend', level, desc });
	});

	return lines;
}

function getLineTokens(line) {
	switch (line.type) {
		case 'const':
			return [
				{ text: 'const ',      className: 'sk-keyword'  },
				{ text: 'competenze',  className: 'sk-variable' },
				{ text: ' = {',        className: 'sk-punct'    },
			];
		case 'section':
			return [{ text: `  // ${line.label}`, className: 'sk-comment' }];
		case 'skill': {
			const prefix = `      "${line.key}":`;
			const pad = ' '.repeat(BRACKET_COL - prefix.length);
			return [
				{ text: '      ',            className: ''          },
				{ text: `"${line.key}"`,     className: 'sk-string' },
				{ text: ':',                 className: 'sk-punct'  },
				{ text: pad,                 className: ''          },
				{ text: '[',                 className: 'sk-punct'  },
				{ text: makeBar(line.level), className: 'sk-bar'    },
				{ text: '],',               className: 'sk-punct'  },
			];
		}
		case 'close':
			return [{ text: '};', className: 'sk-punct' }];
		case 'blank':
			return [{ text: ' ', className: '' }]; // 1 char placeholder per avanzare il cursore
		case 'legend':
			return [{ text: `// [${makeBar(line.level)}] = ${line.desc}`, className: 'sk-legend' }];
		default:
			return [];
	}
}

const LINES = buildLines();

// Token arrays e conteggi caratteri per riga (calcolati una volta sola)
const LINE_TOKENS = LINES.map(getLineTokens);
const LINE_CHAR_COUNTS = LINE_TOKENS.map(tokens =>
	tokens.reduce((sum, { text }) => sum + text.length, 0)
);
const LINE_START_CHARS = [];
let _cum = 0;
LINE_CHAR_COUNTS.forEach(n => { LINE_START_CHARS.push(_cum); _cum += n; });
const TOTAL_CHARS = _cum;

// ── Timing (modifica questi valori per regolare l'animazione) ──
const ENTRANCE_MS   = 1500; // durata animazione entrata bioSheet
const PAUSE_MS      = 1200; // pausa con cursore prima della digitazione
const TYPING_MS     = 2000; // durata totale digitazione

function SkillPanel() {
	const [visibleChars, setVisibleChars] = useState(0);
	const [started, setStarted]           = useState(false);
	const timerRef = useRef(null);
	const rafRef   = useRef(null);

	useEffect(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) {
			setStarted(true);
			setVisibleChars(TOTAL_CHARS);
			return;
		}

		timerRef.current = setTimeout(() => {
			setStarted(true);
			const t0 = performance.now();
			const tick = (now) => {
				const progress = Math.min((now - t0) / TYPING_MS, 1);
				setVisibleChars(Math.floor(progress * TOTAL_CHARS));
				if (progress < 1) rafRef.current = requestAnimationFrame(tick);
			};
			rafRef.current = requestAnimationFrame(tick);
		}, ENTRANCE_MS + PAUSE_MS);

		return () => {
			clearTimeout(timerRef.current);
			cancelAnimationFrame(rafRef.current);
		};
	}, []);

	const isDone = visibleChars >= TOTAL_CHARS;

	// Fase di pausa: pannello vuoto con solo cursore
	if (!started) {
		return (
			<div className="skill-panel">
				<div className="code-line">
					<span className="gutter"> </span>
					<span className="code-content"><span className="cursor" /></span>
				</div>
			</div>
		);
	}

	return (
		<div className="skill-panel">
			{LINE_TOKENS.map((tokens, lineIdx) => {
				const lineStart = LINE_START_CHARS[lineIdx];
				const lineLen   = LINE_CHAR_COUNTS[lineIdx];
				const lineEnd   = lineStart + lineLen;

				if (visibleChars < lineStart) return null;

				const charsInLine   = Math.min(visibleChars - lineStart, lineLen);
				const isCurrentLine = visibleChars >= lineStart && visibleChars < lineEnd;
				const isLastLine    = lineIdx === LINE_TOKENS.length - 1;

				// Costruisce gli span visibili per questa riga
				const spans = [];
				let rem = charsInLine;
				tokens.forEach(({ text, className }, tIdx) => {
					if (rem <= 0) return;
					const visible = text.slice(0, rem);
					rem -= text.length;
					if (!visible) return;
					spans.push(
						className
							? <span key={tIdx} className={className}>{visible}</span>
							: <React.Fragment key={tIdx}>{visible}</React.Fragment>
					);
				});

				return (
					<div className="code-line" key={lineIdx}>
						<span className="gutter">{lineIdx + 1}</span>
						<span className="code-content">
							{spans}
							{(isCurrentLine || (isDone && isLastLine)) && <span className="cursor" />}
						</span>
					</div>
				);
			})}
		</div>
	);
}

export default SkillPanel;
