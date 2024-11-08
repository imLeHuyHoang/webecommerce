import React, { useEffect, useState } from "react";
import ProductCard from "../Products/ProductCard";
import "./FeatureProduct.css"; // Import CSS

function FeatureProduct() {
  const [randomProducts, setRandomProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/product");
        const data = await response.json();
        if (data && data.products) {
          const randomProducts = data.products.slice(0, 4);
          setRandomProducts(randomProducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <section className="featured-product">
      <div className="container">
        <h2 className="text-center mb-5">Featured Products</h2>
        <div className="row">
          {randomProducts.map((product) => (
            <div key={product._id} className="items_in_row col-md-3 mb-4 ">
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
