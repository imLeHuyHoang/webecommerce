// components/Shared/AddressForm.jsx
import React from "react";

const AddressForm = ({ addressData, onChange, index, onDelete }) => {
  // index: nếu bạn muốn truyền index vào để xử lý xóa
  // onDelete: callback xóa address

  return (
    <div className="bg-light p-3 rounded shadow-sm mb-3">
      <h5>
        Địa chỉ {index + 1}
        {onDelete && (
          <button
            className="btn btn-sm btn-danger ml-2"
            onClick={() => onDelete(index)}
          >
            Xóa
          </button>
        )}
      </h5>
      <div className="form-group">
        <label>Tỉnh/Thành phố</label>
        <input
          type="text"
          name="province"
          value={addressData.province}
          className="form-control"
          onChange={(e) => onChange(index, e)}
        />
      </div>
      <div className="form-group">
        <label>Quận/Huyện</label>
        <input
          type="text"
          name="district"
          value={addressData.district}
          className="form-control"
          onChange={(e) => onChange(index, e)}
        />
      </div>
      <div className="form-group">
        <label>Phường/Xã</label>
        <input
          type="text"
          name="ward"
          value={addressData.ward}
          className="form-control"
          onChange={(e) => onChange(index, e)}
        />
      </div>
      <div className="form-group">
        <label>Số nhà, tên đường</label>
        <input
          type="text"
          name="street"
          value={addressData.street}
          className="form-control"
          onChange={(e) => onChange(index, e)}
        />
      </div>
    </div>
  );
};

export default AddressForm;
