/**
 * Token-styled pagination for admin tables and lists.
 *   <Pagination total={120} pageSize={50} page={page} onPage={setPage} />
 * `page` is 0-indexed (matches the API's `skip = page * take`).
 */
export default function Pagination({ total, pageSize, page, onPage }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (pageCount <= 1) return null;

  const go = (p) => onPage(Math.min(Math.max(p, 0), pageCount - 1));
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, total);

  // Windowed page numbers around the current page
  const pages = [];
  const start = Math.max(0, Math.min(page - 1, pageCount - 3));
  const end = Math.min(pageCount, start + 3);
  for (let i = start; i < end; i++) pages.push(i);

  return (
    <nav className="pagination" aria-label="Pagination">
      <span className="pagination__info font-mono">{from}–{to} of {total}</span>
      <div className="pagination__controls">
        <button className="pagination__btn" onClick={() => go(page - 1)} disabled={page === 0} aria-label="Previous page">
          <span className="material-symbols-outlined" aria-hidden="true">chevron_left</span>
        </button>
        {start > 0 && <span className="pagination__ellipsis">…</span>}
        {pages.map((p) => (
          <button
            key={p}
            className={`pagination__btn ${p === page ? 'is-active' : ''}`}
            onClick={() => go(p)}
            aria-current={p === page ? 'page' : undefined}
          >
            {p + 1}
          </button>
        ))}
        {end < pageCount && <span className="pagination__ellipsis">…</span>}
        <button className="pagination__btn" onClick={() => go(page + 1)} disabled={page >= pageCount - 1} aria-label="Next page">
          <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
        </button>
      </div>
    </nav>
  );
}
