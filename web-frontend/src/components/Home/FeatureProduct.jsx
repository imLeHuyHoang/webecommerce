import React, { useEffect, useState } from "react";
import "./featureProduct.css";
import ProductCard from "../Products/ProductCard";

function FeatureProduct() {
  const [randomProducts, setRandomProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/product");
        const data = await response.json();
        if (data && data.products) {
          const randomProducts = data.products.slice(0, 4); // Lấy 5 sản phẩm
          setRandomProducts(randomProducts);
        }
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <section className="featured-product my-5">
      <div className="container">
        <h2 className="section-title text-center mb-5">Featured Products</h2>
        <div className="product-container">
          {randomProducts.map((product) => (
            <div key={product._id}>
              <ProductCard
                id={product._id}
                stock={product.stock}
                rating={product.reviews?.rate || 0}
                ratingCount={product.reviews?.counts || 0}
                title={product.title}
                price={product.price}
                image={product.images?.[0]}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureProduct;
