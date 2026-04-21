ALTER TABLE don_hang MODIFY nguoi_dung_id int DEFAULT NULL;
ALTER TABLE don_hang MODIFY dia_chi_id int DEFAULT NULL;
ALTER TABLE don_hang ADD COLUMN email varchar(100) DEFAULT NULL AFTER dia_chi_id;
ALTER TABLE don_hang ADD COLUMN so_dien_thoai varchar(15) DEFAULT NULL AFTER email;
ALTER TABLE don_hang ADD COLUMN dia_chi text DEFAULT NULL AFTER so_dien_thoai;
ALTER TABLE don_hang ADD COLUMN ten_khach varchar(100) DEFAULT NULL AFTER dia_chi;
ALTER TABLE don_hang ADD COLUMN phuong_thuc_van_chuyen varchar(50) DEFAULT 'standard' AFTER ten_khach;
