import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import SlashCommandMenu, { CommandItem } from './SlashCommandMenu';
import {
    Bold,
    Italic,
    Code,
    List,
    CheckSquare,
    Heading2,
    Heading3,
    Quote,
    Table as TableIcon,
} from 'lucide-react';

interface TipTapEditorProps {
    content?: string | null;
    onChange?: (content: string) => void;
    editable?: boolean;
    placeholder?: string;
    className?: string;
}

// Convert markdown string to clean HTML for TipTap initialization
function markdownToHtml(md: string): string {
    if (!md) return '';

    // If content already contains HTML tags, return as-is
    if (/<[a-z][\s\S]*>/i.test(md)) return md;

    const lines = md.split('\n');
    const result: string[] = [];
    let inCode = false;
    let codeLanguage = '';
    let codeContent: string[] = [];
    let inTaskList = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Code block handling
        const codeMatch = line.match(/^```(\w+)?$/);
        if (codeMatch && !inCode) {
            inCode = true;
            codeLanguage = codeMatch[1] || '';
            codeContent = [];
            continue;
        }
        if (line.trim() === '```' && inCode) {
            inCode = false;
            const langClass = codeLanguage ? ` class="language-${codeLanguage}"` : '';
            result.push(`<pre><code${langClass}>${codeContent.join('\n')}</code></pre>`);
            continue;
        }
        if (inCode) {
            codeContent.push(line);
            continue;
        }

        // Task items: - [ ] or - [x]
        const taskMatch = line.match(/^(\s*)-\s*\[([ xX])\]\s*(.*)$/);
        if (taskMatch) {
            if (!inTaskList) {
                inTaskList = true;
                result.push('<ul data-type="taskList">');
            }
            const isChecked = taskMatch[2].toLowerCase() === 'x';
            result.push(
                `<li data-type="taskItem" data-checked="${isChecked}"><label><input type="checkbox" ${
                    isChecked ? 'checked' : ''
                }><span></span></label><div><p>${taskMatch[3]}</p></div></li>`
            );
            continue;
        } else if (inTaskList) {
            inTaskList = false;
            result.push('</ul>');
        }

        // Headings
        if (line.startsWith('### ')) {
            result.push(`<h3>${line.slice(4)}</h3>`);
            continue;
        }
        if (line.startsWith('## ')) {
            result.push(`<h2>${line.slice(3)}</h2>`);
            continue;
        }
        if (line.startsWith('# ')) {
            result.push(`<h1>${line.slice(2)}</h1>`);
            continue;
        }

        // Blockquotes
        if (line.startsWith('> ')) {
            result.push(`<blockquote><p>${line.slice(2)}</p></blockquote>`);
            continue;
        }

        // Standard bullet lists
        if (line.startsWith('- ') || line.startsWith('* ')) {
            result.push(`<ul><li><p>${line.slice(2)}</p></li></ul>`);
            continue;
        }

        if (!line.trim()) {
            result.push('<p></p>');
            continue;
        }

        result.push(`<p>${line}</p>`);
    }

    if (inTaskList) {
        result.push('</ul>');
    }

    return result.join('');
}

