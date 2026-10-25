import ReactPaginate from "react-paginate";
// Style
import "./CustomPagination.css";
// Hooks
import { useIsDesktop } from "@/hooks";
// Utils
import { cx } from "@/utils/cx";

interface CustomPaginationProps {
  pageCount: number;
  /** Zero-based page index */
  onPageChange: (page: number) => void;
  /** Controlled current page (zero-based) */
  forcePage?: number;
  className?: string;
}

export function CustomPagination({
  pageCount,
  onPageChange,
  forcePage,
  className,
}: CustomPaginationProps) {
  const isDesktop = useIsDesktop();

  if (pageCount <= 1) return null;

  return (
    <ReactPaginate
      pageCount={pageCount}
      forcePage={forcePage}
      onPageChange={({ selected }) => onPageChange(selected)}
      // Mobile first: first, current and last page only; desktop adds neighbours
      marginPagesDisplayed={1}
      pageRangeDisplayed={isDesktop ? 2 : 1}
      previousLabel={isDesktop ? "← Sebelumnya" : "←"}
      nextLabel={isDesktop ? "Selanjutnya →" : "→"}
      breakLabel="…"
      previousAriaLabel="Halaman sebelumnya"
      nextAriaLabel="Halaman selanjutnya"
      containerClassName={cx("pagination stack center gap-2", className)}
      pageClassName="pagination__item"
      previousClassName="pagination__item"
      nextClassName="pagination__item"
      breakClassName="pagination__item pagination__break"
      pageLinkClassName="btn outline sm"
      previousLinkClassName="btn outline sm"
      nextLinkClassName="btn outline sm"
      breakLinkClassName="btn ghost sm"
      activeClassName="active"
      disabledClassName="disabled"
    />
  );
}
