// ServicesSection.js
import React from "react";
import "./ServicesSection.css";

function ServicesSection() {
  return (
    <section className="services-section py-5 bg-light">
      <div className="container services">
        <h2 className="text-center text-services mb-5">
          Dịch Vụ Của Chúng Tôi
        </h2>
        <div className="row">
          <div className="col-md-4 text-center mb-4">
            <div className="service-card">
              <i className="fas fa-shipping-fast fa-3x mb-3"></i>
              <h4>Giao Hàng Nhanh</h4>
              <p>Sản phẩm sẽ được giao nhanh chóng đến tận nhà của bạn.</p>
            </div>
          </div>
          <div className="col-md-4 text-center mb-4">
            <div className="service-card">
              <i className="fas fa-headset fa-3x mb-3"></i>
              <h4>Hỗ Trợ 24/7</h4>
              <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi.</p>
            </div>
          </div>
          <div className="col-md-4 text-center mb-4">
            <div className="service-card">
              <i className="fas fa-sync-alt fa-3x mb-3"></i>
              <h4>Đổi Trả Dễ Dàng</h4>
              <p>Không hài lòng? Hãy đổi trả sản phẩm một cách dễ dàng.</p>
            </div>
          </div>
          <div className="col-md-4 text-center mb-4">
            <div className="service-card">
              <i className="fas fa-lock fa-3x mb-3"></i>
              <h4>Thanh Toán An Toàn</h4>
              <p>Mọi giao dịch đều được mã hóa và bảo mật tuyệt đối.</p>
            </div>
          </div>
          <div className="col-md-4 text-center mb-4">
            <div className="service-card">
              <i className="fas fa-gift fa-3x mb-3"></i>
              <h4>Ưu Đãi Đặc Biệt</h4>
              <p>Nhận ngay các ưu đãi và giảm giá đặc biệt cho sản phẩm.</p>
            </div>
          </div>
          <div className="col-md-4 text-center mb-4">
            <div className="service-card">
              <i className="fas fa-certificate fa-3x mb-3"></i>
              <h4>Chất Lượng Đảm Bảo</h4>
              <p>Sản phẩm luôn đạt chất lượng cao nhất.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