// Convert TipTap HTML back to clean Markdown
function htmlToMarkdown(html: string): string {
    if (!html) return '';

    const div = document.createElement('div');
    div.innerHTML = html;

    const convertNode = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent || '';
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return '';
        }

        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();

        switch (tag) {
            case 'h1':
                return `# ${Array.from(el.childNodes).map(convertNode).join('')}\n\n`;
            case 'h2':
                return `## ${Array.from(el.childNodes).map(convertNode).join('')}\n\n`;
            case 'h3':
                return `### ${Array.from(el.childNodes).map(convertNode).join('')}\n\n`;
            case 'p': {
                const inner = Array.from(el.childNodes).map(convertNode).join('');
                return inner ? `${inner}\n\n` : '\n';
            }
            case 'strong':
            case 'b':
                return `**${Array.from(el.childNodes).map(convertNode).join('')}**`;
            case 'em':
            case 'i':
                return `*${Array.from(el.childNodes).map(convertNode).join('')}*`;
            case 'code': {
                if (el.parentElement?.tagName.toLowerCase() === 'pre') {
                    return el.textContent || '';
                }
                return `\`${el.textContent}\``;
            }
            case 'pre': {
                const codeEl = el.querySelector('code');
                const lang = codeEl?.className?.match(/language-(\w+)/)?.[1] || '';
                return `\`\`\`${lang}\n${codeEl?.textContent || el.textContent || ''}\n\`\`\`\n\n`;
            }
            case 'blockquote':
                return `> ${Array.from(el.childNodes).map(convertNode).join('').trim()}\n\n`;
            case 'ul': {
                if (el.getAttribute('data-type') === 'taskList') {
                    return Array.from(el.children)
                        .map((li) => {
                            const checked = li.getAttribute('data-checked') === 'true';
                            const text = (li.querySelector('div') || li).textContent?.trim() || '';
                            return `- [${checked ? 'x' : ' '}] ${text}`;
                        })
                        .join('\n') + '\n\n';
                }
                return Array.from(el.children)
                    .map((li) => `- ${Array.from(li.childNodes).map(convertNode).join('').trim()}`)
                    .join('\n') + '\n\n';
            }
            case 'ol':
                return Array.from(el.children)
                    .map((li, idx) => `${idx + 1}. ${Array.from(li.childNodes).map(convertNode).join('').trim()}`)
                    .join('\n') + '\n\n';
            case 'table': {
                const rows = Array.from(el.querySelectorAll('tr'));
                if (rows.length === 0) return '';
                const tableLines: string[] = [];
                rows.forEach((row, rowIdx) => {
                    const cells = Array.from(row.querySelectorAll('th, td')).map((c) => c.textContent?.trim() || '');
                    tableLines.push(`| ${cells.join(' | ')} |`);
                    if (rowIdx === 0) {
                        tableLines.push(`| ${cells.map(() => '---').join(' | ')} |`);
                    }
                });
                return tableLines.join('\n') + '\n\n';
            }
            default:
                return Array.from(el.childNodes).map(convertNode).join('');
        }
    };

    return Array.from(div.childNodes).map(convertNode).join('').trim();
}

