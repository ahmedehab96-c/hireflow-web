/**
 * Renders plain-text descriptions with light structure:
 * "- item" lines become bullet lists and short lines ending in ":" become subheadings.
 * Everything is rendered as text (never HTML), so posted content can't inject markup.
 */
function toBlocks(text = '') {
  const blocks = []
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line) continue

    if (/^[-•*]\s+/.test(line)) {
      const item = line.replace(/^[-•*]\s+/, '')
      const last = blocks.at(-1)
      if (last?.type === 'list') last.items.push(item)
      else blocks.push({ type: 'list', items: [item] })
    } else if (line.endsWith(':') && line.length < 60) {
      blocks.push({ type: 'heading', text: line.slice(0, -1) })
    } else {
      blocks.push({ type: 'paragraph', text: line })
    }
  }
  return blocks
}

export function JobDescription({ text }) {
  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-slate-700">
      {toBlocks(text).map((block, index) => {
        if (block.type === 'heading') {
          return <h3 key={index} className="pt-2 text-sm font-semibold text-slate-900">{block.text}</h3>
        }
        if (block.type === 'list') {
          return (
            <ul key={index} className="space-y-2">
              {block.items.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )
        }
        return <p key={index}>{block.text}</p>
      })}
    </div>
  )
}
