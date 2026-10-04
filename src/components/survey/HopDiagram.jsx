import { useLanguage } from '../../i18n/LanguageContext.jsx';
import RelationTerm from './RelationTerm.jsx';

const NODE_META = {
  A: { title: 'A', subtitle: { en: 'You', zh: '您' } },
  B: { title: 'B', subtitle: { en: 'Person B', zh: '人物 B' } },
  C: { title: 'C', subtitle: { en: 'Person C', zh: '人物 C' } },
  D: { title: 'D', subtitle: { en: 'Person D', zh: '人物 D' } },
};

const LINK_LEGEND = {
  en: 'Dashed lines: your relationship with C / D (not a sharing step).',
  zh: '虚线：您与 C / D 的关系（不是信息传递）。',
};

/**
 * @param {{
 *   chain: Array<'A'|'B'|'C'|'D'>,
 *   highlight?: 'A'|'B'|'C'|'D',
 *   compact?: boolean,
 *   edgeLabels?: Record<string, { label: string, description?: { en: string, zh: string } }>,
 *   linkLabels?: Record<string, { label: string, description?: { en: string, zh: string } }>,
 * }} props `edgeLabels` is keyed by sender + recipient along the chain, e.g. "AB";
 *   `linkLabels` holds non-adjacent relationships drawn as dashed brackets
 *   below the chain, keyed "AC" / "AD".
 */
function HopDiagram({ chain, highlight, compact = false, edgeLabels = {}, linkLabels = {} }) {
  const { t } = useLanguage();

  // Grid columns alternate node / edge, so node at chain index i sits in column 2i+1.
  const links = Object.entries(linkLabels)
    .map(([pair, link]) => ({ pair, link, from: chain.indexOf(pair[0]), to: chain.indexOf(pair[1]) }))
    .filter(({ from, to }) => from >= 0 && to > from + 1)
    .sort((a, b) => a.to - b.to);

  return (
    <div className="hop-diagram-wrap">
      <div
        className={`hop-diagram ${compact ? 'hop-diagram--compact' : ''}`}
        style={{
          gridTemplateColumns: chain
            .map((_, index) => (index > 0 ? 'var(--hop-edge-col) var(--hop-node-col)' : 'var(--hop-node-col)'))
            .join(' '),
        }}
        aria-label={t({ en: 'Chain: ', zh: '传播链：' }) + chain.join(' → ')}
      >
        {chain.map((id, index) => {
          const meta = NODE_META[id];
          const edge = index > 0 ? edgeLabels[chain[index - 1] + id] : null;
          return (
            <div key={id} style={{ display: 'contents' }}>
              {index > 0 ? (
                <span className="hop-edge" style={{ gridRow: 1, gridColumn: 2 * index }}>
                  {edge ? (
                    <span className="hop-edge-label">
                      <RelationTerm label={edge.label} description={edge.description} align="center" />
                    </span>
                  ) : null}
                  <span className="hop-arrow" aria-hidden="true">
                    →
                  </span>
                </span>
              ) : null}
              <div
                className={`hop-node ${highlight === id ? 'active' : ''}`}
                style={{ gridRow: 1, gridColumn: 2 * index + 1 }}
                aria-current={highlight === id ? 'true' : undefined}
              >
                <strong>{meta.title}</strong>
                <span>{t(meta.subtitle)}</span>
              </div>
            </div>
          );
        })}
        {links.map(({ pair, link, from, to }, depth) => (
          <span
            key={pair}
            className="hop-link"
            style={{ gridRow: `2 / ${3 + depth}`, gridColumn: `${2 * from + 1} / ${2 * to + 2}` }}
          >
            <span className="hop-link-label">
              <RelationTerm label={link.label} description={link.description} align="center" />
            </span>
          </span>
        ))}
        {links.map((_, depth) => (
          <span key={depth} className="hop-link-row" style={{ gridRow: 2 + depth }} aria-hidden="true" />
        ))}
        {links.length > 0 ? (
          <span className="hop-link-spacer" style={{ gridRow: 2 + links.length }} aria-hidden="true" />
        ) : null}
      </div>
      {links.length > 0 ? <p className="hop-link-legend">{t(LINK_LEGEND)}</p> : null}
    </div>
  );
}

export default HopDiagram;