export default function TipTapEditor({
    content = '',
    onChange,
    editable = true,
    placeholder = 'Write details, scope, or type "/" for commands…',
    className = '',
}: TipTapEditorProps) {
    const [slashOpen, setSlashOpen] = useState(false);
    const [slashQuery, setSlashQuery] = useState('');
    const [slashPosition, setSlashPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
            }),
            TaskList.configure({
                HTMLAttributes: {
                    class: 'custom-task-list space-y-1.5 my-2',
                },
            }),
            TaskItem.configure({
                nested: true,
                HTMLAttributes: {
                    class: 'flex items-start gap-2.5 group cursor-pointer',
                },
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'my-3 border-collapse border border-white/[0.1] rounded-lg overflow-hidden w-full text-xs text-zinc-300',
                },
            }),
            TableRow,
            TableHeader.configure({
                HTMLAttributes: {
                    class: 'border border-white/[0.1] bg-white/[0.04] p-2 font-semibold text-zinc-200 text-left',
                },
            }),
            TableCell.configure({
                HTMLAttributes: {
                    class: 'border border-white/[0.08] p-2 bg-[#090a0f]/60',
                },
            }),
        ],
        content: markdownToHtml(content ?? ''),
        editable,
        onUpdate: ({ editor: ed }) => {
            const html = ed.getHTML();
            const md = htmlToMarkdown(html);
            onChange?.(md);

            // Check for slash command invocation
            const selection = ed.state.selection;
            const textBefore = ed.state.doc.textBetween(Math.max(0, selection.from - 20), selection.from, '\n', '\0');
            const slashMatch = textBefore.match(/\/([a-zA-Z0-9_-]*)$/);

            if (slashMatch) {
                setSlashQuery(slashMatch[1]);
                setSlashOpen(true);
            } else {
                setSlashOpen(false);
            }
        },
    });

    useEffect(() => {
        if (!editor || content === undefined || content === null) return;
        const currentMd = htmlToMarkdown(editor.getHTML());
        if (content.trim() !== currentMd.trim()) {
            editor.commands.setContent(markdownToHtml(content));
        }
    }, [content, editor]);

    useEffect(() => {
        if (editor) {
            editor.setEditable(editable);
        }
    }, [editable, editor]);

    const handleSelectSlashCommand = useCallback((command: CommandItem) => {
        if (!editor) return;

        // Delete the slash trigger from the document
        const { state } = editor;
        const { from } = state.selection;
        const textBefore = state.doc.textBetween(Math.max(0, from - 20), from, '\n', '\0');
        const slashMatch = textBefore.match(/\/([a-zA-Z0-9_-]*)$/);

        if (slashMatch) {
            const matchLength = slashMatch[0].length;
            editor.commands.deleteRange({ from: from - matchLength, to: from });
        }

        setSlashOpen(false);
        command.execute(editor);
        editor.commands.focus();
    }, [editor]);

    if (!editor) return null;

    return (
        <div
            ref={containerRef}
            className={`relative rounded-xl border border-white/[0.08] bg-[#090a0f] text-zinc-100 shadow-inner ${className}`}
        >
            {/* Editor Precision Toolbar (when editable) */}
            {editable && (
                <div className="flex flex-wrap items-center gap-1 border-b border-white/[0.06] bg-[#07090e]/80 px-3 py-1.5 rounded-t-xl">
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                            editor.isActive('bold')
                                ? 'bg-violet-600/30 text-violet-300'
                                : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'
                        }`}
                        title="Bold (⌘B)"
                    >
                        <Bold className="h-3 w-3" />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                            editor.isActive('italic')
                                ? 'bg-violet-600/30 text-violet-300'
                                : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'
                        }`}
                        title="Italic (⌘I)"
                    >
                        <Italic className="h-3 w-3" />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                            editor.isActive('code')
                                ? 'bg-violet-600/30 text-violet-300'
                                : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'
                        }`}
                        title="Inline Code"
                    >
                        <Code className="h-3 w-3" />
                    </button>

                    <span className="mx-1 h-3.5 w-px bg-white/[0.08]" />

                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                            editor.isActive('heading', { level: 2 })
                                ? 'bg-violet-600/30 text-violet-300'
                                : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'
                        }`}
                        title="Heading 2 (/h2)"
                    >
                        <Heading2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                            editor.isActive('heading', { level: 3 })
                                ? 'bg-violet-600/30 text-violet-300'
                                : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'
                        }`}
                        title="Heading 3 (/h3)"
                    >
                        <Heading3 className="h-3.5 w-3.5" />
                    </button>

                    <span className="mx-1 h-3.5 w-px bg-white/[0.08]" />

                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleTaskList().run()}
                        className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                            editor.isActive('taskList')
                                ? 'bg-violet-600/30 text-violet-300'
                                : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'
                        }`}
                        title="Task Checklist (/todo)"
                    >
                        <CheckSquare className="h-3 w-3" />
                    </button>

                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                            editor.isActive('bulletList')
                                ? 'bg-violet-600/30 text-violet-300'
                                : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'
                        }`}
                        title="Bullet List"
                    >
                        <List className="h-3 w-3" />
                    </button>

                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                            editor.isActive('blockquote')
                                ? 'bg-violet-600/30 text-violet-300'
                                : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'
                        }`}
                        title="Quote (/quote)"
                    >
                        <Quote className="h-3 w-3" />
                    </button>

                    <button
                        type="button"
                        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                        className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-colors"
                        title="Table (/table)"
                    >
                        <TableIcon className="h-3 w-3" />
                    </button>

                    <div className="ml-auto text-[10px] font-mono text-zinc-500">
                        Type <kbd className="rounded border border-white/[0.1] bg-white/[0.04] px-1 text-zinc-400">/</kbd> for blocks
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="p-4 min-h-[140px] text-xs leading-relaxed font-sans tiptap-content">
                <EditorContent editor={editor} />
            </div>

            {/* Slash Command Palette Popup */}
            {editable && (
                <SlashCommandMenu
                    isOpen={slashOpen}
                    query={slashQuery}
                    onSelect={handleSelectSlashCommand}
                    onClose={() => setSlashOpen(false)}
                />
            )}
        </div>
    );
}
