import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownViewerProps {
    content: string;
    onToggleChecklist?: (newContent: string) => void;
    className?: string;
}

// Token highlighter for JS/TS, PHP, Python, SQL, Bash, and JSON
function highlightCodeLine(line: string, language: string): React.ReactNode {
    const lang = (language || '').toLowerCase().trim();

    let commentPattern = '//.*$';
    if (['python', 'py', 'bash', 'sh', 'zsh'].includes(lang)) {
        commentPattern = '#.*$';
    } else if (lang === 'sql') {
        commentPattern = '(--.*$)|(/\\*.*?\\*/)';
    } else if (lang === 'php') {
        commentPattern = '(//.*$)|(#.*$)|(/\\*.*?\\*/)';
    }

    let keywordList = [
        'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
        'switch', 'case', 'break', 'continue', 'import', 'export', 'from', 'default',
        'class', 'extends', 'async', 'await', 'try', 'catch', 'finally', 'throw',
        'new', 'typeof', 'instanceof', 'interface', 'type', 'enum', 'public',
        'private', 'protected', 'readonly', 'static', 'true', 'false', 'null',
        'undefined', 'this', 'super', 'yield',
    ];

    if (lang === 'php') {
        keywordList = [
            'function', 'class', 'interface', 'trait', 'public', 'protected', 'private',
            'readonly', 'static', 'final', 'return', 'if', 'else', 'elseif', 'foreach',
            'for', 'while', 'switch', 'case', 'break', 'continue', 'use', 'namespace',
            'new', 'try', 'catch', 'finally', 'throw', 'extends', 'implements', 'true',
            'false', 'null', 'echo', 'print', 'fn',
        ];
    } else if (['python', 'py'].includes(lang)) {
        keywordList = [
            'def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'in',
            'import', 'from', 'as', 'try', 'except', 'finally', 'raise', 'with',
            'async', 'await', 'lambda', 'pass', 'yield', 'True', 'False', 'None',
            'and', 'or', 'not', 'is',
        ];
    } else if (lang === 'sql') {
        keywordList = [
            'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET',
            'DELETE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'GROUP', 'BY',
            'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'AND', 'OR', 'NOT', 'IN', 'IS',
            'NULL', 'AS', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'PRIMARY',
            'KEY', 'FOREIGN', 'REFERENCES', 'UNION', 'ALL', 'DISTINCT',
        ];
    } else if (['bash', 'sh', 'zsh'].includes(lang)) {
        keywordList = [
            'if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'do', 'done', 'in',
            'case', 'esac', 'echo', 'exit', 'return', 'function', 'export', 'source',
            'local',
        ];
    } else if (lang === 'json') {
        keywordList = ['true', 'false', 'null'];
    }

    const keywordPattern = `\\b(?:${keywordList.join('|')})\\b`;
    const phpTagPattern = lang === 'php' ? '(?:<\\?php|\\?>)|' : '';

    const tokenRegex = new RegExp(
        `(?<comment>${commentPattern})|(?<str>"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|\`(?:\\\\.|[^\`\\\\])*\`)|(?<num>\\b\\d+(?:\\.\\d+)?\\b)|(?<fn>\\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\\s*\\())|(?<kw>${phpTagPattern}${keywordPattern})|(?<variable>\\$[a-zA-Z0-9_]+)`,
        lang === 'sql' ? 'gi' : 'g'
    );

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
            elements.push(line.slice(lastIndex, match.index));
        }

        const groups = match.groups || {};
        const matchedText = match[0];

        if (groups.comment) {
            elements.push(
                <span key={match.index} className="text-zinc-500 italic">
                    {matchedText}
                </span>
            );
        } else if (groups.str) {
            elements.push(
                <span key={match.index} className="text-emerald-400">
                    {matchedText}
                </span>
            );
        } else if (groups.num) {
            elements.push(
                <span key={match.index} className="text-violet-400">
                    {matchedText}
                </span>
            );
        } else if (groups.kw) {
            elements.push(
                <span key={match.index} className="text-sky-400 font-medium">
                    {matchedText}
                </span>
            );
        } else if (groups.fn) {
            elements.push(
                <span key={match.index} className="text-amber-400">
                    {matchedText}
                </span>
            );
        } else if (groups.variable) {
            elements.push(
                <span key={match.index} className="text-sky-300">
                    {matchedText}
                </span>
            );
        } else {
            elements.push(matchedText);
        }

        lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < line.length) {
        elements.push(line.slice(lastIndex));
    }

    return elements.length > 0 ? elements : line;
}

