// src/pages/PaymentResult.jsx

import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import CryptoJS from "crypto-js";

const PaymentResult = () => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const data = {
      appid: params.get("appid"),
      apptransid: params.get("apptransid"),
      pmcid: params.get("pmcid"),
      bankcode: params.get("bankcode"),
      amount: params.get("amount"),
      discountamount: params.get("discountamount"),
      status: params.get("status"),
      checksum: params.get("checksum"),
    };

    // Tạo chuỗi để kiểm tra checksum
    const checksumData =
      data.appid +
      "|" +
      data.apptransid +
      "|" +
      data.pmcid +
      "|" +
      data.bankcode +
      "|" +
      data.amount +
      "|" +
      data.discountamount +
      "|" +
      data.status;
    const checksum = CryptoJS.HmacSHA256(
      checksumData,
      "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf"
    ).toString();

    if (checksum !== data.checksum) {
      alert("Dữ liệu không hợp lệ!");
    } else {
      if (data.status === "1") {
        alert("Thanh toán thành công!");
      } else {
        alert("Thanh toán thất bại!");
      }
    }
  }, [location.search]);

  return (
    <div>
      <h1>Kết quả thanh toán</h1>
      {/* Hiển thị thông tin chi tiết nếu cần */}
    </div>
  );
};

export default PaymentResult;
