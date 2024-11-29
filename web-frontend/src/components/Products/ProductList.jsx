// ProductList.jsx
import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import "./ProductList.css"; // Updated CSS file
import apiClient from "../../utils/api-client";

function ProductList({ filters }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/product", {
          params: filters,
        });
        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(products.length / productsPerPage);
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (error) {
    return <div className="text-danger">{error}</div>;
  }

  return (
    <section className="product-list">
      <div className="container products-list">
        {currentProducts.length > 0 ? (
          <>
            <div className="product-grid">
              {currentProducts.map((product) => (
                <div key={product._id} className="product-card">
                  <ProductCard
                    id={product._id}
                    title={product.name}
                    price={product.price}
                    stock={product.stock}
                    rating={product.reviews?.rate || 0}
                    ratingCount={product.reviews?.counts || 0}
                    image={product.images?.[0]}
                  />
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <nav>
                <ul className="pagination justify-content-center">
                  {[...Array(totalPages)].map((_, index) => (
                    <li
                      key={index}
                      className={`page-item ${
                        currentPage === index + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="current-page-info text-center">
                  Trang {currentPage} trên {totalPages}
                </div>
              </nav>
            )}
          </>
        ) : (
          <p>Không có sản phẩm nào.</p>
        )}
      </div>
    </section>
  );
}

export default ProductList;
