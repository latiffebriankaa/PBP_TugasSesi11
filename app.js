const express = require("express");
const db = require("./db");
const app = express();
const logging = require('./middleware/logging');
const validasiProduk = require("./middleware/validasiProduk");
const auth = require('./middleware/auth');
 
app.use(logging)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/produk", (req, res) => {
  db.query("SELECT * FROM produk", (err, result) => {
    if (err) {
      console.error("DB error (GET /produk):", err);
      return res.status(500).json({
        error: "Gagal mengambil data produk :(",
        detail: err.message,
      });
    }
    res.json(result);
  });
});

app.get("/produk", (req, res) => {
  const { min, max } = req.query;

  let sql = "SELECT * FROM produk";
  let params = [];

  if (min && max) {
    sql += " WHERE harga BETWEEN ? AND ?";
    params.push(Number(min), Number(max));
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("DB error (GET /produk):", err);
      return res.status(500).json({
        error: "Gagal mengambil data produk",
        detail: err.message,
      });
    }
    res.json(result);
  });
});

app.get("/produk/:id", (req, res) => {
  const id_produk = req.params.id;
  db.query(
    "SELECT * FROM produk WHERE id_produk=?",
    [id_produk],
    (err, result) => {
      if (err) {
        console.error("DB error (GET /produk/:id):", err);
        return res
          .status(500)
          .json({ error: "Server error", detail: err.message });
      }
      if (result.length === 0) {
        return res
          .status(404)
          .json({ error: "Produk tidak ditemukan :(", id: id_produk });
      }
      res.json(result[0]);
    }
  );
});

app.post("/produk", validasiProduk , (req, res) => {
  const { nama_produk, jml_stock, harga } = req.body;

  if (!nama_produk || jml_stock == null || harga == null) {
    return res.status(400).json({
      error: "Field nama_produk, jml_stock, dan harga wajib diisi",
    });
  }

  const hargaNum = Number(harga);
  if (isNaN(hargaNum)) {
    return res.status(400).json({
      error: "Harga harus angka)",
      received: harga,
    });
  }

  db.query(
    "INSERT INTO produk (nama_produk, jml_stock, harga) VALUES (?, ?, ?)",
    [nama_produk, jml_stock, hargaNum],
    (err, result) => {
      if (err) {
        console.error("DB error (POST /produk):", err);
        return res
          .status(500)
          .json({ error: "Gagal menyimpan produk", detail: err.message });
      }
      res.json({ message: "Produk ditambahkan!", id: result.insertId });
    }
  );
});

app.put("/produk/:id", (req, res) => {
  const { nama_produk, jml_stock, harga } = req.body;
  const id_produk = req.params.id;

  if (!nama_produk || jml_stock == null || harga == null) {
    return res.status(400).json({ error: "harus di isi ya" });
  }

  const hargaNum = Number(harga);
  if (isNaN(hargaNum)) {
    return res
      .status(400)
      .json({ error: "Harga harus angka ", received: harga });
  }

  db.query(
    "UPDATE produk SET nama_produk=?, jml_stock=?, harga=? WHERE id_produk=?",
    [nama_produk, jml_stock, hargaNum, id_produk],
    (err, result) => {
      if (err) {
        console.error("DB error (PUT /produk/:id):", err);
        return res
          .status(500)
          .json({ error: "Gagal update produk", detail: err.message });
      }
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ error: "Produk tidak ditemukan", id: id_produk });
      }
      res.json({ message: `Produk ID ${id_produk} berhasil diupdate` });
    }
  );
});

app.delete("/produk/:id", auth , (req, res) => {
  const id_produk = req.params.id;

  db.query(
    "DELETE FROM produk WHERE id_produk=?",
    [id_produk],
    (err, result) => {
      if (err) {
        console.error("DB error (DELETE /produk/:id):", err);
        return res
          .status(500)
          .json({ error: "Gagal menghapus produk", detail: err.message });
      }
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ error: "Produk tidak ditemukan", id: id_produk });
      }
      res.json({ message: `Produk ID ${id_produk} berhasil dihapus` });
    }
  );
});

app.use((req, res) => {
  res
    .status(404)
    .json({ error: "Route tidak ditemukan", path: req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error", detail: err.message });
});

app.listen(3000, () =>
  console.log("Server berjalan di port http://localhost:3000")
);
