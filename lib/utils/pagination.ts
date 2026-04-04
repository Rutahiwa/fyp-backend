export function parsePagination(searchParams: URLSearchParams) {
  const pageStr = searchParams.get("page") || "1";
  const pageSizeStr = searchParams.get("pageSize") || "20";

  let page = parseInt(pageStr, 10);
  let pageSize = parseInt(pageSizeStr, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(pageSize) || pageSize < 1) pageSize = 20;
  if (pageSize > 100) pageSize = 100;

  const offset = (page - 1) * pageSize;

  return { page, pageSize, offset };
}
