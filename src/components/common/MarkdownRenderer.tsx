import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Renderiza elementos en línea (negrita, cursiva, tachado, código en línea, enlaces)
export const InlineMarkdown: React.FC<{ text: string }> = ({ text }) => {
  // Regex para capturar:
  // 1. Código en línea: `código`
  // 2. Enlace: [texto](url)
  // 3. Negrita: **texto** o __texto__
  // 4. Cursiva: *texto* o _texto_
  // 5. Tachado: ~~texto~~
  const inlineRegex = /(`[^`]+`)|(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*|__[^_]+__)|(\*[^*]+\*|(?<!\w)_[^_]+_(?!\w))|(~~[^~]+~~)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = inlineRegex.exec(text)) !== null) {
    // Texto plano antes de la coincidencia
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const matchedStr = match[0];

    // 1. Código en línea: `...`
    if (match[1]) {
      const code = matchedStr.slice(1, -1);
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-200/80 text-indigo-700 font-mono text-[11px] font-semibold border border-slate-300/60"
        >
          {code}
        </code>
      );
    }
    // 2. Enlace: [texto](url)
    else if (match[2]) {
      const linkMatch = matchedStr.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const linkText = linkMatch[1];
        const linkHref = linkMatch[2];
        parts.push(
          <a
            key={match.index}
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 underline font-medium transition-colors"
          >
            {linkText}
          </a>
        );
      } else {
        parts.push(matchedStr);
      }
    }
    // 3. Negrita: **...** o __...__
    else if (match[3]) {
      const boldText = matchedStr.slice(2, -2);
      parts.push(
        <strong key={match.index} className="font-bold text-slate-900">
          <InlineMarkdown text={boldText} />
        </strong>
      );
    }
    // 4. Cursiva: *...* o _..._
    else if (match[4]) {
      const italicText = matchedStr.slice(1, -1);
      parts.push(
        <em key={match.index} className="italic text-slate-700">
          <InlineMarkdown text={italicText} />
        </em>
      );
    }
    // 5. Tachado: ~~...~~
    else if (match[5]) {
      const strikeText = matchedStr.slice(2, -2);
      parts.push(
        <del key={match.index} className="line-through text-slate-400">
          <InlineMarkdown text={strikeText} />
        </del>
      );
    }

    lastIndex = inlineRegex.lastIndex;
  }

  // Texto restante después de la última coincidencia
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts.length > 0 ? parts : text}</>;
};

// Componente para bloques de código multilínea con botón de copiar
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2.5 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 text-slate-100 shadow-md">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-[11px] font-mono text-slate-400">
        <span className="uppercase tracking-wider font-semibold text-amber-400">
          {language || 'código'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Copiar código"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 text-xs font-mono overflow-x-auto leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Componente para tablas en Markdown
const MarkdownTable: React.FC<{ rows: string[][] }> = ({ rows }) => {
  if (rows.length === 0) return null;
  const headerRow = rows[0];
  const bodyRows = rows.slice(1);

  return (
    <div className="my-2.5 overflow-x-auto rounded-lg border border-slate-200 shadow-2xs">
      <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
        <thead className="bg-slate-100 text-slate-700 font-bold">
          <tr>
            {headerRow.map((col, idx) => (
              <th key={idx} className="px-3 py-2">
                <InlineMarkdown text={col.trim()} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {bodyRows.map((row, rIdx) => (
            <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3 py-2 text-slate-800">
                  <InlineMarkdown text={cell.trim()} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Normalizar saltos de línea Windows y Unix
  const lines = content.replace(/\r\n/g, '\n').split('\n');

  // Estructuras temporales para bloques agrupados
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Bloques de código (```lang ... ```)
    if (trimmed.startsWith('```')) {
      const language = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      // saltar la línea de cierre ```
      i++;
      elements.push(
        <CodeBlock
          key={`code-${i}`}
          language={language}
          code={codeLines.join('\n')}
        />
      );
      continue;
    }

    // 2. Tablas Markdown (| col1 | col2 | ...)
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      // Procesar filas de tabla
      const parsedRows = tableLines
        .filter((l) => !l.replace(/\s/g, '').match(/^\|[-:|]+\|$/)) // ignorar separador |---|---|
        .map((l) =>
          l
            .slice(1, -1)
            .split('|')
            .map((c) => c.trim())
        );

      if (parsedRows.length > 0) {
        elements.push(<MarkdownTable key={`table-${i}`} rows={parsedRows} />);
      }
      continue;
    }

    // 3. Encabezados (#, ##, ###, ####)
    if (trimmed.startsWith('#')) {
      const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const headingText = match[2];
        i++;

        switch (level) {
          case 1:
            elements.push(
              <h1
                key={`h1-${i}`}
                className="text-base sm:text-lg font-bold text-slate-900 mt-3 mb-1.5 pb-1 border-b border-slate-200"
              >
                <InlineMarkdown text={headingText} />
              </h1>
            );
            break;
          case 2:
            elements.push(
              <h2
                key={`h2-${i}`}
                className="text-sm sm:text-base font-bold text-slate-900 mt-2.5 mb-1"
              >
                <InlineMarkdown text={headingText} />
              </h2>
            );
            break;
          case 3:
            elements.push(
              <h3
                key={`h3-${i}`}
                className="text-xs sm:text-sm font-bold text-slate-800 mt-2 mb-1"
              >
                <InlineMarkdown text={headingText} />
              </h3>
            );
            break;
          default:
            elements.push(
              <h4
                key={`h4-${i}`}
                className="text-xs font-bold text-slate-700 mt-1.5 mb-0.5"
              >
                <InlineMarkdown text={headingText} />
              </h4>
            );
            break;
        }
        continue;
      }
    }

    // 4. Separador horizontal (--- o *** o ___)
    if (trimmed.match(/^(\*{3,}|-{3,}|_{3,})$/)) {
      elements.push(<hr key={`hr-${i}`} className="my-3 border-slate-200" />);
      i++;
      continue;
    }

    // 5. Citas / Blockquotes (> ...)
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="border-l-3 border-indigo-500 bg-indigo-50/60 rounded-r-lg px-3 py-1.5 my-2 text-xs text-slate-700 italic"
        >
          {quoteLines.map((ql, qIdx) => (
            <div key={qIdx}>
              <InlineMarkdown text={ql} />
            </div>
          ))}
        </blockquote>
      );
      continue;
    }

    // 6. Listas no ordenadas (- o * o +)
    if (trimmed.match(/^[-*+]\s+/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^[-*+]\s+/)) {
        listItems.push(lines[i].trim().replace(/^[-*+]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-1.5 space-y-1 pl-1">
          {listItems.map((item, itemIdx) => (
            <li key={itemIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              <span className="flex-1 leading-relaxed">
                <InlineMarkdown text={item} />
              </span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 7. Listas ordenadas (1. 2. ...)
    if (trimmed.match(/^\d+\.\s+/)) {
      const listItems: { num: string; text: string }[] = [];
      while (i < lines.length && lines[i].trim().match(/^\d+\.\s+/)) {
        const itemMatch = lines[i].trim().match(/^(\d+)\.\s+(.*)$/);
        if (itemMatch) {
          listItems.push({ num: itemMatch[1], text: itemMatch[2] });
        }
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-1.5 space-y-1 pl-1">
          {listItems.map((item, itemIdx) => (
            <li key={itemIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800">
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded shrink-0 border border-indigo-100">
                {item.num}.
              </span>
              <span className="flex-1 leading-relaxed">
                <InlineMarkdown text={item.text} />
              </span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 8. Líneas vacías (espaciado entre párrafos)
    if (trimmed === '') {
      elements.push(<div key={`blank-${i}`} className="h-1.5" />);
      i++;
      continue;
    }

    // 9. Párrafos normales
    const paragraphLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('>') &&
      !lines[i].trim().match(/^[-*+]\s+/) &&
      !lines[i].trim().match(/^\d+\.\s+/) &&
      !lines[i].trim().match(/^(\*{3,}|-{3,}|_{3,})$/) &&
      !(lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|'))
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }

    elements.push(
      <p key={`p-${i}`} className="text-xs sm:text-sm text-slate-800 leading-relaxed my-1">
        {paragraphLines.map((pLine, pIdx) => (
          <React.Fragment key={pIdx}>
            <InlineMarkdown text={pLine} />
            {pIdx < paragraphLines.length - 1 && ' '}
          </React.Fragment>
        ))}
      </p>
    );
  }

  return <div className={`markdown-body space-y-1 ${className}`}>{elements}</div>;
};