function CodeBlock({ code, language }: { code: string; language: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const lines = code.split('\n');

    return (
        <div className="group relative my-3">
            <div className="absolute right-3 top-3 flex items-center gap-2 z-10">
                {language && (
                    <span className="rounded bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 text-[10px] font-mono uppercase text-zinc-400">
                        {language}
                    </span>
                )}
                <button
                    type="button"
                    onClick={handleCopy}
                    className="flex h-6 w-6 items-center justify-center rounded bg-white/[0.06] text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-white transition-opacity border border-white/[0.08]"
                    title="Copy code"
                >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </button>
            </div>
            <pre className="bg-[#090a0f] border border-white/[0.08] p-4 rounded-xl font-mono text-sm overflow-x-auto text-zinc-200">
                <code>
                    {lines.map((line, i) => (
                        <div key={i} className="leading-relaxed">
                            {highlightCodeLine(line, language)}
                        </div>
                    ))}
                </code>
            </pre>
        </div>
    );
}

export default function MarkdownViewer({
    content,
    onToggleChecklist,
    className = '',
}: MarkdownViewerProps) {
    if (!content) return null;

    const normalizedContent = content.includes('\n')
        ? content
        : content.replace(/(?<=\S)\s+(\d+\.)/g, '\n$1');
    const rawLines = normalizedContent.split('\n');

    const handleCheckboxToggle = (lineIndex: number, currentChecked: boolean) => {
        if (!onToggleChecklist) return;
        const newLines = [...rawLines];
        const targetLine = newLines[lineIndex];

        // 1. Dash checklist: `- [x]` or `- [ ]`
        if (/^(\s*)[-*]\s*\[([ xX])\]/.test(targetLine)) {
            newLines[lineIndex] = currentChecked
                ? targetLine.replace(/^(\s*[-*]\s*)\[[xX]\]\s*/, '$1[ ] ')
                : targetLine.replace(/^(\s*[-*]\s*)\[ \]\s*/, '$1[x] ');
        }
        // 2. Numbered checklist: `1. [x]` or `1. [ ]`
        else if (/^(\s*\d+[.)]\s*)\[([ xX])\]/.test(targetLine)) {
            newLines[lineIndex] = currentChecked
                ? targetLine.replace(/^(\s*\d+[.)]\s*)\[[xX]\]\s*/, '$1[ ] ')
                : targetLine.replace(/^(\s*\d+[.)]\s*)\[ \]\s*/, '$1[x] ');
        }
        // 3. Regular numbered list: `1. Item text`
        else if (/^(\s*)(\d+[.)])\s+(.*)$/.test(targetLine)) {
            newLines[lineIndex] = currentChecked
                ? targetLine.replace(/^(\s*\d+[.)])\s+/, '$1 [ ] ')
                : targetLine.replace(/^(\s*\d+[.)])\s+/, '$1 [x] ');
        }

        onToggleChecklist(newLines.join('\n'));
    };

    // Helper to format inline markdown (bold, code, links)
    const formatInline = (text: string): React.ReactNode => {
        const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={index} className="font-semibold text-zinc-100">
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            if (part.startsWith('`') && part.endsWith('`')) {
                return (
                    <code
                        key={index}
                        className="rounded border border-zinc-750 bg-zinc-850 px-1.5 py-0.5 font-mono text-[11px] text-zinc-300"
                    >
                        {part.slice(1, -1)}
                    </code>
                );
            }
            return part;
        });
    };

    // Parse items including fenced code blocks
    type Block =
        | { type: 'code'; code: string; language: string }
        | { type: 'line'; line: string; originalIndex: number };

    const blocks: Block[] = [];
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeLines: string[] = [];

    for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        const codeBlockMatch = line.match(/^```(\w+)?$/);

        if (codeBlockMatch && !inCodeBlock) {
            inCodeBlock = true;
            codeLanguage = codeBlockMatch[1] || '';
            codeLines = [];
            continue;
        }

        if (line.trim() === '```' && inCodeBlock) {
            inCodeBlock = false;
            blocks.push({
                type: 'code',
                code: codeLines.join('\n'),
                language: codeLanguage,
            });
            codeLanguage = '';
            codeLines = [];
            continue;
        }

        if (inCodeBlock) {
            codeLines.push(line);
        } else {
            blocks.push({
                type: 'line',
                line,
                originalIndex: i,
            });
        }
    }

    if (inCodeBlock) {
        blocks.push({
            type: 'code',
            code: codeLines.join('\n'),
            language: codeLanguage,
        });
    }

    let listCounter = 0;

    return (
        <div className={`space-y-1.5 text-xs leading-relaxed text-zinc-300 select-text ${className}`}>
            {blocks.map((block, idx) => {
                if (block.type === 'code') {
                    listCounter = 0;
                    return <CodeBlock key={idx} code={block.code} language={block.language} />;
                }

                const { line, originalIndex } = block;
                const trimmed = line.trim();

                // Reset list counter on empty lines or headings
                if (!trimmed || trimmed.startsWith('#')) {
                    listCounter = 0;
                }

                // 1. Dash checklist item: `- [ ]` or `- [x]` or `* [ ]` or `* [x]`
                const checkMatch = line.match(/^(\s*)[-*]\s*\[([ xX])\]\s*(.*)$/);
                if (checkMatch) {
                    listCounter = 0;
                    const isChecked = checkMatch[2].toLowerCase() === 'x';
                    const itemText = checkMatch[3];

                    return (
                        <div
                            key={idx}
                            className="group/item flex items-start gap-2.5 rounded-lg py-1 px-1.5 -mx-1.5 transition-colors hover:bg-white/[0.03]"
                        >
                            <button
                                type="button"
                                disabled={!onToggleChecklist}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCheckboxToggle(originalIndex, isChecked);
                                }}
                                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                                    isChecked
                                        ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-400 shadow-sm shadow-emerald-500/20'
                                        : 'border-white/20 bg-white/[0.04] text-transparent hover:border-violet-400 hover:bg-violet-500/10'
                                } ${onToggleChecklist ? 'cursor-pointer' : 'cursor-default'}`}
                                title={isChecked ? 'Mark incomplete' : 'Mark complete / correct'}
                            >
                                <Check className={`h-3 w-3 stroke-[3] transition-transform ${isChecked ? 'scale-100' : 'scale-0'}`} />
                            </button>
                            <span
                                onClick={() => onToggleChecklist && handleCheckboxToggle(originalIndex, isChecked)}
                                className={`flex-1 transition-all ${onToggleChecklist ? 'cursor-pointer' : ''} ${
                                    isChecked
                                        ? 'line-through text-zinc-500 selection:bg-zinc-800'
                                        : 'text-zinc-200 group-hover/item:text-white'
                                }`}
                            >
                                {formatInline(itemText)}
                            </span>
                        </div>
                    );
                }

                // 2. Numbered checklist item: `1. [ ]` or `1. [x]`
                const numCheckMatch = line.match(/^(\s*)(\d+)[.)]\s*\[([ xX])\]\s*(.*)$/);
                if (numCheckMatch) {
                    listCounter++;
                    const parsedNum = parseInt(numCheckMatch[2], 10);
                    const displayNum = parsedNum > 1 && parsedNum >= listCounter ? parsedNum : listCounter;
                    const isChecked = numCheckMatch[3].toLowerCase() === 'x';
                    const itemText = numCheckMatch[4];

                    return (
                        <div
                            key={idx}
                            className="group/item flex items-start gap-2.5 rounded-lg py-1 px-1.5 -mx-1.5 transition-colors hover:bg-white/[0.03]"
                        >
                            <button
                                type="button"
                                disabled={!onToggleChecklist}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCheckboxToggle(originalIndex, isChecked);
                                }}
                                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                                    isChecked
                                        ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-400 shadow-sm shadow-emerald-500/20'
                                        : 'border-white/20 bg-white/[0.04] text-transparent hover:border-violet-400 hover:bg-violet-500/10'
                                } ${onToggleChecklist ? 'cursor-pointer' : 'cursor-default'}`}
                                title={isChecked ? 'Mark incomplete' : 'Mark complete / correct'}
                            >
                                <Check className={`h-3 w-3 stroke-[3] transition-transform ${isChecked ? 'scale-100' : 'scale-0'}`} />
                            </button>
                            <span className={`font-mono text-[11px] font-semibold shrink-0 min-w-[1.25rem] transition-colors ${
                                isChecked ? 'text-zinc-500 line-through' : 'text-violet-400'
                            }`}>
                                {displayNum}.
                            </span>
                            <span
                                onClick={() => onToggleChecklist && handleCheckboxToggle(originalIndex, isChecked)}
                                className={`flex-1 transition-all ${onToggleChecklist ? 'cursor-pointer' : ''} ${
                                    isChecked
                                        ? 'line-through text-zinc-500 selection:bg-zinc-800'
                                        : 'text-zinc-200 group-hover/item:text-white'
                                }`}
                            >
                                {itemText ? formatInline(itemText) : ''}
                            </span>
                        </div>
                    );
                }

                // 3. Regular numbered list item: `1. ` or `1) `
                const numberedMatch = trimmed.match(/^(\d+)[.)]\s*(.*)$/);
                if (numberedMatch) {
                    listCounter++;
                    const parsedNum = parseInt(numberedMatch[1], 10);
                    const displayNum = parsedNum > 1 && parsedNum >= listCounter ? parsedNum : listCounter;
                    const itemText = numberedMatch[2];

                    return (
                        <div
                            key={idx}
                            className="group/item flex items-start gap-2.5 rounded-lg py-1 px-1.5 -mx-1.5 transition-colors hover:bg-white/[0.03]"
                        >
                            <button
                                type="button"
                                disabled={!onToggleChecklist}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCheckboxToggle(originalIndex, false);
                                }}
                                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all border-white/20 bg-white/[0.04] text-transparent hover:border-violet-400 hover:bg-violet-500/10 ${
                                    onToggleChecklist ? 'cursor-pointer' : 'cursor-default'
                                }`}
                                title="Mark complete / correct"
                            >
                                <Check className="h-3 w-3 stroke-[3] scale-0 transition-transform" />
                            </button>
                            <span className="font-mono text-[11px] font-semibold text-violet-400 shrink-0 min-w-[1.25rem]">
                                {displayNum}.
                            </span>
                            <span
                                onClick={() => onToggleChecklist && handleCheckboxToggle(originalIndex, false)}
                                className={`flex-1 text-zinc-200 transition-colors group-hover/item:text-white ${
                                    onToggleChecklist ? 'cursor-pointer' : ''
                                }`}
                            >
                                {itemText ? formatInline(itemText) : ''}
                            </span>
                        </div>
                    );
                }

                // Bullet point: `- ` or `* `
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    listCounter = 0;
                    return (
                        <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 mt-1.5 shrink-0" />
                            <span className="text-zinc-200">{formatInline(trimmed.slice(2))}</span>
                        </div>
                    );
                }

                // Heading 3
                if (trimmed.startsWith('### ')) {
                    return (
                        <h4 key={idx} className="mt-2 text-xs font-bold text-zinc-100 uppercase tracking-wider">
                            {trimmed.slice(4)}
                        </h4>
                    );
                }

                // Heading 2
                if (trimmed.startsWith('## ')) {
                    return (
                        <h3 key={idx} className="mt-2.5 text-sm font-bold text-zinc-100 tracking-wide">
                            {trimmed.slice(3)}
                        </h3>
                    );
                }

                // Heading 1
                if (trimmed.startsWith('# ')) {
                    return (
                        <h2 key={idx} className="mt-3 text-base font-bold text-white tracking-wide">
                            {trimmed.slice(2)}
                        </h2>
                    );
                }

                // Empty line
                if (!trimmed) {
                    return <div key={idx} className="h-1" />;
                }

                return (
                    <p key={idx} className="text-zinc-300">
                        {formatInline(line)}
                    </p>
                );
            })}
        </div>
    );
}

/**
 * Utility to extract checklist statistics from markdown text.
 * Returns { completed: number, total: number, percentage: number }
 */
export function getChecklistStats(content?: string | null) {
    if (!content) return null;

    const normalized = content.includes('\n')
        ? content
        : content.replace(/(?<=\S)\s+(\d+\.)/g, '\n$1');
    const lines = normalized.split('\n').map((l) => l.trim()).filter(Boolean);

    let total = 0;
    let completed = 0;

    for (const line of lines) {
        // Dash checklist: `- [x]` or `- [ ]`
        const dashMatch = line.match(/^[-*]\s*\[([ xX])\]/);
        if (dashMatch) {
            total++;
            if (dashMatch[1].toLowerCase() === 'x') completed++;
            continue;
        }

        // Numbered checklist: `1. [x]` or `1. [ ]`
        const numCheckMatch = line.match(/^\d+[.)]\s*\[([ xX])\]/);
        if (numCheckMatch) {
            total++;
            if (numCheckMatch[1].toLowerCase() === 'x') completed++;
            continue;
        }

        // Regular numbered item: `1. `
        const regularNumMatch = line.match(/^\d+[.)]\s+(.+)$/);
        if (regularNumMatch) {
            total++;
            continue;
        }
    }

    if (total === 0) return null;
    const percentage = Math.round((completed / total) * 100);

    return { completed, total, percentage };
}
