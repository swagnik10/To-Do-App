interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

function Pagination({
    currentPage,
    totalPages,
    onPageChange
}: PaginationProps) {
    if (totalPages <= 1) return null

    return (
        <div className="flex justify-center items-center gap-2 mt-6">

            <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="px-4 py-2
                            rounded-full
                            bg-white/10
                            backdrop-blur-sm
                            border border-white/20
                            text-white
                            hover:bg-white/20
                            disabled:opacity-40
                            disabled:cursor-not-allowed"
            >
                Previous
            </button>

            {Array.from(
                { length: totalPages },
                (_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => onPageChange(index + 1)}
                        className={`px-3 py-2 rounded ${currentPage === index + 1
                                ? 'bg-blue-500 text-white shadow-lg scale-105'
                                : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                            }`}
                    >
                        {index + 1}
                    </button>
                )
            )}

            <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="px-4 py-2
                            rounded-full
                            bg-white/10
                            backdrop-blur-sm
                            border border-white/20
                            text-white
                            hover:bg-white/20
                            disabled:opacity-40
                            disabled:cursor-not-allowed"
            >
                Next
            </button>

        </div>
    )
}

export default Pagination