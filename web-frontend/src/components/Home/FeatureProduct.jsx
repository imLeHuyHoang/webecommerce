import React, { useEffect } from "react";
import "./featureProduct.css";
import ProductCard from "../Products/ProductCard";

function FeatureProduct() {
  const [randomProducts, setRandomProducts] = React.useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((response) => response.json())
      .then((data) => {
        if (data && data.products) {
          const randomProducts = data.products.slice(0, 5); // Lấy 5 sản phẩm từ mảng products
          setRandomProducts(randomProducts);
        }
      });
  }, []);

  console.log(randomProducts);

  return (
    <section className="featured_product">
      <h2 className="section_title">Featured Products</h2>
      <div className="product_container">
        {randomProducts.map((product) => (
          <ProductCard
            key={product._id}
            id={product._id}
            stock={product.stock}
            rating={product.reviews?.rate || 0}
            ratingCount={product.reviews?.counts || 0}
            title={product.title}
            price={product.price}
            image={product.images?.[0]}
          />
        ))}
      </div>
    </section>
  );
}

export default FeatureProduct;
