import { useState, useEffect } from "react";
import { fetchLawns } from "../../services/lawnService";
import LawnCard      from "../../components/ui/LawnCard";
import SearchFilter  from "../../components/ui/SearchFilter";
import Pagination    from "../../components/ui/Pagination";
import { SkeletonGrid } from "../../components/ui/SkeletonCard";

const LawnListPage = () => {
  const [lawns,   setLawns]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);

  const loadLawns = async (params = {}, currentPage = 1) => {
    setLoading(true);
    try {
      const data = await fetchLawns({ ...params, page: currentPage, limit: 12 });
      setLawns(data.lawns);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error("Failed to load lawns:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadLawns();
  }, []);

  const handleFilter = (params) => {
    setFilters(params);
    setPage(1);
    loadLawns(params, 1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadLawns(filters, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-dark">🏡 Browse Lawns</h1>
        <p className="text-gray-500 text-sm mt-1">
          {total > 0
            ? `${total} venue${total !== 1 ? "s" : ""} available`
            : "Find your perfect wedding venue"}
        </p>
      </div>

      {/* Search & Filter */}
      <SearchFilter onFilter={handleFilter} loading={loading} />

      {/* Results */}
      {loading ? (
        <SkeletonGrid count={12} />
      ) : lawns.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {lawns.map((lawn) => (
              <LawnCard key={lawn._id} lawn={lawn} />
            ))}
          </div>
          <Pagination page={page} pages={pages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
};

const EmptyState = () => (
  <div className="text-center py-20">
    <div className="text-6xl mb-4">🌿</div>
    <h3 className="text-xl font-bold text-dark mb-2">No lawns found</h3>
    <p className="text-gray-500 text-sm">
      Try adjusting your filters or search in a different city.
    </p>
  </div>
);

export default LawnListPage;